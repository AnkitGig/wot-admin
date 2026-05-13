import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { getAllQuizzes, updateQuiz } from '../api/quizzes';
import { getAllCoupons } from '../api/coupons';

export default function EditQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [activeLang, setActiveLang] = useState('en');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    max_participants: 0,
    entry_type: 'FREE',
    entry_fee: 0,
    prize_pool: 0,
    prize_description: '',
    top10_reward_percent: 100,
    top25_reward_percent: 60,
    participation_reward_percent: 10,
    max_attempts: 2,
    is_featured: false,
    is_sponsored: false,
    image: null,
    coupon_id: '',
    translations: {
      es: { title: '', description: '' },
      fr: { title: '', description: '' }
    }
  });

  useEffect(() => {
    fetchQuizDetails();
    fetchCoupons();
  }, [quizId]);

  const fetchQuizDetails = async () => {
    setIsLoading(true);

    const result = await getAllQuizzes(1, 100);

    if (result.success && result.data?.quizzes) {
      const quiz = result.data.quizzes.find(q => q.quiz_id === quizId);

      if (quiz) {
        const couponId = quiz.top10_coupon?.coupon_id || quiz.coupon_id || '';

        setFormData({
          title: quiz.title || '',
          description: quiz.description || '',
          start_datetime: quiz.start_datetime ? quiz.start_datetime.substring(0, 16) : '',
          end_datetime: quiz.end_datetime ? quiz.end_datetime.substring(0, 16) : '',
          max_participants: quiz.max_participants || 0,
          entry_type: quiz.entry_type || 'FREE',
          entry_fee: quiz.entry_fee || 0,
          prize_pool: quiz.prize_pool || 0,
          prize_description: quiz.prize_description || '',
          top10_reward_percent: quiz.top10_reward_percent || 100,
          top25_reward_percent: quiz.top25_reward_percent || 60,
          participation_reward_percent: quiz.participation_reward_percent || 10,
          max_attempts: quiz.max_attempts || 2,
          is_featured: quiz.is_featured || false,
          is_sponsored: quiz.is_sponsored || false,
          image: null,
          coupon_id: couponId,
          translations: {
            es: { 
              title: quiz.translations?.es?.title || '', 
              description: quiz.translations?.es?.description || '' 
            },
            fr: { 
              title: quiz.translations?.fr?.title || '', 
              description: quiz.translations?.fr?.description || '' 
            }
          }
        });

        if (quiz.image_path) {
          setImagePreview(quiz.image_path);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Quiz Not Found',
          text: 'The requested quiz could not be found',
        }).then(() => {
          navigate('/quizes');
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Quiz',
        text: result.error || 'An error occurred while fetching quiz details',
      }).then(() => {
        navigate('/quizes');
      });
    }

    setIsLoading(false);
  };

  const fetchCoupons = async () => {
    try {
      const result = await getAllCoupons();
      if (result.success && result.data) {
        const couponsData = result.data.coupons || result.data || [];
        setCoupons(couponsData);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
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

    if (activeLang !== 'en' && (name === 'title' || name === 'description')) {
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [activeLang]: {
            ...prev.translations[activeLang],
            [name]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: finalValue,
      }));
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please enter quiz title in English' });
      return;
    }

    setIsSaving(true);

    try {
      // Create a copy for the API
      const payload = { ...formData };
      
      // The API expects a specific structure for translations
      // We send it as a JSON string if using x-www-form-urlencoded in the service
      // But the updateQuiz in api/quizzes.js uses x-www-form-urlencoded which might not handle nested objects well
      // Let's check updateQuiz implementation
      
      const result = await updateQuiz(quizId, payload);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Quiz Updated',
          text: 'Quiz metadata and translations saved successfully!',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate('/quizes');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: result.error || 'Could not update quiz',
        });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Edit Quiz Content</h5>
                <p className="text-muted">Manage metadata and multilingual translations</p>
              </div>
              <div className="list-btn">
                <Link className="btn btn-outline-primary" to="/quizes">
                  <i className="fa fa-arrow-left me-2"></i>Back to Repository
                </Link>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0 fw-bold">Primary Content</h6>
                    <div className="btn-group btn-group-sm">
                      <button type="button" className={`btn ${activeLang === 'en' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('en')}>English</button>
                      <button type="button" className={`btn ${activeLang === 'es' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('es')}>Spanish</button>
                      <button type="button" className={`btn ${activeLang === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('fr')}>French</button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <form onSubmit={handleUpdateQuiz}>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Quiz Title ({activeLang.toUpperCase()})</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder={`Enter title in ${activeLang === 'en' ? 'English' : activeLang === 'es' ? 'Spanish' : 'French'}`}
                        name="title"
                        value={activeLang === 'en' ? formData.title : formData.translations[activeLang].title}
                        onChange={handleFormChange}
                        required={activeLang === 'en'}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Description ({activeLang.toUpperCase()})</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        placeholder={`Provide detailed instructions or overview in ${activeLang}`}
                        name="description"
                        value={activeLang === 'en' ? formData.description : formData.translations[activeLang].description}
                        onChange={handleFormChange}
                      ></textarea>
                    </div>

                    <hr className="my-4" />

                    <div className="row g-3">
                      <div className="col-md-12"><h6 className="fw-bold mb-3">Quiz Configuration</h6></div>
                      
                      <div className="col-md-6">
                        <label className="form-label small text-muted">Start Date & Time</label>
                        <input type="datetime-local" className="form-control" name="start_datetime" value={formData.start_datetime} onChange={handleFormChange} />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label small text-muted">End Date & Time</label>
                        <input type="datetime-local" className="form-control" name="end_datetime" value={formData.end_datetime} onChange={handleFormChange} />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small text-muted">Entry Type</label>
                        <select className="form-select" name="entry_type" value={formData.entry_type} onChange={handleFormChange}>
                          <option value="FREE">Free Access</option>
                          <option value="PAID">Premium (Paid)</option>
                        </select>
                      </div>

                      {formData.entry_type === 'PAID' && (
                        <div className="col-md-4">
                          <label className="form-label small text-muted">Entry Fee (Coins)</label>
                          <input type="number" className="form-control" name="entry_fee" value={formData.entry_fee} onChange={handleFormChange} min="0" />
                        </div>
                      )}

                      <div className="col-md-4">
                        <label className="form-label small text-muted">Max Attempts</label>
                        <input type="number" className="form-control" name="max_attempts" value={formData.max_attempts} onChange={handleFormChange} min="1" />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small text-muted">Prize Pool (Coins)</label>
                        <input type="number" className="form-control" name="prize_pool" value={formData.prize_pool} onChange={handleFormChange} min="0" />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small text-muted">Prize Description</label>
                        <input type="text" className="form-control" placeholder="e.g. Winner gets 500 coins" name="prize_description" value={formData.prize_description} onChange={handleFormChange} />
                      </div>
                    </div>

                    <div className="mt-5 text-end">
                      <button type="button" className="btn btn-link text-decoration-none me-3" onClick={() => navigate('/quizes')}>Cancel</button>
                      <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={isSaving}>
                        {isSaving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="fa fa-save me-2"></i>Save Quiz Details</>}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3"><h6 className="card-title mb-0 fw-bold">Visual Asset</h6></div>
                <div className="card-body">
                  <div className="mb-4">
                    <div className="text-center p-3 mb-3 border rounded-3 bg-light" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Quiz Preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: '180px' }} />
                      ) : (
                        <div className="text-muted"><i className="fas fa-image fa-4x mb-2 d-block"></i>No Image Uploaded</div>
                      )}
                    </div>
                    <label className="form-label small fw-bold">Update Thumbnail</label>
                    <input type="file" className="form-control form-control-sm" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>
              </div>

              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3"><h6 className="card-title mb-0 fw-bold">Promotion & Rewards</h6></div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label small text-muted">Associate Coupon</label>
                    <select className="form-select form-select-sm" name="coupon_id" value={formData.coupon_id} onChange={handleFormChange}>
                      <option value="">None</option>
                      {coupons.map(c => <option key={c.coupon_id} value={c.coupon_id}>{c.title}</option>)}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleFormChange} />
                        <label className="form-check-label small">Featured</label>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="is_sponsored" checked={formData.is_sponsored} onChange={handleFormChange} />
                        <label className="form-check-label small">Sponsored</label>
                      </div>
                    </div>
                  </div>

                  <hr />
                  <p className="small fw-bold text-muted mb-2">Reward Split (%)</p>
                  <div className="mb-2">
                    <label className="small d-flex justify-content-between">Top 10% <span>{formData.top10_reward_percent}%</span></label>
                    <input type="range" className="form-range" name="top10_reward_percent" value={formData.top10_reward_percent} onChange={handleFormChange} min="0" max="100" />
                  </div>
                  <div className="mb-2">
                    <label className="small d-flex justify-content-between">Top 25% <span>{formData.top25_reward_percent}%</span></label>
                    <input type="range" className="form-range" name="top25_reward_percent" value={formData.top25_reward_percent} onChange={handleFormChange} min="0" max="100" />
                  </div>
                  <div>
                    <label className="small d-flex justify-content-between">Participation <span>{formData.participation_reward_percent}%</span></label>
                    <input type="range" className="form-range" name="participation_reward_percent" value={formData.participation_reward_percent} onChange={handleFormChange} min="0" max="100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
        .form-control:focus, .form-select:focus { border-color: #6c63ff; box-shadow: 0 0 0 0.25rem rgba(108, 99, 255, 0.1); }
        .btn-primary { background-color: #6c63ff; border-color: #6c63ff; }
        .btn-primary:hover { background-color: #5a52e0; border-color: #5a52e0; }
        .btn-outline-primary { color: #6c63ff; border-color: #6c63ff; }
        .btn-outline-primary:hover { background-color: #6c63ff; border-color: #6c63ff; color: #fff; }
      `}</style>
    </div>
  );
}