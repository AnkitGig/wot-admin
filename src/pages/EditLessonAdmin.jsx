import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getLessonAdmin, updateLessonAdmin } from '../api/lessons';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const CONTENT_TYPES = ['text', 'video', 'audio', 'doc', 'pdf'];

export default function EditLessonAdmin() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fr: '',
    title_es: '',
    description_en: '',
    description_fr: '',
    description_es: '',
    duration_en: '',
    duration_fr: '',
    duration_es: '',
    lesson_number: 0,
    xp_points: 0,
    reward_points: 0,
    is_preview: false,
    is_locked: false,
    quiz_available: false,
    order_number: 0,
    thumbnail: null,
    content_title_en: '',
    content_title_fr: '',
    content_title_es: '',
    content_type: 'text',
    text_content_en: '',
    text_content_fr: '',
    text_content_es: '',
    content_duration_en: '',
    content_duration_fr: '',
    content_duration_es: '',
    file_size_en: '',
    file_size_fr: '',
    file_size_es: '',
    is_downloadable: false,
    media: null,
  });

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    setIsLoading(true);
    const result = await getLessonAdmin(lessonId, token);

    if (result.success) {
      const lesson = result.data;
      setLessonData(lesson);
      
      const content = lesson.content || {};
      const lessonTrans = lesson.translations || {};
      const contentTrans = content.translations || {};
      
      setFormData({
        title_en: lessonTrans.en?.title || lesson.title || '',
        title_fr: lessonTrans.fr?.title || '',
        title_es: lessonTrans.es?.title || '',
        
        description_en: lessonTrans.en?.description || lesson.description || '',
        description_fr: lessonTrans.fr?.description || '',
        description_es: lessonTrans.es?.description || '',
        
        duration_en: lessonTrans.en?.duration || lesson.duration || '',
        duration_fr: lessonTrans.fr?.duration || '',
        duration_es: lessonTrans.es?.duration || '',
        
        lesson_number: lesson.lesson_number || 0,
        xp_points: lesson.xp_points || 0,
        reward_points: lesson.reward_points || 0,
        is_preview: lesson.is_preview || false,
        is_locked: lesson.is_locked || false,
        quiz_available: lesson.quiz_available || false,
        order_number: lesson.order_number || 0,
        thumbnail: null,
        
        content_title_en: contentTrans.en?.title || content.title || '',
        content_title_fr: contentTrans.fr?.title || '',
        content_title_es: contentTrans.es?.title || '',
        
        content_type: content.content_type || 'text',
        
        text_content_en: contentTrans.en?.text_content || content.text_content || '',
        text_content_fr: contentTrans.fr?.text_content || '',
        text_content_es: contentTrans.es?.text_content || '',
        
        content_duration_en: contentTrans.en?.duration || content.duration || '',
        content_duration_fr: contentTrans.fr?.duration || '',
        content_duration_es: contentTrans.es?.duration || '',
        
        file_size_en: contentTrans.en?.file_size || content.file_size || '',
        file_size_fr: contentTrans.fr?.file_size || '',
        file_size_es: contentTrans.es?.file_size || '',
        
        is_downloadable: content.is_downloadable || false,
        media: null,
      });
      
      if (lesson.thumbnail) {
        setThumbnailPreview(lesson.thumbnail);
      }
      if (content.file_url || content.video_url) {
        setMediaPreview(content.file_url || content.video_url);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Lesson',
        text: result.message || 'An error occurred while fetching lesson',
      });
      navigate(-1);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;

    if (['is_preview', 'is_locked', 'is_downloadable', 'quiz_available'].includes(name)) {
      finalValue = value === 'true' || value === true;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleQuillChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, media: file }));
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title_en.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'English Title is required' });
      return;
    }

    setIsSaving(true);
    const result = await updateLessonAdmin(lessonId, formData, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'Lesson updated successfully',
        timer: 1500,
        showConfirmButton: false
      }).then(() => navigate(-1));
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: result.message });
    }
    setIsSaving(false);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (isLoading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid"><GlobalLoader /></div>
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
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Edit Lesson</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/">Dashboard</a></li>
                  <li className="breadcrumb-item active">Edit Lesson</li>
                </ul>
              </div>
              <div className="col-auto">
                <button className="btn btn-primary" onClick={() => navigate(-1)}>
                  <i className="fa fa-arrow-left me-2"></i>Back
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Language Columns */}
              {[
                { lang: 'en', flag: '🇺🇸', label: 'English', color: 'primary' },
                { lang: 'es', flag: '🇪🇸', label: 'Spanish', color: 'success' },
                { lang: 'fr', flag: '🇫🇷', label: 'French', color: 'warning' }
              ].map((item) => (
                <div className="col-md-4" key={item.lang}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className={`card-header bg-${item.color} text-white text-center py-2`}>
                      <h6 className="mb-0 fw-bold">{item.flag} {item.label} Details</h6>
                    </div>
                    <div className="card-body bg-light-subtle">
                      {/* Lesson Info */}
                      <div className="mb-3">
                        <label className="form-label fw-bold small">Title {item.lang === 'en' && <span className="text-danger">*</span>}</label>
                        <input
                          type="text"
                          className="form-control"
                          name={`title_${item.lang}`}
                          value={formData[`title_${item.lang}`]}
                          onChange={handleInputChange}
                          placeholder={`Enter ${item.label} title`}
                          required={item.lang === 'en'}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold small">Description {item.lang === 'en' && <span className="text-danger">*</span>}</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          name={`description_${item.lang}`}
                          value={formData[`description_${item.lang}`]}
                          onChange={handleInputChange}
                          placeholder={`Enter ${item.label} description`}
                          required={item.lang === 'en'}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold small">Duration</label>
                        <input
                          type="text"
                          className="form-control"
                          name={`duration_${item.lang}`}
                          value={formData[`duration_${item.lang}`]}
                          onChange={handleInputChange}
                          placeholder="e.g., 25 min"
                        />
                      </div>
                      
                      <hr className="my-4" />
                      <h6 className="text-muted small text-uppercase fw-bold mb-3">Content Section</h6>
                      
                      {/* Content Info */}
                      <div className="mb-3">
                        <label className="form-label fw-bold small">Content Title</label>
                        <input
                          type="text"
                          className="form-control"
                          name={`content_title_${item.lang}`}
                          value={formData[`content_title_${item.lang}`]}
                          onChange={handleInputChange}
                          placeholder="Enter content title"
                        />
                      </div>

                      {formData.content_type === 'text' && (
                        <div className="mb-3">
                          <label className="form-label fw-bold small">Text Content</label>
                          <div className="bg-white border rounded">
                            <ReactQuill
                              theme="snow"
                              value={formData[`text_content_${item.lang}`]}
                              onChange={(val) => handleQuillChange(`text_content_${item.lang}`, val)}
                              modules={modules}
                              placeholder="Enter text content..."
                              style={{ height: '200px', marginBottom: '45px' }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="row g-2 mt-2">
                        <div className="col-6">
                          <label className="form-label fw-bold small">Cont. Duration</label>
                          <input
                            type="text"
                            className="form-control"
                            name={`content_duration_${item.lang}`}
                            value={formData[`content_duration_${item.lang}`]}
                            onChange={handleInputChange}
                            placeholder="e.g., 25 min"
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-bold small">File Size</label>
                          <input
                            type="text"
                            className="form-control"
                            name={`file_size_${item.lang}`}
                            value={formData[`file_size_${item.lang}`]}
                            onChange={handleInputChange}
                            placeholder="e.g., 2.5 MB"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Shared Settings Column */}
              <div className="col-12 mt-4">
                <div className="card shadow-sm border-0 border-top border-4 border-primary">
                  <div className="card-header bg-white py-3">
                    <h6 className="mb-0 fw-bold"><i className="fas fa-cog me-2"></i>Global Lesson Settings & Media</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-2">
                        <label className="form-label fw-bold">Lesson #</label>
                        <input type="number" className="form-control" name="lesson_number" value={formData.lesson_number} onChange={handleInputChange} min="0" />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label fw-bold">XP Points</label>
                        <input type="number" className="form-control" name="xp_points" value={formData.xp_points} onChange={handleInputChange} min="0" />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label fw-bold">Rewards</label>
                        <input type="number" className="form-control" name="reward_points" value={formData.reward_points} onChange={handleInputChange} min="0" />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label fw-bold">Order #</label>
                        <input type="number" className="form-control" name="order_number" value={formData.order_number} onChange={handleInputChange} min="0" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-bold text-primary">Content Type</label>
                        <select className="form-select border-primary" name="content_type" value={formData.content_type} onChange={handleInputChange}>
                          {CONTENT_TYPES.map(type => <option key={type} value={type}>{type.toUpperCase()}</option>)}
                        </select>
                      </div>

                      <div className="col-md-3">
                        <div className="form-check form-switch mt-4">
                          <input className="form-check-input" type="checkbox" name="is_preview" checked={formData.is_preview} onChange={(e) => setFormData(prev => ({ ...prev, is_preview: e.target.checked }))} id="isPreview" />
                          <label className="form-check-label fw-bold" htmlFor="isPreview">Is Preview</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check form-switch mt-4">
                          <input className="form-check-input" type="checkbox" name="is_locked" checked={formData.is_locked} onChange={(e) => setFormData(prev => ({ ...prev, is_locked: e.target.checked }))} id="isLocked" />
                          <label className="form-check-label fw-bold" htmlFor="isLocked">Is Locked</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check form-switch mt-4">
                          <input className="form-check-input" type="checkbox" name="quiz_available" checked={formData.quiz_available} onChange={(e) => setFormData(prev => ({ ...prev, quiz_available: e.target.checked }))} id="quizAvailable" />
                          <label className="form-check-label fw-bold" htmlFor="quizAvailable">Quiz Ready</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check form-switch mt-4">
                          <input className="form-check-input" type="checkbox" name="is_downloadable" checked={formData.is_downloadable} onChange={(e) => setFormData(prev => ({ ...prev, is_downloadable: e.target.checked }))} id="isDownloadable" />
                          <label className="form-check-label fw-bold" htmlFor="isDownloadable">Downloadable</label>
                        </div>
                      </div>

                      <div className="col-md-6 mt-4">
                        <label className="form-label fw-bold">Lesson Thumbnail</label>
                        <div className="d-flex align-items-start gap-3">
                          <div className="flex-grow-1">
                            <input type="file" className="form-control" accept="image/*" onChange={handleThumbnailChange} />
                            <small className="text-muted">Recommended: 800x450px</small>
                          </div>
                          {thumbnailPreview && (
                            <img src={thumbnailPreview} alt="Preview" className="rounded border" style={{ width: '100px', height: '60px', objectFit: 'cover' }} />
                          )}
                        </div>
                      </div>

                      <div className="col-md-6 mt-4">
                        <label className="form-label fw-bold">Content Media (Video/Audio/PDF)</label>
                        <div className="d-flex align-items-start gap-3">
                          <div className="flex-grow-1">
                            <input type="file" className="form-control" onChange={handleMediaChange} />
                            <small className="text-muted">Supports: MP4, MP3, PDF, DOCX</small>
                          </div>
                          {mediaPreview && (
                            <div className="rounded border bg-light d-flex align-items-center justify-content-center" style={{ width: '100px', height: '60px' }}>
                              <i className="fas fa-file-alt fa-2x text-primary"></i>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-5 mb-5">
              <div className="col-12 text-center">
                <hr className="mb-4" />
                <button type="button" className="btn btn-lg btn-outline-secondary px-5 me-3" onClick={() => navigate(-1)} disabled={isSaving}>Cancel</button>
                <button type="submit" className="btn btn-lg btn-primary px-5 shadow" disabled={isSaving}>
                  {isSaving ? <><i className="fas fa-spinner fa-spin me-2"></i>Updating...</> : <><i className="fas fa-save me-2"></i>Update Lesson</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
