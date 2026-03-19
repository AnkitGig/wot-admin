import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import { getNewsById, updateNews } from '../api';
import { useAuth } from '../context/AuthContext';

export default function EditNews() {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    tags: [],
    source: '',
    source_url: '',
    image_url: '',
    author: '',
    is_published: false,
    is_featured: false
  });

  useEffect(() => {
    fetchNewsData();
  }, [newsId]);

  const fetchNewsData = async () => {
    setLoading(true);
    try {
      const response = await getNewsById(token, newsId);
      console.log('EditNews API Response:', response); // Debug log
      if (response.success) {
        const data = response.data; // Data is directly here, not nested
        console.log('EditNews Data:', data); // Debug log
        setNewsData(data);
        
        // Pre-fill form with existing data - properly extract from nested structure
        const formData = {
          title: data.data?.payload?.article?.title || '',
          summary: data.data?.payload?.article?.summary || '',
          content: data.data?.payload?.article?.body || '',
          category: data.data?.payload?.primary_category || '',
          tags: data.data?.payload?.tags || [],
          source: data.data?.payload?.sources?.[0]?.name || '',
          source_url: data.data?.payload?.sources?.[0]?.url || '',
          image_url: data.data?.payload?.image?.url || '',
          author: 'Admin',
          is_published: data.data?.status === 'published',
          is_featured: false
        };
        console.log('EditNews Form Data:', formData); // Debug log
        setFormData(formData);
      } else {
        setError(response.message || 'Failed to fetch news data');
      }
    } catch (err) {
      console.error('EditNews Fetch Error:', err); // Debug log
      setError('An error occurred while fetching news data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await updateNews(token, newsId, formData);
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'News article updated successfully',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        navigate('/news');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: response.message || 'Failed to update news article'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An error occurred while updating news article'
      });
    } finally {
      setSaving(false);
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
                <h1 className="page-title">Edit News Article</h1>
                <p className="text-muted">
                  Update news article information
                </p>
              </div>
              <div className="col-auto">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/news')}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to News
                </button>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="summary" className="form-label">Summary</label>
                      <textarea
                        className="form-control"
                        id="summary"
                        name="summary"
                        rows="3"
                        value={formData.summary}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">Content</label>
                      <textarea
                        className="form-control"
                        id="content"
                        name="content"
                        rows="10"
                        value={formData.content}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="source" className="form-label">Source</label>
                      <input
                        type="text"
                        className="form-control"
                        id="source"
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="source_url" className="form-label">Source URL</label>
                      <input
                        type="url"
                        className="form-control"
                        id="source_url"
                        name="source_url"
                        value={formData.source_url}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="category" className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="tags" className="form-label">Tags (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="tags"
                        name="tags"
                        value={formData.tags.join(', ')}
                        onChange={handleTagsChange}
                        placeholder="Tech, AI, Finance"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="image_url" className="form-label">Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        id="image_url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="author" className="form-label">Author</label>
                      <input
                        type="text"
                        className="form-control"
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_published"
                          name="is_published"
                          checked={formData.is_published}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="is_published">
                          Published
                        </label>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_featured"
                          name="is_featured"
                          checked={formData.is_featured}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="is_featured">
                          Featured
                        </label>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Update News
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
