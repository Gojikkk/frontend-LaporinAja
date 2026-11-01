const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '')
const CSRF_COOKIE = import.meta.env.VITE_CSRF_COOKIE_NAME || ''
const CSRF_HEADER = import.meta.env.VITE_CSRF_HEADER_NAME || 'X-CSRF-Token'
const CSRF_ENDPOINT = import.meta.env.VITE_CSRF_ENDPOINT || ''
let csrfToken = ''

export type ApiErrorBody = { code?: string; message?: string; fields?: Record<string, string> }
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string>) { super(message); this.name = 'ApiError' }
}

function readableCookie(name: string) {
  if (!name || typeof document === 'undefined') return ''
  const prefix = `${encodeURIComponent(name)}=`
  return document.cookie.split('; ').find(part => part.startsWith(prefix))?.slice(prefix.length) ?? ''
}

/** Session is exclusively an HttpOnly server cookie. This client never stores session tokens. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const method = (init.method ?? 'GET').toUpperCase()
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  try {
    // Browser supplies Origin. Fetch a configured cross-origin CSRF token before mutations.
    if (mutating && CSRF_ENDPOINT && !csrfToken) {
      const csrfPath = CSRF_ENDPOINT.startsWith('/') ? CSRF_ENDPOINT : `/${CSRF_ENDPOINT}`
      const csrfResponse = await fetch(`${API_URL}${csrfPath}`, { credentials: 'include' })
      const csrfPayload = await csrfResponse.json().catch(() => ({}))
      if (!csrfResponse.ok) {
        const error: ApiErrorBody = csrfPayload?.error ?? {}
        throw new ApiError(
          csrfResponse.status,
          error.code ?? 'CSRF_REQUEST_FAILED',
          error.message ?? 'Tidak dapat memperoleh token keamanan dari server.',
          error.fields,
        )
      }
      csrfToken = csrfPayload?.data?.csrfToken ?? csrfPayload?.csrfToken ?? ''
      if (!csrfToken) {
        throw new ApiError(502, 'CSRF_TOKEN_MISSING', 'Server tidak mengirim token keamanan yang diperlukan.')
      }
    }

    const csrf = mutating ? (csrfToken || readableCookie(CSRF_COOKIE)) : ''
    if (csrf) headers.set(CSRF_HEADER, decodeURIComponent(csrf))
    const response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, { ...init, method, headers, credentials: 'include' })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const error: ApiErrorBody = payload?.error ?? {}
      throw new ApiError(response.status, error.code ?? 'REQUEST_FAILED', error.message ?? 'Permintaan belum berhasil. Coba lagi.', error.fields)
    }
    return payload as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(0, 'NETWORK_ERROR', 'Tidak dapat terhubung ke layanan. Periksa koneksi Anda lalu coba lagi.')
  }
}

export const apiBaseUrl = API_URL
