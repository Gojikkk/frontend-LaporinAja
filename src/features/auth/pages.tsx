import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, LockKeyhole, MapPin } from 'lucide-react'
import { api, ApiError } from '../../shared/api/client'
import { useAuth } from '../../shared/auth-context'
import { AppShell } from '../../components/ui'

type AuthFields = 'name' | 'email' | 'password'

function getFieldErrors(error: ApiError): Partial<Record<AuthFields, string>> {
  const fields: Partial<Record<AuthFields, string>> = {}
  for (const field of ['name', 'email', 'password'] as const) {
    const message = error.fields?.[field]
    if (message) fields[field] = message
  }
  return fields
}

export function AuthPage({ register = false, onToast }: { register?: boolean; onToast: (message: string) => void }) {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<AuthFields, string>>>({})

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const validationErrors: Partial<Record<AuthFields, string>> = {}

    if (register && !name) validationErrors.name = 'Nama wajib diisi.'
    if (!email) validationErrors.email = 'Alamat email wajib diisi.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) validationErrors.email = 'Masukkan alamat email yang valid.'
    if (register && password.length < 8) validationErrors.password = 'Kata sandi harus terdiri dari minimal 8 karakter.'
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors)
      return
    }

    setBusy(true)
    try {
      if (register) {
        await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        })
        onToast('Akun berhasil dibuat. Silakan masuk.')
        navigate('/masuk')
        return
      }

      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const user = await refreshUser()
      if (!user) throw new ApiError(401, 'SESSION_NOT_CREATED', 'Login berhasil, tetapi sesi belum dapat diverifikasi.')

      onToast('Berhasil masuk.')
      navigate(user.isAdmin ? '/admin' : '/dashboard', { replace: true })
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setFieldErrors(getFieldErrors(requestError))
        setError(requestError.message)
      } else {
        setError('Terjadi kendala. Coba lagi.')
      }
    } finally {
      setBusy(false)
    }
  }

  function clearFieldError(field: AuthFields) {
    setFieldErrors(previous => ({ ...previous, [field]: undefined }))
    setError('')
  }

  return (
    <AppShell footer={false}>
      <main className="auth-page">
        <div className="auth-aside">
          <Link to="/" className="brand auth-brand">
            <span className="brand-mark"><MapPin size={18} fill="currentColor"/></span>
            <span>Laporin<span>Aja</span><small>TRANSPARANSI BERSAMA</small></span>
          </Link>
          <div>
            <div className="eyebrow"><span/> RUANG LAPORAN BERSAMA</div>
            <h1>Perubahan kecil<br/>berawal dari <em>peduli.</em></h1>
            <p>Pantau laporanmu, baca catatan perkembangan, dan tetap terhubung dengan sekitar.</p>
          </div>
          <small>Prototype kompetisi, bukan kanal resmi pemerintah.</small>
        </div>
        <div className="auth-main">
          <Link to="/" className="auth-back"><ArrowLeft size={16}/> Kembali ke beranda</Link>
          <div className="auth-box">
            <div className="eyebrow"><span/> AKUN LAPORINAJA</div>
            <h2>{register ? 'Buat akun pelapor' : 'Selamat datang kembali'}</h2>
            <p>{register ? 'Mulai catat dan ikuti perkembangan laporanmu.' : 'Masuk untuk melihat laporan dan perkembangannya.'}</p>
            <form onSubmit={submit} noValidate>
              {register && (
                <AuthInput
                  label="Nama lengkap"
                  name="name"
                  placeholder="Nama yang ingin ditampilkan"
                  autoComplete="name"
                  error={fieldErrors.name}
                  onChange={() => clearFieldError('name')}
                />
              )}
              <AuthInput
                label="Alamat email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                error={fieldErrors.email}
                onChange={() => clearFieldError('email')}
              />
              <AuthInput
                label="Kata sandi"
                name="password"
                type="password"
                autoComplete={register ? 'new-password' : 'current-password'}
                hint={register ? 'Minimal 8 karakter' : undefined}
                error={fieldErrors.password}
                onChange={() => clearFieldError('password')}
              />
              {error && <div className="auth-error" role="alert">{error}</div>}
              <button className="button primary auth-submit" disabled={busy} type="submit">
                {busy ? 'Mohon tunggu…' : register ? 'Buat akun' : 'Masuk'} <ArrowRight size={17}/>
              </button>
            </form>
            <div className="auth-switch">
              {register ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
              <Link to={register ? '/masuk' : '/daftar'}>{register ? 'Masuk' : 'Daftar sekarang'}</Link>
            </div>
            <p className="auth-privacy"><LockKeyhole size={14}/> Sesi aman dengan cookie. Kata sandi tidak dibagikan.</p>
          </div>
        </div>
      </main>
    </AppShell>
  )
}

function AuthInput({
  label,
  name,
  type = 'text',
  placeholder,
  autoComplete,
  hint,
  error,
  onChange,
}: {
  label: string
  name: AuthFields
  type?: string
  placeholder?: string
  autoComplete: string
  hint?: string
  error?: string
  onChange: () => void
}) {
  const errorId = `${name}-error`
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}<span aria-hidden="true"> *</span></label>
      <input
        id={name}
        name={name}
        type={type}
        required
        minLength={name === 'password' ? 8 : undefined}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? `${name}-hint` : undefined}
        onChange={onChange}
      />
      {error && <small className="auth-field-error" id={errorId} role="alert">{error}</small>}
      {hint && !error && <small id={`${name}-hint`}>{hint}</small>}
    </div>
  )
}
