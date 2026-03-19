export default function CoffeeArea() {
  return (
    <group position={[-9.5, 0, 7.5]}>
      {/* Counter top */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[3.2, 0.06, 0.7]} />
        <meshStandardMaterial color="#4a2c10" roughness={0.6} />
      </mesh>

      {/* Counter body */}
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[3.2, 0.88, 0.7]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.8} />
      </mesh>

      {/* Coffee machine */}
      <group position={[-0.9, 0.93, -0.05]}>
        <mesh>
          <boxGeometry args={[0.35, 0.5, 0.35]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Display */}
        <mesh position={[0, 0.06, 0.18]}>
          <boxGeometry args={[0.22, 0.12, 0.02]} />
          <meshStandardMaterial color="#004400" emissive="#00ff44" emissiveIntensity={0.4} />
        </mesh>
        {/* Cup slot */}
        <mesh position={[0, -0.15, 0.1]}>
          <boxGeometry args={[0.2, 0.05, 0.15]} />
          <meshStandardMaterial color="#333" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* Coffee glow */}
        <pointLight position={[0, 0.2, 0.2]} intensity={0.3} color="#ff8800" distance={1.5} />
      </group>

      {/* Water dispenser */}
      <group position={[0.8, 0.93, -0.05]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.14, 0.55, 12]} />
          <meshStandardMaterial color="#c0d8f0" transparent opacity={0.7} roughness={0.1} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#a0c8e8" transparent opacity={0.8} roughness={0.1} />
        </mesh>
      </group>

      {/* Mugs on counter */}
      {[[-0.1, 0], [0.15, 0.05], [0.35, -0.05]].map(([mx, mz], i) => (
        <group key={i} position={[mx, 0.93, mz]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.04, 0.09, 10]} />
            <meshStandardMaterial color={['#e74c3c', '#3498db', '#2ecc71'][i]} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Bar stools */}
      {[[-1.2, 0.8], [0, 0.8], [1.2, 0.8]].map(([sx, sz], i) => (
        <group key={i} position={[sx, 0, sz]}>
          <mesh position={[0, 0.62, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.05, 12]} />
            <meshStandardMaterial color="#3a3a5e" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.31, 0]}>
            <cylinderGeometry args={[0.025, 0.035, 0.62, 8]} />
            <meshStandardMaterial color="#555" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Footrest ring */}
          <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14, 0.015, 6, 16]} />
            <meshStandardMaterial color="#444" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* "Coffee" sign on wall */}
      <mesh position={[0, 2.0, -0.3]}>
        <boxGeometry args={[1.8, 0.45, 0.05]} />
        <meshStandardMaterial color="#1a0a00" roughness={0.8} />
      </mesh>
      <pointLight position={[0, 2.0, 0]} intensity={0.4} color="#ff9933" distance={3} />

      {/* Small rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 1.2]}>
        <planeGeometry args={[3.5, 1.5]} />
        <meshStandardMaterial color="#4a3060" roughness={1} />
      </mesh>
    </group>
  )
}
