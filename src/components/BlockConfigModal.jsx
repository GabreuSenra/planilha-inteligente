import { useState, useEffect } from "react";

const isValidFormula = (formula) => {
  if (!formula) return true;
  
  // Verifica offsets inválidos (negativos ou zero)
  const invalidOffsets = formula.match(/\$\{row([+-]0|\-\d+)\}/g);
  if (invalidOffsets) {
    const examples = invalidOffsets.map(o => 
      o.replace('row-', 'row+')
    ).join(', ');
    
    alert(`Erro na fórmula:
• Offsets inválidos: ${invalidOffsets.join(', ')}
• Use apenas ${row+n} (n ≥ 1)
• Exemplos válidos: ${examples || '${row+1}'}`);
    return false;
  }
  
  // Verifica parênteses balanceados
  const open = (formula.match(/\(/g) || []).length;
  const close = (formula.match(/\)/g) || []).length;
  if (open !== close) {
    alert("Erro: Parênteses não balanceados!");
    return false;
  }
  
  return true;
};

export default function BlockConfigModal({ open, onClose, onSave, initialData, sheets }) {
  const [fieldName, setFieldName] = useState("");
  const [type, setType] = useState("text");
  const [options, setOptions] = useState("");
  const [sheetName, setSheetName] = useState("Cadastro");
  const [numberFormat, setNumberFormat] = useState("float");
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [formula, setFormula] = useState("");
  const [formulaError, setFormulaError] = useState("");

  useEffect(() => {
    if (initialData) {
      const { sheetIdx, fieldIdx } = initialData;
      const field = sheets[sheetIdx]?.fields[fieldIdx];

      if (field) {
        setFieldName(field.fieldName || "");
        setType(field.type || "text");
        setOptions((field.options || []).join(", "));
        setSheetName(sheets[sheetIdx]?.sheetName || "Cadastro");
        setNumberFormat(field.numberFormat || "float");
        setDecimalPlaces(field.decimalPlaces ?? 2);
        setFormula(field.formula || "");
      }
    } else {
      setFieldName("");
      setType("text");
      setOptions("");
      setSheetName("Cadastro");
      setNumberFormat("float");
      setDecimalPlaces(2);
      setFormula("");
      setFormulaError("");
    }
  }, [initialData, open, sheets]);

  const previewFormula = (rowNum) => {
    if (!formula) return "= ";
    return formula.replace(/\$\{row([+-]\d+)?\}/g, (match, offset) => {
      const offsetValue = offset ? eval(`1${offset}`) : 0;
      return (rowNum + offsetValue).toString();
    });
  };

  const handleFormulaChange = (e) => {
    const value = e.target.value;
    
    // Auto-correção simples durante digitação
    if (value.includes("${row-")) {
      setFormula(value.replace("${row-", "${row+"));
      return;
    }
    
    setFormula(value);
    setFormulaError("");
  };

  const handleSave = () => {
    // Validação básica do nome
    if (!fieldName.trim()) {
      alert("Por favor, insira um nome para o campo");
      return;
    }

    // Validação especial para fórmulas
    if (type === "formula") {
      if (!formula.trim()) {
        setFormulaError("Fórmula não pode estar vazia!");
        return;
      }
      
      if (!isValidFormula(formula)) return;
      
      if (!formula.includes("${row")) {
        if (!confirm("Sua fórmula não usa ${row}. Isso criará o mesmo valor em todas as linhas. Continuar?")) {
          return;
        }
      }
    }

    onSave({
      fieldName: fieldName.trim(),
      type,
      options: options.split(",").map(o => o.trim()).filter(Boolean),
      sheetName,
      numberFormat,
      decimalPlaces,
      formula
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Configurar Bloco</h2>

        <label className="block mb-2 font-semibold">Nome do Campo</label>
        <input
          type="text"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />

        <label className="block mb-2 font-semibold">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        >
          <option value="text">Texto</option>
          <option value="number">Número</option>
          <option value="dropdown">Dropdown</option>
          <option value="date">Data</option>
          <option value="money">Dinheiro</option>
          <option value="percentage">Porcentagem</option>
          <option value="time">Hora</option>
          <option value="checkbox">Checkbox</option>
          <option value="autoId">Identificador</option>
          <option value="formula">Fórmula</option>
        </select>

        {type === "dropdown" && (
          <>
            <label className="block mb-2 font-semibold">Opções (separadas por vírgula)</label>
            <textarea
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 resize-none"
            />
          </>
        )}

        {type === "number" && (
          <>
            <label className="block mb-2 font-semibold">Formato do Número</label>
            <select
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            >
              <option value="float">Decimal (float)</option>
              <option value="int">Inteiro</option>
            </select>
            {numberFormat === "float" && (
              <>
                <label className="block mb-2 font-semibold">Casas decimais</label>
                <input
                  type="number"
                  min={0}
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                />
              </>
            )}
          </>
        )}

        {type === "formula" && (
          <>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Fórmula Avançada</label>
              <input
                type="text"
                value={formula}
                onChange={handleFormulaChange}
                placeholder='Ex: =(A${row} + B${row+1}) / C${row+2}'
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2 font-mono"
              />
              
              {formulaError && (
                <div className="text-red-500 text-sm mb-2">{formulaError}</div>
              )}

              <div className="text-sm text-gray-600 mb-4">
                <p className="font-semibold">Sintaxe avançada:</p>
                <ul className="list-disc pl-5">
                  <li><code>A$&#123;row&#125;</code> - Linha atual (A2, A3...)</li>
                  <li><code>A$&#123;row+1&#125;</code> - Próxima linha (A3, A4...)</li>
                  <li><code>A$&#123;row+n&#125;</code> - Linha atual + offset (n ≥ 1)</li>
                  <li><code>A1</code> - Linha fixa</li>
                </ul>
              </div>
              
              <div className="p-3 bg-gray-100 rounded mb-4">
                <p className="font-semibold">Pré-visualização:</p>
                <div className="font-mono">
                  <p>Linha 1: {previewFormula(1)}</p>
                  <p>Linha 2: {previewFormula(2)}</p>
                  <p>Linha 3: {previewFormula(3)}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}