"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type UserRole = "superadmin" | "admin" | "monitor"

export interface HorariosUser {
  uid: string
  nombre: string
  cedula: string
  role: UserRole
}

const SESSION_KEY = "horarios_session"

interface AuthContextType {
  user: HorariosUser | null
  loading: boolean
  login: (user: HorariosUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<HorariosUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) setUser(JSON.parse(raw) as HorariosUser)
    } catch {
      localStorage.removeItem(SESSION_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (u: HorariosUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
