import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import EyeIcon from '../../components/EyeIcon/EyeIcon'
import { API_BASE_URL } from '../../config/api'
import './RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
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
      const response = await fetch(`${API_BASE_URL}/user-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        if (response.status === 409) {
          setError('Email already taken.')
        } else {
          setError('Could not create account. Try a different email.')
        }
        return
      }

      navigate('/login', {
        state: { message: 'Account created! Check your email to verify your account before logging in.' },
      })
    } catch {
      setError('Unable to reach the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header showSearch={false} />
      <div className="register-page">
        <form className="register-form" onSubmit={handleSubmit}>
          <h1 className="register-title">Create an account</h1>

          <label className="register-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="register-field">
            <span>Password</span>
            <div className="register-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="register-toggle-visibility"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </label>

          <label className="register-field">
            <span>Confirm password</span>
            <div className="register-password-wrap">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="register-toggle-visibility"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showConfirmPassword} />
              </button>
            </div>
          </label>

          {error && <p className="register-error">{error}</p>}

          <button type="submit" className="register-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>

          <p className="register-login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </>
  )
}

export default RegisterPage
