import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'

// ─── Step indicators ──────────────────────────────────────────────────────────

function StepBar({ current }) {
  const steps = ['Login', 'Scan QR', 'Enter Code']
  // current: 0 = credentials, 1 = qr setup, 2 = totp code
  return (
    <div className="d-flex align-items-center justify-content-center mb-4 gap-0">
      {steps.map((label, i) => {
        const done    = i < current
        const active  = i === current
        return (
          <React.Fragment key={label}>
            <div className="d-flex flex-column align-items-center" style={{ minWidth: 72 }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: done ? '#198754' : active ? '#0d6efd' : '#dee2e6',
                  color: done || active ? '#fff' : '#6c757d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  transition: 'background 0.3s',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 11, marginTop: 4, color: active ? '#0d6efd' : '#6c757d' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                height: 2, flex: 1, marginBottom: 18,
                background: done ? '#198754' : '#dee2e6',
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Stage 1: QR Setup ────────────────────────────────────────────────────────

function TwoFASetupView({ qrCode, secret, onConfirm, isLoading }) {
  const [code, setCode]       = useState('')
  const [copied, setCopied]   = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.trim().length === 6) onConfirm(code.trim())
  }

  return (
    <>
      <StepBar current={1} />

      <h5 className="fw-bold mb-1 text-center">Scan QR Code</h5>
      <p className="text-muted text-center mb-3" style={{ fontSize: 13 }}>
        Open <strong>Google Authenticator</strong> or any TOTP app on your phone,
        tap <em>"+"</em> and scan the QR code below.
      </p>

      {/* QR code */}
      <div className="text-center mb-3">
        <div
          style={{
            display: 'inline-block',
            padding: 12,
            border: '2px solid #dee2e6',
            borderRadius: 12,
            background: '#fff',
          }}
        >
          {qrCode
            ? <img src={qrCode} alt="2FA QR Code" style={{ width: 180, height: 180, display: 'block' }} />
            : (
              <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-border text-primary" />
              </div>
            )
          }
        </div>
      </div>

      {/* Manual key */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
          Can't scan? Enter this key manually in your app:
        </label>
        <div className="input-group input-group-sm">
          <input
            type="text"
            className="form-control font-monospace text-center"
            value={secret || ''}
            readOnly
            style={{ letterSpacing: 2, fontSize: 13 }}
          />
          <button
            type="button"
            className={`btn ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={handleCopy}
            style={{ minWidth: 64 }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <hr className="my-3" />

      {/* Code confirmation */}
      <p className="text-muted mb-2" style={{ fontSize: 13 }}>
        After scanning, enter the <strong>6-digit code</strong> shown in your app:
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            pattern="\d{6}"
            className="form-control text-center fw-bold"
            style={{ fontSize: 28, letterSpacing: 8 }}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
          />
        </div>
        <div className="form-group clearfix mt-2">
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? (
              <><span className="spinner-border spinner-border-sm me-2" />Verifying…</>
            ) : 'Activate & Continue'}
          </button>
        </div>
      </form>
    </>
  )
}

// ─── Stage 2: TOTP Login ──────────────────────────────────────────────────────

function TwoFALoginView({ onSubmit, isLoading }) {
  const [code, setCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.trim().length === 6) onSubmit(code.trim())
  }

  return (
    <>
      <StepBar current={2} />

      <h5 className="fw-bold mb-1 text-center">Enter Authentication Code</h5>
      <p className="text-muted text-center mb-4" style={{ fontSize: 13 }}>
        Open your authenticator app and enter the current <strong>6-digit code</strong>.
      </p>

      {/* Authenticator icon hint */}
      <div className="text-center mb-3">
        <div
          style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg,#4285f4,#34a853)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 28 }}>🔑</span>
        </div>
        <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
          Google Authenticator / any TOTP app
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label float-start fw-semibold">Authentication Code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            pattern="\d{6}"
            className="form-control text-center fw-bold"
            style={{ fontSize: 28, letterSpacing: 8 }}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
          />
          <small className="text-muted float-start mt-1">Code refreshes every 30 seconds</small>
        </div>
        <div className="form-group clearfix mt-3">
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? (
              <><span className="spinner-border spinner-border-sm me-2" />Verifying…</>
            ) : 'Verify & Login'}
          </button>
        </div>
      </form>
    </>
  )
}

// ─── Main Login Page ──────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate()
  const {
    login, confirmSetup2FA, submitTwoFACode,
    isAuthenticated, loading,
    authStage, twoFAQrCode, twoFASecret,
  } = useAuth()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, loading, navigate])

  // Stage 0: credentials
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await login(email, password)
    if (!result.success) {
      Swal.fire({ icon: 'error', title: 'Login Failed', text: result.message || 'Please try again.' })
    }
    setIsLoading(false)
  }

  // Stage 1: confirm QR setup
  const handleConfirmSetup = async (code) => {
    setIsLoading(true)
    const result = await confirmSetup2FA(code)
    if (!result.success) {
      Swal.fire({ icon: 'error', title: 'Invalid Code', text: result.message || 'Code did not match. Try again.' })
    }
    // On success, authStage → '2fa_login' and UI auto-swaps
    setIsLoading(false)
  }

  // Stage 2: TOTP login
  const handleTwoFALogin = async (code) => {
    setIsLoading(true)
    const result = await submitTwoFACode(code)
    if (result.success) {
      Swal.fire({
        icon: 'success', title: 'Login Successful',
        text: 'Welcome back to the dashboard!',
        timer: 1500, timerProgressBar: true, showConfirmButton: false,
      }).then(() => navigate('/dashboard'))
    } else {
      Swal.fire({ icon: 'error', title: 'Invalid Code', text: result.message || 'Code did not match. Try again.' })
    }
    setIsLoading(false)
  }

  const renderInner = () => {
    if (authStage === '2fa_setup') {
      return <TwoFASetupView qrCode={twoFAQrCode} secret={twoFASecret} onConfirm={handleConfirmSetup} isLoading={isLoading} />
    }
    if (authStage === '2fa_login') {
      return <TwoFALoginView onSubmit={handleTwoFALogin} isLoading={isLoading} />
    }

    // Default: credential form
    return (
      <>
        <StepBar current={0} />
        <h5 className="mb-4 text-center">Login to your dashboard</h5>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="first_field" className="form-label float-start">Email address</label>
            <input
              name="email" type="email" className="form-control"
              id="first_field" placeholder="Email Address"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="second_field" className="form-label float-start">Password</label>
            <input
              name="password" type="password" className="form-control"
              autoComplete="off" id="second_field" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>
        
          <div className="form-group clearfix">
            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isLoading}>
              {isLoading
                ? <><span className="spinner-border spinner-border-sm me-2" />Logging in…</>
                : 'Login'}
            </button>
          </div>
        </form>
      </>
    )
  }

  return (
    <div className="login-30 tab-box">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-12">
            <div className="form-section mt-3 rounded">
              <div className="login-inner-form">
                <div className="details">
                  <div className="text-center mb-4">
                    <img src="/assets/img/logo.png" className="img-fluid" style={{ maxWidth: 200 }} alt="Logo" />
                  </div>
                  {renderInner()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}