import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createLessonPage, getLessonAdmin } from '../api/lessons';
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
  const [formData, setFormData] = useState({
    title: '',
    html_content: '',
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

  const handleContentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      html_content: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a title',
      });
      return;
    }

    if (!formData.html_content.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter content',
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
      title: '',
      html_content: '',
      image: null,
    });
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
                <div className="card-header">
                  <h5 className="card-title">
                    {lesson ? `Add Page to: ${lesson.title}` : 'Add Content Page'}
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12">
                        <div className="form-group">
                          <label htmlFor="title" className="form-label">
                            Title <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter page title"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12">
                        <div className="form-group">
                          <label htmlFor="html_content" className="form-label">
                            HTML Content <span className="text-danger">*</span>
                          </label>
                          <div className="quill-editor">
                            <ReactQuill
                              theme="snow"
                              value={formData.html_content}
                              onChange={handleContentChange}
                              modules={modules}
                              formats={formats}
                              placeholder="Enter your content here..."
                              style={{ height: '300px', marginBottom: '50px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12">
                        <div className="form-group">
                          <label htmlFor="image" className="form-label">
                            Image
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            id="image"
                            name="image"
                            onChange={handleInputChange}
                            accept="image/*"
                          />
                          <small className="text-muted">
                            Upload an image for the content page (optional)
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-4">
                      <div className="col-12">
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                          >
                            <i className="fas fa-times me-2"></i>
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-warning"
                            onClick={handleReset}
                            disabled={isSubmitting}
                          >
                            <i className="fas fa-redo me-2"></i>
                            Reset
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <i className="fas fa-spinner fa-spin me-2"></i>
                                Creating...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save me-2"></i>
                                Execute
                              </>
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
