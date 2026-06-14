import { useEffect, useState } from 'react'

const AUTH_FRONTEND_URL = import.meta.env.VITE_AUTH_FRONTEND_URL ?? 'http://localhost:5173'
const TOKEN_KEY = 'uf_token'
const REFRESH_KEY = 'uf_refresh'

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
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash
    if (!hash) return
    const params = new URLSearchParams(hash)
    const hashToken = params.get('token')
    const hashRefresh = params.get('refresh')
    if (!hashToken) return
    localStorage.setItem(TOKEN_KEY, hashToken)
    if (hashRefresh) localStorage.setItem(REFRESH_KEY, hashRefresh)
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setToken(hashToken)
  }, [])

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
      localStorage.removeItem(REFRESH_KEY)
      setToken(null)
      window.location.reload()
    },
  }
}
