import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Header from '../../components/Header/Header'
import EyeIcon from '../../components/EyeIcon/EyeIcon'
import { API_BASE_URL } from '../../config/api'
import { authFetch } from '../../util/authFetch'
import { getRoleFromToken, getEmailFromToken } from '../../util/jwt'
import './AccountSettingsPage.css'

interface PasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  USER: 'Customer',
}

const EMPTY_FORM: PasswordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
const EMPTY_VISIBILITY: Record<keyof PasswordForm, boolean> = {
  oldPassword: false,
  newPassword: false,
  confirmPassword: false,
}

function AccountSettingsPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [form, setForm] = useState<PasswordForm>(EMPTY_FORM)
  const [visibility, setVisibility] = useState(EMPTY_VISIBILITY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setEmail(getEmailFromToken(token))
      setRole(getRoleFromToken(token))
    }
  }, [])

  const updateField = (field: keyof PasswordForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const toggleVisibility = (field: keyof PasswordForm) =>
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!form.oldPassword) {
      setError('Enter your current password.')
      return
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authFetch(`${API_BASE_URL}/user-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? 'Unable to update your password. Please try again.')
        return
      }

      setSuccessMessage('Password updated successfully.')
      setForm(EMPTY_FORM)
    } catch {
      setError('Unable to update your password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header showSearch={false} showAccountMenu />
      <div className="account-settings-page">
        <h1 className="account-settings-title">Account settings</h1>

        <section className="account-settings-section">
          <h2>Profile</h2>
          <div className="account-settings-row">
            <span className="account-settings-label">Email</span>
            <span className="account-settings-value">{email ?? '—'}</span>
          </div>
          <div className="account-settings-row">
            <span className="account-settings-label">Role</span>
            <span className="account-settings-value">{ROLE_LABELS[role ?? ''] ?? role ?? '—'}</span>
          </div>
          <div className="account-settings-row">
            <span className="account-settings-label">Password</span>
            <span className="account-settings-value">••••••••</span>
          </div>
        </section>

        <section className="account-settings-section">
          <h2>Change password</h2>
          <form className="account-settings-form" onSubmit={handleSubmit}>
            <label className="account-settings-field">
              <span>Current password</span>
              <div className="account-settings-password-wrap">
                <input
                  type={visibility.oldPassword ? 'text' : 'password'}
                  value={form.oldPassword}
                  onChange={(e) => updateField('oldPassword', e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="account-settings-toggle-visibility"
                  onClick={() => toggleVisibility('oldPassword')}
                  aria-label={visibility.oldPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={visibility.oldPassword} />
                </button>
              </div>
            </label>
            <label className="account-settings-field">
              <span>New password</span>
              <div className="account-settings-password-wrap">
                <input
                  type={visibility.newPassword ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={(e) => updateField('newPassword', e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="account-settings-toggle-visibility"
                  onClick={() => toggleVisibility('newPassword')}
                  aria-label={visibility.newPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={visibility.newPassword} />
                </button>
              </div>
            </label>
            <label className="account-settings-field">
              <span>Confirm new password</span>
              <div className="account-settings-password-wrap">
                <input
                  type={visibility.confirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="account-settings-toggle-visibility"
                  onClick={() => toggleVisibility('confirmPassword')}
                  aria-label={visibility.confirmPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={visibility.confirmPassword} />
                </button>
              </div>
            </label>

            {error && <p className="account-settings-error">{error}</p>}
            {successMessage && <p className="account-settings-success">{successMessage}</p>}

            <button type="submit" className="account-settings-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </>
  )
}

export default AccountSettingsPage
