const TOKEN_STORAGE_KEY = 'mini-task-manager.access-token'

type JwtClaims = {
  exp?: number
}

export type StoredSession = {
  token: string | null
  expired: boolean
  expiresAt: number | null
}

function decodeClaims(token: string): JwtClaims | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return null
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return JSON.parse(window.atob(padded)) as JwtClaims
  } catch {
    return null
  }
}

export function readStoredSession(): StoredSession {
  const token = window.sessionStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token) {
    return { token: null, expired: false, expiresAt: null }
  }

  const claims = decodeClaims(token)
  const expiresAt = typeof claims?.exp === 'number' ? claims.exp * 1000 : null
  const expired = expiresAt === null || expiresAt <= Date.now()

  if (expired) {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    return { token: null, expired: true, expiresAt: null }
  }

  return {
    token,
    expired: false,
    expiresAt,
  }
}

export function storeToken(token: string) {
  window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function removeToken() {
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function readTokenExpiration(token: string) {
  const claims = decodeClaims(token)
  return typeof claims?.exp === 'number' ? claims.exp * 1000 : null
}
