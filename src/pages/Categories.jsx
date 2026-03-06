import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getCourseById, getCategoriesByCourse } from '../api/courses';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function Categories() {
  const { token } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch course details
    const courseResult = await getCourseById(courseId, token);
    if (courseResult.success) {
      setCourse(courseResult.data);
    }
    
    // Fetch categories for the course
    const categoriesResult = await getCategoriesByCourse(courseId, token);
    if (categoriesResult.success) {
      setCategories(categoriesResult.data || []);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Categories',
        text: categoriesResult.message || 'An error occurred while fetching categories',
      });
    }
    
    setIsLoading(false);
  };

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

  const handleDeleteCategory = (categoryId, categoryTitle) => {
    Swal.fire({
      title: 'Delete Category',
      text: `Are you sure you want to delete "${categoryTitle}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        // TODO: Implement delete category API call when endpoint is available
        Swal.fire({
          icon: 'info',
          title: 'Delete Feature',
          text: 'Delete category feature will be available soon',
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
                <h5>Categories{course && ` - ${course.title}`}</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate(`/course/${courseId}/add-category`)}
                    >
                      <i className="fas fa-plus me-2"></i>Add Category
                    </button>
                  </li>
                  <li>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/courses`)}
                    >
                      <i className="fas fa-arrow-left me-2"></i>Back to Courses
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
                  ) : categories.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No categories found for this course</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Category Title</th>
                            <th>Order</th>
                            <th>Chapters</th>
                            <th>Status</th>
                            <th>Created Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category) => (
                            <tr key={category.id}>
                              <td>
                                <div>
                                  <span className="fw-bold">{category.title}</span>
                                  <br />
                                  <small className="text-muted">{category.description}</small>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-secondary">{category.order_number}</span>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => navigate(`/course/${courseId}/category/${category.id}/chapters`)}
                                  title="View Chapters"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(category.status)}`}>
                                  {category.status}
                                </span>
                              </td>
                              <td>
                                {category.created_at ? new Date(category.created_at).toLocaleDateString() : '-'}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => navigate(`/course/${courseId}/category/${category.id}/edit`)}
                                    title="Edit Category"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteCategory(category.id, category.title)}
                                    title="Delete Category"
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
