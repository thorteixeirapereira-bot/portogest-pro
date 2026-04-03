import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { seedDemoData } from './lib/demoData'

// Apply saved theme before render
const theme = localStorage.getItem('theme') || 'dark'
if (theme === 'dark') document.documentElement.classList.add('dark')
else document.documentElement.classList.remove('dark')

// Seed demo data on first load
seedDemoData().catch(console.error)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
