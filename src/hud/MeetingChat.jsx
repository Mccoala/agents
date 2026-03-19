import { useRef, useEffect, useState } from 'react'
import useAgentStore from '../store/useAgentStore'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export default function MeetingChat() {
  const agents = useAgentStore(s => s.agents)
  const userMeetingAgentIds = useAgentStore(s => s.userMeetingAgentIds)
  const meetingChatLog = useAgentStore(s => s.meetingChatLog)
  const conversationId = useAgentStore(s => s.conversationId)
  const endUserMeeting = useAgentStore(s => s.endUserMeeting)
  const addMeetingMessage = useAgentStore(s => s.addMeetingMessage)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeAgentIdx, setActiveAgentIdx] = useState(0)
  const bottomRef = useRef()

  const meetingAgents = agents.filter(a => userMeetingAgentIds.includes(a.id))
  const activeAgent = meetingAgents[activeAgentIdx] || meetingAgents[0]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [meetingChatLog])

  const send = async () => {
    if (!input.trim() || loading || !activeAgent) return
    const msg = input.trim()
    setInput('')
    setLoading(true)

    addMeetingMessage('Você', msg)

    try {
      const res = await fetch(`${BACKEND}/api/meeting/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: msg,
          agentFn: activeAgent.fn,
          agentName: activeAgent.name,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      addMeetingMessage(data.sender, data.reply)
    } catch (err) {
      addMeetingMessage('Sistema', `❌ Erro: ${err.message}`, true)
    } finally {
      setLoading(false)
    }
  }

  const handleEnd = async () => {
    if (conversationId) {
      try {
        await fetch(`${BACKEND}/api/meeting/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId }),
        })
      } catch {}
    }
    endUserMeeting()
  }

  return (
    <div className="meeting-chat-panel">
      <div className="meeting-chat-header">
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>🤝 Reunião em andamento</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
            {meetingAgents.map(a => a.name).join(', ')}
          </div>
        </div>
        <button className="close-btn" onClick={handleEnd} style={{ fontSize: 11, padding: '4px 8px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6 }}>
          ✕ Encerrar
        </button>
      </div>

      {/* Agent selector */}
      {meetingAgents.length > 1 && (
        <div style={{ display: 'flex', gap: 4, padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          {meetingAgents.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setActiveAgentIdx(i)}
              style={{
                padding: '3px 8px', borderRadius: 12, fontSize: 10, cursor: 'pointer',
                background: activeAgentIdx === i ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${activeAgentIdx === i ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: activeAgentIdx === i ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
              }}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="meeting-chat-log">
        {meetingChatLog.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.isSystem ? 'system' : ''}`}>
            {!msg.isSystem && (
              <span className="chat-sender" style={{ color: msg.sender === 'Você' ? '#60a5fa' : '#a78bfa' }}>
                {msg.sender}
              </span>
            )}
            <span className="chat-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
            <span className="chat-time">{msg.time}</span>
          </div>
        ))}
        {loading && (
          <div className="chat-msg">
            <span className="chat-sender" style={{ color: '#a78bfa' }}>{activeAgent?.name}</span>
            <span className="chat-text" style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>digitando...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={`Falar com ${activeAgent?.name || 'agente'}...`}
          disabled={loading}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: '#fff', fontSize: 12, padding: '6px 10px', outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            padding: '6px 12px', background: 'rgba(139,92,246,0.8)',
            border: 'none', borderRadius: 8, color: '#fff', fontSize: 12,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  )
}
