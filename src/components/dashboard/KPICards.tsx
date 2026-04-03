import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label: string
  value: number | string
  change?: number
  icon: React.ReactNode
  color: string
  subtitle?: string
}

function KPICard({ label, value, change, icon, color, subtitle }: KPICardProps) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${
            change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-slate-500'
          }`}>
            {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

interface KPICardsProps {
  totalEvents: number
  avgScore: number
  pendingFeedbacks: number
  criticalEvents: number
  totalEmployees: number
}

export default function KPICards({ totalEvents, avgScore, pendingFeedbacks, criticalEvents, totalEmployees }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <KPICard
        label="Total de Eventos"
        value={totalEvents}
        icon={<span className="text-blue-300 text-xl">📋</span>}
        color="bg-blue-600/20"
        change={12}
      />
      <KPICard
        label="Pontuação Média"
        value={avgScore.toFixed(1)}
        icon={<span className="text-amber-300 text-xl">⭐</span>}
        color="bg-amber-600/20"
        change={5}
      />
      <KPICard
        label="Feedbacks Pendentes"
        value={pendingFeedbacks}
        icon={<span className="text-orange-300 text-xl">⏳</span>}
        color="bg-orange-600/20"
        change={pendingFeedbacks > 5 ? -8 : 0}
      />
      <KPICard
        label="Eventos Críticos"
        value={criticalEvents}
        icon={<span className="text-red-300 text-xl">🚨</span>}
        color="bg-red-600/20"
        change={criticalEvents > 3 ? -15 : 0}
      />
      <div className="col-span-2">
        <KPICard
          label="Colaboradores Cadastrados"
          value={totalEmployees}
          icon={<span className="text-emerald-300 text-xl">👥</span>}
          color="bg-emerald-600/20"
          subtitle="ativos no sistema"
        />
      </div>
    </div>
  )
}
