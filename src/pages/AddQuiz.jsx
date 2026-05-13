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
  });

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/json' || file.name.endsWith('.json'))) {
      setPdfFile(file);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid File',
        text: 'Please select a valid PDF or JSON file',
      });
      setPdfFile(null);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a PDF or JSON file',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await uploadPdf(pdfFile);

      if (result.success) {
        setPdfId(result.data.pdf_id);
        setPdfFileName(pdfFile.name);
        
        Swal.fire({
          icon: 'success',
          title: 'PDF Uploaded',
          text: 'PDF uploaded successfully! Now configure your quiz.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          setStep(2);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: result.error || 'Failed to upload PDF',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error uploading PDF: ' + err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
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

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter quiz title',
      });
      return;
    }

    if (formData.entry_type === 'PAID' && formData.entry_fee < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Minimum entry fee is 10 coins',
      });
      return;
    }

    // if (formData.entry_type === 'PAID' && formData.entry_fee > 250) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Validation Error',
    //     text: 'Maximum entry fee is 250 coins',
    //   });
    //   return;
    // }

 

    setIsLoading(true);

    try {
      const quizPayload = {
        ...formData,
        pdf_id: pdfId,
      };

      const result = await generateQuiz(quizPayload);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Quiz Created',
          text: result.data?.message || 'Quiz created successfully!',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate('/quizes');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to create quiz',
          text: result.error || 'An error occurred while creating the quiz',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error creating quiz: ' + err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToUpload = () => {
    setStep(1);
    setPdfId('');
    setPdfFileName('');
    setFormData({
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
    });
    setImagePreview(null);
  };

  const handleCancel = () => {
    navigate('/quizes');
  };

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);

    // Fetch coupons
    fetchCoupons();

    return () => clearTimeout(timer);
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await getAllCoupons(token);
      if (response.success) {
        setCoupons(response.data.coupons || []);
      }
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
        <Footer />
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
                <h5>Add New Quiz</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <Link className="btn btn-primary" to="/quizes"><i className="fa fa-plus-circle me-2"></i>View All</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  {/* STEP 1: PDF Upload */}
                  {step === 1 && (
                    <>
                      {isLoading ? (
                        <div className="row">
                          <div className="col-md-12">
                            <h6 className="mb-4">Step 1: Upload File (PDF or JSON)</h6>
                            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
                              <GlobalLoader visible={true} size="medium" />
                              <p className="mt-3 text-muted">Uploading file...</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handlePdfUpload} className="row g-3">
                          <div className="col-md-12">
                            <h6 className="mb-4">Step 1: Upload File (PDF or JSON)</h6>
                          </div>

                          <div className="col-md-12">
                            <label className="form-label">Select PDF or JSON File <span className="text-danger">*</span></label>
                            <input
                              type="file"
                              className="form-control"
                              accept=".pdf,.json"
                              onChange={handlePdfChange}
                              required
                            />
                            {pdfFile && (
                              <div className="mt-3">
                                <p className="text-muted mb-0">Selected: <strong>{pdfFile.name}</strong></p>
                              </div>
                            )}
                          </div>

                          <div className="col-md-12 text-end mt-3">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={handleCancel}
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit" 
                              className="btn btn-primary ms-2"
                              disabled={isLoading || !pdfFile}
                            >
                              <i className="fa fa-upload"></i> Upload
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}

                  {/* STEP 2: Quiz Configuration */}
                  {step === 2 && (
                    <>
                      {isLoading ? (
                        <div className="row">
                          <div className="col-md-12">
                            <h6 className="mb-4">Step 2: Configure Quiz</h6>
                            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
                              <GlobalLoader visible={true} size="medium" />
                              <p className="mt-3 text-muted">Generating Quiz...</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleCreateQuiz} className="row g-3">
                          <div className="col-md-12">
                            <h6 className="mb-4">Step 2: Configure Quiz</h6>
                          </div>

                      <div className="col-md-6">
                        <label className="form-label">Quiz Title <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter quiz title"
                          name="title"
                          value={formData.title}
                          onChange={handleFormChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Entry Type <span className="text-danger">*</span></label>
                        <select
                          className="form-control"
                          name="entry_type"
                          value={formData.entry_type}
                          onChange={handleFormChange}
                           style={{ appearance: "auto" }}
                        >
                          <option value="FREE">Free</option>
                          <option value="PAID">Paid</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Start Date & Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          name="start_datetime"
                          value={formData.start_datetime}
                          onChange={handleFormChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">End Date & Time</label>
                          <input
                          type="datetime-local"
                          className="form-control"
                          name="end_datetime"
                          value={formData.end_datetime}
                          onChange={handleFormChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Max Participants</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0"
                          name="max_participants"
                          value={formData.max_participants}
                          onChange={handleFormChange}
                          min="0"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Max Attempts</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="2"
                          name="max_attempts"
                          value={formData.max_attempts}
                          onChange={handleFormChange}
                          min="1"
                        />
                      </div>

                      {formData.entry_type === 'PAID' && (
                      <div className="col-md-6">
                        <label className="form-label">Entry Fee (for Paid) <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0"
                          name="entry_fee"
                          value={formData.entry_fee}
                          onChange={handleFormChange}
                        />
                      </div>
                      )}

                      <div className="col-md-6">
                        <label className="form-label">Prize Pool</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0"
                          name="prize_pool"
                          value={formData.prize_pool}
                          onChange={handleFormChange}
                          min="0"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Top 10 Coupon Reward</label>
                        <select
                          className="form-control"
                          name="top10_coupon_id"
                          value={formData.top10_coupon_id}
                          onChange={handleFormChange}
                           style={{ appearance: "auto" }}
                        >
                          <option value="">Select a coupon (optional)</option>
                          {coupons.map((coupon) => (
                            <option key={coupon.coupon_id} value={coupon.coupon_id}>
                              {coupon.title} - {coupon.code}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Enter quiz description and instructions"
                          name="description"
                          value={formData.description}
                          onChange={handleFormChange}
                        ></textarea>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Prize Description</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Prize up to 500 coins"
                          name="prize_description"
                          value={formData.prize_description}
                          onChange={handleFormChange}
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Quiz Image</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview && (
                          <div className="mt-3">
                            <img
                              src={imagePreview}
                              alt="Image Preview"
                              style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="col-md-12">
                        <h6 className="mb-3">Reward Distribution</h6>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Top 10% Reward %</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="100"
                          name="top10_reward_percent"
                          value={formData.top10_reward_percent}
                          onChange={handleFormChange}
                          min="0"
                          max="100"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Top 25% Reward %</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="60"
                          name="top25_reward_percent"
                          value={formData.top25_reward_percent}
                          onChange={handleFormChange}
                          min="0"
                          max="100"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Participation Reward %</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="10"
                          name="participation_reward_percent"
                          value={formData.participation_reward_percent}
                          onChange={handleFormChange}
                          min="0"
                          max="100"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Featured Quiz</label>
                        <select
                          className="form-control"
                          name="is_featured"
                          value={formData.is_featured}
                          onChange={handleFormChange}
                          style={{ appearance: "auto" }}
                        >
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Sponsored Quiz</label>
                        <select
                          className="form-control"
                          name="is_sponsored"
                          value={formData.is_sponsored}
                          onChange={handleFormChange}
                          style={{ appearance: "auto" }}
                        >
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </div>


                      <div className="col-md-12 text-end mt-3">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleBackToUpload}
                          disabled={isLoading}
                        >
                          <i className="fa fa-arrow-left"></i> Back
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary ms-2"
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary ms-2"
                          disabled={isLoading}
                        >
                          <i className="fa fa-check-circle"></i> {isLoading ? 'Creating...' : 'Create Quiz'}
                        </button>
                      </div>
                    </form>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
