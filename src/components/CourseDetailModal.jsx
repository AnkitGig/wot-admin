import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalLoader from './GlobalLoader';

export default function CourseDetailModal({ show, courseData, isLoading, onClose }) {
  const navigate = useNavigate();

  if (!show) return null;

  const getContentTypeIcon = (contentType) => {
    const iconMap = {
      video: 'fa-video',
      text: 'fa-file-text',
      doc: 'fa-file-pdf',
      audio: 'fa-music',
    };
    return iconMap[contentType?.toLowerCase()] || 'fa-file';
  };

  const getContentTypeLabel = (contentType) => {
    const labelMap = {
      video: 'Video',
      text: 'Text',
      doc: 'Document',
      audio: 'Audio',
    };
    return labelMap[contentType?.toLowerCase()] || contentType;
  };

  const handleViewLessons = () => {
    navigate(`/course/${courseData.id}/lessons`);
    onClose();
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title">Course Details</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>

          <div className="modal-body">
            {isLoading ? (
              <div className="text-center py-5">
                <GlobalLoader visible={true} size="small" />
              </div>
            ) : courseData ? (
              <>
                {/* Course Header */}
                <div className="mb-4">
                  <img 
                    src={courseData.thumbnail || courseData.image} 
                    alt={courseData.title}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      backgroundColor: '#f0f0f0'
                    }}
                  />
                  
                  <h4 className="mb-2">{courseData.title}</h4>
                  <p className="text-muted mb-3">{courseData.slug}</p>
                  
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-success">{courseData.status}</span>
                    <span className="badge bg-primary">{courseData.level}</span>
                    <span className="badge bg-info">{courseData.duration_in_minutes} min</span>
                    {courseData.is_featured && <span className="badge bg-warning">Featured</span>}
                    {courseData.is_free ? (
                      <span className="badge bg-success">Free</span>
                    ) : (
                      <span className="badge bg-info">${courseData.price}</span>
                    )}
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <small className="text-muted d-block">Enrolled: <strong>{courseData.enrolled_count}</strong></small>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block">Language: <strong>{courseData.language}</strong></small>
                    </div>
                    {courseData.rating_count > 0 && (
                      <div className="col-md-6">
                        <small className="text-muted d-block">Rating: <strong>{courseData.rating_avg} ({courseData.rating_count})</strong></small>
                      </div>
                    )}
                    {courseData.certificate_available && (
                      <div className="col-md-6">
                        <small className="text-muted d-block"><i className="fa fa-certificate me-1"></i>Certificate Available</small>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Info Section */}
                {courseData.short_description && (
                  <div className="mb-4">
                    <h6 className="text-primary mb-2">Short Description</h6>
                    <p className="text-muted">{courseData.short_description}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h6 className="text-primary mb-2">Course Description</h6>
                  <p className="text-muted">{courseData.description}</p>
                </div>

                <div className="mb-4">
                  <h6 className="text-primary mb-2">Learning Objectives</h6>
                  <p className="text-muted">{courseData.objectives}</p>
                </div>

                {/* Categories and Chapters Section */}
                {courseData.categories && courseData.categories.length > 0 && (
                  <div className="mb-4">
                    <h6 className="text-primary mb-3">Course Content ({courseData.total_chapters} Chapters, {courseData.total_lessons} Lessons)</h6>
                    <div className="accordion" id="courseCategoriesAccordion">
                      {courseData.categories.map((category, catIndex) => (
                        <div key={category.id} className="accordion-item">
                          <h2 className="accordion-header">
                            <button 
                              className="accordion-button" 
                              type="button" 
                              data-bs-toggle="collapse"
                              data-bs-target={`#category-${category.id}`}
                              aria-expanded={catIndex === 0}
                            >
                              <span className="badge bg-secondary me-2">{category.chapters?.length || 0}</span>
                              {category.name}
                            </button>
                          </h2>
                          <div 
                            id={`category-${category.id}`}
                            className={`accordion-collapse collapse ${catIndex === 0 ? 'show' : ''}`}
                            data-bs-parent="#courseCategoriesAccordion"
                          >
                            <div className="accordion-body p-0">
                              {category.chapters?.map((chapter, chIdx) => (
                                <div key={chapter.id} className="border-bottom">
                                  <div className="p-3">
                                    <div className="d-flex align-items-start">
                                      <span className="badge bg-light text-dark me-2 mt-1">{chapter.chapter_number}</span>
                                      <div className="flex-grow-1">
                                        <h6 className="mb-1">{chapter.title}</h6>
                                        <p className="text-muted small mb-2">{chapter.description}</p>
                                        <small className="text-muted d-block">
                                          <i className="fa fa-clock me-1"></i>{chapter.duration_in_minutes || chapter.total_duration} min
                                          {chapter.lesson_count > 0 && ` • ${chapter.lesson_count} lesson${chapter.lesson_count !== 1 ? 's' : ''}`}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">Unable to load course details</p>
              </div>
            )}
          </div>

          <div className="modal-footer border-top">
            <button 
              type="button" 
              className="btn btn-secondary mt-3" 
              onClick={onClose}
              disabled={isLoading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
