import Anthropic from '@anthropic-ai/sdk'
import { supabase, createConversation, saveMessage } from '../lib/supabase.js'
import { AGENT_PROMPTS } from '../agents/prompts.js'
import { agentAnalyzeWithTools } from '../lib/claude.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

// ── SSE ──
let sseClients = []
export function addSseClient(res) { sseClients.push(res) }
export function removeSseClient(res) { sseClients = sseClients.filter(c => c !== res) }

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  sseClients.forEach(c => { try { c.write(msg) } catch {} })
}

// ── Agent Inbox (autonomous agent-to-agent communication) ──
const agentInboxes = new Map()
const lastInboxReceived = new Map()  // rate-limit: 5 min between inbox msgs per agent
AGENTS.forEach(a => agentInboxes.set(a.id, []))

// Human-readable tool use descriptions (inspired by pixel-agents transcript parser)
function describeToolUse(toolName, input) {
  switch (toolName) {
    case 'read_file':      return `📖 Lendo ${input.path}`
    case 'list_files':     return `📁 Listando ${input.path}`
    case 'search_in_file': return `🔍 Buscando "${input.term}" em ${input.path}`
    case 'create_fix':     return `🔧 Criando PR: ${input.pr_title}`
    default:               return `⚙️ ${toolName}`
  }
}

// Keyword-based routing: which agent to notify after a meeting
const ROUTING_RULES = [
  { keywords: ['revisar', 'review', 'pr', 'pull request', 'kira', 'código', 'mudança'], targetId: 11 },
  { keywords: ['segurança', 'security', 'vulnerab', 'diego', 'senha', 'exposta', 'api key'], targetId: 4 },
  { keywords: ['bug', 'teste', 'erro', 'falha', 'qa', 'carla', 'regressão'], targetId: 3 },
  { keywords: ['deploy', 'netlify', 'devops', 'joão', 'build', 'ci', 'pipeline'], targetId: 10 },
  { keywords: ['auth', 'login', 'autenticação', 'elena', 'supabase', 'sessão'], targetId: 5 },
  { keywords: ['monitor', 'analisa', 'leo', 'métrica', 'log', 'anomalia'], targetId: 12 },
  { keywords: ['frontend', 'ui', 'componente', 'layout', 'alex', 'css', 'interface'], targetId: 1 },
  { keywords: ['backend', 'api', 'função', 'bruno', 'endpoint', 'servidor'], targetId: 2 },
  { keywords: ['pdf', 'ia', 'extração', 'gabi', 'claude', 'pipeline'], targetId: 7 },
  { keywords: ['billing', 'pagamento', 'stripe', 'plano', 'felipe'], targetId: 6 },
]

function canReceiveInbox(agentId) {
  const last = lastInboxReceived.get(agentId) || 0
  return Date.now() - last > 5 * 60 * 1000
}

function routeConclusion(conclusionText, fromAgent, participantIds) {
  const text = conclusionText.toLowerCase()
  for (const rule of ROUTING_RULES) {
    if (participantIds.includes(rule.targetId)) continue
    if (!canReceiveInbox(rule.targetId)) continue
    if (rule.keywords.some(kw => text.includes(kw))) {
      const target = AGENTS.find(a => a.id === rule.targetId)
      if (target) {
        agentInboxes.get(rule.targetId).push({
          from: fromAgent.id,
          fromName: fromAgent.name,
          topic: conclusionText.slice(0, 250),
          timestamp: Date.now(),
        })
        lastInboxReceived.set(rule.targetId, Date.now())
        console.log(`📬 ${fromAgent.name} → inbox de ${target.name}`)
        return target
      }
    }
  }
  // Fallback: route to Leo (Monitor) if no keyword match, randomly ~40% of the time
  if (Math.random() < 0.4 && !participantIds.includes(12) && canReceiveInbox(12)) {
    const leo = AGENTS.find(a => a.id === 12)
    agentInboxes.get(12).push({
      from: fromAgent.id,
      fromName: fromAgent.name,
      topic: conclusionText.slice(0, 250),
      timestamp: Date.now(),
    })
    lastInboxReceived.set(12, Date.now())
    console.log(`📬 ${fromAgent.name} → inbox de ${leo.name} (fallback)`)
    return leo
  }
  return null
}

