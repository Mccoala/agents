import { useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import useAgentStore from './store/useAgentStore'
import { startAgentBehavior } from './logic/agentBehavior'
import OfficeScene from './scene/OfficeScene'
import HUD from './hud/HUD'
import DetailPanel from './hud/DetailPanel'
import './hud/hud.css'

export default function App() {
  const storeRef = useRef(useAgentStore)

  useEffect(() => {
    const cleanup = startAgentBehavior(useAgentStore)
    return cleanup
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 14, 20], fov: 55 }}
        gl={{ antialias: true, alpha: false }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#0a0a14']} />
        <fog attach="fog" args={['#0a0a14', 20, 45]} />

        <Suspense fallback={null}>
          <OfficeScene />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 1, 0]}
        />
      </Canvas>

      {/* HUD Overlay */}
      <div id="hud">
        <HUD />
        <DetailPanel />

        {/* Bottom hint bar */}
        <div className="title-bar">
          <span>🖱 Arrastar: girar · Scroll: zoom · </span>
          <strong>Clique no agente para detalhes</strong>
        </div>
      </div>
    </div>
  )
}
