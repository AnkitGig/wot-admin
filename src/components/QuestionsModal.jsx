import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { editQuizQuestions, uploadQuestionImage } from "../api/quizzes";

// ─── Per-question image uploader ──────────────────────────────────────────────
function QuestionImageCell({
  quizId,
  questionId,
  existingImageUrl,
  questionIndex,
}) {
  const [preview, setPreview] = useState(existingImageUrl || null);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!pendingFile) setPreview(existingImageUrl || null);
  }, [existingImageUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    const result = await uploadQuestionImage(quizId, questionId, pendingFile);
    setUploading(false);

    if (result.success) {
      setPendingFile(null);
      Swal.fire({
        icon: "success",
        title: "Image Uploaded",
        text: `Q${questionIndex + 1} image saved successfully!`,
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: result.error || "Could not upload image. Please try again.",
      });
    }
  };

  const handleRemovePreview = () => {
    setPendingFile(null);
    setPreview(existingImageUrl || null);
  };

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Thumbnail or placeholder */}
      {preview ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={preview}
            alt={`Q${questionIndex + 1}`}
            style={{
              width: 64,
              height: 64,
              objectFit: "cover",
              borderRadius: 6,
              border: pendingFile ? "2px dashed #0d6efd" : "2px solid #dee2e6",
              cursor: "pointer",
            }}
            onClick={() => inputRef.current?.click()}
            title="Click to change"
          />
          {pendingFile && (
            <button
              type="button"
              onClick={handleRemovePreview}
              style={{
                position: "absolute",
                top: -7,
                right: -7,
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "none",
                background: "#dc3545",
                color: "#fff",
                fontSize: 10,
                lineHeight: "18px",
                textAlign: "center",
                cursor: "pointer",
                padding: 0,
              }}
              title="Discard"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            width: 64,
            height: 64,
            borderRadius: 6,
            border: "2px dashed #ced4da",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#adb5bd",
            fontSize: 22,
            cursor: "pointer",
          }}
          title="Add image"
        >
          <i className="fas fa-image" />
        </div>
      )}

      {/* Buttons */}
      <div className="d-flex flex-column gap-1">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          style={{ fontSize: "0.75rem", padding: "2px 8px" }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <i className="fas fa-upload me-1" />
          {preview ? "Change" : "Upload"}
        </button>

        {pendingFile && (
          <button
            type="button"
            className="btn btn-sm btn-success"
            style={{ fontSize: "0.75rem", padding: "2px 8px" }}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                />
                Saving…
              </>
            ) : (
              <>
                <i className="fas fa-check me-1" />
                Save Image
              </>
            )}
          </button>
        )}
      </div>

      {/* Status label */}
      {pendingFile && (
        <small className="text-primary" style={{ fontSize: "0.72rem" }}>
          {pendingFile.name}
        </small>
      )}
      {!pendingFile && preview && (
        <small className="text-success" style={{ fontSize: "0.72rem" }}>
          <i className="fas fa-check-circle me-1" />
          Has image
        </small>
      )}
      {!pendingFile && !preview && (
        <small className="text-muted" style={{ fontSize: "0.72rem" }}>
          No image
        </small>
      )}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function QuestionsModal({
  show,
  quizData,
  onClose,
  isLoading,
  onQuestionsUpdated,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestions, setEditingQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    if (show) {
      setCurrentPage(1);
      setIsEditing(false);
      setEditingQuestions(
        JSON.parse(JSON.stringify(quizData?.questions || [])),
      );
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show, quizData]);

  if (!show || !quizData) return null;

  const questions = isEditing ? editingQuestions : quizData.questions || [];
  const totalPages = Math.ceil(questions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = questions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleEditToggle = () => {
    if (isEditing)
      setEditingQuestions(JSON.parse(JSON.stringify(quizData.questions || [])));
    setIsEditing(!isEditing);
    setCurrentPage(1);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...editingQuestions];
    if (field === "question") updated[index].question = value;
    else if (field === "correct_answer")
      updated[index].correct_answer = parseInt(value);
    else if (field.startsWith("option_")) {
      const optIdx = parseInt(field.split("_")[1]);
      updated[index].options[optIdx] = value;
    }
    setEditingQuestions(updated);
  };

  const handleSaveQuestions = async () => {
    if (!quizData?.quiz_id) {
      Swal.fire({ icon: "error", title: "Error", text: "Quiz ID is missing" });
      return;
    }
    if (!editingQuestions?.length) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No questions to save",
      });
      return;
    }

    setIsSaving(true);
    const result = await editQuizQuestions(quizData.quiz_id, editingQuestions);
    setIsSaving(false);

    if (result.success) {
      await Swal.fire({
        icon: "success",
        title: "Questions Updated",
        text: "Quiz questions have been updated successfully",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setIsEditing(false);
      if (onQuestionsUpdated) onQuestionsUpdated(editingQuestions);
    } else {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: result.error || "Failed to update quiz questions",
      });
    }
  };

  return (
    <div
      className="modal"
      style={{
        display: "block",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1050,
        backgroundColor: "rgba(0,0,0,0.5)",
        width: "100%",
        height: "100%",
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg"
        style={{ position: "relative", margin: "1.75rem auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header d-flex align-items-center">
            <h5 className="modal-title">{quizData.title} – Questions</h5>

            <div className="d-flex gap-2 ms-auto">
              <button
                type="button"
                className={`btn btn-sm ${isEditing ? "btn-secondary" : "btn-primary"}`}
                onClick={handleEditToggle}
                disabled={isSaving}
              >
                {isEditing ? (
                  <>
                    <i className="fas fa-times me-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <i className="fas fa-edit me-1" />
                    Edit
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
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                      />
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-1" />
                      Save
                    </>
                  )}
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

          {/* Body */}
          <div
            className="modal-body"
            style={{ maxHeight: "600px", overflowY: "auto" }}
          >
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading…</span>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No questions available</p>
              </div>
            ) : (
              <>
                <p className="text-muted mb-3">
                  Showing {startIndex + 1}–
                  {Math.min(startIndex + itemsPerPage, questions.length)} of{" "}
                  {questions.length} questions
                </p>

                {paginatedQuestions.map((question, index) => {
                  const questionIndex = startIndex + index;
                  const questionId = question.question_id || question.id;

                  return (
                    <div
                      key={questionId || questionIndex}
                      className="card mb-3 border"
                    >
                      <div className="card-body">
                        {/* Question text */}
                        <div className="d-flex align-items-start mb-3">
                          <span className="badge bg-primary me-2 mt-1">
                            {questionIndex + 1}
                          </span>
                          <div className="flex-grow-1">
                            {isEditing ? (
                              <textarea
                                className="form-control"
                                value={question.question}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    questionIndex,
                                    "question",
                                    e.target.value,
                                  )
                                }
                                rows="2"
                                placeholder="Enter question"
                              />
                            ) : (
                              <h6 className="card-title mb-0">
                                {question.question}
                              </h6>
                            )}
                          </div>
                        </div>

                        {/* ── Question image upload row (always shown) ── */}
                        <div
                          className="ms-4 mb-3 p-2 rounded"
                          style={{
                            background: "#f8f9fa",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <small className="text-muted fw-semibold d-block mb-2">
                            <i className="fas fa-image me-1 text-primary" />
                            Question Image
                            <span className="text-muted fw-normal ms-1">
                              (optional)
                            </span>
                          </small>
                          {questionId ? (
                            <QuestionImageCell
                              quizId={quizData.quiz_id}
                              questionId={questionId}
                              existingImageUrl={
                                question.image_path ||
                                question.image_url ||
                                null
                              }
                              questionIndex={questionIndex}
                            />
                          ) : (
                            <small className="text-warning">
                              <i className="fas fa-exclamation-triangle me-1" />
                              Question ID not available – save questions first
                              to enable image upload.
                            </small>
                          )}
                        </div>

                        {/* Options */}
                        <div className="ms-4">
                          <strong className="text-muted d-block mb-2">
                            {question.type === "percentage"
                              ? "Options (Percentage Range):"
                              : "Options:"}
                            {isEditing && (
                              <span className="ms-2">
                                <small className="text-muted">
                                  Correct Answer:
                                </small>
                                <select
                                  className="form-select form-select-sm d-inline-block ms-1"
                                  style={{ width: "auto" }}
                                  value={question.correct_answer}
                                  onChange={(e) =>
                                    handleQuestionChange(
                                      questionIndex,
                                      "correct_answer",
                                      e.target.value,
                                    )
                                  }
                                >
                                  {question.options?.map((_, optIdx) => (
                                    <option key={optIdx} value={optIdx}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </option>
                                  ))}
                                </select>
                              </span>
                            )}
                          </strong>

                          <ul className="list-unstyled">
                            {question.options?.map((option, optIdx) => (
                              <li
                                key={optIdx}
                                className={`mb-2 p-2 rounded ${
                                  !isEditing &&
                                  optIdx === question.correct_answer
                                    ? "bg-success bg-opacity-10 border-start border-success border-3"
                                    : "border-start border-secondary border-3"
                                }`}
                              >
                                <div className="d-flex align-items-center">
                                  <span className="me-2">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      value={option}
                                      onChange={(e) =>
                                        handleQuestionChange(
                                          questionIndex,
                                          `option_${optIdx}`,
                                          e.target.value,
                                        )
                                      }
                                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                    />
                                  ) : (
                                    <span>
                                      {option}
                                      {question.type === "percentage" && "%"}
                                      {optIdx === question.correct_answer && (
                                        <span className="badge bg-success ms-2">
                                          Correct
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>

                          {question.type === "percentage" &&
                            question.tolerance && (
                              <small className="text-muted">
                                Tolerance: ±{question.tolerance}%
                              </small>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <div className="me-auto">
              <small className="text-muted">
                Page {currentPage} of {totalPages || 1}
              </small>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <i className="fas fa-chevron-left me-1" />
              Previous
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
              <i className="fas fa-chevron-right ms-1" />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
