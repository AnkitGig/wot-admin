import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { updateCourseChapter, getCourseChapters, getAllAdminCategories } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function EditChapter() {
  const navigate = useNavigate();
  const { courseId, chapterId } = useParams();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
    fetchChapterData();
    fetchCategories();
  }, [courseId, chapterId]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    const result = await getAllAdminCategories(token);
    if (result.success) {
      setCategories(result.data || []);
    }
    setCategoriesLoading(false);
  };

  const fetchChapterData = async () => {
    setInitialLoading(true);
    const result = await getCourseChapters(courseId, token);
    
    if (result.success) {
      let chapterToEdit = null;
      result.data.categories.forEach(category => {
        const foundChapter = category.chapters.find(chapter => chapter.id === parseInt(chapterId));
        if (foundChapter) {
          chapterToEdit = foundChapter;
        }
      });

      if (chapterToEdit) {
        const trans = chapterToEdit.translations || {};
        const en = trans.en || {};
        const es = trans.es || {};
        const fr = trans.fr || {};

        setFormData({
          title_en: en.title || chapterToEdit.title_en || chapterToEdit.title || '',
          title_fr: fr.title || chapterToEdit.title_fr || '',
          title_es: es.title || chapterToEdit.title_es || '',
          category_id: chapterToEdit.category_id || '',
          description_en: en.description || chapterToEdit.description_en || chapterToEdit.description || '',
          description_fr: fr.description || chapterToEdit.description_fr || '',
          description_es: es.description || chapterToEdit.description_es || '',
          duration_en: en.duration || chapterToEdit.duration_en || chapterToEdit.duration || '',
          duration_fr: fr.duration || chapterToEdit.duration_fr || '',
          duration_es: es.duration || chapterToEdit.duration_es || '',
          chapter_number: chapterToEdit.chapter_number || '',
          is_locked: chapterToEdit.is_locked || false,
          order_number: chapterToEdit.order_number || '',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Chapter Not Found',
          text: 'The requested chapter could not be found',
        });
        navigate(`/courses/admin/course/${courseId}/chapters`);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Chapter',
        text: result.message || 'An error occurred while fetching chapter data',
      });
      navigate(`/courses/admin/course/${courseId}/chapters`);
    }
    setInitialLoading(false);
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

    const result = await updateCourseChapter(chapterId, apiPayload, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Chapter Updated',
        text: 'Chapter has been updated successfully',
      });
      navigate(`/courses/admin/course/${courseId}/chapters`);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Update Chapter',
        text: result.message,
      });
    }
    setIsLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
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
                <h5>Edit Chapter</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back to Chapters
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
                          {isLoading ? 'Updating...' : 'Update Chapter'}
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