import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getAllCoupons, updateCoupon, getAllCouponCategories } from '../api/coupons'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

export default function EditCoupon() {
  const { couponId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    category: 'All',
    expires_at: '',
    image: null
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState('')
  const [existingImage, setExistingImage] = useState('')
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
            title: coupon.title,
            code: coupon.code,
            description: coupon.description,
            category: coupon.category,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
    
    // Validation
    if (!formData.title.trim()) {
      Swal.fire('Error', 'Title is required', 'error')
      return
    }

    if (!formData.expires_at) {
      Swal.fire('Error', 'Expiry date is required', 'error')
      return
    }

    try {
      setLoading(true)
      
      // Prepare data for API
      const couponData = {
        title: formData.title,
        code: formData.code || '',
        description: formData.description || '',
        category: formData.category,
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
                <h1 className="page-title">Edit Coupon</h1>
                <p className="text-muted">
                  Update coupon information
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
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter coupon title"
                        required
                      />
                    </div>
                  </div>
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
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="category" className="form-label">
                        Category
                      </label>
                      <select
                        className="form-select"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="All">All</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
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

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter coupon description"
                  ></textarea>
                </div>

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
