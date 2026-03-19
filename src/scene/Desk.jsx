import { useMemo } from 'react'

export default function Desk({ position, flipped = false }) {
  const [x, y, z] = position
  const dir = flipped ? -1 : 1

  return (
    <group position={[x, 0, z]}>
      {/* Tabletop */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.4, 0.06, 0.75]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Table legs */}
      {[[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.35, lz]}>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshStandardMaterial color="#3d2910" roughness={0.8} />
        </mesh>
      ))}

      {/* Monitor */}
      <group position={[dir * 0.1, 0.75, -0.2]}>
        {/* Screen */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.65, 0.42, 0.03]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Screen glow */}
        <mesh position={[0, 0.3, 0.02]}>
          <boxGeometry args={[0.60, 0.38, 0.01]} />
          <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.6} />
        </mesh>
        {/* Stand */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.05, 0.18, 0.05]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.25, 0.02, 0.15]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.6} />
        </mesh>
      </group>

      {/* Keyboard */}
      <mesh position={[dir * 0.05, 0.755, 0.15]}>
        <boxGeometry args={[0.45, 0.015, 0.17]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Mouse */}
      <mesh position={[dir * 0.3, 0.755, 0.15]}>
        <boxGeometry args={[0.08, 0.02, 0.12]} />
        <meshStandardMaterial color="#222" roughness={0.7} />
      </mesh>

      {/* Chair */}
      <Chair position={[0, 0, dir * 0.55]} />
    </group>
  )
}

function Chair({ position }) {
  const [x, y, z] = position
  return (
    <group position={[x, 0, z]}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.75, -0.22]}>
        <boxGeometry args={[0.46, 0.5, 0.06]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      {/* Leg */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.44, 6]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Base star */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * 0.22, 0.04, Math.sin(rad) * 0.22]}>
            <boxGeometry args={[0.22, 0.04, 0.04]} />
            <meshStandardMaterial color="#222" metalness={0.5} roughness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}
