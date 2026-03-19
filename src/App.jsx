import { useEffect } from 'react'
import useAgentStore from './store/useAgentStore'
import { startAgentBehavior } from './logic/agentBehavior'
import Office2D from './office2d/Office2D'
import HUD from './hud/HUD'
import DetailPanel from './hud/DetailPanel'
import MeetingModal from './hud/MeetingModal'
import MeetingChat from './hud/MeetingChat'
import AgentMeetingLog from './hud/AgentMeetingLog'
import './hud/hud.css'

export default function App() {
  const hudVisible = useAgentStore(s => s.hudVisible)
  const userMeetingActive = useAgentStore(s => s.userMeetingActive)
  const watchingAgentMeeting = useAgentStore(s => s.watchingAgentMeeting)
  const meetingModalOpen = useAgentStore(s => s.meetingModalOpen)

  useEffect(() => {
    // Autonomous behavior only runs when no user meeting is active
    const cleanup = startAgentBehavior(useAgentStore)
    return cleanup
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 2D Office */}
      <Office2D />

      {/* HUD Overlay */}
      <div id="hud">
        {/* Toggle button */}
        <button
          className="hud-toggle-btn"
          onClick={() => useAgentStore.getState().toggleHud()}
          title={hudVisible ? 'Esconder painel' : 'Mostrar painel'}
        >
          {hudVisible ? '◀' : '▶'}
        </button>

        {hudVisible && <HUD />}
        <DetailPanel />

        {!userMeetingActive && (
          <button className="meeting-btn" onClick={() => useAgentStore.getState().openMeetingModal()}>
            🤝 Convocar Reunião
          </button>
        )}

        {meetingModalOpen && <MeetingModal />}
        {userMeetingActive && <MeetingChat />}
        {watchingAgentMeeting && <AgentMeetingLog />}

        <div className="title-bar">
          <span>🖱 Arraste para mover · Scroll para zoom · </span>
          <strong>Clique no agente</strong>
        </div>
      </div>
    </div>
  )
}
