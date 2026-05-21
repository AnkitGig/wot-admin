import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getAllCoupons, updateCoupon, getAllCouponCategories } from '../api/coupons'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', placeholder: 'Enter in English' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', placeholder: 'Enter in Spanish' },
  { code: 'fr', label: 'French', flag: '🇫🇷', placeholder: 'Enter in French' },
]

// Helper to extract text from multilingual object or plain string
const getLocalizedText = (field) => {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.es || field.fr || Object.values(field)[0] || ''
}

// Helper to convert a field (string or object) into a multilingual object {en, es, fr}
const toMultilingual = (field) => {
  if (!field) return { en: '', es: '', fr: '' }
  if (typeof field === 'string') return { en: field, es: '', fr: '' }
  return {
    en: field.en || '',
    es: field.es || '',
    fr: field.fr || '',
  }
}

export default function EditCoupon() {
  const { couponId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: { en: '', es: '', fr: '' },
    code: '',
    description: { en: '', es: '', fr: '' },
    category: { en: '', es: '', fr: '' },
    expires_at: '',
    image: null
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState('')
  const [existingImage, setExistingImage] = useState('')
  const [activeTab, setActiveTab] = useState('en')
  const { token } = useAuth()

  useEffect(() => {
    fetchCoupon()
    fetchCategories()
  }, [couponId])

  const fetchCoupon = async () => {
    try {
      setFetchLoading(true)
      const response = await getAllCoupons(token)
      if (response.success) {
        const coupon = response.data.coupons.find(c => c.coupon_id === couponId)
        if (coupon) {
          setFormData({
            title: toMultilingual(coupon.title),
            code: coupon.code || '',
            description: toMultilingual(coupon.description),
            category: toMultilingual(coupon.category),
            expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : '',
            image: null
          })
          setExistingImage(coupon.image_url)
        } else {
          Swal.fire('Error', 'Coupon not found', 'error')
          navigate('/coupons')
        }
      } else {
        Swal.fire('Error', response.message || 'Failed to fetch coupon', 'error')
        navigate('/coupons')
      }
    } catch (error) {
      console.error('Error fetching coupon:', error)
      Swal.fire('Error', 'An error occurred while fetching the coupon', 'error')
      navigate('/coupons')
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await getAllCouponCategories(token)
      if (response.success) {
        setCategories(response.data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleMultilingualChange = (field, langCode, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [langCode]: value
      }
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value
    // Find the category from the list to get all translations
    const selectedCat = categories.find(cat => {
      const catName = typeof cat.name === 'object' ? JSON.stringify(cat.name) : cat.name
      return catName === selectedValue
    })
    if (selectedCat) {
      setFormData(prev => ({
        ...prev,
        category: toMultilingual(selectedCat.name)
      }))
    } else {
      // "All" or custom value
      setFormData(prev => ({
        ...prev,
        category: { en: selectedValue, es: '', fr: '' }
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation — English title is required
    if (!formData.title.en.trim()) {
      Swal.fire('Error', 'Title (English) is required', 'error')
      setActiveTab('en')
      return
    }

    if (!formData.expires_at) {
      Swal.fire('Error', 'Expiry date is required', 'error')
      return
    }

    try {
      setLoading(true)
      
      // Build multilingual payloads (only include non-empty values)
      const buildPayload = (obj) => {
        const result = {}
        Object.entries(obj).forEach(([lang, val]) => {
          if (val && val.trim()) result[lang] = val.trim()
        })
        return JSON.stringify(result)
      }

      // Prepare data for API
      const couponData = {
        title: buildPayload(formData.title),
        code: formData.code || '',
        description: buildPayload(formData.description),
        category: buildPayload(formData.category),
        expires_at: formData.expires_at
      }

      // Add image if selected
      if (formData.image) {
        couponData.image = formData.image
      }

      const response = await updateCoupon(token, couponId, couponData)
      
      if (response.success) {
        Swal.fire('Success', 'Coupon updated successfully!', 'success')
        navigate('/coupons')
      } else {
        Swal.fire('Error', response.message || 'Failed to update coupon', 'error')
      }
    } catch (error) {
      console.error('Error updating coupon:', error)
      Swal.fire('Error', 'An error occurred while updating the coupon', 'error')
    } finally {
      setLoading(false)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }))
    setImagePreview('')
    document.getElementById('imageInput').value = ''
  }

  const getFilledCount = () => {
    let count = 0
    LANGUAGES.forEach(lang => {
      if (
        formData.title[lang.code]?.trim() ||
        formData.description[lang.code]?.trim()
      ) {
        count++
      }
    })
    return count
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

  // Get the current category value for the select
  const currentCategoryValue = typeof formData.category === 'object'
    ? JSON.stringify(formData.category)
    : formData.category

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
                <h1 className="page-title">Edit Coupon</h1>
                <p className="text-muted">
                  Update coupon information in multiple languages
                </p>
              </div>
              <div className="col-auto">
                <a href="/coupons" className="btn btn-outline-secondary">
                  <i className="fas fa-arrow-left me-2"></i>Back to Coupons
                </a>
              </div>
            </div>
          </div>

          {/* Coupon Form */}
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>

                {/* Language info banner */}
                <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                  <i className="fas fa-globe me-2"></i>
                  <div>
                    <strong>Multilingual Support</strong> — Update coupon details in up to 3 languages.
                    English is required, Spanish and French are optional.
                    <span className="ms-2 badge bg-primary">{getFilledCount()}/3 languages filled</span>
                  </div>
                </div>

                {/* Code & Expiry (non-multilingual) */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="code" className="form-label">
                        Coupon Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="Enter coupon code"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="expires_at" className="form-label">
                        Expiry Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="expires_at"
                        name="expires_at"
                        value={formData.expires_at}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="category" className="form-label">
                        Category
                      </label>
                      <select
                        className="form-select"
                        id="category"
                        value={currentCategoryValue}
                        onChange={handleCategoryChange}
                      >
                        <option value="All">All</option>
                        {categories.map((category) => {
                          const catValue = typeof category.name === 'object'
                            ? JSON.stringify(category.name)
                            : category.name
                          // Use activeTab language for label; fallback to English
                          const catLabel = (category.name && typeof category.name === 'object')
                            ? category.name[activeTab] || category.name.en || ''
                            : category.name
                          return (
                            <option key={category.id} value={catValue}>
                              {catLabel}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Language Tabs for Title & Description */}
                <h6 className="mb-3">
                  <i className="fas fa-language me-2"></i>Multilingual Content
                </h6>

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
                        {(formData.title[lang.code]?.trim() || formData.description[lang.code]?.trim()) && (
                          <i className="fas fa-check-circle text-success ms-2" style={{ fontSize: '0.8em' }}></i>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="tab-content">
                  {LANGUAGES.map((lang) => (
                    <div
                      key={lang.code}
                      className={`tab-pane fade ${activeTab === lang.code ? 'show active' : ''}`}
                      role="tabpanel"
                    >
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor={`title_${lang.code}`} className="form-label">
                              <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>{' '}
                              Title ({lang.label})
                              {lang.code === 'en' && <span className="text-danger ms-1">*</span>}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id={`title_${lang.code}`}
                              value={formData.title[lang.code]}
                              onChange={(e) => handleMultilingualChange('title', lang.code, e.target.value)}
                              placeholder={`${lang.placeholder} (title)`}
                              required={lang.code === 'en'}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor={`description_${lang.code}`} className="form-label">
                          <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>{' '}
                          Description ({lang.label})
                        </label>
                        <textarea
                          className="form-control"
                          id={`description_${lang.code}`}
                          value={formData.description[lang.code]}
                          onChange={(e) => handleMultilingualChange('description', lang.code, e.target.value)}
                          rows="3"
                          placeholder={`${lang.placeholder} (description)`}
                        ></textarea>
                      </div>
                      {lang.code !== 'en' && (
                        <small className="form-text text-muted">
                          Optional — leave blank if translation is not available
                        </small>
                      )}
                    </div>
                  ))}
                </div>

                <hr className="my-4" />

                {/* Image */}
                <div className="mb-4">
                  <label htmlFor="imageInput" className="form-label">
                    Coupon Image
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="imageInput"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  
                  {/* Show existing image */}
                  {existingImage && !imagePreview && (
                    <div className="mt-3">
                      <p className="text-muted small">Current image:</p>
                      <img
                        src={existingImage}
                        alt="Current coupon"
                        className="img-thumbnail"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}
                  
                  {/* Show new image preview */}
                  {imagePreview && (
                    <div className="mt-3 position-relative d-inline-block">
                      <p className="text-muted small">New image preview:</p>
                      <img
                        src={imagePreview}
                        alt="Coupon preview"
                        className="img-thumbnail"
                        style={{ maxHeight: '200px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                        onClick={removeImage}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <a href="/coupons" className="btn btn-outline-secondary">
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
                        Update Coupon
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
