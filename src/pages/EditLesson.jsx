import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getLessonById, updateLesson } from '../api/lessons';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const CONTENT_TYPES = ['text', 'video', 'audio'];

export default function EditLesson() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    content_type: 'text',
    duration: '',
    order: 1,
    media: null,
  });

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    setIsLoading(true);
    const result = await getLessonById(lessonId, token);

    if (result.success) {
      const lesson = result.data;
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        content: lesson.content || '',
        content_type: lesson.content_type || 'text',
        duration: lesson.duration || '',
        order: lesson.order || 1,
        media: null,
      });
      
      if (lesson.file_url || lesson.video_url) {
        setMediaPreview(lesson.file_url || lesson.video_url);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Lesson',
        text: result.message || 'An error occurred while fetching lesson',
      });
      navigate(`/course/${courseId}/lessons`);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        media: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    navigate(`/course/${courseId}/lessons`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter lesson title',
      });
      return;
    }

    if (!formData.description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter lesson description',
      });
      return;
    }

    if (!formData.content.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter lesson content',
      });
      return;
    }

    setIsSaving(true);

    const result = await updateLesson(courseId, lessonId, formData, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Lesson Updated',
        text: result.message || 'Lesson updated successfully!',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate(`/course/${courseId}/lessons`);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Update Lesson',
        text: result.message || 'An error occurred while updating the lesson',
      });
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="container-lg">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <GlobalLoader visible={true} />
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
        <div className="container-lg">
          <div className="page-header d-print-none">
            <div className="row align-items-center">
              <div className="col">
                <h2 className="page-title">Edit Lesson</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="page-body">
          <div className="container-lg">
            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit} className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label">Lesson Title <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Enter lesson title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Order <span className="text-danger">*</span></label>
                        <input 
                          type="number" 
                          className="form-control"
                          name="order"
                          value={formData.order}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Content Type <span className="text-danger">*</span></label>
                        <select 
                          className="form-select"
                          name="content_type"
                          value={formData.content_type}
                          onChange={handleInputChange}
                        >
                          {CONTENT_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Duration</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="e.g., 25 min"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Lesson Description <span className="text-danger">*</span></label>
                        <textarea 
                          className="form-control" 
                          rows="3" 
                          placeholder="Enter lesson description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Content <span className="text-danger">*</span></label>
                        <textarea 
                          className="form-control" 
                          rows="4" 
                          placeholder="Enter lesson content/text"
                          name="content"
                          value={formData.content}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Media File</label>
                        <input 
                          type="file" 
                          className="form-control"
                          onChange={handleMediaChange}
                          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                        />
                        {mediaPreview && (
                          <div className="mt-3">
                            {formData.content_type === 'video' ? (
                              <video width="200" height="150" controls style={{ borderRadius: '4px' }}>
                                <source src={mediaPreview} type="video/mp4" />
                              </video>
                            ) : formData.content_type === 'audio' ? (
                              <audio controls style={{ width: '200px' }}>
                                <source src={mediaPreview} type="audio/webm" />
                              </audio>
                            ) : (
                              <img 
                                src={mediaPreview} 
                                alt="Preview" 
                                style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                              />
                            )}
                          </div>
                        )}
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
                          disabled={isSaving}
                        >
                          <i className="bi bi-check-circle"></i> {isSaving ? 'Updating...' : 'Update Lesson'}
                        </button>
                      </div>
                    </form>
                  </div>
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
