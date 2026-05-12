import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createCourseChapter, getCategoriesByCourse, getAllAdminCategories } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import DurationPicker from '../components/DurationPicker';

export default function CourseChapter() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fr: '',
    title_es: '',
    category: '',
    category_id: '',
    description_en: '',
    description_fr: '',
    description_es: '',
    chapter_number: '',
    duration: '',
    is_locked: false,
    order_number: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    // Try to get all admin categories first, then filter by course if needed
    const allCategoriesResult = await getAllAdminCategories(token);
    if (allCategoriesResult.success) {
      setCategories(allCategoriesResult.data || []);
    } else {
      // Fallback to course-specific categories
      const courseCategoriesResult = await getCategoriesByCourse(courseId, token);
      if (courseCategoriesResult.success) {
        setCategories(courseCategoriesResult.data || []);
      } else {
        console.error('Failed to fetch categories:', courseCategoriesResult.message);
      }
    }
    setCategoriesLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category') {
      const selectedCategory = categories.find(cat => cat.name === value);
      setFormData(prev => ({
        ...prev,
        category: value,
        category_id: selectedCategory ? selectedCategory.id : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleDurationChange = (duration) => {
    setFormData(prev => ({
      ...prev,
      duration: duration,
    }));
  };

  const handleCancel = () => {
    navigate('/courses');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title_en.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter English chapter title',
      });
      return;
    }

    if (!formData.category_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a chapter category',
      });
      return;
    }

    setIsLoading(true);
    
    // Map the single duration to localized duration fields for the API
    const apiPayload = {
      ...formData,
      duration_en: formData.duration,
      duration_fr: formData.duration,
      duration_es: formData.duration,
    };

    const result = await createCourseChapter(courseId, apiPayload, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Chapter Created',
        text: 'Chapter has been created successfully',
      });
      navigate('/courses');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Chapter',
        text: result.message,
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
                <h5>Create Chapter</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back to Courses
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
                      {/* English Column */}
                      <div className="col-md-4">
                        <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                            <h6 className="fw-bold mb-0">English</h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="mb-3">
                              <label className="form-label">Chapter Title</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Enter chapter title"
                                name="title_en"
                                value={formData.title_en}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control bg-white"
                                rows="5"
                                placeholder="Enter chapter description"
                                name="description_en"
                                value={formData.description_en}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Category <span className="text-danger">*</span></label>
                              <select
                                className="form-control bg-white"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                disabled={categoriesLoading}
                                style={{ appearance: "auto" }}
                              >
                                <option value="">Select a category</option>
                                {categories.map((category) => {
                                  const translations = category.translations || {};
                                  const name = translations.en?.name || category.name_en || category.name;
                                  return (
                                    <option key={category.id} value={category.name}>
                                      {name}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Spanish Column */}
                      <div className="col-md-4">
                        <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                            <h6 className="fw-bold mb-0">Spanish</h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="mb-3">
                              <label className="form-label">Título del capítulo</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Ingrese el título del capítulo"
                                name="title_es"
                                value={formData.title_es}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Descripción</label>
                              <textarea
                                className="form-control bg-white"
                                rows="5"
                                placeholder="Ingrese la descripción del capítulo"
                                name="description_es"
                                value={formData.description_es}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Categoría</label>
                              <select
                                className="form-control bg-white"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                disabled={categoriesLoading}
                                style={{ appearance: "auto" }}
                              >
                                <option value="">Seleccione una categoría</option>
                                {categories.map((category) => {
                                  const translations = category.translations || {};
                                  const name = translations.es?.name || category.name_es || '';
                                  return (
                                    <option key={category.id} value={category.name}>
                                      {name}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* French Column */}
                      <div className="col-md-4">
                        <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                            <h6 className="fw-bold mb-0">French</h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="mb-3">
                              <label className="form-label">Titre du chapitre</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Entrez le titre du chapitre"
                                name="title_fr"
                                value={formData.title_fr}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control bg-white"
                                rows="5"
                                placeholder="Entrez la description du chapitre"
                                name="description_fr"
                                value={formData.description_fr}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Catégorie</label>
                              <select
                                className="form-control bg-white"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                disabled={categoriesLoading}
                                style={{ appearance: "auto" }}
                              >
                                <option value="">Choisissez une catégorie</option>
                                {categories.map((category) => {
                                  const translations = category.translations || {};
                                  const name = translations.fr?.name || category.name_fr || '';
                                  return (
                                    <option key={category.id} value={category.name}>
                                      {name}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Common Section */}
                      <div className="col-md-12 mt-4">
                        <div className="card shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3">
                            <h6 className="fw-bold mb-0">Common Information</h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label">Chapter Number</label>
                                <input
                                  type="number"
                                  className="form-control bg-white"
                                  name="chapter_number"
                                  value={formData.chapter_number}
                                  onChange={handleInputChange}
                                  placeholder="Enter chapter number"
                                  min="0"
                                />
                              </div>

                              <div className="col-md-6">
                                <label className="form-label">Duration</label>
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control bg-white"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    placeholder="Click to select duration"
                                    readOnly
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowDurationPicker(true)}
                                  />
                                  <button 
                                    className="btn btn-outline-secondary bg-white" 
                                    type="button"
                                    onClick={() => setShowDurationPicker(true)}
                                  >
                                    <i className="fa fa-clock"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-12 text-end mt-4">
                        <button 
                          type="button" 
                          className="btn btn-secondary px-4"
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary px-4 ms-2"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Creating...' : 'Create Chapter'}
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
      
      {showDurationPicker && (
        <DurationPicker
          value={formData.duration}
          onChange={handleDurationChange}
          onClose={() => setShowDurationPicker(false)}
        />
      )}
    </div>
  );
}
