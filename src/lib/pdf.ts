import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Event, Employee } from '../types'

const NAVY = [15, 23, 42] as [number, number, number]
const BLUE = [37, 99, 235] as [number, number, number]
const AMBER = [245, 158, 11] as [number, number, number]
const WHITE = [255, 255, 255] as [number, number, number]
const GRAY = [100, 116, 139] as [number, number, number]
const LIGHT_GRAY = [241, 245, 249] as [number, number, number]

function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  // Background header
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, 210, 35, 'F')

  // Accent line
  doc.setFillColor(...BLUE)
  doc.rect(0, 33, 210, 2, 'F')

  // Title
  doc.setTextColor(...WHITE)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('PortoGest Pro', 14, 15)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 14, 24)

  if (subtitle) {
    doc.setFontSize(9)
    doc.setTextColor(148, 163, 184)
    doc.text(subtitle, 14, 31)
  }

  // Date
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 196, 15, { align: 'right' })
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...LIGHT_GRAY)
    doc.rect(0, 285, 210, 12, 'F')
    doc.setTextColor(...GRAY)
    doc.setFontSize(8)
    doc.text('PortoGest Pro — Sistema de Gestão de Colaboradores', 14, 292)
    doc.text(`Página ${i} de ${pageCount}`, 196, 292, { align: 'right' })
  }
}

function criticalityLabel(c: string) {
  const map: Record<string, string> = {
    baixo: 'Baixo', médio: 'Médio', alto: 'Alto', crítico: 'Crítico',
  }
  return map[c] || c
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    aberto: 'Aberto', em_acompanhamento: 'Em Acompanhamento', encerrado: 'Encerrado',
  }
  return map[s] || s
}

export function exportGeneralReport(events: Event[], dateRange?: string) {
  const doc = new jsPDF()
  addHeader(doc, 'Relatório Geral de Eventos', dateRange)

  // Summary stats
  const total = events.length
  const avgScore = events.length ? (events.reduce((a, b) => a + b.score, 0) / events.length).toFixed(1) : '0'
  const pending = events.filter(e => !e.hasFeedback).length
  const critical = events.filter(e => e.criticality === 'crítico').length

  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Executivo', 14, 45)

  const stats = [
    ['Total de Eventos', String(total)],
    ['Pontuação Média', avgScore],
    ['Feedbacks Pendentes', String(pending)],
    ['Eventos Críticos', String(critical)],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  stats.forEach(([label, value], i) => {
    const x = 14 + (i % 2) * 90
    const y = 55 + Math.floor(i / 2) * 10
    doc.setTextColor(...GRAY)
    doc.text(label + ':', x, y)
    doc.setTextColor(...NAVY)
    doc.setFont('helvetica', 'bold')
    doc.text(value, x + 50, y)
    doc.setFont('helvetica', 'normal')
  })

  // Table
  autoTable(doc, {
    startY: 82,
    head: [['Data', 'Colaborador', 'Setor', 'Categoria', 'Pontuação', 'Criticidade', 'Status']],
    body: events.map(e => [
      format(new Date(e.date), 'dd/MM/yy HH:mm'),
      e.employeeName,
      e.sector,
      e.category,
      String(e.score),
      criticalityLabel(e.criticality),
      statusLabel(e.status),
    ]),
    headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: NAVY },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { cellWidth: 22 },
      4: { halign: 'center' },
    },
  })

  addFooter(doc)
  doc.save(`portogest_relatorio_geral_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)
}

export function exportEmployeeReport(employee: Employee, events: Event[]) {
  const doc = new jsPDF()
  addHeader(doc, `Relatório Individual — ${employee.name}`, `Matrícula: ${employee.matricula}`)

  // Employee card
  doc.setFillColor(...LIGHT_GRAY)
  doc.roundedRect(14, 42, 182, 30, 3, 3, 'F')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text(employee.name, 20, 52)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(`Setor: ${employee.sector}`, 20, 60)
  doc.text(`Função: ${employee.role}`, 20, 67)
  doc.text(`Turno: ${employee.shift}`, 110, 60)
  doc.text(`Matrícula: ${employee.matricula}`, 110, 67)

  // Stats
  const avgScore = events.length ? (events.reduce((a, b) => a + b.score, 0) / events.length).toFixed(1) : '0'
  const pending = events.filter(e => !e.hasFeedback).length

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text(`Total de Eventos: ${events.length}`, 14, 85)
  doc.text(`Pontuação Média: ${avgScore}`, 80, 85)
  doc.text(`Feedbacks Pendentes: ${pending}`, 146, 85)

  autoTable(doc, {
    startY: 92,
    head: [['Data', 'Categoria', 'Descrição', 'Pontuação', 'Criticidade', 'Feedback']],
    body: events.map(e => [
      format(new Date(e.date), 'dd/MM/yy'),
      e.category,
      e.description.substring(0, 45) + (e.description.length > 45 ? '...' : ''),
      String(e.score),
      criticalityLabel(e.criticality),
      e.hasFeedback ? 'Sim' : 'Não',
    ]),
    headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: NAVY },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      3: { halign: 'center' },
      5: { halign: 'center' },
    },
  })

  addFooter(doc)
  doc.save(`portogest_${employee.matricula}_${format(new Date(), 'yyyyMMdd')}.pdf`)
}

export function exportPendingFeedbacks(events: Event[]) {
  const doc = new jsPDF()
  const pending = events.filter(e => !e.hasFeedback)
  addHeader(doc, 'Relatório de Feedbacks Pendentes', `${pending.length} feedbacks aguardando`)

  autoTable(doc, {
    startY: 45,
    head: [['Data', 'Colaborador', 'Setor', 'Categoria', 'Pontuação', 'Criticidade', 'Dias Aberto']],
    body: pending.map(e => {
      const daysOpen = Math.floor((Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24))
      return [
        format(new Date(e.date), 'dd/MM/yy'),
        e.employeeName,
        e.sector,
        e.category,
        String(e.score),
        criticalityLabel(e.criticality),
        `${daysOpen}d`,
      ]
    }),
    headStyles: { fillColor: [220, 38, 38] as [number, number, number], textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: NAVY },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
  })

  addFooter(doc)
  doc.save(`portogest_feedbacks_pendentes_${format(new Date(), 'yyyyMMdd')}.pdf`)
}

export function exportCSV(events: Event[]) {
  const headers = ['Data', 'Colaborador', 'Matrícula', 'Setor', 'Função', 'Categoria', 'Descrição', 'Pontuação', 'Criticidade', 'Status', 'Turno', 'Localização', 'Feedback']
  const rows = events.map(e => [
    format(new Date(e.date), 'dd/MM/yyyy HH:mm'),
    e.employeeName,
    '',
    e.sector,
    e.role,
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    String(e.score),
    criticalityLabel(e.criticality),
    statusLabel(e.status),
    e.shift,
    e.location || '',
    e.hasFeedback ? 'Sim' : 'Não',
  ])

  const csvContent = [headers, ...rows].map(r => r.join(';')).join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `portogest_eventos_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
