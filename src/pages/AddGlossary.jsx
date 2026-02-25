import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addGlossary } from '../api/glossary';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function AddGlossary() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    term: '',
    short_form: '',
    category: '',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    navigate('/glossaries');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.term.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter the glossary term',
      });
      return;
    }

    if (!formData.short_form.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter the short form',
      });
      return;
    }

    if (!formData.category.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter the category',
      });
      return;
    }

    if (!formData.description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter the description',
      });
      return;
    }

    setIsLoading(true);

    const result = await addGlossary(formData, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Glossary Created',
        text: result.message || 'Glossary term created successfully!',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate('/glossaries');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Glossary',
        text: result.message || 'An error occurred while creating the glossary term',
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
                <h5>Add New Glossary Term</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <Link className="btn btn-primary" to="/glossaries"><i className="fa fa-plus-circle me-2"></i>View All</Link>
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
                      <label className="form-label">Term <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter glossary term"
                        name="term"
                        value={formData.term}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Short Form <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g., BTC, USD"
                        name="short_form"
                        value={formData.short_form}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Category <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g., Cryptocurrency, Trading"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select 
                        className="form-select"
                        defaultValue="active"
                        disabled
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Description <span className="text-danger">*</span></label>
                      <textarea 
                        className="form-control" 
                        rows="6" 
                        placeholder="Enter detailed description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
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
                        <i className="bi bi-check-circle"></i> {isLoading ? 'Creating...' : 'Create Glossary'}
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
