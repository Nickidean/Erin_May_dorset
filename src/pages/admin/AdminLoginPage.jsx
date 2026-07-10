import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PinPad from '../../components/admin/PinPad.jsx'
import { login } from '../../lib/adminApi.js'
import { setSession } from '../../lib/session.js'

const ADMINS = [
  { key: 'amelie', label: 'Amelie' },
  { key: 'lily', label: 'Lily' },
]

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handlePinChange(value) {
    setPin(value)
    setError('')
    if (value.length === 4 && admin) {
      setLoading(true)
      try {
        const { token, adminName } = await login(admin, value)
        setSession({ token, adminName })
        navigate('/admin', { replace: true })
      } catch {
        setError('Incorrect PIN. Try again.')
        setPin('')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Erin May admin</h1>

        {!admin ? (
          <div className="admin-login-who">
            <p className="admin-login-sub">Who are you?</p>
            <div className="admin-login-who-buttons">
              {ADMINS.map((a) => (
                <button key={a.key} className="btn btn-blue" onClick={() => setAdmin(a.key)}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="admin-login-pin">
            <p className="admin-login-sub">
              Hi {ADMINS.find((a) => a.key === admin)?.label}, enter your code
            </p>
            <PinPad value={pin} onChange={handlePinChange} disabled={loading} />
            {error && <p className="admin-login-error">{error}</p>}
            <button className="btn btn-outline admin-login-back" onClick={() => { setAdmin(null); setPin(''); setError('') }}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
