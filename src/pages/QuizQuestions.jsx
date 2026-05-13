import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import { getQuizById, editQuizQuestions, uploadQuestionImage, deleteQuestionImage } from '../api/quizzes';
import { useAuth } from '../context/AuthContext';

// ── Question Image Component ──────────────────────────────────────────────────
function QuestionImageSection({ quizId, question, questionIndex, onImageUpdate }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(question.question_image || null);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const questionId = question.id || question.question_id;

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
      if (onImageUpdate) onImageUpdate(newUrl);
      Swal.fire({ icon: 'success', title: 'Uploaded', timer: 1000, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: result.error });
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: 'Delete Image?',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    });
    if (!confirm.isConfirmed) return;

    setDeleting(true);
    const result = await deleteQuestionImage(quizId, questionId);
    setDeleting(false);
    if (result.success) {
      setPreview(null);
      setPendingFile(null);
      if (onImageUpdate) onImageUpdate(null);
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1000, showConfirmButton: false });
    }
  };

  return (
    <div className="mt-3 p-3 bg-light rounded border">
      <div className="d-flex align-items-center gap-3">
        <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd', background: '#fff' }}>
          {preview ? <img src={preview} alt="Q" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="h-100 d-flex align-items-center justify-content-center text-muted"><i className="fas fa-image"></i></div>}
        </div>
        <div className="flex-grow-1">
          <input type="file" ref={inputRef} className="d-none" accept="image/*" onChange={handleFileSelect} />
          <div className="d-flex gap-2">
            {!pendingFile ? (
              <>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => inputRef.current.click()}>
                  {preview ? 'Change Image' : 'Upload Image'}
                </button>
                {preview && (
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </>
            ) : (
              <>
                <button type="button" className="btn btn-sm btn-success" onClick={handleUpload} disabled={uploading}>
                  {uploading ? '...' : 'Save'}
                </button>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setPendingFile(null); setPreview(question.question_image); }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function QuizQuestions() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeLang, setActiveLang] = useState('en');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    setLoading(true);
    const result = await getQuizById(quizId);
    if (result.success) {
      setQuizData(result.data);
      const qs = result.data.questions || [];
      // Ensure translations
      qs.forEach(q => {
        if (!q.translations) q.translations = { en: { question: q.question, explanation: q.explanation, options: [...(q.options || [])] } };
        if (!q.translations.en) q.translations.en = { question: q.question, explanation: q.explanation, options: [...(q.options || [])] };
        if (!q.translations.es) q.translations.es = { question: '', explanation: '', options: Array(q.options?.length || 4).fill('') };
        if (!q.translations.fr) q.translations.fr = { question: '', explanation: '', options: Array(q.options?.length || 4).fill('') };
      });
      setQuestions(qs);
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: result.error }).then(() => navigate('/quizes'));
    }
    setLoading(false);
  };

  const handleQuestionChange = (index, field, value, lang = 'en') => {
    const updated = [...questions];
    const q = updated[index];

    if (field === 'correct_answer') {
      q.correct_answer = parseInt(value);
    } else if (field === 'points') {
      q.points = parseInt(value) || 0;
    } else if (field === 'question') {
      if (lang === 'en') q.question = value;
      q.translations[lang].question = value;
    } else if (field === 'explanation') {
      if (lang === 'en') q.explanation = value;
      q.translations[lang].explanation = value;
    } else if (field.startsWith('option_')) {
      const optIdx = parseInt(field.split('_')[1]);
      if (lang === 'en') q.options[optIdx] = value;
      q.translations[lang].options[optIdx] = value;
    }
    setQuestions(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await editQuizQuestions(quizId, questions);
    setSaving(false);
    if (result.success) {
      Swal.fire({ icon: 'success', title: 'Questions Saved!', timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: result.error });
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(questions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = questions.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <div className="main-wrapper"><Header /><Sidebar /><div className="page-wrapper"><div className="content text-center py-5"><div className="spinner-border"></div></div></div><Footer /></div>;

  return (
    <div className="main-wrapper">
      <Header /><Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="page-title">Manage Questions: {quizData?.title}</h5>
                <p className="text-muted small mb-0">Translate and edit all {questions.length} questions</p>
              </div>
              <div className="col-auto d-flex gap-2">
                <div className="btn-group me-2">
                  <button className={`btn btn-sm ${activeLang === 'en' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('en')}>English</button>
                  <button className={`btn btn-sm ${activeLang === 'es' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('es')}>Spanish</button>
                  <button className={`btn btn-sm ${activeLang === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('fr')}>French</button>
                </div>
                <button className="btn btn-success btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : <><i className="fas fa-save me-2"></i>Save All Changes</>}
                </button>
                <Link to={`/quiz/${quizId}/edit`} className="btn btn-outline-secondary btn-sm">Back to Quiz</Link>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {paginatedQuestions.map((q, idx) => {
                const globalIdx = startIndex + idx;
                const langData = q.translations[activeLang] || { question: '', explanation: '', options: [] };
                
                return (
                  <div key={globalIdx} className="card shadow-sm mb-4 border-0">
                    <div className="card-header bg-white border-bottom d-flex justify-content-between">
                      <span className="fw-bold text-primary">Question #{globalIdx + 1}</span>
                      <div className="d-flex gap-3 align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <small className="fw-bold">Points:</small>
                          <input type="number" className="form-control form-control-sm" style={{ width: 60 }} value={q.points || 0} onChange={e => handleQuestionChange(globalIdx, 'points', e.target.value)} />
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="fw-bold">Correct:</small>
                          <select className="form-select form-select-sm" style={{ width: 80 }} value={q.correct_answer} onChange={e => handleQuestionChange(globalIdx, 'correct_answer', e.target.value)}>
                            {q.options?.map((_, i) => <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-7">
                          <div className="mb-3">
                            <label className="form-label small fw-bold">Question Text ({activeLang.toUpperCase()})</label>
                            <textarea className="form-control" rows="2" value={langData.question} onChange={e => handleQuestionChange(globalIdx, 'question', e.target.value, activeLang)} />
                          </div>
                          <div className="mb-3">
                            <label className="form-label small fw-bold">Explanation ({activeLang.toUpperCase()})</label>
                            <textarea className="form-control" rows="2" value={langData.explanation} onChange={e => handleQuestionChange(globalIdx, 'explanation', e.target.value, activeLang)} />
                          </div>
                        </div>
                        <div className="col-md-5">
                          <QuestionImageSection quizId={quizId} question={q} questionIndex={globalIdx} onImageUpdate={(url) => {
                            const updated = [...questions];
                            updated[globalIdx].question_image = url;
                            setQuestions(updated);
                          }} />
                        </div>
                      </div>

                      <div className="row g-3 mt-1">
                        {langData.options.map((opt, oIdx) => (
                          <div key={oIdx} className="col-md-6">
                            <div className="input-group">
                              <span className={`input-group-text ${oIdx === q.correct_answer ? 'bg-success text-white' : 'bg-light'}`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <input type="text" className="form-control" value={opt} onChange={e => handleQuestionChange(globalIdx, `option_${oIdx}`, e.target.value, activeLang)} placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4 bg-white p-3 rounded shadow-sm">
                  <span className="small text-muted">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, questions.length)} of {questions.length} questions</span>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>Previous</button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>Next</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
              
              <div className="text-center mt-4 mb-5">
                <button className="btn btn-success btn-lg px-5 shadow" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
