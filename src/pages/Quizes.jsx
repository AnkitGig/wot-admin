import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function Quizes() {
  const [activeTab, setActiveTab] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (window.DataTable) {
      new window.DataTable('#quizTable', {});
    }
  }, [activeTab]);

  // Static Featured Quizzes Data (for carousel)
  const featuredQuizzes = [
    {
      id: 1,
      title: 'Sponsored: Advanced Technical Analysis',
      course: 'Technical Analysis Mastery',
      type: 'Sponsored',
      participants: 1250,
      prize: '500 Coins',
      description: 'Advanced patterns and market structure analysis with real trading scenarios',
      image: '🎯',
      endTime: '12:00 AM Tonight'
    },
    {
      id: 2,
      title: 'Featured: Smart Money Concepts Deep Dive',
      course: 'Smart Money Concepts',
      type: 'Manual Featured',
      participants: 890,
      prize: '250 Coins',
      description: 'Understand institutional trading strategies and market manipulation',
      image: '💡',
      endTime: '11:59 PM'
    },
    {
      id: 3,
      title: 'Price Action Trading Mastery',
      course: 'Price Action Basics',
      type: 'Automatic Featured',
      participants: 756,
      prize: '200 Coins',
      description: 'Complete guide to reading candlestick patterns and price action signals',
      image: '📊',
      endTime: '2 days left'
    }
  ];

  // Static Quizzes Data
  const allQuizzes = [
    {
      id: 1,
      title: 'TA Basics Quiz',
      course: 'Technical Analysis',
      questions: 15,
      pass: 60,
      status: 'Active',
      type: 'Ongoing',
      entryFee: 50,
      entryType: 'PAID',
      participants: 340,
      rewards: { top10: '50 Coins', top25: '30 Coins', participation: '5 Coins' },
      leaderboardPos: 'Top 10%: 50 Coins | Top 25%: 30 Coins | Others: 5 Coins',
      timeLeft: '3 hours'
    },
    {
      id: 2,
      title: 'SMC Concepts',
      course: 'Smart Money',
      questions: 20,
      pass: 70,
      status: 'Active',
      type: 'Ongoing',
      entryFee: 75,
      entryType: 'PAID',
      participants: 210,
      rewards: { top10: '75 Coins', top25: '45 Coins', participation: '7 Coins' },
      leaderboardPos: 'Top 10%: 75 Coins | Top 25%: 45 Coins | Others: 7 Coins',
      timeLeft: '5 hours'
    },
    {
      id: 3,
      title: 'Risk Management',
      course: 'Forex Risk',
      questions: 10,
      pass: 50,
      status: 'Draft',
      type: 'Upcoming',
      entryFee: 0,
      entryType: 'FREE',
      participants: 0,
      rewards: { top10: '30 Coins', top25: '18 Coins', participation: '3 Coins' },
      leaderboardPos: 'Top 10%: 30 Coins | Top 25%: 18 Coins | Others: 3 Coins',
      timeLeft: 'Starts in 2 hours'
    },
    {
      id: 4,
      title: 'Price Action Indicators',
      course: 'Price Action',
      questions: 12,
      pass: 65,
      status: 'Active',
      type: 'Ongoing',
      entryFee: 60,
      entryType: 'PAID',
      participants: 520,
      rewards: { top10: '60 Coins', top25: '36 Coins', participation: '6 Coins' },
      leaderboardPos: 'Top 10%: 60 Coins | Top 25%: 36 Coins | Others: 6 Coins',
      timeLeft: '1 hour'
    },
    {
      id: 5,
      title: 'AI Trading Fundamentals',
      course: 'AI Trading',
      questions: 8,
      pass: 60,
      status: 'Review',
      type: 'Upcoming',
      entryFee: 100,
      entryType: 'PAID',
      participants: 0,
      rewards: { top10: '100 Coins', top25: '60 Coins', participation: '10 Coins' },
      leaderboardPos: 'Top 10%: 100 Coins | Top 25%: 60 Coins | Others: 10 Coins',
      timeLeft: 'Starts in 24 hours'
    },
    {
      id: 6,
      title: 'Options Greeks Mastery',
      course: 'Options Trading',
      questions: 14,
      pass: 70,
      status: 'Active',
      type: 'Ended',
      entryFee: 85,
      entryType: 'PAID',
      participants: 680,
      rewards: { top10: '85 Coins', top25: '51 Coins', participation: '8 Coins' },
      leaderboardPos: 'Top 10%: 85 Coins | Top 25%: 51 Coins | Others: 8 Coins',
      timeLeft: 'Ended'
    },
    {
      id: 7,
      title: 'Crypto Scalping Signals',
      course: 'Crypto',
      questions: 9,
      pass: 55,
      status: 'Active',
      type: 'Ongoing',
      entryFee: 0,
      entryType: 'FREE',
      participants: 420,
      rewards: { top10: '45 Coins', top25: '27 Coins', participation: '4 Coins' },
      leaderboardPos: 'Top 10%: 45 Coins | Top 25%: 27 Coins | Others: 4 Coins',
      timeLeft: '30 mins'
    }
  ];

  // Filter quizzes based on active tab
  const filteredQuizzes = activeTab === 'all' 
    ? allQuizzes 
    : allQuizzes.filter(q => q.type.toLowerCase() === activeTab.toLowerCase());

  const getTypeBadgeColor = (type) => {
    const colors = {
      'ongoing': 'bg-success',
      'upcoming': 'bg-info',
      'ended': 'bg-secondary'
    };
    return colors[type.toLowerCase()] || 'bg-secondary';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'active': 'bg-success',
      'draft': 'bg-warning',
      'review': 'bg-info',
      'disabled': 'bg-danger'
    };
    return colors[status.toLowerCase()] || 'bg-secondary';
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
                      <a href="#" className="btn btn-primary" data-bs-toggle="dropdown" aria-expanded="false">
                        <span><i className="fe fe-download me-2"></i></span>Export
                      </a>
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
                        className={`nav-link ${activeTab === 'ongoing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ongoing')}
                        type="button"
                      >
                        Ongoing ({allQuizzes.filter(q => q.type === 'Ongoing').length})
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                        type="button"
                      >
                        Upcoming ({allQuizzes.filter(q => q.type === 'Upcoming').length})
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'ended' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ended')}
                        type="button"
                      >
                        Ended ({allQuizzes.filter(q => q.type === 'Ended').length})
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
                  <div className="table-responsive">
                    <table id="quizTable" className="table table-striped">
                      <thead>
                        <tr>
                          <th>Quiz Title</th>
                          <th>Course</th>
                          <th>Type</th>
                          <th>Questions</th>
                          <th>Pass %</th>
                          <th>Entry Fee</th>
                          <th>Participants</th>
                          <th>Rewards</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQuizzes.map((quiz) => (
                          <tr key={quiz.id}>
                            <td>
                              <strong>{quiz.title}</strong>
                              <br />
                              <small className="text-muted">{quiz.timeLeft}</small>
                            </td>
                            <td>{quiz.course}</td>
                            <td>
                              <span className={`badge ${getTypeBadgeColor(quiz.type)}`}>
                                {quiz.type}
                              </span>
                            </td>
                            <td>{quiz.questions}</td>
                            <td>{quiz.pass}%</td>
                            <td>
                              {quiz.entryType === 'FREE' ? (
                                <span className="badge bg-success">FREE</span>
                              ) : (
                                <strong>{quiz.entryFee} <small>Coins</small></strong>
                              )}
                            </td>
                            <td>{quiz.participants}</td>
                            <td>
                              <small className="text-muted" title={quiz.leaderboardPos}>
                                {quiz.leaderboardPos}
                              </small>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeColor(quiz.status)}`}>
                                {quiz.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-warning"
                                  title="Edit Quiz"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-info"
                                  title="Mark as Featured"
                                >
                                  <i className="fas fa-star"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete"
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
                </div>
              </div>
            </div>
          </div>

          {/* Coin System Info Card */}
          <div className="row mt-4">
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
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
