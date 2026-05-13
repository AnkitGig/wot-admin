import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import GlobalLoader from '../components/GlobalLoader';
import { uploadPdf, generateQuiz } from '../api/quizzes';
import { getAllCoupons } from '../api/coupons';
import { useAuth } from '../context/AuthContext';

export default function AddQuiz() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [pdfId, setPdfId] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [activeLang, setActiveLang] = useState('en');

  // Step 1: PDF Upload
  const [pdfFile, setPdfFile] = useState(null);

  // Step 2: Quiz Details
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
    top10_coupon_id: '',
    image: null,
    translations: {
      es: { title: '', description: '' },
      fr: { title: '', description: '' }
    }
  });

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/json' || file.name.endsWith('.json'))) {
      setPdfFile(file);
    } else {
      Swal.fire({ icon: 'warning', title: 'Invalid File', text: 'Please select a valid PDF or JSON file' });
      setPdfFile(null);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please select a PDF or JSON file' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await uploadPdf(pdfFile);
      if (result.success) {
        setPdfId(result.data.pdf_id);
        setPdfFileName(pdfFile.name);
        Swal.fire({ icon: 'success', title: 'File Uploaded', text: 'Now configure your quiz details.', timer: 1500, showConfirmButton: false }).then(() => setStep(2));
      } else {
        Swal.fire({ icon: 'error', title: 'Upload Failed', text: result.error || 'Failed to upload file' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setIsLoading(false);
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
          [activeLang]: { ...prev.translations[activeLang], [name]: value }
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please enter quiz title in English' });
      return;
    }

    setIsLoading(true);
    try {
      const quizPayload = { ...formData, pdf_id: pdfId };
      const result = await generateQuiz(quizPayload);

      if (result.success) {
        Swal.fire({ icon: 'success', title: 'Quiz Created', text: 'Quiz generated successfully!', timer: 1500, showConfirmButton: false }).then(() => navigate('/quizes'));
      } else {
        Swal.fire({ icon: 'error', title: 'Failed to create quiz', text: result.error || 'An error occurred' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToUpload = () => {
    setStep(1);
    setPdfId('');
    setPdfFileName('');
    setFormData({
      title: '', description: '', start_datetime: '', end_datetime: '', max_participants: 0,
      entry_type: 'FREE', entry_fee: 0, prize_pool: 0, prize_description: '',
      top10_reward_percent: 100, top25_reward_percent: 60, participation_reward_percent: 10,
      max_attempts: 2, is_featured: false, is_sponsored: false, top10_coupon_id: '', image: null,
      translations: { es: { title: '', description: '' }, fr: { title: '', description: '' } }
    });
    setImagePreview(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 500);
    fetchCoupons();
    return () => clearTimeout(timer);
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await getAllCoupons(token);
      if (response.success) setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  if (isPageLoading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <GlobalLoader visible={true} size="large" />
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
                <h5>Create Advanced Quiz</h5>
                <p className="text-muted">Generate interactive assessments from PDF or JSON</p>
              </div>
              <div className="list-btn">
                <Link className="btn btn-outline-primary" to="/quizes"><i className="fa fa-arrow-left me-2"></i>Back to Repository</Link>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  
                  {/* Progress Indicator */}
                  <div className="d-flex justify-content-center mb-5">
                    <div className="d-flex align-items-center">
                      <div className={`rounded-circle d-flex align-items-center justify-content-center ${step >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>1</div>
                      <div className={`mx-2 ${step >= 2 ? 'bg-primary' : 'bg-light'}`} style={{ width: '100px', height: '3px' }}></div>
                      <div className={`rounded-circle d-flex align-items-center justify-content-center ${step >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>2</div>
                    </div>
                  </div>

                  {step === 1 ? (
                    <div className="row justify-content-center">
                      <div className="col-md-6">
                        <div className="text-center mb-4">
                          <i className="fas fa-file-upload fa-4x text-primary mb-3"></i>
                          <h6>Upload Resource File</h6>
                          <p className="text-muted small">Select a PDF or JSON file to extract questions from.</p>
                        </div>
                        <form onSubmit={handlePdfUpload} className="bg-light p-4 rounded-3 border">
                          <div className="mb-4">
                            <label className="form-label fw-bold small">PDF or JSON Source</label>
                            <input type="file" className="form-control" accept=".pdf,.json" onChange={handlePdfChange} required />
                            {pdfFile && <div className="mt-2 text-success small"><i className="fa fa-check me-1"></i>{pdfFile.name} ready</div>}
                          </div>
                          <div className="d-grid">
                            <button type="submit" className="btn btn-primary" disabled={isLoading || !pdfFile}>
                              {isLoading ? <><span className="spinner-border spinner-border-sm me-2" />Uploading...</> : <><i className="fa fa-arrow-right me-2"></i>Continue to Configuration</>}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateQuiz}>
                      <div className="row g-4">
                        <div className="col-lg-8">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0">Step 2: Quiz Metadata</h6>
                            <div className="btn-group btn-group-sm">
                              <button type="button" className={`btn ${activeLang === 'en' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('en')}>EN</button>
                              <button type="button" className={`btn ${activeLang === 'es' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('es')}>ES</button>
                              <button type="button" className={`btn ${activeLang === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveLang('fr')}>FR</button>
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-bold">Quiz Title ({activeLang.toUpperCase()})</label>
                            <input type="text" className="form-control" placeholder={`Enter ${activeLang} title`} name="title" value={activeLang === 'en' ? formData.title : formData.translations[activeLang].title} onChange={handleFormChange} required={activeLang === 'en'} />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-bold">Description ({activeLang.toUpperCase()})</label>
                            <textarea className="form-control" rows="4" placeholder={`Enter ${activeLang} description`} name="description" value={activeLang === 'en' ? formData.description : formData.translations[activeLang].description} onChange={handleFormChange}></textarea>
                          </div>

                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Start Time</label>
                              <input type="datetime-local" className="form-control" name="start_datetime" value={formData.start_datetime} onChange={handleFormChange} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">End Time</label>
                              <input type="datetime-local" className="form-control" name="end_datetime" value={formData.end_datetime} onChange={handleFormChange} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Entry Type</label>
                              <select className="form-select" name="entry_type" value={formData.entry_type} onChange={handleFormChange}>
                                <option value="FREE">Free</option>
                                <option value="PAID">Paid</option>
                              </select>
                            </div>
                            {formData.entry_type === 'PAID' && (
                              <div className="col-md-4">
                                <label className="form-label small fw-bold">Entry Fee</label>
                                <input type="number" className="form-control" name="entry_fee" value={formData.entry_fee} onChange={handleFormChange} min="0" />
                              </div>
                            )}
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Max Attempts</label>
                              <input type="number" className="form-control" name="max_attempts" value={formData.max_attempts} onChange={handleFormChange} min="1" />
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-4">
                          <h6 className="fw-bold mb-3">Quiz Settings</h6>
                          <div className="mb-3">
                            <label className="form-label small fw-bold">Quiz Thumbnail</label>
                            <div className="border rounded-3 p-2 text-center bg-light mb-2" style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {imagePreview ? <img src={imagePreview} className="img-fluid rounded" style={{ maxHeight: '110px' }} /> : <div className="text-muted small">No Preview</div>}
                            </div>
                            <input type="file" className="form-control form-control-sm" accept="image/*" onChange={handleImageChange} />
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-bold">Top 10% Reward Coupon</label>
                            <select className="form-select form-select-sm" name="top10_coupon_id" value={formData.top10_coupon_id} onChange={handleFormChange}>
                              <option value="">Select coupon</option>
                              {coupons.map(c => <option key={c.coupon_id} value={c.coupon_id}>{c.title}</option>)}
                            </select>
                          </div>

                          <div className="bg-light p-3 rounded-3 border">
                            <p className="small fw-bold mb-2">Reward Distribution</p>
                            <div className="mb-2">
                              <label className="small d-flex justify-content-between">Top 10% <span>{formData.top10_reward_percent}%</span></label>
                              <input type="range" className="form-range" name="top10_reward_percent" value={formData.top10_reward_percent} onChange={handleFormChange} min="0" max="100" />
                            </div>
                            <div className="mb-2">
                              <label className="small d-flex justify-content-between">Top 25% <span>{formData.top25_reward_percent}%</span></label>
                              <input type="range" className="form-range" name="top25_reward_percent" value={formData.top25_reward_percent} onChange={handleFormChange} min="0" max="100" />
                            </div>
                          </div>

                          <div className="mt-4 d-flex gap-2">
                            <button type="button" className="btn btn-outline-secondary btn-sm flex-fill" onClick={handleBackToUpload}><i className="fa fa-arrow-left me-1"></i>Back</button>
                            <button type="submit" className="btn btn-primary btn-sm flex-fill" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Quiz'}</button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
        .form-control:focus, .form-select:focus { border-color: #6c63ff; box-shadow: 0 0 0 0.25rem rgba(108, 99, 255, 0.1); }
        .bg-primary { background-color: #6c63ff !important; }
        .btn-primary { background-color: #6c63ff; border-color: #6c63ff; }
        .text-primary { color: #6c63ff !important; }
      `}</style>
    </div>
  );
}
