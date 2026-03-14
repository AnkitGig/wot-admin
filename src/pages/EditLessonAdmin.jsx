import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getLessonAdmin, updateLessonAdmin } from '../api/lessons';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const CONTENT_TYPES = ['text', 'video', 'audio', 'doc', 'pdf'];

export default function EditLessonAdmin() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lesson_number: 0,
    duration: '',
    xp_points: 0,
    reward_points: 0,
    is_preview: false,
    is_locked: false,
    quiz_available: false,
    order_number: 0,
    thumbnail: null,
    content_title: '',
    content_type: 'text',
    text_content: '',
    content_duration: '',
    file_size: '',
    is_downloadable: false,
    media: null,
  });

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    setIsLoading(true);
    const result = await getLessonAdmin(lessonId, token);

    if (result.success) {
      const lesson = result.data;
      setLessonData(lesson);
      
      // Map content data from nested content object
      const contentData = lesson.content || {};
      
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        lesson_number: lesson.lesson_number || 0,
        duration: lesson.duration || '',
        xp_points: lesson.xp_points || 0,
        reward_points: lesson.reward_points || 0,
        is_preview: lesson.is_preview || false,
        is_locked: lesson.is_locked || false,
        quiz_available: lesson.quiz_available || false,
        order_number: lesson.order_number || 0,
        thumbnail: null,
        content_title: contentData.title || '',
        content_type: contentData.content_type || 'text',
        text_content: contentData.text_content || '',
        content_duration: contentData.duration || '',
        file_size: contentData.file_size || '',
        is_downloadable: contentData.is_downloadable || false,
        media: null,
      });
      
      if (lesson.thumbnail) {
        setThumbnailPreview(lesson.thumbnail);
      }
      if (contentData.file_url || contentData.video_url) {
        setMediaPreview(contentData.file_url || contentData.video_url);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Lesson',
        text: result.message || 'An error occurred while fetching lesson',
      });
      navigate('/lessons');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;

    // Handle boolean fields from select dropdowns
    if (['is_preview', 'is_locked', 'is_downloadable', 'quiz_available'].includes(name)) {
      finalValue = value === 'true' || value === true;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
    navigate(-1); // Go back to previous page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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

    if (!formData.content_type) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a content type',
      });
      return;
    }

    setIsSaving(true);

    const result = await updateLessonAdmin(lessonId, formData, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Lesson Updated',
        text: result.message || 'Lesson updated successfully!',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate(-1); // Go back to previous page
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
        <div className="content container-fluid">
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Edit Lesson</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button className="btn btn-primary" onClick={handleCancel}>
                      <i className="fa fa-arrow-left me-2"></i>Back
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
                  <form onSubmit={handleSubmit} className="row g-3">
                    {/* Basic Lesson Information */}
                    <div className="col-md-6">
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

                    <div className="col-md-6">
                      <label className="form-label">Lesson Number</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        name="lesson_number"
                        value={formData.lesson_number}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>

                    <div className="col-md-4">
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

                    <div className="col-md-4">
                      <label className="form-label">XP Points</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        name="xp_points"
                        value={formData.xp_points}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Reward Points</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        name="reward_points"
                        value={formData.reward_points}
                        onChange={handleInputChange}
                        min="0"
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

                    {/* Lesson Settings */}
                    <div className="col-md-3">
                      <label className="form-label">Is Preview</label>
                      <select
                         className="form-control"
                        name="is_preview"
                        value={String(formData.is_preview)}
                        onChange={handleInputChange}
                         style={{ appearance: "auto" }}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Is Locked</label>
                      <select
                        className="form-control"
                        name="is_locked"
                        value={String(formData.is_locked)}
                        onChange={handleInputChange}
                        style={{ appearance: "auto" }}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Quiz Available</label>
                      <select
                        className="form-control"
                        name="quiz_available"
                        value={String(formData.quiz_available)}
                        onChange={handleInputChange}
                        style={{ appearance: "auto" }}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Order Number</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        name="order_number"
                        value={formData.order_number}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>

                    {/* Thumbnail - Show for all content types */}
                    <div className="col-md-12">
                      <label className="form-label">Thumbnail</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                      {thumbnailPreview && (
                        <div className="mt-3">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail Preview"
                            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content Information */}
                    <div className="col-md-6">
                      <label className="form-label">Content Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter content title"
                        name="content_title"
                        value={formData.content_title}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Content Type <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        name="content_type"
                        value={formData.content_type}
                        onChange={handleInputChange}
                        required
                        style={{ appearance: "auto" }}
                      >
                        <option value="text">Text</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                        <option value="pdf">PDF</option>
                        <option value="doc">Document</option>
                      </select>
                    </div>

                    {formData.content_type === 'text' && (
                      <div className="col-md-12">
                        <label className="form-label">Text Content</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          placeholder="Enter text content"
                          name="text_content"
                          value={formData.text_content}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                    )}

                    <div className="col-md-4">
                      <label className="form-label">Content Duration</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., 25 min"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">File Size</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., 2.5 MB"
                        name="file_size"
                        value={formData.file_size}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Is Downloadable</label>
                      <select
                        className="form-select"
                        name="is_downloadable"
                        value={String(formData.is_downloadable)}
                        onChange={handleInputChange}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>

                    {/* Media File - Show for video, audio, pdf, doc */}
                    {(formData.content_type === 'video' || formData.content_type === 'audio' || formData.content_type === 'pdf' || formData.content_type === 'doc') && (
                      <div className="col-md-12">
                        <label className="form-label">Media File</label>
                        <input
                          type="file"
                          className="form-control"
                          onChange={handleMediaChange}
                          accept={formData.content_type === 'video' ? 'video/*' : 
                                 formData.content_type === 'audio' ? 'audio/*' : 
                                 formData.content_type === 'pdf' ? '.pdf' : 
                                 '.doc,.docx'}
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
                                alt="Media Preview"
                                style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Form Actions */}
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
      <Footer />
    </div>
  );
}
