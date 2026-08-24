import { useState, type FormEvent } from 'react'
import { CircleAlert, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useNavigate } from 'react-router'
import { AppBrand } from '../../components/AppBrand'
import { ApiError } from '../../services/api'
import { useAuth } from './authContext'
import './LoginPage.css'

type FieldErrors = {
  email?: string
  password?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, sessionExpired, clearSessionNotice } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateFields(email, password)
    setFieldErrors(errors)
    setFormError(null)
    clearSessionNotice()

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/tasks', { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setFormError('E-mail ou senha inválidos. Confira os dados e tente novamente.')
      } else {
        setFormError('Não foi possível entrar agora. Verifique a conexão e tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <AppBrand />

        <div className="login-card__heading">
          <p className="eyebrow">Acesso à plataforma</p>
          <h1 id="login-title">Boas-vindas</h1>
          <p>Entre para organizar as tarefas e acompanhar o trabalho do seu time.</p>
        </div>

        {sessionExpired && (
          <div className="feedback feedback--notice" role="status">
            <CircleAlert size={19} aria-hidden="true" />
            <span>Sua sessão expirou. Entre novamente para continuar.</span>
          </div>
        )}

        {formError && (
          <div className="feedback feedback--error" role="alert">
            <CircleAlert size={19} aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="email">E-mail</label>
            <div className={`input-shell ${fieldErrors.email ? 'input-shell--invalid' : ''}`}>
              <Mail size={19} aria-hidden="true" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setFieldErrors((current) => ({ ...current, email: undefined }))
                }}
              />
            </div>
            {fieldErrors.email && (
              <span className="field-error" id="email-error">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password">Senha</label>
            <div className={`input-shell ${fieldErrors.password ? 'input-shell--invalid' : ''}`}>
              <LockKeyhole size={19} aria-hidden="true" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                maxLength={72}
                value={password}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setFieldErrors((current) => ({ ...current, password: undefined }))
                }}
              />
              <button
                className="icon-button"
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="field-error" id="password-error">
                {fieldErrors.password}
              </span>
            )}
          </div>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}

function validateFields(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  const normalizedEmail = email.trim()

  if (!normalizedEmail) {
    errors.email = 'Informe seu e-mail.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = 'Informe um e-mail válido.'
  }

  if (!password) {
    errors.password = 'Informe sua senha.'
  }

  return errors
}
