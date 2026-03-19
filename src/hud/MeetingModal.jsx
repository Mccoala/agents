import { useState } from 'react'
import useAgentStore from '../store/useAgentStore'

export default function MeetingModal() {
  const agents = useAgentStore(s => s.agents)
  const closeMeetingModal = useAgentStore(s => s.closeMeetingModal)
  const startUserMeeting = useAgentStore(s => s.startUserMeeting)
  const [selected, setSelected] = useState([])

  const toggle = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const confirm = () => {
    if (selected.length === 0) return
    startUserMeeting(selected)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>🤝 Convocar Reunião</h3>
          <button className="close-btn" onClick={closeMeetingModal}>×</button>
        </div>
        <p className="modal-sub">Selecione os agentes para a reunião</p>

        <div className="modal-agent-list">
          {agents.map(agent => (
            <label key={agent.id} className={`modal-agent-row ${selected.includes(agent.id) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                checked={selected.includes(agent.id)}
                onChange={() => toggle(agent.id)}
              />
              <span className="modal-agent-name">{agent.name}</span>
              <span className="modal-agent-fn">{agent.fn}</span>
            </label>
          ))}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel" onClick={closeMeetingModal}>Cancelar</button>
          <button
            className="modal-confirm"
            onClick={confirm}
            disabled={selected.length === 0}
          >
            Iniciar ({selected.length})
          </button>
        </div>
      </div>
    </div>
  )
}
