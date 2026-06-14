const AUTH_FRONTEND_URL = import.meta.env.VITE_AUTH_FRONTEND_URL ?? 'http://localhost:5173'
const TOKEN_KEY = 'uf_token'

export interface AuthUser {
  id: string
  email: string
}

export interface UseAuthReturn {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

export function useAuth(): UseAuthReturn {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

  return {
    user: null,
    token,
    isAuthenticated: !!token,
    login: () => {
      const redirect = encodeURIComponent(window.location.href)
      window.location.href = `${AUTH_FRONTEND_URL}/login?app=user&redirect=${redirect}`
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY)
      window.location.reload()
    },
  }
}
