import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ApiError, api } from './api/client'

export type AuthUser = {
  id?: string
  name: string
  email: string
  role: string
  isAdmin: boolean
}

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error'

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  error: string
  refreshUser: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

type AuthPayload = {
  data?: { user?: unknown } | unknown
  user?: unknown
}

const AuthContext = createContext<AuthContextValue | null>(null)

function extractUser(payload: unknown): AuthUser {
  const response = payload as AuthPayload
  const data = response?.data
  const candidate =
    (data && typeof data === 'object' && 'user' in data ? data.user : undefined) ??
    response?.user ??
    data ??
    payload

  if (!candidate || typeof candidate !== 'object') {
    throw new ApiError(502, 'INVALID_AUTH_RESPONSE', 'Respons sesi dari server tidak valid.')
  }

  const record = candidate as Record<string, unknown>
  const email = typeof record.email === 'string' ? record.email : ''
  if (!email) {
    throw new ApiError(502, 'INVALID_AUTH_RESPONSE', 'Respons sesi dari server tidak berisi email pengguna.')
  }

  const rawRole = typeof record.role === 'string'
    ? record.role
    : Array.isArray(record.roles) && typeof record.roles[0] === 'string'
      ? record.roles[0]
      : record.isAdmin === true
        ? 'admin'
        : 'reporter'
  const role = rawRole.toLowerCase()

  return {
    id: typeof record.id === 'string' ? record.id : undefined,
    name: typeof record.name === 'string' ? record.name : email,
    email,
    role,
    isAdmin: role === 'admin' || role === 'administrator',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [error, setError] = useState('')
  const refreshSequence = useRef(0)

  const refreshUser = useCallback(async () => {
    const sequence = ++refreshSequence.current
    setStatus('loading')
    setError('')
    try {
      const payload = await api<unknown>('/auth/me')
      const sessionUser = extractUser(payload)
      if (sequence !== refreshSequence.current) return null
      setUser(sessionUser)
      setStatus('authenticated')
      return sessionUser
    } catch (requestError) {
      if (sequence !== refreshSequence.current) return null
      if (requestError instanceof ApiError && [401, 403].includes(requestError.status)) {
        setUser(null)
        setStatus('anonymous')
        return null
      }

      const message = requestError instanceof Error
        ? requestError.message
        : 'Tidak dapat memeriksa sesi akun.'
      setUser(null)
      setError(message)
      setStatus('error')
      throw requestError
    }
  }, [])

  const logout = useCallback(async () => {
    const sequence = ++refreshSequence.current
    await api<unknown>('/auth/logout', { method: 'POST' })
    if (sequence !== refreshSequence.current) return
    setUser(null)
    setError('')
    setStatus('anonymous')
  }, [])

  useEffect(() => {
    void refreshUser().catch(() => undefined)
  }, [refreshUser])

  const value = useMemo(
    () => ({ user, status, error, refreshUser, logout }),
    [user, status, error, refreshUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.')
  return context
}
