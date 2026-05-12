import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createLessonPage, getLessonAdmin, importLessonPageFromJSON } from '../api/lessons';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function AddContentPage() {
  const { lessonId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fr: '',
    title_es: '',
    html_content_en: '',
    html_content_fr: '',
    html_content_es: '',
    image: null,
  });

  useEffect(() => {
    if (lessonId && token) {
      fetchLessonDetails();
    }
  }, [lessonId, token]);

  const fetchLessonDetails = async () => {
    setIsLoading(true);
    const result = await getLessonAdmin(lessonId, token);
    
    if (result.success) {
      setLesson(result.data);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Lesson',
        text: result.message || 'An error occurred while loading lesson details',
      });
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleContentChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      [`html_content_${lang}`]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Please select a JSON file",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select a JSON file",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await importLessonPageFromJSON(lessonId, selectedFile, token);
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Import Successful",
          text: result.message || "Lesson pages imported successfully",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => navigate(`/lesson/${lessonId}/content`));
      } else {
        throw new Error(result.message || "Import failed");
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Import Failed", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
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
    const result = await createLessonPage(lessonId, formData, token);
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Content page created successfully',
      }).then(() => {
        navigate(`/lesson/${lessonId}/content`);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Page',
        text: result.message || 'An error occurred while creating the content page',
      });
    }
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFormData({
      title_en: '',
      title_fr: '',
      title_es: '',
      html_content_en: '',
      html_content_fr: '',
      html_content_es: '',
      image: null,
    });
    setSelectedFile(null);
  };

  const handleCancel = () => {
    navigate(`/lesson/${lessonId}/content`);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
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
                <h3 className="page-title">Add Content Page</h3>
                {lesson && <h6 className="text-muted">Adding to lesson: {lesson.title}</h6>}
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
                  {/* Tab Navigation */}
                  <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${!importMode ? "active" : ""}`}
                        onClick={() => setImportMode(false)}
                        type="button"
                      >
                        <i className="fa fa-plus me-2"></i>Add Single Page
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${importMode ? "active" : ""}`}
                        onClick={() => setImportMode(true)}
                        type="button"
                      >
                        <i className="fa fa-file-import me-2"></i>Import from JSON
                      </button>
                    </li>
                  </ul>

                  {!importMode ? (
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

                        {/* Image Upload - Common */}
                        <div className="col-12 mt-3">
                          <div className="card shadow-none border bg-light">
                            <div className="card-body">
                              <div className="form-group mb-0">
                                <label htmlFor="image" className="form-label fw-bold">Featured Image (Optional)</label>
                                <input
                                  type="file"
                                  className="form-control bg-white"
                                  id="image"
                                  name="image"
                                  onChange={handleInputChange}
                                  accept="image/*"
                                />
                                <small className="text-muted">
                                  Upload an image for the content page
                                </small>
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
                                  Creating...
                                </>
                              ) : (
                                "Create Page"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* Import JSON section */
                    <div className="row g-3 justify-content-center py-5">
                      <div className="col-md-6 text-center">
                        <div className="mb-4">
                          <i className="fas fa-file-import fa-4x text-primary mb-3"></i>
                          <h4>Import Pages from JSON</h4>
                          <p className="text-muted">Select a JSON file containing lesson pages data.</p>
                        </div>
                        <div className="mb-4 text-start">
                          <label className="form-label fw-bold">Select JSON File <span className="text-danger">*</span></label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".json,application/json"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                          />
                          {selectedFile && (
                            <div className="mt-2 text-success">
                              <i className="fa fa-check-circle me-1"></i>
                              Selected: {selectedFile.name}
                            </div>
                          )}
                        </div>
                        <div className="d-flex justify-content-center gap-2 mt-4">
                          <button
                            type="button"
                            className="btn btn-secondary px-4"
                            onClick={() => setImportMode(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary px-4"
                            onClick={handleImport}
                            disabled={isSubmitting || !selectedFile}
                          >
                            {isSubmitting ? (
                              <>
                                <i className="fas fa-spinner fa-spin me-2"></i>
                                Importing...
                              </>
                            ) : (
                              <>
                                <i className="fa fa-file-import me-2"></i>
                                Import JSON
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
