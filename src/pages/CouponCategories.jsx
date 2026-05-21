import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getAllCouponCategories, deleteCouponCategory } from '../api/coupons'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

const LANG_FLAGS = { en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷' }
const LANG_LABELS = { en: 'English', es: 'Spanish', fr: 'French' }

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

  // Extract English text from multilingual object or plain string
  const getLocalizedText = (field) => {
    if (!field) return '—'
    if (typeof field === 'string') return field
    return field.en || field.es || field.fr || Object.values(field)[0] || '—'
  }

  // Render all available translations as small badges
  const renderTranslations = (nameObj) => {
    if (!nameObj || typeof nameObj === 'string') {
      return <strong>{nameObj || '—'}</strong>
    }

    const entries = Object.entries(nameObj).filter(([, v]) => v && v.trim())
    if (entries.length === 0) return <span className="text-muted">—</span>

    return (
      <div>
        <strong>{getLocalizedText(nameObj)}</strong>
        <div className="d-flex flex-wrap gap-1 mt-1">
          {entries.map(([lang, value]) => (
            <span
              key={lang}
              className="badge bg-light text-dark border"
              style={{ fontSize: '0.75em', fontWeight: 'normal' }}
              title={`${LANG_LABELS[lang] || lang}: ${value}`}
            >
              {LANG_FLAGS[lang] || '🌐'} {lang.toUpperCase()}: {value}
            </span>
          ))}
        </div>
      </div>
    )
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
                        <th>Languages</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            No categories found
                          </td>
                        </tr>
                      ) : (
                        categories.map((category) => {
                          const langCount = category.name && typeof category.name === 'object'
                            ? Object.keys(category.name).filter(k => category.name[k]?.trim()).length
                            : 1
                          return (
                            <tr key={category.id}>
                              <td>{category.id}</td>
                              <td>
                                {renderTranslations(category.name)}
                              </td>
                              <td>
                                <span className="badge bg-primary">{langCount}/3</span>
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
                          )
                        })
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
