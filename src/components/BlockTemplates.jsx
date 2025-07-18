import { Draggable, Droppable } from "@hello-pangea/dnd";

const templates = [
  { type: "text", fieldName: "Texto", options: [], sheetName: "Cadastro" },
  { type: "number", fieldName: "Número", options: [], sheetName: "Cadastro" },
  { type: "dropdown", fieldName: "Dropdown", options: ["Opção 1", "Opção 2"], sheetName: "Cadastro" },
  { type: "date", fieldName: "Data", options: [], sheetName: "Cadastro" },
];

export default function BlockTemplates() {
  return (
    <Droppable droppableId="templates" isDropDisabled={true}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg min-w-[180px]"
        >
          <h3 className="font-semibold mb-2 text-center">Templates</h3>
          {templates.map((tpl, idx) => (
            <Draggable key={tpl.type} draggableId={`tpl-${tpl.type}`} index={idx}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="bg-white border rounded-lg p-3 shadow flex flex-col items-center cursor-grab"
                >
                  <span className="font-bold text-blue-700">{tpl.fieldName}</span>
                  <span className="text-xs text-gray-500">Tipo: {tpl.type}</span>
                  {tpl.type === "dropdown" && (
                    <span className="text-xs text-gray-400">
                      Opções: {tpl.options.join(", ")}
                    </span>
                  )}
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