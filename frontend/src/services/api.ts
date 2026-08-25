const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

type ProblemDetail = {
  detail?: string
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })
  const responseText = await response.text()
  const responseBody = responseText ? parseResponse(responseText) : null

  if (!response.ok) {
    const problem = isProblemDetail(responseBody) ? responseBody : null
    throw new ApiError(
      response.status,
      problem?.detail ?? 'A solicitação não pôde ser concluída.',
    )
  }

  return responseBody as T
}

export function authenticatedApiRequest<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
) {
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)
  return apiRequest<T>(path, { ...options, headers })
}

function parseResponse(responseText: string): unknown {
  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

function isProblemDetail(value: unknown): value is ProblemDetail {
  return typeof value === 'object' && value !== null
}
