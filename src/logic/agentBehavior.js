import { MEETING_SEATS, COFFEE_SPOTS } from '../data/agents'

const TASK_DESCRIPTIONS = {
  working: [
    'Analisando componentes UI...',
    'Revisando código backend...',
    'Rodando testes automatizados...',
    'Verificando vulnerabilidades...',
    'Processando PDF do pedido...',
    'Gerando métricas do dashboard...',
    'Atualizando rotas de entrega...',
    'Monitorando logs do sistema...',
    'Revisando pull request...',
    'Otimizando queries do banco...',
    'Verificando autenticação...',
    'Processando pagamentos...',
  ],
  meeting: [
    'Alinhando estratégia com equipe...',
    'Revisando progresso do sprint...',
    'Discutindo arquitetura...',
  ],
}

const TRANSITIONS = {
  idle:    ['working', 'working', 'working', 'coffee'],
  working: ['working', 'done', 'meeting'],
  meeting: ['working', 'idle'],
  done:    ['coffee'],
  coffee:  ['idle', 'idle', 'working'],
}

let meetingSeatIndex = 0
let coffeeSeatIndex = 0

function pickNextState(currentState) {
  const options = TRANSITIONS[currentState]
  return options[Math.floor(Math.random() * options.length)]
}

function getPositionForState(state, agent, agentIndex) {
  switch (state) {
    case 'working':
    case 'idle':
    case 'done':
      return [...agent.deskPosition]
    case 'meeting':
      const seat = MEETING_SEATS[meetingSeatIndex % MEETING_SEATS.length]
      meetingSeatIndex++
      return [...seat]
    case 'coffee':
      const spot = COFFEE_SPOTS[agentIndex % COFFEE_SPOTS.length]
      return [...spot]
    default:
      return [...agent.deskPosition]
  }
}

function getTaskDescription(state, agentIndex) {
  const list = TASK_DESCRIPTIONS[state]
  if (!list) return ''
  return list[agentIndex % list.length]
}

export function startAgentBehavior(store) {
  const intervals = []

  store.getState().agents.forEach((agent, index) => {
    // Stagger start times so agents don't all move at once
    const initialDelay = index * 800 + Math.random() * 2000

    const startTimeout = setTimeout(() => {
      const tick = () => {
        const { agents, setAgentState } = store.getState()
        const current = agents.find(a => a.id === agent.id)
        if (!current) return

        const nextState = pickNextState(current.state)
        const nextPos = getPositionForState(nextState, current, index)
        const taskDesc = getTaskDescription(nextState, index)

        setAgentState(agent.id, nextState, nextPos, taskDesc)
      }

      tick() // immediate first tick after delay

      const interval = setInterval(tick, 4000 + Math.random() * 6000)
      intervals.push(interval)
    }, initialDelay)

    intervals.push(startTimeout)
  })

  // Cleanup function
  return () => intervals.forEach(i => { clearInterval(i); clearTimeout(i) })
}
