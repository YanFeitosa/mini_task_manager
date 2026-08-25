import { createContext, useContext } from 'react'

export type AuthContextValue = {
  isAuthenticated: boolean
  token: string | null
  userId: number | null
  userName: string | null
  sessionExpired: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  expireSession: () => void
  clearSessionNotice: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
