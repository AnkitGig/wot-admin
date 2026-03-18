import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getLessonAdmin, deleteLessonPage } from '../api/lessons';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function LessonPages() {
  const { lessonId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPageModal, setShowPageModal] = useState(false);

  useEffect(() => {
    if (lessonId && token) {
      fetchLessonData();
    }
  }, [lessonId, token]);

  const fetchLessonData = async () => {
    setIsLoading(true);
    const result = await getLessonAdmin(lessonId, token);
    
    if (result.success) {
      setLesson(result.data);
      setPages(result.data.content?.pages || []);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Data',
        text: result.message || 'An error occurred while loading lesson data',
      });
    }
    setIsLoading(false);
  };

  const handlePageClick = (page) => {
    setSelectedPage(page);
    setShowPageModal(true);
  };

  const handleDeletePage = (pageId) => {
    Swal.fire({
      title: 'Delete Page',
      text: 'Are you sure you want to delete this page? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const deleteResult = await deleteLessonPage(lessonId, pageId, token);
        
        if (deleteResult.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'Page deleted successfully',
          });
          await fetchLessonData();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Delete',
            text: deleteResult.message || 'Failed to delete page',
          });
        }
        setIsLoading(false);
      }
    });
  };

  const truncateHtml = (html, maxLength = 100) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (isLoading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <GlobalLoader />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col">
                <h3 className="page-title">Lesson Pages</h3>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title">
                      {lesson ? `Pages for: ${lesson.title}` : 'Lesson Pages'}
                    </h5>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/courses/admin/lesson/${lessonId}/page/add`)}
                    >
                      <i className="fa fa-plus me-2"></i>Add New Page
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {pages.length > 0 ? (
                    <div className="row">
                      {pages.map((page) => (
                        <div key={page.id} className="col-md-6 col-lg-4 mb-4">
                          <div className="card h-100">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="card-title mb-0">{page.title}</h6>
                                <span className="badge bg-primary">Page {page.page_number}</span>
                              </div>
                              
                              {page.html_content && (
                                <div className="mb-3">
                                  <small className="text-muted">Content Preview:</small>
                                  <p className="card-text small text-muted mb-0">
                                    {truncateHtml(page.html_content)}
                                  </p>
                                </div>
                              )}

                              {page.image && (
                                <div className="mb-3">
                                  <small className="text-muted">Has Image: Yes</small>
                                </div>
                              )}

                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handlePageClick(page)}
                                >
                                  <i className="fa fa-eye me-1"></i>View
                                </button>
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => navigate(`/courses/admin/lesson/${lessonId}/page/${page.id}/edit`)}
                                >
                                  <i className="fa fa-edit me-1"></i>Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeletePage(page.id)}
                                >
                                  <i className="fa fa-trash me-1"></i>Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="fa fa-file-alt fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No pages found</h5>
                      <p className="text-muted">Start by adding your first page to this lesson.</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/courses/admin/lesson/${lessonId}/page/add`)}
                      >
                        <i className="fa fa-plus me-2"></i>Add First Page
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Page Detail Modal */}
          {showPageModal && selectedPage && (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {selectedPage.title} - Page {selectedPage.page_number}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowPageModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Page Number</label>
                      <p className="form-control-plaintext">{selectedPage.page_number}</p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <p className="form-control-plaintext">{selectedPage.title}</p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">HTML Content</label>
                      <div className="border rounded p-3 bg-light">
                        <div dangerouslySetInnerHTML={{ __html: selectedPage.html_content }} />
                      </div>
                    </div>

                    {selectedPage.image && (
                      <div className="mb-3">
                        <label className="form-label">Image</label>
                        <div>
                          <img
                            src={selectedPage.image}
                            alt="Page image"
                            className="img-fluid rounded"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowPageModal(false)}
                    >
                      Close
                    </button>
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
