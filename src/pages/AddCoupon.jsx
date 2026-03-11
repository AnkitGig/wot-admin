import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { createCoupon, getAllCouponCategories } from '../api/coupons'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

export default function AddCoupon() {
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
  const [imagePreview, setImagePreview] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

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

      const response = await createCoupon(token, couponData)
      
      if (response.success) {
        Swal.fire('Success', 'Coupon created successfully!', 'success')
        // Reset form
        setFormData({
          title: '',
          code: '',
          description: '',
          category: 'All',
          expires_at: '',
          image: null
        })
        setImagePreview('')
      } else {
        Swal.fire('Error', response.message || 'Failed to create coupon', 'error')
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      Swal.fire('Error', 'An error occurred while creating the coupon', 'error')
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
                <h1 className="page-title">Add New Coupon</h1>
                <p className="text-muted">
                  Create a new discount coupon for your courses
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
                        Coupon Code  <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="code"
                        name="code"
                       required
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="Enter coupon code"
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
                  
                  {imagePreview && (
                    <div className="mt-3 position-relative d-inline-block">
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Create Coupon
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
