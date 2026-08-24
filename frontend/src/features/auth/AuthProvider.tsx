import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { apiRequest } from '../../services/api'
import { AuthContext } from './authContext'
import { readStoredSession, readTokenExpiration, removeSession, storeSession } from './authStorage'

type AuthResponse = {
  accessToken: string
  userId: number
  userName: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(readStoredSession)

  const expireSession = useCallback(() => {
    removeSession()
    setSession({ token: null, userId: null, userName: null, expired: true, expiresAt: null })
  }, [])

  useEffect(() => {
    if (!session.expiresAt) {
      return
    }

    const remainingTime = Math.max(session.expiresAt - Date.now(), 0)
    const timeout = window.setTimeout(expireSession, remainingTime)
    return () => window.clearTimeout(timeout)
  }, [expireSession, session.expiresAt])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    storeSession(response.accessToken, response.userId, response.userName)
    setSession({
      token: response.accessToken,
      userId: response.userId,
      userName: response.userName,
      expired: false,
      expiresAt: readTokenExpiration(response.accessToken),
    })
  }, [])

  const logout = useCallback(() => {
    removeSession()
    setSession({ token: null, userId: null, userName: null, expired: false, expiresAt: null })
  }, [])

  const clearSessionNotice = useCallback(
    () => setSession((current) => ({ ...current, expired: false })),
    [],
  )

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: session.token !== null,
        token: session.token,
        userId: session.userId,
        userName: session.userName,
        sessionExpired: session.expired,
        login,
        logout,
        expireSession,
        clearSessionNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
