import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getCourseChapters, deleteCourseChapter } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function CourseChapters() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourseChapters();
  }, [courseId]);

  const fetchCourseChapters = async () => {
    setIsLoading(true);
    const result = await getCourseChapters(courseId, token);

    if (result.success) {
      setCourseData(result.data);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Chapters',
        text: result.message || 'An error occurred while fetching chapters',
      });
    }
    setIsLoading(false);
  };

  const handleCreateChapter = () => {
    navigate(`/courses/admin/course/${courseId}/chapter`);
  };

  const handleViewLessons = (chapterId) => {
    navigate(`/course/${courseId}/chapter/${chapterId}/lessons`);
  };

  const handleEditChapter = (chapterId) => {
    navigate(`/courses/admin/course/${courseId}/chapter/${chapterId}/edit`);
  };

  const handleDeleteChapter = (chapterId, chapterTitle) => {
    Swal.fire({
      title: 'Delete Chapter',
      text: `Are you sure you want to delete "${chapterTitle}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const deleteResult = await deleteCourseChapter(chapterId, token);

        if (deleteResult.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: deleteResult.message || 'Chapter deleted successfully',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => {
            fetchCourseChapters();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Delete',
            text: deleteResult.message || 'An error occurred while deleting the chapter',
          });
        }
      }
    });
  };

  // Map status to badge color
  const getLockedBadge = (isLocked) => {
    return isLocked ? 'bg-warning' : 'bg-success';
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
                <h5>Course Chapters</h5>
                {courseData && (
                  <small className="text-muted">Course ID: {courseData.course_id}</small>
                )}
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/courses')}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back to Courses
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateChapter}
                    >
                      <i className="fa fa-plus-circle me-2"></i>Add Chapter
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
                  {isLoading ? (
                    <GlobalLoader visible={true} size="medium" />
                  ) : !courseData || courseData.categories.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No chapters found</p>
                      <button
                        className="btn btn-primary"
                        onClick={handleCreateChapter}
                      >
                        <i className="fa fa-plus me-2"></i>Create First Chapter
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      {courseData.categories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-4">
                          <h6 className="text-primary mb-3">
                            <i className="fas fa-folder me-2"></i>
                            {category.category}
                            <span className="badge bg-secondary ms-2">
                              {category.chapters.length} chapters
                            </span>
                          </h6>

                          {category.chapters.length === 0 ? (
                            <div className="text-center py-3 bg-light rounded mb-3">
                              <p className="text-muted mb-0">No chapters in this category</p>
                            </div>
                          ) : (
                            <table className="table table-striped table-hover">
                              <thead>
                                <tr>
                                  <th>Chapter Title</th>
                                  <th>Chapter Number</th>
                                  <th>Duration</th>
                                  <th>Lessons</th>
                                  <th>Status</th>
                                  <th>Order</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {category.chapters.map((chapter) => (
                                  <tr key={chapter.id}>
                                    <td>
                                      <div>
                                        <strong>{chapter.title}</strong>
                                        <br />
                                        <small className="text-muted">{chapter.description}</small>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="badge bg-info">
                                        {chapter.chapter_number}
                                      </span>
                                    </td>
                                    <td>{chapter.duration}</td>
                                    <td>
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleViewLessons(chapter.id)}
                                        title="View Lesson"
                                      >
                                        View
                                      </button>
                                    </td>
                                    <td>
                                      <span className={`badge ${getLockedBadge(chapter.is_locked)}`}>
                                        {chapter.is_locked ? 'Locked' : 'Unlocked'}
                                      </span>
                                    </td>
                                    <td>{chapter.order_number}</td>
                                    <td>
                                      <div className="d-flex gap-2">
                                        <button
                                          className="btn btn-sm btn-outline-warning"
                                          onClick={() => handleEditChapter(chapter.id)}
                                          title="Edit Chapter"
                                        >
                                          <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleDeleteChapter(chapter.id, chapter.title)}
                                          title="Delete Chapter"
                                        >
                                          <i className="fas fa-trash"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      ))}
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
