import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getAllCoupons, deleteCoupon } from '../api/coupons'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

export default function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await getAllCoupons(token)
      if (response.success) {
        setCoupons(response.data.coupons || [])
      } else {
        Swal.fire('Error', response.message || 'Failed to fetch coupons', 'error')
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      Swal.fire('Error', 'An error occurred while fetching coupons', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (isActive) => {
    return isActive
      ? <span className="badge bg-success">Active</span>
      : <span className="badge bg-danger">Inactive</span>
  }

  const handleDelete = async (couponId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        const response = await deleteCoupon(token, couponId)
        if (response.success) {
          Swal.fire('Success', 'Coupon deleted successfully', 'success')
          fetchCoupons()
        } else {
          Swal.fire('Error', response.message || 'Failed to delete coupon', 'error')
        }
      } catch (error) {
        console.error('Error deleting coupon:', error)
        Swal.fire('Error', 'An error occurred while deleting the coupon', 'error')
      }
    }
  }

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">

          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h1 className="page-title">Coupons</h1>
                <p className="text-muted">
                  Manage discount coupons for your courses
                </p>
              </div>

              <div className="col-auto">
                <a href="/coupon-categories" className="btn btn-primary me-2">
                  <i className="fas fa-plus me-2"></i>Add Coupon Category
                </a>
                <a href="/add-coupon" className="btn btn-primary me-2">
                  <i className="fas fa-plus me-2"></i>Add Coupon
                </a>
              </div>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Expires At</th>
                        <th>Status</th>
                        <th>Usage</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            No coupons found
                          </td>
                        </tr>
                      ) : (
                        coupons.map((coupon) => (
                          <tr key={coupon.coupon_id}>
                            <td>
                              <strong>{coupon.code}</strong>
                            </td>
                            <td>{coupon.title}</td>
                            <td>
                              <span className="text-truncate d-block" style={{ maxWidth: '200px' }}>
                                {coupon.description}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-info">{coupon.category}</span>
                            </td>
                            <td>{formatDate(coupon.expires_at)}</td>
                            <td>{getStatusBadge(coupon.is_active)}</td>
                            <td>
                              <small>
                                {coupon.total_used}/{coupon.total_assigned}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  title="Edit"
                                  onClick={() => navigate(`/edit-coupon/${coupon.coupon_id}`)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete"
                                  onClick={() => handleDelete(coupon.coupon_id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
