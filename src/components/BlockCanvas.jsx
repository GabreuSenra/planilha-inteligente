import { Droppable, Draggable } from "@hello-pangea/dnd";
import React from "react";

export default function BlockCanvas({ blocks, onEdit, onDelete }) {
  return (
    <Droppable droppableId="canvas" direction="horizontal">
      {(provided) => (
        <div
          className="canvas-bg bg-white rounded-lg p-6 w-full min-h-[300px] flex flex-wrap gap-4 border-2 border-dotted border-gray-400"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {blocks.map((block, idx) => (
            <Draggable key={idx} draggableId={String(idx)} index={idx}>
              {(provided) => (
                <div
                  className="bg-white shadow-md rounded-lg p-4 min-w-[180px] max-w-[220px] flex flex-col items-start relative"
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <span className="font-bold text-blue-700 mb-2">{block.fieldName}</span>
                  <span className="text-xs text-gray-500 mb-1">Tipo: {block.type}</span>
                  {block.type === "dropdown" && (
                    <span className="text-xs text-gray-400 mb-1">
                      Opções: {block.options.join(", ")}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 mb-2">
                    Aba: {block.sheetName}
                  </span>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => onEdit(idx)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(idx)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}