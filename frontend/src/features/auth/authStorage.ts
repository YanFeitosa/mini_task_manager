const TOKEN_STORAGE_KEY = 'mini-task-manager.access-token'
const USER_ID_STORAGE_KEY = 'mini-task-manager.user-id'
const USER_NAME_STORAGE_KEY = 'mini-task-manager.user-name'

type JwtClaims = {
  exp?: number
}

export type StoredSession = {
  token: string | null
  userId: number | null
  userName: string | null
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
    window.sessionStorage.removeItem(USER_ID_STORAGE_KEY)
    window.sessionStorage.removeItem(USER_NAME_STORAGE_KEY)
    return { token: null, userId: null, userName: null, expired: false, expiresAt: null }
  }

  const claims = decodeClaims(token)
  const expiresAt = typeof claims?.exp === 'number' ? claims.exp * 1000 : null
  const expired = expiresAt === null || expiresAt <= Date.now()

  if (expired) {
    removeSession()
    return { token: null, userId: null, userName: null, expired: true, expiresAt: null }
  }

  const storedUserId = Number(window.sessionStorage.getItem(USER_ID_STORAGE_KEY))

  return {
    token,
    userId: Number.isInteger(storedUserId) && storedUserId > 0 ? storedUserId : null,
    userName: window.sessionStorage.getItem(USER_NAME_STORAGE_KEY),
    expired: false,
    expiresAt,
  }
}

export function storeSession(token: string, userId: number, userName: string) {
  window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
  window.sessionStorage.setItem(USER_ID_STORAGE_KEY, String(userId))
  window.sessionStorage.setItem(USER_NAME_STORAGE_KEY, userName)
}

export function removeSession() {
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  window.sessionStorage.removeItem(USER_ID_STORAGE_KEY)
  window.sessionStorage.removeItem(USER_NAME_STORAGE_KEY)
}

export function readTokenExpiration(token: string) {
  const claims = decodeClaims(token)
  return typeof claims?.exp === 'number' ? claims.exp * 1000 : null
}
