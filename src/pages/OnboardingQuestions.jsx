import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import GlobalLoader from "../components/GlobalLoader";
import { useAuth } from "../context/AuthContext";
import {
  getOnboardingQuestions,
  createOnboardingQuestion,
  updateOnboardingQuestion,
  deleteOnboardingQuestion,
  createOnboardingOption,
  updateOnboardingOption,
  deleteOnboardingOption,
} from "../api/onboarding";
import Swal from "sweetalert2";

export default function OnboardingQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Modals
  const [viewQuestion, setViewQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionModalMode, setQuestionModalMode] = useState("create"); // 'create' | 'edit'

  // Question Form State
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [useRawJson, setUseRawJson] = useState(false);
  const [rawJsonString, setRawJsonString] = useState("");

  const [questionForm, setQuestionForm] = useState({
    key: "",
    display_order: 1,
    is_active: true,
    question_en: "",
    question_fr: "",
    question_es: "",
    imageFile: null,
    imagePreview: null,
    remove_image: false,
    options: [
      {
        value: "option_1",
        label: { en: "", fr: "", es: "" },
        display_order: 1,
        is_active: true,
      },
    ],
  });

  // Single Option Form State (Inside View Details Modal)
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [optionModalMode, setOptionModalMode] = useState("create");
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [optionForm, setOptionForm] = useState({
    value: "",
    label: { en: "", fr: "", es: "" },
    display_order: 1,
    is_active: true,
  });

  const { token } = useAuth();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await getOnboardingQuestions(token);
      if (response.success) {
        const questionList = response.data?.questions || response.data || [];
        setQuestions(questionList);
        if (viewQuestion) {
          const updatedView = questionList.find((q) => q.id === viewQuestion.id);
          if (updatedView) setViewQuestion(updatedView);
        }
      } else {
        Swal.fire("Error", response.message || "Failed to load onboarding questions", "error");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      Swal.fire("Error", "An error occurred while fetching onboarding questions", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- QUESTION HANDLERS ---
  const handleOpenCreateQuestion = () => {
    setQuestionModalMode("create");
    setEditingQuestionId(null);
    setUseRawJson(false);
    const maxOrder = questions.length > 0 ? Math.max(...questions.map((q) => q.display_order || 0)) + 1 : 1;
    const initialOptions = [
      {
        value: "option_1",
        label: { en: "", fr: "", es: "" },
        display_order: 1,
        is_active: true,
      },
    ];
    setQuestionForm({
      key: "",
      display_order: maxOrder,
      is_active: true,
      question_en: "",
      question_fr: "",
      question_es: "",
      imageFile: null,
      imagePreview: null,
      remove_image: false,
      options: initialOptions,
    });
    setRawJsonString(JSON.stringify(initialOptions, null, 2));
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q) => {
    setQuestionModalMode("edit");
    setEditingQuestionId(q.id);
    setUseRawJson(false);
    const opts = q.options && q.options.length > 0 ? q.options : [];
    setQuestionForm({
      key: q.key || "",
      display_order: q.display_order || 1,
      is_active: q.is_active ?? true,
      question_en: q.question?.en || "",
      question_fr: q.question?.fr || "",
      question_es: q.question?.es || "",
      imageFile: null,
      imagePreview: q.image_url || null,
      remove_image: false,
      options: opts,
    });
    setRawJsonString(JSON.stringify(opts, null, 2));
    setIsQuestionModalOpen(true);
  };

  const handleQuestionFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestionForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQuestionForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
        remove_image: false,
      }));
    }
  };

  const handleRemoveImage = () => {
    setQuestionForm((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
      remove_image: true,
    }));
  };

  // Option Builder inside Question Modal
  const handleAddChoiceCard = () => {
    setQuestionForm((prev) => {
      const nextOrder = prev.options.length + 1;
      const newOpts = [
        ...prev.options,
        {
          value: `choice_${nextOrder}`,
          label: { en: "", fr: "", es: "" },
          display_order: nextOrder,
          is_active: true,
        },
      ];
      setRawJsonString(JSON.stringify(newOpts, null, 2));
      return { ...prev, options: newOpts };
    });
  };

  const handleRemoveChoiceCard = (index) => {
    setQuestionForm((prev) => {
      const newOpts = prev.options.filter((_, i) => i !== index);
      setRawJsonString(JSON.stringify(newOpts, null, 2));
      return { ...prev, options: newOpts };
    });
  };

  const handleChoiceCardChange = (index, field, val, lang = null) => {
    setQuestionForm((prev) => {
      const updatedOpts = [...prev.options];
      if (lang) {
        updatedOpts[index] = {
          ...updatedOpts[index],
          label: {
            ...updatedOpts[index].label,
            [lang]: val,
          },
        };
      } else {
        updatedOpts[index] = {
          ...updatedOpts[index],
          [field]: field === "display_order" ? (parseInt(val) || 1) : val,
        };
      }
      setRawJsonString(JSON.stringify(updatedOpts, null, 2));
      return { ...prev, options: updatedOpts };
    });
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.key.trim()) {
      return Swal.fire("Required Field", "Please enter Question Key (e.g. daily_trading_time)", "warning");
    }
    if (!questionForm.question_en.trim()) {
      return Swal.fire("Required Field", "Please enter English Question Text", "warning");
    }

    let finalOptionsArray = [];
    if (useRawJson) {
      try {
        finalOptionsArray = JSON.parse(rawJsonString);
        if (!Array.isArray(finalOptionsArray)) {
          throw new Error("options_json must be a JSON array");
        }
      } catch (jsonErr) {
        return Swal.fire("Invalid options_json", "Please check your JSON format: " + jsonErr.message, "error");
      }
    } else {
      finalOptionsArray = questionForm.options.map((opt, idx) => ({
        value: opt.value.trim() || `choice_${idx + 1}`,
        label: {
          en: (opt.label?.en || opt.value || "").trim(),
          fr: (opt.label?.fr || opt.label?.en || opt.value || "").trim(),
          es: (opt.label?.es || opt.label?.en || opt.value || "").trim(),
        },
        display_order: parseInt(opt.display_order) || idx + 1,
        is_active: opt.is_active ?? true,
      }));
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("key", questionForm.key.trim());
      formData.append("question_en", questionForm.question_en.trim());
      formData.append("question_fr", (questionForm.question_fr || questionForm.question_en).trim());
      formData.append("question_es", (questionForm.question_es || questionForm.question_en).trim());
      formData.append("display_order", questionForm.display_order);
      formData.append("is_active", questionForm.is_active ? "true" : "false");
      formData.append("options_json", JSON.stringify(finalOptionsArray));

      if (questionForm.imageFile) {
        formData.append("image", questionForm.imageFile);
      }

      if (questionModalMode === "edit") {
        formData.append("remove_image", questionForm.remove_image ? "true" : "false");
        const res = await updateOnboardingQuestion(editingQuestionId, formData, token);
        if (res.success) {
          Swal.fire("Success", res.message || "Question updated successfully", "success");
          setIsQuestionModalOpen(false);
          fetchQuestions();
        } else {
          Swal.fire("Error", res.message || "Failed to update question", "error");
        }
      } else {
        const res = await createOnboardingQuestion(formData, token);
        if (res.success) {
          Swal.fire("Success", res.message || "Question created successfully", "success");
          setIsQuestionModalOpen(false);
          fetchQuestions();
        } else {
          Swal.fire("Error", res.message || "Failed to create question", "error");
        }
      }
    } catch (err) {
      console.error("Submit Question Error:", err);
      Swal.fire("Error", "An unexpected error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (q) => {
    const confirm = await Swal.fire({
      title: "Delete Question?",
      html: `Are you sure you want to delete question <strong>"${q.key}"</strong>?<br/><small className="text-danger">This action cannot be undone.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        const res = await deleteOnboardingQuestion(q.id, token);
        if (res.success) {
          Swal.fire("Deleted!", res.message || "Question deleted successfully", "success");
          if (viewQuestion?.id === q.id) setViewQuestion(null);
          fetchQuestions();
        } else {
          Swal.fire("Error", res.message || "Failed to delete question", "error");
        }
      } catch (err) {
        console.error("Delete Question Error:", err);
        Swal.fire("Error", "An error occurred while deleting question", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // --- SINGLE OPTION HANDLERS (Inside View Details Modal) ---
  const handleOpenAddOption = () => {
    if (!viewQuestion) return;
    setOptionModalMode("create");
    setEditingOptionId(null);
    const maxOrder = viewQuestion.options?.length > 0
      ? Math.max(...viewQuestion.options.map((o) => o.display_order || 0)) + 1
      : 1;
    setOptionForm({
      value: "",
      label: { en: "", fr: "", es: "" },
      display_order: maxOrder,
      is_active: true,
    });
    setIsOptionModalOpen(true);
  };

  const handleOpenEditOption = (opt) => {
    setOptionModalMode("edit");
    setEditingOptionId(opt.id);
    setOptionForm({
      value: opt.value || "",
      label: {
        en: opt.label?.en || "",
        fr: opt.label?.fr || "",
        es: opt.label?.es || "",
      },
      display_order: opt.display_order || 1,
      is_active: opt.is_active ?? true,
    });
    setIsOptionModalOpen(true);
  };

  const handleSubmitOption = async (e) => {
    e.preventDefault();
    if (!optionForm.value.trim()) {
      return Swal.fire("Required Field", "Please enter option value (e.g. 30_minutes)", "warning");
    }
    if (!optionForm.label.en.trim()) {
      return Swal.fire("Required Field", "Please enter English label", "warning");
    }

    setSubmitting(true);
    const payload = {
      value: optionForm.value.trim(),
      label: {
        en: optionForm.label.en.trim(),
        fr: (optionForm.label.fr || optionForm.label.en).trim(),
        es: (optionForm.label.es || optionForm.label.en).trim(),
      },
      display_order: parseInt(optionForm.display_order) || 1,
      is_active: optionForm.is_active,
    };

    try {
      if (optionModalMode === "edit") {
        const res = await updateOnboardingOption(editingOptionId, payload, token);
        if (res.success) {
          Swal.fire("Success", res.message || "Option updated successfully", "success");
          setIsOptionModalOpen(false);
          fetchQuestions();
        } else {
          Swal.fire("Error", res.message || "Failed to update option", "error");
        }
      } else {
        const res = await createOnboardingOption(viewQuestion.id, payload, token);
        if (res.success) {
          Swal.fire("Success", res.message || "Option added successfully", "success");
          setIsOptionModalOpen(false);
          fetchQuestions();
        } else {
          Swal.fire("Error", res.message || "Failed to add option", "error");
        }
      }
    } catch (err) {
      console.error("Option Submit Error:", err);
      Swal.fire("Error", "An unexpected error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOption = async (optId, optVal) => {
    const confirm = await Swal.fire({
      title: "Delete Option?",
      html: `Are you sure you want to delete choice <strong>"${optVal}"</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        const res = await deleteOnboardingOption(optId, token);
        if (res.success) {
          Swal.fire("Deleted!", res.message || "Option deleted successfully", "success");
          fetchQuestions();
        } else {
          Swal.fire("Error", res.message || "Failed to delete option", "error");
        }
      } catch (err) {
        console.error("Delete Option Error:", err);
        Swal.fire("Error", "An error occurred while deleting option", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const term = searchTerm.toLowerCase();
    const keyMatch = q.key?.toLowerCase().includes(term);
    const enMatch = q.question?.en?.toLowerCase().includes(term);
    const frMatch = q.question?.fr?.toLowerCase().includes(term);
    const esMatch = q.question?.es?.toLowerCase().includes(term);
    return keyMatch || enMatch || frMatch || esMatch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="content-page-header d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h5 className="fw-bold mb-1">Onboarding Questions</h5>
                <p className="text-muted small mb-0">
                  Manage survey questions, options, and translations
                </p>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                  onClick={fetchQuestions}
                  disabled={loading}
                >
                  <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i>
                  Refresh
                </button>
                <button
                  className="btn btn-primary btn-sm d-flex align-items-center gap-2 shadow-sm"
                  onClick={handleOpenCreateQuestion}
                >
                  <i className="fas fa-plus-circle"></i>
                  Add Question
                </button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="row mb-4">
            <div className="col-xl-3 col-sm-6 col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted fw-normal mb-1">Total Questions</h6>
                    <h4 className="fw-bold mb-0 text-primary">{questions.length}</h4>
                  </div>
                  <div className="bg-primary-light p-3 rounded-circle text-primary">
                    <i className="fas fa-list-ol fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted fw-normal mb-1">Active Questions</h6>
                    <h4 className="fw-bold mb-0 text-success">
                      {questions.filter((q) => q.is_active).length}
                    </h4>
                  </div>
                  <div className="bg-success-light p-3 rounded-circle text-success">
                    <i className="fas fa-check-circle fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted fw-normal mb-1">Total Choices</h6>
                    <h4 className="fw-bold mb-0 text-info">
                      {questions.reduce((acc, q) => acc + (q.options?.length || 0), 0)}
                    </h4>
                  </div>
                  <div className="bg-info-light p-3 rounded-circle text-info">
                    <i className="fas fa-tasks fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted fw-normal mb-1">With Image</h6>
                    <h4 className="fw-bold mb-0 text-warning">
                      {questions.filter((q) => q.image_url).length}
                    </h4>
                  </div>
                  <div className="bg-warning-light p-3 rounded-circle text-warning">
                    <i className="fas fa-image fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Questions Table Card */}
          <div className="row">
            <div className="col-sm-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
                  <h6 className="card-title mb-0 fw-bold">Question Directory</h6>
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    {/* Language Switcher */}
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className={`btn ${selectedLanguage === "en" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setSelectedLanguage("en")}
                      >
                        🇬🇧 EN
                      </button>
                      <button
                        type="button"
                        className={`btn ${selectedLanguage === "fr" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setSelectedLanguage("fr")}
                      >
                        🇫🇷 FR
                      </button>
                      <button
                        type="button"
                        className={`btn ${selectedLanguage === "es" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setSelectedLanguage("es")}
                      >
                        🇪🇸 ES
                      </button>
                      <button
                        type="button"
                        className={`btn ${selectedLanguage === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setSelectedLanguage("all")}
                      >
                        🌐 All Languages
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="input-group input-group-sm" style={{ width: "260px" }}>
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search key or text..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          className="btn btn-light border"
                          type="button"
                          onClick={() => setSearchTerm("")}
                        >
                          <i className="fas fa-times text-muted"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "65px" }}># ID</th>
                          <th style={{ width: "75px" }}>Order</th>
                          <th>Key</th>
                          <th>Question</th>
                          <th style={{ width: "85px" }}>Image</th>
                          <th style={{ width: "120px" }}>Choices</th>
                          <th style={{ width: "95px" }}>Status</th>
                          <th style={{ width: "150px" }}>Updated At</th>
                          <th className="text-end" style={{ width: "150px" }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="9" className="text-center py-5">
                              <GlobalLoader visible={true} size="medium" />
                            </td>
                          </tr>
                        ) : filteredQuestions.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center text-muted py-5">
                              <i className="fas fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
                              No onboarding questions found
                            </td>
                          </tr>
                        ) : (
                          filteredQuestions.map((q) => (
                            <tr key={q.id}>
                              <td>
                                <span className="badge bg-light text-dark border fw-bold">
                                  #{q.id}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-secondary-light text-secondary fw-semibold">
                                  {q.display_order}
                                </span>
                              </td>
                              <td>
                                <code className="bg-light text-primary px-2 py-1 rounded fw-bold small">
                                  {q.key}
                                </code>
                              </td>
                              <td>
                                {selectedLanguage === "all" ? (
                                  <div className="d-flex flex-column gap-1">
                                    {q.question?.en && (
                                      <div>
                                        <span className="badge bg-secondary me-1 small">EN</span>
                                        <span className="fw-semibold">{q.question.en}</span>
                                      </div>
                                    )}
                                    {q.question?.fr && (
                                      <div className="text-muted small">
                                        <span className="badge bg-info text-dark me-1 small">FR</span>
                                        {q.question.fr}
                                      </div>
                                    )}
                                    {q.question?.es && (
                                      <div className="text-muted small">
                                        <span className="badge bg-warning text-dark me-1 small">ES</span>
                                        {q.question.es}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="fw-semibold text-dark">
                                    {q.question?.[selectedLanguage] || q.question?.en || "-"}
                                  </span>
                                )}
                              </td>
                              <td>
                                {q.image_url ? (
                                  <a
                                    href={q.image_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View full image"
                                  >
                                    <img
                                      src={q.image_url}
                                      alt={q.key}
                                      className="rounded border"
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </a>
                                ) : (
                                  <span className="text-muted small">None</span>
                                )}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-info rounded-pill px-2 py-0 fs-12 fw-semibold"
                                  onClick={() => setViewQuestion(q)}
                                >
                                  <i className="fas fa-list me-1"></i>
                                  {q.options?.length || 0} Choices
                                </button>
                              </td>
                              <td>
                                {q.is_active ? (
                                  <span className="badge bg-success-light text-success border border-success">
                                    Active
                                  </span>
                                ) : (
                                  <span className="badge bg-danger-light text-danger border border-danger">
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td>
                                <small className="text-muted">{formatDate(q.updated_at)}</small>
                              </td>
                              <td className="text-end">
                                <div className="d-flex justify-content-end gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    title="View Choices & Options"
                                    onClick={() => setViewQuestion(q)}
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    title="Edit Question"
                                    onClick={() => handleOpenEditQuestion(q)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    title="Delete Question"
                                    onClick={() => handleDeleteQuestion(q)}
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
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
        </div>
      </div>

      {/* CREATE / EDIT QUESTION MODAL */}
      {isQuestionModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050, overflowY: "auto" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable my-3">
            <div className="modal-content border-0 shadow-lg" style={{ maxHeight: "calc(100vh - 40px)", display: "flex", flexDirection: "column" }}>
              <form onSubmit={handleSubmitQuestion} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div className="modal-header bg-primary text-white py-3 flex-shrink-0">
                  <h5 className="modal-title fw-bold text-white mb-0">
                    <i className={`fas ${questionModalMode === "create" ? "fa-plus-circle" : "fa-edit"} me-2`}></i>
                    {questionModalMode === "create" ? "Add Onboarding Question" : "Edit Onboarding Question"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setIsQuestionModalOpen(false)}
                    disabled={submitting}
                  ></button>
                </div>

                <div className="modal-body p-4" style={{ overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
                  <div className="row g-3">
                    {/* Key & Display Order */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Question Key <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="key"
                        placeholder="e.g. daily_trading_time"
                        value={questionForm.key}
                        onChange={handleQuestionFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Display Order</label>
                      <input
                        type="number"
                        className="form-control"
                        name="display_order"
                        value={questionForm.display_order}
                        onChange={handleQuestionFormChange}
                        min="1"
                      />
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                      <div className="form-check form-switch mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_active_question"
                          name="is_active"
                          checked={questionForm.is_active}
                          onChange={handleQuestionFormChange}
                        />
                        <label className="form-check-label fw-semibold ms-1" htmlFor="is_active_question">
                          Active Question
                        </label>
                      </div>
                    </div>

                    {/* Question Translations */}
                    <div className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="fw-bold text-primary mb-3">
                            <i className="fas fa-globe me-2"></i>Question Text (Multilingual)
                          </h6>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              🇬🇧 English Question <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="question_en"
                              placeholder="e.g. How much time can you dedicate to trading each day?"
                              value={questionForm.question_en}
                              onChange={handleQuestionFormChange}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">🇫🇷 French Question</label>
                            <input
                              type="text"
                              className="form-control"
                              name="question_fr"
                              placeholder="French translation..."
                              value={questionForm.question_fr}
                              onChange={handleQuestionFormChange}
                            />
                          </div>
                          <div className="mb-0">
                            <label className="form-label fw-semibold">🇪🇸 Spanish Question</label>
                            <input
                              type="text"
                              className="form-control"
                              name="question_es"
                              placeholder="Spanish translation..."
                              value={questionForm.question_es}
                              onChange={handleQuestionFormChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Question Image (Optional)</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {questionForm.imagePreview && (
                        <div className="mt-2 d-flex align-items-center gap-3 bg-light p-2 rounded">
                          <img
                            src={questionForm.imagePreview}
                            alt="Preview"
                            className="rounded border"
                            style={{ height: "65px", objectFit: "cover" }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleRemoveImage}
                          >
                            <i className="fas fa-trash me-1"></i> Remove Image
                          </button>
                        </div>
                      )}
                    </div>

                    {/* OPTIONS / CHOICES (options_json) SECTION */}
                    <div className="col-12 mt-4">
                      <div className="card border-primary border-1 shadow-sm">
                        <div className="card-header bg-primary-light d-flex align-items-center justify-content-between py-2">
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="fw-bold mb-0 text-primary">
                              <i className="fas fa-list-check me-2"></i>
                              Answer Options (<code className="text-dark">options_json</code>)
                            </h6>
                            <span className="badge bg-primary">
                              {questionForm.options?.length || 0} Choices
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className={`btn btn-xs ${useRawJson ? "btn-outline-secondary" : "btn-outline-primary"}`}
                              onClick={() => setUseRawJson(!useRawJson)}
                            >
                              <i className={`fas ${useRawJson ? "fa-th-list" : "fa-code"} me-1`}></i>
                              {useRawJson ? "Switch to Form Builder" : "Edit Raw options_json"}
                            </button>
                            {!useRawJson && (
                              <button
                                type="button"
                                className="btn btn-sm btn-success d-flex align-items-center gap-1 fw-bold"
                                onClick={handleAddChoiceCard}
                              >
                                <i className="fas fa-plus"></i> Add Choice
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="card-body bg-light p-3">
                          {useRawJson ? (
                            <div>
                              <label className="form-label fw-semibold small text-muted">
                                Enter JSON array string for <code>options_json</code>:
                              </label>
                              <textarea
                                className="form-control font-monospace text-dark bg-white"
                                rows="8"
                                value={rawJsonString}
                                onChange={(e) => setRawJsonString(e.target.value)}
                                placeholder='[{"value":"30_minutes","label":{"en":"30 minutes","fr":"30 minutes","es":"30 minutos"},"display_order":1,"is_active":true}]'
                              ></textarea>
                            </div>
                          ) : (
                            <div>
                              {questionForm.options.length === 0 ? (
                                <div className="text-center py-4 bg-white rounded border">
                                  <p className="text-muted mb-2">No choices added yet.</p>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={handleAddChoiceCard}
                                  >
                                    <i className="fas fa-plus me-1"></i> Add Choice
                                  </button>
                                </div>
                              ) : (
                                questionForm.options.map((opt, idx) => (
                                  <div key={idx} className="card border shadow-sm mb-3 bg-white">
                                    <div className="card-header bg-white d-flex align-items-center justify-content-between py-2 border-bottom">
                                      <span className="badge bg-secondary fw-bold">
                                        Choice #{idx + 1}
                                      </span>
                                      <div className="d-flex align-items-center gap-3">
                                        <div className="form-check form-switch mb-0 me-2">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`opt_active_${idx}`}
                                            checked={opt.is_active ?? true}
                                            onChange={(e) =>
                                              handleChoiceCardChange(idx, "is_active", e.target.checked)
                                            }
                                          />
                                          <label
                                            className="form-check-label small fw-semibold"
                                            htmlFor={`opt_active_${idx}`}
                                          >
                                            Active
                                          </label>
                                        </div>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger py-0 px-2 fs-12"
                                          onClick={() => handleRemoveChoiceCard(idx)}
                                        >
                                          <i className="fas fa-trash-alt me-1"></i> Remove
                                        </button>
                                      </div>
                                    </div>
                                    <div className="card-body p-3">
                                      <div className="row g-2">
                                        <div className="col-md-8">
                                          <label className="form-label small fw-semibold mb-1">
                                            Value Key <span className="text-danger">*</span>
                                          </label>
                                          <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="e.g. 30_minutes"
                                            value={opt.value}
                                            onChange={(e) =>
                                              handleChoiceCardChange(idx, "value", e.target.value)
                                            }
                                            required
                                          />
                                        </div>
                                        <div className="col-md-4">
                                          <label className="form-label small fw-semibold mb-1">
                                            Order
                                          </label>
                                          <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={opt.display_order}
                                            onChange={(e) =>
                                              handleChoiceCardChange(idx, "display_order", e.target.value)
                                            }
                                            min="1"
                                          />
                                        </div>
                                        <div className="col-md-4">
                                          <label className="form-label small fw-semibold mb-1">
                                            🇬🇧 EN Label <span className="text-danger">*</span>
                                          </label>
                                          <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="e.g. 30 minutes"
                                            value={opt.label?.en || ""}
                                            onChange={(e) =>
                                              handleChoiceCardChange(idx, "label", e.target.value, "en")
                                            }
                                            required
                                          />
                                        </div>
                                        <div className="col-md-4">
                                          <label className="form-label small fw-semibold mb-1">
                                            🇫🇷 FR Label
                                          </label>
                                          <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="French label..."
                                            value={opt.label?.fr || ""}
                                            onChange={(e) =>
                                              handleChoiceCardChange(idx, "label", e.target.value, "fr")
                                            }
                                          />
                                        </div>
                                        <div className="col-md-4">
                                          <label className="form-label small fw-semibold mb-1">
                                            🇪🇸 ES Label
                                          </label>
                                          <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Spanish label..."
                                            value={opt.label?.es || ""}
                                            onChange={(e) =>
                                              handleChoiceCardChange(idx, "label", e.target.value, "es")
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}

                              <div className="text-center mt-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success fw-bold px-3"
                                  onClick={handleAddChoiceCard}
                                >
                                  <i className="fas fa-plus me-1"></i> Add Another Choice
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsQuestionModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-1 fw-bold"
                    disabled={submitting}
                  >
                    {submitting && (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    )}
                    {questionModalMode === "create" ? "Create Question" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS & OPTIONS MANAGEMENT MODAL */}
      {viewQuestion && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050, overflowY: "auto" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-scrollable my-3">
            <div className="modal-content border-0 shadow-lg" style={{ maxHeight: "calc(100vh - 40px)", display: "flex", flexDirection: "column" }}>
              <div className="modal-header bg-light border-bottom py-3 flex-shrink-0">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-14">#{viewQuestion.id}</span>
                  <code className="h5 mb-0 text-dark fw-bold">{viewQuestion.key}</code>
                  {viewQuestion.is_active ? (
                    <span className="badge bg-success">Active</span>
                  ) : (
                    <span className="badge bg-secondary">Inactive</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewQuestion(null)}
                ></button>
              </div>

              <div className="modal-body p-4" style={{ overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
                {/* Question Info Header */}
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-9">
                        <h6 className="fw-bold text-primary mb-2">
                          <i className="fas fa-question-circle me-2"></i>Question Translations
                        </h6>
                        <p className="mb-1 text-dark fw-bold">
                          🇬🇧 EN: <span className="fw-normal">{viewQuestion.question?.en}</span>
                        </p>
                        <p className="mb-1 text-muted small">
                          🇫🇷 FR: {viewQuestion.question?.fr || "-"}
                        </p>
                        <p className="mb-0 text-muted small">
                          🇪🇸 ES: {viewQuestion.question?.es || "-"}
                        </p>
                      </div>
                      {viewQuestion.image_url && (
                        <div className="col-md-3 text-end">
                          <img
                            src={viewQuestion.image_url}
                            alt={viewQuestion.key}
                            className="rounded border bg-white p-1"
                            style={{ maxHeight: "100px", maxWidth: "100%", objectFit: "contain" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Options Table Header & Add Button */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold mb-0 text-dark">
                    <i className="fas fa-list-ul me-2 text-primary"></i>
                    Choices / Options ({viewQuestion.options?.length || 0})
                  </h6>
                  <button
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1 fw-bold"
                    onClick={handleOpenAddOption}
                  >
                    <i className="fas fa-plus"></i> Add Choice
                  </button>
                </div>

                {/* Options Table */}
                <div className="table-responsive border rounded">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "65px" }}># ID</th>
                        <th style={{ width: "70px" }}>Order</th>
                        <th>Value</th>
                        <th>🇬🇧 Label (EN)</th>
                        <th>🇫🇷 Label (FR)</th>
                        <th>🇪🇸 Label (ES)</th>
                        <th style={{ width: "85px" }}>Status</th>
                        <th className="text-end" style={{ width: "100px" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!viewQuestion.options || viewQuestion.options.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-4">
                            No options defined for this question. Click "Add Choice" to create one.
                          </td>
                        </tr>
                      ) : (
                        viewQuestion.options.map((opt) => (
                          <tr key={opt.id}>
                            <td>
                              <span className="badge bg-light text-dark border">#{opt.id}</span>
                            </td>
                            <td>
                              <span className="badge bg-secondary-light text-dark fw-semibold">
                                {opt.display_order}
                              </span>
                            </td>
                            <td>
                              <code className="text-primary bg-light px-2 py-1 rounded small fw-bold">
                                {opt.value}
                              </code>
                            </td>
                            <td className="fw-semibold text-dark">{opt.label?.en || "-"}</td>
                            <td className="text-muted small">{opt.label?.fr || "-"}</td>
                            <td className="text-muted small">{opt.label?.es || "-"}</td>
                            <td>
                              {opt.is_active ? (
                                <span className="badge bg-success-light text-success border border-success">
                                  Active
                                </span>
                              ) : (
                                <span className="badge bg-secondary">Inactive</span>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-1">
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  title="Edit Option"
                                  onClick={() => handleOpenEditOption(opt)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete Option"
                                  onClick={() => handleDeleteOption(opt.id, opt.value)}
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer bg-light border-top">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewQuestion(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE OPTION CREATE / EDIT MODAL */}
      {isOptionModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmitOption}>
                <div className="modal-header bg-primary text-white py-3">
                  <h6 className="modal-title fw-bold text-white mb-0">
                    <i className={`fas ${optionModalMode === "create" ? "fa-plus-circle" : "fa-edit"} me-2`}></i>
                    {optionModalMode === "create" ? "Add New Choice" : "Edit Choice"}
                  </h6>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setIsOptionModalOpen(false)}
                    disabled={submitting}
                  ></button>
                </div>

                <div className="modal-body p-3">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">
                        Value Key <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 30_minutes"
                        value={optionForm.value}
                        onChange={(e) => setOptionForm({ ...optionForm, value: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Order</label>
                      <input
                        type="number"
                        className="form-control"
                        value={optionForm.display_order}
                        onChange={(e) =>
                          setOptionForm({ ...optionForm, display_order: e.target.value })
                        }
                        min="1"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        🇬🇧 English Label <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 30 minutes"
                        value={optionForm.label.en}
                        onChange={(e) =>
                          setOptionForm({
                            ...optionForm,
                            label: { ...optionForm.label, en: e.target.value },
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">🇫🇷 French Label</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="French translation..."
                        value={optionForm.label.fr}
                        onChange={(e) =>
                          setOptionForm({
                            ...optionForm,
                            label: { ...optionForm.label, fr: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">🇪🇸 Spanish Label</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Spanish translation..."
                        value={optionForm.label.es}
                        onChange={(e) =>
                          setOptionForm({
                            ...optionForm,
                            label: { ...optionForm.label, es: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_active_opt"
                          checked={optionForm.is_active}
                          onChange={(e) =>
                            setOptionForm({ ...optionForm, is_active: e.target.checked })
                          }
                        />
                        <label className="form-check-label fw-semibold" htmlFor="is_active_opt">
                          Active Choice
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsOptionModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm d-flex align-items-center gap-1 fw-bold"
                    disabled={submitting}
                  >
                    {submitting && (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    )}
                    {optionModalMode === "create" ? "Add Choice" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
