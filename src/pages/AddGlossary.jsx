import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addGlossary, getAllGlossaryCategories, importGlossaryFromJSON } from '../api/glossary';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function AddGlossary() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importMode, setImportMode] = useState(false);
  const [formData, setFormData] = useState({
    term: '',
    short_form: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const fetchCategories = async () => {
    if (!token) return;
    
    setCategoriesLoading(true);
    try {
      const result = await getAllGlossaryCategories(token, 1, 100); // Fetch up to 100 categories
      if (result.success) {
        setCategories(result.data || []);
      } else {
        console.error('Failed to fetch categories:', result.message);
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'Could not load categories. Using default options.',
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Could not load categories. Using default options.',
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/json') {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select a JSON file',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const validateJSONStructure = (data) => {
    console.log('JSON data received:', data);
    console.log('Type of data:', typeof data);
    console.log('Is array?', Array.isArray(data));
    console.log('Object keys:', Object.keys(data));
    
    let glossaryArray = data;
    
    // Handle different JSON structures
    if (!Array.isArray(data)) {
      // Check if data has a property containing an array
      if (data.data && Array.isArray(data.data)) {
        glossaryArray = data.data;
        console.log('Found array in data property');
      } else if (data.glossaries && Array.isArray(data.glossaries)) {
        glossaryArray = data.glossaries;
        console.log('Found array in glossaries property');
      } else if (data.items && Array.isArray(data.items)) {
        glossaryArray = data.items;
        console.log('Found array in items property');
      } else if (data.glossary && Array.isArray(data.glossary)) {
        glossaryArray = data.glossary;
        console.log('Found array in glossary property');
      } else {
        // Check if it's alphabetical structure (A, B, C, etc.)
        const keys = Object.keys(data);
        const isAlphabeticalStructure = keys.every(key => {
          const value = data[key];
          return Array.isArray(value) && value.length > 0 && 
                 value[0].term && (value[0].definition || value[0].description);
        });
        
        if (isAlphabeticalStructure) {
          console.log('Found alphabetical structure, flattening arrays');
          glossaryArray = [];
          keys.forEach(key => {
            glossaryArray = glossaryArray.concat(data[key]);
          });
          console.log('Flattened array length:', glossaryArray.length);
        } else {
          // Check if it's a single object - wrap it in an array
          if (data.term && data.short_form && data.category && (data.description || data.definition)) {
            glossaryArray = [data];
            console.log('Single glossary object found, wrapping in array');
          } else {
            console.log('No valid structure found, object keys:', Object.keys(data));
            return { 
              valid: false, 
              message: `JSON must be an array of glossary terms or contain a single glossary object. Found object with keys: ${Object.keys(data).join(', ')}` 
            };
          }
        }
      }
    }

    for (let i = 0; i < glossaryArray.length; i++) {
      const item = glossaryArray[i];
      
      // Handle different field names
      const term = item.term;
      const category = item.category;
      const definition = item.definition;
      const description = item.description;
      
      console.log(`Processing item ${i}:`, { term, category, definition, description });
      
      // Convert definition to description if description is missing
      if (!item.description && item.definition) {
        item.description = item.definition;
        console.log(`Converted definition to description for item ${i}`);
      }
      
      // Add missing short_form if needed
      if (!item.short_form) {
        // Generate short form from term if missing
        item.short_form = term.split(' ').map(word => word[0]).join('').toUpperCase();
        console.log(`Generated short_form '${item.short_form}' for item ${i}`);
      }
      
      if (!term || !category || !item.description) {
        return { 
          valid: false, 
          message: `Item at index ${i} is missing required fields (term, category, description/definition). Found: term=${!!term}, category=${!!category}, description=${!!item.description}, definition=${!!item.definition}` 
        };
      }
    }

    return { valid: true, data: glossaryArray };
  };

  const handleImport = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select a JSON file to import',
      });
      return;
    }

    let fileToUpload = selectedFile;

    // Validate JSON structure before sending to API
    try {
      const fileContent = await selectedFile.text();
      const jsonData = JSON.parse(fileContent);
      const validation = validateJSONStructure(jsonData);
      
      if (!validation.valid) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid JSON Structure',
          text: validation.message,
        });
        return;
      }
      
      // For alphabetical structure, keep original format for API
      // Only modify if we need to add missing fields like short_form
      if (validation.data !== jsonData) {
        // Check if it's alphabetical structure - if so, keep original format
        const keys = Object.keys(jsonData);
        const isAlphabeticalStructure = keys.every(key => {
          const value = jsonData[key];
          return Array.isArray(value) && value.length > 0 && 
                 value[0].term && (value[0].definition || value[0].description);
        });
        
        if (isAlphabeticalStructure) {
          // Keep original alphabetical structure, just add short_form if missing
          const correctedData = {};
          keys.forEach(key => {
            correctedData[key] = jsonData[key].map(item => {
              const newItem = { ...item };
              if (!newItem.short_form) {
                newItem.short_form = item.term.split(' ').map(word => word[0]).join('').toUpperCase();
              }
              if (!newItem.description && item.definition) {
                newItem.description = item.definition;
              }
              return newItem;
            });
          });
          
          const correctedJSON = JSON.stringify(correctedData, null, 2);
          const blob = new Blob([correctedJSON], { type: 'application/json' });
          fileToUpload = new File([blob], selectedFile.name, { type: 'application/json' });
        } else {
          // For other structures, use flattened array
          const correctedJSON = JSON.stringify(validation.data, null, 2);
          const blob = new Blob([correctedJSON], { type: 'application/json' });
          fileToUpload = new File([blob], selectedFile.name, { type: 'application/json' });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid JSON',
        text: 'The selected file is not a valid JSON file',
      });
      return;
    }

    setIsLoading(true);

    const result = await importGlossaryFromJSON(fileToUpload, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Import Successful',
        text: result.message || 'Glossary terms imported successfully!',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate('/glossaries');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Import Failed',
        text: result.message || 'An error occurred while importing glossary terms',
      });
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    navigate('/glossaries');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.term.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter the glossary term',
      });
      return;
    }

    // if (!formData.short_form.trim()) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Validation Error',
    //     text: 'Please enter the short form',
    //   });
    //   return;
    // }

    if (!formData.category.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter the category',
      });
      return;
    }

    if (!formData.description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter the description',
      });
      return;
    }

    setIsLoading(true);

    const result = await addGlossary(formData, token);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Glossary Created',
        text: result.message || 'Glossary term created successfully!',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate('/glossaries');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Glossary',
        text: result.message || 'An error occurred while creating the glossary term',
      });
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
                <h5>Add Glossary</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <Link className="btn btn-primary" to="/glossaries"><i className="fa fa-plus-circle me-2"></i>View All</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  {/* Tab Navigation */}
                  <ul className="nav nav-tabs mb-4" role="tablist">
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${!importMode ? 'active' : ''}`}
                        onClick={() => setImportMode(false)}
                        type="button"
                      >
                        <i className="fa fa-plus me-2"></i>Add Single Term
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${importMode ? 'active' : ''}`}
                        onClick={() => setImportMode(true)}
                        type="button"
                      >
                        <i className="fa fa-file-import me-2"></i>Import from JSON
                      </button>
                    </li>
                  </ul>

                  {/* Tab Content */}
                  {!importMode ? (
                    <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Term <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter glossary term"
                        name="term"
                        value={formData.term}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* <div className="col-md-6">
                      <label className="form-label">Short Form <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g., BTC, USD"
                        name="short_form"
                        value={formData.short_form}
                        onChange={handleInputChange}
                        required
                      />
                    </div> */}

                    <div className="col-md-6">
                      <label className="form-label">Category <span className="text-danger">*</span></label>
                      <select 
                        className="form-select" 
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        disabled={categoriesLoading}
                      >
                        <option value="">{categoriesLoading ? 'Loading categories...' : 'Select a category'}</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                        {/* Fallback options if API fails */}
                        {!categoriesLoading && categories.length === 0 && (
                          <>
                            <option value="SMC">SMC</option>
                            <option value="Technical Analysis">Technical Analysis</option>
                            <option value="ICT">ICT</option>
                            <option value="Price Action">Price Action</option>
                            <option value="Risk Management">Risk Management</option>
                          </>
                        )}
                      </select>
                      {categoriesLoading && (
                        <small className="text-muted">Loading categories from server...</small>
                      )}
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Description <span className="text-danger">*</span></label>
                      <textarea 
                        className="form-control" 
                        rows="6" 
                        placeholder="Enter detailed description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
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
                        disabled={isLoading}
                      >
                        <i className="bi bi-check-circle"></i> {isLoading ? 'Creating...' : 'Create Glossary'}
                      </button>
                    </div>
                  </form>
                  ) : (
                    <div className="row g-3">

                      <div className="col-md-8">
                        <label className="form-label">Select JSON File <span className="text-danger">*</span></label>
                        <input 
                          type="file" 
                          className="form-control" 
                          accept=".json,application/json"
                          onChange={handleFileChange}
                          disabled={isLoading}
                        />
                        {selectedFile && (
                          <small className="text-success">
                            <i className="fa fa-check-circle me-1"></i>
                            Selected: {selectedFile.name}
                          </small>
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
                          type="button" 
                          className="btn btn-primary ms-2"
                          onClick={handleImport}
                          disabled={isLoading || !selectedFile}
                        >
                          <i className="fa fa-file-import me-2"></i>
                          {isLoading ? 'Importing...' : 'Import JSON'}
                        </button>
                      </div>
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
