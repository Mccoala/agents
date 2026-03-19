import { useRef } from 'react'

export default function Office() {
  return (
    <group>
      {/* Ambient + directional light */}
      <ambientLight intensity={0.5} color="#f0f0ff" />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow color="#fff8f0" />
      <directionalLight position={[-8, 8, -5]} intensity={0.3} color="#e0e8ff" />

      {/* Ceiling lights */}
      <pointLight position={[-6, 3.8, 0]} intensity={0.6} color="#fff5e0" distance={12} />
      <pointLight position={[6, 3.8, 0]} intensity={0.6} color="#fff5e0" distance={12} />
      <pointLight position={[0, 3.8, -5]} intensity={0.4} color="#fff5e0" distance={10} />

      {/* Floor — dark concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#2a2a2e" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Floor grid overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#333340" roughness={1} wireframe={false} opacity={0.4} transparent />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#f2f2f5" roughness={0.8} />
      </mesh>

      {/* Wall North (back) */}
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[24, 4, 0.15]} />
        <meshStandardMaterial color="#e8e8ee" roughness={0.7} />
      </mesh>

      {/* Wall South (front, with windows) */}
      <mesh position={[0, 2, 10]}>
        <boxGeometry args={[24, 4, 0.15]} />
        <meshStandardMaterial color="#e8e8ee" roughness={0.7} />
      </mesh>

      {/* Wall West (left) */}
      <mesh position={[-12, 2, 0]}>
        <boxGeometry args={[0.15, 4, 20]} />
        <meshStandardMaterial color="#dcdce8" roughness={0.7} />
      </mesh>

      {/* Wall East (right) */}
      <mesh position={[12, 2, 0]}>
        <boxGeometry args={[0.15, 4, 20]} />
        <meshStandardMaterial color="#dcdce8" roughness={0.7} />
      </mesh>

      {/* Windows on front wall */}
      <Windows />

      {/* Ceiling light fixtures */}
      <LightFixture position={[-6, 3.95, 0]} />
      <LightFixture position={[6, 3.95, 0]} />
      <LightFixture position={[0, 3.95, -5]} />
    </group>
  )
}

function LightFixture({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.2, 0.05, 0.4]} />
      <meshStandardMaterial color="#fffde7" emissive="#fffde7" emissiveIntensity={0.8} />
    </mesh>
  )
}

function Windows() {
  const positions = [[-6, 2.3, 9.93], [0, 2.3, 9.93], [6, 2.3, 9.93]]
  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Frame */}
          <mesh>
            <boxGeometry args={[2.8, 1.8, 0.08]} />
            <meshStandardMaterial color="#c8c8d0" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Glass */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[2.5, 1.5, 0.03]} />
            <meshStandardMaterial color="#b8d4f0" transparent opacity={0.35} roughness={0.1} metalness={0.1} />
          </mesh>
          {/* Light from window */}
          <pointLight position={[0, 0, -1]} intensity={0.5} color="#c8e0ff" distance={8} />
        </group>
      ))}
    </>
  )
}
