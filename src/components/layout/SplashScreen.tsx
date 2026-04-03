export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <div className="animate-fade-in flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/50">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Anchor */}
              <circle cx="26" cy="12" r="5" stroke="white" strokeWidth="2.5" fill="none"/>
              <line x1="26" y1="17" x2="26" y2="42" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M14 26 C14 26 14 40 26 40 C38 40 38 26 38 26" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <line x1="19" y1="17" x2="33" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Circuit dots */}
              <circle cx="10" cy="26" r="2" fill="#F59E0B"/>
              <circle cx="42" cy="26" r="2" fill="#F59E0B"/>
              <line x1="10" y1="26" x2="14" y2="26" stroke="#F59E0B" strokeWidth="1.5"/>
              <line x1="38" y1="26" x2="42" y2="26" stroke="#F59E0B" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">PortoGest <span className="text-blue-400">Pro</span></h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Gestão de Colaboradores</p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
            style={{ animation: 'splash-load 1.8s ease-out forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splash-load {
          0% { width: 0% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  )
}
