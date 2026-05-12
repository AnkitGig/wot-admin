import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createLesson } from '../api/lessons';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import DurationPicker from '../components/DurationPicker';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function AddLesson() {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fr: '',
    title_es: '',
    description_en: '',
    description_fr: '',
    description_es: '',
    lesson_number: 0,
    duration: '',
    xp_points: 0,
    reward_points: 0,
    is_preview: false,
    is_locked: false,
    quiz_available: false,
    is_downloadable: false,
    status: 'active',
    order_number: 1,
    content_type: 'text',
    content_title_en: '',
    content_title_fr: '',
    content_title_es: '',
    text_content_en: '',
    text_content_fr: '',
    text_content_es: '',
    thumbnail: null,
    media: null,
  });

  const contentTypeOptions = ['text', 'video', 'audio'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : (name === 'is_downloadable' ? value === 'true' : value)),
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
      }));
      setThumbnailPreview(file.name);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        media: file,
      }));
    }
  };

  const handleDurationChange = (durationText) => {
    setFormData(prev => ({
      ...prev,
      duration: durationText,
    }));
  };

  const formatDurationDisplay = (duration) => {
    if (!duration) return 'Click to select duration';
    return duration;
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title_en.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter English lesson title',
      });
      return;
    }

    if (!formData.description_en.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter English lesson description',
      });
      return;
    }

    if (!formData.content_type) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a content type',
      });
      return;
    }

    if (formData.content_type === 'text') {
      if (!formData.text_content_en.trim() || formData.text_content_en.replace(/<[^>]*>/g, '').trim() === '') {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Please enter English text content',
        });
        return;
      }
    }

    if (['video', 'audio'].includes(formData.content_type) && !formData.media) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: `Media file is required for ${formData.content_type} type`,
      });
      return;
    }

    setIsLoading(true);
    
    // Map the single duration to localized fields for the API
    const apiPayload = {
      ...formData,
      duration_en: formData.duration,
      duration_fr: formData.duration,
      duration_es: formData.duration,
      content_duration_en: formData.duration,
      content_duration_fr: formData.duration,
      content_duration_es: formData.duration,
    };

    console.log('[v0] Creating lesson with data:', apiPayload);

    const result = await createLesson(chapterId, apiPayload, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Lesson Created',
        text: result.message || 'Lesson created successfully!',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate(-1);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Lesson',
        text: result.message || 'An error occurred while creating the lesson',
      });
    }

    setIsLoading(false);
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
                <h5>Add New Lesson</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back to Lessons
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* English Column */}
              <div className="col-md-4">
                <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                    <h6 className="fw-bold mb-0">English</h6>
                  </div>
                  <div className="card-body pt-0">
                    <div className="mb-3">
                      <label className="form-label">Lesson Title <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control bg-white" 
                        placeholder="Enter lesson title"
                        name="title_en"
                        value={formData.title_en}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description <span className="text-danger">*</span></label>
                      <textarea 
                        className="form-control bg-white" 
                        rows="4" 
                        placeholder="Enter lesson description"
                        name="description_en"
                        value={formData.description_en}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    
                    {formData.content_type === 'text' && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Content Title</label>
                          <input 
                            type="text" 
                            className="form-control bg-white" 
                            placeholder="Enter content title"
                            name="content_title_en"
                            value={formData.content_title_en}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="mb-0">
                          <label className="form-label">Text Content <span className="text-danger">*</span></label>
                          <div className="editor-container bg-white">
                            <ReactQuill
                              theme="snow"
                              value={formData.text_content_en}
                              onChange={(value) => setFormData(prev => ({ ...prev, text_content_en: value }))}
                              placeholder="Enter text content..."
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline'],
                                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                  ['link', 'clean']
                                ]
                              }}
                              style={{ height: '200px', marginBottom: '45px' }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Spanish Column */}
              <div className="col-md-4">
                <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                    <h6 className="fw-bold mb-0">Spanish</h6>
                  </div>
                  <div className="card-body pt-0">
                    <div className="mb-3">
                      <label className="form-label">Título de la lección</label>
                      <input 
                        type="text" 
                        className="form-control bg-white" 
                        placeholder="Ingrese el título"
                        name="title_es"
                        value={formData.title_es}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Descripción</label>
                      <textarea 
                        className="form-control bg-white" 
                        rows="4" 
                        placeholder="Ingrese la descripción"
                        name="description_es"
                        value={formData.description_es}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    {formData.content_type === 'text' && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Título del contenido</label>
                          <input 
                            type="text" 
                            className="form-control bg-white" 
                            placeholder="Ingrese el título del contenido"
                            name="content_title_es"
                            value={formData.content_title_es}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="mb-0">
                          <label className="form-label">Contenido de texto</label>
                          <div className="editor-container bg-white">
                            <ReactQuill
                              theme="snow"
                              value={formData.text_content_es}
                              onChange={(value) => setFormData(prev => ({ ...prev, text_content_es: value }))}
                              placeholder="Ingrese el contenido..."
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline'],
                                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                  ['link', 'clean']
                                ]
                              }}
                              style={{ height: '200px', marginBottom: '45px' }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* French Column */}
              <div className="col-md-4">
                <div className="card h-100 shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="card-header bg-white border-bottom-0 pt-3 text-center">
                    <h6 className="fw-bold mb-0">French</h6>
                  </div>
                  <div className="card-body pt-0">
                    <div className="mb-3">
                      <label className="form-label">Titre de la leçon</label>
                      <input 
                        type="text" 
                        className="form-control bg-white" 
                        placeholder="Entrez le titre"
                        name="title_fr"
                        value={formData.title_fr}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control bg-white" 
                        rows="4" 
                        placeholder="Entrez la description"
                        name="description_fr"
                        value={formData.description_fr}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    {formData.content_type === 'text' && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Titre du contenu</label>
                          <input 
                            type="text" 
                            className="form-control bg-white" 
                            placeholder="Entrez le titre du contenu"
                            name="content_title_fr"
                            value={formData.content_title_fr}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="mb-0">
                          <label className="form-label">Contenu textuel</label>
                          <div className="editor-container bg-white">
                            <ReactQuill
                              theme="snow"
                              value={formData.text_content_fr}
                              onChange={(value) => setFormData(prev => ({ ...prev, text_content_fr: value }))}
                              placeholder="Entrez le contenu..."
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline'],
                                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                  ['link', 'clean']
                                ]
                              }}
                              style={{ height: '200px', marginBottom: '45px' }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Common Information */}
              <div className="col-md-12 mt-4">
                <div className="card shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="card-header bg-white border-bottom-0 pt-3">
                    <h6 className="fw-bold mb-0">Common Information</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label">Lesson Number</label>
                        <input 
                          type="number" 
                          className="form-control bg-white" 
                          placeholder="0"
                          name="lesson_number"
                          value={formData.lesson_number}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Content Type <span className="text-danger">*</span></label>
                        <select 
                          className="form-control bg-white"
                          name="content_type"
                          value={formData.content_type}
                          onChange={handleInputChange}
                          required
                        >
                          {contentTypeOptions.map(option => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Duration</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control bg-white"
                            name="duration"
                            value={formatDurationDisplay(formData.duration)}
                            onChange={handleInputChange}
                            placeholder="Click to select duration"
                            readOnly
                            style={{ cursor: 'pointer' }}
                            onClick={() => setShowDurationPicker(true)}
                          />
                          <button 
                            className="btn btn-outline-secondary bg-white" 
                            type="button"
                            onClick={() => setShowDurationPicker(true)}
                          >
                            <i className="fa fa-clock"></i>
                          </button>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Order Number</label>
                        <input 
                          type="number" 
                          className="form-control bg-white" 
                          placeholder="1"
                          name="order_number"
                          value={formData.order_number}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">XP Points</label>
                        <input 
                          type="number" 
                          className="form-control bg-white" 
                          placeholder="0"
                          name="xp_points"
                          value={formData.xp_points}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Reward Points</label>
                        <input 
                          type="number" 
                          className="form-control bg-white" 
                          placeholder="0"
                          name="reward_points"
                          value={formData.reward_points}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Status</label>
                        <select 
                          className="form-control bg-white"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Is Preview</label>
                        <select 
                          className="form-control bg-white"
                          name="is_preview"
                          value={formData.is_preview}
                          onChange={handleInputChange}
                        >
                          <option value={false}>No</option>
                          <option value={true}>Yes</option>
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Is Locked</label>
                        <select 
                          className="form-control bg-white"
                          name="is_locked"
                          value={formData.is_locked}
                          onChange={handleInputChange}
                        >
                          <option value={false}>No</option>
                          <option value={true}>Yes</option>
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Quiz Available</label>
                        <select 
                          className="form-control bg-white"
                          name="quiz_available"
                          value={formData.quiz_available}
                          onChange={handleInputChange}
                        >
                          <option value={false}>No</option>
                          <option value={true}>Yes</option>
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Is Downloadable</label>
                        <select 
                          className="form-control bg-white"
                          name="is_downloadable"
                          value={formData.is_downloadable}
                          onChange={handleInputChange}
                        >
                          <option value={false}>No</option>
                          <option value={true}>Yes</option>
                        </select>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Thumbnail Image</label>
                        <input 
                          type="file" 
                          className="form-control bg-white"
                          onChange={handleThumbnailChange}
                          accept="image/*"
                        />
                        {thumbnailPreview && (
                          <div className="mt-2">
                            <small className="text-muted">Selected: {thumbnailPreview}</small>
                          </div>
                        )}
                      </div>

                      {['video', 'audio'].includes(formData.content_type) && (
                        <div className="col-md-12">
                          <label className="form-label">
                            Media File <span className="text-danger"> *</span>
                          </label>
                          <input 
                            type="file" 
                            className="form-control bg-white"
                            onChange={handleMediaChange}
                            accept="video/*,audio/*"
                            required
                          />
                          {formData.media && (
                            <div className="mt-2">
                              <small className="text-muted">Selected: {formData.media.name}</small>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-12 text-end mt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary px-4"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary px-4 ms-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Lesson'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
      
      {showDurationPicker && (
        <DurationPicker
          value={formData.duration}
          onChange={handleDurationChange}
          onClose={() => setShowDurationPicker(false)}
        />
      )}
    </div>
  );
}
