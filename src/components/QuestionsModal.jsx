import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { editQuizQuestions, uploadQuestionImage, deleteQuestionImage } from '../api/quizzes';

// ── Question Image Cell ───────────────────────────────────────────────────────
function QuestionImageCell({ quizId, question, questionIndex }) {
  const inputRef = useRef(null);
  const [preview, setPreview]       = useState(question.question_image || null);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const questionId = question.question_id || question.id;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    const result = await uploadQuestionImage(quizId, questionId, pendingFile);
    setUploading(false);
    if (result.success) {
      const newUrl = result.data?.image_url || result.data?.question_image || preview;
      setPreview(newUrl);
      setPendingFile(null);
      if (inputRef.current) inputRef.current.value = '';
      Swal.fire({ icon: 'success', title: 'Image Uploaded', text: `Q${questionIndex + 1} image saved!`, timer: 1400, showConfirmButton: false, timerProgressBar: true });
    } else {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: result.error || 'Could not upload image.' });
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'Delete Image?',
      text: `Remove image from Question ${questionIndex + 1}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#dc3545',
      cancelButtonText: 'Cancel',
    });
    if (!confirm.isConfirmed) return;

    setDeleting(true);
    const result = await deleteQuestionImage(quizId, questionId);
    setDeleting(false);

    if (result.success) {
      setPreview(null);
      setPendingFile(null);
      if (inputRef.current) inputRef.current.value = '';
      Swal.fire({ icon: 'success', title: 'Image Deleted', text: `Q${questionIndex + 1} image removed.`, timer: 1400, showConfirmButton: false, timerProgressBar: true });
    } else {
      Swal.fire({ icon: 'error', title: 'Delete Failed', text: result.error || 'Could not delete image.' });
    }
  };

  const handleCancelPending = () => {
    setPendingFile(null);
    setPreview(question.question_image || null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="p-3 rounded mb-3" style={{ background: '#f8f9ff', border: '1px solid #e8eaf6' }}>
      <div className="d-flex align-items-center gap-2 mb-2">
        <span>🖼️</span>
        <span className="fw-semibold" style={{ fontSize: '0.88rem' }}>Question Image</span>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>(optional)</span>
      </div>

      <div className="d-flex align-items-center gap-3 flex-wrap">
        <div style={{
          width: 72, height: 72, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
          border: preview ? '2px solid #6c63ff' : '2px dashed #ced4da',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {preview
            ? <img src={preview} alt={`Q${questionIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 26, color: '#c0c0c0' }}>🖼</span>
          }
        </div>

        <div className="d-flex flex-column gap-2">
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
            id={`q-img-${questionId}`} onChange={handleFileSelect} />

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <label htmlFor={`q-img-${questionId}`} className="btn btn-sm mb-0"
              style={{ background: '#6c63ff', color: '#fff', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', padding: '5px 14px' }}>
              <i className="fa fa-upload me-1" />
              {preview && !pendingFile ? 'Change' : 'Upload'}
            </label>

            {pendingFile && (
              <span className="text-muted" style={{ fontSize: '0.78rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pendingFile.name}
              </span>
            )}

            {!preview && !pendingFile && (
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>No image</span>
            )}

            {pendingFile && (
              <button type="button" className="btn btn-sm btn-success"
                style={{ fontSize: '0.8rem', padding: '5px 14px', borderRadius: 6 }}
                onClick={handleUpload} disabled={uploading}>
                {uploading
                  ? <span className="spinner-border spinner-border-sm" role="status" />
                  : <><i className="fa fa-save me-1" />Save</>}
              </button>
            )}

            {pendingFile && !uploading && (
              <button type="button" className="btn btn-sm btn-outline-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 6 }}
                onClick={handleCancelPending}>✕
              </button>
            )}

            {preview && !pendingFile && (
              <button type="button" className="btn btn-sm btn-outline-danger"
                style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: 6 }}
                onClick={handleDelete} disabled={deleting}
                title="Delete question image">
                {deleting
                  ? <span className="spinner-border spinner-border-sm" role="status" />
                  : <><i className="fa fa-trash me-1" />Delete</>}
              </button>
            )}
          </div>

          {preview && !pendingFile && (
            <span className="text-success" style={{ fontSize: '0.75rem' }}>
              <i className="fa fa-check-circle me-1" />Image set
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function QuestionsModal({ show, quizData, onClose, isLoading, onQuestionsUpdated }) {
  const [currentPage, setCurrentPage]       = useState(1);
  const [isEditing, setIsEditing]           = useState(false);
  const [editingQuestions, setEditingQuestions] = useState([]);
  const [isSaving, setIsSaving]             = useState(false);
  const [activeLang, setActiveLang]         = useState('en');
  const itemsPerPage = 5;

  useEffect(() => {
    if (show) {
      setCurrentPage(1);
      setIsEditing(false);
      setActiveLang('en');
      // Deep clone to avoid mutation
      const clonedQuestions = JSON.parse(JSON.stringify(quizData?.questions || []));
      // Ensure translations structure exists for each question
      clonedQuestions.forEach(q => {
        if (!q.translations) q.translations = { en: { question: q.question, options: [...(q.options || [])] } };
        if (!q.translations.en) q.translations.en = { question: q.question, options: [...(q.options || [])] };
        if (!q.translations.es) q.translations.es = { question: '', options: Array(q.options?.length || 4).fill('') };
        if (!q.translations.fr) q.translations.fr = { question: '', options: Array(q.options?.length || 4).fill('') };
      });
      setEditingQuestions(clonedQuestions);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [show, quizData]);

  if (!show || !quizData) return null;

  const questions        = isEditing ? editingQuestions : (quizData.questions || []);
  const totalPages       = Math.ceil(questions.length / itemsPerPage);
  const startIndex       = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = questions.slice(startIndex, startIndex + itemsPerPage);

  const handleEditToggle = () => {
    if (isEditing) setEditingQuestions(JSON.parse(JSON.stringify(quizData.questions || [])));
    setIsEditing(!isEditing);
    setCurrentPage(1);
  };

  const handleQuestionChange = (index, field, value, lang = 'en') => {
    const updated = [...editingQuestions];
    const q = updated[index];

    if (field === 'correct_answer') {
      q.correct_answer = parseInt(value);
    } else if (field === 'question') {
      if (lang === 'en') q.question = value;
      q.translations[lang].question = value;
    } else if (field.startsWith('option_')) {
      const optIdx = parseInt(field.split('_')[1]);
      if (lang === 'en') q.options[optIdx] = value;
      q.translations[lang].options[optIdx] = value;
    }
    
    setEditingQuestions(updated);
  };

  const handleSaveQuestions = async () => {
    if (!quizData?.quiz_id) { Swal.fire({ icon: 'error', title: 'Error', text: 'Quiz ID missing' }); return; }
    if (!editingQuestions?.length) { Swal.fire({ icon: 'error', title: 'Error', text: 'No questions to save' }); return; }
    
    setIsSaving(true);
    // The API expects translations to be handled.
    const result = await editQuizQuestions(quizData.quiz_id, editingQuestions);
    setIsSaving(false);
    
    if (result.success) {
      await Swal.fire({ icon: 'success', title: 'Questions Updated', timer: 2000, timerProgressBar: true, showConfirmButton: false });
      setIsEditing(false);
      if (onQuestionsUpdated) onQuestionsUpdated(editingQuestions);
    } else {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: result.error || 'Failed to update quiz questions' });
    }
  };

  return (
    <div className="modal" onClick={onClose}
      style={{ display: show ? 'block' : 'none', position: 'fixed', top: 0, left: 0, zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%' }}>

      <div className="modal-dialog modal-lg" style={{ position: 'relative', margin: '1.75rem auto', maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>

          <div className="modal-header d-flex align-items-center bg-light" style={{ borderRadius: '15px 15px 0 0' }}>
            <h5 className="modal-title fw-bold">{quizData.title} – Questions</h5>

            <div className="d-flex gap-2 ms-auto align-items-center">
              {isEditing && (
                <div className="btn-group btn-group-sm me-3" role="group">
                  <button type="button" className={`btn ${activeLang === 'en' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveLang('en')}>EN</button>
                  <button type="button" className={`btn ${activeLang === 'es' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveLang('es')}>ES</button>
                  <button type="button" className={`btn ${activeLang === 'fr' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveLang('fr')}>FR</button>
                </div>
              )}
              
              <button
                type="button"
                className={`btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleEditToggle}
                disabled={isSaving}
              >
                {isEditing
                  ? <><i className="fas fa-times me-1" />Cancel</>
                  : <><i className="fas fa-edit me-1" />Edit Mode</>}
              </button>

              {isEditing && (
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={handleSaveQuestions}
                  disabled={isSaving}
                >
                  {isSaving
                    ? <><span className="spinner-border spinner-border-sm me-1" role="status" />Saving…</>
                    : <><i className="fas fa-save me-1" />Save Changes</>}
                </button>
              )}

              <button type="button" className="btn-close ms-2" onClick={onClose} aria-label="Close" />
            </div>
          </div>

          <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto', background: '#fbfbfb' }}>
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-5"><p className="text-muted">No questions available</p></div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                    Showing <span className="fw-bold">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, questions.length)}</span> of <span className="fw-bold">{questions.length}</span> questions
                  </p>
                  {!isEditing && (
                     <div className="btn-group btn-group-sm" role="group">
                        <button type="button" className={`btn ${activeLang === 'en' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('en')}>EN</button>
                        <button type="button" className={`btn ${activeLang === 'es' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('es')}>ES</button>
                        <button type="button" className={`btn ${activeLang === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('fr')}>FR</button>
                     </div>
                  )}
                </div>

                {paginatedQuestions.map((question, index) => {
                  const questionIndex = startIndex + index;
                  const displayData = question.translations?.[activeLang] || { question: question.question, options: question.options };
                  
                  return (
                    <div key={question.id || question.question_id || questionIndex} className="card mb-4 border-0 shadow-sm"
                      style={{ borderRadius: '12px' }}>
                      <div className="card-body p-4">

                        {/* Question Header */}
                        <div className="d-flex align-items-start mb-3">
                          <span className="badge me-3 mt-1"
                            style={{ background: '#6c63ff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                            {questionIndex + 1}
                          </span>
                          <div className="flex-grow-1">
                            {isEditing ? (
                              <div>
                                <label className="form-label small fw-bold text-muted mb-1">Question Text ({activeLang.toUpperCase()})</label>
                                <textarea className="form-control" rows="2" placeholder={`Enter question in ${activeLang}`}
                                  value={displayData.question || ''}
                                  onChange={e => handleQuestionChange(questionIndex, 'question', e.target.value, activeLang)} />
                              </div>
                            ) : (
                              <h6 className="card-title mb-0 fw-bold" style={{ lineHeight: 1.5, color: '#2d3748' }}>
                                {displayData.question || <span className="text-muted italic">No translation for {activeLang}</span>}
                              </h6>
                            )}
                          </div>
                        </div>

                        {/* Image Cell */}
                        <QuestionImageCell
                          quizId={quizData.quiz_id}
                          question={question}
                          questionIndex={questionIndex}
                        />

                        {/* Options Section */}
                        <div className="mt-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <strong className="text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {question.type === 'percentage' ? 'Options (Percentage Range)' : 'Options'}
                            </strong>
                            {isEditing && (
                              <div className="d-flex align-items-center gap-2">
                                <small className="text-muted fw-bold">Correct Answer:</small>
                                <select className="form-select form-select-sm" style={{ width: '80px', borderRadius: '6px' }}
                                  value={question.correct_answer}
                                  onChange={e => handleQuestionChange(questionIndex, 'correct_answer', e.target.value)}>
                                  {question.options?.map((_, i) => (
                                    <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          <div className="row g-3">
                            {(displayData.options || Array(4).fill('')).map((option, optionIndex) => {
                              const isCorrect = optionIndex === question.correct_answer;
                              return (
                                <div key={optionIndex} className="col-md-6">
                                  <div className={`p-3 rounded-3 d-flex align-items-center gap-3 transition-all ${!isEditing && isCorrect ? 'bg-success-light border border-success' : 'bg-white border'}`}
                                    style={{ transition: 'all 0.2s' }}>
                                    <span className={`fw-bold small ${!isEditing && isCorrect ? 'text-success' : 'text-muted'}`} style={{ minWidth: 20 }}>
                                      {String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    
                                    {isEditing ? (
                                      <input type="text" className="form-control form-control-sm border-0 bg-transparent p-0"
                                        value={option || ''}
                                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)} (${activeLang})`}
                                        onChange={e => handleQuestionChange(questionIndex, `option_${optionIndex}`, e.target.value, activeLang)} />
                                    ) : (
                                      <div className="flex-grow-1 small">
                                        {option || <span className="text-muted italic opacity-50">Empty</span>}
                                        {question.type === 'percentage' && option && '%'}
                                        {!isEditing && isCorrect && (
                                          <i className="fas fa-check-circle text-success ms-2"></i>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {question.type === 'percentage' && question.tolerance && (
                            <div className="mt-3 p-2 bg-light rounded small text-muted d-inline-block">
                              <i className="fas fa-info-circle me-1"></i> Tolerance: ±{question.tolerance}%
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="modal-footer bg-light" style={{ borderRadius: '0 0 15px 15px' }}>
            <div className="me-auto d-flex align-items-center gap-3">
              <small className="text-muted">Page <span className="fw-bold">{currentPage}</span> of <span className="fw-bold">{totalPages || 1}</span></small>
              <div className="progress" style={{ width: '100px', height: '4px' }}>
                <div className="progress-bar bg-primary" style={{ width: `${(currentPage / (totalPages || 1)) * 100}%` }}></div>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-sm btn-outline-primary px-3"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}>
                <i className="fas fa-chevron-left me-1" />Previous
              </button>
              <button type="button" className="btn btn-sm btn-outline-primary px-3"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}>
                Next <i className="fas fa-chevron-right ms-1" />
              </button>
              <button type="button" className="btn btn-dark btn-sm px-4 ms-2" onClick={onClose}>Close</button>
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .bg-success-light { background-color: #f0fff4; }
        .border-success { border-color: #68d391 !important; }
        .text-success { color: #38a169 !important; }
        .transition-all { transition: all 0.2s ease-in-out; }
      `}</style>
    </div>
  );
}