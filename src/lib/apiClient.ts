const API_URL = import.meta.env.VITE_API_URL ?? ''
const TOKEN_STORAGE_KEY = 'uf_token'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`)
    this.status = status
    this.body = body
  }
}

function buildHeaders(init?: RequestInit): HeadersInit {
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return headers
}

export async function apiClient<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    ...init,
    headers: buildHeaders(init),
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    throw new ApiError(res.status, body)
  }

  return body as T
}

export const tokenStorage = {
  get: () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null),
  set: (token: string) => localStorage.setItem(TOKEN_STORAGE_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_STORAGE_KEY),
}
