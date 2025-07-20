import { useState } from 'react';
import BlockConfigModal from './BlockConfigModal';
import BlockCanvas from './BlockCanvas';
import BlockTemplates from './BlockTemplates';
import { DragDropContext } from "@hello-pangea/dnd";
import SheetsCanvas from './SheetCanvas';
import templates from "@/utils/blockTemplates";



export default function CanvasEditor() {
  const [blocks, setBlocks] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [rowCount, setRowCount] = useState(1000); // Valor padrão: 1000 linhas

  const handleAddBlock = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleEditBlock = (index) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleDeleteBlock = (index) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleEditField = (sheetIdx, fieldIdx) => {
    // Abra o modal para editar o campo específico
    setEditingIndex({ sheetIdx, fieldIdx });
    setModalOpen(true);
  };

  const handleDeleteField = (sheetIdx, fieldIdx) => {
    const newSheets = [...sheets];
    newSheets[sheetIdx].fields = newSheets[sheetIdx].fields.filter((_, i) => i !== fieldIdx);
    setSheets(newSheets);
  };

  const handleEditSheetName = (sheetIdx, newName) => {
    const newSheets = [...sheets];
    newSheets[sheetIdx].sheetName = newName;
    setSheets(newSheets);
  };

  const handleDeleteSheet = (sheetIdx) => {
    setSheets(sheets.filter((_, i) => i !== sheetIdx));
  };

  const handleSaveBlock = (data) => {
    if (editingIndex && typeof editingIndex === "object") {
      // Editando campo de uma planilha
      const { sheetIdx, fieldIdx } = editingIndex;
      const newSheets = [...sheets];
      newSheets[sheetIdx].fields[fieldIdx] = data;
      setSheets(newSheets);
    } else if (editingIndex !== null) {
      // Editando bloco antigo (se ainda usar blocks)
      const updated = [...blocks];
      updated[editingIndex] = data;
      setBlocks(updated);
    } else {
      // Adicionando novo bloco (se ainda usar blocks)
      setBlocks([...blocks, data]);
    }
    setModalOpen(false);
    setEditingIndex(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // Arrastar campo para uma planilha
    if (result.source.droppableId === "templates" && result.destination.droppableId.startsWith("sheet-")) {
      const sheetIdx = parseInt(result.destination.droppableId.replace("sheet-", ""));
      const tpl = templates[result.source.index];
      const newSheets = [...sheets];
      newSheets[sheetIdx].fields.push({ ...tpl });
      setSheets(newSheets);
      return;
    }

    // Reordenar campos dentro da mesma planilha
    if (
      result.source.droppableId.startsWith("sheet-") &&
      result.destination.droppableId.startsWith("sheet-") &&
      result.source.droppableId === result.destination.droppableId
    ) {
      const sheetIdx = parseInt(result.source.droppableId.replace("sheet-", ""));
      const reorderedFields = Array.from(sheets[sheetIdx].fields);
      const [removed] = reorderedFields.splice(result.source.index, 1);
      reorderedFields.splice(result.destination.index, 0, removed);
      const newSheets = [...sheets];
      newSheets[sheetIdx].fields = reorderedFields;
      setSheets(newSheets);
      return;
    }
  };



  function getUniqueSheetName(baseName, sheets) {
    let name = baseName;
    let idx = 1;
    const existingNames = sheets.map(s => s.sheetName);
    while (existingNames.includes(name)) {
      name = `${baseName} (${idx})`;
      idx++;
    }
    return name;
  }



  const generateGoogleSheetsScript = () => {
    const codeLines = [
      `function setupSheets() {`,
      `  const ss = SpreadsheetApp.getActiveSpreadsheet();`,
      `  const rowCount = ${rowCount};  // Número de linhas personalizado`
    ];

    sheets.forEach((sheet, index) => {
      const sheetVar = `sheet${index + 1}`;

      codeLines.push(`  let ${sheetVar} = ss.getSheetByName("${sheet.sheetName}");`);
      codeLines.push(`  if (!${sheetVar}) ${sheetVar} = ss.insertSheet("${sheet.sheetName}");`);
      codeLines.push(`  ${sheetVar}.clear();`);

      const headers = sheet.fields.map(f => `"${f.fieldName}"`).join(', ');
      codeLines.push(`  ${sheetVar}.appendRow([${headers}]);`);

      sheet.fields.forEach((field, fieldIndex) => {
        const rangeVar = `range${index + 1}_${fieldIndex}`;
        codeLines.push(`  let ${rangeVar} = ${sheetVar}.getRange(2, ${fieldIndex + 1}, rowCount);`);
        codeLines.push(`  ${rangeVar}.setDataValidation(null);`);

        if (field.type === 'dropdown' && field.options.length > 0) {
          const options = field.options.map(o => `"${o}"`).join(', ');
          codeLines.push(`  let rule${index + 1}_${fieldIndex} = SpreadsheetApp.newDataValidation()
  .requireValueInList([${options}], true)
  .build();
  ${rangeVar}.setDataValidation(rule${index + 1}_${fieldIndex});`);
        } else if (field.type === 'number') {
          const isFloat = field.numberFormat === 'float';
          const decimals = isFloat ? (parseInt(field.decimalPlaces) || 2) : 0;
          const format = isFloat ? `0.${'0'.repeat(decimals)}` : '0';
          codeLines.push(`  let rule${index + 1}_${fieldIndex} = SpreadsheetApp.newDataValidation()
  .requireNumberBetween(-1e100, 1e100)
  .build();
  ${rangeVar}.setDataValidation(rule${index + 1}_${fieldIndex});
  ${rangeVar}.setNumberFormat("${format}");`);
        } else if (field.type === 'date') {
          codeLines.push(`  let rule${index + 1}_${fieldIndex} = SpreadsheetApp.newDataValidation()
  .requireDate()
  .build();
  ${rangeVar}.setDataValidation(rule${index + 1}_${fieldIndex});
  ${rangeVar}.setNumberFormat("dd/mm/yyyy");`);
        } else if (field.type === 'money') {
          codeLines.push(`  ${rangeVar}.setNumberFormat("R$ #,##0.00");`);
        } else if (field.type === 'percentage') {
          codeLines.push(`  ${rangeVar}.setNumberFormat("0.00%");`);
        } else if (field.type === 'time') {
          codeLines.push(`  ${rangeVar}.setNumberFormat("hh:mm:ss");`);
        } else if (field.type === 'checkbox') {
          codeLines.push(`  ${rangeVar}.insertCheckboxes();`);
        } else if (field.type === 'autoId') {
          codeLines.push(`  for (let i = 0; i < rowCount; i++) {
    ${sheetVar}.getRange(i + 2, ${fieldIndex + 1}).setValue(i + 1);
  }`);
        } else if (field.type === 'formula') {
          codeLines.push(`  for (let i = 0; i < rowCount; i++) {`);

          // Processa todos os padrões ${row±n}
          let dynamicFormula = field.formula.replace(/\$\{row([+-]\d+)?\}/g, (match, offset) => {
            if (!offset) return '${i + 2}'; // ${row}
            return '${i + 2' + offset + '}'; // ${row+n} ou ${row-n}
          });

          // Garante que fórmulas começam com =
          if (!dynamicFormula.startsWith('=')) {
            dynamicFormula = '=' + dynamicFormula;
          }

          codeLines.push(`    ${sheetVar}.getRange(i + 2, ${fieldIndex + 1}).setFormula(\`${dynamicFormula}\`);`);
          codeLines.push(`  }`);
        }
      });
    });

    codeLines.push(`}`);
    setGeneratedCode(codeLines.join('\n'));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Editor de Planilhas Inteligentes</h2>
        <div className="flex gap-6 mb-4">
          <BlockTemplates />
          <div className="flex flex-col flex-1">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  const name = getUniqueSheetName("Nova Planilha", sheets);
                  setSheets([...sheets, { sheetName: name, fields: [] }]);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Adicionar Planilha
              </button>

              {/* Controle do Número de Linhas - NOVO! */}
              <div className="flex items-center gap-2 bg-white border rounded px-3 py-2">
                <label className="text-sm font-medium">Linhas:</label>
                <input
                  type="number"
                  min="1"
                  value={rowCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setRowCount(value >= 1 ? value : 1);
                  }}
                  className="w-20 border-b border-gray-300 px-1 text-center"
                />
                <button
                  onClick={() => setRowCount(1000)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Padrão
                </button>
              </div>

              <button
                onClick={generateGoogleSheetsScript}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Gerar Código
              </button>
            </div>

            <SheetsCanvas
              sheets={sheets}
              onEditField={handleEditField}
              onDeleteField={handleDeleteField}
              onEditSheetName={handleEditSheetName}
              onDeleteSheet={handleDeleteSheet}
            />

            {generatedCode && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Código Gerado:</h3>
                <textarea
                  className="w-full p-2 border rounded bg-gray-100 text-sm font-mono"
                  rows={generatedCode.split('\n').length + 2}
                  readOnly
                  value={generatedCode}
                />
              </div>
            )}
          </div>
        </div>

        <BlockConfigModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveBlock}
          initialData={editingIndex !== null ? editingIndex : null}
          sheets={sheets}
        />
      </div>
    </DragDropContext>
  );
}