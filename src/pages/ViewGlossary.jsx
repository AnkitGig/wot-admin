import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getGlossaryById } from "../api/glossary";

export default function ViewGlossary() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { id } = useParams(); // glossary ID from URL

  const [glossary, setGlossary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      Swal.fire({
        icon: "error",
        title: "Invalid Request",
        text: "Glossary ID is missing",
      }).then(() => navigate("/glossaries"));
      return;
    }
    fetchGlossary();
  }, [id, token]);

  const fetchGlossary = async () => {
    try {
      setLoading(true);
      const response = await getGlossaryById(id, token);
      console.log('getGlossaryById',response)
      if (response.success && response.data) {
        setGlossary(response.data);
      } else {
        throw new Error(response.message || "Failed to load glossary details");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Could not load glossary data",
      }).then(() => navigate("/glossaries"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!glossary) {
    return (
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="alert alert-danger">Glossary term not found.</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Helper to display field with fallback
  const displayField = (value) => value || "—";

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
                <h5>View Glossary Term</h5>
              </div>
              <div className="list-btn">
                <ul className="filter-list">
                  <li>
                    <Link className="btn btn-primary" to="/glossaries">
                      <i className="fa fa-eye me-2"></i>View All
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
                  {/* ENGLISH SECTION */}
                  <div
                    className="card mb-4 border-0 shadow-sm"
                    style={{ backgroundColor: "#e8f1ff" }}
                  >
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">🇺🇸 English Details</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Term</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.term?.en)}
                        </div>
                      </div>
                      {/* <div className="mb-3">
                        <label className="form-label fw-bold">Short Form</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.short_form)}
                        </div>
                      </div> */}
                      <div className="mb-3">
                        <label className="form-label fw-bold">Category</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.category?.en)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Description</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.description?.en)}
                        </div>
                      </div>
                      {/* <div className="mb-3">
                        <label className="form-label fw-bold">Definition</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.definition?.en)}
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* FRENCH SECTION */}
                  <div
                    className="card mb-4 border-0 shadow-sm"
                    style={{ backgroundColor: "#fff4e5" }}
                  >
                    <div
                      className="card-header text-dark"
                      style={{ backgroundColor: "#ffb74d" }}
                    >
                      <h5 className="mb-0">🇫🇷 French Details</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Terme</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.term?.fr)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Catégorie</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.category?.fr)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Description</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.description?.fr)}
                        </div>
                      </div>
                      {/* <div className="mb-3">
                        <label className="form-label fw-bold">Définition</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.definition?.fr)}
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* SPANISH SECTION */}
                  <div
                    className="card mb-4 border-0 shadow-sm"
                    style={{ backgroundColor: "#e8fff1" }}
                  >
                    <div
                      className="card-header text-dark"
                      style={{ backgroundColor: "#66bb6a" }}
                    >
                      <h5 className="mb-0">🇪🇸 Spanish Details</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Término</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.term?.es)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Categoría</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.category?.es)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Descripción</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.description?.es)}
                        </div>
                      </div>
                      {/* <div className="mb-3">
                        <label className="form-label fw-bold">Definición</label>
                        <div className="p-2 bg-light rounded">
                          {displayField(glossary.definition?.es)}
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => navigate("/glossaries")}
                    >
                      Back to List
                    </button>
                    {/* <Link
                      to={`/glossaries/edit/${id}`}
                      className="btn btn-warning"
                    >
                      <i className="fa fa-edit me-1"></i> Edit Term
                    </Link> */}
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