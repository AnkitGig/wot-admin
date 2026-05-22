import React, { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { createPlan } from '../api/plans'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

export default function AddPlan() {
  const [formData, setFormData] = useState({
    name: {
      en: '',
      es: '',
      fr: ''
    },
    plan_type: {
      en: '',
      es: '',
      fr: ''
    },
    price: '',
    quota_coach_ai: '',
    quota_chart_analyzer: '',
    quota_trade_analyzer: '',
    is_active: true,
    is_trial_eligible: false
  })
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
              name === 'is_active' || name === 'is_trial_eligible' ? value === 'true' : value
    }))
  }

  const handleTranslationChange = (field, lang, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const hasAllNames = Object.values(formData.name).every(value => value.trim())
    const hasAllPlanTypes = Object.values(formData.plan_type).every(value => value.trim())

    if (!hasAllNames || !hasAllPlanTypes || formData.price <= 0) {
      Swal.fire('Error', 'Please fill in all required fields', 'error')
      return
    }

    try {
      setLoading(true)
      const response = await createPlan(token, formData)
      if (response.success) {
        Swal.fire('Success!', response.message, 'success')
        navigate('/plans')
      } else {
        Swal.fire('Error', response.message, 'error')
      }
    } catch (error) {
      console.error('Error creating plan:', error)
      Swal.fire('Error', 'An error occurred while creating plan', 'error')
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
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Add New Plan</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <a className="btn btn-secondary" onClick={() => navigate('/plans')} style={{cursor: 'pointer'}}>
                      <i className="fas fa-arrow-left me-2"></i>Back to Plans
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Plan Information</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-12">
                      <h5>Plan Name</h5>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="name_en">English *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name_en"
                          value={formData.name.en}
                          onChange={(e) => handleTranslationChange('name', 'en', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="name_es">Spanish *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name_es"
                          value={formData.name.es}
                          onChange={(e) => handleTranslationChange('name', 'es', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="name_fr">French *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name_fr"
                          value={formData.name.fr}
                          onChange={(e) => handleTranslationChange('name', 'fr', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <h5>Plan Type</h5>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="plan_type_en">English *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="plan_type_en"
                          value={formData.plan_type.en}
                          onChange={(e) => handleTranslationChange('plan_type', 'en', e.target.value)}
                          placeholder="e.g., Semi-Annual"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="plan_type_es">Spanish *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="plan_type_es"
                          value={formData.plan_type.es}
                          onChange={(e) => handleTranslationChange('plan_type', 'es', e.target.value)}
                          placeholder="e.g., Semestral"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="plan_type_fr">French *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="plan_type_fr"
                          value={formData.plan_type.fr}
                          onChange={(e) => handleTranslationChange('plan_type', 'fr', e.target.value)}
                          placeholder="e.g., Semi-Annuel"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="price">Price ($) *</label>
                        <input
                          type="number"
                          className="form-control"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="is_active">Plan Status *</label>
                        <select
                          className="form-control"
                          id="is_active"
                          name="is_active"
                          value={formData.is_active}
                          onChange={handleChange}
                          required
                        >
                          <option value={true}>Active</option>
                          <option value={false}>Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="is_trial_eligible">Trial Eligibility *</label>
                        <select
                          className="form-control"
                          id="is_trial_eligible"
                          name="is_trial_eligible"
                          value={formData.is_trial_eligible}
                          onChange={handleChange}
                          required
                        >
                          <option value={true}>Trial Eligible</option>
                          <option value={false}>Not Eligible</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-12">
                      <hr />
                      <h5>Quotas</h5>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="quota_coach_ai">Coach AI Quota</label>
                        <input
                          type="number"
                          className="form-control"
                          id="quota_coach_ai"
                          name="quota_coach_ai"
                          value={formData.quota_coach_ai}
                          onChange={handleChange}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="quota_chart_analyzer">Chart Analyzer Quota</label>
                        <input
                          type="number"
                          className="form-control"
                          id="quota_chart_analyzer"
                          name="quota_chart_analyzer"
                          value={formData.quota_chart_analyzer}
                          onChange={handleChange}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="quota_trade_analyzer">Trade Analyzer Quota</label>
                        <input
                          type="number"
                          className="form-control"
                          id="quota_trade_analyzer"
                          name="quota_trade_analyzer"
                          value={formData.quota_trade_analyzer}
                          onChange={handleChange}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="col-12 text-end mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/plans')}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary ms-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Creating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save"></i> Create Plan
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
