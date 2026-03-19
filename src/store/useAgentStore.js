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
    locked: false, // locked = em reunião com usuário, não pode ser interrompido
  }))

const useAgentStore = create((set, get) => ({
  agents: buildInitialAgents(),
  selectedAgentId: null,

  // HUD visibility
  hudVisible: true,
  toggleHud: () => set(s => ({ hudVisible: !s.hudVisible })),

  // Meeting state
  userMeetingActive: false,       // usuário está em reunião
  userMeetingAgentIds: [],        // agentes convocados pelo usuário
  meetingChatLog: [],             // chat da reunião do usuário

  // Agent-to-agent meetings chat log (para acompanhar)
  agentMeetingLog: [],
  watchingAgentMeeting: false,

  // Open/close meeting modal
  meetingModalOpen: false,
  openMeetingModal: () => set({ meetingModalOpen: true }),
  closeMeetingModal: () => set({ meetingModalOpen: false }),

  // Start user meeting with selected agents
  startUserMeeting: (agentIds) => {
    const { agents } = get()
    const seats = [
      [-1.2, 0, -1.6], [0, 0, -1.6], [1.2, 0, -1.6],
      [-1.2, 0, 1.6],  [0, 0, 1.6],  [1.2, 0, 1.6],
      [-2.0, 0, 0],    [2.0, 0, 0],
    ]
    set(s => ({
      meetingModalOpen: false,
      userMeetingActive: true,
      userMeetingAgentIds: agentIds,
      meetingChatLog: [
        { sender: 'Sistema', text: `Reunião iniciada com ${agentIds.length} agente(s).`, time: now(), isSystem: true }
      ],
      agents: s.agents.map((a, i) => {
        if (agentIds.includes(a.id)) {
          const seat = seats[agentIds.indexOf(a.id) % seats.length]
          return { ...a, state: 'meeting', position: seat, locked: true }
        }
        return a
      }),
    }))
  },

  endUserMeeting: () => {
    set(s => ({
      userMeetingActive: false,
      userMeetingAgentIds: [],
      agents: s.agents.map(a => ({ ...a, locked: false, state: a.locked ? 'idle' : a.state, position: a.locked ? a.deskPosition : a.position })),
    }))
  },

  addMeetingMessage: (sender, text) =>
    set(s => ({
      meetingChatLog: [...s.meetingChatLog, { sender, text, time: now(), isSystem: false }],
    })),

  // Agent-to-agent meeting log
  addAgentMeetingLog: (msg) =>
    set(s => ({ agentMeetingLog: [...s.agentMeetingLog.slice(-50), msg] })),
  toggleWatchAgentMeeting: () => set(s => ({ watchingAgentMeeting: !s.watchingAgentMeeting })),

  setAgentState: (id, state, position, taskDescription = '') =>
    set(s => ({
      agents: s.agents.map(a => {
        if (a.id !== id) return a
        if (a.locked) return a // não muda agente em reunião com usuário
        return {
          ...a, state, position: position || a.position, taskDescription,
          taskProgress: state === 'working' ? Math.floor(Math.random() * 80) + 10
                      : state === 'done'    ? 100
                      : a.taskProgress,
        }
      }),
    })),

  setAgentPosition: (id, position) =>
    set(s => ({ agents: s.agents.map(a => (a.id === id && !a.locked ? { ...a, position } : a)) })),

  selectAgent: (id) => set({ selectedAgentId: id }),
  deselectAgent: () => set({ selectedAgentId: null }),

  renameAgent: (id, name) =>
    set(s => ({ agents: s.agents.map(a => (a.id === id ? { ...a, name } : a)) })),
}))

function now() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default useAgentStore
