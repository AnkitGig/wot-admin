import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";
import { getGlossaryById, updateGlossary } from "../api";
import { getAllGlossaryCategories } from "../api/Glossaries";

export default function EditGlossary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

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
  });

  // =========================
  // FETCH GLOSSARY BY ID
  // =========================
  const fetchGlossary = async () => {
    try {
      setIsLoading(true);
      const result = await getGlossaryById(id, token);

      if (result.success) {
        const glossary = result.data;
        setFormData({
          term_en: glossary.term?.en || "",
          term_fr: glossary.term?.fr || "",
          term_es: glossary.term?.es || "",
          short_form: glossary.short_form || "",
          category_en: glossary.category?.en || "",
          category_fr: glossary.category?.fr || "",
          category_es: glossary.category?.es || "",
          description_en: glossary.description?.en || "",
          description_fr: glossary.description?.fr || "",
          description_es: glossary.description?.es || "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: result.message,
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch glossary",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // FETCH CATEGORIES
  // =========================
  const fetchCategories = async () => {
    try {
      const result = await getAllGlossaryCategories();
      console.log("fetchCategories", result.data);
      setCategories(result.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGlossary();
    fetchCategories();
  }, [id]);

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
  // UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const payload = {
        term: {
          en: formData.term_en,
          fr: formData.term_fr,
          es: formData.term_es,
        },
        short_form: formData.short_form,
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
      };

      const result = await updateGlossary(id, payload, token);

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: result.message || "Glossary updated successfully",
        }).then(() => {
          navigate("/glossaries");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: result.message,
        });
      }
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

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="content-page-header">
              <h5>Edit Glossary</h5>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* ================= ENGLISH SECTION ================= */}
                <div
                  className="card mb-4 border-0 shadow-sm"
                  style={{ backgroundColor: "#e8f1ff" }}
                >
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">🇺🇸 English Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">English Term</label>
                      <input
                        type="text"
                        className="form-control"
                        name="term_en"
                        value={formData.term_en}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        name="category_en"
                        value={formData.category_en}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        name="description_en"
                        value={formData.description_en}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* ================= FRENCH SECTION ================= */}
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
                      <label className="form-label">Terme Français</label>
                      <input
                        type="text"
                        className="form-control"
                        name="term_fr"
                        value={formData.term_fr}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Catégorie</label>
                      <select
                        className="form-select"
                        name="category_fr"
                        value={formData.category_fr}
                        onChange={handleInputChange}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        name="description_fr"
                        value={formData.description_fr}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* ================= SPANISH SECTION ================= */}
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
                      <label className="form-label">Término Español</label>
                      <input
                        type="text"
                        className="form-control"
                        name="term_es"
                        value={formData.term_es}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Categoría</label>
                      <select
                        className="form-select"
                        name="category_es"
                        value={formData.category_es}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        name="description_es"
                        value={formData.description_es}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* ================= SHORT FORM SECTION ================= */}
                {/* <div className="card mb-4 border-0 shadow-sm">
                  <div className="card-header bg-secondary text-white">
                    <h5 className="mb-0">🔤 Short Form</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">Short Form (Optional)</label>
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
                </div> */}

                {/* ================= BUTTONS ================= */}
                <div className="text-end">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={() => navigate("/glossaries")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Glossary"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}