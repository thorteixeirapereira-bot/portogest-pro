// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'supervisor' | 'operador'

export interface User {
  id: string
  matricula: string
  name: string
  role: UserRole
  sector: string
  avatarUrl?: string
  createdAt: string
}

// ─── Employees ───────────────────────────────────────────────────────────────

export type Shift = 'manhã' | 'tarde' | 'noite' | 'dia'

export interface Employee {
  id: string
  name: string
  matricula: string
  sector: string
  role: string
  shift: Shift
  contact?: string
  avatarUrl?: string
  active: boolean
  createdAt: string
}

// ─── Events ──────────────────────────────────────────────────────────────────

export type EventCategory =
  // Portuário
  | 'Segurança do Trabalho'
  | 'DDS'
  | 'Quase-acidente'
  | 'Comportamento Seguro'
  | 'Não-conformidade'
  | 'Desempenho Operacional'
  | 'Embarque/Desembarque'
  | 'Movimentação de Carga'
  // Genérico
  | 'Produtividade'
  | 'Assiduidade'
  | 'Qualidade'
  | 'Comportamento'
  | 'Treinamento'
  | 'Feedback Positivo'
  | 'Ocorrência'

export type Criticality = 'baixo' | 'médio' | 'alto' | 'crítico'
export type EventStatus = 'aberto' | 'em_acompanhamento' | 'encerrado'

export interface EventFeedback {
  id: string
  text: string
  date: string
  responsibleId: string
  responsibleName: string
}

export interface Event {
  id: string
  employeeId: string
  employeeName: string
  sector: string
  role: string
  category: EventCategory
  subcategory?: string
  description: string
  score: number
  date: string
  shift: Shift
  location?: string
  criticality: Criticality
  status: EventStatus
  tags?: string[]
  feedback?: EventFeedback
  hasFeedback: boolean
  registeredById: string
  registeredByName: string
  createdAt: string
  updatedAt: string
}

// ─── Surveys ─────────────────────────────────────────────────────────────────

export type QuestionType = 'scale' | 'yesno' | 'text' | 'multiple'

export interface SurveyQuestion {
  id: string
  text: string
  type: QuestionType
  options?: string[]
  required: boolean
}

export interface SurveyResponse {
  id: string
  surveyId: string
  respondentName?: string
  answers: Record<string, string | number>
  submittedAt: string
}

export interface Survey {
  id: string
  title: string
  description?: string
  questions: SurveyQuestion[]
  active: boolean
  qrCode?: string
  responses: SurveyResponse[]
  createdById: string
  createdAt: string
}

// ─── Psychological Tests ─────────────────────────────────────────────────────

export type PsychTestType = 'disc' | 'bigfive' | 'vac' | 'ikigai' | 'ie'

export interface PsychTestResult {
  id: string
  employeeId: string
  employeeName: string
  testType: PsychTestType
  scores: Record<string, number>
  completedAt: string
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light'
export type DateFilter = 'hoje' | 'semana' | 'mês' | 'personalizado'

export interface DateRange {
  start: string
  end: string
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface KPI {
  label: string
  value: number | string
  change?: number
  changeLabel?: string
  icon: string
  color: string
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}
