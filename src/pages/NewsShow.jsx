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
      // Import deleteNews here to avoid circular dependency
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

  const article = newsData?.data?.payload?.article;
  const meta = newsData?.data?.payload?.meta;
  const image = newsData?.data?.payload?.image;
  const sources = newsData?.data?.payload?.sources;

  console.log('Full NewsData in render:', newsData); // Debug log

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

          {/* News Content */}
          <div className="card">
            <div className="card-body">
             

         {/* Article Header */}
              <div className="mb-4">
                <h2 className="mb-3">{article?.title || 'No Title'}</h2>
                
                {/* Article Meta */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center text-muted small">
                      <i className="fas fa-calendar me-2"></i>
                      <span>Scheduled: {formatDate(newsData?.data?.payload?.scheduled_at)}</span>
                    </div>
                    <div className="d-flex align-items-center text-muted small mt-1">
                      <i className="fas fa-tag me-2"></i>
                      <span>Category: {newsData?.data?.payload?.primary_category || 'N/A'}</span>
                    </div>
                    <div className="d-flex align-items-center text-muted small mt-1">
                      <i className="fas fa-eye me-2"></i>
                      <span>Views: {newsData?.views || 0}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center text-muted small">
                      <i className="fas fa-cog me-2"></i>
                      <span>Run ID: {meta?.run_id || 'N/A'}</span>
                    </div>
                    <div className="d-flex align-items-center text-muted small mt-1">
                      <i className="fas fa-clock me-2"></i>
                      <span>Session: {meta?.session_label || 'N/A'}</span>
                    </div>
                    {/* <div className="d-flex align-items-center text-muted small mt-1">
                      <i className="fas fa-info-circle me-2"></i>
                      <span>Status: <span className="badge bg-success">{newsData?.data?.status}</span></span>
                    </div> */}
                  </div>
                </div>

                {/* Tags */}
                {newsData?.data?.payload?.tags && newsData.data.payload.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="d-flex flex-wrap gap-2">
                      {newsData.data.payload.tags.map((tag, index) => (
                        <span key={index} className="badge bg-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Article Image */}
              {image?.url && (
                <div className="mb-4">
                  <img 
                    src={image.url} 
                    alt={article?.title || 'News image'} 
                    className="img-fluid rounded"
                    style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                  />
                  {image.source && (
                    <small className="text-muted d-block mt-2">
                      Image source: {image.source}
                    </small>
                  )}
                </div>
              )}

              {/* Article Summary */}
              {article?.summary && (
                <div className="mb-4">
                  <h5>Summary</h5>
                  <div className="alert alert-info">
                    {article.summary}
                  </div>
                </div>
              )}

              {/* Article Body */}
              {article?.body && (
                <div className="mb-4">
                  <h5>Full Article</h5>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {article.body}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Takeaways */}
              {/* {article?.takeaways && article.takeaways.length > 0 && (
                <div className="mb-4">
                  <h5>Key Takeaways</h5>
                  <ul className="list-group">
                    {article.takeaways.map((takeaway, index) => (
                      <li key={index} className="list-group-item">
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}

              {/* Sources */}
              {/* {sources && sources.length > 0 && (
                <div className="mb-4">
                  <h5>Sources</h5>
                  <div className="list-group">
                    {sources.map((source, index) => (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{source.name}</strong>
                            {source.published_at && (
                              <div className="small text-muted">
                                Published: {formatDate(source.published_at)}
                              </div>
                            )}
                            {source.snippet && (
                              <div className="small text-muted mt-1">
                                {source.snippet}
                              </div>
                            )}
                          </div>
                          {source.url && (
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="fas fa-external-link-alt"></i>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
