import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Anchor, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const loginSchema = z.object({
  matricula: z.string().min(3, 'Matrícula obrigatória'),
  password: z.string().min(4, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    const ok = await login(data.matricula, data.password)
    if (ok) navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-800/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/50 mb-4">
            <Anchor size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">PortoGest <span className="text-blue-400">Pro</span></h1>
          <p className="text-slate-500 text-sm mt-1">Gestão de Colaboradores</p>
        </div>

        {/* Form card */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Entrar no sistema</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="label">Matrícula</label>
              <input
                {...register('matricula')}
                placeholder="Ex: ADM001"
                className="input uppercase"
                autoCapitalize="characters"
                autoComplete="username"
                aria-label="Matrícula"
              />
              {errors.matricula && (
                <p className="text-red-400 text-xs mt-1">{errors.matricula.message}</p>
              )}
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-11"
                  autoComplete="current-password"
                  aria-label="Senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 card p-4">
          <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">Credenciais de demonstração</p>
          <div className="space-y-1.5">
            {[
              { matricula: 'ADM001', senha: 'admin2026', role: 'Admin' },
              { matricula: 'SUP001', senha: 'porto2026', role: 'Supervisor' },
              { matricula: 'OPR001', senha: 'op2026', role: 'Operador' },
            ].map(c => (
              <div key={c.matricula} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">{c.matricula} / {c.senha}</span>
                <span className="text-blue-400 font-medium">{c.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
