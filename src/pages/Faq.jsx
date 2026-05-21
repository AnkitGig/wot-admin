import React, { useState, useEffect } from 'react';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '../api/faq';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';

// Helper to extract text from multilingual object or plain string
const getLocalizedText = (field) => {
  if (!field) return '';
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (parsed && typeof parsed === 'object') {
        return parsed.en || parsed.es || parsed.fr || Object.values(parsed)[0] || '';
      }
    } catch (e) {
      // Not a JSON string, fallback
    }
    return field;
  }
  return field.en || field.es || field.fr || Object.values(field)[0] || '';
};

// Helper to parse translations safely
const getTranslations = (field) => {
  if (!field) return { en: '', es: '', fr: '' };
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (parsed && typeof parsed === 'object') {
        return {
          en: parsed.en || '',
          es: parsed.es || '',
          fr: parsed.fr || ''
        };
      }
    } catch (e) {}
    return { en: field, es: '', fr: '' };
  }
  return {
    en: field.en || '',
    es: field.es || '',
    fr: field.fr || ''
  };
};

export default function FAQ() {
  const { token } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeLang, setActiveLang] = useState('en');
  const [formData, setFormData] = useState({
    question: { en: '', es: '', fr: '' },
    answer: { en: '', es: '', fr: '' }
  });

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const response = await getFAQs(token);
      if (response.success) {
        setFaqs(response.data);
      } else {
        Swal.fire('Error', response.message || 'Failed to fetch FAQs', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch FAQs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFAQs();
    }
  }, [token]);

  const handleOpenModal = (faq = null) => {
    setActiveLang('en'); // Reset to English tab on open
    if (faq) {
      setEditingId(faq.id);
      setFormData({
        question: getTranslations(faq.question),
        answer: getTranslations(faq.answer)
      });
    } else {
      setEditingId(null);
      setFormData({
        question: { en: '', es: '', fr: '' },
        answer: { en: '', es: '', fr: '' }
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      question: { en: '', es: '', fr: '' },
      answer: { en: '', es: '', fr: '' }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // English validation is required as the primary baseline language
    if (!formData.question.en.trim()) {
      Swal.fire('Warning', 'Please enter the question in English', 'warning');
      return;
    }
    if (!formData.answer.en.trim()) {
      Swal.fire('Warning', 'Please enter the answer in English', 'warning');
      return;
    }

    try {
      if (editingId) {
        const response = await updateFAQ(editingId, formData, token);
        if (response.success) {
          Swal.fire('Success', 'FAQ updated successfully', 'success');
          handleCloseModal();
          fetchFAQs();
        } else {
          Swal.fire('Error', response.message || 'Failed to update FAQ', 'error');
        }
      } else {
        const response = await createFAQ(formData, token);
        if (response.success) {
          Swal.fire('Success', 'FAQ created successfully', 'success');
          handleCloseModal();
          fetchFAQs();
        } else {
          Swal.fire('Error', response.message || 'Failed to create FAQ', 'error');
        }
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This FAQ will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteFAQ(id, token);
        if (response.success) {
          Swal.fire('Deleted!', 'FAQ has been deleted.', 'success');
          fetchFAQs();
        } else {
          Swal.fire('Error', response.message || 'Failed to delete FAQ', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete FAQ', 'error');
      }
    }
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">FAQ Management</h3>
              </div>
              <div className="col-auto float-end ms-auto">
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                  <i className="fas fa-plus"></i> Add FAQ
                </button>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive">
                <table className="table table-striped custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Answer</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center py-5">
                          <GlobalLoader visible={loading} size="medium" />
                        </td>
                      </tr>
                    ) : faqs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          No FAQs found
                        </td>
                      </tr>
                    ) : (
                      faqs.map((faq, index) => (
                        <tr key={faq.id}>
                          <td>{index + 1}</td>
                          <td style={{ whiteSpace: 'pre-line' }}>{getLocalizedText(faq.question)}</td>
                          <td style={{ whiteSpace: 'pre-line' }}>{getLocalizedText(faq.answer)}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-info me-2"
                              onClick={() => handleOpenModal(faq)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(faq.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {showModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h5>
                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                  </div>
                  
                  {/* Solid Multilingual Tabs */}
                  <ul className="nav nav-tabs nav-tabs-solid nav-justified mb-0">
                    <li className="nav-item">
                      <button 
                        type="button"
                        className={`nav-link ${activeLang === 'en' ? 'active' : ''}`} 
                        onClick={() => setActiveLang('en')}
                      >
                        English
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        type="button"
                        className={`nav-link ${activeLang === 'es' ? 'active' : ''}`} 
                        onClick={() => setActiveLang('es')}
                      >
                        Spanish
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        type="button"
                        className={`nav-link ${activeLang === 'fr' ? 'active' : ''}`} 
                        onClick={() => setActiveLang('fr')}
                      >
                        French
                      </button>
                    </li>
                  </ul>

                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Question ({activeLang.toUpperCase()}){' '}
                          {activeLang === 'en' && <span className="text-danger">*</span>}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.question[activeLang] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            question: {
                              ...formData.question,
                              [activeLang]: e.target.value
                            }
                          })}
                          required={activeLang === 'en'}
                          placeholder={`Enter question in ${activeLang === 'en' ? 'English' : activeLang === 'es' ? 'Spanish' : 'French'}`}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Answer ({activeLang.toUpperCase()}){' '}
                          {activeLang === 'en' && <span className="text-danger">*</span>}
                        </label>
                        <textarea
                          className="form-control"
                          rows="6"
                          value={formData.answer[activeLang] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            answer: {
                              ...formData.answer,
                              [activeLang]: e.target.value
                            }
                          })}
                          required={activeLang === 'en'}
                          placeholder={`Enter answer in ${activeLang === 'en' ? 'English' : activeLang === 'es' ? 'Spanish' : 'French'}`}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingId ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .bg-soft-info { background-color: rgba(13, 202, 240, 0.1); }
        .nav-tabs-solid .nav-link.active { background-color: #0d6efd; color: white; border-color: #0d6efd; }
        .nav-tabs-solid .nav-link { border-radius: 0; color: #4b5563; }
        .form-label { font-size: 0.875rem; color: #4b5563; }
      `}</style>
    </div>
  );
}