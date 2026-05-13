import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getLessonContent, createLessonContent, getLessonAdmin, updateLessonAdmin, deleteLessonPage, generateLessonQuiz, getLessonQuiz, updateLessonQuiz, deleteLessonQuiz } from '../api/lessons';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

// ✅ Helper: escaped HTML string ko properly render karne ke liye unescape karo
const unescapeHTML = (escapedStr) => {
  if (!escapedStr) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = escapedStr;
  return txt.value;
};

export default function LessonContent() {
  const { lessonId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);

  // View Page Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPage, setViewingPage] = useState(null);

  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    lesson_number: 0,
    duration: '',
    xp_points: 0,
    reward_points: 0,
    is_preview: false,
    is_locked: false,
    order_number: 1,
    thumbnail: null,
  });
  const [contentFormData, setContentFormData] = useState({
    title: '',
    content_type: 'text',
    text_content: '',
    duration: '',
    file_size: '',
    is_downloadable: false,
    order_number: 1,
    media: null,
  });

  useEffect(() => {
    if (lessonId && token) {
      fetchContent();
    }
  }, [lessonId, token]);

  const fetchContent = async () => {
    setIsLoading(true);
    const result = await getLessonAdmin(lessonId, token);
    if (result.success) {
      setLesson(result.data);
      setContent(result.data.content);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Content',
        text: result.message || 'An error occurred while loading lesson content',
      });
    }

    // Fetch Quiz
    const quizResult = await getLessonQuiz(lessonId, token);
    if (quizResult.success && quizResult.quiz_available) {
      setQuiz(quizResult.data);
    } else {
      setQuiz(null);
    }

    setIsLoading(false);
  };

  const getContentTypeBadge = (type) => {
    const badges = {
      'video': 'bg-danger',
      'audio': 'bg-info',
      'text': 'bg-primary',
      'pdf': 'bg-warning',
      'doc': 'bg-secondary',
    };
    return badges[type?.toLowerCase()] || 'bg-secondary';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setContentFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const handleAddContent = async () => {
    if (!contentFormData.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please enter content title' });
      return;
    }
    setIsLoading(true);
    const result = await createLessonContent(lessonId, contentFormData, token);
    if (result.success) {
      Swal.fire({ icon: 'success', title: 'Success', text: 'Content created successfully' });
      setShowContentModal(false);
      setContentFormData({
        title: '', content_type: 'text', text_content: '', duration: '',
        file_size: '', is_downloadable: false, order_number: 1, media: null,
      });
      await fetchContent();
    } else {
      Swal.fire({ icon: 'error', title: 'Failed to Add Content', text: result.message });
    }
    setIsLoading(false);
  };

  const handleUpdateLesson = () => {
    if (lesson) {
      setLessonFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        lesson_number: lesson.lesson_number || 0,
        duration: lesson.duration || '',
        xp_points: lesson.xp_points || 0,
        reward_points: lesson.reward_points || 0,
        is_preview: lesson.is_preview || false,
        is_locked: lesson.is_locked || false,
        order_number: lesson.order_number || 1,
        thumbnail: null,
      });
      setShowLessonModal(true);
    }
  };

  const handleLessonInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setLessonFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const handleUpdateLessonSubmit = async () => {
    if (!lessonFormData.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please enter lesson title' });
      return;
    }
    setIsLoading(true);
    const result = await updateLessonAdmin(lessonId, lessonFormData, token);
    if (result.success) {
      Swal.fire({ icon: 'success', title: 'Success', text: 'Lesson updated successfully' });
      setShowLessonModal(false);
      await fetchContent();
    } else {
      Swal.fire({ icon: 'error', title: 'Failed to Update Lesson', text: result.message });
    }
    setIsLoading(false);
  };

  const handleDeleteContent = () => {
    Swal.fire({
      title: 'Delete Content',
      text: 'Are you sure you want to delete this content? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Coming Soon', text: 'Delete functionality will be available soon', icon: 'info' });
      }
    });
  };

  const handleDeletePage = async (pageId, pageTitle) => {
    Swal.fire({
      title: 'Delete Lesson Page',
      text: `Are you sure you want to delete "${pageTitle}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const deleteResult = await deleteLessonPage(lessonId, pageId, token);
        if (deleteResult.success) {
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Lesson page has been deleted successfully.' });
          await fetchContent();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Delete',
            text: deleteResult.message || 'An error occurred while deleting the lesson page',
          });
        }
        setIsLoading(false);
      }
    });
  };

  const handleGenerateQuiz = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Generate Lesson Quiz',
      html:
        '<div class="mb-3 text-start">' +
        '  <label class="form-label">Question Count</label>' +
        '  <input id="swal-input-count" type="number" class="form-control" value="10" min="1" max="50">' +
        '</div>' +
        '<div class="mb-3 text-start">' +
        '  <label class="form-label">Difficulty</label>' +
        '  <select id="swal-input-difficulty" class="form-select">' +
        '    <option value="easy">Easy</option>' +
        '    <option value="medium" selected>Medium</option>' +
        '    <option value="hard">Hard</option>' +
        '  </select>' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Generate Now',
      confirmButtonColor: '#6C63FF',
      preConfirm: () => {
        return {
          question_count: document.getElementById('swal-input-count').value,
          difficulty: document.getElementById('swal-input-difficulty').value
        }
      }
    });

    if (formValues) {
      setIsLoading(true);
      const result = await generateLessonQuiz(lessonId, formValues, token);
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Quiz Generated!',
          text: result.message || 'The quiz has been successfully generated for this lesson.',
          timer: 3000,
          showConfirmButton: false
        });
        await fetchContent();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Generation Failed',
          text: result.message || 'An error occurred while generating the quiz.'
        });
      }
      setIsLoading(false);
    }
  };

  const handleEditQuiz = async (q) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Quiz Question',
      width: '80%',
      html: `
        <div class="container-fluid text-start">
          <div class="row">
            <div class="col-md-4 border-end">
              <h6 class="fw-bold text-primary mb-3">English (EN)</h6>
              <div class="mb-2">
                <label class="small fw-bold">Question</label>
                <textarea id="edit-q-en" class="form-control form-control-sm" rows="2">${q.translations?.en?.question || q.question}</textarea>
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option A</label>
                <input id="edit-oa-en" class="form-control form-control-sm" value="${q.translations?.en?.option_a || q.options.a}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option B</label>
                <input id="edit-ob-en" class="form-control form-control-sm" value="${q.translations?.en?.option_b || q.options.b}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option C</label>
                <input id="edit-oc-en" class="form-control form-control-sm" value="${q.translations?.en?.option_c || q.options.c}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option D</label>
                <input id="edit-od-en" class="form-control form-control-sm" value="${q.translations?.en?.option_d || q.options.d}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Explanation</label>
                <textarea id="edit-ex-en" class="form-control form-control-sm" rows="2">${q.translations?.en?.explanation || q.explanation}</textarea>
              </div>
            </div>
            <div class="col-md-4 border-end">
              <h6 class="fw-bold text-info mb-3">French (FR)</h6>
              <div class="mb-2">
                <label class="small fw-bold">Question</label>
                <textarea id="edit-q-fr" class="form-control form-control-sm" rows="2">${q.translations?.fr?.question || ''}</textarea>
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option A</label>
                <input id="edit-oa-fr" class="form-control form-control-sm" value="${q.translations?.fr?.option_a || ''}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option B</label>
                <input id="edit-ob-fr" class="form-control form-control-sm" value="${q.translations?.fr?.option_b || ''}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option C</label>
                <input id="edit-oc-fr" class="form-control form-control-sm" value="${q.translations?.fr?.option_c || ''}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option D</label>
                <input id="edit-od-fr" class="form-control form-control-sm" value="${q.translations?.fr?.option_d || ''}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Explanation</label>
                <textarea id="edit-ex-fr" class="form-control form-control-sm" rows="2">${q.translations?.fr?.explanation || ''}</textarea>
              </div>
            </div>
            <div class="col-md-4">
              <h6 class="fw-bold text-warning mb-3">Spanish (ES)</h6>
              <div class="mb-2">
                <label class="small fw-bold">Question</label>
                <textarea id="edit-q-es" class="form-control form-control-sm" rows="2">${q.translations?.es?.question || ''}</textarea>
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option A</label>
                <input id="edit-oa-es" class="form-control form-control-sm" value="${q.translations?.es?.option_a || ''}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option B</label>
                <input id="edit-ob-es" class="form-control form-control-sm" value="${q.translations?.es?.option_b || ''}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option C</label>
                <input id="edit-oc-es" class="form-control form-control-sm" value="${q.translations?.es?.option_c || ''}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Option D</label>
                <input id="edit-od-es" class="form-control form-control-sm" value="${q.translations?.es?.option_d || ''}">
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Explanation</label>
                <textarea id="edit-ex-es" class="form-control form-control-sm" rows="2">${q.translations?.es?.explanation || ''}</textarea>
              </div>
            </div>
          </div>
          <hr/>
          <div class="row">
            <div class="col-md-6">
              <div class="mb-2">
                <label class="small fw-bold">Correct Answer</label>
                <select id="edit-correct" class="form-select form-select-sm">
                  <option value="a" ${q.correct_answer === 'a' ? 'selected' : ''}>Option A</option>
                  <option value="b" ${q.correct_answer === 'b' ? 'selected' : ''}>Option B</option>
                  <option value="c" ${q.correct_answer === 'c' ? 'selected' : ''}>Option C</option>
                  <option value="d" ${q.correct_answer === 'd' ? 'selected' : ''}>Option D</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-2">
                <label class="small fw-bold">Points</label>
                <input id="edit-points" type="number" class="form-control form-control-sm" value="${q.points || 10}">
              </div>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Question',
      confirmButtonColor: '#6C63FF',
      preConfirm: () => {
        return {
          question_en: document.getElementById('edit-q-en').value,
          option_a_en: document.getElementById('edit-oa-en').value,
          option_b_en: document.getElementById('edit-ob-en').value,
          option_c_en: document.getElementById('edit-oc-en').value,
          option_d_en: document.getElementById('edit-od-en').value,
          explanation_en: document.getElementById('edit-ex-en').value,
          
          question_fr: document.getElementById('edit-q-fr').value,
          option_a_fr: document.getElementById('edit-oa-fr').value,
          option_b_fr: document.getElementById('edit-ob-fr').value,
          option_c_fr: document.getElementById('edit-oc-fr').value,
          option_d_fr: document.getElementById('edit-od-fr').value,
          explanation_fr: document.getElementById('edit-ex-fr').value,
          
          question_es: document.getElementById('edit-q-es').value,
          option_a_es: document.getElementById('edit-oa-es').value,
          option_b_es: document.getElementById('edit-ob-es').value,
          option_c_es: document.getElementById('edit-oc-es').value,
          option_d_es: document.getElementById('edit-od-es').value,
          explanation_es: document.getElementById('edit-ex-es').value,
          
          correct_answer: document.getElementById('edit-correct').value,
          points: document.getElementById('edit-points').value,
        }
      }
    });

    if (formValues) {
      setIsLoading(true);
      const result = await updateLessonQuiz(q.id, formValues, token);
      if (result.success) {
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Quiz question updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchContent();
      } else {
        Swal.fire({ icon: 'error', title: 'Update Failed', text: result.message });
      }
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    Swal.fire({
      title: 'Delete Question?',
      text: 'Are you sure you want to delete this quiz question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const res = await deleteLessonQuiz(quizId, token);
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Question has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchContent();
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: res.message });
        }
        setIsLoading(false);
      }
    });
  };

  const renderContent = () => {
    if (!content) return null;
    switch (content.content_type?.toLowerCase()) {
      case 'video':
        return content.video_url ? (
          <div className="ratio ratio-16x9">
            <video controls className="w-100">
              <source src={content.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : null;
      case 'audio':
        return content.video_url ? (
          <div className="mb-3">
            <audio controls className="w-100">
              <source src={content.video_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : null;
      case 'text':
        return null;
      case 'pdf':
      case 'doc':
        return content.file_url ? (
          <div className="d-flex align-items-center gap-3">
            <i className={`fas ${content.content_type?.toLowerCase() === 'pdf' ? 'fa-file-pdf' : 'fa-file-word'} fa-3x text-danger`}></i>
            <div>
              <p className="mb-2"><strong>{content.title}</strong></p>
              {content.file_size && <p className="text-muted mb-2">Size: {content.file_size}</p>}
              <a href={content.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                <i className="fas fa-download me-2"></i>Download
              </a>
            </div>
          </div>
        ) : null;
      default:
        return <p className="text-muted">Content preview not available</p>;
    }
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
                <h5>{lesson?.title || content?.title || 'Lesson Content'}</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    {!content && (
                      <button className="btn btn-primary" onClick={() => setShowContentModal(true)}>
                        <i className="fa fa-plus me-2"></i>Add Content
                      </button>
                    )}
                  </li>
                  <li>
                    {content && content.content_type !== 'video' && (
                      <button
                        className="btn btn-success"
                        onClick={() => navigate(`/courses/admin/lesson/${lessonId}/page/add`)}
                      >
                        <i className="fa fa-file-alt me-2"></i>Add More Content
                      </button>
                    )}
                  </li>
                  <li>
                    <button className="btn btn-info text-white" onClick={handleGenerateQuiz}>
                      <i className="fa fa-magic me-2"></i>Generate Quiz
                    </button>
                  </li>
                  <li>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>
                      <i className="fa fa-arrow-left me-2"></i>Back
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {isLoading ? (
            <GlobalLoader visible={true} size="medium" />
          ) : lesson ? (
            <div className="row">
              <div className="col-lg-8">
                <div className="card border-0 shadow-soft">
                  <div className="card-body p-4">
                    <div className="mb-4">{renderContent()}</div>

                    {lesson?.content?.pages && lesson.content.pages.length > 0 && (
                      <div className="mt-4 pt-4 border-top">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold mb-0">
                            <i className="fa fa-file-alt me-2"></i>Lesson Pages ({lesson.content.pages.length})
                          </h6>
                        </div>

                        <div className="row">
                          {lesson.content.pages.slice(0, 6).map((page) => (
                            <div key={page.id} className="col-md-6 mb-3" style={{ display: 'flex' }}>
                              <div style={{
                                background: '#fff', borderRadius: '20px', padding: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex',
                                flexDirection: 'column', width: '100%', border: '1px solid #f0f0f0',
                                boxSizing: 'border-box', overflow: 'hidden',
                              }}>
                                <div className="d-flex justify-content-between align-items-start mb-2" style={{ gap: '8px' }}>
                                  <h6 style={{ fontWeight: '700', fontSize: '14px', margin: 0, wordBreak: 'break-word', flex: 1 }}>
                                    {page.title}
                                  </h6>
                                  <span style={{
                                    background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
                                    color: '#fff', borderRadius: '20px', padding: '2px 10px',
                                    fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
                                  }}>Page {page.page_number}</span>
                                </div>

                                {/* ✅ FIXED: unescapeHTML lagaya — properly render hoga */}
                                <div style={{ flex: 1 }}>
                                  {page.html_content && (
                                    <div className="mb-2">
                                      <small style={{ color: '#999', display: 'block', marginBottom: '4px' }}>Content Preview:</small>
                                      <div
                                        style={{
                                          color: '#555', fontSize: '12px', maxHeight: '70px',
                                          overflow: 'hidden', pointerEvents: 'none', lineHeight: '1.5',
                                          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                                          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: unescapeHTML(page.html_content) }}
                                      />
                                    </div>
                                  )}
                                  {page.image && (
                                    <div className="mb-2">
                                      <img src={page.image} alt="Page image"
                                        style={{ maxHeight: '60px', width: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                                    </div>
                                  )}
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => { setViewingPage(page); setShowViewModal(true); }}
                                    style={{
                                      flex: '1 1 70px', minWidth: '70px', padding: '8px 6px', borderRadius: '10px',
                                      border: 'none', background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
                                      color: '#fff', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                    }}
                                  >
                                    <i className="fa fa-eye"></i> View
                                  </button>
                                  <button
                                    onClick={() => navigate(`/courses/admin/lesson/${lessonId}/page/${page.id}/edit`)}
                                    style={{
                                      flex: '1 1 70px', minWidth: '70px', padding: '8px 6px', borderRadius: '10px',
                                      border: 'none', background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                                      color: '#fff', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                    }}
                                  >
                                    <i className="fa fa-edit"></i> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeletePage(page.id, page.title)}
                                    style={{
                                      flex: '1 1 70px', minWidth: '70px', padding: '8px 6px', borderRadius: '10px',
                                      border: 'none', background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                      color: '#fff', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                    }}
                                  >
                                    <i className="fa fa-trash"></i> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {lesson.content.pages.length > 6 && (
                          <div className="text-center mt-3">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => navigate(`/courses/admin/lesson/${lessonId}/pages`)}
                            >
                              <i className="fa fa-arrow-right me-2"></i>View All {lesson.content.pages.length} Pages
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {quiz && quiz.length > 0 && (
                      <div className="mt-5 pt-4 border-top">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h6 className="fw-bold mb-0 text-primary">
                            <i className="fas fa-question-circle me-2"></i>Lesson Quiz ({quiz.length} Questions)
                          </h6>
                        </div>

                        <div className="accordion accordion-flush custom-accordion" id="quizAccordion">
                          {quiz.map((q, index) => (
                            <div key={q.id} className="accordion-item border rounded-3 mb-3 overflow-hidden shadow-sm">
                              <h2 className="accordion-header d-flex align-items-center">
                                <button 
                                  className="accordion-button collapsed px-4 py-3 fw-semibold flex-grow-1" 
                                  type="button" 
                                  data-bs-toggle="collapse" 
                                  data-bs-target={`#collapse${q.id}`}
                                >
                                  <span className="me-3 text-muted">Q{index + 1}.</span>
                                  {q.question}
                                </button>
                                <div className="px-3 d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-warning border-0" 
                                    onClick={(e) => { e.stopPropagation(); handleEditQuiz(q); }}
                                    title="Edit Question"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger border-0" 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(q.id); }}
                                    title="Delete Question"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </h2>
                              <div id={`collapse${q.id}`} className="accordion-collapse collapse" data-bs-parent="#quizAccordion">
                                <div className="accordion-body p-4 bg-light">
                                  <div className="row">
                                    <div className="col-md-7">
                                      <h6 className="small fw-bold text-muted text-uppercase mb-3">Options</h6>
                                      <div className="d-grid gap-2 mb-4">
                                        {Object.entries(q.options).map(([key, val]) => (
                                          <div key={key} className={`p-3 rounded-3 border ${q.correct_answer === key ? 'bg-success-subtle border-success text-success fw-bold' : 'bg-white border-light-subtle'}`}>
                                            <span className="me-2 text-uppercase">{key}:</span> {val}
                                            {q.correct_answer === key && <i className="fas fa-check-circle float-end mt-1"></i>}
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <h6 className="small fw-bold text-muted text-uppercase mb-2">Explanation</h6>
                                      <div className="p-3 rounded-3 bg-white border border-light-subtle small italic">
                                        {q.explanation || 'No explanation provided.'}
                                      </div>
                                    </div>
                                    
                                    <div className="col-md-5 border-start">
                                      <h6 className="small fw-bold text-muted text-uppercase mb-3 ps-3">Translations</h6>
                                      <div className="ps-3">
                                        <ul className="nav nav-pills nav-pills-sm mb-3" id={`pills-tab-${q.id}`} role="tablist">
                                          <li className="nav-item" role="presentation">
                                            <button className="nav-link active py-1 px-3" data-bs-toggle="pill" data-bs-target={`#en-${q.id}`} type="button">EN</button>
                                          </li>
                                          <li className="nav-item" role="presentation">
                                            <button className="nav-link py-1 px-3" data-bs-toggle="pill" data-bs-target={`#fr-${q.id}`} type="button">FR</button>
                                          </li>
                                          <li className="nav-item" role="presentation">
                                            <button className="nav-link py-1 px-3" data-bs-toggle="pill" data-bs-target={`#es-${q.id}`} type="button">ES</button>
                                          </li>
                                        </ul>
                                        <div className="tab-content small" id={`pills-tabContent-${q.id}`}>
                                          {['en', 'fr', 'es'].map(lang => (
                                            <div key={lang} className={`tab-content tab-pane fade ${lang === 'en' ? 'show active' : ''}`} id={`${lang}-${q.id}`}>
                                              <p className="mb-2"><strong>Q:</strong> {q.translations?.[lang]?.question || 'N/A'}</p>
                                              <p className="mb-2"><strong>Exp:</strong> {q.translations?.[lang]?.explanation || 'N/A'}</p>
                                              <div className="mt-2 text-muted">
                                                <div className="d-flex justify-content-between mb-1"><span>A: {q.translations?.[lang]?.option_a || 'N/A'}</span></div>
                                                <div className="d-flex justify-content-between mb-1"><span>B: {q.translations?.[lang]?.option_b || 'N/A'}</span></div>
                                                <div className="d-flex justify-content-between mb-1"><span>C: {q.translations?.[lang]?.option_c || 'N/A'}</span></div>
                                                <div className="d-flex justify-content-between mb-1"><span>D: {q.translations?.[lang]?.option_d || 'N/A'}</span></div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card border-0 shadow-soft">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Lesson Details</h6>
                    {lesson.description && (
                      <div className="mb-3">
                        <label className="text-muted small">Description</label>
                        <p className="mb-0 small">{lesson.description}</p>
                      </div>
                    )}
                    {lesson.duration && (
                      <div className="mb-3">
                        <label className="text-muted small">Lesson Duration</label>
                        <p className="mb-0 fw-bold">{lesson.duration}</p>
                      </div>
                    )}
                    {lesson.xp_points && (
                      <div className="mb-3">
                        <label className="text-muted small">XP Points</label>
                        <p className="mb-0 fw-bold">{lesson.xp_points}</p>
                      </div>
                    )}
                    {lesson.reward_points && (
                      <div className="mb-3">
                        <label className="text-muted small">Reward Points</label>
                        <p className="mb-0 fw-bold">{lesson.reward_points}</p>
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="text-muted small">Preview Available</label>
                      <p className="mb-0">
                        <span className={`badge ${lesson.is_preview ? 'bg-success' : 'bg-secondary'}`}>
                          {lesson.is_preview ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small">Locked Status</label>
                      <p className="mb-0">
                        <span className={`badge ${lesson.is_locked ? 'bg-warning' : 'bg-success'}`}>
                          {lesson.is_locked ? 'Locked' : 'Unlocked'}
                        </span>
                      </p>
                    </div>
                    {lesson.order_number && (
                      <div className="mb-3">
                        <label className="text-muted small">Order</label>
                        <p className="mb-0 fw-bold">#{lesson.order_number}</p>
                      </div>
                    )}
                    <hr className="my-3" />
                    <h6 className="fw-bold mb-3">Content Details</h6>
                    <div className="mb-3">
                      <label className="text-muted small">Content Type</label>
                      <p className="mb-0">
                        <span className={`badge ${getContentTypeBadge(content.content_type)}`}>
                          {content.content_type?.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    {content.duration && (
                      <div className="mb-3">
                        <label className="text-muted small">Duration</label>
                        <p className="mb-0 fw-bold">{content.duration}</p>
                      </div>
                    )}
                    {content.file_size && (
                      <div className="mb-3">
                        <label className="text-muted small">File Size</label>
                        <p className="mb-0 fw-bold">{content.file_size}</p>
                      </div>
                    )}
                    {content.order_number && (
                      <div className="mb-3">
                        <label className="text-muted small">Order</label>
                        <p className="mb-0 fw-bold">#{content.order_number}</p>
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="text-muted small">Downloadable</label>
                      <p className="mb-0">
                        <span className={`badge ${content.is_downloadable ? 'bg-success' : 'bg-secondary'}`}>
                          {content.is_downloadable ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>
                    {lesson?.content?.pages && lesson.content.pages.length > 0 && (
                      <div className="mb-3">
                        <label className="text-muted small">Pages</label>
                        <p className="mb-0">
                          <span className="badge bg-info">{lesson.content.pages.length} Pages</span>
                        </p>
                        <div className="mt-2">
                          {lesson.content.pages.slice(0, 3).map((page) => (
                            <small key={page.id} className="d-block text-muted">
                              Page {page.page_number}: {page.title}
                            </small>
                          ))}
                          {lesson.content.pages.length > 3 && (
                            <small className="text-muted">...and {lesson.content.pages.length - 3} more</small>
                          )}
                        </div>
                      </div>
                    )}
                    {content.created_at && (
                      <div className="mb-3 pt-3 border-top">
                        <label className="text-muted small">Created</label>
                        <p className="mb-0 small">
                          {new Date(content.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0">
              <div className="card-body p-5 text-center">
                <p className="text-muted">No content available for this lesson</p>
              </div>
            </div>
          )}

          {/* ✅ View Page Modal — unescapeHTML se properly render hoga */}
          {showViewModal && viewingPage && (
            <div
              className="modal fade show d-block"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 }}
              onClick={(e) => { if (e.target === e.currentTarget) { setShowViewModal(false); setViewingPage(null); } }}
            >
              <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
                    color: '#fff', border: 'none', padding: '16px 24px',
                  }}>
                    <div>
                      <h5 className="modal-title mb-0 fw-bold">{viewingPage.title}</h5>
                      <small style={{ opacity: 0.85 }}>Page {viewingPage.page_number}</small>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowViewModal(false); setViewingPage(null); }}
                      style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                        width: '32px', height: '32px', color: '#fff', fontSize: '16px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                  </div>

                  <div className="modal-body p-4">
                    {/* ✅ unescapeHTML — &lt;h2&gt; → <h2> → properly render hoga */}
                    {viewingPage.html_content && (
                      <div
                        style={{ lineHeight: '1.8', color: '#333', fontSize: '15px' }}
                        dangerouslySetInnerHTML={{ __html: unescapeHTML(viewingPage.html_content) }}
                      />
                    )}
                    {viewingPage.image && (
                      <div className="mt-3">
                        <img src={viewingPage.image} alt="Page image"
                          style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }} />
                      </div>
                    )}
                    {!viewingPage.html_content && !viewingPage.image && (
                      <p className="text-muted text-center py-4">No content available for this page.</p>
                    )}
                  </div>

                  <div className="modal-footer border-0 pt-0 pb-3 px-4">
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => {
                        setShowViewModal(false);
                        navigate(`/courses/admin/lesson/${lessonId}/page/${viewingPage.id}/edit`);
                      }}
                    >
                      <i className="fa fa-edit me-2"></i>Edit This Page
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => { setShowViewModal(false); setViewingPage(null); }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Modal */}
          {showContentModal && (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{content ? 'Update Content' : 'Add Content'}</h5>
                    <button type="button" className="btn-close" onClick={() => setShowContentModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label">Content Title <span className="text-danger">*</span></label>
                          <input type="text" className="form-control" name="title"
                            value={contentFormData.title} onChange={handleInputChange} placeholder="Enter content title" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Content Type <span className="text-danger">*</span></label>
                          <select className="form-select" name="content_type"
                            value={contentFormData.content_type} onChange={handleInputChange}>
                            <option value="text">Text</option>
                            <option value="video">Video</option>
                            <option value="audio">Audio</option>
                            <option value="pdf">PDF</option>
                            <option value="doc">Document</option>
                          </select>
                        </div>
                        {contentFormData.content_type === 'text' && (
                          <div className="mb-3">
                            <label className="form-label">Text Content</label>
                            <textarea className="form-control" name="text_content" rows="4"
                              value={contentFormData.text_content} onChange={handleInputChange}
                              placeholder="Enter text content"></textarea>
                          </div>
                        )}
                        {(contentFormData.content_type === 'video' || contentFormData.content_type === 'audio' ||
                          contentFormData.content_type === 'pdf' || contentFormData.content_type === 'doc') && (
                          <div className="mb-3">
                            <label className="form-label">Media File</label>
                            <input type="file" className="form-control" name="media" onChange={handleInputChange}
                              accept={
                                contentFormData.content_type === 'video' ? 'video/*' :
                                contentFormData.content_type === 'audio' ? 'audio/*' :
                                contentFormData.content_type === 'pdf' ? '.pdf' : '.doc,.docx'
                              } />
                          </div>
                        )}
                        <div className="mb-3">
                          <label className="form-label">Duration</label>
                          <input type="text" className="form-control" name="duration"
                            value={contentFormData.duration} onChange={handleInputChange} placeholder="e.g., 10:30" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">File Size</label>
                          <input type="text" className="form-control" name="file_size"
                            value={contentFormData.file_size} onChange={handleInputChange} placeholder="e.g., 150MB" />
                        </div>
                        <div className="mb-3">
                          <label className="form-check-label">
                            <input type="checkbox" className="form-check-input" name="is_downloadable"
                              checked={contentFormData.is_downloadable} onChange={handleInputChange} />
                            {' '}Downloadable
                          </label>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Order Number</label>
                          <input type="number" className="form-control" name="order_number"
                            value={contentFormData.order_number} onChange={handleInputChange} min="1" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowContentModal(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleAddContent} disabled={isLoading}>
                      {isLoading ? 'Processing...' : (content ? 'Update' : 'Add')} Content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Update Modal */}
          {showLessonModal && (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Update Lesson</h5>
                    <button type="button" className="btn-close" onClick={() => setShowLessonModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label">Lesson Title <span className="text-danger">*</span></label>
                          <input type="text" className="form-control" name="title"
                            value={lessonFormData.title} onChange={handleLessonInputChange} placeholder="Enter lesson title" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea className="form-control" name="description" rows="4"
                            value={lessonFormData.description} onChange={handleLessonInputChange}
                            placeholder="Enter lesson description"></textarea>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Lesson Number</label>
                              <input type="number" className="form-control" name="lesson_number"
                                value={lessonFormData.lesson_number} onChange={handleLessonInputChange} min="0" />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Duration</label>
                              <input type="text" className="form-control" name="duration"
                                value={lessonFormData.duration} onChange={handleLessonInputChange} placeholder="e.g., 20 minutes" />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">XP Points</label>
                              <input type="number" className="form-control" name="xp_points"
                                value={lessonFormData.xp_points} onChange={handleLessonInputChange} min="0" />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Reward Points</label>
                              <input type="number" className="form-control" name="reward_points"
                                value={lessonFormData.reward_points} onChange={handleLessonInputChange} min="0" />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Order Number</label>
                              <input type="number" className="form-control" name="order_number"
                                value={lessonFormData.order_number} onChange={handleLessonInputChange} min="1" />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Thumbnail</label>
                              <input type="file" className="form-control" name="thumbnail"
                                onChange={handleLessonInputChange} accept="image/*" />
                              {lesson?.thumbnail && (
                                <small className="text-muted d-block mt-2">
                                  Current: <a href={lesson.thumbnail} target="_blank" rel="noopener noreferrer">View thumbnail</a>
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-check-label">
                                <input type="checkbox" className="form-check-input" name="is_preview"
                                  checked={lessonFormData.is_preview} onChange={handleLessonInputChange} />
                                {' '}Preview Available
                              </label>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-check-label">
                                <input type="checkbox" className="form-check-input" name="is_locked"
                                  checked={lessonFormData.is_locked} onChange={handleLessonInputChange} />
                                {' '}Locked
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowLessonModal(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleUpdateLessonSubmit} disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Lesson'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}