import { useState } from 'react';
import BlockConfigModal from './BlockConfigModal';
import BlockCanvas from './BlockCanvas';
import BlockTemplates from './BlockTemplates';
import { DragDropContext } from "@hello-pangea/dnd";

const templates = [
  { type: "text", fieldName: "Texto", options: [], sheetName: "Cadastro" },
  { type: "number", fieldName: "Número", options: [], sheetName: "Cadastro" },
  { type: "dropdown", fieldName: "Dropdown", options: ["Opção 1", "Opção 2"], sheetName: "Cadastro" },
  { type: "date", fieldName: "Data", options: [], sheetName: "Cadastro" },
];

export default function CanvasEditor() {
  const [blocks, setBlocks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');

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

  const handleSaveBlock = (data) => {
    if (editingIndex !== null) {
      const updated = [...blocks];
      updated[editingIndex] = data;
      setBlocks(updated);
    } else {
      setBlocks([...blocks, data]);
    }
    setModalOpen(false);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // Arrastar do painel de templates para o canvas
    if (result.source.droppableId === "templates" && result.destination.droppableId === "canvas") {
      const tpl = templates[result.source.index];
      setBlocks([...blocks, { ...tpl }]);
      return;
    }

    // Reordenar dentro do canvas
    if (result.source.droppableId === "canvas" && result.destination.droppableId === "canvas") {
      const reordered = Array.from(blocks);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);
      setBlocks(reordered);
      return;
    }
  };

  const generateGoogleSheetsScript = () => {
    const groupedBySheet = {};
    blocks.forEach(block => {
      if (!groupedBySheet[block.sheetName]) groupedBySheet[block.sheetName] = [];
      groupedBySheet[block.sheetName].push(block);
    });

    const codeLines = [
      `function setupSheets() {`,
      `  const ss = SpreadsheetApp.getActiveSpreadsheet();`
    ];

    Object.entries(groupedBySheet).forEach(([sheetName, fields]) => {
      codeLines.push(`  let sheet = ss.getSheetByName("${sheetName}");`);
      codeLines.push(`  if (!sheet) sheet = ss.insertSheet("${sheetName}");`);
      codeLines.push(`  sheet.clear();`);

      const headers = fields.map(f => `"${f.fieldName}"`).join(', ');
      codeLines.push(`  sheet.appendRow([${headers}]);`);

      fields.forEach((field, index) => {
        const rangeVar = `range${index}`;
        codeLines.push(`  let ${rangeVar} = sheet.getRange(2, ${index + 1}, 1000);`);
        codeLines.push(`  ${rangeVar}.setDataValidation(null);`);

        if (field.type === 'dropdown' && field.options.length > 0) {
          const options = field.options.map(o => `"${o}"`).join(', ');
          codeLines.push(`  let rule${index} = SpreadsheetApp.newDataValidation()
    .requireValueInList([${options}], true)
    .build();
  ${rangeVar}.setDataValidation(rule${index});`);
        } else if (field.type === 'number') {
          codeLines.push(`  let rule${index} = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(-1e100, 1e100)
    .setAllowInvalid(false) 
    .setHelpText('Digite apenas números.') 
    .build();
  ${rangeVar}.setDataValidation(rule${index});
  ${rangeVar}.setNumberFormat("0.00");`);
        }
        else if (field.type === 'date') {
          codeLines.push(`  let rule${index} = SpreadsheetApp.newDataValidation()
    .requireDate()
    .build();
  ${rangeVar}.setDataValidation(rule${index});
  ${rangeVar}.setNumberFormat("dd/mm/yyyy");`);
        }
        // Para texto, só limpa a validação (feito acima)
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
              <button onClick={handleAddBlock} className="px-4 py-2 bg-blue-600 text-white rounded">
                Adicionar Bloco
              </button>
              <button onClick={generateGoogleSheetsScript} className="px-4 py-2 bg-green-600 text-white rounded">
                Gerar Código
              </button>
            </div>
            <BlockCanvas
              blocks={blocks}
              onEdit={handleEditBlock}
              onDelete={handleDeleteBlock}
              onDragEnd={handleDragEnd}
            />
            {generatedCode && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Código Gerado:</h3>
                <textarea
                  className="w-full p-2 border rounded bg-gray-100 text-sm"
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
          initialData={editingIndex !== null ? blocks[editingIndex] : null}
        />
      </div>
    </DragDropContext>
  );
}