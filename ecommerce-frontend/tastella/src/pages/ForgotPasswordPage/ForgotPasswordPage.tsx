import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { API_BASE_URL } from '../../config/api'
import './ForgotPasswordPage.css'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await fetch(`${API_BASE_URL}/user-forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } finally {
      // Always show the same confirmation, whether or not the account exists,
      // so this form can't be used to check which emails are registered.
      setIsSubmitted(true)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header showSearch={false} />
      <div className="forgot-password-page">
        {isSubmitted ? (
          <div className="forgot-password-form">
            <h1 className="forgot-password-title">Check your email</h1>
            <p className="forgot-password-message">
              If an account exists for {email}, we've sent a link to reset your password.
            </p>
            <p className="forgot-password-link">
              <Link to="/login">Back to login</Link>
            </p>
          </div>
        ) : (
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <h1 className="forgot-password-title">Forgot password</h1>
            <p className="forgot-password-message">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <label className="forgot-password-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <button type="submit" className="forgot-password-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>

            <p className="forgot-password-link">
              <Link to="/login">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </>
  )
}

export default ForgotPasswordPage
