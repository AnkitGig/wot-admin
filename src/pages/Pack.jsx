import React, { useState, useEffect } from 'react';
import { getPacks, createPack, updatePack, deletePack } from '../api/pack';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';

export default function Pack() {
  const { token } = useAuth();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    label: {
      en: '',
      es: '',
      fr: ''
    },
    coin_price: 0,
    paid_price: 0,
    currency: 'USD',
    credit_coach_ai: 0,
    credit_chart_analyzer: 0,
    credit_trade_analyzer: 0,
    is_active: true
  });

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const response = await getPacks(token);
      if (response.success) {
        setPacks(response.data);
      } else {
        Swal.fire('Error', response.message || 'Failed to fetch packs', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch packs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPacks();
    }
  }, [token]);

  const getTranslatedText = (value) => {
    if (!value) return 'N/A';
    if (typeof value === 'string') return value;
    return value.en || value.es || value.fr || Object.values(value).find(Boolean) || 'N/A';
  };

  const getTranslationObject = (value) => {
    if (value && typeof value === 'object') {
      return {
        en: value.en || '',
        es: value.es || '',
        fr: value.fr || ''
      };
    }

    return {
      en: value || '',
      es: '',
      fr: ''
    };
  };

  const getPackLabel = (pack) => {
    return pack.label_translations || pack.label || pack.translations?.label;
  };

  const handleOpenModal = (pack = null) => {
    if (pack) {
      setEditingId(pack.id);
      setFormData({
        name: pack.name || '',
        label: getTranslationObject(getPackLabel(pack)),
        coin_price: pack.coin_price || 0,
        paid_price: pack.paid_price || 0,
        currency: pack.currency || 'USD',
        credit_coach_ai: pack.credits?.coach_ai || 0,
        credit_chart_analyzer: pack.credits?.chart_analyzer || 0,
        credit_trade_analyzer: pack.credits?.trade_analyzer || 0,
        is_active: pack.is_active !== undefined ? pack.is_active : true
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        label: {
          en: '',
          es: '',
          fr: ''
        },
        coin_price: 0,
        paid_price: 0,
        currency: 'USD',
        credit_coach_ai: 0,
        credit_chart_analyzer: 0,
        credit_trade_analyzer: 0,
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      label: {
        en: '',
        es: '',
        fr: ''
      },
      coin_price: 0,
      paid_price: 0,
      currency: 'USD',
      credit_coach_ai: 0,
      credit_chart_analyzer: 0,
      credit_trade_analyzer: 0,
      is_active: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasAllLabels = Object.values(formData.label).every(value => value.trim());
    if (!hasAllLabels) {
      Swal.fire('Error', 'Please fill in all label translations', 'error');
      return;
    }

    try {
      if (editingId) {
        const response = await updatePack(editingId, formData, token);
        if (response.success) {
          Swal.fire('Success', 'Pack updated successfully', 'success');
          handleCloseModal();
          fetchPacks();
        } else {
          Swal.fire('Error', response.message || 'Failed to update pack', 'error');
        }
      } else {
        const response = await createPack(formData, token);
        if (response.success) {
          Swal.fire('Success', 'Pack created successfully', 'success');
          handleCloseModal();
          fetchPacks();
        } else {
          Swal.fire('Error', response.message || 'Failed to create pack', 'error');
        }
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This pack will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await deletePack(id, token);
        if (response.success) {
          Swal.fire('Deleted!', 'Pack has been deleted.', 'success');
          fetchPacks();
        } else {
          Swal.fire('Error', response.message || 'Failed to delete pack', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete pack', 'error');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleTranslationChange = (field, lang, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
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
                <h3 className="page-title">Recharge Pack Management</h3>
              </div>
              <div className="col-auto float-end ms-auto">
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                  <i className="fas fa-plus"></i> Add Pack
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
                      <th>Name</th>
                      <th>Label</th>
                      <th>Coin Price</th>
                      <th>Paid Price</th>
                      <th>Credits</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5">
                          <GlobalLoader visible={loading} size="medium" />
                        </td>
                      </tr>
                    ) : packs.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          No packs found
                        </td>
                      </tr>
                    ) : (
                      packs.map((pack, index) => (
                        <tr key={pack.id}>
                          <td>{index + 1}</td>
                          <td>{pack.name}</td>
                          <td>{getTranslatedText(getPackLabel(pack))}</td>
                          <td>{pack.coin_price}</td>
                          <td>${pack.paid_price}</td>
                          <td>
                            <small>
                              Coach AI: {pack.credits?.coach_ai || 0}<br />
                              Chart: {pack.credits?.chart_analyzer || 0}<br />
                              Trade: {pack.credits?.trade_analyzer || 0}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${pack.is_active ? 'bg-success' : 'bg-danger'}`}>
                              {pack.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-info me-2"
                              onClick={() => handleOpenModal(pack)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(pack.id)}
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
                    <h5 className="modal-title">{editingId ? 'Edit Pack' : 'Add Pack'}</h5>
                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Label English</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.label.en}
                            onChange={(e) => handleTranslationChange('label', 'en', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Label Spanish</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.label.es}
                            onChange={(e) => handleTranslationChange('label', 'es', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Label French</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.label.fr}
                            onChange={(e) => handleTranslationChange('label', 'fr', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Coin Price</label>
                          <input
                            type="number"
                            className="form-control"
                            name="coin_price"
                            value={formData.coin_price}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Paid Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            name="paid_price"
                            value={formData.paid_price}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Coach AI Credits</label>
                          <input
                            type="number"
                            className="form-control"
                            name="credit_coach_ai"
                            value={formData.credit_coach_ai}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Chart Analyzer Credits</label>
                          <input
                            type="number"
                            className="form-control"
                            name="credit_chart_analyzer"
                            value={formData.credit_chart_analyzer}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Trade Analyzer Credits</label>
                          <input
                            type="number"
                            className="form-control"
                            name="credit_trade_analyzer"
                            value={formData.credit_trade_analyzer}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Currency</label>
                          <input
                            type="text"
                            className="form-control"
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-check mt-4">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              name="is_active"
                              checked={formData.is_active}
                              onChange={handleInputChange}
                              id="isActiveCheck"
                            />
                            <label className="form-check-label" htmlFor="isActiveCheck">
                              Active
                            </label>
                          </div>
                        </div>
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
