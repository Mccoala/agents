import { create } from 'zustand'
import { AGENT_DEFINITIONS, DEFAULT_NAMES, MEETING_SEATS } from '../data/agents'

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
    locked: false,
    lastRealActivity: 0,  // timestamp of last SSE-driven activity
  }))

const useAgentStore = create((set, get) => ({
  agents: buildInitialAgents(),
  selectedAgentId: null,

  // Manager
  managerId: 1, // default: primeiro agente é gerente
  setManager: (id) => set({ managerId: id }),

  // HUD
  hudVisible: true,
  toggleHud: () => set(s => ({ hudVisible: !s.hudVisible })),

  // Meeting
  userMeetingActive: false,
  userMeetingAgentIds: [],
  conversationId: null,
  meetingChatLog: [],
  meetingModalOpen: false,
  openMeetingModal: () => set({ meetingModalOpen: true }),
  closeMeetingModal: () => set({ meetingModalOpen: false }),

  startUserMeeting: (agentIds, conversationId = null) => {
    set(s => ({
      meetingModalOpen: false,
      userMeetingActive: true,
      userMeetingAgentIds: agentIds,
      conversationId,
      meetingChatLog: [{
        sender: 'Sistema',
        text: `Reunião iniciada com ${agentIds.length} agente(s).`,
        time: now(), isSystem: true
      }],
      agents: s.agents.map((a) => {
        if (!agentIds.includes(a.id)) return a
        const seatIdx = agentIds.indexOf(a.id)
        const seat = MEETING_SEATS[seatIdx % MEETING_SEATS.length]
        return { ...a, state: 'meeting', position: seat, locked: true }
      }),
    }))
  },

  // Add agent to ongoing meeting
  addAgentToMeeting: (agentId) => {
    set(s => {
      const alreadyIn = s.userMeetingAgentIds.includes(agentId)
      if (alreadyIn) return s
      const newIds = [...s.userMeetingAgentIds, agentId]
      const seatIdx = newIds.length - 1
      const seat = MEETING_SEATS[seatIdx % MEETING_SEATS.length]
      return {
        userMeetingAgentIds: newIds,
        meetingChatLog: [...s.meetingChatLog, {
          sender: 'Sistema',
          text: `${s.agents.find(a => a.id === agentId)?.name} entrou na reunião.`,
          time: now(), isSystem: true,
        }],
        agents: s.agents.map(a =>
          a.id === agentId
            ? { ...a, state: 'meeting', position: seat, locked: true }
            : a
        ),
      }
    })
  },

  endUserMeeting: () => {
    set(s => ({
      userMeetingActive: false,
      userMeetingAgentIds: [],
      conversationId: null,
      agents: s.agents.map(a => ({
        ...a,
        locked: false,
        state: a.locked ? 'idle' : a.state,
        position: a.locked ? a.deskPosition : a.position,
      })),
    }))
  },

  addMeetingMessage: (sender, text, isSystem = false) =>
    set(s => ({
      meetingChatLog: [...s.meetingChatLog, { sender, text, time: now(), isSystem }],
    })),

  // Activity bubbles — show tool/action above character head (pixel-agents style)
  activityBubbles: {},
  setActivityBubble: (id, text) => {
    set(s => ({ activityBubbles: { ...s.activityBubbles, [id]: text } }))
    setTimeout(() => {
      set(s => {
        const b = { ...s.activityBubbles }
        delete b[id]
        return { activityBubbles: b }
      })
    }, 4500)
  },

  // Mark agent as having real SSE activity (suppresses fake behavior loop)
  setAgentRealActivity: (id, state, position, taskDescription = '') =>
    set(s => ({
      agents: s.agents.map(a => {
        if (a.id !== id || a.locked) return a
        return {
          ...a, state, position: position || a.position, taskDescription,
          lastRealActivity: Date.now(),
          taskProgress: state === 'working' ? Math.floor(Math.random() * 80) + 10
                      : state === 'done'    ? 100
                      : a.taskProgress,
        }
      }),
    })),

  // Agent-to-agent log
  agentMeetingLog: [],
  watchingAgentMeeting: false,
  addAgentMeetingLog: (msg) =>
    set(s => ({ agentMeetingLog: [...s.agentMeetingLog.slice(-50), msg] })),
  toggleWatchAgentMeeting: () =>
    set(s => ({ watchingAgentMeeting: !s.watchingAgentMeeting })),

  setAgentState: (id, state, position, taskDescription = '') =>
    set(s => ({
      agents: s.agents.map(a => {
        if (a.id !== id || a.locked) return a
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
