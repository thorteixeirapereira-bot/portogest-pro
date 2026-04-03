import { useState, useEffect } from 'react'
import { X, Download, Share } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeferredPrompt = any

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already dismissed?
    if (localStorage.getItem('pwa-banner-dismissed') === 'true') return
    // Already running as standalone PWA?
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    if (ios) {
      // Show iOS instructions after 3s
      const t = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(t)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem('pwa-banner-dismissed', 'true')
  }

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  if (!show || installed) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 animate-slide-up">
      <div className="bg-slate-800 border border-slate-600/60 rounded-2xl p-4 shadow-2xl shadow-slate-950/60">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Instalar PortoGest Pro</p>
            {isIOS ? (
              <p className="text-xs text-slate-400 mt-0.5">
                Toque em <Share size={11} className="inline" /> e depois <strong>"Adicionar à Tela de Início"</strong>
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">
                Instale como app para acesso rápido sem navegador.
              </p>
            )}
          </div>
          <button onClick={dismiss} className="text-slate-500 hover:text-slate-300 flex-shrink-0">
            <X size={16} />
          </button>
        </div>
        {!isIOS && (
          <div className="flex gap-2 mt-3">
            <button onClick={dismiss} className="flex-1 text-sm text-slate-400 py-2 rounded-xl hover:bg-slate-700 transition-colors">
              Depois
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
