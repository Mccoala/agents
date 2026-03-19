import useAgentStore from '../store/useAgentStore'
import { STATE_COLORS, STATE_LABELS } from '../utils/colors'
import './hud.css'

export default function HUD() {
  const agents = useAgentStore(s => s.agents)
  const selectedAgentId = useAgentStore(s => s.selectedAgentId)
  const selectAgent = useAgentStore(s => s.selectAgent)

  const working = agents.filter(a => a.state === 'working').length
  const done = agents.filter(a => a.state === 'done').length

  return (
    <div className="agent-list-panel">
      <div className="panel-header">
        <h2>🤖 Agents</h2>
        <p>{working} trabalhando · {done} concluídos</p>
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
            <div
              className="state-badge"
              style={{
                background: `${colors.glow}22`,
                color: colors.glow,
                border: `1px solid ${colors.glow}44`,
              }}
            >
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
