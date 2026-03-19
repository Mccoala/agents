import useAgentStore from '../store/useAgentStore'
import { STATE_COLORS, STATE_LABELS } from '../utils/colors'

export default function HUD() {
  const agents = useAgentStore(s => s.agents)
  const selectedAgentId = useAgentStore(s => s.selectedAgentId)
  const selectAgent = useAgentStore(s => s.selectAgent)
  const watchingAgentMeeting = useAgentStore(s => s.watchingAgentMeeting)
  const toggleWatchAgentMeeting = useAgentStore(s => s.toggleWatchAgentMeeting)

  const working = agents.filter(a => a.state === 'working').length
  const inMeeting = agents.filter(a => a.state === 'meeting').length

  return (
    <div className="agent-list-panel">
      <div className="panel-header">
        <h2>🤖 Agentes</h2>
        <p>{working} trabalhando · {inMeeting} em reunião</p>
        <button
          className="watch-meeting-btn"
          onClick={toggleWatchAgentMeeting}
          style={{ background: watchingAgentMeeting ? 'rgba(167,139,250,0.2)' : 'transparent' }}
        >
          👁 {watchingAgentMeeting ? 'Ocultar log' : 'Ver reuniões'}
        </button>
      </div>

      {agents.map(agent => {
        const colors = STATE_COLORS[agent.state] || STATE_COLORS.idle
        const label = STATE_LABELS[agent.state] || agent.state
        const isSelected = selectedAgentId === agent.id

        return (
          <div
            key={agent.id}
            className={`agent-row ${isSelected ? 'selected' : ''}`}
            onClick={() => selectAgent(isSelected ? null : agent.id)}
          >
            <div className="agent-dot" style={{ background: colors.glow, color: colors.glow }} />
            <div className="agent-info">
              <div className="agent-name">{agent.name}</div>
              <div className="agent-fn">{agent.fn}</div>
            </div>
            <div className="state-badge" style={{ background: `${colors.glow}22`, color: colors.glow, border: `1px solid ${colors.glow}44` }}>
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
