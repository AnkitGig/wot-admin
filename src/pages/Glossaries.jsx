import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  getAllGlossaries,
  deleteGlossary,
  updateGlossary,
  getAllGlossaryCategories,
  searchGlossaries,
  deleteAllGlossaries
} from '../api/glossary';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

// ---------- DUMMY DATA (flat for demo, but edit will convert to multilingual) ----------
const DUMMY_GLOSSARIES = [
 
];

const DUMMY_CATEGORIES = []
 

export default function Glossaries() {
  const { token } = useAuth();
  const [glossaries, setGlossaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGlossary, setEditingGlossary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  // Multilingual edit form data
  const [editFormData, setEditFormData] = useState({
    term_en: '',
    term_fr: '',
    term_es: '',
    short_form: '',
    category_en: '',
    category_fr: '',
    category_es: '',
    description_en: '',
    description_fr: '',
    description_es: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    count: 0
  });
  const [selectedGlossaries, setSelectedGlossaries] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);

  const abortControllerRef = useRef(null);
  const categoriesAbortRef = useRef(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      categoriesAbortRef.current?.abort();
    };
  }, []);

  // Helper: apply search/pagination on dummy data (flat)
  const applyDummyFilter = (data, term, page, limit) => {
    let filtered = [...data];
    if (term) {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.term.toLowerCase().includes(lowerTerm) ||
          (g.description && g.description.toLowerCase().includes(lowerTerm)) ||
          (g.category && g.category.toLowerCase().includes(lowerTerm))
      );
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    return { data: paginated, total, count: paginated.length };
  };

  const fetchCategories = async () => {
    if (categoriesAbortRef.current) categoriesAbortRef.current.abort();
    categoriesAbortRef.current = new AbortController();
    setCategoriesLoading(true);

    if (!token) {
      
      setCategoriesLoading(false);
      
      return;
    }

    try {
      const result = await getAllGlossaryCategories(token, 1, 100, {
        signal: categoriesAbortRef.current.signal
      });
      if (result.status === 1 || result.count === 0) {
        setCategories(result.data || []);
      } else {
        setCategories(DUMMY_CATEGORIES);
       
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setCategories(DUMMY_CATEGORIES);
       
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchGlossaries = async (pageNumber = 1) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
   

    if (!token) {
      const { data, total, count } = applyDummyFilter(DUMMY_GLOSSARIES, '', pageNumber, pagination.limit);
      setGlossaries(data);
      setPagination({ page: pageNumber, limit: pagination.limit, total, count });
      setIsLoading(false);
    
      return;
    }

    try {
      const result = await getAllGlossaries(token, pageNumber, pagination.limit, {
        signal: abortControllerRef.current.signal
      });
      if (result?.success) {
        setGlossaries(result.data || []);
        setPagination(
          result.pagination || {
            page: pageNumber,
            limit: pagination.limit,
            total: 0,
            count: 0
          }
        );
        setSelectedGlossaries([]);
        setSelectAll(false);
      } else {
        throw new Error(result?.message || 'Failed to load glossaries');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const { data, total, count } = applyDummyFilter(DUMMY_GLOSSARIES, '', pageNumber, pagination.limit);
        setGlossaries(data);
        setPagination({ page: pageNumber, limit: pagination.limit, total, count });
     
        setError(`Using demo data. Real API error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (pageNumber = 1) => {
    if (!searchTerm.trim()) {
      fetchGlossaries(pageNumber);
      return;
    }

    if (isUsingDummyData || !token) {
      setIsLoading(true);
      const { data, total, count } = applyDummyFilter(DUMMY_GLOSSARIES, searchTerm, pageNumber, pagination.limit);
      setGlossaries(data);
      setPagination({ page: pageNumber, limit: pagination.limit, total, count });
      setIsSearching(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsSearching(true);
    setError(null);
    try {
      const result = await searchGlossaries(token, searchTerm.trim(), pageNumber, pagination.limit);
      if (result?.success) {
        setGlossaries(result.data || []);
        setPagination(
          result.pagination || {
            page: pageNumber,
            limit: pagination.limit,
            total: 0,
            count: 0
          }
        );
        setSelectedGlossaries([]);
        setSelectAll(false);
      } else {
        throw new Error(result?.message || 'Search failed');
      }
    } catch (err) {
      const { data, total, count } = applyDummyFilter(DUMMY_GLOSSARIES, searchTerm, pageNumber, pagination.limit);
      setGlossaries(data);
      setPagination({ page: pageNumber, limit: pagination.limit, total, count });
      setError(`Search failed: ${err.message}. Showing local results.`);
   
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        handleSearch(1);
      } else {
        setIsSearching(false);
        fetchGlossaries(1);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchGlossaries(1);
  }, []);

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    fetchGlossaries(1);
  };

  const handlePageChange = (newPage) => {
    if (searchTerm.trim()) {
      handleSearch(newPage);
    } else {
      fetchGlossaries(newPage);
    }
  };

  // Populate edit modal - handle both flat and nested structures
  const handleEditClick = (glossary) => {
    setEditingGlossary(glossary);
    
    // Check if glossary has nested multilingual fields
    const hasNested = glossary.term && typeof glossary.term === 'object';
    
    setEditFormData({
      term_en: hasNested ? (glossary.term.en || '') : (glossary.term || ''),
      term_fr: hasNested ? (glossary.term.fr || '') : (glossary.term || ''),
      term_es: hasNested ? (glossary.term.es || '') : (glossary.term || ''),
      short_form: glossary.short_form || '',
      category_en: hasNested ? (glossary.category?.en || '') : (glossary.category || ''),
      category_fr: hasNested ? (glossary.category?.fr || '') : (glossary.category || ''),
      category_es: hasNested ? (glossary.category?.es || '') : (glossary.category || ''),
      description_en: hasNested ? (glossary.description?.en || '') : (glossary.description || ''),
      description_fr: hasNested ? (glossary.description?.fr || '') : (glossary.description || ''),
      description_es: hasNested ? (glossary.description?.es || '') : (glossary.description || '')
    });
    
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields (at least English term and category)
    if (!editFormData.term_en.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'English term is required.' });
      return;
    }
    if (!editFormData.category_en.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'English category is required.' });
      return;
    }

    if (isUsingDummyData || !token) {
      Swal.fire({
        icon: 'info',
        title: 'Demo Mode',
        text: 'Edit is disabled because the API is unavailable. Changes are not saved.'
      });
      setShowEditModal(false);
      return;
    }

    // Build the correct multilingual payload
    const payload = {
      term: {
        en: editFormData.term_en,
        fr: editFormData.term_fr || editFormData.term_en,  // fallback to English if empty
        es: editFormData.term_es || editFormData.term_en
      },
      short_form: editFormData.short_form,
      category: {
        en: editFormData.category_en,
        fr: editFormData.category_fr || editFormData.category_en,
        es: editFormData.category_es || editFormData.category_en
      },
      description: {
        en: editFormData.description_en,
        fr: editFormData.description_fr || editFormData.description_en,
        es: editFormData.description_es || editFormData.description_en
      }
    };

    setIsLoading(true);
    try {
      const updateResult = await updateGlossary(editingGlossary.id, payload, token);
      if (updateResult.success) {
        Swal.fire({
          icon: 'success',
          title: 'Updated',
          text: updateResult.message || 'Glossary updated successfully',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          setShowEditModal(false);
          searchTerm.trim() ? handleSearch(pagination.page) : fetchGlossaries(pagination.page);
        });
      } else {
        throw new Error(updateResult.message || 'Update failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed to Update', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGlossary = (glossaryId, glossaryTerm) => {
    if (isUsingDummyData || !token) {
      Swal.fire({ icon: 'info', title: 'Demo Mode', text: 'Delete is disabled because the API is unavailable.' });
      return;
    }

    Swal.fire({
      title: 'Delete Glossary',
      text: `Are you sure you want to delete "${glossaryTerm}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteResult = await deleteGlossary(glossaryId, token);
          if (deleteResult.success) {
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false }).then(() => {
              searchTerm.trim() ? handleSearch(pagination.page) : fetchGlossaries(pagination.page);
            });
          } else {
            throw new Error(deleteResult.message || 'Delete failed');
          }
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Failed to Delete', text: err.message });
        }
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedGlossaries([]);
    } else {
      setSelectedGlossaries(glossaries.map(g => g.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOne = (id) => {
    if (selectedGlossaries.includes(id)) {
      setSelectedGlossaries(selectedGlossaries.filter(item => item !== id));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedGlossaries, id];
      setSelectedGlossaries(newSelected);
      if (newSelected.length === glossaries.length) setSelectAll(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedGlossaries.length === 0) return;
    if (isUsingDummyData || !token) {
      Swal.fire({ icon: 'info', title: 'Demo Mode', text: 'Bulk delete is not available in demo mode.' });
      return;
    }

    Swal.fire({
      title: 'Delete Selected',
      text: `Delete ${selectedGlossaries.length} selected glossaries?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          const deleteResult = await deleteAllGlossaries(selectedGlossaries, token);
          if (deleteResult.success) {
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false }).then(() => {
              searchTerm.trim() ? handleSearch(pagination.page) : fetchGlossaries(pagination.page);
            });
          } else {
            throw new Error(deleteResult.message || 'Bulk delete failed');
          }
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Failed', text: err.message });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Helper to display term from possibly nested object
  const getDisplayTerm = (glossary) => {
    if (glossary.term && typeof glossary.term === 'object') return glossary.term.en || '';
    return glossary.term || '';
  };

  const getDisplayCategory = (glossary) => {
    if (glossary.category && typeof glossary.category === 'object') return glossary.category.en || '';
    return glossary.category || '';
  };

  const getDisplayDescription = (glossary) => {
    if (glossary.description && typeof glossary.description === 'object') return glossary.description.en || '';
    return glossary.description || '';
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
                <h5>Glossaries</h5>
                {isUsingDummyData && <span className="badge bg-warning text-dark ms-2">Demo Mode (API offline)</span>}
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li><Link className="btn btn-primary" to="/glossary-categories">View Categories</Link></li>
                  <li><Link className="btn btn-primary" to="/add-glossary-category"><i className="fa fa-plus-circle me-2"></i>Add Glossary Category</Link></li>
                  <li><Link className="btn btn-primary" to="/add-glossary"><i className="fa fa-plus-circle me-2"></i>Add Glossary</Link></li>
                  {selectedGlossaries.length > 0 && !isUsingDummyData && (
                    <li><button className="btn btn-danger" onClick={handleBulkDelete}><i className="fas fa-trash me-2"></i>Delete Selected ({selectedGlossaries.length})</button></li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-5">
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-search"></i></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search glossary terms..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <button className="btn btn-outline-secondary" onClick={handleClearSearch}>
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                      {isSearching && searchTerm && (
                        <small className="text-muted mt-1 d-block">Search results for: <strong>"{searchTerm}"</strong></small>
                      )}
                      {error && (
                        <div className="alert alert-warning mt-2 py-1 small">
                          <i className="fas fa-exclamation-triangle me-1"></i> {error}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}>
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                disabled={glossaries.length === 0 || isUsingDummyData}
                              />
                            </div>
                          </th>
                          <th>Term (EN)</th>
                          <th>Short Form</th>
                          <th>Category (EN)</th>
                          <th>Description (EN)</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr><td colSpan="6" className="text-center py-5"><GlobalLoader visible={true} size="medium" /></td></tr>
                        ) : glossaries.length === 0 ? (
                          <tr><td colSpan="6" className="text-center py-5">
                            <p className="text-muted">{isSearching ? `No results for "${searchTerm}"` : 'No glossaries found'}</p>
                            {isSearching && <button className="btn btn-sm btn-outline-secondary mt-2" onClick={handleClearSearch}>Clear Search</button>}
                          </td></tr>
                        ) : (
                          glossaries.map((glossary) => (
                            <tr key={glossary.id}>
                              <td><div className="form-check"><input type="checkbox" className="form-check-input" checked={selectedGlossaries.includes(glossary.id)} onChange={() => handleSelectOne(glossary.id)} disabled={isUsingDummyData} /></div></td>
                              <td><strong>{getDisplayTerm(glossary)}</strong></td>
                              <td>{glossary.short_form || '—'}</td>
                              <td><span className="badge bg-secondary">{getDisplayCategory(glossary)}</span></td>
                              <td><small title={getDisplayDescription(glossary)}>{getDisplayDescription(glossary)?.substring(0, 60)}...</small></td>
                              <td className="text-end">
                                <div className="d-flex gap-2 justify-content-end">
                                  <button className="btn btn-sm btn-info me-1" onClick={() => handleEditClick(glossary)} title="Edit Glossary"><i className="fas fa-edit"></i></button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteGlossary(glossary.id, getDisplayTerm(glossary))} title="Delete Glossary"><i className="fas fa-trash"></i></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {totalPages > 1 && glossaries.length > 0 && (
            <div className="row mt-3">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <small className="text-muted">Page {pagination.page} of {totalPages} | Showing {glossaries.length} of {pagination.total} glossaries</small>
                    <nav>
                      <ul className="pagination mb-0">
                        <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(pagination.page - 1)}>Previous</button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .slice(Math.max(0, pagination.page - 2), Math.min(totalPages, pagination.page + 1))
                          .map((page) => (
                            <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
                            </li>
                          ))}
                        <li className={`page-item ${pagination.page === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(pagination.page + 1)}>Next</button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal - Multilingual */}
      <div className={`modal fade ${showEditModal ? 'show' : ''}`} style={{ display: showEditModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Glossary</h5>
              <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {/* Term - 3 languages */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">English Term <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="term_en" value={editFormData.term_en} onChange={handleEditInputChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">French Term</label>
                    <input type="text" className="form-control" name="term_fr" value={editFormData.term_fr} onChange={handleEditInputChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Spanish Term</label>
                    <input type="text" className="form-control" name="term_es" value={editFormData.term_es} onChange={handleEditInputChange} />
                  </div>
                </div>

                {/* Short Form */}
                <div className="mb-3">
                  <label className="form-label">Short Form</label>
                  <input type="text" className="form-control" name="short_form" value={editFormData.short_form} onChange={handleEditInputChange} placeholder="e.g., BTC" />
                </div>

                {/* Category - 3 languages */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">English Category <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="category_en" value={editFormData.category_en} onChange={handleEditInputChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">French Category</label>
                    <input type="text" className="form-control" name="category_fr" value={editFormData.category_fr} onChange={handleEditInputChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Spanish Category</label>
                    <input type="text" className="form-control" name="category_es" value={editFormData.category_es} onChange={handleEditInputChange} />
                  </div>
                </div>

                {/* Description - 3 languages */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">English Description</label>
                    <textarea className="form-control" rows="3" name="description_en" value={editFormData.description_en} onChange={handleEditInputChange}></textarea>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">French Description</label>
                    <textarea className="form-control" rows="3" name="description_fr" value={editFormData.description_fr} onChange={handleEditInputChange}></textarea>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Spanish Description</label>
                    <textarea className="form-control" rows="3" name="description_es" value={editFormData.description_es} onChange={handleEditInputChange}></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}