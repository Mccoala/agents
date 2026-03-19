import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { askAgent } from './lib/claude.js'
import { createConversation, saveMessage, getMessages, endConversation } from './lib/supabase.js'
import { getFile, listFiles } from './lib/github.js'

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())

// In-memory conversation history per conversation ID (for Claude context)
const conversationHistories = {}

// ── Health check ──
app.get('/health', (_, res) => res.json({ ok: true }))

// ── Start a meeting ──
// Body: { agentIds: number[], agentNames: string[], agentFns: string[] }
app.post('/api/meeting/start', async (req, res) => {
  try {
    const { agentIds, agentNames, agentFns } = req.body

    // Create conversation in Supabase
    const conv = await createConversation('user', agentIds)

    // Init history
    conversationHistories[conv.id] = []

    // Welcome message
    const welcome = `Reunião iniciada com: ${agentNames.join(', ')}. Como posso ajudar?`
    await saveMessage(conv.id, 'Sistema', welcome, true)

    res.json({ conversationId: conv.id, welcome })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// ── Send message in meeting ──
// Body: { conversationId: string, message: string, agentFn: string, agentName: string }
app.post('/api/meeting/message', async (req, res) => {
  try {
    const { conversationId, message, agentFn, agentName } = req.body

    if (!conversationHistories[conversationId]) {
      conversationHistories[conversationId] = []
    }

    // Save user message
    await saveMessage(conversationId, 'Você', message)

    // Get agent response from Claude
    const history = conversationHistories[conversationId]
    const reply = await askAgent(agentFn, history, message)

    // Update history
    history.push({ role: 'user', content: message })
    history.push({ role: 'assistant', content: reply })

    // Save agent reply
    await saveMessage(conversationId, agentName, reply)

    res.json({ reply, sender: agentName })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// ── Get messages ──
app.get('/api/meeting/:id/messages', async (req, res) => {
  try {
    const messages = await getMessages(req.params.id)
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── End meeting ──
app.post('/api/meeting/end', async (req, res) => {
  try {
    const { conversationId } = req.body
    await endConversation(conversationId)
    delete conversationHistories[conversationId]
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GitHub: list repo files ──
app.get('/api/repo/files', async (req, res) => {
  try {
    const { path = '' } = req.query
    const files = await listFiles(path)
    res.json(files)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GitHub: get file content ──
app.get('/api/repo/file', async (req, res) => {
  try {
    const { path } = req.query
    const { content } = await getFile(path)
    res.json({ content })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✅ Agents backend running on http://localhost:${PORT}`))
