import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { getSession, dbGetAll } from '../lib/db'
import type { User } from '../types'

export function useAuth() {
  const { user, login, logout, setUser, loading } = useAuthStore()

  useEffect(() => {
    async function restore() {
      const userId = await getSession()
      if (userId) {
        const users = await dbGetAll<User>('users')
        const found = users.find(u => u.id === userId)
        if (found) setUser(found)
      }
    }
    if (!user) restore()
  }, [])

  return { user, login, logout, loading, isAuthenticated: !!user }
}
