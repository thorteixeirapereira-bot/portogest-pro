import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { User, Employee, Event, Survey } from '../types'

interface PortoGestDB extends DBSchema {
  users: { key: string; value: User; indexes: { matricula: string } }
  employees: { key: string; value: Employee; indexes: { matricula: string; sector: string } }
  events: { key: string; value: Event; indexes: { employeeId: string; date: string; category: string } }
  surveys: { key: string; value: Survey }
  session: { key: string; value: { userId: string; expiresAt: string } }
}

let dbInstance: IDBPDatabase<PortoGestDB> | null = null

export async function getDB() {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<PortoGestDB>('portogest-pro', 1, {
    upgrade(db) {
      // Users
      const userStore = db.createObjectStore('users', { keyPath: 'id' })
      userStore.createIndex('matricula', 'matricula', { unique: true })

      // Employees
      const empStore = db.createObjectStore('employees', { keyPath: 'id' })
      empStore.createIndex('matricula', 'matricula', { unique: true })
      empStore.createIndex('sector', 'sector')

      // Events
      const evtStore = db.createObjectStore('events', { keyPath: 'id' })
      evtStore.createIndex('employeeId', 'employeeId')
      evtStore.createIndex('date', 'date')
      evtStore.createIndex('category', 'category')

      // Surveys
      db.createObjectStore('surveys', { keyPath: 'id' })

      // Session
      db.createObjectStore('session', { keyPath: 'key' })
    },
  })
  return dbInstance
}

// ─── Generic CRUD ────────────────────────────────────────────────────────────

export async function dbGet<T>(store: keyof PortoGestDB, key: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get(store as any, key) as Promise<T | undefined>
}

export async function dbGetAll<T>(store: keyof PortoGestDB): Promise<T[]> {
  const db = await getDB()
  return db.getAll(store as any) as Promise<T[]>
}

export async function dbPut<T>(store: keyof PortoGestDB, value: T): Promise<void> {
  const db = await getDB()
  await db.put(store as any, value as any)
}

export async function dbDelete(store: keyof PortoGestDB, key: string): Promise<void> {
  const db = await getDB()
  await db.delete(store as any, key)
}

export async function dbClear(store: keyof PortoGestDB): Promise<void> {
  const db = await getDB()
  await db.clear(store as any)
}

// ─── Session ─────────────────────────────────────────────────────────────────

export async function saveSession(userId: string) {
  const db = await getDB()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  await db.put('session', { key: 'current', userId, expiresAt } as any)
}

export async function getSession(): Promise<string | null> {
  const db = await getDB()
  const session = await db.get('session', 'current' as any)
  if (!session) return null
  const s = session as any
  if (new Date(s.expiresAt) < new Date()) {
    await db.delete('session', 'current' as any)
    return null
  }
  return s.userId
}

export async function clearSession() {
  const db = await getDB()
  await db.delete('session', 'current' as any)
}
