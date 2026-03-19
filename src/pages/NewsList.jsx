import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { getNews, deleteNews, deleteAllNews } from '../api';
import { useAuth } from '../context/AuthContext';

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await getNews(token);
      if (response.success) {
        setNews(response.data.data || []); // Data is nested under data.data for list
      } else {
        setError(response.message || 'Failed to fetch news');
      }
    } catch (err) {
      setError('An error occurred while fetching news');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (newsId) => {
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
      try {
        const response = await deleteNews(token, newsId);
        if (response.success) {
          Swal.fire('Deleted!', 'News article has been deleted.', 'success');
          fetchNews();
        } else {
          Swal.fire('Error!', response.message || 'Failed to delete news', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', 'An error occurred while deleting news', 'error');
      }
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete all news articles? This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteAllNews(token);
        if (response.success) {
          Swal.fire('Deleted!', 'All news articles have been deleted.', 'success');
          fetchNews();
        } else {
          Swal.fire('Error!', response.message || 'Failed to delete all news', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', 'An error occurred while deleting all news', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
                <h1 className="page-title">News Management</h1>
                <p className="text-muted">
                  Manage and moderate news articles
                </p>
              </div>
              <div className="col-auto">
                <button 
                  className="btn btn-danger"
                  onClick={handleDeleteAll}
                  disabled={loading || news.length === 0}
                >
                  <i className="fas fa-trash-alt me-2"></i>
                  Delete All News
                </button>
              </div>
            </div>
          </div>

          {/* News List */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : news.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
                  <h5>No News Articles Found</h5>
                  <p className="text-muted">There are currently no news articles to display.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Tags</th>
                        <th>Scheduled At</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.map((article) => (
                        <tr key={article.id}>
                          <td>
                            <div>
                              <strong>{truncateText(article.payload?.article?.title || 'No Title', 50)}</strong>
                              <br />
                              <small className="text-muted">
                                {truncateText(article.payload?.article?.summary || 'No Summary', 80)}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              {article.payload?.primary_category || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {article.payload?.tags?.slice(0, 3).map((tag, index) => (
                                <span key={index} className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                                  {tag}
                                </span>
                              ))}
                              {article.payload?.tags?.length > 3 && (
                                <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                                  +{article.payload.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <small>{formatDate(article.payload?.scheduled_at)}</small>
                          </td>
                          <td>
                            <span className={`badge bg-${article.status === 'saved' ? 'success' : 'warning'}`}>
                              {article.status}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info">{article.views || 0}</span>
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => navigate(`/news/${article.id}`)}
                                title="View"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => navigate(`/news/${article.id}/edit`)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open(article.s3_url, '_blank')}
                                title="View S3 File"
                              >
                                <i className="fas fa-external-link-alt"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(article.id)}
                                title="Delete"
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

      <Footer />
    </div>
  );
}
