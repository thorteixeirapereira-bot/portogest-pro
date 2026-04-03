import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import FAB from './FAB'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      <FAB />
      <BottomNav />
    </div>
  )
}
