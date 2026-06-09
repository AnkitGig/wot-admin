import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getAllToolFlags, updateToolFlag } from '../api/tools'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'
import GlobalLoader from '../components/GlobalLoader'

export default function ToolFlags() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const { token } = useAuth()

  useEffect(() => {
    fetchToolFlags()
  }, [])

  const fetchToolFlags = async () => {
    try {
      setLoading(true)
      const response = await getAllToolFlags(token)
      if (response.success) {
        setTools(response.data || [])
      } else {
        Swal.fire('Error', response.message || 'Failed to fetch tool flags', 'error')
      }
    } catch (error) {
      console.error('Error fetching tool flags:', error)
      Swal.fire('Error', 'An error occurred while fetching tool flags', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTool = async (toolName, currentStatus) => {
    if (currentStatus) {
      // Disabling — show a custom form with 3 language inputs
      const result = await Swal.fire({
        title: 'Disable Tool?',
        html: `
          <p class="text-muted mb-3">Are you sure you want to disable <strong>"${toolName}"</strong>?</p>
          <div class="text-start">
            <label class="form-label fw-semibold small">🇬🇧 English (EN)</label>
            <input id="swal-reason-en" class="swal2-input" placeholder="e.g. System is updating" />

            <label class="form-label fw-semibold small mt-2">🇫🇷 French (FR)</label>
            <input id="swal-reason-fr" class="swal2-input" placeholder="e.g. Le système se met à jour" />

            <label class="form-label fw-semibold small mt-2">🇪🇸 Spanish (ES)</label>
            <input id="swal-reason-es" class="swal2-input" placeholder="e.g. El sistema se está actualizando" />
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, disable it!',
        focusConfirm: false,
        preConfirm: () => {
          const en = document.getElementById('swal-reason-en').value.trim();
          const fr = document.getElementById('swal-reason-fr').value.trim();
          const es = document.getElementById('swal-reason-es').value.trim();
          if (!en) {
            Swal.showValidationMessage('English reason is required!');
            return false;
          }
          return { en, fr: fr || en, es: es || en };
        },
      });

      if (result.isConfirmed) {
        try {
          setUpdating(prev => ({ ...prev, [toolName]: true }))
          const response = await updateToolFlag(token, toolName, false, result.value)
          if (response.success) {
            Swal.fire('Disabled!', response.message, 'success')
            fetchToolFlags()
          } else {
            Swal.fire('Error', response.message, 'error')
          }
        } catch (error) {
          console.error('Error updating tool flag:', error)
          Swal.fire('Error', 'An error occurred while updating tool flag', 'error')
        } finally {
          setUpdating(prev => ({ ...prev, [toolName]: false }))
        }
      }
    } else {
      // Enabling — simple confirmation, no reason needed
      const result = await Swal.fire({
        title: 'Enable Tool?',
        text: `Are you sure you want to enable "${toolName}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, enable it!',
      })

      if (result.isConfirmed) {
        try {
          setUpdating(prev => ({ ...prev, [toolName]: true }))
          const response = await updateToolFlag(token, toolName, true, null)
          if (response.success) {
            Swal.fire('Enabled!', response.message, 'success')
            fetchToolFlags()
          } else {
            Swal.fire('Error', response.message, 'error')
          }
        } catch (error) {
          console.error('Error updating tool flag:', error)
          Swal.fire('Error', 'An error occurred while updating tool flag', 'error')
        } finally {
          setUpdating(prev => ({ ...prev, [toolName]: false }))
        }
      }
    }
  }

  const getStatusBadge = (isEnabled) => {
    return isEnabled
      ? <span className="badge bg-success">Enabled</span>
      : <span className="badge bg-danger">Disabled</span>
  }

  const formatToolName = (toolName) => {
    return toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Tool Flags Management</h5>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">All Tools</h3>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead>
                        <tr>
                          <th>Tool Name</th>
                          <th>Status</th>
                          <th>Disabled Reason</th>
                          <th>Toggled By</th>
                          <th>Toggled At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4">
                              <GlobalLoader visible={loading} size="medium" />
                            </td>
                          </tr>
                        ) : tools.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted py-4">
                              No tools found
                            </td>
                          </tr>
                        ) : (
                          tools.map((tool) => (
  <tr key={tool.tool_name}>
    <td>
      <strong>{formatToolName(tool.tool_name)}</strong>
      <br />
      <small className="text-muted">{tool.tool_name}</small>
    </td>
    <td>{getStatusBadge(tool.is_enabled)}</td>
    <td>
      {(() => {
        const reason = typeof tool.disabled_reason === 'string' ? (() => {
          try { return JSON.parse(tool.disabled_reason); } catch { return tool.disabled_reason; }
        })() : tool.disabled_reason;
        const reasonString = reason
          ? typeof reason === 'object'
            ? Object.entries(reason)
                .filter(([_, v]) => v)
                .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                .join(' | ')
            : String(reason)
          : '-';
        return (
          <span
            className="text-truncate d-inline-block"
            style={{ maxWidth: '200px' }}
            title={reasonString}
          >
            {(() => {
              if (reason) {
                if (typeof reason === 'object') {
                  return (
                    <div className="d-flex flex-column gap-1">
                      {reason.en && (
                        <span>
                          <span className="badge bg-secondary me-1">EN</span>
                          {reason.en}
                        </span>
                      )}
                      {reason.fr && (
                        <span>
                          <span className="badge bg-info me-1">FR</span>
                          {reason.fr}
                        </span>
                      )}
                      {reason.es && (
                        <span>
                          <span className="badge bg-warning text-dark me-1">ES</span>
                          {reason.es}
                        </span>
                      )}
                    </div>
                  );
                }
                return <span>{reason}</span>;
              }
              return <span className="text-muted">-</span>;
            })()}
          </span>
        );
      })()}
    </td>
    <td>{tool.toggled_by || <span className="text-muted">System</span>}</td>
    <td><small>{formatDate(tool.toggled_at)}</small></td>
    <td>
      <button
        className={`btn btn-sm ${tool.is_enabled ? 'btn-danger' : 'btn-success'}`}
        onClick={() => handleToggleTool(tool.tool_name, tool.is_enabled)}
        disabled={updating[tool.tool_name]}
      >
        {updating[tool.tool_name] ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...
          </>
        ) : tool.is_enabled ? (
          <>
            <i className="fas fa-times"></i> Disable
          </>
        ) : (
          <>
            <i className="fas fa-check"></i> Enable
          </>
        )}
      </button>
    </td>
  </tr>
))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}