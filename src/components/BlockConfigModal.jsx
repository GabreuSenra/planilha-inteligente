import { useState, useEffect } from "react";

export default function BlockConfigModal({ open, onClose, onSave, initialData, sheets }) {
  const [fieldName, setFieldName] = useState("");
  const [type, setType] = useState("text");
  const [options, setOptions] = useState("");
  const [sheetName, setSheetName] = useState("Cadastro");

  useEffect(() => {
    if (initialData) {
      const { sheetIdx, fieldIdx } = initialData;
      const field = sheets[sheetIdx]?.fields[fieldIdx];

      if (field) {
        setFieldName(field.fieldName || "");
        setType(field.type || "text");
        setOptions((field.options || []).join(", "));
        setSheetName(sheets[sheetIdx]?.sheetName || "Cadastro");
      }
    } else {
      setFieldName("");
      setType("text");
      setOptions("");
      setSheetName("Cadastro");
    }
  }, [initialData, open, sheets]);

  if (!open) return null;

  const handleSave = () => {
    onSave({
      fieldName,
      type,
      options: options
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
      sheetName,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
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
        </select>

        {type === "dropdown" && (
          <>
            <label className="block mb-2 font-semibold">
              Opções (separadas por vírgula)
            </label>
            <textarea
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 resize-none"
            />
          </>
        )}

        <label className="block mb-2 font-semibold">Nome da Planilha (aba)</label>
        <input
          type="text"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
        />

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
