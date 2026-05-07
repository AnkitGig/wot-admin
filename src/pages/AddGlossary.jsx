import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addGlossary,
  getAllGlossaryCategories,
  importGlossaryFromJSON,
} from "../api/glossary";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

// Dummy categories (used when token is missing or API fails)

export default function AddGlossary() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importMode, setImportMode] = useState(false);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);
  const abortControllerRef = useRef(null);
  // console.log("categories", categories);
  const [formData, setFormData] = useState({
    term_en: "",
    term_fr: "",
    term_es: "",
    short_form: "",
    category_en: "",
    category_fr: "",
    category_es: "",
    description_en: "",
    description_fr: "",
    description_es: "",
    definition_en: "",
    definition_fr: "",
    definition_es: "",
  });

  useEffect(() => {
    fetchCategories();
    return () => abortControllerRef.current?.abort();
  }, [token]);

  const fetchCategories = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setCategoriesLoading(true);
    setIsUsingDummyData(false);

    // If no token, use dummy categories
    if (!token) {
      setCategoriesLoading(false);
      setIsUsingDummyData(true);
      return;
    }

    try {
      const result = await getAllGlossaryCategories(token, 1, 100, {
        signal: abortControllerRef.current.signal,
      });
      // console.log("result", result);
      if (result.success && result.data?.length > 0) {
        setCategories(result.data);
      } else {
        // Fallback to dummy if API returns empty or fails

        setIsUsingDummyData(true);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);

        Swal.fire({
          icon: "warning",
          title: "Demo Mode",
          text: "Could not load categories from server. Using local defaults.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/json") {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Please select a JSON file",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  // JSON validation for import (kept as original, but adjusted for multilingual if needed)
  const validateJSONStructure = (data) => {
    // ... (keep your existing validation logic, or simplify)
    // For brevity, I'll keep a simplified version – you can replace with your full logic.
    let glossaryArray = data;
    if (!Array.isArray(data)) {
      if (data.data && Array.isArray(data.data)) glossaryArray = data.data;
      else if (data.glossaries && Array.isArray(data.glossaries))
        glossaryArray = data.glossaries;
      else if (data.items && Array.isArray(data.items))
        glossaryArray = data.items;
      else if (data.glossary && Array.isArray(data.glossary))
        glossaryArray = data.glossary;
      else
        return {
          valid: false,
          message: "JSON must be an array of glossary terms.",
        };
    }
    for (let i = 0; i < glossaryArray.length; i++) {
      const item = glossaryArray[i];
      if (!item.term_en && !item.term) {
        return {
          valid: false,
          message: `Item ${i} missing term (term_en or term).`,
        };
      }
    }
    return { valid: true, data: glossaryArray };
  };

  const handleImport = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select a JSON file",
      });
      return;
    }
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Not Authenticated",
        text: "Please log in to import data.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fileContent = await selectedFile.text();
      const jsonData = JSON.parse(fileContent);
      const validation = validateJSONStructure(jsonData);
      // console.log('validation',validation)
      // if (!validation.valid) {
      //   Swal.fire({
      //     icon: "error",
      //     title: "Invalid JSON",
      //     text: validation.message,
      //   });
      //   setIsLoading(false);
      //   return;
      // }
      const result = await importGlossaryFromJSON(selectedFile, token);
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Import Successful",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => navigate("/glossaries"));
      } else {
        throw new Error(result.message || "Import failed");
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Import Failed", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate("/glossaries");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all term and category fields (required)
    if (
      !formData.term_en.trim() ||
      !formData.term_fr.trim() ||
      !formData.term_es.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "All term fields (English, French, Spanish) are required.",
      });
      return;
    }
    if (!formData.category_en.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: " category fields  are required.",
      });
      return;
    }

    // Short form: if empty, generate from English term
    let shortForm = formData.short_form.trim();
    if (!shortForm) {
      shortForm = formData.term_en
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 10);
    }
    console.log("shortForm", shortForm);
    const payload = {
      term: {
        en: formData.term_en,
        fr: formData.term_fr,
        es: formData.term_es,
      },
      short_form: shortForm,
      category: {
        en: formData.category_en,
        fr: formData.category_fr,
        es: formData.category_es,
      },
      description: {
        en: formData.description_en,
        fr: formData.description_fr,
        es: formData.description_es,
      },
      definition: {
        en: formData.definition_en,
        fr: formData.definition_fr,
        es: formData.definition_es,
      },
    };
    console.log("payload", payload);
    setIsLoading(true);
    try {
      const result = await addGlossary(payload, token);
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Glossary Created",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => navigate("/glossaries"));
      } else {
        throw new Error(result.message || "Creation failed");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Create",
        text: err.message,
      });
    } finally {
      setIsLoading(false);
    }
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
                {isUsingDummyData && (
                  <span className="badge bg-warning text-dark ms-2">
                    Demo Mode
                  </span>
                )}
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <Link className="btn btn-primary" to="/glossaries">
                      <i className="fa fa-plus-circle me-2"></i>View All
                    </Link>
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
                  <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${!importMode ? "active" : ""}`}
                        onClick={() => setImportMode(false)}
                        type="button"
                      >
                        <i className="fa fa-plus me-2"></i>Add Single Term
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${importMode ? "active" : ""}`}
                        onClick={() => setImportMode(true)}
                        type="button"
                      >
                        <i className="fa fa-file-import me-2"></i>Import from
                        JSON
                      </button>
                    </li>
                  </ul>

                  {!importMode ? (
                    <form onSubmit={handleSubmit}>
                      {/* TERM */}
                      <div className="row g-3 mb-3">
                        <div className="col-12">
                          <label className="form-label">
                            English Term
                            <span className="text-danger">*</span>
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            name="term_en"
                            value={formData.term_en}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label">
                            French Term
                            <span className="text-danger">*</span>
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            name="term_fr"
                            value={formData.term_fr}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label">
                            Spanish Term
                            <span className="text-danger">*</span>
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            name="term_es"
                            value={formData.term_es}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      {/* SHORT FORM */}
                      <div className="row g-3 mb-3">
                        <div className="col-12">
                          <label className="form-label">
                            Short Form (optional)
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            name="short_form"
                            value={formData.short_form}
                            onChange={handleInputChange}
                            placeholder="e.g., BTC"
                          />

                          <small className="text-muted">
                            Leave empty to auto-generate from English term.
                          </small>
                        </div>
                      </div>

                      {/* CATEGORY */}
                      <div>
                        <label className="form-label">Category</label>
                        <select
                          className="form-select mb-2"
                          name="category_en"
                          value={formData.category_en}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              category_en: e.target.value,
                            }));
                          }}
                          required
                        >
                          <option value="">Select Category</option>

                          {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* DESCRIPTION */}
                      <div className="row g-3 mb-3">
                        {/* English Description */}
                        <div className="col-12">
                          <label className="form-label">
                            English Description
                          </label>

                          <textarea
                            className="form-control"
                            rows="4"
                            name="description_en"
                            value={formData.description_en}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>

                        {/* French Description */}
                        <div className="col-12">
                          <label className="form-label">
                            French Description
                          </label>

                          <textarea
                            className="form-control"
                            rows="4"
                            name="description_fr"
                            value={formData.description_fr}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>

                        {/* Spanish Description */}
                        <div className="col-12">
                          <label className="form-label">
                            Spanish Description
                          </label>

                          <textarea
                            className="form-control"
                            rows="4"
                            name="description_es"
                            value={formData.description_es}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                      </div>

                      {/* DEFINITION */}
                      {/* <div className="row g-3 mb-4">
                        <div className="col-12">
                          <label className="form-label">
                            English Definition
                          </label>

                          <textarea
                            className="form-control"
                            rows="4"
                            name="definition_en"
                            value={formData.definition_en}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                      </div> */}

                      {/* BUTTONS */}
                      <div className="text-end">
                        <button
                          type="button"
                          className="btn btn-secondary me-2"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating..." : "Create Glossary"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Import JSON section
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label">
                          Select JSON File{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".json,application/json"
                          onChange={handleFileChange}
                          disabled={isLoading}
                        />
                        {selectedFile && (
                          <small className="text-success">
                            <i className="fa fa-check-circle me-1"></i>{" "}
                            Selected: {selectedFile.name}
                          </small>
                        )}
                      </div>
                      <div className="col-md-12 text-end mt-3">
                        <button
                          type="button"
                          className="btn btn-secondary me-2"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleImport}
                          disabled={isLoading || !selectedFile}
                        >
                          <i className="fa fa-file-import me-2"></i>{" "}
                          {isLoading ? "Importing..." : "Import JSON"}
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
