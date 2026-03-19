import { useState, useEffect } from 'react'
import useAgentStore from '../store/useAgentStore'
import { STATE_COLORS, STATE_LABELS } from '../utils/colors'

export default function DetailPanel() {
  const agents = useAgentStore(s => s.agents)
  const selectedAgentId = useAgentStore(s => s.selectedAgentId)
  const deselectAgent = useAgentStore(s => s.deselectAgent)
  const renameAgent = useAgentStore(s => s.renameAgent)

  const agent = agents.find(a => a.id === selectedAgentId)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    if (agent) setNameInput(agent.name)
  }, [agent?.id])

  if (!agent) return null

  const colors = STATE_COLORS[agent.state] || STATE_COLORS.idle
  const stateLabel = STATE_LABELS[agent.state] || agent.state

  const handleRename = (e) => {
    const val = e.target.value
    setNameInput(val)
    if (val.trim()) renameAgent(agent.id, val.trim())
  }

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <h3>Agente #{agent.id}</h3>
        <button className="close-btn" onClick={deselectAgent}>×</button>
      </div>

      <div className="detail-body">
        {/* Avatar */}
        <div
          className="detail-avatar"
          style={{
            background: `${colors.glow}22`,
            borderColor: colors.glow,
            boxShadow: `0 0 16px ${colors.glow}44`,
          }}
        >
          🤖
        </div>

        {/* Name (editable) */}
        <div className="detail-field">
          <label>Nome</label>
          <input
            value={nameInput}
            onChange={handleRename}
            placeholder="Nome do agente..."
          />
        </div>

        {/* Function (fixed) */}
        <div className="detail-field">
          <label>Função</label>
          <div className="fn-text">{agent.fn}</div>
        </div>

        {/* Current state */}
        <div className="detail-field">
          <label>Status</label>
          <div
            className="state-display"
            style={{ background: `${colors.glow}18`, color: colors.glow }}
          >
            <span>{stateLabel}</span>
          </div>
        </div>

        {/* Task description */}
        {agent.taskDescription && (
          <div className="task-desc">{agent.taskDescription}</div>
        )}

        {/* Progress bar */}
        <div className="detail-field">
          <label>Progresso · {agent.taskProgress}%</label>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{
                width: `${agent.taskProgress}%`,
                background: colors.glow,
                boxShadow: `0 0 6px ${colors.glow}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
