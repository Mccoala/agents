export const AGENT_DEFINITIONS = [
  { id: 1,  fn: 'Frontend / UI',        deskPosition: [-8, 0, -6] },
  { id: 2,  fn: 'Backend',              deskPosition: [-8, 0, -2] },
  { id: 3,  fn: 'QA / Bug Hunter',      deskPosition: [-8, 0,  2] },
  { id: 4,  fn: 'Security',             deskPosition: [-5, 0, -6] },
  { id: 5,  fn: 'Auth & Onboarding',    deskPosition: [-5, 0, -2] },
  { id: 6,  fn: 'Billing',              deskPosition: [-5, 0,  2] },
  { id: 7,  fn: 'AI / PDF Pipeline',    deskPosition: [  5, 0, -6] },
  { id: 8,  fn: 'Analytics / Dashboard',deskPosition: [  5, 0, -2] },
  { id: 9,  fn: 'Rotas / Mapa',         deskPosition: [  5, 0,  2] },
  { id: 10, fn: 'DevOps',               deskPosition: [  8, 0, -6] },
  { id: 11, fn: 'Revisor',              deskPosition: [  8, 0, -2] },
  { id: 12, fn: 'Monitor / Analista',   deskPosition: [  8, 0,  2] },
]

export const DEFAULT_NAMES = [
  'Frontend Agent', 'Backend Agent', 'QA Agent', 'Security Agent',
  'Auth Agent', 'Billing Agent', 'AI Agent', 'Analytics Agent',
  'Rotas Agent', 'DevOps Agent', 'Revisor Agent', 'Monitor Agent',
]

// Seats around the meeting table
export const MEETING_SEATS = [
  [-1.5, 0, -1.8], [0, 0, -1.8], [1.5, 0, -1.8],
  [-1.5, 0,  1.8], [0, 0,  1.8], [1.5, 0,  1.8],
  [-2.2, 0, 0],    [2.2, 0, 0],
]

// Coffee area spots
export const COFFEE_SPOTS = [
  [-9, 0, 7.2], [-8.5, 0, 7.8], [-9.5, 0, 7.8],
  [-10, 0, 7.2], [-8, 0, 7.4], [-10.5, 0, 7.5],
  [-9.2, 0, 6.8], [-8.8, 0, 8.0], [-9.8, 0, 6.9], [-8.3, 0, 7.2],
  [-10.2, 0, 7.0], [-9.5, 0, 8.1],
]
