import React, { useState, useEffect } from 'react';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '../api/faq';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export default function FAQ() {
  const { token } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '' });

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
    if (faq) {
      setEditingId(faq.id);
      setFormData({ question: faq.question, answer: faq.answer });
    } else {
      setEditingId(null);
      setFormData({ question: '', answer: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ question: '', answer: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
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
                      {faqs.map((faq, index) => (
                        <tr key={faq.id}>
                          <td>{index + 1}</td>
                          <td>{faq.question}</td>
                          <td>{faq.answer}</td>
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
                      ))}
                      {faqs.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-4">
                            No FAQs found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {showModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h5>
                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Question</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.question}
                          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Answer</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={formData.answer}
                          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                          required
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
    </div>
  );
}