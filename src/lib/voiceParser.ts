import type { EventCategory, Criticality, Shift } from '../types'

export interface ParsedVoiceCommand {
  action?: 'registrar_evento' | 'novo_colaborador' | 'abrir_dashboard' | 'pesquisa' | 'relatorio'
  employeeName?: string
  category?: EventCategory
  score?: number
  shift?: Shift
  criticality?: Criticality
  description?: string
  location?: string
}

const categoryMap: Record<string, EventCategory> = {
  'segurança': 'Segurança do Trabalho',
  'segurança do trabalho': 'Segurança do Trabalho',
  'dds': 'DDS',
  'diálogo de segurança': 'DDS',
  'dialogo de segurança': 'DDS',
  'quase acidente': 'Quase-acidente',
  'quase-acidente': 'Quase-acidente',
  'comportamento seguro': 'Comportamento Seguro',
  'comportamento': 'Comportamento',
  'não conformidade': 'Não-conformidade',
  'nao conformidade': 'Não-conformidade',
  'desempenho': 'Desempenho Operacional',
  'desempenho operacional': 'Desempenho Operacional',
  'embarque': 'Embarque/Desembarque',
  'desembarque': 'Embarque/Desembarque',
  'movimentação de carga': 'Movimentação de Carga',
  'movimentacao de carga': 'Movimentação de Carga',
  'produtividade': 'Produtividade',
  'assiduidade': 'Assiduidade',
  'qualidade': 'Qualidade',
  'treinamento': 'Treinamento',
  'feedback positivo': 'Feedback Positivo',
  'ocorrência': 'Ocorrência',
  'ocorrencia': 'Ocorrência',
}

const criticalityMap: Record<string, Criticality> = {
  'baixo': 'baixo',
  'baixa': 'baixo',
  'médio': 'médio',
  'medio': 'médio',
  'média': 'médio',
  'alto': 'alto',
  'alta': 'alto',
  'crítico': 'crítico',
  'critico': 'crítico',
  'crítica': 'crítico',
  'critica': 'crítico',
}

const shiftMap: Record<string, Shift> = {
  'manhã': 'manhã',
  'manha': 'manhã',
  'tarde': 'tarde',
  'noite': 'noite',
  'dia': 'dia',
}

export function parseVoiceInput(text: string): ParsedVoiceCommand {
  const lower = text.toLowerCase().trim()
  const result: ParsedVoiceCommand = {}

  // Action detection
  if (lower.includes('registrar evento') || lower.includes('novo evento') || lower.includes('registrar ocorrência')) {
    result.action = 'registrar_evento'
  } else if (lower.includes('novo colaborador') || lower.includes('cadastrar colaborador')) {
    result.action = 'novo_colaborador'
  } else if (lower.includes('dashboard') || lower.includes('painel')) {
    result.action = 'abrir_dashboard'
  } else if (lower.includes('pesquisa')) {
    result.action = 'pesquisa'
  } else if (lower.includes('relatório') || lower.includes('relatorio')) {
    result.action = 'relatorio'
  }

  // Score
  const scoreMatch = lower.match(/pontuação\s+(\d+)|nota\s+(\d+)|score\s+(\d+)/)
  if (scoreMatch) {
    const score = parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3])
    if (score >= 1 && score <= 10) result.score = score
  }

  // Inline score: "colaborador [nome] pontuação [n]"
  const inlineScore = lower.match(/(?:^|\s)(\d{1,2})\s*(?:pontos|ponto)/)
  if (inlineScore && !result.score) {
    const score = parseInt(inlineScore[1])
    if (score >= 1 && score <= 10) result.score = score
  }

  // Category
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lower.includes(key)) {
      result.category = value
      break
    }
  }

  // Category keyword: "categoria [name]"
  const catMatch = lower.match(/categoria\s+(.+?)(?:\s+(?:pontuação|nota|turno|crítico|crítica|colaborador)|$)/)
  if (catMatch) {
    const catText = catMatch[1].trim()
    for (const [key, value] of Object.entries(categoryMap)) {
      if (catText.includes(key)) {
        result.category = value
        break
      }
    }
  }

  // Criticality
  for (const [key, value] of Object.entries(criticalityMap)) {
    if (lower.includes(`criticidade ${key}`) || lower.includes(`nível ${key}`)) {
      result.criticality = value
      break
    }
  }

  // Shift
  for (const [key, value] of Object.entries(shiftMap)) {
    if (lower.includes(`turno ${key}`) || lower.includes(`turno de ${key}`)) {
      result.shift = value
      break
    }
  }

  // Employee name: "colaborador [Nome Sobrenome]"
  const empMatch = lower.match(/colaborador\s+([a-záàâãéèêíïóôõöúùûüçñ\s]+?)(?:\s+(?:categoria|pontuação|nota|turno|setor)|$)/i)
  if (empMatch) {
    result.employeeName = empMatch[1].trim()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  // Description fallback — use full text if no specific fields
  if (!result.description && text.length > 5) {
    result.description = text
  }

  return result
}
