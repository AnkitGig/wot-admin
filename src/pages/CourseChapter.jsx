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
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fr: '',
    title_es: '',
    category_id: '',
    description_en: '',
    description_fr: '',
    description_es: '',
    duration_en: '',
    duration_fr: '',
    duration_es: '',
    chapter_number: '',
    is_locked: false,
    order_number: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    const allCategoriesResult = await getAllAdminCategories(token);
    if (allCategoriesResult.success) {
      setCategories(allCategoriesResult.data || []);
    } else {
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCancel = () => {
    navigate(`/courses/admin/course/${courseId}/chapters`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title_en.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'English title is required' });
      return;
    }
    if (!formData.title_fr.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'French title is required' });
      return;
    }
    if (!formData.title_es.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Spanish title is required' });
      return;
    }
    if (!formData.category_id) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please select a chapter category' });
      return;
    }
    if (formData.order_number === '' || formData.order_number === null) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Order number is required' });
      return;
    }

    setIsLoading(true);
    
    const apiPayload = {
      ...formData,
      chapter_number: parseInt(formData.chapter_number) || 0,
      order_number: parseInt(formData.order_number) || 0,
    };

    const result = await createCourseChapter(courseId, apiPayload, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Chapter Created',
        text: 'Chapter has been created successfully',
      });
      navigate(`/courses/admin/course/${courseId}/chapters`);
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
                            <h6 className="fw-bold mb-0 text-primary">🇺🇸 English Details</h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="mb-3">
                              <label className="form-label">Chapter Title <span className="text-danger">*</span></label>
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
                                rows="3"
                                placeholder="Enter chapter description"
                                name="description_en"
                                value={formData.description_en}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Duration</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="e.g. 10 mins"
                                name="duration_en"
                                value={formData.duration_en}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Spanish Column */}
                      <div className="col-md-4">
                        <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                            <h6 className="fw-bold mb-0 text-success">🇪🇸 Spanish Details</h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="mb-3">
                              <label className="form-label">Título del capítulo <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Ingrese el título del capítulo"
                                name="title_es"
                                value={formData.title_es}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Descripción</label>
                              <textarea
                                className="form-control bg-white"
                                rows="3"
                                placeholder="Ingrese la descripción del capítulo"
                                name="description_es"
                                value={formData.description_es}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Duración</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="ej. 10 minutos"
                                name="duration_es"
                                value={formData.duration_es}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* French Column */}
                      <div className="col-md-4">
                        <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                            <h6 className="fw-bold mb-0 text-warning">🇫🇷 French Details</h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="mb-3">
                              <label className="form-label">Titre du chapitre <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Entrez le titre du chapitre"
                                name="title_fr"
                                value={formData.title_fr}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control bg-white"
                                rows="3"
                                placeholder="Entrez la description du chapitre"
                                name="description_fr"
                                value={formData.description_fr}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Durée</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="ex. 10 minutes"
                                name="duration_fr"
                                value={formData.duration_fr}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Common Section */}
                      <div className="col-md-12 mt-4">
                        <div className="card shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3">
                            <h6 className="fw-bold mb-0"><i className="fas fa-cog me-2"></i>Global Chapter Settings</h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3 align-items-center">
                              <div className="col-md-4">
                                <label className="form-label fw-bold">Category <span className="text-danger">*</span></label>
                                <select
                                  className="form-control bg-white"
                                  name="category_id"
                                  value={formData.category_id}
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
                                      <option key={category.id} value={category.id}>
                                        {name}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>

                              <div className="col-md-4">
                                <label className="form-label fw-bold">Order Number <span className="text-danger">*</span></label>
                                <input
                                  type="number"
                                  className="form-control bg-white"
                                  name="order_number"
                                  value={formData.order_number}
                                  onChange={handleInputChange}
                                  placeholder="Enter order number"
                                  required
                                  min="0"
                                />
                              </div>

                              <div className="col-md-4">
                                <label className="form-label fw-bold">Chapter Number</label>
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

                              <div className="col-md-4">
                                <div className="form-check form-switch mt-4">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="is_locked"
                                    name="is_locked"
                                    checked={formData.is_locked}
                                    onChange={handleInputChange}
                                  />
                                  <label className="form-check-label fw-bold ms-2" htmlFor="is_locked">
                                    Is Chapter Locked
                                  </label>
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
    </div>
  );
}
