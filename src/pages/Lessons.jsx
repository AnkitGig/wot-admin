import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getAllCourses } from '../api/courses';
import { getLessonsByCourse, deleteLesson } from '../api/lessons';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function Lessons() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [coursesMap, setCoursesMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setIsLoading(true);
    
    // First fetch all courses to map IDs to titles
    const coursesResult = await getAllCourses(token);
    let coursesList = {};
    
    if (coursesResult.success) {
      coursesResult.data?.forEach(course => {
        coursesList[course.id] = course;
      });
      setCoursesMap(coursesList);
    }

    // Fetch lessons for all courses
    const allLessons = [];
    if (coursesResult.success && coursesResult.data?.length > 0) {
      for (const course of coursesResult.data) {
        const lessonsResult = await getLessonsByCourse(course.id, token);
        if (lessonsResult.success && lessonsResult.data?.length > 0) {
          allLessons.push(...lessonsResult.data.map(lesson => ({
            ...lesson,
            courseId: course.id,
            courseName: course.title
          })));
        }
      }
    }

    console.log('[v0] Fetched lessons:', allLessons);
    if (allLessons.length > 0) {
      setLessons(allLessons);
    } else {
      setLessons([]);
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

  const handleDeleteLesson = (lessonId, lessonTitle, courseId) => {
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
        const deleteResult = await deleteLesson(lessonId, token);

        if (deleteResult.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: deleteResult.message || 'Lesson deleted successfully',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => {
            fetchLessons();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Delete',
            text: deleteResult.message || 'An error occurred while deleting the lesson',
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
                <h5>Lessons</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
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
                      <p className="text-muted">No lessons found. Create lessons within courses.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Lesson Title</th>
                            <th>Course</th>
                            <th>Type</th>
                            <th>Order</th>
                            <th>Duration</th>
                            <th>Content</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedLessons && paginatedLessons.length > 0 ? paginatedLessons.map((lesson) => (
                            <tr key={lesson.id}>
                              <td><strong>{lesson.title}</strong></td>
                              <td>
                                <Link to={`/course/${lesson.courseId}/lessons`} className="text-decoration-none">
                                  {lesson.courseName}
                                </Link>
                              </td>
                              <td>
                                <span className={`badge ${getContentTypeBadge(lesson.content_type)}`}>
                                  <i className={`${getContentTypeIcon(lesson.content_type)} me-1`}></i>
                                  {lesson.content_type}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-primary">{lesson.order_number || lesson.order || '-'}</span>
                              </td>
                              <td>{lesson.duration || '-'}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => navigate(`/lesson/${lesson.id}/content`)}
                                  title="View Content"
                                >
                                  <i className="fas fa-eye me-1"></i>View
                                </button>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Link 
                                    to={`/course/${lesson.courseId}/lesson/${lesson.id}/edit`}
                                    className="btn btn-sm btn-outline-warning"
                                    title="Edit Lesson"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Link>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteLesson(lesson.id, lesson.title, lesson.courseId)}
                                    title="Delete Lesson"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="7" className="text-center py-3 text-muted">
                                No lessons to display
                              </td>
                            </tr>
                          )}
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
