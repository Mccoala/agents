import { useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import useAgentStore from './store/useAgentStore'
import { startAgentBehavior } from './logic/agentBehavior'
import OfficeScene from './scene/OfficeScene'
import HUD from './hud/HUD'
import DetailPanel from './hud/DetailPanel'
import MeetingModal from './hud/MeetingModal'
import MeetingChat from './hud/MeetingChat'
import AgentMeetingLog from './hud/AgentMeetingLog'
import './hud/hud.css'

export default function App() {
  const hudVisible = useAgentStore(s => s.hudVisible)
  const toggleHud = useAgentStore(s => s.toggleHud)
  const userMeetingActive = useAgentStore(s => s.userMeetingActive)
  const watchingAgentMeeting = useAgentStore(s => s.watchingAgentMeeting)
  const meetingModalOpen = useAgentStore(s => s.meetingModalOpen)

  useEffect(() => {
    const cleanup = startAgentBehavior(useAgentStore)
    return cleanup
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{ position: [0, 14, 20], fov: 55 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#0a0a14']} />
        <fog attach="fog" args={['#0a0a14', 22, 42]} />
        <Suspense fallback={null}>
          <OfficeScene />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          minDistance={4}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 1, 0]}
        />
      </Canvas>

      <div id="hud">
        {/* Toggle button — sempre visível */}
        <button className="hud-toggle-btn" onClick={toggleHud} title={hudVisible ? 'Esconder painel' : 'Mostrar painel'}>
          {hudVisible ? '◀' : '▶'}
        </button>

        {hudVisible && <HUD />}
        <DetailPanel />

        {/* Botão Convocar Reunião */}
        {!userMeetingActive && (
          <button className="meeting-btn" onClick={() => useAgentStore.getState().openMeetingModal()}>
            🤝 Convocar Reunião
          </button>
        )}

        {/* Modal de seleção */}
        {meetingModalOpen && <MeetingModal />}

        {/* Chat da reunião do usuário */}
        {userMeetingActive && <MeetingChat />}

        {/* Log de reuniões entre agentes */}
        {watchingAgentMeeting && <AgentMeetingLog />}

        <div className="title-bar">
          <span>🖱 Arrastar · Scroll zoom · </span>
          <strong>Clique no agente</strong>
        </div>
      </div>
    </div>
  )
}