// ── Tool-aware agent analyze ──
async function agentAnalyze(agent, onToolUse = null) {
  const files = AGENT_FILES[agent.fn] || ['src/App.jsx']
  return await agentAnalyzeWithTools(agent.fn, agent.name, files, onToolUse) || null
}

async function agentDiscuss(agentA, agentB, topicFromA) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: AGENT_PROMPTS[agentB.fn],
    messages: [{
      role: 'user',
      content: `${agentA.name} (${agentA.fn}) identificou o seguinte no app-ags:\n\n"${topicFromA}"\n\nDo seu ponto de vista como ${agentB.fn}, o que você acha? Tem algo a acrescentar ou uma ação a sugerir? Seja breve (2-3 frases).`
    }],
  })
  return response.content[0].text
}

// ── Scheduled random meeting ──
let isRunning = false

async function runAgentMeeting() {
  if (isRunning) return
  isRunning = true

  try {
    const shuffled = [...AGENTS].sort(() => Math.random() - 0.5)
    const agentA = shuffled[0]
    const agentB = shuffled[1]

    console.log(`🤝 Reunião autônoma: ${agentA.name} + ${agentB.name}`)
    broadcast('agent_meeting_start', { agentIds: [agentA.id, agentB.id], agentNames: [agentA.name, agentB.name] })

    const conv = await createConversation('agent', [agentA.id, agentB.id])
    await saveMessage(conv.id, 'Sistema', `Reunião autônoma entre ${agentA.name} e ${agentB.name}`, true)
    broadcast('agent_message', { conversationId: conv.id, sender: 'Sistema', text: `${agentA.name} iniciou análise do app-ags...`, isSystem: true })

    // Agent A analyzes — broadcasts tool use events in real-time
    const onToolUseA = (toolName, input) => {
      broadcast('agent_tool_use', { agentId: agentA.id, agentName: agentA.name, tool: toolName, description: describeToolUse(toolName, input) })
    }
    const analysisA = await agentAnalyze(agentA, onToolUseA)
    if (!analysisA) { isRunning = false; return }

    await saveMessage(conv.id, agentA.name, analysisA)
    broadcast('agent_message', { conversationId: conv.id, sender: agentA.name, text: analysisA, agentId: agentA.id })

    await sleep(2000)

    // Agent B responds
    broadcast('agent_tool_use', { agentId: agentB.id, agentName: agentB.name, tool: 'thinking', description: '💬 Elaborando resposta...' })
    const responseB = await agentDiscuss(agentA, agentB, analysisA)
    await saveMessage(conv.id, agentB.name, responseB)
    broadcast('agent_message', { conversationId: conv.id, sender: agentB.name, text: responseB, agentId: agentB.id })

    await sleep(1500)

    // Agent A concludes
    const conclusionResponse = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: AGENT_PROMPTS[agentA.fn],
      messages: [
        { role: 'user', content: analysisA },
        { role: 'assistant', content: 'Entendido.' },
        { role: 'user', content: `${agentB.name} respondeu: "${responseB}"\n\nConclusão em 1-2 frases: qual a próxima ação?` }
      ],
    })
    const conclusionText = conclusionResponse.content[0].text
    await saveMessage(conv.id, agentA.name, conclusionText)
    broadcast('agent_message', { conversationId: conv.id, sender: agentA.name, text: conclusionText, agentId: agentA.id })

    // Route conclusion to a relevant agent — chain-reaction autonomous communication
    const routed = routeConclusion(conclusionText, agentA, [agentA.id, agentB.id])
    if (routed) {
      broadcast('agent_message', {
        conversationId: conv.id,
        sender: 'Sistema',
        text: `📬 Tarefa encaminhada para ${routed.name} (${routed.fn})`,
        isSystem: true,
      })
    }

    broadcast('agent_meeting_end', { conversationId: conv.id })
    broadcast('agent_idle', { agentIds: [agentA.id, agentB.id] })
    console.log(`✅ Reunião concluída${routed ? ` → próximo: ${routed.name}` : ''}`)

  } catch (err) {
    console.error('Erro na reunião autônoma:', err.message)
  } finally {
    isRunning = false
  }
}

