import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllGlossaries, deleteGlossary } from '../api/glossary';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function Glossaries() {
  const { token } = useAuth();
  const [glossaries, setGlossaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    count: 0,
  });

  useEffect(() => {
    fetchGlossaries(1);
  }, []);

  const fetchGlossaries = async (pageNumber = 1) => {
    setIsLoading(true);
    const result = await getAllGlossaries(token, pageNumber, 10);
    
    if (result.success) {
      setGlossaries(result.data || []);
      setPagination(result.pagination || { page: pageNumber, limit: 10, total: 0, count: 0 });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Glossaries',
        text: result.message || 'An error occurred while fetching glossaries',
      });
      setGlossaries([]);
    }
    setIsLoading(false);
  };

  const handlePageChange = (newPage) => {
    fetchGlossaries(newPage);
  };

  const handleDeleteGlossary = (glossaryId, glossaryTerm) => {
    Swal.fire({
      title: 'Delete Glossary',
      text: `Are you sure you want to delete "${glossaryTerm}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const deleteResult = await deleteGlossary(glossaryId, token);

        if (deleteResult.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: deleteResult.message || 'Glossary deleted successfully',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => {
            fetchGlossaries();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Delete',
            text: deleteResult.message || 'An error occurred while deleting the glossary',
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
                <h5>Glossaries</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <Link className="btn btn-primary" to="/add-glossary"><i className="fa fa-plus-circle me-2"></i>Add Glossary</Link>
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
                  ) : glossaries.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No glossaries found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Term</th>
                            <th>Short Form</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {glossaries.map((glossary) => (
                            <tr key={glossary.id}>
                              <td>
                                <strong>{glossary.term}</strong>
                              </td>
                              <td>
                                <span className="badge bg-info">{glossary.short_form}</span>
                              </td>
                              <td>
                                <span className="badge bg-secondary">{glossary.category}</span>
                              </td>
                              <td>
                                <small title={glossary.description}>
                                  {glossary.description?.substring(0, 60)}
                                  {glossary.description?.length > 60 ? '...' : ''}
                                </small>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteGlossary(glossary.id, glossary.term)}
                                    title="Delete Glossary"
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

          {totalPages > 1 && glossaries.length > 0 && (
            <div className="row mt-3">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Page {pagination.page} of {totalPages} | Showing {glossaries.length} of {pagination.total} glossaries
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
      <Footer />
    </div>
  );
}
