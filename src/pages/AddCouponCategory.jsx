import React, { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { createCouponCategory } from '../api/coupons'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

export default function AddCouponCategory() {
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  const handleInputChange = (e) => {
    setCategoryName(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!categoryName.trim()) {
      Swal.fire('Error', 'Category name is required', 'error')
      return
    }

    try {
      setLoading(true)
      
      const response = await createCouponCategory(token, categoryName.trim())
      
      if (response.success) {
        Swal.fire('Success', 'Coupon category created successfully!', 'success')
        // Reset form
        setCategoryName('')
      } else {
        Swal.fire('Error', response.message || 'Failed to create coupon category', 'error')
      }
    } catch (error) {
      console.error('Error creating coupon category:', error)
      Swal.fire('Error', 'An error occurred while creating the coupon category', 'error')
    } finally {
      setLoading(false)
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
                <h1 className="page-title">Add New Coupon Category</h1>
                <p className="text-muted">
                  Create a new category for organizing your coupons
                </p>
              </div>
              <div className="col-auto">
                <a href="/coupon-categories" className="btn btn-outline-secondary">
                  <i className="fas fa-arrow-left me-2"></i>Back to Categories
                </a>
              </div>
            </div>
          </div>

          {/* Category Form */}
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="categoryName" className="form-label">
                        Category Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="categoryName"
                        value={categoryName}
                        onChange={handleInputChange}
                        placeholder="Enter category name"
                        required
                      />
                      <small className="form-text text-muted">
                        Examples: Free Shipping, Discount Offers, Special Promotions
                      </small>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <a href="/coupon-categories" className="btn btn-outline-secondary">
                    Cancel
                  </a>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Create Category
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
