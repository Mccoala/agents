import Anthropic from '@anthropic-ai/sdk'
import { supabase, createConversation, saveMessage } from '../lib/supabase.js'
import { getFile, listFiles } from '../lib/github.js'
import { AGENT_PROMPTS } from '../agents/prompts.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Agent definitions with their focus areas for autonomous analysis
const AGENTS = [
  { id: 1,  name: 'Alex',   fn: 'Frontend / UI' },
  { id: 2,  name: 'Bruno',  fn: 'Backend' },
  { id: 3,  name: 'Carla',  fn: 'QA / Bug Hunter' },
  { id: 4,  name: 'Diego',  fn: 'Security' },
  { id: 5,  name: 'Elena',  fn: 'Auth & Onboarding' },
  { id: 6,  name: 'Felipe', fn: 'Billing' },
  { id: 7,  name: 'Gabi',   fn: 'AI / PDF Pipeline' },
  { id: 8,  name: 'Hugo',   fn: 'Analytics / Dashboard' },
  { id: 9,  name: 'Iris',   fn: 'Rotas / Mapa' },
  { id: 10, name: 'João',   fn: 'DevOps' },
  { id: 11, name: 'Kira',   fn: 'Revisor' },
  { id: 12, name: 'Leo',    fn: 'Monitor / Analista' },
]

// Which files each agent focuses on
const AGENT_FILES = {
  'Frontend / UI':          ['src/App.jsx'],
  'Backend':                ['netlify/functions/anthropic.js', 'src/lib/supabase.js'],
  'QA / Bug Hunter':        ['src/App.jsx'],
  'Security':               ['src/App.jsx', 'netlify/functions/anthropic.js'],
  'Auth & Onboarding':      ['src/App.jsx'],
  'Billing':                ['src/App.jsx'],
  'AI / PDF Pipeline':      ['netlify/functions/anthropic.js', 'src/App.jsx'],
  'Analytics / Dashboard':  ['src/App.jsx'],
  'Rotas / Mapa':           ['src/App.jsx', 'package.json'],
  'DevOps':                 ['netlify.toml', 'package.json'],
  'Revisor':                ['src/App.jsx'],
  'Monitor / Analista':     ['src/App.jsx'],
}

let loopInterval = null
let isRunning = false

// Emit agent state changes to connected clients via SSE
let sseClients = []
export function addSseClient(res) { sseClients.push(res) }
export function removeSseClient(res) { sseClients = sseClients.filter(c => c !== res) }

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  sseClients.forEach(c => { try { c.write(msg) } catch {} })
}

async function getFileContent(path) {
  try {
    const { content } = await getFile(path)
    // Truncate large files to save tokens
    return content.length > 4000 ? content.substring(0, 4000) + '\n... (truncado)' : content
  } catch {
    return null
  }
}

async function agentAnalyze(agent) {
  const files = AGENT_FILES[agent.fn] || ['src/App.jsx']
  const fileContents = {}

  for (const f of files) {
    const content = await getFileContent(f)
    if (content) fileContents[f] = content
  }

  if (Object.keys(fileContents).length === 0) return null

  const filesText = Object.entries(fileContents)
    .map(([f, c]) => `## ${f}\n\`\`\`\n${c}\n\`\`\``)
    .join('\n\n')

  const prompt = `Analise brevemente estes arquivos do app-ags e identifique:
1. O problema mais crítico que você vê
2. Uma ação concreta que você pode tomar

Seja direto e conciso (máximo 3 parágrafos). Se não encontrar problemas críticos, mencione o que está bem.

${filesText}`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001', // usar Haiku para análises autônomas (mais barato)
    max_tokens: 400,
    system: AGENT_PROMPTS[agent.fn],
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].text
}

async function agentDiscuss(agentA, agentB, topicFromA) {
  // Agent B responds to what Agent A found
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: AGENT_PROMPTS[agentB.fn],
    messages: [
      {
        role: 'user',
        content: `${agentA.name} (${agentA.fn}) identificou o seguinte no app-ags:\n\n"${topicFromA}"\n\nDo seu ponto de vista como ${agentB.fn}, o que você acha? Tem algo a acrescentar ou uma ação a sugerir? Seja breve (2-3 frases).`
      }
    ],
  })

  return response.content[0].text
}

async function runAgentMeeting() {
  if (isRunning) return
  isRunning = true

  try {
    // Pick 2 random agents to have a meeting
    const shuffled = [...AGENTS].sort(() => Math.random() - 0.5)
    const agentA = shuffled[0]
    const agentB = shuffled[1]

    console.log(`🤝 Reunião autônoma: ${agentA.name} + ${agentB.name}`)

    // Notify frontend
    broadcast('agent_meeting_start', {
      agentIds: [agentA.id, agentB.id],
      agentNames: [agentA.name, agentB.name],
    })

    // Create conversation in Supabase
    const conv = await createConversation('agent', [agentA.id, agentB.id])

    await saveMessage(conv.id, 'Sistema',
      `Reunião autônoma entre ${agentA.name} e ${agentB.name}`, true)

    broadcast('agent_message', {
      conversationId: conv.id,
      sender: 'Sistema',
      text: `${agentA.name} iniciou análise do app-ags...`,
      isSystem: true,
    })

    // Agent A analyzes
    const analysisA = await agentAnalyze(agentA)
    if (!analysisA) { isRunning = false; return }

    await saveMessage(conv.id, agentA.name, analysisA)
    broadcast('agent_message', { conversationId: conv.id, sender: agentA.name, text: analysisA, agentId: agentA.id })

    // Small delay for natural feeling
    await sleep(2000)

    // Agent B responds
    const responseB = await agentDiscuss(agentA, agentB, analysisA)
    await saveMessage(conv.id, agentB.name, responseB)
    broadcast('agent_message', { conversationId: conv.id, sender: agentB.name, text: responseB, agentId: agentB.id })

    await sleep(1500)

    // Agent A concludes
    const conclusionA = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: AGENT_PROMPTS[agentA.fn],
      messages: [
        { role: 'user', content: analysisA },
        { role: 'assistant', content: 'Entendido.' },
        { role: 'user', content: `${agentB.name} respondeu: "${responseB}"\n\nConclusão em 1-2 frases: qual a próxima ação?` }
      ],
    })

    const conclusionText = conclusionA.content[0].text
    await saveMessage(conv.id, agentA.name, conclusionText)
    broadcast('agent_message', { conversationId: conv.id, sender: agentA.name, text: conclusionText, agentId: agentA.id })

    broadcast('agent_meeting_end', { conversationId: conv.id })
    console.log(`✅ Reunião autônoma concluída`)

  } catch (err) {
    console.error('Erro na reunião autônoma:', err.message)
  } finally {
    isRunning = false
  }
}

export function startAutonomousLoop(intervalMinutes = 8) {
  console.log(`🤖 Loop autônomo iniciado — reuniões a cada ${intervalMinutes} minutos`)

  // First meeting after 30 seconds
  setTimeout(runAgentMeeting, 30000)

  loopInterval = setInterval(runAgentMeeting, intervalMinutes * 60 * 1000)
}

export function stopAutonomousLoop() {
  if (loopInterval) clearInterval(loopInterval)
  console.log('Loop autônomo parado')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
