import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { createBroker, updateBroker, getBrokers } from "../api/brokerApi";

export default function BrokerForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // 🔥 if id present → edit mode

  const isEdit = !!id;

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    display_name: "",
    affiliate_link_template: "",
    account_format_regex: "^[0-9]+$",
    data_source_type: "cellxpert",
    is_active: true,
    logo_file: null,
  });

  // ================= LOAD DATA (EDIT MODE) =================
  useEffect(() => {
    if (isEdit) {
      fetchBroker();
    }
  }, [id]);

  const fetchBroker = async () => {
    try {
      const res = await getBrokers();

      if (res.success) {
        const broker = res.data.find((b) => b.id == id);

        if (broker) {
          setFormData({
            code: broker.code || "",
            display_name: broker.display_name || "",
            affiliate_link_template: broker.affiliate_link_template || "",
            account_format_regex: broker.account_format_regex || "^[0-9]+$",
            data_source_type: broker.data_source_type || "cellxpert",
            is_active: broker.is_active == 1,
            logo_file: null,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "is_active" ? value === "true" : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      logo_file: e.target.files[0],
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = new FormData();

      data.append("code", formData.code);
      data.append("display_name", formData.display_name);
      data.append("affiliate_link_template", formData.affiliate_link_template);
      data.append("account_format_regex", formData.account_format_regex);
      data.append("data_source_type", formData.data_source_type);
      data.append("is_active", formData.is_active ? "1" : "0");

      if (formData.logo_file) {
        data.append("logo_file", formData.logo_file);
      }

      let response;

      if (isEdit) {
        response = await updateBroker(id, data);
      } else {
        response = await createBroker(data);
      }

      if (response.success) {
        Swal.fire(
          "Success",
          isEdit
            ? "Broker updated successfully"
            : "Broker created successfully",
          "success",
        );

        navigate("/Broker");
      } else {
        Swal.fire("Error", response.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Header */}
          <div className="page-header">
            <div className="content-page-header">
              <h5>{isEdit ? "Edit Broker" : "Add Broker"}</h5>
            </div>
          </div>

          {/* Form */}
          <div className="row">
            <div className="col-md-8 col-lg-6 mx-auto">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    {isEdit ? "Update Broker" : "Broker Information"}
                  </h3>
                </div>

                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label>Broker Code</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label>Display Name</label>
                      <input
                        type="text"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label>Affiliate Link</label>
                      <input
                        type="text"
                        name="affiliate_link_template"
                        value={formData.affiliate_link_template}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>

                    {/* <div className="mb-3">
                      <label>Regex</label>
                      <input
                        type="text"
                        name="account_format_regex"
                        value={formData.account_format_regex}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div> */}

                    <div className="mb-3">
                      <label>Data Source</label>
                      <select
                        name="data_source_type"
                        value={formData.data_source_type}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="cellxpert">Cellxpert</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label>Status</label>
                      <select
                        name="is_active"
                        value={formData.is_active}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label>Broker Logo</label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="form-control"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading
                        ? "Submitting..."
                        : isEdit
                          ? "Update Broker"
                          : "Add Broker"}
                    </button>
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
}
