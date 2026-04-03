import { useState, useEffect } from 'react'
import { X, Download, Share } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeferredPrompt = any

const DISMISSED_KEY = 'pwa-dismissed-at'
const DISMISS_DAYS = 7 // show again after 7 days

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already running as standalone PWA — no need to prompt
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if ((navigator as any).standalone === true) return // iOS standalone

    // Check if recently dismissed
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (dismissedAt) {
      const diff = Date.now() - Number(dismissedAt)
      if (diff < DISMISS_DAYS * 24 * 60 * 60 * 1000) return
    }

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    if (ios) {
      const t = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(t)
    }

    // Chrome / Android / Desktop
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const t = setTimeout(() => setShow(true), 2500)
      return () => clearTimeout(t)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setInstalled(true); setShow(false) })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  }

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
    setShow(false)
  }

  if (!show || installed) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 animate-slide-up">
      <div className="bg-slate-800 border border-blue-500/30 rounded-2xl p-4 shadow-2xl shadow-slate-950/80">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Instalar PortoGest Pro</p>
            {isIOS ? (
              <p className="text-xs text-slate-400 mt-0.5">
                Toque em <Share size={11} className="inline" /> depois <strong>"Adicionar à Tela de Início"</strong>
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">
                Acesso rápido como app, sem abrir o navegador.
              </p>
            )}
          </div>
          <button onClick={dismiss} className="text-slate-500 hover:text-slate-300 flex-shrink-0 p-1">
            <X size={16} />
          </button>
        </div>
        {!isIOS && deferredPrompt && (
          <div className="flex gap-2 mt-3">
            <button onClick={dismiss} className="flex-1 text-sm text-slate-400 py-2 rounded-xl hover:bg-slate-700 transition-colors">
              Agora não
            </button>
            <button onClick={install} className="flex-1 btn-primary py-2 text-sm">
              Instalar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
