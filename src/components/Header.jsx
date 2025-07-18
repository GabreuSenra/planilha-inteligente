export default function Header() {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center border-b">
      <h1 className="text-2xl font-bold">Gerador de Planilhas</h1>
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        onClick={() => alert("Função de geração virá em breve!")}
      >
        Gerar Código
      </button>
    </header>
  );
}