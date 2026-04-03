import { subDays, format } from 'date-fns'
import type { User, Employee, Event, Survey, EventCategory, Criticality, Shift } from '../types'
import { dbPut, dbGet } from './db'

const uid = () => Math.random().toString(36).substring(2, 10)

export const DEMO_USERS: User[] = [
  {
    id: 'user-001',
    matricula: 'ADM001',
    name: 'Carlos Administrador',
    role: 'admin',
    sector: 'Diretoria',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-002',
    matricula: 'SUP001',
    name: 'Ana Supervisora',
    role: 'supervisor',
    sector: 'Operações Portuárias',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-003',
    matricula: 'OPR001',
    name: 'João Operador',
    role: 'operador',
    sector: 'Terminal de Contêineres',
    createdAt: new Date().toISOString(),
  },
]

export const DEMO_CREDENTIALS: Record<string, string> = {
  ADM001: 'admin2026',
  SUP001: 'porto2026',
  OPR001: 'op2026',
}

const sectors = [
  'Terminal de Contêineres',
  'Terminal de Granel',
  'Operações Portuárias',
  'Segurança',
  'Manutenção',
  'Logística',
  'Administração',
]

const roles = [
  'Operador de Guindaste',
  'Estivador',
  'Técnico de Segurança',
  'Conferente',
  'Motorista de Empilhadeira',
  'Supervisor de Pátio',
  'Analista Logístico',
  'Auxiliar de Operações',
]

const shifts: Shift[] = ['manhã', 'tarde', 'noite', 'dia']

const employeeNames = [
  'Pedro Almeida', 'Maria Santos', 'João Silva', 'Ana Costa', 'Carlos Ferreira',
  'Fernanda Lima', 'Roberto Gomes', 'Patrícia Rocha', 'Diego Martins', 'Luciana Carvalho',
  'Marcos Souza', 'Juliana Pereira', 'Rafael Barbosa', 'Camila Oliveira', 'André Nascimento',
]

export const DEMO_EMPLOYEES: Employee[] = employeeNames.map((name, i) => ({
  id: `emp-${String(i + 1).padStart(3, '0')}`,
  name,
  matricula: `COL${String(i + 1).padStart(3, '0')}`,
  sector: sectors[i % sectors.length],
  role: roles[i % roles.length],
  shift: shifts[i % shifts.length],
  contact: `(13) 9${String(Math.floor(Math.random() * 90000000 + 10000000))}`,
  active: true,
  createdAt: subDays(new Date(), 180 + i * 10).toISOString(),
}))

const categories: EventCategory[] = [
  'Segurança do Trabalho', 'DDS', 'Quase-acidente', 'Comportamento Seguro',
  'Não-conformidade', 'Desempenho Operacional', 'Embarque/Desembarque',
  'Movimentação de Carga', 'Produtividade', 'Qualidade',
]

const criticalities: Criticality[] = ['baixo', 'médio', 'alto', 'crítico']

const eventDescriptions = [
  'Colaborador utilizou EPI corretamente durante toda a operação.',
  'Participou ativamente do DDS matinal com contribuições relevantes.',
  'Quase-acidente reportado na área de desembarque — sem lesões.',
  'Excelente desempenho na movimentação de contêineres durante o turno.',
  'Não-conformidade identificada no procedimento de içamento.',
  'Operação de embarque concluída antes do prazo previsto.',
  'Guindaste operado com segurança e precisão exemplar.',
  'Colaborador identificou risco potencial e comunicou imediatamente.',
  'Produtividade acima da meta em 15% no turno da manhã.',
  'Comportamento exemplar durante situação de emergência simulada.',
  'Atraso no processo de conferência de carga — investigado.',
  'Treinamento de reciclagem concluído com aprovação máxima.',
  'Feedback positivo do cliente sobre atendimento da equipe.',
  'Ocorrência de equipamento — manutenção preventiva solicitada.',
  'Assiduidade perfeita no mês — reconhecimento registrado.',
]

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateDemoEvents(): Event[] {
  const events: Event[] = []
  const now = new Date()

  for (let i = 0; i < 50; i++) {
    const daysAgo = randomBetween(0, 30)
    const date = subDays(now, daysAgo)
    const employee = DEMO_EMPLOYEES[i % DEMO_EMPLOYEES.length]
    const category = categories[i % categories.length]
    const criticality = criticalities[i % criticalities.length]
    const score = randomBetween(3, 10)
    const hasFeedback = i % 3 !== 0

    events.push({
      id: `evt-${String(i + 1).padStart(3, '0')}`,
      employeeId: employee.id,
      employeeName: employee.name,
      sector: employee.sector,
      role: employee.role,
      category,
      description: eventDescriptions[i % eventDescriptions.length],
      score,
      date: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      shift: employee.shift,
      location: 'Terminal de Contêineres — Berço 3',
      criticality,
      status: hasFeedback ? 'encerrado' : (criticality === 'crítico' ? 'aberto' : 'em_acompanhamento'),
      hasFeedback,
      feedback: hasFeedback ? {
        id: `fb-${i}`,
        text: `Feedback registrado: situação avaliada e acompanhamento realizado com o colaborador ${employee.name}.`,
        date: format(subDays(date, -1), "yyyy-MM-dd'T'HH:mm:ss"),
        responsibleId: 'user-002',
        responsibleName: 'Ana Supervisora',
      } : undefined,
      tags: [category.toLowerCase()],
      registeredById: 'user-002',
      registeredByName: 'Ana Supervisora',
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    })
  }

  return events
}

