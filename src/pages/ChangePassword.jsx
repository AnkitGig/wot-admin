import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { changePassword } from '../api/auth'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await changePassword(email, oldPassword, newPassword, code)
    setIsLoading(false)

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: result.message || 'Password changed successfully. Please login with your new password.',
        confirmButtonColor: '#5e50ee',
      }).then(() => {
        navigate('/login')
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: result.message || 'Failed to change password. Please check your credentials and 2FA code.',
        confirmButtonColor: '#5e50ee',
      })
    }
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
                  
                  <h5 className="mb-4 text-center">Change Admin Password</h5>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="email_field" className="form-label float-start">Email address</label>
                      <input
                        name="email" type="email" className="form-control"
                        id="email_field" placeholder="Email Address"
                        value={email} onChange={(e) => setEmail(e.target.value)} required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="old_password_field" className="form-label float-start">Current Password</label>
                      <div className="position-relative" style={{ clear: 'both' }}>
                        <input
                          name="old_password" type={showOldPassword ? "text" : "password"} className="form-control pe-5"
                          autoComplete="off" id="old_password_field" placeholder="Current Password"
                          value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required
                        />
                        <button
                          type="button"
                          className="border-0 bg-transparent text-secondary"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          style={{
                            position: 'absolute',
                            right: '15px',
                            top: '0',
                            bottom: '0',
                            zIndex: 10,
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            outline: 'none',
                            boxShadow: 'none'
                          }}
                        >
                          <i className={showOldPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="new_password_field" className="form-label float-start">New Password</label>
                      <div className="position-relative" style={{ clear: 'both' }}>
                        <input
                          name="new_password" type={showNewPassword ? "text" : "password"} className="form-control pe-5"
                          autoComplete="off" id="new_password_field" placeholder="New Password"
                          value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                        />
                        <button
                          type="button"
                          className="border-0 bg-transparent text-secondary"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '15px',
                            top: '0',
                            bottom: '0',
                            zIndex: 10,
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            outline: 'none',
                            boxShadow: 'none'
                          }}
                        >
                          <i className={showNewPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="code_field" className="form-label float-start">2FA Verification Code</label>
                      <input
                        name="code" type="text" className="form-control"
                        maxLength="6" pattern="\d{6}"
                        id="code_field" placeholder="6-digit 2FA Code"
                        value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required
                      />
                    </div>

                    <div className="form-group clearfix">
                      <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isLoading}>
                        {isLoading
                          ? <><span className="spinner-border spinner-border-sm me-2" />Changing Password…</>
                          : 'Change Password'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => navigate('/login')} 
                        className="btn btn-outline-secondary btn-lg w-100 mt-3"
                        disabled={isLoading}
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
