import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getCourseById, updateCourse } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import DurationPicker from '../components/DurationPicker';

export default function EditCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    objectives: '',
    duration_in_minutes: '',
    level: 'Beginner',
    language: 'English',
    price: 0,
    is_free: true,
    is_featured: false,
    status: 'draft',
    certificate_available: false,
    image: null,
    thumbnail: null,
    intro_video: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    setIsLoading(true);
    const result = await getCourseById(courseId, token);

    if (result.success) {
      const course = result.data;
      setFormData({
        title: course.title || '',
        slug: course.slug || '',
        description: course.description || '',
        short_description: course.short_description || '',
        objectives: course.objectives || '',
        duration_in_minutes: course.duration_in_minutes || '',
        level: course.level || 'Beginner',
        language: course.language || 'English',
        price: course.price || 0,
        is_free: course.is_free !== undefined ? course.is_free : true,
        is_featured: course.is_featured !== undefined ? course.is_featured : false,
        status: course.status || 'draft',
        certificate_available: course.certificate_available !== undefined ? course.certificate_available : false,
        image: null,
        thumbnail: null,
        intro_video: null,
      });
      setImagePreview(course.image);
      setThumbnailPreview(course.thumbnail);
      setVideoPreview(course.intro_video_url ? course.intro_video_url.split('/').pop() : null);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Course',
        text: result.message || 'An error occurred while fetching course details',
      });
      navigate('/courses');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    
    // Handle boolean fields from select dropdowns
    if (['is_free', 'is_featured', 'certificate_available'].includes(name)) {
      finalValue = value === 'true' || value === true;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        intro_video: file,
      }));
      
      setVideoPreview(file.name);
    }
  };

  const handleDurationChange = (durationText) => {
    setFormData(prev => ({
      ...prev,
      duration_in_minutes: durationText,
    }));
  };

  const formatDurationDisplay = (duration) => {
    if (!duration) return 'Click to select duration';
    return duration;
  };

  const handleCancel = () => {
    navigate('/courses');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter course title',
      });
      return;
    }

    if (!formData.slug.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter course slug',
      });
      return;
    }

    if (!formData.description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter course description',
      });
      return;
    }

    if (!formData.objectives.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter course objectives',
      });
      return;
    }

    if (!formData.duration_in_minutes) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter course duration in minutes',
      });
      return;
    }

    setIsSubmitting(true);

    const result = await updateCourse(courseId, formData, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Course Updated',
        text: result.message || 'Course updated successfully!',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate('/courses');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Update Course',
        text: result.message || 'An error occurred while updating the course',
      });
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <GlobalLoader visible={true} size="medium" />
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
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Edit Course</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <a className="btn btn-primary" href="/courses"><i className="fa fa-arrow-left me-2"></i>Back</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Course Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter course title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Slug <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="course-slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Level <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Duration <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          name="duration_in_minutes"
                          value={formatDurationDisplay(formData.duration_in_minutes)}
                          onChange={handleInputChange}
                          placeholder="Click to select duration"
                          readOnly
                          style={{ cursor: 'pointer' }}
                          onClick={() => setShowDurationPicker(true)}
                        />
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={() => setShowDurationPicker(true)}
                        >
                          <i className="fa fa-clock"></i>
                        </button>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Language <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g., English"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Status <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Course Description <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Enter detailed course description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Short Description</label>
                      <textarea 
                        className="form-control" 
                        rows="2" 
                        placeholder="Enter short course description"
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Course Objectives <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Enter course objectives/learning outcomes"
                        name="objectives"
                        value={formData.objectives}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Price</label>
                      <input 
                        type="number" 
                        className="form-control"
                        placeholder="0"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Is Free?</label>
                      <select 
                        className="form-control"
                        name="is_free"
                        value={formData.is_free}
                        onChange={handleInputChange}
                      >
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Featured</label>
                      <select 
                        className="form-control"
                        name="is_featured"
                        value={formData.is_featured}
                        onChange={handleInputChange}
                      >
                        <option value={false}>No</option>
                        <option value={true}>Yes</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Certificate Available</label>
                      <select 
                        className="form-control"
                        name="certificate_available"
                        value={formData.certificate_available}
                        onChange={handleInputChange}
                      >
                        <option value={false}>No</option>
                        <option value={true}>Yes</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Course Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {imagePreview && (
                        <div className="mt-3">
                          <img
                            src={imagePreview}
                            alt="Image Preview"
                            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Course Thumbnail</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                      {thumbnailPreview && (
                        <div className="mt-3">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail Preview"
                            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Intro Video</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="video/*"
                        onChange={handleVideoChange}
                      />
                      {videoPreview && (
                        <div className="mt-3">
                          <p className="text-muted">Selected: {videoPreview}</p>
                        </div>
                      )}
                    </div>

                    <div className="col-md-12 text-end mt-3">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary ms-2"
                        disabled={isSubmitting}
                      >
                        <i className="bi bi-check-circle"></i> {isSubmitting ? 'Updating...' : 'Update Course'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {showDurationPicker && (
        <DurationPicker
          value={formData.duration_in_minutes}
          onChange={handleDurationChange}
          onClose={() => setShowDurationPicker(false)}
        />
      )}
    </div>
  );
}
