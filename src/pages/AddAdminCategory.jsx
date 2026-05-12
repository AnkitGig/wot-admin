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
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'English category name is required',
      });
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
                      {/* English Name */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label fw-bold">Category Name (English) <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter English name"
                            name="name_en"
                            value={formData.name_en}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Spanish Name */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label fw-bold">Nombre de la categoría (Spanish)</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ingrese el nombre en español"
                            name="name_es"
                            value={formData.name_es}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* French Name */}
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label fw-bold">Nom de la catégorie (French)</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Entrez le nom en français"
                            name="name_fr"
                            value={formData.name_fr}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          />
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
