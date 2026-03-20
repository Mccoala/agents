import { useRef, useEffect, useState } from 'react'
import useAgentStore from '../store/useAgentStore'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export default function AgentMeetingLog() {
  const toggleWatchAgentMeeting = useAgentStore(s => s.toggleWatchAgentMeeting)
  const setAgentRealActivity = useAgentStore(s => s.setAgentRealActivity)
  const setActivityBubble = useAgentStore(s => s.setActivityBubble)

  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef()
  const esRef = useRef(null)

  useEffect(() => {
    // Connect to SSE for live agent events
    const es = new EventSource(`${BACKEND}/api/events`)
    esRef.current = es

    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)

    es.addEventListener('agent_meeting_start', (e) => {
      const { agentNames } = JSON.parse(e.data)
      setMessages(m => [...m, {
        sender: 'Sistema',
        text: `🤝 ${agentNames[0]} convocou reunião com ${agentNames[1]}`,
        time: t(), isSystem: true,
      }])
    })

    es.addEventListener('agent_message', (e) => {
      const { sender, text, agentId, isSystem } = JSON.parse(e.data)
      setMessages(m => [...m.slice(-60), { sender, text, time: t(), isSystem: !!isSystem, agentId }])

      // Drive real agent state from SSE — read fresh store state to avoid stale closure
      if (agentId) {
        const agent = useAgentStore.getState().agents.find(a => a.id === agentId)
        if (agent && !agent.locked) {
          setAgentRealActivity(agentId, 'working', agent.deskPosition, text.slice(0, 60))
        }
      }
    })

    // Real-time tool use broadcasts (pixel-agents transcript parser concept)
    es.addEventListener('agent_tool_use', (e) => {
      const { agentId, description } = JSON.parse(e.data)
      if (agentId) {
        setActivityBubble(agentId, description)
        const agent = useAgentStore.getState().agents.find(a => a.id === agentId)
        if (agent && !agent.locked) {
          setAgentRealActivity(agentId, 'working', agent.deskPosition, description)
        }
      }
    })

    es.addEventListener('agent_meeting_end', () => {
      setMessages(m => [...m, { sender: 'Sistema', text: '✅ Reunião concluída', time: t(), isSystem: true }])
    })

    // Reset agents to idle when meeting truly ends
    es.addEventListener('agent_idle', (e) => {
      const { agentIds } = JSON.parse(e.data)
      agentIds?.forEach(id => {
        const agent = useAgentStore.getState().agents.find(a => a.id === id)
        if (agent && !agent.locked) {
          setAgentRealActivity(id, 'idle', agent.deskPosition, '')
        }
      })
    })

    // Load recent meetings on mount
    fetch(`${BACKEND}/api/agent-meetings`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        const msgs = []
        data.reverse().forEach(conv => {
          if (conv.messages) {
            msgs.push({ sender: 'Sistema', text: `— Reunião anterior (${new Date(conv.created_at).toLocaleString('pt-BR')}) —`, time: '', isSystem: true })
            conv.messages.forEach(m => msgs.push({ sender: m.sender, text: m.content, time: new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), isSystem: m.is_system }))
          }
        })
        if (msgs.length) setMessages(msgs)
      })
      .catch(() => {})

    return () => es.close()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="agent-log-panel">
      <div className="meeting-chat-header">
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
            👁 Reuniões dos Agentes
          </div>
          <div style={{ fontSize: 9, color: connected ? '#10b981' : '#ef4444', marginTop: 2 }}>
            {connected ? '● ao vivo' : '● desconectado'}
          </div>
        </div>
        <button className="close-btn" onClick={toggleWatchAgentMeeting}>×</button>
      </div>

      <div className="meeting-chat-log">
        {messages.length === 0 && (
          <div className="chat-msg system">
            <span className="chat-text">Aguardando primeira reunião autônoma... (até 30s)</span>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.isSystem ? 'system' : ''}`}>
            {!msg.isSystem && (
              <span className="chat-sender" style={{ color: '#a78bfa' }}>{msg.sender}</span>
            )}
            <span className="chat-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
            {msg.time && <span className="chat-time">{msg.time}</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function t() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
