import { memo } from 'react'

/* Hair shapes — viewed from front */
function Hair({ style, color }) {
  switch (style) {
    case 'spiky':
      return (
        <g>
          <ellipse cx="25" cy="18" rx="13" ry="9" fill={color} />
          {[12, 17, 22, 27, 32, 37].map((x, i) => (
            <polygon key={i} points={`${x},18 ${x + 2},18 ${x + 1},${10 - (i % 2) * 3}`} fill={color} />
          ))}
        </g>
      )
    case 'curly':
      return (
        <g fill={color}>
          <ellipse cx="25" cy="19" rx="14" ry="10" />
          {[11, 16, 22, 28, 34, 39].map((x, i) => (
            <circle key={i} cx={x} cy={12 + (i % 2) * 3} r="4" />
          ))}
        </g>
      )
    case 'long':
      return (
        <g fill={color}>
          <ellipse cx="25" cy="20" rx="14" ry="10" />
          <rect x="11" y="22" width="5" height="20" rx="2.5" />
          <rect x="34" y="22" width="5" height="20" rx="2.5" />
        </g>
      )
    case 'bob':
      return (
        <g fill={color}>
          <ellipse cx="25" cy="22" rx="15" ry="12" />
          <rect x="10" y="22" width="30" height="10" rx="0" />
        </g>
      )
    case 'bun':
      return (
        <g fill={color}>
          <ellipse cx="25" cy="22" rx="13" ry="8" />
          <circle cx="25" cy="12" r="6" />
        </g>
      )
    case 'combed':
      return (
        <g fill={color}>
          <ellipse cx="27" cy="18" rx="14" ry="9" />
          <ellipse cx="15" cy="20" rx="5" ry="7" />
        </g>
      )
    case 'messy':
      return (
        <g fill={color}>
          <ellipse cx="25" cy="19" rx="14" ry="10" />
          <ellipse cx="15" cy="14" rx="5" ry="6" transform="rotate(-15 15 14)" />
          <ellipse cx="35" cy="14" rx="5" ry="6" transform="rotate(15 35 14)" />
          <ellipse cx="25" cy="12" rx="4" ry="5" />
        </g>
      )
    case 'buzz':
      return <ellipse cx="25" cy="20" rx="13" ry="6" fill={color} />
    default: // short
      return <ellipse cx="25" cy="19" rx="13" ry="8" fill={color} />
  }
}

function Glasses() {
  return (
    <g stroke="#333" strokeWidth="1" fill="none">
      <circle cx="19" cy="27" r="4" />
      <circle cx="31" cy="27" r="4" />
      <line x1="23" y1="27" x2="27" y2="27" />
      <line x1="11" y1="26" x2="15" y2="27" />
      <line x1="35" y1="27" x2="39" y2="26" />
    </g>
  )
}

function Headset({ outfitColor }) {
  return (
    <g>
      <path d="M12 27 Q12 16 25 16 Q38 16 38 27" stroke="#333" strokeWidth="2" fill="none" />
      <rect x="9" y="25" width="5" height="7" rx="2" fill="#333" />
      <rect x="36" y="25" width="5" height="7" rx="2" fill="#333" />
      <line x1="14" y1="29" x2="20" y2="33" stroke="#555" strokeWidth="1.5" />
      <circle cx="20" cy="34" r="2" fill="#555" />
    </g>
  )
}

function Tie({ color }) {
  return (
    <g>
      <polygon points="25,40 23,48 25,55 27,48" fill="#E74C3C" />
      <polygon points="23,40 27,40 26,45 24,45" fill="#C0392B" />
    </g>
  )
}

/* Walking animation frames: 0=idle, 1=step-right, 2=step-left */
const WALK_OFFSETS = [
  { lLeg: 0, rLeg: 0, lArm: 0, rArm: 0 },
  { lLeg: -5, rLeg: 5, lArm: 5, rArm: -5 },
  { lLeg: 5, rLeg: -5, lArm: -5, rArm: 5 },
]

const Character = memo(function Character({ design, isWalking = false, walkFrame = 0, selected }) {
  const w = WALK_OFFSETS[isWalking ? walkFrame % 2 + 1 : 0]
  const { skin, hairColor, hairStyle, outfitTop, outfitBottom, shoes, accessories } = design

  return (
    <svg width="50" height="82" viewBox="0 0 50 82" style={{ overflow: 'visible', filter: selected ? 'drop-shadow(0 0 6px #fff)' : 'none' }}>
      {/* Shadow */}
      <ellipse cx="25" cy="80" rx="12" ry="3" fill="rgba(0,0,0,0.25)" />

      {/* Hair (behind head) */}
      <Hair style={hairStyle} color={hairColor} />

      {/* Head */}
      <circle cx="25" cy="25" r="13" fill={skin} />

      {/* Ears */}
      <circle cx="12" cy="25" r="3.5" fill={skin} />
      <circle cx="38" cy="25" r="3.5" fill={skin} />

      {/* Eyes */}
      <circle cx="20" cy="24" r="2.5" fill="#2C2C2C" />
      <circle cx="30" cy="24" r="2.5" fill="#2C2C2C" />
      <circle cx="21" cy="23" r="1" fill="white" />
      <circle cx="31" cy="23" r="1" fill="white" />

      {/* Eyebrows */}
      <path d="M17 20 Q20 18 23 20" stroke="#5D4037" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M27 20 Q30 18 33 20" stroke="#5D4037" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      <path d="M21 30 Q25 33 29 30" stroke="#C0392B" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Glasses */}
      {accessories.includes('glasses') && <Glasses />}

      {/* Headset */}
      {accessories.includes('headset') && <Headset />}

      {/* Neck */}
      <rect x="22" y="37" width="6" height="5" fill={skin} />

      {/* Left arm */}
      <rect
        x="10" y="43"
        width="8" height="17"
        rx="4"
        fill={outfitTop}
        transform={`rotate(${w.lArm} 14 43)`}
      />
      {/* Right arm */}
      <rect
        x="32" y="43"
        width="8" height="17"
        rx="4"
        fill={outfitTop}
        transform={`rotate(${w.rArm} 36 43)`}
      />

      {/* Body */}
      <rect x="15" y="41" width="20" height="22" rx="3" fill={outfitTop} />

      {/* Tie */}
      {accessories.includes('tie') && <Tie />}

      {/* Left leg */}
      <rect
        x="15" y="61"
        width="9" height="16"
        rx="4"
        fill={outfitBottom}
        transform={`rotate(${w.lLeg} 19 61)`}
      />
      {/* Right leg */}
      <rect
        x="26" y="61"
        width="9" height="16"
        rx="4"
        fill={outfitBottom}
        transform={`rotate(${w.rLeg} 31 61)`}
      />

      {/* Shoes */}
      <ellipse cx="19" cy="76" rx="6" ry="3" fill={shoes} transform={`rotate(${w.lLeg} 19 61)`} />
      <ellipse cx="31" cy="76" rx="6" ry="3" fill={shoes} transform={`rotate(${w.rLeg} 31 61)`} />
    </svg>
  )
})

export default Character
