import { useState, useEffect } from 'react';
import GlobalLoader from './GlobalLoader';

export default function QuizStatsModal({ show, quizId, onClose }) {
  const [quizStats, setQuizStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [show]);

  useEffect(() => {
    if (show && quizId) {
      fetchQuizStats();
    }
  }, [show, quizId]);

  const fetchQuizStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.wayoftrading.com/aitredding/quiz/admin/quiz-stats/${quizId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz statistics');
      }

      const data = await response.json();
      setQuizStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setQuizStats(null);
    setError(null);
    onClose();
  };

  if (!show) return null;

  return (
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
            <h5 className="modal-title">Quiz Statistics</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            {isLoading ? (
              <GlobalLoader visible={true} size="medium" />
            ) : error ? (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : quizStats ? (
              <div>
                {/* Quiz Overview */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="fw-bold mb-3">Quiz Overview</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <p className="mb-2"><strong>Title:</strong> {quizStats.quiz_title}</p>
                            <p className="mb-2"><strong>Status:</strong> 
                              <span className={`badge ms-2 ${
                                quizStats.quiz_status === 'active' ? 'bg-success' : 
                                quizStats.quiz_status === 'ended' ? 'bg-secondary' : 
                                quizStats.quiz_status === 'draft' ? 'bg-warning' : 'bg-info'
                              }`}>
                                {quizStats.quiz_status}
                              </span>
                            </p>
                            <p className="mb-2"><strong>Entry Type:</strong> 
                              <span className={`badge ms-2 ${
                                quizStats.entry_type === 'FREE' ? 'bg-success' : 'bg-primary'
                              }`}>
                                {quizStats.entry_type}
                              </span>
                            </p>
                          </div>
                          <div className="col-md-6">
                            <p className="mb-2"><strong>Entry Fee:</strong> {quizStats.entry_fee} Coins</p>
                            <p className="mb-2"><strong>Prize Pool:</strong> {quizStats.prize_pool} Coins</p>
                            <p className="mb-2"><strong>Total Players:</strong> {quizStats.total_players}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="fw-bold mb-3">Financial Summary</h6>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="card border-primary">
                          <div className="card-body text-center">
                            <h6 className="text-primary">Total Coins Collected</h6>
                            <h3 className="mb-0">{quizStats.total_coins_collected}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card border-success">
                          <div className="card-body text-center">
                            <h6 className="text-success">Total Coins Distributed</h6>
                            <h3 className="mb-0">{quizStats.total_coins_distributed}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card border-info">
                          <div className="card-body text-center">
                            <h6 className="text-info">Coin Profit</h6>
                            <h3 className="mb-0">{quizStats.coin_profit}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Players Table */}
                <div className="row">
                  <div className="col-12">
                    <h6 className="fw-bold mb-3">Player Performance</h6>
                    {quizStats.players && quizStats.players.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Player</th>
                              <th>Total Attempts</th>
                              <th>Time Taken</th>
                              <th>Best Score</th>
                              <th>Best Accuracy</th>
                              <th>Coins Spent</th>
                              <th>Coins Earned</th>
                              <th>Last Played</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quizStats.players.map((player, index) => (
                              <tr key={player.user_id}>
                                <td>
                                  <span className={`badge ${
                                    player.rank === 1 ? 'bg-warning' : 
                                    player.rank === 2 ? 'bg-secondary' : 
                                    player.rank === 3 ? 'bg-danger' : 'bg-primary'
                                  }`}>
                                    #{player.rank}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img 
                                      src={player.profile_image} 
                                      alt={player.name}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        marginRight: '10px',
                                        objectFit: 'cover',
                                        backgroundColor: '#f0f0f0'
                                      }}
                                      onError={(e) => {
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGMEYwRjAiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggMTBDNS43OTA4NiAxMCA0IDguMjA5MTQgNCA2QzQgMy43OTA4NiA1Ljc5MDg2IDIgOCAyQzEwLjIwOTEgMiAxMiAzLjc5MDg2IDEyIDZDMTIgOC4yMDkxNCAxMC4yMDkxIDEwIDggMTBaIiBmaWxsPSIjOTk5Ii8+CjxwYXRoIGQ9Ik0yIDEzQzIgMTEuMzQzMSAzLjM0MzE1IDEwIDUgMTBIMTEuMDE0MkMxMi42NzExIDEwIDE0IDExLjM0MzEgMTQgMTNWMTRIMlYxM1oiIGZpbGw9IiM5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo=';
                                      }}
                                    />
                                    <div>
                                      <strong>{player.name}</strong>
                                      {player.coins_pending && (
                                        <div><small className="text-warning">Coins Pending</small></div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td>{player.total_attempts}</td>
                                <td>{player.time_taken_formatted}</td>
                                <td>{player.best_score}</td>
                                <td>{player.best_accuracy}</td>
                                <td>{player.coins_spent}</td>
                                <td>{player.coins_earned}</td>
                                <td>{new Date(player.last_played).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        No players have participated in this quiz yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                No statistics available for this quiz.
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
