import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createCourseChapter, getCategoriesByCourse, getAllAdminCategories } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import DurationPicker from '../components/DurationPicker';

export default function CourseChapter() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    chapter_number: '',
    duration: '',
    is_locked: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    // Try to get all admin categories first, then filter by course if needed
    const allCategoriesResult = await getAllAdminCategories(token);
    if (allCategoriesResult.success) {
      setCategories(allCategoriesResult.data || []);
    } else {
      // Fallback to course-specific categories
      const courseCategoriesResult = await getCategoriesByCourse(courseId, token);
      if (courseCategoriesResult.success) {
        setCategories(courseCategoriesResult.data || []);
      } else {
        console.error('Failed to fetch categories:', courseCategoriesResult.message);
      }
    }
    setCategoriesLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDurationChange = (duration) => {
    setFormData(prev => ({
      ...prev,
      duration: duration,
    }));
  };

  const handleCancel = () => {
    navigate('/courses');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter chapter title',
      });
      return;
    }

    if (!formData.category.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter chapter category',
      });
      return;
    }

    setIsLoading(true);
    const result = await createCourseChapter(courseId, formData, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Chapter Created',
        text: 'Chapter has been created successfully',
      });
      navigate('/courses');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Chapter',
        text: result.message,
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
                <h5>Create Chapter</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back to Courses
                    </button>
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
                    <div className="col-md-6">
                      <label className="form-label">Chapter Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter chapter title"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Category <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        disabled={categoriesLoading}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {categoriesLoading && (
                        <small className="text-muted">Loading categories...</small>
                      )}
                      {!categoriesLoading && categories.length === 0 && (
                        <small className="text-warning">No categories available. Please create categories first.</small>
                      )}
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter chapter description"
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Chapter Number</label>
                      <input
                        type="number"
                        className="form-control"
                        name="chapter_number"
                        value={formData.chapter_number}
                        onChange={handleInputChange}
                        placeholder="Enter chapter number"
                        min="0"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Duration</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          name="duration"
                          value={formData.duration}
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

                    {/* <div className="col-md-6">
                      <label className="form-label">Is Locked</label>
                      <select
                        className="form-control"
                        name="is_locked"
                        value={formData.is_locked}
                        onChange={handleInputChange}
                      >
                        <option value={false}>No</option>
                        <option value={true}>Yes</option>
                      </select>
                    </div> */}

                    <div className="col-md-6">
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex gap-2">
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Creating...' : 'Create Chapter'}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </div>
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
          value={formData.duration}
          onChange={handleDurationChange}
          onClose={() => setShowDurationPicker(false)}
        />
      )}
    </div>
  );
}
