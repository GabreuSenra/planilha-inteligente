# Editor de Planilhas Inteligentes

Uma aplicação React interativa para criar planilhas do Google Sheets de forma visual e eficiente. Com blocos pré-configurados e uma interface drag-and-drop, o sistema permite estruturar abas, colunas e validações com facilidade, e ao final, gerar o código Apps Script para ser usado diretamente no Google Sheets.

## Funcionalidades

- Criação visual de planilhas com múltiplas abas
- Templates de campos (Texto, Número, Data, Dropdown, etc...)
- Sistema de arrastar e soltar com suporte a reordenação
- Configuração individual de blocos com validações inteligentes
- Geração automática de código para uso no Google Apps Script
- Interface moderna e intuitiva


## Interface

- `**Sidebar:**` contém templates de blocos prontos para arrastar
- **Canvas:** área onde você adiciona planilhas e define campos
- **Modal de Configuração:** edita propriedades como tipo, opções, formatação, fórmula, etc.


## 📦 Tecnologias

- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) (Drag and Drop)
- Google Apps Script (como destino do código gerado)


## Como usar

1. **Clone o repositório**
`git clone https://github.com/GabreuSenra/planilha-inteligente.git`
`cd planilha-inteligente`
2. **Instale as dependências**
`npm install`
3. **Inicie o servidor localmente**
`npm run dev`

## Como usar o código gerado
-Acesse https://script.google.com
-Crie um novo projeto Apps Script
-Copie e cole o código gerado no editor
-Execute a função setupSheets
-Sua planilha será criada automaticamente no Google Sheets com as estruturas definidas
