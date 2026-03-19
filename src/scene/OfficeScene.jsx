import { AGENT_DEFINITIONS } from '../data/agents'
import Office from './Office'
import Desk from './Desk'
import MeetingTable from './MeetingTable'
import CoffeeArea from './CoffeeArea'
import AllAgents from '../agents/AllAgents'

export default function OfficeScene() {
  return (
    <group>
      <Office />
      <MeetingTable />
      <CoffeeArea />

      {/* Left bank of desks (facing right) */}
      {AGENT_DEFINITIONS.slice(0, 6).map(def => (
        <Desk key={def.id} position={def.deskPosition} flipped={false} />
      ))}

      {/* Right bank of desks (facing left) */}
      {AGENT_DEFINITIONS.slice(6, 12).map(def => (
        <Desk key={def.id} position={def.deskPosition} flipped={true} />
      ))}

      <AllAgents />
    </group>
  )
}
