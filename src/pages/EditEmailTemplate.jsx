import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import { updateEmailTemplate, getEmailTemplates } from '../api/tools';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function EditEmailTemplate() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'visual', or 'code'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' or 'mobile'
  const [bodyContent, setBodyContent] = useState('');

  const [formData, setFormData] = useState({
    template_key: '',
    language: '',
    subject: '',
    title: '',
    intro_text: '',
    footer_text: '',
    amount_label: '',
    html_content: ''
  });

  useEffect(() => {
    if (location.state && location.state.template) {
      setFormData({
        template_key: location.state.template.template_key || '',
        language: location.state.template.language || '',
        subject: location.state.template.subject || '',
        title: location.state.template.title || '',
        intro_text: location.state.template.intro_text || '',
        footer_text: location.state.template.footer_text || '',
        amount_label: location.state.template.amount_label || '',
        html_content: location.state.template.html_content || ''
      });
      setFetching(false);
    } else {
      fetchTemplate(id);
    }
  }, [id, location.state]);

  const fetchTemplate = async (templateId) => {
    setFetching(true);
    const result = await getEmailTemplates(token);
    if (result.success) {
      const template = result.data.find((t) => t.id === parseInt(templateId));
      if (template) {
        setFormData({
          template_key: template.template_key || '',
          language: template.language || '',
          subject: template.subject || '',
          title: template.title || '',
          intro_text: template.intro_text || '',
          footer_text: template.footer_text || '',
          amount_label: template.amount_label || '',
          html_content: template.html_content || ''
        });
      } else {
        Swal.fire('Error', 'Template not found', 'error').then(() => {
          navigate('/email-templates');
        });
      }
    } else {
      Swal.fire('Error', result.message || 'Failed to fetch template', 'error');
    }
    setFetching(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const extractBody = (html) => {
    const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return match ? match[1] : html;
  };

  const injectBody = (fullHtml, newBody) => {
    const regex = /<body([^>]*)>([\s\S]*)<\/body>/i;
    if (regex.test(fullHtml)) {
      return fullHtml.replace(regex, `<body$1>${newBody}</body>`);
    }
    return newBody;
  };

  const handleViewModeChange = (mode) => {
    if (mode === 'visual') {
      setBodyContent(extractBody(formData.html_content));
    } else if (viewMode === 'visual') {
      // If leaving visual mode, sync back to HTML content
      setFormData(prev => ({
        ...prev,
        html_content: injectBody(prev.html_content, bodyContent)
      }));
    }
    setViewMode(mode);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    let finalHtml = formData.html_content;
    if (viewMode === 'visual') {
      finalHtml = injectBody(formData.html_content, bodyContent);
    }

    const submissionData = {
      ...formData,
      html_content: finalHtml
    };

    const result = await updateEmailTemplate(token, id, submissionData);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'Email template updated successfully',
        timer: 1500
      }).then(() => {
        navigate('/email-templates');
      });
    } else {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: result.message });
    }
    setIsLoading(false);
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header d-flex justify-content-between align-items-center">
            <h5>Edit Responsive Email Template</h5>
            <div className="btn-group">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/email-templates')}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
              <button className="btn btn-primary btn-sm ms-2" onClick={handleSubmit} disabled={isLoading}>
                <i className="fas fa-save"></i> Save Changes
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {/* Toolbar */}
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                <div className="btn-group">
                  <button className={`btn btn-sm ${viewMode === 'split' ? 'btn-primary' : 'btn-white'}`} onClick={() => handleViewModeChange('split')}>Split View</button>
                  <button className={`btn btn-sm ${viewMode === 'code' ? 'btn-primary' : 'btn-white'}`} onClick={() => handleViewModeChange('code')}>Full Code</button>
                  <button className={`btn btn-sm ${viewMode === 'visual' ? 'btn-primary' : 'btn-white'}`} onClick={() => handleViewModeChange('visual')}>Visual Editor</button>
                </div>

                {(viewMode === 'split' || viewMode === 'code') && (
                  <div className="btn-group ms-3">
                    <button className={`btn btn-sm ${previewDevice === 'desktop' ? 'btn-info text-white' : 'btn-white'}`} onClick={() => setPreviewDevice('desktop')}>
                      <i className="fas fa-desktop"></i> Desktop
                    </button>
                    <button className={`btn btn-sm ${previewDevice === 'mobile' ? 'btn-info text-white' : 'btn-white'}`} onClick={() => setPreviewDevice('mobile')}>
                      <i className="fas fa-mobile-alt"></i> Mobile
                    </button>
                  </div>
                )}
              </div>

              {/* Editor Area */}
              <div className="row g-0" style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
                {/* Editor Column */}
                {(viewMode === 'split' || viewMode === 'code') && (
                  <div className={`${viewMode === 'split' ? 'col-md-6' : 'col-12'} border-end h-100`}>
                    <textarea
                      className="form-control h-100 border-0"
                      name="html_content"
                      value={formData.html_content}
                      onChange={handleInputChange}
                      style={{
                        fontFamily: 'monospace',
                        backgroundColor: '#1e1e1e',
                        color: '#d4d4d4',
                        padding: '20px',
                        resize: 'none',
                        fontSize: '13px'
                      }}
                      placeholder="Enter HTML here..."
                    />
                  </div>
                )}

                {/* Visual Editor Column */}
                {viewMode === 'visual' && (
                  <div className="col-12 h-100">
                    <ReactQuill
                      theme="snow"
                      value={bodyContent}
                      onChange={setBodyContent}
                      style={{ height: '90%' }}
                    />
                  </div>
                )}

                {/* Preview Column */}
                {viewMode === 'split' && (
                  <div className="col-md-6 bg-secondary d-flex justify-content-center align-items-center p-3" style={{ overflow: 'hidden' }}>
                    <div
                      className="bg-white shadow-lg transition-all"
                      style={{
                        width: previewDevice === 'mobile' ? '375px' : '100%',
                        height: '100%',
                        borderRadius: previewDevice === 'mobile' ? '20px' : '0',
                        overflow: 'hidden',
                        border: previewDevice === 'mobile' ? '10px solid #333' : 'none'
                      }}
                    >
                      <iframe
                        title="Preview"
                        srcDoc={formData.html_content}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
