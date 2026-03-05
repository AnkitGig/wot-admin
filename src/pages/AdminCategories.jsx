import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getAllAdminCategories, deleteAdminCategory } from '../api/courses';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function AdminCategories() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    
    const result = await getAllAdminCategories(token);
    if (result.success) {
      setCategories(result.data || []);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Categories',
        text: result.message || 'An error occurred while fetching categories',
      });
    }
    
    setIsLoading(false);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 'bg-success' : 'bg-danger';
  };

  const handleDeleteCategory = (categoryId, categoryName) => {
    Swal.fire({
      title: 'Delete Category',
      text: `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const deleteResult = await deleteAdminCategory(categoryId, token);
        
        if (deleteResult.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: deleteResult.message || 'Category deleted successfully',
          }).then(() => {
            fetchCategories(); // Refresh the list
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: deleteResult.message || 'Failed to delete category',
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
                <h5>Admin Categories</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/add-admin-category')}
                    >
                      <i className="fas fa-plus me-2"></i>Add Category
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
                  ) : categories.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No categories found</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/add-admin-category')}
                      >
                        <i className="fas fa-plus me-2"></i>Add First Category
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Category Name</th>
                            <th>Description</th>
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
                                <div className="d-flex align-items-center">
                                  {category.icon && (
                                    <img 
                                      src={category.icon} 
                                      alt={category.name}
                                      className="me-2"
                                      style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                  )}
                                  <span className="fw-bold">{category.name}</span>
                                </div>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {category.description || 'No description'}
                                </small>
                              </td>
                              <td>
                                <span className="badge bg-secondary">{category.order_number}</span>
                              </td>
                              <td>
                                <span className="badge bg-info">{category.chapter_count || 0}</span>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(category.is_active)}`}>
                                  {category.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                {category.created_at ? new Date(category.created_at).toLocaleDateString() : '-'}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => navigate(`/edit-admin-category/${category.id}`)}
                                    title="Edit Category"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteCategory(category.id, category.name)}
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
