import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getCourseById, getChaptersByCategory } from '../api/courses';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function Chapters() {
  const { token } = useAuth();
  const { courseId, categoryId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [category, setCategory] = useState(null);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId && categoryId) {
      fetchData();
    }
  }, [courseId, categoryId]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch course details
    const courseResult = await getCourseById(courseId, token);
    if (courseResult.success) {
      setCourse(courseResult.data);
    }
    
    // Fetch chapters from API
    const chaptersResult = await getChaptersByCategory(categoryId, token);
    if (chaptersResult.success) {
      setChapters(chaptersResult.data);
      setCategory({
        id: categoryId,
        title: `Category ${categoryId}`,
        description: 'Chapters in this category'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: chaptersResult.message || 'Failed to load chapters',
      });
    }
    
    setIsLoading(false);
  };

  const getStatusBadge = (status) => {
    // Handle boolean status from API (false = inactive/unpublished, true = active/published)
    if (typeof status === 'boolean') {
      return status ? 'bg-success' : 'bg-secondary';
    }
    
    // Handle string status
    const statusMap = {
      active: 'bg-success',
      draft: 'bg-warning',
      published: 'bg-success',
      blocked: 'bg-danger',
      review: 'bg-info',
    };
    return statusMap[status?.toLowerCase()] || 'bg-secondary';
  };

  const getStatusText = (status) => {
    if (typeof status === 'boolean') {
      return status ? 'Active' : 'Inactive';
    }
    return status || 'Inactive';
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
        // TODO: Implement delete chapter API call when endpoint is available
        Swal.fire({
          icon: 'info',
          title: 'Delete Feature',
          text: 'Delete chapter feature will be available soon',
        });
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
                <h5>Chapters{category && ` - ${category.title}`}</h5>
                {category?.description && (
                  <p className="text-muted small">{category.description}</p>
                )}
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate(`/course/${courseId}/category/${categoryId}/add-chapter`)}
                    >
                      <i className="fas fa-plus me-2"></i>Add Chapter
                    </button>
                  </li>
                  <li>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/course/${courseId}/categories`)}
                    >
                      <i className="fas fa-arrow-left me-2"></i>Back to Categories
                    </button>
                  </li>
                  <li>
                    <div className="dropdown dropdown-action" data-bs-placement="bottom" data-bs-original-title="Download">
                      <a href="#" className="btn btn-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <span><i className="fe fe-download me-2"></i></span>Export
                      </a>
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
                  ) : chapters.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No chapters found for this category</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Chapter Title</th>
                            <th>Order</th>
                            <th>Lessons</th>
                            <th>Status</th>
                            <th>Created Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chapters.map((chapter) => (
                            <tr key={chapter.id}>
                              <td>
                                <div>
                                  <span className="fw-bold">{chapter.title}</span>
                                  <br />
                                  <small className="text-muted">{chapter.description}</small>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-secondary">{chapter.order_number}</span>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => navigate(`/course/${courseId}/category/${categoryId}/chapter/${chapter.id}/lessons`)}
                                  title="View Lessons"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(chapter.status)}`}>
                                  {getStatusText(chapter.status)}
                                </span>
                              </td>
                              <td>
                                {chapter.created_at ? new Date(chapter.created_at).toLocaleDateString() : '-'}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => navigate(`/course/${courseId}/category/${categoryId}/chapter/${chapter.id}/edit`)}
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
