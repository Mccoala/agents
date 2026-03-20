import { useRef, useState, useEffect, useCallback } from 'react'
import useAgentStore from '../store/useAgentStore'
import { CHARACTER_DESIGNS } from './characterData'
import { DESK_LAYOUT, MEETING_SEAT_POSITIONS } from './layout'
import Character from './Character'
import './office2d.css'

const OFFICE_W = 1400
const OFFICE_H = 800

const STATE_DOT_COLORS = {
  working: '#3b82f6',
  meeting: '#8b5cf6',
  idle:    '#6b7280',
  coffee:  '#f59e0b',
  done:    '#10b981',
}

function Desk({ x, y, flipped }) {
  const dir = flipped ? 1 : -1
  return (
    <div
      className="desk"
      style={{
        left: x - 50,
        top: y - 100,
        transform: flipped ? 'scaleX(-1)' : 'none',
      }}
    >
      <div className="desk-monitor-stand" />
      <div className="desk-monitor" />
      <div className="desk-table" />
    </div>
  )
}

function MeetingTable() {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0 }}>
      {/* Chairs */}
      {MEETING_SEAT_POSITIONS.map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: pos.x - 14, top: pos.y - 14,
          width: 28, height: 28,
          background: 'linear-gradient(to bottom,#3d2b79,#2d1b69)',
          borderRadius: 4,
          border: '1px solid #5b3fa0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          zIndex: 1,
        }} />
      ))}
      {/* Table surface (on top of chairs visually) */}
      <div className="meeting-table" style={{ left: 600, top: 390, zIndex: 2 }}>
        <div className="meeting-table-top" />
      </div>
    </div>
  )
}

function CoffeeArea() {
  return (
    <div className="coffee-area" style={{ left: 80, top: 600 }}>
      <div className="coffee-rug" />
      <div className="coffee-machine" />
      <div className="coffee-counter" />
    </div>
  )
}

function AgentSprite({ agent, design }) {
  const [walkFrame, setWalkFrame] = useState(0)
  const [isWalking, setIsWalking] = useState(false)
  const prevPos = useRef({ x: agent.position[0], y: agent.position[2] })
  const walkTimer = useRef(null)
  const selectAgent = useAgentStore(s => s.selectAgent)
  const selectedId = useAgentStore(s => s.selectedAgentId)
  const managerId = useAgentStore(s => s.managerId)
  const activityBubble = useAgentStore(s => s.activityBubbles?.[agent.id])

  const targetX = agent.position[0]
  const targetY = agent.position[2]
  const isSeated = agent.state === 'meeting'
  const isManager = agent.id === managerId

  useEffect(() => {
    const moved = prevPos.current.x !== targetX || prevPos.current.y !== targetY
    if (moved) {
      setIsWalking(true)
      prevPos.current = { x: targetX, y: targetY }
      clearInterval(walkTimer.current)
      let frame = 0
      // Slower, more natural walk cadence
      walkTimer.current = setInterval(() => { frame++; setWalkFrame(frame) }, 380)
      const stop = setTimeout(() => {
        setIsWalking(false)
        clearInterval(walkTimer.current)
      }, 1400)
      return () => { clearTimeout(stop); clearInterval(walkTimer.current) }
    }
  }, [targetX, targetY])

  return (
    <div
      className="agent-character"
      style={{
        left: targetX - 25,
        top: isSeated ? targetY - 55 : targetY - 82,
        transition: 'left 1.4s cubic-bezier(0.4,0,0.2,1), top 1.4s cubic-bezier(0.4,0,0.2,1)',
      }}
      onClick={e => { e.stopPropagation(); selectAgent(agent.id) }}
    >
      {activityBubble && (
        <div className="activity-bubble">{activityBubble}</div>
      )}
      <div className="agent-nametag">
        <span className="agent-nametag-name">
          {isManager && <span style={{ marginRight: 3 }}>👑</span>}
          {agent.name}
        </span>
        <span className="agent-nametag-fn">{agent.fn}</span>
      </div>
      <div style={{ position: 'relative' }}>
        <div className="agent-state-dot" style={{ background: STATE_DOT_COLORS[agent.state] || '#666' }} />
        <Character
          design={design}
          isWalking={isWalking}
          walkFrame={walkFrame}
          selected={selectedId === agent.id}
          seated={isSeated}
        />
      </div>
    </div>
  )
}

export default function Office2D() {
  const agents = useAgentStore(s => s.agents)
  const containerRef = useRef()
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef(null)

  // Auto-fit office to screen
  useEffect(() => {
    const fit = () => {
      const scaleX = window.innerWidth / OFFICE_W
      const scaleY = window.innerHeight / OFFICE_H
      setScale(Math.min(scaleX, scaleY) * 0.95)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const onMouseDown = useCallback(e => {
    if (e.button !== 0) return
    setIsPanning(true)
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }, [pan])

  const onMouseMove = useCallback(e => {
    if (!isPanning || !panStart.current) return
    setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y })
  }, [isPanning])

  const onMouseUp = useCallback(() => setIsPanning(false), [])

  const zoom = delta => setScale(s => Math.min(2, Math.max(0.4, s + delta)))

  return (
    <div
      className="office-2d"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      {/* Zoom controls */}
      <div className="office-controls">
        <button className="office-zoom-btn" onClick={() => zoom(0.1)}>+</button>
        <button className="office-zoom-btn" onClick={() => zoom(-0.1)}>−</button>
        <button className="office-zoom-btn" onClick={() => { setScale(0.85); setPan({ x: 0, y: 0 }) }} title="Reset">⌂</button>
      </div>

      {/* Main office canvas */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          width: OFFICE_W,
          height: OFFICE_H,
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${scale})`,
          top: '50%', left: '50%',
          transformOrigin: 'center center',
        }}
      >
        {/* Floor */}
        <div className="office-floor" style={{ width: OFFICE_W, height: OFFICE_H }} />

        {/* Wall */}
        <div className="office-wall" style={{ width: OFFICE_W }}>
          {[200, 540, 860].map((left, i) => (
            <div key={i} className="office-window" style={{ left }} />
          ))}
        </div>

        {/* Area labels */}
        <div className="area-label" style={{ left: 650, top: 96 }}>Mesa de Reunião</div>
        <div className="area-label" style={{ left: 90, top: 578 }}>Café</div>

        {/* Desks */}
        {DESK_LAYOUT.map((pos, i) => (
          <Desk key={i} x={pos.x} y={pos.y} flipped={i >= 6} />
        ))}

        {/* Meeting table */}
        <MeetingTable />

        {/* Coffee area */}
        <CoffeeArea />

        {/* Agents */}
        {agents.map((agent, i) => (
          <AgentSprite
            key={agent.id}
            agent={agent}
            design={CHARACTER_DESIGNS[i]}
          />
        ))}
      </div>
    </div>
  )
}
