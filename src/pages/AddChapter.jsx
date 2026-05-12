import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createChapter } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function AddChapter() {
  const navigate = useNavigate();
  const { courseId, categoryId } = useParams();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fr: '',
    title_es: '',
    description_en: '',
    description_fr: '',
    description_es: '',
    chapter_number: '',
    duration: '',
    total_duration: '',
    is_locked: false,
    order_number: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCancel = () => {
    navigate(`/course/${courseId}/category/${categoryId}/chapters`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title_en.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter English chapter title',
      });
      return;
    }

    setIsLoading(true);
    const result = await createChapter(categoryId, formData, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Chapter Created',
        text: 'Chapter has been created successfully',
      });
      navigate(`/course/${courseId}/category/${categoryId}/chapters`);
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
                <h5>Add New Chapter</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/course/${courseId}/category/${categoryId}/chapters`)}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back to Chapters
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
                              <label className="form-label">Chapter Title</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Enter chapter title"
                                name="title_en"
                                value={formData.title_en}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control bg-white"
                                rows="5"
                                placeholder="Enter chapter description"
                                name="description_en"
                                value={formData.description_en}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
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
                              <label className="form-label">Título del capítulo</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Ingrese el título del capítulo"
                                name="title_es"
                                value={formData.title_es}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Descripción</label>
                              <textarea
                                className="form-control bg-white"
                                rows="5"
                                placeholder="Ingrese la descripción del capítulo"
                                name="description_es"
                                value={formData.description_es}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
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
                              <label className="form-label">Titre du chapitre</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Entrez le titre du chapitre"
                                name="title_fr"
                                value={formData.title_fr}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control bg-white"
                                rows="5"
                                placeholder="Entrez la description du chapitre"
                                name="description_fr"
                                value={formData.description_fr}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Common Section */}
                      <div className="col-md-12 mt-4">
                        <div className="card shadow-none border" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="card-header bg-white border-bottom-0 pt-3">
                            <h6 className="fw-bold mb-0">Common Information</h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-4">
                                <label className="form-label">Chapter Number</label>
                                <input
                                  type="number"
                                  className="form-control bg-white"
                                  name="chapter_number"
                                  value={formData.chapter_number}
                                  onChange={handleInputChange}
                                  placeholder="Enter chapter number"
                                  min="0"
                                />
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Duration</label>
                                <input
                                  type="text"
                                  className="form-control bg-white"
                                  name="duration"
                                  value={formData.duration}
                                  onChange={handleInputChange}
                                  placeholder="e.g., 2 hours"
                                />
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Total Duration (minutes)</label>
                                <input
                                  type="number"
                                  className="form-control bg-white"
                                  name="total_duration"
                                  value={formData.total_duration}
                                  onChange={handleInputChange}
                                  placeholder="Enter total duration in minutes"
                                  min="0"
                                />
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Order Number</label>
                                <input
                                  type="number"
                                  className="form-control bg-white"
                                  name="order_number"
                                  value={formData.order_number}
                                  onChange={handleInputChange}
                                  placeholder="Enter order number"
                                />
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Is Locked</label>
                                <select
                                  className="form-select bg-white"
                                  name="is_locked"
                                  value={formData.is_locked}
                                  onChange={handleInputChange}
                                >
                                  <option value={false}>No</option>
                                  <option value={true}>Yes</option>
                                </select>
                              </div>
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
                          {isLoading ? 'Creating...' : 'Create Chapter'}
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
    </div>
  );
}
