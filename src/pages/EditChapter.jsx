import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { updateCourseChapter, getCourseChapters, getAllAdminCategories } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import DurationPicker from '../components/DurationPicker';

export default function EditChapter() {
  const navigate = useNavigate();
  const { courseId, chapterId } = useParams();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
      // Find the specific chapter from all categories
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
          category: chapterToEdit.category || '',
          category_id: chapterToEdit.category_id || '',
          description_en: en.description || chapterToEdit.description_en || chapterToEdit.description || '',
          description_fr: fr.description || chapterToEdit.description_fr || '',
          description_es: es.description || chapterToEdit.description_es || '',
          chapter_number: chapterToEdit.chapter_number || '',
          duration: en.duration || chapterToEdit.duration || '',
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

  const handleDurationClick = () => {
    setShowDurationPicker(true);
  };

  const handleDurationChange = (duration) => {
    setFormData(prev => ({
      ...prev,
      duration: duration
    }));
  };

  const handleDurationClose = () => {
    setShowDurationPicker(false);
  };

  const handleCancel = () => {
    navigate(`/courses/admin/course/${courseId}/chapters`);
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

    const apiPayload = {
      ...formData,
      duration_en: formData.duration,
      duration_fr: formData.duration,
      duration_es: formData.duration,
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
                <h5>Edit Admin Chapter</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button 
                      className="btn btn-primary"
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
                              <div className="col-md-4">
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

                              <div className="col-md-4">
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
                                    onClick={handleDurationClick}
                                  />
                                  <button 
                                    className="btn btn-outline-secondary bg-white" 
                                    type="button"
                                    onClick={handleDurationClick}
                                  >
                                    <i className="fa fa-clock"></i>
                                  </button>
                                </div>
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Order Number</label>
                                <input
                                  type="number"
                                  className="form-control bg-white"
                                  name="order_number"
                                  value={formData.order_number}
                                  onChange={handleInputChange}
                                  placeholder="Enter order number"
                                  min="0"
                                />
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Is Locked</label>
                                <select
                                  className="form-select bg-white"
                                  name="is_locked"
                                  value={formData.is_locked}
                                  onChange={handleInputChange}
                                >
                                  <option value={false}>No</option>
                                  <option value={true}>Yes</option>
                                </select>
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
      
      {showDurationPicker && (
        <DurationPicker
          value={formData.duration}
          onChange={handleDurationChange}
          onClose={handleDurationClose}
        />
      )}
    </div>
  );
}