import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { STATE_COLORS } from '../utils/colors'
import useAgentStore from '../store/useAgentStore'

const _target = new THREE.Vector3()

const AgentMesh = memo(function AgentMesh({ agent }) {
  const groupRef = useRef()
  const bodyRef = useRef()
  const headRef = useRef()
  const selectAgent = useAgentStore(s => s.selectAgent)
  const selectedAgentId = useAgentStore(s => s.selectedAgentId)
  const isSelected = selectedAgentId === agent.id
  const colors = STATE_COLORS[agent.state] || STATE_COLORS.idle

  useFrame((state, delta) => {
    if (!groupRef.current) return
    _target.set(agent.position[0], 0, agent.position[2])
    groupRef.current.position.lerp(_target, delta * 2.5)

    const t = state.clock.elapsedTime + agent.id
    if (agent.state === 'working' && headRef.current) {
      headRef.current.position.y = 1.08 + Math.sin(t * 3) * 0.035
    } else if (agent.state === 'coffee' && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.7) * 0.12
    } else if (agent.state === 'done' && bodyRef.current) {
      bodyRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.04)
    } else {
      if (headRef.current) headRef.current.position.y = 1.08
      if (bodyRef.current) bodyRef.current.scale.setScalar(1)
    }
  })

  return (
    <group
      ref={groupRef}
      position={[agent.position[0], 0, agent.position[2]]}
      onClick={e => { e.stopPropagation(); selectAgent(agent.id) }}
    >
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.14, 0.17, 0.65, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.5} emissive={colors.body} emissiveIntensity={0.25} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.19, 10, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.4} emissive={colors.body} emissiveIntensity={0.3} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.07, 1.11, 0.16]}>
        <sphereGeometry args={[0.03, 5, 5]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.07, 1.11, 0.16]}>
        <sphereGeometry args={[0.03, 5, 5]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.35, 20]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Floating label — só mostra nome e função */}
      <Html position={[0, 1.6, 0]} center distanceFactor={12} occlude zIndexRange={[10, 0]}>
        <div style={{
          background: 'rgba(10,10,20,0.82)',
          border: `1px solid ${colors.glow}`,
          borderRadius: 7,
          padding: '3px 8px',
          textAlign: 'center',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{agent.name}</div>
          <div style={{ color: colors.glow, fontSize: 8 }}>{agent.fn}</div>
        </div>
      </Html>
    </group>
  )
})

export default AgentMesh
