import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getUsers } from '../api/users';
import { broadcastNotification } from '../api/tools';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const Notifications = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: {
      english: '',
      french: '',
      spanish: ''
    },
    body: {
      english: '',
      french: '',
      spanish: ''
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers(token, 1, 100);
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (field, lang, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
  };

  const handleUserToggle = (email) => {
    setSelectedUsers(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.english.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'English title is required' });
      return;
    }
    if (!formData.body.english.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'English body is required' });
      return;
    }

    if (!sendToAll && selectedUsers.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please select at least one user' });
      return;
    }

    const payload = {
      title: formData.title,
      body: formData.body,
    };

    if (!sendToAll) {
      payload.emails = selectedUsers;
    }

    setLoading(true);

    try {
      const result = await broadcastNotification(token, payload);
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: result.message || 'Notification sent successfully',
          timer: 1500,
          showConfirmButton: false
        });

        // Reset form
        setFormData({
          title: { english: '', french: '', spanish: '' },
          body: { english: '', french: '', spanish: '' }
        });
        setSelectedUsers([]);
        setSendToAll(true);
      } else {
        Swal.fire({ icon: 'error', title: 'Failed', text: result.message || 'Failed to send notification' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">

          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Broadcast Notifications</h5>
                <p className="text-muted mt-1">Send multi-language push notifications to your users</p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>

                    {/* Language Titles Section */}
                    <div className="form-group-item">
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <h6 className="text-primary"><i className="fas fa-heading me-2"></i>Notification Titles</h6>
                          <hr />
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>English Title <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="English Title"
                              value={formData.title.english}
                              onChange={(e) => handleInputChange('title', 'english', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>French Title</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="French Title"
                              value={formData.title.french}
                              onChange={(e) => handleInputChange('title', 'french', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Spanish Title</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Spanish Title"
                              value={formData.title.spanish}
                              onChange={(e) => handleInputChange('title', 'spanish', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Language Bodies Section */}
                    <div className="form-group-item mt-4">
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <h6 className="text-primary"><i className="fas fa-align-left me-2"></i>Notification Content</h6>
                          <hr />
                        </div>
                        <div className="col-md-12 mb-3">
                          <div className="form-group">
                            <label>English Body <span className="text-danger">*</span></label>
                            <textarea
                              className="form-control"
                              rows="3"
                              placeholder="English Content"
                              value={formData.body.english}
                              onChange={(e) => handleInputChange('body', 'english', e.target.value)}
                            ></textarea>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>French Body</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              placeholder="French Content"
                              value={formData.body.french}
                              onChange={(e) => handleInputChange('body', 'french', e.target.value)}
                            ></textarea>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Spanish Body</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              placeholder="Spanish Content"
                              value={formData.body.spanish}
                              onChange={(e) => handleInputChange('body', 'spanish', e.target.value)}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Targeting Section */}
                    <div className="form-group-item mt-4">
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <h6 className="text-primary"><i className="fas fa-users me-2"></i>Recipients</h6>
                          <hr />
                        </div>
                        <div className="col-md-12">
                          <div className="form-group">
                            <label className="d-block">Send To:</label>
                            <div className="btn-group w-100" role="group">
                              <button
                                type="button"
                                className={`btn ${sendToAll ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSendToAll(true)}
                              >
                                All Users
                              </button>
                              <button
                                type="button"
                                className={`btn ${!sendToAll ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSendToAll(false)}
                              >
                                Selected Users
                              </button>
                            </div>
                          </div>
                        </div>

                      {!sendToAll && (
                          <div className="col-md-12 mt-3">
                            <div className="form-group">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="mb-0">Search and Select Users</label>
                                {filteredUsers.length > 0 && (
                                  <button 
                                    type="button" 
                                    className="btn btn-sm btn-soft-primary"
                                    onClick={() => {
                                      const allFilteredEmails = filteredUsers.map(u => u.email);
                                      const allSelected = allFilteredEmails.every(email => selectedUsers.includes(email));
                                      if (allSelected) {
                                        setSelectedUsers(prev => prev.filter(email => !allFilteredEmails.includes(email)));
                                      } else {
                                        setSelectedUsers(prev => [...new Set([...prev, ...allFilteredEmails])]);
                                      }
                                    }}
                                  >
                                    {filteredUsers.every(u => selectedUsers.includes(u.email)) ? 'Deselect All' : 'Select All Filtered'}
                                  </button>
                                )}
                              </div>
                              <div className="input-group mb-3 shadow-sm">
                                <span className="input-group-text border-0 bg-white"><i className="fas fa-search text-muted"></i></span>
                                <input
                                  type="text"
                                  className="form-control border-0"
                                  placeholder="Search by name or email..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                />
                              </div>
                              <div className="user-selection-list border rounded-3 p-2 bg-light-gray" style={{ maxHeight: '350px', overflowY: 'auto', background: '#f8f9fa' }}>
                                {filteredUsers.map(user => {
                                  const isSelected = selectedUsers.includes(user.email);
                                  return (
                                    <div
                                      key={user.user_id}
                                      className={`d-flex align-items-center p-3 mb-2 rounded-3 transition-all border ${isSelected ? 'border-primary bg-white shadow-sm' : 'border-transparent bg-white'}`}
                                      onClick={() => handleUserToggle(user.email)}
                                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                    >
                                      <div className="form-check mb-0 me-3">
                                        <input 
                                          className="form-check-input" 
                                          type="checkbox" 
                                          checked={isSelected}
                                          onChange={() => {}} // Handled by div onClick
                                          style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                                        />
                                      </div>
                                      <div className="avatar avatar-sm me-3 bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', minWidth: '40px', background: 'rgba(28, 73, 224, 0.1)' }}>
                                        {(user.name || 'A').charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-grow-1">
                                        <div className={`fw-bold mb-0 ${isSelected ? 'text-primary' : ''}`}>{user.name || 'Anonymous'}</div>
                                        <div className="small text-muted">{user.email}</div>
                                      </div>
                                      {isSelected && (
                                        <span className="badge bg-primary-light text-primary rounded-pill px-2 py-1">
                                          <i className="fas fa-check me-1"></i> Selected
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                                {filteredUsers.length === 0 && (
                                  <div className="text-center py-5">
                                    <i className="fas fa-user-slash fa-3x text-light mb-3"></i>
                                    <p className="text-muted">No users found matching your search</p>
                                  </div>
                                )}
                              </div>
                              <div className="mt-3 d-flex align-items-center justify-content-between px-2">
                                <div className="small text-muted">
                                  Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
                                </div>
                                <div className="badge bg-dark text-white p-2 px-3 rounded-pill">
                                  Selected: {selectedUsers.length} users
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {sendToAll && (
                          <div className="col-md-12 mt-2">
                            <div className="alert alert-info py-2 mb-0">
                              <i className="fas fa-info-circle me-2"></i>
                              This notification will be broadcasted to <strong>all</strong> registered users.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-end mt-4 pt-3 border-top">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg px-5"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Broadcasting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>Broadcast Now
                          </>
                        )}
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
};

export default Notifications;
