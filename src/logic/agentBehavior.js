import { MEETING_SEATS, COFFEE_SPOTS } from '../data/agents'

const TASK_DESCRIPTIONS = [
  'Analisando componentes UI...', 'Revisando código backend...',
  'Rodando testes automatizados...', 'Verificando vulnerabilidades...',
  'Processando extração do PDF...', 'Atualizando métricas do dashboard...',
  'Atualizando rotas de entrega...', 'Monitorando logs do sistema...',
  'Revisando pull request...', 'Otimizando queries do banco...',
  'Verificando fluxo de autenticação...', 'Processando cobranças pendentes...',
]

const MEETING_MESSAGES = [
  ['Encontrei um possível bug no módulo de rotas.', 'Deixa eu ver... confirmo o problema.'],
  ['Precisamos melhorar a extração do PDF.', 'Concordo. O prompt precisa de ajuste.'],
  ['A interface do dashboard está lenta.', 'Vou otimizar as queries e ver o que encontro.'],
  ['Segurança: senhas ainda estão em plaintext.', 'Prioridade máxima. Vou criar a tarefa.'],
  ['Deploy falhando no CI/CD.', 'Já vi o log. É uma variável de ambiente faltando.'],
  ['Usuários reclamando do tempo de resposta.', 'Confirmo — o backend está sobrecarregado.'],
]

const TRANSITIONS = {
  idle:    ['working', 'working', 'coffee'],
  working: ['working', 'done', 'meeting'],
  meeting: ['working', 'idle'],
  done:    ['coffee'],
  coffee:  ['idle', 'working'],
}

let meetingSeatIdx = 0

function pickNextState(state) {
  const opts = TRANSITIONS[state]
  return opts[Math.floor(Math.random() * opts.length)]
}

function getPositionForState(state, agent, idx) {
  if (state === 'meeting') {
    const seat = MEETING_SEATS[meetingSeatIdx % MEETING_SEATS.length]
    meetingSeatIdx++
    return [...seat]
  }
  if (state === 'coffee') return [...COFFEE_SPOTS[idx % COFFEE_SPOTS.length]]
  return [...agent.deskPosition]
}

export function startAgentBehavior(store) {
  const handles = []

  store.getState().agents.forEach((agent, idx) => {
    const initialDelay = idx * 900 + Math.random() * 2000

    const t0 = setTimeout(() => {
      const tick = () => {
        const { agents, setAgentState, addAgentMeetingLog } = store.getState()
        const current = agents.find(a => a.id === agent.id)
        if (!current || current.locked) return // respeita reunião com usuário

        const next = pickNextState(current.state)
        const pos  = getPositionForState(next, current, idx)
        const desc = next === 'working' ? TASK_DESCRIPTIONS[idx % TASK_DESCRIPTIONS.length] : ''

        setAgentState(agent.id, next, pos, desc)

        // Log se foi para reunião (entre agentes)
        if (next === 'meeting') {
          const pair = MEETING_MESSAGES[idx % MEETING_MESSAGES.length]
          const t = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          addAgentMeetingLog({ sender: current.name, text: pair[0], time: t, isSystem: false })
          setTimeout(() => {
            const { agents: ag, addAgentMeetingLog: log } = store.getState()
            const other = ag.find(a => a.id !== agent.id && a.state === 'meeting' && !a.locked)
            if (other) {
              const t2 = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              log({ sender: other.name, text: pair[1], time: t2, isSystem: false })
            }
          }, 1800)
        }
      }

      tick()
      const interval = setInterval(tick, 5000 + Math.random() * 7000)
      handles.push(interval)
    }, initialDelay)

    handles.push(t0)
  })

  return () => handles.forEach(h => { clearInterval(h); clearTimeout(h) })
}
