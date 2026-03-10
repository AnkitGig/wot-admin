import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getCourseById, getLessonsByChapter, deleteLesson } from '../api/courses';
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
                                  {lesson.status ? new Date(lesson.status).toLocaleDateString() : '-'}
                                </span>
                              </td>
                              <td>
                                {lesson.content.is_downloadable ? 'Yes' : 'No'}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => navigate(`/lesson/${lesson.id}/content`)}
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
    </div>
  );
}
