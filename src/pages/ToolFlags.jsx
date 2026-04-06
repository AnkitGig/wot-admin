import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getAllToolFlags, updateToolFlag } from '../api/tools'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

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
    const result = await Swal.fire({
      title: currentStatus ? 'Disable Tool?' : 'Enable Tool?',
      text: `Are you sure you want to ${currentStatus ? 'disable' : 'enable'} "${toolName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#d33' : '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: currentStatus ? 'Yes, disable it!' : 'Yes, enable it!',
      input: !currentStatus ? false : 'text',
      inputLabel: 'Disabled Reason',
      inputPlaceholder: 'Enter reason for disabling...',
      inputValidator: (value) => {
        if (!value && !currentStatus) {
          return 'You need to provide a reason for disabling!'
        }
      }
    })

    if (result.isConfirmed) {
      try {
        setUpdating(prev => ({ ...prev, [toolName]: true }))
        const response = await updateToolFlag(
          token, 
          toolName, 
          !currentStatus,
          result.value || null
        )
        
        if (response.success) {
          Swal.fire(
            'Success!', 
            response.message, 
            'success'
          )
          fetchToolFlags() // Refresh the list
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
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : tools.length === 0 ? (
                    <div className="text-center text-muted">
                      No tools found
                    </div>
                  ) : (
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
                          {tools.map((tool) => (
                            <tr key={tool.tool_name}>
                              <td>
                                <strong>{formatToolName(tool.tool_name)}</strong>
                                <br />
                                <small className="text-muted">{tool.tool_name}</small>
                              </td>
                              <td>{getStatusBadge(tool.is_enabled)}</td>
                              <td>
                                {tool.disabled_reason || (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td>
                                {tool.toggled_by || (
                                  <span className="text-muted">System</span>
                                )}
                              </td>
                              <td>
                                <small>{formatDate(tool.toggled_at)}</small>
                              </td>
                              <td>
                                <button
                                  className={`btn btn-sm ${tool.is_enabled ? 'btn-danger' : 'btn-success'}`}
                                  onClick={() => handleToggleTool(tool.tool_name, tool.is_enabled)}
                                  disabled={updating[tool.tool_name]}
                                >
                                  {updating[tool.tool_name] ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                      {' '}Updating...
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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