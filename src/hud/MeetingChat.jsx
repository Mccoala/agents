import { useRef, useEffect } from 'react'
import useAgentStore from '../store/useAgentStore'
import { STATE_COLORS } from '../utils/colors'

export default function MeetingChat() {
  const agents = useAgentStore(s => s.agents)
  const userMeetingAgentIds = useAgentStore(s => s.userMeetingAgentIds)
  const meetingChatLog = useAgentStore(s => s.meetingChatLog)
  const endUserMeeting = useAgentStore(s => s.endUserMeeting)
  const bottomRef = useRef()

  const meetingAgents = agents.filter(a => userMeetingAgentIds.includes(a.id))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [meetingChatLog])

  return (
    <div className="meeting-chat-panel">
      <div className="meeting-chat-header">
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>🤝 Reunião em andamento</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
            {meetingAgents.map(a => a.name).join(', ')}
          </div>
        </div>
        <button className="close-btn" onClick={endUserMeeting} title="Encerrar reunião">✕ Encerrar</button>
      </div>

      <div className="meeting-chat-log">
        {meetingChatLog.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.isSystem ? 'system' : ''}`}>
            {!msg.isSystem && (
              <span className="chat-sender" style={{ color: getSenderColor(msg.sender, meetingAgents) }}>
                {msg.sender}
              </span>
            )}
            <span className="chat-text">{msg.text}</span>
            <span className="chat-time">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="meeting-chat-info">
        <span>⚠️ Zero tokens gastos — reunião visual.</span>
        <span>Integração com Claude API em breve.</span>
      </div>
    </div>
  )
}

function getSenderColor(sender, agents) {
  const agent = agents.find(a => a.name === sender)
  if (!agent) return '#aaa'
  const colors = STATE_COLORS[agent.state] || STATE_COLORS.idle
  return colors.glow
}
