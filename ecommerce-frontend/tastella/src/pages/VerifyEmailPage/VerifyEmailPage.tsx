import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { API_BASE_URL } from '../../config/api'
import './VerifyEmailPage.css'

type Status = 'verifying' | 'success' | 'error'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>('verifying')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    let cancelled = false

    const verify = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (!cancelled) setStatus(response.ok ? 'success' : 'error')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <>
      <Header showSearch={false} />
      <div className="verify-email-page">
        <div className="verify-email-card">
          {status === 'verifying' && (
            <>
              <h1 className="verify-email-title">Verifying your email...</h1>
              <p className="verify-email-message">Hang tight, this will just take a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="verify-email-title">Email verified</h1>
              <p className="verify-email-message">
                Your email has been verified. You can now log in.
              </p>
              <Link to="/login" className="verify-email-link">
                Go to login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="verify-email-title">Verification link invalid</h1>
              <p className="verify-email-message">
                This link is invalid or has expired. Request a new one from the login page.
              </p>
              <Link to="/login" className="verify-email-link">
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default VerifyEmailPage
