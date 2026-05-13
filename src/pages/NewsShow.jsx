import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import { getNewsById } from '../api';
import { useAuth } from '../context/AuthContext';

export default function NewsShow() {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    fetchNewsData();
  }, [newsId]);

  const fetchNewsData = async () => {
    setLoading(true);
    try {
      const response = await getNewsById(token, newsId);
      if (response.success) {
        setNewsData(response.data);
      } else {
        setError(response.message || 'Failed to fetch news data');
      }
    } catch (err) {
      setError('An error occurred while fetching news data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const handleEdit = () => {
    navigate(`/news/${newsId}/edit`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this news article?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      const { deleteNews } = await import('../api');
      try {
        const response = await deleteNews(token, newsId);
        if (response.success) {
          Swal.fire('Deleted!', 'News article has been deleted.', 'success');
          navigate('/news');
        } else {
          Swal.fire('Error!', response.message || 'Failed to delete news', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', 'An error occurred while deleting news', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const payload = newsData?.data?.payload;
  const translations = payload?.translations || {};
  
  // Use activeLang translation or fallback to main article
  const currentArticle = translations[activeLang] || payload?.article || {};
  const meta = payload?.meta;
  const image = payload?.image;
  const sources = payload?.sources;

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h1 className="page-title">News Article</h1>
                <p className="text-muted">
                  View news article details
                </p>
              </div>
              <div className="col-auto">
                <div className="btn-group">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/news')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to News
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={handleEdit}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              {/* Language Selection Tabs */}
              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className="mb-0 fw-bold"><i className="fas fa-language me-2 text-primary"></i>Language View</h6>
                    <div className="btn-group btn-group-sm" role="group">
                      <button 
                        type="button" 
                        className={`btn ${activeLang === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveLang('en')}
                      >
                        English
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${activeLang === 'es' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveLang('es')}
                      >
                        Spanish
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${activeLang === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveLang('fr')}
                      >
                        French
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  {/* Article Header */}
                  <div className="mb-4">
                    <h2 className="mb-3 fw-bold">{currentArticle.title || 'No Title'}</h2>
                    
                    {/* Article Meta */}
                    <div className="row mb-4 bg-light p-3 rounded mx-0">
                      <div className="col-md-6 border-end">
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <i className="fas fa-calendar-alt me-2 text-primary"></i>
                          <span><strong>Scheduled:</strong> {formatDate(payload?.scheduled_at)}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <i className="fas fa-folder-open me-2 text-primary"></i>
                          <span><strong>Category:</strong> {payload?.primary_category || 'N/A'}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted small">
                          <i className="fas fa-eye me-2 text-primary"></i>
                          <span><strong>Views:</strong> {newsData?.views || 0}</span>
                        </div>
                      </div>
                      <div className="col-md-6 ps-md-4">
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <i className="fas fa-terminal me-2 text-primary"></i>
                          <span><strong>Run ID:</strong> {meta?.run_id || 'N/A'}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <i className="fas fa-clock me-2 text-primary"></i>
                          <span><strong>Session:</strong> {meta?.session_label || 'N/A'}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted small">
                          <i className="fas fa-check-circle me-2 text-success"></i>
                          <span><strong>Status:</strong> <span className="badge bg-success">Published</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {payload?.tags && payload.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="d-flex flex-wrap gap-2">
                          {payload.tags.map((tag, index) => (
                            <span key={index} className="badge rounded-pill bg-soft-primary text-primary border border-primary px-3 py-2">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Article Image */}
                  {image?.url && (
                    <div className="mb-5 text-center">
                      <img 
                        src={image.url} 
                        alt={currentArticle.title || 'News image'} 
                        className="img-fluid rounded shadow-sm"
                        style={{ maxHeight: '500px', width: '100%', objectFit: 'cover', borderRadius: '15px' }}
                      />
                      {image.source && (
                        <div className="mt-2">
                           <span className="badge bg-light text-dark border"><i className="fas fa-camera me-1"></i> Source: {image.source}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Article Summary */}
                  {currentArticle.summary && (
                    <div className="mb-5">
                      <h5 className="fw-bold mb-3"><i className="fas fa-align-left me-2 text-primary"></i>Executive Summary</h5>
                      <div className="p-4 bg-light border-start border-primary border-4 rounded shadow-sm italic" style={{ fontSize: '1.1rem', backgroundColor: '#f0f7ff !important' }}>
                        {currentArticle.summary}
                      </div>
                    </div>
                  )}

                  {/* Article Body */}
                  {currentArticle.body && (
                    <div className="mb-5">
                      <h5 className="fw-bold mb-3"><i className="fas fa-newspaper me-2 text-primary"></i>Full Analysis</h5>
                      <div className="p-4 bg-white border rounded shadow-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.05rem', color: '#2d3748' }}>
                        {currentArticle.body}
                      </div>
                    </div>
                  )}

                  {/* Takeaways */}
                  {currentArticle.takeaways && currentArticle.takeaways.length > 0 && (
                    <div className="mb-5">
                      <h5 className="fw-bold mb-3"><i className="fas fa-list-check me-2 text-success"></i>Key Strategic Takeaways</h5>
                      <div className="row g-3">
                        {currentArticle.takeaways.map((takeaway, index) => (
                          <div key={index} className="col-md-6">
                            <div className="d-flex align-items-center p-3 bg-white border rounded-3 shadow-sm h-100 transition-all hover-lift">
                              <span className="badge bg-success-soft text-success me-3 rounded-circle" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fas fa-check small"></i>
                              </span>
                              <span className="small fw-medium text-dark">{takeaway}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {sources && sources.length > 0 && (
                    <div className="mt-5 border-top pt-4">
                      <h5 className="fw-bold mb-3"><i className="fas fa-link me-2 text-primary"></i>Verified Sources</h5>
                      <div className="row g-3">
                        {sources.map((source, index) => (
                          <div key={index} className="col-lg-6">
                            <div className="card h-100 border-0 bg-light rounded-4">
                              <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="flex-grow-1 me-3">
                                    <div className="d-flex align-items-center mb-1">
                                      <span className="badge bg-white text-primary border border-primary-light me-2 small px-2">Source {index + 1}</span>
                                      <h6 className="mb-0 fw-bold text-dark">{source.name}</h6>
                                    </div>
                                    {source.published_at && (
                                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        <i className="far fa-calendar me-1"></i> {formatDate(source.published_at)}
                                      </div>
                                    )}
                                  </div>
                                  {source.url && (
                                    <a 
                                      href={source.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="btn btn-sm btn-white shadow-sm rounded-pill px-3"
                                      title="Open original article"
                                    >
                                      <i className="fas fa-external-link-alt text-primary"></i>
                                    </a>
                                  )}
                                </div>
                                {source.snippet && (
                                  <div className="mt-2 text-muted small border-top pt-2" style={{ fontStyle: 'italic' }}>
                                    "{source.snippet}"
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .bg-soft-primary { background-color: rgba(13, 110, 253, 0.08); }
        .bg-success-soft { background-color: rgba(25, 135, 84, 0.1); }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
        .transition-all { transition: all 0.3s ease; }
        .bg-white { background-color: #ffffff !important; }
      `}</style>

      <Footer />
    </div>
  );
}
