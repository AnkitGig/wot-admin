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
    name: '',
    description: '',
    order_number: '',
    is_active: true,
    icon: null
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
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
    
    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Category name is required',
      });
      return;
    }

    setIsLoading(true);

    const submissionData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      order_number: formData.order_number ? parseInt(formData.order_number) : 0,
      is_active: formData.is_active,
      icon: formData.icon
    };

    const result = await createAdminCategory(submissionData, token);
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Category Created',
        text: result.message || 'Category created successfully',
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
                      className="btn btn-outline-secondary"
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
                    <div className="row">
                      <div className="col-12">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">
                            Category Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter category name"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="form-group">
                          <label htmlFor="description" className="form-label">
                            Description
                          </label>
                          <textarea
                            className="form-control"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter category description"
                            rows="4"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="order_number" className="form-label">
                            Order Number
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="order_number"
                            name="order_number"
                            value={formData.order_number}
                            onChange={handleInputChange}
                            placeholder="Enter order number"
                            min="0"
                            disabled={isLoading}
                          />
                          <small className="form-text text-muted">
                            Lower numbers appear first
                          </small>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="icon" className="form-label">
                            Category Icon
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            id="icon"
                            name="icon"
                            onChange={handleInputChange}
                            accept="image/*"
                            disabled={isLoading}
                          />
                          <small className="form-text text-muted">
                            Upload an icon for the category (optional)
                          </small>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="form-group">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="is_active"
                              name="is_active"
                              checked={formData.is_active}
                              onChange={handleInputChange}
                              disabled={isLoading}
                            />
                            <label className="form-check-label" htmlFor="is_active">
                              Active
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group mt-4">
                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Create Category
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          <i className="fas fa-times me-2"></i>
                          Cancel
                        </button>
                      </div>
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
