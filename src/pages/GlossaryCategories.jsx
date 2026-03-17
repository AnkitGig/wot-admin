import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllGlossaryCategories, deleteGlossaryCategory, updateGlossaryCategory } from '../api/glossary';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function GlossaryCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    color: '#941efd',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    count: 0,
  });

  useEffect(() => {
    fetchCategories(1);
  }, []);

  const fetchCategories = async (pageNumber = 1, search = '') => {
    setIsLoading(true);
    const result = await getAllGlossaryCategories(token, pageNumber, 10, search);
    
    if (result.success) {
      setCategories(result.data || []);
      setPagination(result.pagination || { page: pageNumber, limit: 10, total: 0, count: 0 });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Categories',
        text: result.message || 'An error occurred while fetching glossary categories',
      });
      setCategories([]);
    }
    setIsLoading(false);
  };

  const handlePageChange = (newPage) => {
    fetchCategories(newPage, searchTerm);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCategories(1, searchTerm);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#941efd',
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Category name is required',
      });
      return;
    }

    const updateResult = await updateGlossaryCategory(editingCategory.id, editFormData, token);

    if (updateResult.success) {
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: updateResult.message || 'Category updated successfully',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        setShowEditModal(false);
        fetchCategories(pagination.page, searchTerm);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Update',
        text: updateResult.message || 'An error occurred while updating the category',
      });
    }
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
        const deleteResult = await deleteGlossaryCategory(categoryId, token);

        if (deleteResult.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: deleteResult.message || 'Category deleted successfully',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => {
            fetchCategories(pagination.page, searchTerm);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Delete',
            text: deleteResult.message || 'An error occurred while deleting the category',
          });
        }
      }
    });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Glossary Categories</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                   <li>
                    <Link className="btn btn-primary" to="/add-glossary"><i className="fa fa-plus-circle me-2"></i>Add Glossary</Link>
                  </li>
                  <li>
                    <Link className="btn btn-primary" to="/add-glossary-category"><i className="fa fa-plus-circle me-2"></i>Add Category</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-sm-14">
              <div className="card">
                <div className="card-body">

                  {isLoading ? (
                    <GlobalLoader visible={true} size="medium" />
                  ) : categories.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No glossary categories found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category) => (
                            <tr key={category.id}>
                              <td>
                                <strong>{category.name}</strong>
                              </td>
                              <td>
                                <small title={category.description}>
                                  {category.description ? (
                                    <>
                                      {category.description.substring(0, 80)}
                                      {category.description.length > 80 ? '...' : ''}
                                    </>
                                  ) : (
                                    <span className="text-muted">No description</span>
                                  )}
                                </small>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditClick(category)}
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

          {totalPages > 1 && categories.length > 0 && (
            <div className="row mt-3">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Page {pagination.page} of {totalPages} | Showing {categories.length} of {pagination.total} categories
                    </small>
                    <nav aria-label="Page navigation">
                      <ul className="pagination mb-0">
                        <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                          >
                            Previous
                          </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                          Math.max(0, pagination.page - 2),
                          Math.min(totalPages, pagination.page + 1)
                        ).map((page) => (
                          <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${pagination.page === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <div className={`modal fade ${showEditModal ? 'show' : ''}`} style={{ display: showEditModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Glossary Category</h5>
              <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Category Name <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    rows="4"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    placeholder="Enter category description (optional)"
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Color</label>
                  <div className="d-flex align-items-center gap-3">
                    <input 
                      type="color" 
                      className="form-control form-control-color"
                      style={{width: '60px', height: '40px', cursor: 'pointer'}}
                      name="color"
                      value={editFormData.color}
                      onChange={handleEditInputChange}
                    />
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="#941efd"
                      name="color"
                      value={editFormData.color}
                      onChange={handleEditInputChange}
                      style={{maxWidth: '150px'}}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {showEditModal && <div className="modal-backdrop fade show"></div>}

      <Footer />
    </div>
  );
}
