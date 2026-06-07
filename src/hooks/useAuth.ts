// TODO: wire to real auth flow (login/logout via gateway, persist token, refresh, etc.)
// This is a skeleton — components can already import { useAuth } and rely on the shape.

export interface AuthUser {
  id: string
  email: string
}

export interface UseAuthReturn {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  logout: () => void
}

export function useAuth(): UseAuthReturn {
  // TODO: read token from localStorage, decode/fetch user, expose real handlers
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    login: () => {
      // TODO: POST to gateway /auth/login, store token in localStorage, update state
    },
    logout: () => {
      // TODO: clear localStorage token + cached user, redirect to /login
    },
  }
}
