import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { apiRequest } from '../../services/api'
import { AuthContext } from './authContext'
import { readStoredSession, readTokenExpiration, removeToken, storeToken } from './authStorage'

type AuthResponse = {
  accessToken: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(readStoredSession)

  const expireSession = useCallback(() => {
    removeToken()
    setSession({ token: null, expired: true, expiresAt: null })
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

    storeToken(response.accessToken)
    setSession({
      token: response.accessToken,
      expired: false,
      expiresAt: readTokenExpiration(response.accessToken),
    })
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setSession({ token: null, expired: false, expiresAt: null })
  }, [])

  const clearSessionNotice = useCallback(
    () => setSession((current) => ({ ...current, expired: false })),
    [],
  )

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: session.token !== null,
        sessionExpired: session.expired,
        login,
        logout,
        clearSessionNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
