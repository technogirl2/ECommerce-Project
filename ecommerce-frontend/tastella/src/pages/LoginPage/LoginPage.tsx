import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import EyeIcon from '../../components/EyeIcon/EyeIcon'
import { API_BASE_URL } from '../../config/api'
import { getRoleFromToken } from '../../util/jwt'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(
    (location.state as { message?: string } | null)?.message ?? '',
  )

  useEffect(() => {
    if (!successMessage) return

    const timeoutId = setTimeout(() => setSuccessMessage(''), 5000)
    return () => clearTimeout(timeoutId)
  }, [successMessage])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setNeedsVerification(false)
    setResendState('idle')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/user-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        if (data?.error === 'EMAIL_NOT_VERIFIED') {
          setError('Please verify your email before logging in.')
          setNeedsVerification(true)
        } else {
          setError('Incorrect email or password')
        }
        return
      }

      const { token, refreshToken } = (await response.json()) as {
        token: string
        refreshToken: string
      }

      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      navigate(getRoleFromToken(token) === 'ADMIN' ? '/admin/products' : '/searchPage')
    } catch {
      setError('Unable to reach the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResendState('sending')
    try {
      await fetch(`${API_BASE_URL}/user-resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } finally {
      setResendState('sent')
    }
  }

  return (
    <>
      <Header showSearch={false} />
      <div className="login-page">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="login-title">Welcome back</h1>

          {successMessage && <p className="login-success">{successMessage}</p>}

          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <div className="login-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-toggle-visibility"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </label>

          {error && <p className="login-error">{error}</p>}

          {needsVerification && (
            <p className="login-resend">
              {resendState === 'sent' ? (
                'Verification email sent. Check your inbox.'
              ) : (
                <button
                  type="button"
                  className="login-resend-button"
                  onClick={handleResend}
                  disabled={resendState === 'sending'}
                >
                  {resendState === 'sending' ? 'Sending...' : 'Resend verification email'}
                </button>
              )}
            </p>
          )}

          <button type="submit" className="login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>

          <p className="login-register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </>
  )
}

export default LoginPage
