import { DESK_LAYOUT, MEETING_SEAT_POSITIONS, COFFEE_SPOT_POSITIONS } from '../office2d/layout'

const p = ({ x, y }) => [x, 0, y]

export const AGENT_DEFINITIONS = [
  { id: 1,  fn: 'Frontend / UI',          deskPosition: p(DESK_LAYOUT[0])  },
  { id: 2,  fn: 'Backend',                deskPosition: p(DESK_LAYOUT[1])  },
  { id: 3,  fn: 'QA / Bug Hunter',        deskPosition: p(DESK_LAYOUT[2])  },
  { id: 4,  fn: 'Security',               deskPosition: p(DESK_LAYOUT[3])  },
  { id: 5,  fn: 'Auth & Onboarding',      deskPosition: p(DESK_LAYOUT[4])  },
  { id: 6,  fn: 'Billing',                deskPosition: p(DESK_LAYOUT[5])  },
  { id: 7,  fn: 'AI / PDF Pipeline',      deskPosition: p(DESK_LAYOUT[6])  },
  { id: 8,  fn: 'Analytics / Dashboard',  deskPosition: p(DESK_LAYOUT[7])  },
  { id: 9,  fn: 'Rotas / Mapa',           deskPosition: p(DESK_LAYOUT[8])  },
  { id: 10, fn: 'DevOps',                 deskPosition: p(DESK_LAYOUT[9])  },
  { id: 11, fn: 'Revisor',                deskPosition: p(DESK_LAYOUT[10]) },
  { id: 12, fn: 'Monitor / Analista',     deskPosition: p(DESK_LAYOUT[11]) },
]

export const DEFAULT_NAMES = [
  'Alex', 'Bruno', 'Carla', 'Diego',
  'Elena', 'Felipe', 'Gabi', 'Hugo',
  'Iris', 'João', 'Kira', 'Leo',
]

export const MEETING_SEATS = MEETING_SEAT_POSITIONS.map(p)
export const COFFEE_SPOTS  = COFFEE_SPOT_POSITIONS.map(p)
