import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import QuestionsModal from '../components/QuestionsModal';
import { getQuizById, updateQuiz } from '../api/quizzes';
import { getAllCoupons } from '../api/coupons';

export default function EditQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [activeLang, setActiveLang] = useState('en');
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [quizRawData, setQuizRawData] = useState(null);

  const [formData, setFormData] = useState({
    translations: {
      en: { title: '', description: '', prize_description: '' },
      es: { title: '', description: '', prize_description: '' },
      fr: { title: '', description: '', prize_description: '' }
    },
    start_datetime: '',
    end_datetime: '',
    max_participants: 0,
    entry_type: 'FREE',
    entry_fee: 0,
    prize_pool: 0,
    top10_reward_percent: 100,
    top25_reward_percent: 60,
    participation_reward_percent: 10,
    max_attempts: 2,
    is_featured: false,
    is_sponsored: false,
    image: null,
    top10_coupon_id: '',
  });

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuizDetails();
    fetchCoupons();
  }, [quizId]);

  const fetchQuizDetails = async () => {
    setIsLoading(true);
    try {
      const result = await getQuizById(quizId);

      if (result.success && result.data) {
        const quiz = result.data;
        setQuizRawData(quiz);

        // Populate translations
        const fetchedTranslations = quiz.translations || {};
        const translations = {
          en: { 
            title: quiz.title || '', 
            description: quiz.description || '', 
            prize_description: quiz.prize_description || '' 
          },
          es: { 
            title: fetchedTranslations.es?.title || '', 
            description: fetchedTranslations.es?.description || '', 
            prize_description: fetchedTranslations.es?.prize_description || '' 
          },
          fr: { 
            title: fetchedTranslations.fr?.title || '', 
            description: fetchedTranslations.fr?.description || '', 
            prize_description: fetchedTranslations.fr?.prize_description || '' 
          }
        };

        setFormData({
          translations,
          start_datetime: quiz.start_datetime ? quiz.start_datetime.substring(0, 16) : '',
          end_datetime: quiz.end_datetime ? quiz.end_datetime.substring(0, 16) : '',
          max_participants: quiz.max_participants || 0,
          entry_type: quiz.entry_type || 'FREE',
          entry_fee: quiz.entry_fee || 0,
          prize_pool: quiz.prize_pool || 0,
          top10_reward_percent: quiz.top10_reward_percent || 100,
          top25_reward_percent: quiz.top25_reward_percent || 60,
          participation_reward_percent: quiz.participation_reward_percent || 10,
          max_attempts: quiz.max_attempts || 2,
          is_featured: quiz.is_featured || false,
          is_sponsored: quiz.is_sponsored || false,
          image: null,
          top10_coupon_id: quiz.top10_coupon?.coupon_id || '',
        });

        if (quiz.image_path) {
          setImagePreview(quiz.image_path);
        }

        if (quiz.questions) {
          setQuestions(quiz.questions);
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Quiz Not Found', text: result.error || 'The requested quiz could not be found' }).then(() => navigate('/quizes'));
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load quiz details' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const result = await getAllCoupons();
      if (result.success) {
        setCoupons(result.data.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTranslationChange = (lang, field, value) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value
        }
      }
    }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;

    if (type === 'number') {
      finalValue = parseInt(value) || 0;
    } else if (type === 'checkbox') {
      finalValue = checked;
    } else if (name === 'is_featured' || name === 'is_sponsored') {
      finalValue = value === 'true';
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!formData.translations.en.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please enter quiz title in English' });
      return;
    }
    setIsSaving(true);
    try {
      const updatePayload = {
        ...formData,
        title: formData.translations.en.title,
        description: formData.translations.en.description,
        prize_description: formData.translations.en.prize_description,
        translations: formData.translations
      };

      const result = await updateQuiz(quizId, updatePayload);
      if (result.success) {
        Swal.fire({ icon: 'success', title: 'Quiz Updated', text: 'Quiz updated successfully!', timer: 1500, showConfirmButton: false }).then(() => navigate('/quizes'));
      } else {
        Swal.fire({ icon: 'error', title: 'Update Failed', text: result.error || 'An error occurred while updating quiz' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error updating quiz: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/quizes');
  };

  const handleQuestionsUpdated = (newQuestions) => {
    setQuestions(newQuestions);
    setQuizRawData(prev => ({ ...prev, questions: newQuestions }));
  };

  if (isLoading) {
    return (
      <div className="main-wrapper">
        <Header /><Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <Header /><Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="content-page-header">
              <div><h5>Edit Quiz: {formData.translations.en.title}</h5></div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li><Link className="btn btn-primary" to="/quizes"><i className="fa fa-list me-2"></i>View All</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              {/* Multilingual Content Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white p-0">
                  <ul className="nav nav-tabs nav-tabs-solid nav-justified mb-0">
                    <li className="nav-item">
                      <button className={`nav-link ${activeLang === 'en' ? 'active' : ''}`} onClick={() => setActiveLang('en')}>English</button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link ${activeLang === 'es' ? 'active' : ''}`} onClick={() => setActiveLang('es')}>Spanish</button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link ${activeLang === 'fr' ? 'active' : ''}`} onClick={() => setActiveLang('fr')}>French</button>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Quiz Title ({activeLang.toUpperCase()}) <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.translations[activeLang].title} 
                      onChange={(e) => handleTranslationChange(activeLang, 'title', e.target.value)} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Description ({activeLang.toUpperCase()})</label>
                    <textarea 
                      className="form-control" 
                      rows="4" 
                      value={formData.translations[activeLang].description} 
                      onChange={(e) => handleTranslationChange(activeLang, 'description', e.target.value)}
                    ></textarea>
                  </div>
                  <div className="mb-0">
                    <label className="form-label fw-bold">Prize Description ({activeLang.toUpperCase()})</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.translations[activeLang].prize_description} 
                      onChange={(e) => handleTranslationChange(activeLang, 'prize_description', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Quiz Questions ({questions.length})</h6>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setShowQuestionsModal(true)}>
                    <i className="fas fa-tasks me-2"></i>Manage Questions
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '50px' }}>#</th>
                          <th>Question</th>
                          <th>Type</th>
                          <th className="text-center">Image</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions.slice(0, 5).map((q, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>
                              <div className="fw-medium">{q.translations?.[activeLang]?.question || q.question}</div>
                              <div className="small text-muted">{q.options?.length || 0} options</div>
                            </td>
                            <td><span className="badge bg-soft-info text-info">{q.type}</span></td>
                            <td className="text-center">
                              {q.question_image ? (
                                <img src={q.question_image} alt="Question" className="rounded shadow-sm" style={{ width: '30px', height: '30px', objectFit: 'cover' }} />
                              ) : (
                                <span className="text-muted small">None</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {questions.length > 5 && (
                    <div className="p-3 text-center border-top">
                      <button type="button" className="btn btn-link text-primary small fw-bold p-0 text-decoration-none" onClick={() => setShowQuestionsModal(true)}>
                        View all {questions.length} questions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom">
                  <h6 className="mb-0 fw-bold">Settings & Configuration</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Quiz Image</label>
                    <div className="text-center mb-3">
                      <div 
                        className="rounded border d-flex align-items-center justify-content-center bg-light mx-auto" 
                        style={{ width: '100%', height: '180px', overflow: 'hidden', cursor: 'pointer' }}
                        onClick={() => document.getElementById('quiz-img-input').click()}
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div className="text-muted"><i className="fas fa-image fa-3x mb-2 d-block"></i>Click to upload</div>
                        )}
                      </div>
                      <input id="quiz-img-input" type="file" className="d-none" accept="image/*" onChange={handleImageChange} />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Entry Type</label>
                      <select className="form-select" name="entry_type" value={formData.entry_type} onChange={handleFormChange}>
                        <option value="FREE">Free</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                    {formData.entry_type === 'PAID' && (
                      <div className="col-md-12">
                        <label className="form-label fw-bold">Entry Fee ($)</label>
                        <input type="number" className="form-control" name="entry_fee" value={formData.entry_fee} onChange={handleFormChange} />
                      </div>
                    )}
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Prize Pool ($)</label>
                      <input type="number" className="form-control" name="prize_pool" value={formData.prize_pool} onChange={handleFormChange} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Max Attempts</label>
                      <input type="number" className="form-control" name="max_attempts" value={formData.max_attempts} onChange={handleFormChange} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Top 10 Reward (%)</label>
                      <input type="number" className="form-control" name="top10_reward_percent" value={formData.top10_reward_percent} onChange={handleFormChange} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Coupon Reward</label>
                      <select className="form-select" name="top10_coupon_id" value={formData.top10_coupon_id} onChange={handleFormChange}>
                        <option value="">No Coupon</option>
                        {coupons.map(c => (<option key={c.coupon_id} value={c.coupon_id}>{c.title}</option>))}
                      </select>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Start Date</label>
                      <input type="datetime-local" className="form-control" name="start_datetime" value={formData.start_datetime} onChange={handleFormChange} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">End Date</label>
                      <input type="datetime-local" className="form-control" name="end_datetime" value={formData.end_datetime} onChange={handleFormChange} />
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="fSw" name="is_featured" checked={formData.is_featured} onChange={handleFormChange} />
                    <label className="form-check-label fw-medium" htmlFor="fSw">Featured Quiz</label>
                  </div>
                  <div className="form-check form-switch mb-4">
                    <input className="form-check-input" type="checkbox" id="sSw" name="is_sponsored" checked={formData.is_sponsored} onChange={handleFormChange} />
                    <label className="form-check-label fw-medium" htmlFor="sSw">Sponsored Quiz</label>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary btn-lg" onClick={handleUpdateQuiz} disabled={isSaving}>
                      {isSaving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="fas fa-save me-2"></i>Update Quiz</>}
                    </button>
                    <button type="button" className="btn btn-light" onClick={handleCancel}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Questions Modal */}
      <QuestionsModal 
        show={showQuestionsModal} 
        quizData={quizRawData} 
        onClose={() => setShowQuestionsModal(false)}
        onQuestionsUpdated={handleQuestionsUpdated}
      />

      <style>{`
        .bg-soft-info { background-color: rgba(13, 202, 240, 0.1); }
        .nav-tabs-solid .nav-link.active { background-color: #0d6efd; color: white; border-color: #0d6efd; }
        .form-label { font-size: 0.875rem; color: #4b5563; }
      `}</style>

      <Footer />
    </div>
  );
}