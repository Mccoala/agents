import { MEETING_SEATS } from '../data/agents'

export default function MeetingTable() {
  return (
    <group position={[0, 0, 0]}>
      {/* Tabletop */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.07, 32]} />
        <meshStandardMaterial color="#3d2005" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Table rim */}
      <mesh position={[0, 0.72, 0]}>
        <torusGeometry args={[2.0, 0.04, 8, 32]} />
        <meshStandardMaterial color="#6b3a10" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Central leg */}
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.75, 12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Base cross */}
      {[0, 90].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <mesh key={i} position={[0, 0.04, 0]} rotation={[0, rad, 0]}>
            <boxGeometry args={[2.2, 0.06, 0.12]} />
            <meshStandardMaterial color="#222" roughness={0.4} metalness={0.6} />
          </mesh>
        )
      })}

      {/* Chairs around table */}
      {MEETING_SEATS.map((seat, i) => {
        const angle = Math.atan2(seat[2], seat[0])
        return (
          <group key={i} position={[seat[0], 0, seat[2]]} rotation={[0, angle + Math.PI / 2, 0]}>
            {/* Seat pad */}
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.44, 0.06, 0.44]} />
              <meshStandardMaterial color="#2d1b69" roughness={0.8} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, 0.72, -0.19]}>
              <boxGeometry args={[0.4, 0.46, 0.06]} />
              <meshStandardMaterial color="#2d1b69" roughness={0.8} />
            </mesh>
            {/* Leg */}
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.025, 0.03, 0.44, 6]} />
              <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        )
      })}

      {/* Decorative centerpiece — small plant */}
      <mesh position={[0, 0.79, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.12, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial color="#2d6a2d" roughness={1} />
      </mesh>
    </group>
  )
}
