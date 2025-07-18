export default function Block({ data, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer border rounded p-3 bg-gray-100 hover:bg-gray-200"
      title="Clique para editar"
    >
      <strong>{data.fieldName}</strong> <br />
      <small className="text-gray-600">{data.type}</small>
      {data.type === 'dropdown' && (
        <p className="text-xs text-gray-500 mt-1">
          Opções: {data.options.join(', ')}
        </p>
      )}
      <p className="text-xs text-gray-400 mt-1">Planilha: {data.sheetName}</p>
    </div>
  );
}
