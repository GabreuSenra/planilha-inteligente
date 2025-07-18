import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";

export default function PlanilhaCard({
  sheet,
  sheetIdx,
  onEditField,
  onDeleteField,
  onEditSheetName,
  onDeleteSheet,
}) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(sheet.sheetName);

  const handleNameBlur = () => {
    setEditingName(false);
    if (tempName !== sheet.sheetName && tempName.trim()) {
      onEditSheetName(sheetIdx, tempName.trim());
    } else {
      setTempName(sheet.sheetName);
    }
  };

  return (
    <div className="bg-gray-50 border border-dotted border-blue-400 rounded-lg p-4 min-w-[320px] max-w-[400px] flex flex-col relative">
      <div className="flex items-center mb-2">
        {editingName ? (
          <input
            className="font-bold text-lg text-blue-700 bg-transparent border-b border-blue-300 focus:outline-none"
            value={tempName}
            autoFocus
            onChange={e => setTempName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={e => {
              if (e.key === "Enter") handleNameBlur();
              if (e.key === "Escape") {
                setEditingName(false);
                setTempName(sheet.sheetName);
              }
            }}
          />
        ) : (
          <span
            className="font-bold text-lg text-blue-700 cursor-pointer"
            title="Clique para editar"
            onClick={() => setEditingName(true)}
          >
            {sheet.sheetName}
          </span>
        )}
        <button
          onClick={() => onDeleteSheet(sheetIdx)}
          className="ml-2 text-red-600 text-xs px-2 py-1 rounded hover:bg-red-100"
          title="Excluir planilha"
        >
          Excluir
        </button>
      </div>
      <Droppable droppableId={`sheet-${sheetIdx}`} direction="vertical">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-3">
            {sheet.fields.map((field, idx) => (
              <Draggable key={idx} draggableId={`field-${sheetIdx}-${idx}`} index={idx}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white shadow rounded p-3 flex flex-col"
                  >
                    <span className="font-bold text-blue-700">{field.fieldName}</span>
                    <span className="text-xs text-gray-500">Tipo: {field.type}</span>
                    {field.type === "dropdown" && (
                      <span className="text-xs text-gray-400">
                        Opções: {field.options.join(", ")}
                      </span>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => onEditField(sheetIdx, idx)} className="text-blue-600 text-xs">Editar</button>
                      <button onClick={() => onDeleteField(sheetIdx, idx)} className="text-red-600 text-xs">Excluir</button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}