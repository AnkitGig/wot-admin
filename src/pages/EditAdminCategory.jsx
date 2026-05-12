import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getAdminCategoryById, updateAdminCategory } from '../api/courses';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import GlobalLoader from '../components/GlobalLoader';

export default function EditAdminCategory() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    setIsFetching(true);
    
    const result = await getAdminCategoryById(categoryId, token);
    
    if (result.success) {
      const category = result.data;
      const translations = category.translations || {};
      const en = translations.en || {};
      const es = translations.es || {};
      const fr = translations.fr || {};

      setFormData({
        name_en: en.name || category.name_en || category.name || '',
        name_fr: fr.name || category.name_fr || '',
        name_es: es.name || category.name_es || '',
        description_en: en.description || category.description_en || category.description || '',
        description_fr: fr.description || category.description_fr || '',
        description_es: es.description || category.description_es || '',
        order_number: category.order_number?.toString() || '',
        is_active: category.is_active !== false,
        icon: null
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Category',
        text: result.message || 'An error occurred while fetching category',
      }).then(() => {
        navigate('/admin-categories');
      });
    }
    
    setIsFetching(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
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

    const result = await updateAdminCategory(categoryId, formData, token);
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Category Updated',
        text: result.message || 'Category updated successfully',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/admin-categories');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: result.message || 'Failed to update category',
      });
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    navigate('/admin-categories');
  };

  if (isFetching) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '400px' }}>
              <GlobalLoader visible={true} size="large" />
              <p className="mt-3 text-muted">Loading category details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
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
                <h5>Edit Admin Category</h5>
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
                          <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating...</>
                        ) : (
                          <><i className="fas fa-save me-2"></i>Update Category</>
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
