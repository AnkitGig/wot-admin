import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getLessonAdmin, updateLessonPage, getLessonPageAdmin } from '../api/lessons';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function EditContentPage() {
  const { lessonId, pageId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fr: '',
    title_es: '',
    html_content_en: '',
    html_content_fr: '',
    html_content_es: '',
    image: null,
    remove_image: false,
  });

  useEffect(() => {
    if (lessonId && pageId && token) {
      fetchLessonData();
    }
  }, [lessonId, pageId, token]);

  const fetchLessonData = async () => {
    setIsLoading(true);
    
    // Fetch both lesson info and page details
    const [lessonResult, pageResult] = await Promise.all([
      getLessonAdmin(lessonId, token),
      getLessonPageAdmin(lessonId, pageId, token)
    ]);

    if (lessonResult.success) {
      setLesson(lessonResult.data);
    }

    if (pageResult.success) {
      const pageData = pageResult.data;
      setPage(pageData);
      const trans = pageData.translations || {};
      
      setFormData({
        title_en: trans.en?.title || pageData.title || '',
        title_fr: trans.fr?.title || '',
        title_es: trans.es?.title || '',
        html_content_en: trans.en?.html_content || pageData.html_content || '',
        html_content_fr: trans.fr?.html_content || '',
        html_content_es: trans.es?.html_content || '',
        image: null,
        remove_image: false,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Page Data',
        text: pageResult.message || 'An error occurred while loading page data',
      }).then(() => {
        navigate(-1);
      });
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, files, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : (name === 'remove_image' ? checked : value),
    }));
  };

  const handleContentChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      [`html_content_${lang}`]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title_en.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter English title',
      });
      return;
    }

    if (!formData.html_content_en.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter English content',
      });
      return;
    }

    setIsSubmitting(true);
    const result = await updateLessonPage(lessonId, pageId, formData, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Page updated successfully',
      }).then(() => {
        navigate(-1);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Update Page',
        text: result.message || 'An error occurred while updating the page',
      });
    }
    setIsSubmitting(false);
  };

  const handleReset = () => {
    if (page) {
      const trans = page.translations || {};
      setFormData({
        title_en: trans.en?.title || page.title_en || page.title || '',
        title_fr: trans.fr?.title || page.title_fr || '',
        title_es: trans.es?.title || page.title_es || '',
        html_content_en: trans.en?.html_content || page.html_content_en || page.html_content || '',
        html_content_fr: trans.fr?.html_content || page.html_content_fr || '',
        html_content_es: trans.es?.html_content || page.html_content_es || '',
        image: null,
        remove_image: false,
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'script', 'sub', 'super',
    'indent', 'direction', 'color', 'background',
    'align', 'link', 'image', 'video'
  ];

  if (isLoading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <GlobalLoader />
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
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Edit Content Page</h3>
                {lesson && <h6 className="text-muted">Editing for lesson: {lesson.title}</h6>}
              </div>
              <div className="col-auto">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back
                </button>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
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
                              <label className="form-label">Title <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                name="title_en"
                                value={formData.title_en}
                                onChange={handleInputChange}
                                placeholder="Enter English title"
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Content <span className="text-danger">*</span></label>
                              <div className="quill-editor bg-white">
                                <ReactQuill
                                  theme="snow"
                                  value={formData.html_content_en}
                                  onChange={(val) => handleContentChange('en', val)}
                                  modules={modules}
                                  formats={formats}
                                  placeholder="Enter English content..."
                                  style={{ height: '300px', marginBottom: '50px' }}
                                />
                              </div>
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
                              <label className="form-label">Título</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                name="title_es"
                                value={formData.title_es}
                                onChange={handleInputChange}
                                placeholder="Ingrese el título"
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Contenido</label>
                              <div className="quill-editor bg-white">
                                <ReactQuill
                                  theme="snow"
                                  value={formData.html_content_es}
                                  onChange={(val) => handleContentChange('es', val)}
                                  modules={modules}
                                  formats={formats}
                                  placeholder="Ingrese el contenido..."
                                  style={{ height: '300px', marginBottom: '50px' }}
                                />
                              </div>
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
                              <label className="form-label">Titre</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                name="title_fr"
                                value={formData.title_fr}
                                onChange={handleInputChange}
                                placeholder="Entrez le titre"
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Contenu</label>
                              <div className="quill-editor bg-white">
                                <ReactQuill
                                  theme="snow"
                                  value={formData.html_content_fr}
                                  onChange={(val) => handleContentChange('fr', val)}
                                  modules={modules}
                                  formats={formats}
                                  placeholder="Entrez le contenu..."
                                  style={{ height: '300px', marginBottom: '50px' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Image Management - Common */}
                      <div className="col-12 mt-3">
                        <div className="card shadow-none border bg-light">
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-6">
                                <div className="form-group mb-0">
                                  <label htmlFor="image" className="form-label fw-bold">New Image (Optional)</label>
                                  <input
                                    type="file"
                                    className="form-control bg-white"
                                    id="image"
                                    name="image"
                                    onChange={handleInputChange}
                                    accept="image/*"
                                  />
                                  <small className="text-muted">
                                    Upload a new image to replace the existing one
                                  </small>
                                </div>
                              </div>
                              {page?.image && (
                                <div className="col-md-6 border-start">
                                  <label className="form-label fw-bold">Current Image</label>
                                  <div className="d-flex align-items-center gap-3">
                                    <img
                                      src={page.image}
                                      alt="Current page"
                                      className="img-thumbnail"
                                      style={{ maxHeight: '80px' }}
                                    />
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="remove_image"
                                        name="remove_image"
                                        checked={formData.remove_image}
                                        onChange={handleInputChange}
                                      />
                                      <label className="form-check-label text-danger" htmlFor="remove_image">
                                        Remove current image
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-4">
                      <div className="col-12">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary px-4"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-warning px-4"
                            onClick={handleReset}
                            disabled={isSubmitting}
                          >
                            Reset
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary px-4"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <i className="fas fa-spinner fa-spin me-2"></i>
                                Updating...
                              </>
                            ) : (
                              "Update Page"
                            )}
                          </button>
                        </div>
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