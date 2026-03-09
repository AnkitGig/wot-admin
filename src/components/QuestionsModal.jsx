import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { editQuizQuestions } from '../api/quizzes';

export default function QuestionsModal({ show, quizData, onClose, isLoading, onQuestionsUpdated }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestions, setEditingQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    console.log('[v0] QuestionsModal - Show:', show, 'Quiz:', quizData?.quiz_id);
    console.log('[v0] Quiz data:', quizData);
    console.log('[v0] Quiz questions:', quizData?.questions);
    
    if (show) {
      setCurrentPage(1);
      setIsEditing(false);
      
      // Initialize editing questions with proper fallback
      const questionsToEdit = quizData?.questions || [];
      console.log('[v0] Setting editing questions:', questionsToEdit);
      setEditingQuestions(JSON.parse(JSON.stringify(questionsToEdit)));
      
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [show, quizData]);

  if (!show || !quizData) return null;

  const questions = isEditing ? editingQuestions : (quizData.questions || []);
  const totalPages = Math.ceil(questions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = questions.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleClose = () => {
    console.log('[v0] Closing QuestionsModal');
    onClose();
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - restore original questions
      setEditingQuestions(JSON.parse(JSON.stringify(quizData.questions || [])));
    }
    setIsEditing(!isEditing);
    setCurrentPage(1);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...editingQuestions];
    if (field === 'question') {
      updatedQuestions[index].question = value;
    } else if (field === 'correct_answer') {
      updatedQuestions[index].correct_answer = parseInt(value);
    } else if (field.startsWith('option_')) {
      const optionIndex = parseInt(field.split('_')[1]);
      updatedQuestions[index].options[optionIndex] = value;
    }
    setEditingQuestions(updatedQuestions);
  };

  const handleSaveQuestions = async () => {
    setIsSaving(true);
    
    console.log('[v0] Saving questions for quiz:', quizData?.quiz_id);
    console.log('[v0] Editing questions:', editingQuestions);
    
    // Validate quiz data
    if (!quizData?.quiz_id) {
      console.error('[v0] No quiz ID available');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Quiz ID is missing',
      });
      setIsSaving(false);
      return;
    }
    
    // Validate questions data
    if (!editingQuestions || !Array.isArray(editingQuestions) || editingQuestions.length === 0) {
      console.error('[v0] Invalid editing questions data:', editingQuestions);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No questions to save',
      });
      setIsSaving(false);
      return;
    }
    
    const result = await editQuizQuestions(quizData.quiz_id, editingQuestions);
    
    if (result.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Questions Updated',
        text: 'Quiz questions have been updated successfully',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      
      setIsEditing(false);
      if (onQuestionsUpdated) {
        onQuestionsUpdated(editingQuestions);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: result.error || 'Failed to update quiz questions',
      });
    }
    
    setIsSaving(false);
  };

  


  return (
    <>
      <div 
        className="modal"
        style={{ 
          display: show ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1050,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          width: '100%',
          height: '100%'
        }}
        onClick={handleClose}
      >
        <div 
          className="modal-dialog modal-lg"
          style={{ position: 'relative', margin: '1.75rem auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{quizData.title} - Questions</h5>
            <div className="d-flex gap-2">
              <button 
                type="button" 
                className={`btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleEditToggle}
                disabled={isSaving}
              >
                {isEditing ? (
                  <>
                    <i className="fas fa-times me-1"></i>Cancel
                  </>
                ) : (
                  <>
                    <i className="fas fa-edit me-1"></i>Edit
                  </>
                )}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  className="btn btn-sm btn-success"
                  onClick={handleSaveQuestions}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-1"></i>Save
                    </>
                  )}
                </button>
              )}
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
          </div>

          <div className="modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No questions available</p>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <p className="text-muted mb-0">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, questions.length)} of {questions.length} questions
                  </p>
                </div>

                {paginatedQuestions.map((question, index) => {
                  const questionIndex = startIndex + index;
                  return (
                    <div key={question.id || questionIndex} className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex align-items-start mb-3">
                          <span className="badge bg-primary me-2 mt-1">{questionIndex + 1}</span>
                          <div className="flex-grow-1">
                            {isEditing ? (
                              <textarea
                                className="form-control"
                                value={question.question}
                                onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                                rows="2"
                                placeholder="Enter question"
                              />
                            ) : (
                              <h6 className="card-title mb-0">{question.question}</h6>
                            )}
                          </div>
                        </div>

                        <div className="ms-4">
                          <strong className="text-muted d-block mb-2">
                            {question.type === 'percentage' ? 'Options (Percentage Range):' : 'Options:'}
                            {isEditing && (
                              <span className="ms-2">
                                <small className="text-muted">Correct Answer:</small>
                                <select
                                  className="form-select form-select-sm d-inline-block ms-1"
                                  style={{ width: 'auto' }}
                                  value={question.correct_answer}
                                  onChange={(e) => handleQuestionChange(questionIndex, 'correct_answer', e.target.value)}
                                >
                                  {question.options && question.options.map((_, optionIndex) => (
                                    <option key={optionIndex} value={optionIndex}>
                                      {String.fromCharCode(65 + optionIndex)}
                                    </option>
                                  ))}
                                </select>
                              </span>
                            )}
                          </strong>
                          
                          <ul className="list-unstyled">
                            {question.options && question.options.map((option, optionIndex) => (
                              <li 
                                key={optionIndex}
                                className={`mb-2 p-2 rounded ${
                                  !isEditing && optionIndex === question.correct_answer 
                                    ? 'bg-success bg-opacity-10 border-start border-success border-3' 
                                    : 'border-start border-secondary border-3'
                                }`}
                              >
                                <div className="d-flex align-items-center">
                                  <span className="me-2">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      value={option}
                                      onChange={(e) => handleQuestionChange(questionIndex, `option_${optionIndex}`, e.target.value)}
                                      placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                    />
                                  ) : (
                                    <span>
                                      {option}
                                      {question.type === 'percentage' && '%'}
                                      {optionIndex === question.correct_answer && (
                                        <span className="badge bg-success ms-2">Correct</span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                          
                          {question.type === 'percentage' && question.tolerance && (
                            <small className="text-muted">Tolerance: ±{question.tolerance}%</small>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="modal-footer">
            <div className="me-auto">
              <small className="text-muted">
                Page {currentPage} of {totalPages || 1}
              </small>
            </div>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-primary"
              onClick={handlePrevious}
              disabled={currentPage === 1 || isLoading}
            >
              <i className="fas fa-chevron-left me-1"></i>Previous
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-primary"
              onClick={handleNext}
              disabled={currentPage === totalPages || isLoading}
            >
              Next<i className="fas fa-chevron-right ms-1"></i>
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
