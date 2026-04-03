interface KPICardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  subtitle?: string
}

function KPICard({ label, value, icon, color, subtitle }: KPICardProps) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
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
  totalColaboradores: number
  totalTestes: number
  totalPontos: number
  pesquisasAtivas: number
}

export default function KPICards({ totalColaboradores, totalTestes, totalPontos, pesquisasAtivas }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <KPICard
        label="Colaboradores"
        value={totalColaboradores}
        icon={<span className="text-emerald-300 text-xl">👥</span>}
        color="bg-emerald-600/20"
        subtitle="cadastrados"
      />
      <KPICard
        label="Testes Realizados"
        value={totalTestes}
        icon={<span className="text-purple-300 text-xl">🧠</span>}
        color="bg-purple-600/20"
        subtitle="perfis mapeados"
      />
      <KPICard
        label="Pontos na Equipe"
        value={totalPontos}
        icon={<span className="text-amber-300 text-xl">⭐</span>}
        color="bg-amber-600/20"
        subtitle="acumulados"
      />
      <KPICard
        label="Pesquisas Ativas"
        value={pesquisasAtivas}
        icon={<span className="text-blue-300 text-xl">📋</span>}
        color="bg-blue-600/20"
        subtitle="abertas para resposta"
      />
    </div>
  )
}
