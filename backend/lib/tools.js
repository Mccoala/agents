import { getFile, listFiles, createBranch, commitFile, createPR } from './github.js'

// Tools that agents can call via Claude's tool_use API
export const AGENT_TOOLS = [
  {
    name: 'read_file',
    description: 'Lê o conteúdo de um arquivo do repositório app-ags no GitHub.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Caminho do arquivo, ex: src/App.jsx' },
      },
      required: ['path'],
    },
  },
  {
    name: 'list_files',
    description: 'Lista arquivos e pastas de um diretório do repositório app-ags.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Pasta a listar, ex: src ou netlify/functions' },
      },
      required: ['path'],
    },
  },
  {
    name: 'search_in_file',
    description: 'Busca por um termo dentro de um arquivo do repositório.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Arquivo onde buscar' },
        term: { type: 'string', description: 'Termo ou padrão a buscar' },
      },
      required: ['path', 'term'],
    },
  },
  {
    name: 'create_fix',
    description: 'Cria uma branch, aplica uma correção num arquivo e abre um Pull Request no GitHub.',
    input_schema: {
      type: 'object',
      properties: {
        branch_name:   { type: 'string', description: 'Nome da branch, ex: fix/security-passwords' },
        file_path:     { type: 'string', description: 'Caminho do arquivo a corrigir' },
        new_content:   { type: 'string', description: 'Conteúdo completo corrigido do arquivo' },
        commit_message:{ type: 'string', description: 'Mensagem do commit' },
        pr_title:      { type: 'string', description: 'Título do Pull Request' },
        pr_body:       { type: 'string', description: 'Descrição do que foi corrigido' },
      },
      required: ['branch_name', 'file_path', 'new_content', 'commit_message', 'pr_title', 'pr_body'],
    },
  },
]

// Execute a tool call and return the result
export async function executeTool(toolName, toolInput) {
  try {
    switch (toolName) {
      case 'read_file': {
        const { content } = await getFile(toolInput.path)
        // Truncate large files
        const truncated = content.length > 6000
          ? content.substring(0, 6000) + '\n\n[... arquivo truncado — muito longo ...]'
          : content
        return { success: true, path: toolInput.path, content: truncated, lines: content.split('\n').length }
      }

      case 'list_files': {
        const files = await listFiles(toolInput.path)
        return { success: true, path: toolInput.path, files }
      }

      case 'search_in_file': {
        const { content } = await getFile(toolInput.path)
        const lines = content.split('\n')
        const term = toolInput.term.toLowerCase()
        const matches = lines
          .map((line, i) => ({ line: i + 1, text: line }))
          .filter(({ text }) => text.toLowerCase().includes(term))
          .slice(0, 20)
        return { success: true, path: toolInput.path, term: toolInput.term, matches, total: matches.length }
      }

      case 'create_fix': {
        await createBranch(toolInput.branch_name)
        await commitFile(toolInput.file_path, toolInput.new_content, toolInput.commit_message, toolInput.branch_name)
        const prUrl = await createPR(toolInput.pr_title, toolInput.pr_body, toolInput.branch_name)
        return { success: true, pr_url: prUrl, message: `PR criado: ${prUrl}` }
      }

      default:
        return { success: false, error: `Ferramenta desconhecida: ${toolName}` }
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
