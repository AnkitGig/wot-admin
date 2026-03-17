import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addGlossaryCategory } from '../api/glossary';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function AddGlossaryCategory() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#941efd',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    navigate('/glossary-categories');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter the category name',
      });
      return;
    }

    setIsLoading(true);

    const result = await addGlossaryCategory(formData, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Category Created',
        text: result.message || 'Glossary category created successfully!',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate('/glossary-categories');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Category',
        text: result.message || 'An error occurred while creating the glossary category',
      });
    }

    setIsLoading(false);
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
                <h5>Add New Glossary Category</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <Link className="btn btn-primary" to="/glossary-categories"><i className="fa fa-plus-circle me-2"></i>View All</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Category Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter category name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        rows="6" 
                        placeholder="Enter category description (optional)"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Color</label>
                      <div className="d-flex align-items-center gap-3">
                        <input 
                          type="color" 
                          className="form-control form-control-color"
                          style={{width: '60px', height: '40px', cursor: 'pointer'}}
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                        />
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="#941efd"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          style={{maxWidth: '150px'}}
                        />
                      </div>
                    </div>

                    <div className="col-md-12 text-end mt-3">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary ms-2"
                        disabled={isLoading}
                      >
                        <i className="bi bi-check-circle"></i> {isLoading ? 'Creating...' : 'Create Category'}
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
