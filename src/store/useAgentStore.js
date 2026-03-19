import { create } from 'zustand'
import { AGENT_DEFINITIONS, DEFAULT_NAMES } from '../data/agents'

const buildInitialAgents = () =>
  AGENT_DEFINITIONS.map((def, i) => ({
    id: def.id,
    name: DEFAULT_NAMES[i],
    fn: def.fn,
    state: 'idle',
    deskPosition: def.deskPosition,
    position: [...def.deskPosition],
    taskProgress: 0,
    taskDescription: '',
  }))

const useAgentStore = create((set, get) => ({
  agents: buildInitialAgents(),
  selectedAgentId: null,

  setAgentState: (id, state, position, taskDescription = '') =>
    set(s => ({
      agents: s.agents.map(a =>
        a.id === id
          ? { ...a, state, position: position || a.position, taskDescription, taskProgress: state === 'working' ? Math.floor(Math.random() * 80) + 10 : state === 'done' ? 100 : a.taskProgress }
          : a
      ),
    })),

  setAgentPosition: (id, position) =>
    set(s => ({
      agents: s.agents.map(a => (a.id === id ? { ...a, position } : a)),
    })),

  setTaskProgress: (id, taskProgress) =>
    set(s => ({
      agents: s.agents.map(a => (a.id === id ? { ...a, taskProgress } : a)),
    })),

  selectAgent: (id) => set({ selectedAgentId: id }),
  deselectAgent: () => set({ selectedAgentId: null }),

  renameAgent: (id, name) =>
    set(s => ({
      agents: s.agents.map(a => (a.id === id ? { ...a, name } : a)),
    })),
}))

export default useAgentStore
