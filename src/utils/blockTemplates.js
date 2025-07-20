const templates = [
  { type: "text", fieldName: "Texto", sheetName: "Cadastro" },
  { type: "number", fieldName: "Número", sheetName: "Cadastro", numberFormat: "float", decimalPlaces: 2 },
  { type: "dropdown", fieldName: "Dropdown", options: ["Opção 1", "Opção 2"], sheetName: "Cadastro" },
  { type: "date", fieldName: "Data", sheetName: "Cadastro" },
  { type: "money", fieldName: "Dinheiro", sheetName: "Cadastro" },
  { type: "percentage", fieldName: "Porcentagem", sheetName: "Cadastro" },
  { type: "time", fieldName: "Hora", sheetName: "Cadastro" },
  { type: "checkbox", fieldName: "Confirmado?", options: [], sheetName: "Cadastro" },
  { type: "autoId", fieldName: "ID", options: [], sheetName: "Cadastro" },
  { type: "formula", fieldName: "Cálculo", formula: "=A2+B2", options: [], sheetName: "Cadastro" },
];

export default templates;