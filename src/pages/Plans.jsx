import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getAllPlans, deletePlan } from '../api/plans'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import GlobalLoader from '../components/GlobalLoader'

export default function Plans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await getAllPlans(token)
      if (response.success) {
        setPlans(response.data || [])
      } else {
        Swal.fire('Error', response.message || 'Failed to fetch plans', 'error')
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      Swal.fire('Error', 'An error occurred while fetching plans', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (planId, planName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete plan "${planName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        const response = await deletePlan(token, planId)
        if (response.success) {
          Swal.fire('Success!', response.message, 'success')
          fetchPlans()
        } else {
          Swal.fire('Error', response.message, 'error')
        }
      } catch (error) {
        console.error('Error deleting plan:', error)
        Swal.fire('Error', 'An error occurred while deleting plan', 'error')
      }
    }
  }

  const getStatusBadge = (isActive) => {
    return isActive
      ? <span className="badge bg-success">Active</span>
      : <span className="badge bg-danger">Inactive</span>
  }

  const getPlanTypeBadge = (planType) => {
    const badges = {
      'quarterly': <span className="badge bg-info">Quarterly</span>,
      'half_yearly': <span className="badge bg-primary">6 Months</span>,
      'annual': <span className="badge bg-warning">Annual</span>,
    }
    return badges[planType] || <span className="badge bg-secondary">{planType}</span>
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
                <h5>Subscription Plans</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <a className="btn btn-primary" onClick={() => navigate('/add-plan')} style={{ cursor: 'pointer' }}>
                      <i className="fas fa-plus me-2"></i>Add New Plan
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Price</th>
                          <th>Coach AI</th>
                          <th>Chart Analyzer</th>
                          <th>Trade Analyzer</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="8" className="text-center py-4">
                              <GlobalLoader visible={loading} size="medium" />
                            </td>
                          </tr>
                        ) : plans.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center text-muted py-4">
                              No plans found
                            </td>
                          </tr>
                        ) : (
                          plans.map((plan) => (
                            <tr key={plan.id}>
                              <td>{plan.name}</td>
                              <td>{getPlanTypeBadge(plan.plan_type)}</td>
                              <td>${plan.price}</td>
                              <td>{plan.quotas.coach_ai}</td>
                              <td>{plan.quotas.chart_analyzer}</td>
                              <td>{plan.quotas.trade_analyzer}</td>
                              <td>{getStatusBadge(plan.is_active)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-info me-1"
                                  onClick={() => navigate(`/edit-plan/${plan.id}`)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(plan.id, plan.name)}
                                >
                                  <i className="fas fa-trash"></i>
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