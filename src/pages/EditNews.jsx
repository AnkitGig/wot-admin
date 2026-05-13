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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  // We'll store the original payload to preserve fields we don't edit (like metadata)
  const [originalPayload, setOriginalPayload] = useState({});

  const [formData, setFormData] = useState({
    category: '',
    tags: [],
    source: '',
    source_url: '',
    image_url: '',
    author: 'Admin',
    is_published: false,
    is_featured: false,
    translations: {
      en: { title: '', summary: '', body: '', takeaways: [] },
      es: { title: '', summary: '', body: '', takeaways: [] },
      fr: { title: '', summary: '', body: '', takeaways: [] }
    }
  });

  useEffect(() => {
    fetchNewsData();
  }, [newsId]);

  const fetchNewsData = async () => {
    setLoading(true);
    try {
      const response = await getNewsById(token, newsId);
      if (response.success) {
        const fullData = response.data;
        const newsItem = fullData?.data;
        const payload = newsItem?.payload || {};
        
        setOriginalPayload(payload);

        const fetchedTranslations = payload.translations || {};
        
        // IMPORTANT: We only fallback to payload.article if the translation for that field is strictly undefined or null.
        // This allows empty strings ("") to be preserved.
        const translations = {
          en: { 
            title: fetchedTranslations.en?.title ?? payload.article?.title ?? '', 
            summary: fetchedTranslations.en?.summary ?? payload.article?.summary ?? '', 
            body: fetchedTranslations.en?.body ?? payload.article?.body ?? '',
            takeaways: fetchedTranslations.en?.takeaways ?? payload.article?.takeaways ?? []
          },
          es: { 
            title: fetchedTranslations.es?.title ?? '', 
            summary: fetchedTranslations.es?.summary ?? '', 
            body: fetchedTranslations.es?.body ?? '',
            takeaways: fetchedTranslations.es?.takeaways ?? []
          },
          fr: { 
            title: fetchedTranslations.fr?.title ?? '', 
            summary: fetchedTranslations.fr?.summary ?? '', 
            body: fetchedTranslations.fr?.body ?? '',
            takeaways: fetchedTranslations.fr?.takeaways ?? []
          }
        };

        setFormData({
          category: payload.primary_category || newsItem.category || '',
          tags: payload.tags || newsItem.tags || [],
          source: payload.sources?.[0]?.name || newsItem.source || '',
          source_url: payload.sources?.[0]?.url || newsItem.source_url || '',
          image_url: payload.image?.url || newsItem.image_url || '',
          author: newsItem.author || 'Admin',
          is_published: newsItem.is_published ?? (newsItem.status === 'published'),
          is_featured: newsItem.is_featured || false,
          translations
        });
      } else {
        setError(response.message || 'Failed to fetch news data');
      }
    } catch (err) {
      setError('An error occurred while fetching news data');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (lang, field, value) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value
        }
      }
    }));
  };

  const handleTakeawayChange = (lang, index, value) => {
    setFormData(prev => {
      const newTakeaways = [...prev.translations[lang].takeaways];
      newTakeaways[index] = value;
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            takeaways: newTakeaways
          }
        }
      };
    });
  };

  const addTakeaway = (lang) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          takeaways: [...prev.translations[lang].takeaways, '']
        }
      }
    }));
  };

  const removeTakeaway = (lang, index) => {
    setFormData(prev => {
      const newTakeaways = prev.translations[lang].takeaways.filter((_, i) => i !== index);
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            takeaways: newTakeaways
          }
        }
      };
    });
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

    // Get English data for the primary fields (which usually represent the default state)
    const english = formData.translations.en;
    
    // Construct the payload to be as exhaustive as possible.
    // We update the flat fields AND the nested payload object.
    const requestPayload = {
      // Flat Fields (matching your API documentation image)
      title: english.title,
      summary: english.summary,
      content: english.body,
      category: formData.category,
      tags: formData.tags,
      source: formData.source,
      source_url: formData.source_url,
      image_url: formData.image_url,
      author: formData.author,
      is_published: formData.is_published,
      is_featured: formData.is_featured,
      
      // Nested Payload (this is where the 'View' page reads from)
      // We manually build the article and translations objects to ensure they match our form.
      payload: {
        ...originalPayload,
        primary_category: formData.category,
        tags: formData.tags,
        article: {
          title: english.title,
          summary: english.summary,
          body: english.body,
          takeaways: english.takeaways
        },
        translations: formData.translations
      }
    };

    try {
      const response = await updateNews(token, newsId, requestPayload);
      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'News article updated successfully',
          timer: 1500,
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
        <Header /><Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <Header /><Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col"><h5 className="page-title">Edit News Article</h5></div>
              <div className="col-auto">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/news')}>
                  <i className="fas fa-arrow-left me-2"></i>Back
                </button>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              {/* Language Selection */}
              <div className="card mb-3 border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="nav nav-tabs nav-tabs-solid nav-justified mb-0">
                    <button className={`nav-link ${activeLang === 'en' ? 'active' : ''}`} onClick={() => setActiveLang('en')}>English</button>
                    <button className={`nav-link ${activeLang === 'es' ? 'active' : ''}`} onClick={() => setActiveLang('es')}>Spanish</button>
                    <button className={`nav-link ${activeLang === 'fr' ? 'active' : ''}`} onClick={() => setActiveLang('fr')}>French</button>
                  </div>
                </div>
              </div>

              {/* Translation Content */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom">
                  <h6 className="mb-0 fw-bold text-primary">Content: {activeLang.toUpperCase()}</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.translations[activeLang].title}
                      onChange={(e) => handleTranslationChange(activeLang, 'title', e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Summary</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.translations[activeLang].summary}
                      onChange={(e) => handleTranslationChange(activeLang, 'summary', e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Body Content</label>
                    <textarea
                      className="form-control"
                      rows="12"
                      value={formData.translations[activeLang].body}
                      onChange={(e) => handleTranslationChange(activeLang, 'body', e.target.value)}
                    />
                  </div>

                  <div className="mb-0">
                    <label className="form-label fw-semibold d-flex justify-content-between">
                      Takeaways
                      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => addTakeaway(activeLang)}>
                        <i className="fas fa-plus me-1"></i> Add
                      </button>
                    </label>
                    {formData.translations[activeLang].takeaways.map((takeaway, index) => (
                      <div key={index} className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={takeaway}
                          onChange={(e) => handleTakeawayChange(activeLang, index, e.target.value)}
                        />
                        <button type="button" className="btn btn-outline-danger" onClick={() => removeTakeaway(activeLang, index)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              {/* Metadata Settings */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom">
                  <h6 className="mb-0 fw-bold text-primary">Article Settings</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Category</label>
                    <input type="text" className="form-control" name="category" value={formData.category} onChange={handleChange} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tags</label>
                    <input type="text" className="form-control" value={formData.tags.join(', ')} onChange={handleTagsChange} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Image URL</label>
                    <input type="url" className="form-control" name="image_url" value={formData.image_url} onChange={handleChange} />
                  </div>

                  <div className="form-check form-switch mb-2">
                    <input className="form-check-input" type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} id="pbChk" />
                    <label className="form-check-label" htmlFor="pbChk">Published</label>
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input className="form-check-input" type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} id="ftChk" />
                    <label className="form-check-label" htmlFor="ftChk">Featured</label>
                  </div>

                  <button className="btn btn-primary w-100 py-2 fw-bold" disabled={saving} onClick={handleSubmit}>
                    {saving ? 'Updating...' : 'Update Article'}
                  </button>
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
