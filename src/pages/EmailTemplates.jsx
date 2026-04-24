import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { getEmailTemplates } from '../api/tools';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function EmailTemplates() {
  const { token } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    const result = await getEmailTemplates(token);
    if (result.success) {
      setTemplates(result.data);
    } else {
      Swal.fire('Error', result.message || 'Failed to fetch email templates', 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Email Templates</h5>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  {isLoading ? (
                    <div className="d-flex justify-content-center my-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-center mb-0">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Key</th>
                            <th>Subject</th>
                            <th>Language</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {templates.length > 0 ? (
                            templates.map((template) => (
                              <tr key={template.id}>
                                <td>{template.id}</td>
                                <td>{template.template_key}</td>
                                <td>{template.subject}</td>
                                <td>{template.language}</td>
                                <td>
                                  <Link
                                    to={`/edit-email-template/${template.id}`}
                                    state={{ template }}
                                    className="btn btn-sm btn-outline-primary"
                                  >
                                    <i className="fas fa-edit me-1"></i> Edit
                                  </Link>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center">No email templates found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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
