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

  /* ── select file ── */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  /* ── upload ── */
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

  /* ── delete ── */
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

  /* ── cancel pending selection ── */
  const handleCancelPending = () => {
    setPendingFile(null);
    setPreview(question.question_image || null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="p-3 rounded mb-3" style={{ background: '#f8f9ff', border: '1px solid #e8eaf6' }}>
      {/* Row label */}
      <div className="d-flex align-items-center gap-2 mb-2">
        <span>🖼️</span>
        <span className="fw-semibold" style={{ fontSize: '0.88rem' }}>Question Image</span>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>(optional)</span>
      </div>

      <div className="d-flex align-items-center gap-3 flex-wrap">
        {/* Thumbnail */}
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

        {/* Controls */}
        <div className="d-flex flex-column gap-2">
          {/* Hidden file input */}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
            id={`q-img-${questionId}`} onChange={handleFileSelect} />

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Upload / Change label-button */}
            <label htmlFor={`q-img-${questionId}`} className="btn btn-sm mb-0"
              style={{ background: '#6c63ff', color: '#fff', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', padding: '5px 14px' }}>
              <i className="fa fa-upload me-1" />
              {preview && !pendingFile ? 'Change' : 'Upload'}
            </label>

            {/* Filename hint */}
            {pendingFile && (
              <span className="text-muted" style={{ fontSize: '0.78rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pendingFile.name}
              </span>
            )}

            {!preview && !pendingFile && (
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>No image</span>
            )}

            {/* Save button */}
            {pendingFile && (
              <button type="button" className="btn btn-sm btn-success"
                style={{ fontSize: '0.8rem', padding: '5px 14px', borderRadius: 6 }}
                onClick={handleUpload} disabled={uploading}>
                {uploading
                  ? <span className="spinner-border spinner-border-sm" role="status" />
                  : <><i className="fa fa-save me-1" />Save</>}
              </button>
            )}

            {/* Cancel pending */}
            {pendingFile && !uploading && (
              <button type="button" className="btn btn-sm btn-outline-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 6 }}
                onClick={handleCancelPending}>✕
              </button>
            )}

            {/* ── DELETE button — only when image already exists and no pending file ── */}
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

          {/* Status */}
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
  const itemsPerPage = 5;

  useEffect(() => {
    if (show) {
      setCurrentPage(1);
      setIsEditing(false);
      setEditingQuestions(JSON.parse(JSON.stringify(quizData?.questions || [])));
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

  const handleQuestionChange = (index, field, value) => {
    const updated = [...editingQuestions];
    if (field === 'question')          updated[index].question = value;
    else if (field === 'correct_answer') updated[index].correct_answer = parseInt(value);
    else if (field.startsWith('option_')) updated[index].options[parseInt(field.split('_')[1])] = value;
    setEditingQuestions(updated);
  };

  const handleSaveQuestions = async () => {
    if (!quizData?.quiz_id) { Swal.fire({ icon: 'error', title: 'Error', text: 'Quiz ID missing' }); return; }
    if (!editingQuestions?.length)     { Swal.fire({ icon: 'error', title: 'Error', text: 'No questions to save' }); return; }
    setIsSaving(true);
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

      <div className="modal-dialog modal-lg" style={{ position: 'relative', margin: '1.75rem auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-content">

      <div className="modal-header d-flex align-items-center">
  <h5 className="modal-title">{quizData.title} – Questions</h5>

  <div className="d-flex gap-2 ms-auto">
    <button
      type="button"
      className={`btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
      onClick={handleEditToggle}
      disabled={isSaving}
    >
      {isEditing
        ? <><i className="fas fa-times me-1" />Cancel</>
        : <><i className="fas fa-edit me-1" />Edit</>}
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
          : <><i className="fas fa-save me-1" />Save</>}
      </button>
    )}

    <button
      type="button"
      className="btn-close"
      onClick={onClose}
      aria-label="Close"
    />
  </div>
</div>

          {/* ── Body ── */}
          <div className="modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {isLoading ? (
              <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
            ) : questions.length === 0 ? (
              <div className="text-center py-5"><p className="text-muted">No questions available</p></div>
            ) : (
              <>
                <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                  Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, questions.length)} of {questions.length} questions
                </p>

                {paginatedQuestions.map((question, index) => {
                  const questionIndex = startIndex + index;
                  return (
                    <div key={question.id || question.question_id || questionIndex} className="card mb-3"
                      style={{ borderRadius: 10, border: '1px solid #e9ecef' }}>
                      <div className="card-body p-3">

                        {/* Question text */}
                        <div className="d-flex align-items-start mb-3">
                          <span className="badge me-2 mt-1"
                            style={{ background: '#6c63ff', minWidth: 24, fontSize: '0.8rem' }}>
                            {questionIndex + 1}
                          </span>
                          <div className="flex-grow-1">
                            {isEditing ? (
                              <textarea className="form-control" rows="2" placeholder="Enter question"
                                value={question.question}
                                onChange={e => handleQuestionChange(questionIndex, 'question', e.target.value)} />
                            ) : (
                              <h6 className="card-title mb-0" style={{ lineHeight: 1.5 }}>{question.question}</h6>
                            )}
                          </div>
                        </div>

                        {/* ── Image cell (upload + delete) ── */}
                        <QuestionImageCell
                          quizId={quizData.quiz_id}
                          question={question}
                          questionIndex={questionIndex}
                        />

                        {/* Options */}
                        <div>
                          <strong className="text-muted d-block mb-2" style={{ fontSize: '0.85rem' }}>
                            {question.type === 'percentage' ? 'Options (Percentage Range):' : 'Options:'}
                            {isEditing && (
                              <span className="ms-2">
                                <small className="text-muted">Correct:</small>
                                <select className="form-select form-select-sm d-inline-block ms-1" style={{ width: 'auto' }}
                                  value={question.correct_answer}
                                  onChange={e => handleQuestionChange(questionIndex, 'correct_answer', e.target.value)}>
                                  {question.options?.map((_, i) => (
                                    <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>
                                  ))}
                                </select>
                              </span>
                            )}
                          </strong>

                          <ul className="list-unstyled mb-0">
                            {question.options?.map((option, optionIndex) => {
                              const isCorrect = optionIndex === question.correct_answer;
                              return (
                                <li key={optionIndex} className="mb-2 p-2 rounded"
                                  style={{
                                    background: !isEditing && isCorrect ? '#d4edda' : '#f8f9fa',
                                    borderLeft: `3px solid ${!isEditing && isCorrect ? '#28a745' : '#adb5bd'}`,
                                  }}>
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="fw-semibold" style={{ minWidth: 20 }}>
                                      {String.fromCharCode(65 + optionIndex)}.
                                    </span>
                                    {isEditing ? (
                                      <input type="text" className="form-control form-control-sm"
                                        value={option}
                                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                        onChange={e => handleQuestionChange(questionIndex, `option_${optionIndex}`, e.target.value)} />
                                    ) : (
                                      <span>
                                        {option}{question.type === 'percentage' && '%'}
                                        {isCorrect && (
                                          <span className="badge ms-2" style={{ background: '#28a745', fontSize: '0.72rem' }}>Correct</span>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>

                          {question.type === 'percentage' && question.tolerance && (
                            <small className="text-muted mt-1 d-block">Tolerance: ±{question.tolerance}%</small>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="modal-footer">
            <small className="text-muted me-auto">Page {currentPage} of {totalPages || 1}</small>
            <button type="button" className="btn btn-sm btn-outline-primary"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}>
              <i className="fas fa-chevron-left me-1" />Previous
            </button>
            <button type="button" className="btn btn-sm btn-outline-primary"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}>
              Next <i className="fas fa-chevron-right ms-1" />
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>

        </div>
      </div>
    </div>
  );
}