import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { askAgent } from './lib/claude.js'
import { createConversation, saveMessage, getMessages, endConversation } from './lib/supabase.js'
import { startAutonomousLoop, addSseClient, removeSseClient } from './autonomy/agentLoop.js'

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())

const conversationHistories = {}

// ── Health ──
app.get('/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }))

// ── SSE: frontend subscribes to live agent events ──
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Send heartbeat every 25s to keep connection alive
  const hb = setInterval(() => res.write(':heartbeat\n\n'), 25000)
  addSseClient(res)

  req.on('close', () => {
    clearInterval(hb)
    removeSseClient(res)
  })
})

// ── Start meeting ──
app.post('/api/meeting/start', async (req, res) => {
  try {
    const { agentIds, agentNames, agentFns } = req.body
    const conv = await createConversation('user', agentIds)
    conversationHistories[conv.id] = []
    const welcome = `Olá! Reunião iniciada com ${agentNames.join(', ')}. Como posso ajudar?`
    await saveMessage(conv.id, 'Sistema', welcome, true)
    res.json({ conversationId: conv.id, welcome })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Send message ──
app.post('/api/meeting/message', async (req, res) => {
  try {
    const { conversationId, message, agentFn, agentName } = req.body
    if (!conversationHistories[conversationId]) conversationHistories[conversationId] = []

    await saveMessage(conversationId, 'Você', message)

    const { text, toolCalls } = await askAgent(agentFn, conversationHistories[conversationId], message)

    conversationHistories[conversationId].push({ role: 'user', content: message })
    conversationHistories[conversationId].push({ role: 'assistant', content: text })

    // Keep history bounded
    if (conversationHistories[conversationId].length > 20) {
      conversationHistories[conversationId] = conversationHistories[conversationId].slice(-20)
    }

    await saveMessage(conversationId, agentName, text)
    res.json({ reply: text, toolCalls, sender: agentName })
  } catch (err) {
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
    if (conversationId) {
      await endConversation(conversationId)
      delete conversationHistories[conversationId]
    }
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Get recent agent meetings ──
app.get('/api/agent-meetings', async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const { supabase } = await import('./lib/supabase.js')
    const { data } = await supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('type', 'agent')
      .order('created_at', { ascending: false })
      .limit(10)
    res.json(data || [])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ Agents backend on http://localhost:${PORT}`)
  startAutonomousLoop(8) // reunião autônoma a cada 8 minutos
})
