import useAgentStore from '../store/useAgentStore'
import AgentMesh from './AgentMesh'

export default function AllAgents() {
  const agents = useAgentStore(s => s.agents)
  return (
    <>
      {agents.map(agent => (
        <AgentMesh key={agent.id} agent={agent} />
      ))}
    </>
  )
}
