import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getAllCouponCategories, updateCouponCategory } from '../api/coupons'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

export default function EditCouponCategory() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    fetchCategory()
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      setFetchLoading(true)
      const response = await getAllCouponCategories(token)
      if (response.success) {
        const category = response.data.categories.find(cat => cat.id === parseInt(categoryId))
        if (category) {
          setCategoryName(category.name)
        } else {
          Swal.fire('Error', 'Category not found', 'error')
          navigate('/coupon-categories')
        }
      } else {
        Swal.fire('Error', response.message || 'Failed to fetch category', 'error')
        navigate('/coupon-categories')
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      Swal.fire('Error', 'An error occurred while fetching the category', 'error')
      navigate('/coupon-categories')
    } finally {
      setFetchLoading(false)
    }
  }

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
      
      const response = await updateCouponCategory(token, categoryId, categoryName.trim())
      
      if (response.success) {
        Swal.fire('Success', 'Coupon category updated successfully!', 'success')
        navigate('/coupon-categories')
      } else {
        Swal.fire('Error', response.message || 'Failed to update coupon category', 'error')
      }
    } catch (error) {
      console.error('Error updating coupon category:', error)
      Swal.fire('Error', 'An error occurred while updating the coupon category', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
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
                <h1 className="page-title">Edit Coupon Category</h1>
                <p className="text-muted">
                  Update coupon category information
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Update Category
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
