import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getCourseById, getLessonsByChapter, deleteLesson } from '../api/courses';
import { getLessonAdmin } from '../api/lessons';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function ChapterLessons() {
  const { token } = useAuth();
  const { courseId, categoryId, chapterId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (courseId && chapterId) {
      fetchData();
    }
  }, [courseId, categoryId, chapterId]);

  const fetchData = async () => {
    setIsLoading(true);
    console.log('[v0] Fetching data for chapter:', chapterId);

    // Fetch course details
    const courseResult = await getCourseById(courseId, token);
    if (courseResult.success) {
      setCourse(courseResult.data);
    }

    // Fetch lessons from API
    const lessonsResult = await getLessonsByChapter(chapterId, token);
    if (lessonsResult.success) {
      setLessons(lessonsResult.data);
      setChapter({
        id: chapterId,
        title: `Chapter ${chapterId}`,
        description: 'Lessons in this chapter'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: lessonsResult.message || 'Failed to load lessons',
      });
    }

    setIsLoading(false);
  };

  // Pagination calculations
  const totalPages = Math.ceil(lessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLessons = lessons.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const getContentTypeBadge = (contentType) => {
    const badgeMap = {
      'text': 'bg-info',
      'video': 'bg-danger',
      'audio': 'bg-primary',
      'doc': 'bg-warning',
      'pdf': 'bg-secondary',
    };
    return badgeMap[contentType?.toLowerCase()] || 'bg-dark';
  };

  const getContentTypeIcon = (contentType) => {
    const iconMap = {
      'text': 'fas fa-file-alt',
      'video': 'fas fa-video',
      'audio': 'fas fa-headphones',
      'doc': 'fas fa-file-word',
      'pdf': 'fas fa-file-pdf',
    };
    return iconMap[contentType?.toLowerCase()] || 'fas fa-file';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: 'bg-success',
      inactive: 'bg-danger',
      draft: 'bg-warning',
      published: 'bg-success',
      blocked: 'bg-danger',
      review: 'bg-info',
    };
    return statusMap[status?.toLowerCase()] || 'bg-secondary';
  };

  const handleDeleteLesson = (lessonId, lessonTitle) => {
    Swal.fire({
      title: 'Delete Lesson',
      text: `Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteResult = await deleteLesson(lessonId, token);

          if (deleteResult.success) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Lesson has been deleted successfully.',
            });

            // Refresh the lessons list
            fetchData();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: deleteResult.message || 'Failed to delete lesson',
            });
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while deleting lesson',
          });
        }
      }
    });
  };

  const handleViewContent = async (lesson) => {
    setSelectedLesson(lesson);
    setShowContentModal(true);
    setContentLoading(true);
    
    try {
      const result = await getLessonAdmin(lesson.id, token);
      if (result.success) {
        setSelectedLesson(result.data);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Failed to load lesson content',
        });
        setShowContentModal(false);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while loading lesson content',
      });
      setShowContentModal(false);
    } finally {
      setContentLoading(false);
    }
  };

  const renderContentPreview = (content) => {
    if (!content) return <p className="text-muted">No content available</p>;

    switch (content.content_type?.toLowerCase()) {
      case 'video':
        return content.video_url ? (
          <div className="ratio ratio-16x9">
            <video controls className="w-100">
              <source src={content.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : <p className="text-muted">No video available</p>;

      case 'audio':
        return content.video_url ? (
          <div className="mb-3">
            <audio controls className="w-100">
              <source src={content.video_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : <p className="text-muted">No audio available</p>;

      case 'text':
        return content.text_content ? (
          <div className="card-text text-dark" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxHeight: '200px', overflowY: 'auto' }}>
            {content.text_content}
          </div>
        ) : <p className="text-muted">No text content available</p>;

      case 'pdf':
      case 'doc':
        return content.file_url ? (
          <div className="d-flex align-items-center gap-3">
            <i className={`fas ${content.content_type?.toLowerCase() === 'pdf' ? 'fa-file-pdf' : 'fa-file-word'} fa-2x text-danger`}></i>
            <div>
              <p className="mb-2">
                <strong>{content.title}</strong>
              </p>
              {content.file_size && <p className="text-muted mb-2 small">Size: {content.file_size}</p>}
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
        ) : <p className="text-muted">No file available</p>;

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
                <h5>Lessons{chapter && ` - ${chapter.title}`}</h5>
                {chapter?.description && (
                  <p className="text-muted small">{chapter.description}</p>
                )}
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        const addLessonUrl = categoryId
                          ? `/course/${courseId}/category/${categoryId}/chapter/${chapterId}/add-lesson`
                          : `/course/${courseId}/chapter/${chapterId}/add-lesson`;
                        navigate(addLessonUrl);
                      }}
                    >
                      <i className="fa fa-plus me-2"></i>Add Lesson
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        const chaptersUrl = categoryId
                          ? `/course/${courseId}/category/${categoryId}/chapters`
                          : `/course/${courseId}/chapters`;
                        navigate(chaptersUrl);
                      }}
                    >
                      <i className="fas fa-arrow-left me-2"></i>Back to Chapters
                    </button>
                  </li>
                  <li>
                    <div className="dropdown dropdown-action" data-bs-placement="bottom" data-bs-original-title="Download">
                      <div className="dropdown-menu dropdown-menu-end">
                        <ul className="d-block">
                          <li>
                            <a className="d-flex align-items-center download-item" href="javascript:void(0);" download="">
                              <i className="far fa-file-text me-2"></i>Excel
                            </a>
                          </li>
                          <li>
                            <a className="d-flex align-items-center download-item" href="javascript:void(0);" download="">
                              <i className="far fa-file-pdf me-2"></i>PDF
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  {isLoading ? (
                    <GlobalLoader visible={true} size="medium" />
                  ) : lessons.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No lessons found for this chapter</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Lesson Title</th>
                            <th>Order</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Downloadable</th>
                            <th>Content</th>
                            <th>Created Date</th>
                            <th>Content Type</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedLessons.map((lesson) => (
                            <tr key={lesson.id}>
                              <td>
                                <div>
                                  <span className="fw-bold">{lesson.title}</span>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-secondary">{lesson.order_number}</span>
                              </td>

                              <td>{lesson.duration}</td>
                              <td>
                                <span className={`badge ${getStatusBadge(lesson.status)}`}>
                                  {lesson.status ? lesson.status : '-'}
                                </span>
                              </td>
                              <td>
                                {lesson.content.is_downloadable ? 'Yes' : 'No'}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleViewContent(lesson)}
                                  title="View Content"
                                >
                                  View
                                  {/* <i className="fas fa-eye"></i> */}
                                </button>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(lesson.status)}`}>
                                  {lesson.creat_at ? new Date(lesson.creat_at).toLocaleDateString() : '-'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(lesson.status)}`}>
                                  {lesson.content.content_type ? lesson.content.content_type : '-'}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => {
                                      const editUrl = categoryId
                                        ? `/course/${courseId}/category/${categoryId}/chapter/${chapterId}/lesson/${lesson.id}/edit`
                                        : `/course/${courseId}/chapter/${chapterId}/lesson/${lesson.id}/edit`;
                                      navigate(editUrl);
                                    }}
                                    title="Edit Lesson"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                    title="Delete Lesson"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              {!isLoading && lessons.length > itemsPerPage && (
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="text-muted">
                        Showing {startIndex + 1} to {Math.min(endIndex, lessons.length)} of {lessons.length} lessons
                      </div>
                      <nav aria-label="Page navigation">
                        <ul className="pagination mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={handlePreviousPage}>
                              <i className="fa fa-chevron-left"></i> Previous
                            </button>
                          </li>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageClick(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          ))}

                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={handleNextPage}>
                              Next <i className="fa fa-chevron-right"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Content View Modal */}
      {showContentModal && selectedLesson && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedLesson.title}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowContentModal(false);
                    setSelectedLesson(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {contentLoading ? (
                  <div className="text-center py-5">
                    <GlobalLoader visible={true} size="medium" />
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-lg-8">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <h6 className="fw-bold mb-3">Content Preview</h6>
                          {renderContentPreview(selectedLesson.content)}
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <h6 className="fw-bold mb-3">Lesson Details</h6>
                          
                          {selectedLesson.description && (
                            <div className="mb-3">
                              <label className="text-muted small">Description</label>
                              <p className="mb-0 small">{selectedLesson.description}</p>
                            </div>
                          )}

                          {selectedLesson.duration && (
                            <div className="mb-3">
                              <label className="text-muted small">Duration</label>
                              <p className="mb-0 fw-bold">{selectedLesson.duration}</p>
                            </div>
                          )}

                          {selectedLesson.xp_points && (
                            <div className="mb-3">
                              <label className="text-muted small">XP Points</label>
                              <p className="mb-0 fw-bold">{selectedLesson.xp_points}</p>
                            </div>
                          )}

                          {selectedLesson.reward_points && (
                            <div className="mb-3">
                              <label className="text-muted small">Reward Points</label>
                              <p className="mb-0 fw-bold">{selectedLesson.reward_points}</p>
                            </div>
                          )}

                          <div className="mb-3">
                            <label className="text-muted small">Preview Available</label>
                            <p className="mb-0">
                              <span className={`badge ${selectedLesson.is_preview ? 'bg-success' : 'bg-secondary'}`}>
                                {selectedLesson.is_preview ? 'Yes' : 'No'}
                              </span>
                            </p>
                          </div>

                          <div className="mb-3">
                            <label className="text-muted small">Locked Status</label>
                            <p className="mb-0">
                              <span className={`badge ${selectedLesson.is_locked ? 'bg-warning' : 'bg-success'}`}>
                                {selectedLesson.is_locked ? 'Locked' : 'Unlocked'}
                              </span>
                            </p>
                          </div>

                          {selectedLesson.order_number && (
                            <div className="mb-3">
                              <label className="text-muted small">Order</label>
                              <p className="mb-0 fw-bold">#{selectedLesson.order_number}</p>
                            </div>
                          )}

                          {selectedLesson.content && (
                            <>
                              <hr className="my-3" />
                              <h6 className="fw-bold mb-3">Content Details</h6>
                              
                              <div className="mb-3">
                                <label className="text-muted small">Content Type</label>
                                <p className="mb-0">
                                  <span className={`badge ${getContentTypeBadge(selectedLesson.content.content_type)}`}>
                                    {selectedLesson.content.content_type?.toUpperCase()}
                                  </span>
                                </p>
                              </div>

                              {selectedLesson.content.duration && (
                                <div className="mb-3">
                                  <label className="text-muted small">Content Duration</label>
                                  <p className="mb-0 fw-bold">{selectedLesson.content.duration}</p>
                                </div>
                              )}

                              {selectedLesson.content.file_size && (
                                <div className="mb-3">
                                  <label className="text-muted small">File Size</label>
                                  <p className="mb-0 fw-bold">{selectedLesson.content.file_size}</p>
                                </div>
                              )}

                              <div className="mb-3">
                                <label className="text-muted small">Downloadable</label>
                                <p className="mb-0">
                                  <span className={`badge ${selectedLesson.content.is_downloadable ? 'bg-success' : 'bg-secondary'}`}>
                                    {selectedLesson.content.is_downloadable ? 'Yes' : 'No'}
                                  </span>
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowContentModal(false);
                    setSelectedLesson(null);
                  }}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    navigate(`/lesson/${selectedLesson.id}/content`);
                    setShowContentModal(false);
                    setSelectedLesson(null);
                  }}
                >
                  <i className="fas fa-external-link-alt me-2"></i>Open Full Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
