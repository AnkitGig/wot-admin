import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { addCourse } from "../api/courses";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import DurationPicker from "../components/DurationPicker";

export default function AddCourse() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: "",
    title_fr: "",
    title_es: "",
    slug: "",
    description_en: "",
    description_fr: "",
    description_es: "",
    short_description_en: "",
    short_description_fr: "",
    short_description_es: "",
    objectives_en: "",
    objectives_fr: "",
    objectives_es: "",
    requirements_en: "",
    requirements_fr: "",
    requirements_es: "",
    duration_in_minutes: "",
    level: "Beginner",
    language: "English",
    price: "",
    is_free: true,
    is_featured: false,
    status: "draft",
    certificate_available: false,
    image: null,
    thumbnail: null,
    intro_video: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;

    // Handle boolean fields from select dropdowns
    if (["is_free", "is_featured", "certificate_available"].includes(name)) {
      finalValue = value === "true" || value === true;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
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
      setFormData((prev) => ({
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
      setFormData((prev) => ({
        ...prev,
        intro_video: file,
      }));

      setVideoPreview(file.name);
    }
  };

  const handleDurationChange = (durationText) => {
    setFormData((prev) => ({
      ...prev,
      duration_in_minutes: durationText,
    }));
  };

  const formatDurationDisplay = (duration) => {
    if (!duration) return "Click to select duration";
    return duration;
  };

  const handleCancel = () => {
    navigate("/courses");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title_en.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter English course title",
      });
      return;
    }

    if (!formData.slug.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter course slug",
      });
      return;
    }

    if (!formData.description_en.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter English course description",
      });
      return;
    }

    if (!formData.objectives_en.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter English course objectives",
      });
      return;
    }

    if (!formData.duration_in_minutes) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select course duration",
      });
      return;
    }

    if (!formData.image) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please upload course image",
      });
      return;
    }

    if (!formData.thumbnail) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please upload course thumbnail",
      });
      return;
    }

    setIsLoading(true);

    const result = await addCourse(formData, token);

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "Course Created",
        text: result.message || "Course created successfully!",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate("/courses");
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed to Create Course",
        text: result.message || "An error occurred while creating the course",
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
                <h5>Add New Courses</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <Link className="btn btn-primary" to="/courses">
                      <i className="fa fa-plus-circle me-2"></i>View All
                    </Link>
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
                              <label className="form-label">Course Title</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Enter course title"
                                name="title_en"
                                value={formData.title_en}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Short Description</label>
                              <textarea
                                className="form-control bg-white"
                                rows="2"
                                placeholder="Enter short description"
                                name="short_description_en"
                                value={formData.short_description_en}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Course Description</label>
                              <textarea
                                className="form-control bg-white"
                                rows="5"
                                placeholder="Enter detailed description"
                                name="description_en"
                                value={formData.description_en}
                                onChange={handleInputChange}
                                required
                              ></textarea>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Course Objectives</label>
                              <textarea
                                className="form-control bg-white"
                                rows="3"
                                placeholder="Learning outcomes"
                                name="objectives_en"
                                value={formData.objectives_en}
                                onChange={handleInputChange}
                                required
                              ></textarea>
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Course Requirements</label>
                              <textarea
                                className="form-control bg-white"
                                rows="3"
                                placeholder="Course requirements"
                                name="requirements_en"
                                value={formData.requirements_en}
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
                              <label className="form-label">Título del curso</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Ingrese el título del curso"
                                name="title_es"
                                value={formData.title_es}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Descripción breve</label>
                              <textarea
                                className="form-control bg-white"
                                rows="2"
                                placeholder="Ingrese una descripción breve"
                                name="short_description_es"
                                value={formData.short_description_es}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Descripción del curso</label>
                              <textarea
                                className="form-control bg-white"
                                rows="5"
                                placeholder="Ingrese la descripción detallada"
                                name="description_es"
                                value={formData.description_es}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Objetivos del curso</label>
                              <textarea
                                className="form-control bg-white"
                                rows="3"
                                placeholder="Resultados del aprendizaje"
                                name="objectives_es"
                                value={formData.objectives_es}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Requisitos del curso</label>
                              <textarea
                                className="form-control bg-white"
                                rows="3"
                                placeholder="Requisitos del curso"
                                name="requirements_es"
                                value={formData.requirements_es}
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
                              <label className="form-label">Titre du cours</label>
                              <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Entrez le titre du cours"
                                name="title_fr"
                                value={formData.title_fr}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Brève description</label>
                              <textarea
                                className="form-control bg-white"
                                rows="2"
                                placeholder="Entrez une brève description"
                                name="short_description_fr"
                                value={formData.short_description_fr}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Description du cours</label>
                              <textarea
                                className="form-control bg-white"
                                rows="5"
                                placeholder="Entrez la description détaillée"
                                name="description_fr"
                                value={formData.description_fr}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Objectifs du cours</label>
                              <textarea
                                className="form-control bg-white"
                                rows="3"
                                placeholder="Résultats d'apprentissage"
                                name="objectives_fr"
                                value={formData.objectives_fr}
                                onChange={handleInputChange}
                              ></textarea>
                            </div>
                            <div className="mb-0">
                              <label className="form-label">Exigences du cours</label>
                              <textarea
                                className="form-control bg-white"
                                rows="3"
                                placeholder="Exigences du cours"
                                name="requirements_fr"
                                value={formData.requirements_fr}
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
                                <label className="form-label">Slug</label>
                                <input
                                  type="text"
                                  className="form-control bg-white"
                                  placeholder="course-slug"
                                  name="slug"
                                  value={formData.slug}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Level</label>
                                <select
                                  className="form-control bg-white"
                                  name="level"
                                  value={formData.level}
                                  onChange={handleInputChange}
                                  style={{ appearance: "auto" }}
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                </select>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Duration</label>
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control bg-white"
                                    name="duration_in_minutes"
                                    value={formatDurationDisplay(formData.duration_in_minutes)}
                                    placeholder="Click to select duration"
                                    readOnly
                                    style={{ cursor: "pointer" }}
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
                              <div className="col-md-4">
                                <label className="form-label">Default Language</label>
                                <input
                                  type="text"
                                  className="form-control bg-white"
                                  placeholder="e.g., English"
                                  name="language"
                                  value={formData.language}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Status</label>
                                <select
                                  className="form-control bg-white"
                                  name="status"
                                  value={formData.status}
                                  onChange={handleInputChange}
                                  style={{ appearance: "auto" }}
                                >
                                  <option value="draft">Draft</option>
                                  <option value="Published">Published</option>
                                </select>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Price</label>
                                <input
                                  type="text"
                                  className="form-control bg-white"
                                  placeholder="0"
                                  name="price"
                                  value={formData.price}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                      handleInputChange(e);
                                    }
                                  }}
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Is Free?</label>
                                <select
                                  className="form-control bg-white"
                                  name="is_free"
                                  value={String(formData.is_free)}
                                  onChange={handleInputChange}
                                  style={{ appearance: "auto" }}
                                >
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Featured</label>
                                <select
                                  className="form-control bg-white"
                                  name="is_featured"
                                  value={String(formData.is_featured)}
                                  onChange={handleInputChange}
                                  style={{ appearance: "auto" }}
                                >
                                  <option value="false">No</option>
                                  <option value="true">Yes</option>
                                </select>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Certificate Available</label>
                                <select
                                  className="form-control bg-white"
                                  name="certificate_available"
                                  value={String(formData.certificate_available)}
                                  onChange={handleInputChange}
                                  style={{ appearance: "auto" }}
                                >
                                  <option value="false">No</option>
                                  <option value="true">Yes</option>
                                </select>
                              </div>

                              <div className="col-md-12 mt-4">
                                <hr />
                                <h6 className="fw-bold mb-3">Media & Assets</h6>
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Course Image</label>
                                <input
                                  type="file"
                                  className="form-control bg-white"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                />
                                {imagePreview && (
                                  <div className="mt-2">
                                    <img src={imagePreview} alt="Preview" style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "4px" }} />
                                  </div>
                                )}
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Course Thumbnail</label>
                                <input
                                  type="file"
                                  className="form-control bg-white"
                                  accept="image/*"
                                  onChange={handleThumbnailChange}
                                />
                                {thumbnailPreview && (
                                  <div className="mt-2">
                                    <img src={thumbnailPreview} alt="Preview" style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "4px" }} />
                                  </div>
                                )}
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Intro Video</label>
                                <input
                                  type="file"
                                  className="form-control bg-white"
                                  accept="video/*"
                                  onChange={handleVideoChange}
                                />
                                {videoPreview && (
                                  <div className="mt-2">
                                    <p className="small text-muted mb-0">Selected: {videoPreview}</p>
                                  </div>
                                )}
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
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary px-4 ms-2"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating...</>
                          ) : (
                            <><i className="bi bi-check-circle me-2"></i>Create Course</>
                          )}
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
          value={formData.duration_in_minutes}
          onChange={handleDurationChange}
          onClose={() => setShowDurationPicker(false)}
        />
      )}
    </div>
  );
}
