export default function Sidebar({ blocks, onAddBlock, onDragStart }) {
  return (
    <div className="w-64 bg-gray-50 border-r p-4">
      <h2 className="font-bold mb-4">Blocos Configurados</h2>
      <ul>
        {blocks.map((block, idx) => (
          <li
            key={idx}
            className="mb-2 p-2 bg-white border rounded shadow cursor-move"
            draggable
            onDragStart={(e) => onDragStart(e, block)}
          >
            {block.fieldName} ({block.type})
          </li>
        ))}
      </ul>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={onAddBlock}
      >
        Novo Bloco
      </button>
    </div>
  );
}