import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { STATE_COLORS, STATE_LABELS } from '../utils/colors'
import useAgentStore from '../store/useAgentStore'

export default function AgentMesh({ agent }) {
  const groupRef = useRef()
  const bodyRef = useRef()
  const headRef = useRef()
  const glowRef = useRef()
  const selectAgent = useAgentStore(s => s.selectAgent)
  const selectedAgentId = useAgentStore(s => s.selectedAgentId)
  const isSelected = selectedAgentId === agent.id

  const targetPos = useMemo(() => new THREE.Vector3(...agent.position), [agent.position])
  const colors = STATE_COLORS[agent.state] || STATE_COLORS.idle

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Smooth movement toward target
    groupRef.current.position.lerp(
      new THREE.Vector3(targetPos.x, 0, targetPos.z),
      delta * 2.5
    )

    const t = state.clock.elapsedTime

    // State-based animations
    if (agent.state === 'working') {
      // Subtle head bob while working
      if (headRef.current) headRef.current.position.y = 1.08 + Math.sin(t * 3 + agent.id) * 0.04
    } else if (agent.state === 'coffee') {
      // Gentle sway
      if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 0.8 + agent.id) * 0.15
    } else if (agent.state === 'done') {
      // Pulse scale
      const pulse = 1 + Math.sin(t * 4) * 0.05
      if (bodyRef.current) bodyRef.current.scale.setScalar(pulse)
    } else if (agent.state === 'meeting') {
      // Slight look-around
      if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 0.5 + agent.id) * 0.3
    } else {
      // Idle: reset
      if (headRef.current) headRef.current.position.y = 1.08
      if (bodyRef.current) bodyRef.current.scale.setScalar(1)
      if (groupRef.current) groupRef.current.rotation.y = 0
    }

    // Glow pulse
    if (glowRef.current) {
      glowRef.current.intensity = colors.intensity + Math.sin(t * 2 + agent.id) * 0.2
    }
  })

  return (
    <group
      ref={groupRef}
      position={[agent.position[0], 0, agent.position[2]]}
      onClick={(e) => { e.stopPropagation(); selectAgent(agent.id) }}
    >
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.17, 0.65, 12]} />
        <meshStandardMaterial color={colors.body} roughness={0.4} metalness={0.2} emissive={colors.body} emissiveIntensity={0.15} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.08, 0]} castShadow>
        <sphereGeometry args={[0.19, 14, 12]} />
        <meshStandardMaterial color={colors.body} roughness={0.3} metalness={0.1} emissive={colors.body} emissiveIntensity={0.2} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.07, 1.11, 0.16]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.07, 1.11, 0.16]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.35, 24]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        position={[0, 1.1, 0]}
        intensity={colors.intensity}
        color={colors.glow}
        distance={2.5}
      />

      {/* Floating label */}
      <Html
        position={[0, 1.65, 0]}
        center
        distanceFactor={10}
        occlude
        zIndexRange={[10, 0]}
      >
        <div style={{
          background: 'rgba(10, 10, 20, 0.88)',
          border: `1px solid ${colors.glow}`,
          borderRadius: '8px',
          padding: '4px 10px',
          minWidth: '110px',
          textAlign: 'center',
          pointerEvents: 'none',
          boxShadow: `0 0 8px ${colors.glow}55`,
        }}>
          <div style={{ color: '#fff', fontSize: '11px', fontWeight: 700, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
            {agent.name}
          </div>
          <div style={{ color: colors.glow, fontSize: '9px', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            {agent.fn}
          </div>
        </div>
      </Html>
    </group>
  )
}
