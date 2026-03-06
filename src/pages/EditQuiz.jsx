import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { getAllQuizzes, generateQuiz, updateQuiz } from '../api/quizzes';

export default function EditQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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
    featured_order: 0,
    image: null,
  });

  useEffect(() => {
    fetchQuizDetails();
  }, [quizId]);

  const fetchQuizDetails = async () => {
    setIsLoading(true);
    
    // Fetch all quizzes and find the specific one
    const result = await getAllQuizzes(1, 100); // Get more items to find the quiz
    
    if (result.success && result.data?.quizzes) {
      const quiz = result.data.quizzes.find(q => q.quiz_id === quizId);
      
      if (quiz) {
        setFormData({
          title: quiz.title || '',
          description: quiz.description || '',
          start_datetime: quiz.start_datetime ? new Date(quiz.start_datetime).toISOString().slice(0, 16) : '',
          end_datetime: quiz.end_datetime ? new Date(quiz.end_datetime).toISOString().slice(0, 16) : '',
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
          featured_order: quiz.featured_order || 0,
          image: null, // We'll handle image updates separately
        });

        // Set image preview if image exists
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
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleUpdateQuiz = async (e) => {
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

    setIsSaving(true);

    try {
      const quizPayload = {
        ...formData,
      };

      const result = await updateQuiz(quizId, quizPayload);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Quiz Updated',
          text: result.data?.message || 'Quiz updated successfully!',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate('/quizes');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Update Quiz',
          text: result.error || 'An error occurred while updating quiz',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating quiz: ' + err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/quizes');
  };

  if (isLoading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
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
                <h5>Edit Quiz</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <Link className="btn btn-primary" to="/quizes"><i className="fa fa-list me-2"></i>View All</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleUpdateQuiz} className="row g-3">
                    <div className="col-md-12">
                      <h6 className="mb-4">Edit Quiz Configuration</h6>
                    </div>

                    <div className="col-md-8">
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

                    <div className="col-md-4">
                      <label className="form-label">Entry Type <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        name="entry_type"
                        value={formData.entry_type}
                        onChange={handleFormChange}
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

                    <div className="col-md-6">
                      <label className="form-label">Entry Fee (for Paid) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        name="entry_fee"
                        value={formData.entry_fee}
                        onChange={handleFormChange}
                        min="0"
                      />
                    </div>

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
                          <p className="text-muted small mt-2">Current image - upload new image to replace</p>
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

                    <div className="col-md-12">
                      <h6 className="mb-3 mt-4">Featured & Sponsored Options</h6>
                    </div>

                    <div className="col-md-4">
                      <div className="form-check mt-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="is_featured"
                          id="is_featured"
                          checked={formData.is_featured}
                          onChange={handleFormChange}
                        />
                        <label className="form-check-label" htmlFor="is_featured">
                          Featured Quiz
                        </label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-check mt-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="is_sponsored"
                          id="is_sponsored"
                          checked={formData.is_sponsored}
                          onChange={handleFormChange}
                        />
                        <label className="form-check-label" htmlFor="is_sponsored">
                          Sponsored Quiz
                        </label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Featured Order</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        name="featured_order"
                        value={formData.featured_order}
                        onChange={handleFormChange}
                        min="0"
                      />
                      <small className="text-muted">Order for featured quizzes (0 = no order)</small>
                    </div>

                    <div className="col-md-12 text-end mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary ms-2"
                        disabled={isSaving}
                      >
                        <i className="fa fa-save"></i> {isSaving ? 'Updating...' : 'Update Quiz'}
                      </button>
                    </div>
                  </form>
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
