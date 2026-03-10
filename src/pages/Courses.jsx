import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllCourses, getCourseById, deleteCourse } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';
import CourseDetailModal from '../components/CourseDetailModal';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function Courses() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    const result = await getAllCourses(token);
    
    if (result.success) {
      setCourses(result.data || []);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Courses',
        text: result.message || 'An error occurred while fetching courses',
      });
      setCourses([]);
    }
    setIsLoading(false);
  };

  const handleViewCourse = async (courseId) => {
    setShowModal(true);
    setModalLoading(true);
    
    const result = await getCourseById(courseId, token);
    
    if (result.success) {
      setSelectedCourse(result.data);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Course',
        text: result.message || 'An error occurred while fetching course details',
      });
      setShowModal(false);
    }
    setModalLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  const handleDeleteCourse = (courseId, courseName) => {
    Swal.fire({
      title: 'Delete Course',
      text: `Are you sure you want to delete "${courseName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const deleteResult = await deleteCourse(courseId, token);

        if (deleteResult.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: deleteResult.message || 'Course deleted successfully',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => {
            fetchCourses();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Delete',
            text: deleteResult.message || 'An error occurred while deleting the course',
          });
        }
      }
    });
  };

  // Map status to badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      active: 'bg-success',
      inactive: 'bg-danger',
      draft: 'bg-warning',
      published: 'bg-success',
      blocked: 'bg-danger',
    };
    return statusMap[status?.toLowerCase()] || 'bg-secondary';
  };

  // Map level to badge color
  const getLevelBadge = (level) => {
    const levelMap = {
      beginner: 'bg-success',
      intermediate: 'bg-primary',
      advanced: 'bg-danger',
      'beginer': 'bg-success', // handle typo from API
    };
    return levelMap[level?.toLowerCase()] || 'bg-secondary';
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
                <h5>Courses</h5>
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
                  <li>
                    <Link className="btn btn-primary" to="/admin-categories"><i className="fa fa-plus-circle me-2"></i>Add Category</Link>
                  </li>
                   <li>
                    <Link className="btn btn-primary" to="/add-course"><i className="fa fa-plus-circle me-2"></i>Add Course</Link>
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
                  ) : courses.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No courses found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Course Title</th>
                            <th>Level</th>
                            <th>Duration</th>
                            <th>Chepter</th>
                            <th>Enrolled</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((course) => (
                            <tr key={course.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={course.thumbnail || course.image} 
                                    alt={course.title}
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '4px',
                                      marginRight: '10px',
                                      objectFit: 'cover',
                                      backgroundColor: '#f0f0f0'
                                    }}
                                  />
                                  <div>
                                    <span>{course.title}</span>
                                    <br />
                                    <small className="text-muted">{course.slug}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${getLevelBadge(course.level)}`}>
                                  {course.level}
                                </span>
                              </td>
                              <td>{course.duration_in_minutes} min</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => navigate(`/courses/admin/course/${course.id}/chapters`)}
                                  title="View Chapters"
                                >
                                  View
                                  {/* <span className="ms-1">{course.chapter_count || 0}</span> */}
                                </button>
                              </td>
                              <td>{course.enrolled_count || 0}</td>
                              <td>
                                <span className={`badge ${getStatusBadge(course.status)}`}>
                                  {course.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleViewCourse(course.id)}
                                    title="View Course"
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  <Link 
                                    to={`/edit-course/${course.id}`}
                                    className="btn btn-sm btn-outline-warning"
                                    title="Edit Course"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Link>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteCourse(course.id, course.title)}
                                    title="Delete Course"
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
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <CourseDetailModal 
        show={showModal}
        courseData={selectedCourse}
        isLoading={modalLoading}
        onClose={handleCloseModal}
      />
    </div>
  );
}
