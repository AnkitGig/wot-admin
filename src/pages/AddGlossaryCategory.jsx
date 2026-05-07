import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";
import { addGlossaryCategory, uploadGlossaryJson } from "../api/Glossaries";

export default function AddGlossaryCategory() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // =========================
  // STATES
  // =========================
  const [activeTab, setActiveTab] = useState("manual");

  const [isLoading, setIsLoading] = useState(false);
  const [jsonLoading, setJsonLoading] = useState(false);

  const [jsonFile, setJsonFile] = useState(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_fr: "",
    name_es: "",

    description_en: "",
    description_fr: "",
    description_es: "",

    color: "#941efd",
  });
  // =========================
  // INPUT CHANGE
  // =========================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // CANCEL
  // =========================
  const handleCancel = () => {
    navigate("/glossary-categories");
  };

  // =========================
  // MANUAL SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name_en.trim() ||
      !formData.name_fr.trim() ||
      !formData.name_es.trim()
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all category names",
      });
    }

    try {
      setIsLoading(true);

      const payload = {
        name: {
          en: formData.name_en,
          fr: formData.name_fr,
          es: formData.name_es,
        },
        description: formData.description_en,
        // description: {
        //   en: formData.description_en,
        //   fr: formData.description_fr,
        //   es: formData.description_es,
        // },

        color: formData.color,
      };

      console.log(payload);

      const result = await addGlossaryCategory(payload);

      if ((result.status === 1) == 1) {
        Swal.fire({
          icon: "success",
          title: "Category Created",
          text: result.message || "Glossary category created successfully!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: result.message,
        });
      }
      navigate("/glossary-categories");
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // JSON FILE CHANGE
  // =========================
  const handleJsonChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // validate file type
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please upload a valid JSON file",
      });

      return;
    }

    setJsonFile(file);
  };

  // =========================
  // JSON IMPORT
  // =========================
  const handleJsonImport = async () => {
    if (!jsonFile) {
      return Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select JSON file",
      });
    }

    try {
      setJsonLoading(true);

      const uploadData = new FormData();

      uploadData.append("file", jsonFile);

      const result = await uploadGlossaryJson(uploadData, token);

      if (result.status === 1) {
        Swal.fire({
          icon: "success",
          title: "Import Successful",
          text: result.message || "Glossary categories imported successfully",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate("/glossary-categories");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Import Failed",
          text: result.message || "Unable to import JSON file",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: error.message || "Something went wrong",
      });
    } finally {
      setJsonLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* PAGE HEADER */}
          <div className="page-header">
            <div className="content-page-header">
              <div>
                <h5>Add Glossary Category</h5>
              </div>

              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <Link className="btn btn-primary" to="/glossary-categories">
                      <i className="fa fa-eye me-2"></i>
                      View All
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  {/* TABS */}
                  <div className="d-flex align-items-center border-bottom mb-4 pb-2">
                    <button
                      type="button"
                      className={`btn btn-sm me-2 ${
                        activeTab === "manual" ? "btn-primary" : "btn-light"
                      }`}
                      onClick={() => setActiveTab("manual")}
                    >
                      <i className="fa fa-plus me-1"></i>
                      Add Single Category
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm ${
                        activeTab === "json" ? "btn-primary" : "btn-light"
                      }`}
                      onClick={() => setActiveTab("json")}
                    >
                      <i className="fa fa-file-import me-1"></i>
                      Import from JSON
                    </button>
                  </div>

                  {/* ========================= */}
                  {/* MANUAL FORM */}
                  {/* ========================= */}
                  {activeTab === "manual" && (
                    <form onSubmit={handleSubmit}>
                      {/* ================= ENGLISH SECTION ================= */}
                      <div
                        className="card border-0 shadow-sm mb-4"
                        style={{ backgroundColor: "#e8f1ff" }}
                      >
                        <div className="card-header bg-primary text-white">
                          <h5 className="mb-0">🇺🇸 English Category</h5>
                        </div>

                        <div className="card-body">
                          {/* CATEGORY NAME */}
                          <div className="mb-3">
                            <label className="form-label">
                              Category Name (English)
                              <span className="text-danger">*</span>
                            </label>

                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter category name in English"
                              name="name_en"
                              value={formData.name_en}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          {/* DESCRIPTION */}
                          <div className="mb-3">
                            <label className="form-label">
                              Description (English) optional
                            </label>

                            <textarea
                              className="form-control"
                              rows="4"
                              placeholder="Enter English description"
                              name="description_en"
                              value={formData.description_en}
                              onChange={handleInputChange}
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      {/* ================= FRENCH SECTION ================= */}
                      <div
                        className="card border-0 shadow-sm mb-4"
                        style={{ backgroundColor: "#fff4e5" }}
                      >
                        <div
                          className="card-header text-dark"
                          style={{ backgroundColor: "#ffb74d" }}
                        >
                          <h5 className="mb-0">🇫🇷 French Category</h5>
                        </div>

                        <div className="card-body">
                          {/* CATEGORY NAME */}
                          <div className="mb-3">
                            <label className="form-label">
                              Nom de la Catégorie (Français)
                              <span className="text-danger">*</span>
                            </label>

                            <input
                              type="text"
                              className="form-control"
                              placeholder="Entrez le nom de la catégorie"
                              name="name_fr"
                              value={formData.name_fr}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          {/* DESCRIPTION */}
                          {/* <div className="mb-3">
                            <label className="form-label">
                              Description (Français)
                            </label>

                            <textarea
                              className="form-control"
                              rows="4"
                              placeholder="Entrez la description française"
                              name="description_fr"
                              value={formData.description_fr}
                              onChange={handleInputChange}
                            ></textarea>
                          </div> */}
                        </div>
                      </div>

                      {/* ================= SPANISH SECTION ================= */}
                      <div
                        className="card border-0 shadow-sm mb-4"
                        style={{ backgroundColor: "#e8fff1" }}
                      >
                        <div
                          className="card-header text-dark"
                          style={{ backgroundColor: "#66bb6a" }}
                        >
                          <h5 className="mb-0">🇪🇸 Spanish Category</h5>
                        </div>

                        <div className="card-body">
                          {/* CATEGORY NAME */}
                          <div className="mb-3">
                            <label className="form-label">
                              Nombre de la Categoría (Español)
                              <span className="text-danger">*</span>
                            </label>

                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ingrese el nombre de la categoría"
                              name="name_es"
                              value={formData.name_es}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          {/* DESCRIPTION */}
                          {/* <div className="mb-3">
                            <label className="form-label">
                              Descripción (Español)
                            </label>

                            <textarea
                              className="form-control"
                              rows="4"
                              placeholder="Ingrese la descripción en español"
                              name="description_es"
                              value={formData.description_es}
                              onChange={handleInputChange}
                            ></textarea>
                          </div> */}
                        </div>
                      </div>

                      {/* ================= COLOR SECTION ================= */}
                      <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-dark text-white">
                          <h5 className="mb-0">🎨 Category Color</h5>
                        </div>

                        <div className="card-body">
                          <div className="d-flex align-items-center gap-3">
                            <input
                              type="color"
                              className="form-control form-control-color"
                              style={{
                                width: "70px",
                                height: "45px",
                                cursor: "pointer",
                              }}
                              name="color"
                              value={formData.color}
                              onChange={handleInputChange}
                            />

                            <input
                              type="text"
                              className="form-control"
                              placeholder="#941efd"
                              name="color"
                              value={formData.color}
                              onChange={handleInputChange}
                              style={{
                                maxWidth: "180px",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* ================= BUTTONS ================= */}
                      <div className="text-end">
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
                          {isLoading ? "Creating..." : "Create Category"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ========================= */}
                  {/* JSON IMPORT */}
                  {/* ========================= */}
                  {activeTab === "json" && (
                    <div className="row">
                      <div className="col-md-8 mb-3">
                        <label className="form-label">
                          Select JSON File{" "}
                          <span className="text-danger">*</span>
                        </label>

                        <input
                          type="file"
                          className="form-control"
                          accept=".json"
                          onChange={handleJsonChange}
                        />

                        <small className="text-muted mt-2 d-block">
                          Upload a valid JSON file containing glossary
                          categories.
                        </small>
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
                          onClick={handleJsonImport}
                          disabled={jsonLoading}
                        >
                          {jsonLoading ? "Importing..." : "Import JSON"}
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