// ── Inbox meeting: one agent responds to a directed message from another ──
async function processInboxMessage(recipient, message) {
  if (isRunning) return
  isRunning = true

  try {
    console.log(`📨 ${recipient.name} processando mensagem de ${message.fromName}`)
    broadcast('agent_meeting_start', {
      agentIds: [message.from, recipient.id],
      agentNames: [message.fromName, recipient.name],
      isInbox: true,
    })

    const conv = await createConversation('agent', [message.from, recipient.id])
    broadcast('agent_message', {
      conversationId: conv.id,
      sender: 'Sistema',
      text: `📬 ${message.fromName} encaminhou análise para ${recipient.name}`,
      isSystem: true,
    })

    // Recipient analyzes the topic with tool access
    const onToolUse = (toolName, input) => {
      broadcast('agent_tool_use', { agentId: recipient.id, agentName: recipient.name, tool: toolName, description: describeToolUse(toolName, input) })
    }

    // Analyze the files relevant to the inbox topic, then respond
    const files = AGENT_FILES[recipient.fn] || ['src/App.jsx']
    const analysis = await agentAnalyzeWithTools(recipient.fn, recipient.name, files, onToolUse)

    // Synthesize with the inbox message context
    const synthesisResponse = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      system: AGENT_PROMPTS[recipient.fn],
      messages: [{
        role: 'user',
        content: `${message.fromName} te enviou esta análise sobre o app-ags:\n\n"${message.topic}"\n\nVocê também analisou os arquivos e encontrou:\n\n"${analysis}"\n\nComo ${recipient.fn}, responda ao ${message.fromName} com sua perspectiva e próxima ação. Seja direto (2-3 frases).`
      }],
    })

    const responseText = synthesisResponse.content[0].text
    await saveMessage(conv.id, recipient.name, responseText)
    broadcast('agent_message', { conversationId: conv.id, sender: recipient.name, text: responseText, agentId: recipient.id })

    // Chain: this response can also route to another agent
    const routed = routeConclusion(responseText, recipient, [message.from, recipient.id])
    if (routed) {
      broadcast('agent_message', {
        conversationId: conv.id,
        sender: 'Sistema',
        text: `📬 Tarefa encaminhada para ${routed.name} (${routed.fn})`,
        isSystem: true,
      })
    }

    broadcast('agent_meeting_end', { conversationId: conv.id })
    broadcast('agent_idle', { agentIds: [recipient.id] })

  } catch (err) {
    console.error('Erro no processamento de inbox:', err.message)
  } finally {
    isRunning = false
  }
}

// Check all inboxes every 90 seconds
function checkInboxes() {
  for (const agent of AGENTS) {
    const inbox = agentInboxes.get(agent.id)
    if (inbox && inbox.length > 0 && !isRunning) {
      const message = inbox.shift()
      processInboxMessage(agent, message)
      return // one at a time
    }
  }
}

let loopInterval = null
let inboxInterval = null

export function startAutonomousLoop(intervalMinutes = 8) {
  console.log(`🤖 Loop autônomo iniciado — reuniões a cada ${intervalMinutes} min, inbox check a cada 90s`)
  setTimeout(runAgentMeeting, 30000)
  loopInterval = setInterval(runAgentMeeting, intervalMinutes * 60 * 1000)
  inboxInterval = setInterval(checkInboxes, 90 * 1000)
}

export function stopAutonomousLoop() {
  if (loopInterval) clearInterval(loopInterval)
  if (inboxInterval) clearInterval(inboxInterval)
  console.log('Loop autônomo parado')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
