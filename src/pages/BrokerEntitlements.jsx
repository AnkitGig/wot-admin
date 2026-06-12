import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import GlobalLoader from "../components/GlobalLoader";
import BrokerTabs from "../components/BrokerTabs";
import { getBrokerEntitlements, extendBrokerAccess, revokeBrokerAccess } from "../api/tools";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function BrokerEntitlements() {
  const [entitlements, setEntitlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useAuth();

  const handleExtend = async (ent) => {
    const { value: formValues } = await Swal.fire({
      title: 'Extend Broker Access',
      html:
        `<div class="mb-3 text-start">` +
        `  <label class="form-label fw-semibold">Days to Add</label>` +
        `  <input id="swal-input-days" type="number" class="form-control" value="30" min="1" step="1">` +
        `</div>` +
        `<div class="mb-3 text-start">` +
        `  <label class="form-label fw-semibold">Reason</label>` +
        `  <textarea id="swal-input-reason" class="form-control" placeholder="Enter reason for extending access..." rows="3"></textarea>` +
        `</div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Extend Access',
      confirmButtonColor: '#3085d6',
      preConfirm: () => {
        const days = document.getElementById('swal-input-days').value;
        const reason = document.getElementById('swal-input-reason').value;
        if (!days || days <= 0) {
          Swal.showValidationMessage('Please enter a valid number of days.');
          return false;
        }
        if (!reason || !reason.trim()) {
          Swal.showValidationMessage('Please enter a reason for extension.');
          return false;
        }
        return { days: parseInt(days), reason: reason.trim() };
      }
    });

    if (formValues) {
      try {
        setLoading(true);
        const res = await extendBrokerAccess(token, {
          subscriptionId: ent.id,
          daysToAdd: formValues.days,
          reason: formValues.reason
        });

        if (res.success) {
          Swal.fire('Extended!', res.message || 'Broker access extended successfully.', 'success');
          fetchEntitlements();
        } else {
          Swal.fire('Error', res.message || 'Failed to extend broker access.', 'error');
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'An error occurred during extension.', 'error');
        setLoading(false);
      }
    }
  };

  const handleRevoke = async (ent) => {
    const { value: reason } = await Swal.fire({
      title: 'Revoke Broker Access',
      input: 'textarea',
      inputLabel: 'Reason for Revocation',
      inputPlaceholder: 'Enter justification for revoking access...',
      inputAttributes: {
        'aria-label': 'Type your reason here'
      },
      showCancelButton: true,
      confirmButtonText: 'Revoke Access',
      confirmButtonColor: '#d33',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'You must enter a reason for revocation!';
        }
      }
    });

    if (reason) {
      try {
        setLoading(true);
        const res = await revokeBrokerAccess(token, {
          subscriptionId: ent.id,
          reason: reason.trim()
        });

        if (res.success) {
          Swal.fire('Revoked!', res.message || 'Broker access revoked successfully.', 'success');
          fetchEntitlements();
        } else {
          Swal.fire('Error', res.message || 'Failed to revoke broker access.', 'error');
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'An error occurred during revocation.', 'error');
        setLoading(false);
      }
    }
  };

  // Pagination & limits
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // Local filtering & search states (to provide premium UX on the loaded page)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" means All

  const fetchEntitlements = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getBrokerEntitlements(token, page, limit);
      if (res.success) {
        setEntitlements(res.data || []);
        setTotal(res.total || 0);
      } else {
        setError(res.message || "Failed to load broker entitlements.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while fetching broker entitlements.");
    } finally {
      setLoading(false);
    }
  }, [token, page, limit]);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="badge bg-success">Active</span>;
      case "pending_validation":
        return <span className="badge bg-warning text-dark">Pending Validation</span>;
      case "revoked":
        return <span className="badge bg-danger">Revoked</span>;
      default:
        return <span className="badge bg-secondary">{status || "Unknown"}</span>;
    }
  };

  const getGrantProcessedBadge = (processed) => {
    return processed ? (
      <span className="badge bg-success-light text-success border border-success">Processed</span>
    ) : (
      <span className="badge bg-light text-secondary border">Unprocessed</span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return <span className="text-muted">-</span>;
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  // Perform local search and filtering on the fetched page data
  const filteredData = entitlements.filter((item) => {
    const matchesSearch =
      (item.broker_account_number && item.broker_account_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.user_id && item.user_id.toString().includes(searchQuery)) ||
      (item.broker_name && item.broker_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.phone_number && item.phone_number.includes(searchQuery));

    const matchesStatus = statusFilter === "" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header mb-4">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title fw-bold text-dark">
                  <i className="fas fa-award me-2 text-primary"></i>
                  Broker Entitlements Management
                </h3>
                <ul className="breadcrumb bg-transparent p-0 m-0 small">
                  <li className="breadcrumb-item text-muted">Admin</li>
                  <li className="breadcrumb-item text-muted">Broker</li>
                  <li className="breadcrumb-item active text-primary fw-semibold">Entitlements</li>
                </ul>
              </div>
            </div>
          </div>

          <BrokerTabs />

          {/* Table & Filtering Card */}
          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
              {/* Status Filters */}
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${statusFilter === "" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setStatusFilter("")}
                >
                  All Statuses
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${statusFilter === "active" ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${statusFilter === "pending_validation" ? "btn-warning text-dark" : "btn-outline-warning text-dark"}`}
                  onClick={() => setStatusFilter("pending_validation")}
                >
                  Pending Validation
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${statusFilter === "revoked" ? "btn-danger" : "btn-outline-danger"}`}
                  onClick={() => setStatusFilter("revoked")}
                >
                  Revoked
                </button>
              </div>

              {/* Search, Limit & Refresh */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="input-group input-group-sm" style={{ maxWidth: "250px" }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search Account, User ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="form-select form-select-sm"
                  style={{ width: "80px" }}
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>

                <button className="btn btn-sm btn-outline-secondary px-3" onClick={fetchEntitlements}>
                  <i className="fas fa-redo"></i> Refresh
                </button>
              </div>
            </div>

            {/* Table Body Container */}
            <div className="card-body pt-0">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <div>
                    {error} <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchEntitlements}>Retry</button>
                  </div>
                </div>
              )}

              <div className="table-responsive rounded-3 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="fw-semibold text-light">#</th>
                      <th className="fw-semibold text-center text-light">Id_subscription</th>
                      <th className="fw-semibold text-light">User name</th>
                      <th className="fw-semibold text-light">User ID</th>
                      <th className="fw-semibold text-light">Mail</th>
                      <th className="fw-semibold text-light">Phone number</th>
                      <th className="fw-semibold text-light">Account Number</th>
                      <th className="fw-semibold text-light">Broker Name</th>
                      <th className="fw-semibold text-center text-light">Status</th>
                      <th className="fw-semibold text-end text-light">FTD Amount</th>
                      <th className="fw-semibold text-center text-light">FTD Date</th>
                      <th className="fw-semibold text-center text-light">Duration</th>
                      <th className="fw-semibold text-light">Validity (Start - End)</th>
                      <th className="fw-semibold text-center text-light">Grant Processed</th>
                      <th className="fw-semibold text-light">Submitted Date</th>
                      <th className="fw-semibold text-light">Pending Until</th>
                      <th className="fw-semibold text-center text-light">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="17" className="text-center py-5">
                          <GlobalLoader visible={true} size="small" />
                          <p className="text-muted small mt-2">Fetching broker entitlements...</p>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="17" className="text-center py-5">
                          <div className="py-4">
                            <i className="fas fa-folder-open text-muted fa-3x mb-3"></i>
                            <h5 className="text-secondary fw-semibold">No Entitlements Found</h5>
                            <p className="text-muted small">No data aligns with the current filters and search query.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((ent, index) => (
                        <tr key={ent.id}>
                          <td className="font-monospace fw-bold small text-primary">{(page - 1) * limit + index + 1}</td>
                          <td className="text-center font-monospace small fw-bold">{ent.id}</td>
                          <td className="fw-semibold text-dark">{ent.name || "—"}</td>
                          <td className="font-monospace small">{ent.user_id || "—"}</td>
                          <td>{ent.email || "—"}</td>
                          <td className="text-nowrap">
                            {ent.phone_number ? `${ent.country_code || ""} ${ent.phone_number}`.trim() : "—"}
                          </td>
                          <td className="fw-semibold text-dark">{ent.broker_account_number || <span className="text-muted">-</span>}</td>
                          <td>
                            {ent.broker_name ? (
                              <span className="badge bg-light text-dark border">{ent.broker_name}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-center">{getStatusBadge(ent.status)}</td>
                          <td className="text-end fw-semibold">
                            {ent.ftd_amount !== null && ent.ftd_amount !== undefined ? (
                              `$${ent.ftd_amount.toLocaleString()}`
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-center small">{ent.ftd_date || <span className="text-muted">-</span>}</td>
                          <td className="text-center small">
                            {ent.duration_months ? (
                              `${ent.duration_months} Months`
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="small">
                            {ent.start_at || ent.end_at ? (
                              <div>
                                <span>{ent.start_at ? new Date(ent.start_at).toLocaleDateString() : "N/A"}</span>
                                <span className="mx-1 text-muted">to</span>
                                <span>{ent.end_at ? new Date(ent.end_at).toLocaleDateString() : "N/A"}</span>
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-center">{getGrantProcessedBadge(ent.grant_processed)}</td>
                          <td className="small text-muted">{formatDate(ent.submitted_at)}</td>
                          <td className="small text-muted">{formatDate(ent.pending_until)}</td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-1">
                              <button
                                className="btn btn-xs btn-outline-primary"
                                title="Extend Access"
                                onClick={() => handleExtend(ent)}
                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderRadius: "4px" }}
                              >
                                <i className="fas fa-calendar-plus me-1"></i> Extend
                              </button>
                              <button
                                className="btn btn-xs btn-outline-danger"
                                title="Revoke Access"
                                onClick={() => handleRevoke(ent)}
                                disabled={ent.status === "revoked"}
                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderRadius: "4px" }}
                              >
                                <i className="fas fa-ban me-1"></i> Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {!loading && totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted small">
                    Showing <strong>{(page - 1) * limit + 1}</strong> to{" "}
                    <strong>{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> records
                  </div>
                  <nav aria-label="Entitlements pagination">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage(page - 1)}>
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                          <button className="page-link" onClick={() => setPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage(page + 1)}>
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
