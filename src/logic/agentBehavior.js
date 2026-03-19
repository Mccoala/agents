import { COFFEE_SPOTS } from '../data/agents'

// Visual-only behavior — agents stay at desk when working
// Real autonomous work happens in the backend

export function startAgentBehavior(store) {
  const handles = []

  store.getState().agents.forEach((agent, idx) => {
    // Stagger start: each agent starts at a different time
    const initialDelay = idx * 2000 + Math.random() * 3000

    const t0 = setTimeout(() => {
      const tick = () => {
        const { agents, setAgentState } = store.getState()
        const current = agents.find(a => a.id === agent.id)
        if (!current || current.locked) return

        const next = pickNext(current.state, idx)
        const pos  = posForState(next, current, idx)
        setAgentState(agent.id, next, pos, '')
      }

      tick()
      // Slow interval: 12-20 seconds between state changes
      const interval = setInterval(tick, 12000 + Math.random() * 8000)
      handles.push(interval)
    }, initialDelay)

    handles.push(t0)
  })

  return () => handles.forEach(h => { clearInterval(h); clearTimeout(h) })
}

const TRANSITIONS = {
  idle:    ['working', 'working', 'working', 'coffee'],
  working: ['working', 'working', 'done'],      // mostly stays working
  done:    ['coffee'],
  coffee:  ['idle', 'working'],
  meeting: ['working'],
}

function pickNext(state, idx) {
  const opts = TRANSITIONS[state] || ['idle']
  return opts[Math.floor(Math.random() * opts.length)]
}

function posForState(state, agent, idx) {
  // Working or idle → stay at desk
  if (state === 'working' || state === 'idle' || state === 'done') {
    return [...agent.deskPosition]
  }
  if (state === 'coffee') {
    return [...COFFEE_SPOTS[idx % COFFEE_SPOTS.length]]
  }
  return [...agent.deskPosition]
}
