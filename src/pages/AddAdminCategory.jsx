import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { createAdminCategory } from '../api/courses';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function AddAdminCategory() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_en: '',
    name_fr: '',
    name_es: '',
    description_en: '',
    description_fr: '',
    description_es: '',
    order_number: '',
    is_active: true,
    icon: null
  });
  const [iconPreview, setIconPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0] || null;
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIconPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setIconPreview(null);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name_en.trim()) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'English category name is required' });
      return;
    }
    if (!formData.name_fr.trim()) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'French category name is required' });
      return;
    }
    if (!formData.name_es.trim()) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Spanish category name is required' });
      return;
    }
    if (formData.order_number === '' || formData.order_number === null) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Order number is required' });
      return;
    }

    setIsLoading(true);

    const result = await createAdminCategory(formData, token);
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Category Created',
        text: result.message || 'Category created successfully',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/admin-categories');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: result.message || 'Failed to create category',
      });
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    navigate('/admin-categories');
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Add Admin Category</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button 
                      className="btn btn-primary"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <i className="fas fa-arrow-left me-2"></i>Back to Categories
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      {/* English Card */}
                      <div className="col-md-4">
                        <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                            <h6 className="fw-bold mb-0 text-primary">🇺🇸 English Details</h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="mb-3">
                              <label className="form-label">Category Name <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Enter English name"
                                name="name_en"
                                value={formData.name_en}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                              />
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control bg-white"
                                placeholder="Enter English description"
                                name="description_en"
                                value={formData.description_en}
                                onChange={handleInputChange}
                                rows="4"
                                disabled={isLoading}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Spanish Card */}
                      <div className="col-md-4">
                        <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                            <h6 className="fw-bold mb-0 text-success">🇪🇸 Spanish Details</h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="mb-3">
                              <label className="form-label">Nombre de la categoría <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Ingrese el nombre en español"
                                name="name_es"
                                value={formData.name_es}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                              />
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Descripción</label>
                              <textarea
                                className="form-control bg-white"
                                placeholder="Ingrese la descripción en español"
                                name="description_es"
                                value={formData.description_es}
                                onChange={handleInputChange}
                                rows="4"
                                disabled={isLoading}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* French Card */}
                      <div className="col-md-4">
                        <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                            <h6 className="fw-bold mb-0 text-warning">🇫🇷 French Details</h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="mb-3">
                              <label className="form-label">Nom de la catégorie <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Entrez le nom en français"
                                name="name_fr"
                                value={formData.name_fr}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                              />
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control bg-white"
                                placeholder="Entrez la description en français"
                                name="description_fr"
                                value={formData.description_fr}
                                onChange={handleInputChange}
                                rows="4"
                                disabled={isLoading}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Common Details Card */}
                      <div className="col-12 mt-4">
                        <div className="card shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3">
                            <h6 className="fw-bold mb-0"><i className="fas fa-cog me-2"></i>Global Category Settings & Icon</h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3 align-items-center">
                              <div className="col-md-4">
                                <label className="form-label fw-bold">Order Number <span className="text-danger">*</span></label>
                                <input
                                  type="number"
                                  className="form-control bg-white"
                                  placeholder="Enter order number"
                                  name="order_number"
                                  value={formData.order_number}
                                  onChange={handleInputChange}
                                  required
                                  min="0"
                                  disabled={isLoading}
                                />
                              </div>

                              <div className="col-md-4">
                                <div className="form-check form-switch mt-4">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                  />
                                  <label className="form-check-label fw-bold ms-2" htmlFor="is_active">
                                    Is Active Category
                                  </label>
                                </div>
                              </div>

                              <div className="col-md-4">
                                <label className="form-label fw-bold">Category Icon (Optional)</label>
                                <div className="d-flex align-items-center gap-3">
                                  <input
                                    type="file"
                                    className="form-control bg-white"
                                    name="icon"
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                  />
                                  {iconPreview && (
                                    <img
                                      src={iconPreview}
                                      alt="Icon Preview"
                                      className="rounded border"
                                      style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-end mt-5">
                      <button
                        type="button"
                        className="btn btn-secondary px-4 me-2"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating...</>
                        ) : (
                          <><i className="fas fa-save me-2"></i>Create Category</>
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
  );
}
