import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import GlobalLoader from '../components/GlobalLoader';
import QuestionsModal from '../components/QuestionsModal';
import QuizStatsModal from '../components/QuizStatsModal';
import { getAllQuizzes, deleteQuiz, getQuizStats } from '../api/quizzes';

export default function Quizes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuizzes(1);
  }, []);

  useEffect(() => {
    if (window.DataTable && !isLoading) {
      const dataTable = document.querySelector('#quizTable');
      if (dataTable) {
        new window.DataTable('#quizTable', {});
      }
    }
  }, [activeTab, isLoading]);

  const fetchQuizzes = async (page = 1) => {
    setIsLoading(true);
    const result = await getAllQuizzes(page, itemsPerPage);

    if (result.success && result.data?.quizzes) {
      setAllQuizzes(result.data.quizzes);
      setCurrentPage(result.data.current_page || 1);
      setTotalPages(result.data.total_pages || 1);
      setTotalQuizzes(result.data.total_quizzes || 0);
      console.log('[v0] Quizzes loaded - Page:', result.data.current_page, 'Total:', result.data.total_quizzes);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Quizzes',
        text: result.error || 'An error occurred while fetching quizzes',
      });
      setAllQuizzes([]);
    }
    setIsLoading(false);
  };

  const handleViewQuestions = (quiz) => {
    console.log('[v0] Viewing questions for quiz:', quiz.quiz_id);
    setSelectedQuiz(quiz);
    setShowQuestionsModal(true);
  };

  const handleCloseModal = () => {
    setShowQuestionsModal(false);
    setSelectedQuiz(null);
  };

  const handleCloseStatsModal = () => {
    setShowStatsModal(false);
    setSelectedQuizId(null);
  };

  const handleQuestionsUpdated = (updatedQuestions) => {
    if (selectedQuiz) {
      const updatedQuiz = { ...selectedQuiz, questions: updatedQuestions };
      setSelectedQuiz(updatedQuiz);

      // Update the quiz in the allQuizzes array
      setAllQuizzes(prevQuizzes =>
        prevQuizzes.map(quiz =>
          quiz.quiz_id === selectedQuiz.quiz_id
            ? { ...quiz, questions: updatedQuestions }
            : quiz
        )
      );
    }
  };

  const handleViewStats = (quizId) => {
    console.log('[v0] Viewing statistics for quiz:', quizId);
    setSelectedQuizId(quizId);
    setShowStatsModal(true);
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/quiz/${quizId}/edit`);
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    const result = await Swal.fire({
      title: 'Delete Quiz?',
      text: `Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    const deleteResult = await deleteQuiz(quizId);

    if (deleteResult.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Quiz has been deleted successfully',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      fetchQuizzes(currentPage);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Delete',
        text: deleteResult.error || 'An error occurred while deleting the quiz',
      });
      setIsLoading(false);
    }
  };

  const featuredQuizzes = allQuizzes.length > 0 ? allQuizzes.filter(q => q.is_featured || q.is_sponsored).slice(0, 3).map(quiz => ({
    id: quiz.quiz_id,
    title: quiz.title,
    course: 'Trading Course',
    type: quiz.is_sponsored ? 'Sponsored' : 'Featured',
    participants: quiz.unique_participants || 0,
    prize: `${quiz.prize_pool} Coins` || '0 Coins',
    description: quiz.description || 'Quiz from PDF',
    image: '📝',
    endTime: new Date(quiz.end_datetime).toLocaleString()
  })) : [
  ];

  // Filter quizzes based on active tab
  const filteredQuizzes = activeTab === 'all'
    ? allQuizzes
    : allQuizzes.filter(q => q.status.toLowerCase() === activeTab.toLowerCase());

  const getStatusBadgeColor = (status) => {
    const colors = {
      'active': 'bg-success',
      'draft': 'bg-warning',
      'review': 'bg-info',
      'ended': 'bg-secondary',
      'disabled': 'bg-danger'
    };
    return colors[status?.toLowerCase()] || 'bg-secondary';
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredQuizzes.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredQuizzes.length) % featuredQuizzes.length);
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Quizzes Management</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <div className="dropdown dropdown-action" data-bs-placement="bottom" data-bs-original-title="Download">
                      <div className="dropdown-menu dropdown-menu-end">
                        <ul className="d-block">
                          <li>
                            <a className="d-flex align-items-center download-item" href="javascript:void(0);" download="">
                              <i className="far fa-file-text me-2"></i>Excel
                            </a>
                          </li>
                          <li>
                            <a className="d-flex align-items-center download-item" href="javascript:void(0);" download="">
                              <i className="far fa-file-pdf me-2"></i>PDF
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link className="btn btn-primary" to="/add-quiz"><i className="fa fa-plus-circle me-2"></i>Add Quiz</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Featured Quizzes Carousel */}
          <div className="row mb-4">
            <div className="col-sm-12">
              <div className="card border-0 shadow-soft">
                <div className="card-body p-0">
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
                    <div style={{
                      display: 'flex',
                      transition: 'transform 0.5s ease-in-out',
                      transform: `translateX(-${currentSlide * 100}%)`
                    }}>
                      {featuredQuizzes.map((quiz, index) => (
                        <div
                          key={index}
                          style={{
                            minWidth: '100%',
                            padding: '0'
                          }}
                        >
                          <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '40px',
                            minHeight: '300px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '8px',
                            position: 'relative',
                            paddingLeft: '70px',
                            paddingRight: '70px'
                          }}>
                            <div style={{ flex: 1, zIndex: 5, position: 'relative' }}>
                              <div style={{ fontSize: '48px', marginBottom: '15px' }}>{quiz.image}</div>
                              <span className="badge bg-light text-dark mb-2">{quiz.type}</span>
                              <h3 style={{ marginTop: '10px', marginBottom: '15px', color: 'white', wordWrap: 'break-word' }}>{quiz.title}</h3>
                              <p style={{ marginBottom: '20px', opacity: 0.9 }}>{quiz.description}</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                  <small style={{ opacity: 0.8 }}>Course</small>
                                  <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{quiz.course}</p>
                                </div>
                                <div>
                                  <small style={{ opacity: 0.8 }}>Prize Pool</small>
                                  <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{quiz.prize}</p>
                                </div>
                                <div>
                                  <small style={{ opacity: 0.8 }}>Participants</small>
                                  <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{quiz.participants}</p>
                                </div>
                              </div>
                              <small style={{ opacity: 0.8 }}>Ends: {quiz.endTime}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Carousel Controls */}
                    <button
                      onClick={prevSlide}
                      style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.7)',
                        border: 'none',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 10,
                        fontSize: '20px'
                      }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextSlide}
                      style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.7)',
                        border: 'none',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 10,
                        fontSize: '20px'
                      }}
                    >
                      ›
                    </button>
                    {/* Slide Indicators */}
                    <div style={{
                      position: 'absolute',
                      bottom: '15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      {featuredQuizzes.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          style={{
                            width: index === currentSlide ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Status Tabs */}
          <div className="row mb-4">
            <div className="col-sm-12">
              <div className="card border-0">
                <div className="card-body">
                  <ul className="nav nav-tabs nav-fill" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                        type="button"
                      >
                        All Quizzes ({allQuizzes.length})
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                        type="button"
                      >
                        Active ({allQuizzes.filter(q => q.status?.toLowerCase() === 'active').length})
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === 'ended' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ended')}
                        type="button"
                      >
                        Ended ({allQuizzes.filter(q => q.status?.toLowerCase() === 'ended').length})
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === 'draft' ? 'active' : ''}`}
                        onClick={() => setActiveTab('draft')}
                        type="button"
                      >
                        Draft ({allQuizzes.filter(q => q.status?.toLowerCase() === 'draft').length})
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes Table */}
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  {isLoading ? (
                    <GlobalLoader visible={true} size="medium" />
                  ) : filteredQuizzes.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No quizzes found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table id="quizTable" className="table table-striped">
                        <thead>
                          <tr>
                            <th>Quiz Title</th>
                            <th>Questions</th>
                            <th>Entry Type</th>
                            <th>Participants</th>
                            <th>Prize Pool</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredQuizzes.map((quiz) => (
                            <tr key={quiz.quiz_id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  {quiz.image_path && (
                                    <img
                                      src={quiz.image_path}
                                      alt={quiz.title}
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '4px',
                                        marginRight: '10px',
                                        objectFit: 'cover',
                                        backgroundColor: '#f0f0f0'
                                      }}
                                    />
                                  )}
                                  <div>
                                    <div className="d-flex align-items-center gap-2">
                                      <strong>{quiz.title}</strong>
                                      {quiz.is_featured && (
                                        <span className="badge bg-warning text-dark">
                                          <i className="fas fa-star me-1"></i>Featured
                                        </span>
                                      )}
                                      {quiz.is_sponsored && (
                                        <span className="badge bg-info">
                                          <i className="fas fa-ad me-1"></i>Sponsored
                                        </span>
                                      )}
                                    </div>
                                    <small className="text-muted">{new Date(quiz.end_datetime).toLocaleString()}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{quiz.total_questions}</td>
                              <td>
                                {quiz.entry_type === 'FREE' ? (
                                  <span className="badge bg-success">FREE</span>
                                ) : (
                                  <strong>{quiz.entry_fee} <small>Coins</small></strong>
                                )}
                              </td>
                              <td>   <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => handleViewStats(quiz.quiz_id)}
                                title="View Statistics"
                              >
                                View
                              </button></td>
                              <td>{quiz.prize_pool} Coins </td>
                              <td>
                                <span className={`badge ${getStatusBadgeColor(quiz.status)}`}>
                                  {quiz.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleViewQuestions(quiz)}
                                    title="View Questions"
                                  >
                                    <i className="fas fa-list"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    title="Edit Quiz"
                                    onClick={() => handleEditQuiz(quiz.quiz_id)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    title="Delete Quiz"
                                    onClick={() => handleDeleteQuiz(quiz.quiz_id, quiz.title)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {!isLoading && allQuizzes.length > 0 && (
            <div className="row mt-3">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">
                          Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (Total: <strong>{totalQuizzes}</strong> quizzes)
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => fetchQuizzes(currentPage - 1)}
                          disabled={currentPage === 1 || isLoading}
                        >
                          <i className="fas fa-chevron-left me-1"></i>Previous
                        </button>

                        <div className="d-flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'}`}
                              onClick={() => fetchQuizzes(page)}
                              disabled={isLoading}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => fetchQuizzes(currentPage + 1)}
                          disabled={currentPage === totalPages || isLoading}
                        >
                          Next<i className="fas fa-chevron-right ms-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coin System Info Card */}
          {/* <div className="row mt-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-soft">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">💰 Coin System Configuration</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <small className="text-muted">New User Signup Bonus</small>
                        <p className="mb-0 fw-bold">100 Coins</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <small className="text-muted">Daily Login Reward</small>
                        <p className="mb-0 fw-bold">20 Coins</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <small className="text-muted">Min Entry Fee</small>
                        <p className="mb-0 fw-bold">10 Coins</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <small className="text-muted">Max Entry Fee</small>
                        <p className="mb-0 fw-bold">250 Coins</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <small className="text-muted">Top 10% Reward</small>
                        <p className="mb-0 fw-bold">100%</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <small className="text-muted">Top 25% Reward</small>
                        <p className="mb-0 fw-bold">60%</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <small className="text-muted">Participation Min</small>
                        <p className="mb-0 fw-bold">10%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-soft">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">📋 Leaderboard Types</h6>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0 py-2">
                      <small className="text-muted">Daily</small>
                      <p className="mb-0 fw-bold">Resets at 12:00 AM</p>
                    </div>
                    <div className="list-group-item px-0 py-2">
                      <small className="text-muted">Monthly</small>
                      <p className="mb-0 fw-bold">Resets at Month End</p>
                    </div>
                    <div className="list-group-item px-0 py-2">
                      <small className="text-muted">All Time</small>
                      <p className="mb-0 fw-bold">Never Resets</p>
                    </div>
                    <div className="list-group-item px-0 py-2 pt-3 mt-2 border-top">
                      <small className="text-muted">Ranking By</small>
                      <div className="mt-2">
                        <span className="badge bg-primary me-2">Score</span>
                        <span className="badge bg-primary me-2">Accuracy %</span>
                        <span className="badge bg-primary">Time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

        </div>
      </div>
      <Footer />

      <QuestionsModal
        show={showQuestionsModal}
        quizData={selectedQuiz}
        onClose={handleCloseModal}
        isLoading={false}
        onQuestionsUpdated={handleQuestionsUpdated}
      />

      <QuizStatsModal
        show={showStatsModal}
        quizId={selectedQuizId}
        onClose={handleCloseStatsModal}
      />
    </div>
  );
}