export const DEMO_SURVEYS: Survey[] = [
  {
    id: 'survey-001',
    title: 'Pesquisa de Clima — Q1 2026',
    description: 'Avaliação do clima organizacional e condições de trabalho',
    active: true,
    questions: [
      {
        id: 'q1',
        text: 'Como você avalia as condições de segurança no trabalho?',
        type: 'scale',
        required: true,
      },
      {
        id: 'q2',
        text: 'Você se sente reconhecido pelo seu trabalho?',
        type: 'yesno',
        required: true,
      },
      {
        id: 'q3',
        text: 'Qual área você acredita que precisa de mais atenção?',
        type: 'multiple',
        options: ['Segurança', 'Comunicação', 'Equipamentos', 'Treinamento', 'Liderança'],
        required: false,
      },
      {
        id: 'q4',
        text: 'Sugestões de melhoria:',
        type: 'text',
        required: false,
      },
    ],
    responses: [
      {
        id: 'r1',
        surveyId: 'survey-001',
        respondentName: 'Anônimo',
        answers: { q1: 4, q2: 'sim', q3: 'Equipamentos', q4: 'Mais treinamentos de segurança.' },
        submittedAt: subDays(new Date(), 5).toISOString(),
      },
      {
        id: 'r2',
        surveyId: 'survey-001',
        respondentName: 'Anônimo',
        answers: { q1: 3, q2: 'não', q3: 'Comunicação', q4: '' },
        submittedAt: subDays(new Date(), 3).toISOString(),
      },
      {
        id: 'r3',
        surveyId: 'survey-001',
        respondentName: 'Anônimo',
        answers: { q1: 5, q2: 'sim', q3: 'Liderança', q4: 'Excelente ambiente de trabalho.' },
        submittedAt: subDays(new Date(), 1).toISOString(),
      },
    ],
    createdById: 'user-001',
    createdAt: subDays(new Date(), 10).toISOString(),
  },
  {
    id: 'survey-002',
    title: 'NPS Interno — Satisfação da Equipe',
    description: 'Net Promoter Score interno para medir satisfação dos colaboradores',
    active: false,
    questions: [
      {
        id: 'q1',
        text: 'Em uma escala de 1 a 5, o quanto você indicaria nossa empresa para trabalhar?',
        type: 'scale',
        required: true,
      },
      {
        id: 'q2',
        text: 'O que mais te motiva no trabalho?',
        type: 'text',
        required: false,
      },
    ],
    responses: [
      {
        id: 'r4',
        surveyId: 'survey-002',
        respondentName: 'Anônimo',
        answers: { q1: 5, q2: 'Equipe unida e bons salários.' },
        submittedAt: subDays(new Date(), 15).toISOString(),
      },
    ],
    createdById: 'user-001',
    createdAt: subDays(new Date(), 20).toISOString(),
  },
]

export async function seedDemoData() {
  // Check if already seeded
  const existing = await dbGet<User>('users', 'user-001')
  if (existing) return

  // Users
  for (const user of DEMO_USERS) {
    await dbPut('users', user)
  }

  // Employees
  for (const emp of DEMO_EMPLOYEES) {
    await dbPut('employees', emp)
  }

  // Events
  const events = generateDemoEvents()
  for (const evt of events) {
    await dbPut('events', evt)
  }

  // Surveys
  for (const survey of DEMO_SURVEYS) {
    await dbPut('surveys', survey)
  }
}
