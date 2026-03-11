import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getAllCouponCategories, deleteCouponCategory } from '../api/coupons'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

export default function CouponCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await getAllCouponCategories(token)
      if (response.success) {
        setCategories(response.data.categories || [])
      } else {
        Swal.fire('Error', response.message || 'Failed to fetch categories', 'error')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      Swal.fire('Error', 'An error occurred while fetching categories', 'error')
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

  const handleDelete = async (categoryId) => {
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
        const response = await deleteCouponCategory(token, categoryId)
        if (response.success) {
          Swal.fire('Success', 'Category deleted successfully', 'success')
          fetchCategories()
        } else {
          Swal.fire('Error', response.message || 'Failed to delete category', 'error')
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        Swal.fire('Error', 'An error occurred while deleting the category', 'error')
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
                <h1 className="page-title">Coupon Categories</h1>
                <p className="text-muted">
                  Manage coupon categories for better organization
                </p>
              </div>
              <div className="col-auto">
                 <a href="/add-coupon" className="btn btn-primary me-2">
                  <i className="fas fa-plus me-2"></i>Add Coupon
                </a>
                <a href="/add-coupon-category" className="btn btn-primary">
                  <i className="fas fa-plus me-2"></i>Add New Category
                </a>
              </div>
            </div>
          </div>

          {/* Categories Table */}
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
                        <th>ID</th>
                        <th>Category Name</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4">
                            No categories found
                          </td>
                        </tr>
                      ) : (
                        categories.map((category) => (
                          <tr key={category.id}>
                            <td>{category.id}</td>
                            <td>
                              <strong>{category.name}</strong>
                            </td>
                            <td>{formatDate(category.created_at)}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <a href={`/edit-coupon-category/${category.id}`} className="btn btn-outline-primary" title="Edit">
                                  <i className="fas fa-edit"></i>
                                </a>
                                <button 
                                  className="btn btn-outline-danger" 
                                  title="Delete"
                                  onClick={() => handleDelete(category.id)}
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
