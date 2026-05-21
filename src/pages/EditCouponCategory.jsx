import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getAllCouponCategories, updateCouponCategory } from '../api/coupons'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', placeholder: 'Enter category name in English' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', placeholder: 'Enter category name in Spanish' },
  { code: 'fr', label: 'French', flag: '🇫🇷', placeholder: 'Enter category name in French' },
]

export default function EditCouponCategory() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [categoryNames, setCategoryNames] = useState({ en: '', es: '', fr: '' })
  const [activeTab, setActiveTab] = useState('en')
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
          // Handle both string and object name formats
          if (typeof category.name === 'string') {
            setCategoryNames({ en: category.name, es: '', fr: '' })
          } else {
            setCategoryNames({
              en: category.name?.en || '',
              es: category.name?.es || '',
              fr: category.name?.fr || '',
            })
          }
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

  const handleInputChange = (langCode, value) => {
    setCategoryNames(prev => ({
      ...prev,
      [langCode]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation — English is required
    if (!categoryNames.en.trim()) {
      Swal.fire('Error', 'Category name in English is required', 'error')
      setActiveTab('en')
      return
    }

    try {
      setLoading(true)
      
      // Build the multilingual name object (only include non-empty values)
      const namePayload = {}
      Object.entries(categoryNames).forEach(([lang, value]) => {
        if (value.trim()) {
          namePayload[lang] = value.trim()
        }
      })

      const response = await updateCouponCategory(token, categoryId, namePayload)
      
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

  const getFilledCount = () => {
    return Object.values(categoryNames).filter(v => v.trim()).length
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
                  Update coupon category information in multiple languages
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

                {/* Language info banner */}
                <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                  <i className="fas fa-globe me-2"></i>
                  <div>
                    <strong>Multilingual Support</strong> — Update the category name in up to 3 languages. 
                    English is required, Spanish and French are optional.
                    <span className="ms-2 badge bg-primary">{getFilledCount()}/3 languages filled</span>
                  </div>
                </div>

                {/* Language Tabs */}
                <ul className="nav nav-tabs mb-3" role="tablist">
                  {LANGUAGES.map((lang) => (
                    <li className="nav-item" key={lang.code} role="presentation">
                      <button
                        type="button"
                        className={`nav-link ${activeTab === lang.code ? 'active' : ''}`}
                        onClick={() => setActiveTab(lang.code)}
                        role="tab"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="me-1" style={{ fontSize: '1.1em' }}>{lang.flag}</span>
                        {lang.label}
                        {lang.code === 'en' && <span className="text-danger ms-1">*</span>}
                        {categoryNames[lang.code].trim() && (
                          <i className="fas fa-check-circle text-success ms-2" style={{ fontSize: '0.8em' }}></i>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Language Inputs */}
                <div className="tab-content">
                  {LANGUAGES.map((lang) => (
                    <div
                      key={lang.code}
                      className={`tab-pane fade ${activeTab === lang.code ? 'show active' : ''}`}
                      role="tabpanel"
                    >
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <label htmlFor={`categoryName_${lang.code}`} className="form-label">
                              <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>{' '}
                              Category Name ({lang.label})
                              {lang.code === 'en' && <span className="text-danger ms-1">*</span>}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id={`categoryName_${lang.code}`}
                              value={categoryNames[lang.code]}
                              onChange={(e) => handleInputChange(lang.code, e.target.value)}
                              placeholder={lang.placeholder}
                              required={lang.code === 'en'}
                            />
                            {lang.code !== 'en' && (
                              <small className="form-text text-muted">
                                Optional — leave blank if translation is not available
                              </small>
                            )}
                            {lang.code === 'en' && (
                              <small className="form-text text-muted">
                                Required — this is the primary language
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preview Section */}
                {categoryNames.en.trim() && (
                  <div className="card bg-light border mt-3 mb-4">
                    <div className="card-body py-3">
                      <h6 className="card-subtitle mb-2 text-muted">
                        <i className="fas fa-eye me-2"></i>Preview
                      </h6>
                      <div className="d-flex flex-wrap gap-3">
                        {LANGUAGES.map((lang) => (
                          categoryNames[lang.code].trim() && (
                            <div key={lang.code} className="d-flex align-items-center">
                              <span className="me-1">{lang.flag}</span>
                              <span className="badge bg-info me-1">{lang.code.toUpperCase()}</span>
                              <span>{categoryNames[lang.code]}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}

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
