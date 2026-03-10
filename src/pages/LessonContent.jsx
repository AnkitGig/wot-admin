import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getLessonContent, createLessonContent, getLessonAdmin } from '../api/lessons';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function LessonContent() {
  const { lessonId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentFormData, setContentFormData] = useState({
    title: '',
    content_type: 'text',
    text_content: '',
    duration: '',
    file_size: '',
    is_downloadable: false,
    order_number: 1,
    media: null,
  });

  useEffect(() => {
    console.log('[v0] LessonContent mounted with lessonId:', lessonId);
    console.log('[v0] Token present:', !!token);
    if (lessonId && token) {
      fetchContent();
    }
  }, [lessonId, token]);

  const fetchContent = async () => {
    setIsLoading(true);
    console.log('[v0] Fetching lesson details for lessonId:', lessonId);
    const result = await getLessonAdmin(lessonId, token);
    
    console.log('[v0] API Response:', result);
    if (result.success) {
      console.log('[v0] Lesson loaded:', result.data);
      setLesson(result.data);
      setContent(result.data.content);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Content',
        text: result.message || 'An error occurred while loading lesson content',
      });
    }
    setIsLoading(false);
  };

  const getContentTypeBadge = (type) => {
    const badges = {
      'video': 'bg-danger',
      'audio': 'bg-info',
      'text': 'bg-primary',
      'pdf': 'bg-warning',
      'doc': 'bg-secondary',
    };
    return badges[type?.toLowerCase()] || 'bg-secondary';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setContentFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const handleAddContent = async () => {
    if (!contentFormData.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter content title',
      });
      return;
    }

    setIsLoading(true);
    const result = await createLessonContent(lessonId, contentFormData, token);
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Content created successfully',
      });
      setShowContentModal(false);
      setContentFormData({
        title: '',
        content_type: 'text',
        text_content: '',
        duration: '',
        file_size: '',
        is_downloadable: false,
        order_number: 1,
        media: null,
      });
      await fetchContent();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Content',
        text: result.message,
      });
    }
    setIsLoading(false);
  };

  const handleDeleteContent = () => {
    Swal.fire({
      title: 'Delete Content',
      text: 'Are you sure you want to delete this content? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Coming Soon',
          text: 'Delete functionality will be available soon',
          icon: 'info',
        });
      }
    });
  };

  const renderContent = () => {
    if (!content) return null;

    switch (content.content_type?.toLowerCase()) {
      case 'video':
        return content.video_url ? (
          <div className="ratio ratio-16x9">
            <video controls className="w-100">
              <source src={content.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : null;

      case 'audio':
        return content.video_url ? (
          <div className="mb-3">
            <audio controls className="w-100">
              <source src={content.video_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : null;

      case 'text':
        return content.text_content ? (
          <div className="card-text text-dark" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {content.text_content}
          </div>
        ) : null;

      case 'pdf':
      case 'doc':
        return content.file_url ? (
          <div className="d-flex align-items-center gap-3">
            <i className={`fas ${content.content_type?.toLowerCase() === 'pdf' ? 'fa-file-pdf' : 'fa-file-word'} fa-3x text-danger`}></i>
            <div>
              <p className="mb-2">
                <strong>{content.title}</strong>
              </p>
              {content.file_size && <p className="text-muted mb-2">Size: {content.file_size}</p>}
              <a 
                href={content.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary"
              >
                <i className="fas fa-download me-2"></i>Download
              </a>
            </div>
          </div>
        ) : null;

      default:
        return <p className="text-muted">Content preview not available</p>;
    }
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
                <h5>{lesson?.title || content?.title || 'Lesson Content'}</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    {!content && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowContentModal(true)}
                      >
                        <i className="fa fa-plus me-2"></i>Add Content
                      </button>
                    )}
                    {content && (
                      <>
                        <button 
                          className="btn btn-warning me-2"
                          onClick={() => setShowContentModal(true)}
                        >
                          <i className="fa fa-edit me-2"></i>Update
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={handleDeleteContent}
                        >
                          <i className="fa fa-trash me-2"></i>Delete
                        </button>
                      </>
                    )}
                  </li>
                  <li>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => navigate(-1)}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {isLoading ? (
            <GlobalLoader visible={true} size="medium" />
          ) : lesson ? (
            <div className="row">
              <div className="col-lg-8">
                <div className="card border-0 shadow-soft">
                  <div className="card-body p-4">
                    <div className="mb-4">
                      {renderContent()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card border-0 shadow-soft">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Lesson Details</h6>
                    
                    {lesson.description && (
                      <div className="mb-3">
                        <label className="text-muted small">Description</label>
                        <p className="mb-0 small">{lesson.description}</p>
                      </div>
                    )}

                    {lesson.duration && (
                      <div className="mb-3">
                        <label className="text-muted small">Lesson Duration</label>
                        <p className="mb-0 fw-bold">{lesson.duration}</p>
                      </div>
                    )}

                    {lesson.xp_points && (
                      <div className="mb-3">
                        <label className="text-muted small">XP Points</label>
                        <p className="mb-0 fw-bold">{lesson.xp_points}</p>
                      </div>
                    )}

                    {lesson.reward_points && (
                      <div className="mb-3">
                        <label className="text-muted small">Reward Points</label>
                        <p className="mb-0 fw-bold">{lesson.reward_points}</p>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="text-muted small">Preview Available</label>
                      <p className="mb-0">
                        <span className={`badge ${lesson.is_preview ? 'bg-success' : 'bg-secondary'}`}>
                          {lesson.is_preview ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>

                    <div className="mb-3">
                      <label className="text-muted small">Locked Status</label>
                      <p className="mb-0">
                        <span className={`badge ${lesson.is_locked ? 'bg-warning' : 'bg-success'}`}>
                          {lesson.is_locked ? 'Locked' : 'Unlocked'}
                        </span>
                      </p>
                    </div>

                    {lesson.order_number && (
                      <div className="mb-3">
                        <label className="text-muted small">Order</label>
                        <p className="mb-0 fw-bold">#{lesson.order_number}</p>
                      </div>
                    )}

                    <hr className="my-3" />
                    
                    <h6 className="fw-bold mb-3">Content Details</h6>
                    
                    <div className="mb-3">
                      <label className="text-muted small">Content Type</label>
                      <p className="mb-0">
                        <span className={`badge ${getContentTypeBadge(content.content_type)}`}>
                          {content.content_type?.toUpperCase()}
                        </span>
                      </p>
                    </div>

                    {content.duration && (
                      <div className="mb-3">
                        <label className="text-muted small">Duration</label>
                        <p className="mb-0 fw-bold">{content.duration}</p>
                      </div>
                    )}

                    {content.file_size && (
                      <div className="mb-3">
                        <label className="text-muted small">File Size</label>
                        <p className="mb-0 fw-bold">{content.file_size}</p>
                      </div>
                    )}

                    {content.order_number && (
                      <div className="mb-3">
                        <label className="text-muted small">Order</label>
                        <p className="mb-0 fw-bold">#{content.order_number}</p>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="text-muted small">Downloadable</label>
                      <p className="mb-0">
                        <span className={`badge ${content.is_downloadable ? 'bg-success' : 'bg-secondary'}`}>
                          {content.is_downloadable ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>

                    {content.created_at && (
                      <div className="mb-3 pt-3 border-top">
                        <label className="text-muted small">Created</label>
                        <p className="mb-0 small">
                          {new Date(content.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0">
              <div className="card-body p-5 text-center">
                <p className="text-muted">No content available for this lesson</p>
              </div>
            </div>
          )}

          {/* Content Modal */}
          {showContentModal && (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{content ? 'Update Content' : 'Add Content'}</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowContentModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label">Content Title <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            name="title"
                            value={contentFormData.title}
                            onChange={handleInputChange}
                            placeholder="Enter content title"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Content Type <span className="text-danger">*</span></label>
                          <select
                            className="form-select"
                            name="content_type"
                            value={contentFormData.content_type}
                            onChange={handleInputChange}
                          >
                            <option value="text">Text</option>
                            <option value="video">Video</option>
                            <option value="audio">Audio</option>
                            <option value="pdf">PDF</option>
                            <option value="doc">Document</option>
                          </select>
                        </div>

                        {contentFormData.content_type === 'text' && (
                          <div className="mb-3">
                            <label className="form-label">Text Content</label>
                            <textarea
                              className="form-control"
                              name="text_content"
                              rows="4"
                              value={contentFormData.text_content}
                              onChange={handleInputChange}
                              placeholder="Enter text content"
                            ></textarea>
                          </div>
                        )}

                        {(contentFormData.content_type === 'video' || contentFormData.content_type === 'audio' || contentFormData.content_type === 'pdf' || contentFormData.content_type === 'doc') && (
                          <div className="mb-3">
                            <label className="form-label">Media File</label>
                            <input
                              type="file"
                              className="form-control"
                              name="media"
                              onChange={handleInputChange}
                              accept={
                                contentFormData.content_type === 'video' ? 'video/*' :
                                contentFormData.content_type === 'audio' ? 'audio/*' :
                                contentFormData.content_type === 'pdf' ? '.pdf' :
                                '.doc,.docx'
                              }
                            />
                          </div>
                        )}

                        <div className="mb-3">
                          <label className="form-label">Duration</label>
                          <input
                            type="text"
                            className="form-control"
                            name="duration"
                            value={contentFormData.duration}
                            onChange={handleInputChange}
                            placeholder="e.g., 10:30"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">File Size</label>
                          <input
                            type="text"
                            className="form-control"
                            name="file_size"
                            value={contentFormData.file_size}
                            onChange={handleInputChange}
                            placeholder="e.g., 150MB"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-check-label">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              name="is_downloadable"
                              checked={contentFormData.is_downloadable}
                              onChange={handleInputChange}
                            />
                            Downloadable
                          </label>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Order Number</label>
                          <input
                            type="number"
                            className="form-control"
                            name="order_number"
                            value={contentFormData.order_number}
                            onChange={handleInputChange}
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowContentModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleAddContent}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : (content ? 'Update' : 'Add')} Content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
