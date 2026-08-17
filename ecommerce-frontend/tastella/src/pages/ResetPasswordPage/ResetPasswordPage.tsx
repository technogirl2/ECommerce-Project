import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
import EyeIcon from '../../components/EyeIcon/EyeIcon'
import { API_BASE_URL } from '../../config/api'
import './ResetPasswordPage.css'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/user-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? 'This link is invalid or has expired. Request a new one from the login page.')
        return
      }

      navigate('/login', {
        state: { message: 'Password reset successfully. Log in with your new password.' },
      })
    } catch {
      setError('Unable to reach the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <>
        <Header showSearch={false} />
        <div className="reset-password-page">
          <div className="reset-password-form">
            <h1 className="reset-password-title">Reset link invalid</h1>
            <p className="reset-password-message">
              This link is invalid. Request a new one from the login page.
            </p>
            <p className="reset-password-link">
              <Link to="/forgot-password">Request a new link</Link>
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header showSearch={false} />
      <div className="reset-password-page">
        <form className="reset-password-form" onSubmit={handleSubmit}>
          <h1 className="reset-password-title">Choose a new password</h1>

          <label className="reset-password-field">
            <span>New password</span>
            <div className="reset-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="reset-password-toggle-visibility"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </label>

          <label className="reset-password-field">
            <span>Confirm new password</span>
            <div className="reset-password-wrap">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="reset-password-toggle-visibility"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showConfirmPassword} />
              </button>
            </div>
          </label>

          {error && <p className="reset-password-error">{error}</p>}

          <button type="submit" className="reset-password-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset password'}
          </button>

          <p className="reset-password-link">
            <Link to="/login">Back to login</Link>
          </p>
        </form>
      </div>
    </>
  )
}

export default ResetPasswordPage
