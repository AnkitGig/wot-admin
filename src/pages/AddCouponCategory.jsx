import React, { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { createCouponCategory } from '../api/coupons'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', placeholder: 'Enter category name in English' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', placeholder: 'Enter category name in Spanish' },
  { code: 'fr', label: 'French', flag: '🇫🇷', placeholder: 'Enter category name in French' },
]

export default function AddCouponCategory() {
  const [categoryNames, setCategoryNames] = useState({ en: '', es: '', fr: '' })
  const [activeTab, setActiveTab] = useState('en')
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

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

      const response = await createCouponCategory(token, namePayload)
      
      if (response.success) {
        Swal.fire('Success', 'Coupon category created successfully!', 'success')
        // Reset form
        setCategoryNames({ en: '', es: '', fr: '' })
        setActiveTab('en')
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

  const getFilledCount = () => {
    return Object.values(categoryNames).filter(v => v.trim()).length
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
                  Create a new category for organizing your coupons in multiple languages
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
                    <strong>Multilingual Support</strong> — Enter the category name in up to 3 languages. 
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
