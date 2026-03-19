import { useRef, useEffect } from 'react'
import useAgentStore from '../store/useAgentStore'

export default function AgentMeetingLog() {
  const agentMeetingLog = useAgentStore(s => s.agentMeetingLog)
  const toggleWatchAgentMeeting = useAgentStore(s => s.toggleWatchAgentMeeting)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [agentMeetingLog])

  return (
    <div className="agent-log-panel">
      <div className="meeting-chat-header">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>👁 Reuniões dos Agentes</div>
        <button className="close-btn" onClick={toggleWatchAgentMeeting}>×</button>
      </div>
      <div className="meeting-chat-log">
        {agentMeetingLog.length === 0 && (
          <div className="chat-msg system"><span className="chat-text">Nenhuma reunião entre agentes ainda...</span></div>
        )}
        {agentMeetingLog.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.isSystem ? 'system' : ''}`}>
            {!msg.isSystem && <span className="chat-sender" style={{ color: '#a78bfa' }}>{msg.sender}</span>}
            <span className="chat-text">{msg.text}</span>
            <span className="chat-time">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
