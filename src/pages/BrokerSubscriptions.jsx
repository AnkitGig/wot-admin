import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import GlobalLoader from "../components/GlobalLoader";
import Swal from "sweetalert2";
import BrokerSubscriptionDetailModal from "../components/BrokerSubscriptionDetailModal";
import BrokerTabs from "../components/BrokerTabs";
import { getBrokerSubscriptions, getBrokerSubscriptionDetail } from "../api/brokerSubscriptionsApi";

export default function BrokerSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // "" means All
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  // Modal states
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBrokerSubscriptions({ page, limit, search, status });
      if (res.success) {
        setSubscriptions(res.data);
        setTotal(res.total);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching subscriptions.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Open details modal
  const handleOpenDetails = async (subId) => {
    setSelectedSubId(subId);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await getBrokerSubscriptionDetail(subId);
      if (res.success) {
        setSelectedSubscription(res.data);
      } else {
        Swal.fire("Error", res.message || "Failed to load subscription details.", "error");
        setModalOpen(false);
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong while loading details.", "error");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  // Callback when admin completes an action inside the modal
  const handleActionSuccess = (updatedSub) => {
    // 1. Instantly update the details inside the modal
    setSelectedSubscription(updatedSub);
    
    // 2. Instantly update the item inside the parent table list
    setSubscriptions((prevSubs) =>
      prevSubs.map((sub) => (sub.id === updatedSub.id ? updatedSub : sub))
    );
  };

  const getStatusBadge = (validation_status, status) => {
    const subStatus = validation_status || status;
    switch (subStatus) {
      case "matched":
        return <span className="badge bg-success">Matched</span>;
      case "pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case "suspicious":
        return <span className="badge bg-danger">Suspicious</span>;
      case "rejected":
        return <span className="badge bg-secondary">Rejected</span>;
      case "revoked":
        return <span className="badge bg-dark text-light border border-dark">Revoked</span>;
      default:
        return <span className="badge bg-light text-dark">{subStatus}</span>;
    }
  };

  const getPremiumBadge = (access_granted_until, premium_status) => {
    const isPremiumActive = access_granted_until
      ? new Date(access_granted_until) > new Date()
      : premium_status === "active";
    return isPremiumActive ? (
      <span className="badge bg-success-light text-success border border-success">Active</span>
    ) : (
      <span className="badge bg-light text-secondary border">Inactive</span>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header mb-4">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title fw-bold text-dark">
                  <i className="fas fa-handshake me-2 text-primary"></i>
                  Broker Subscriptions Management
                </h3>
                <ul className="breadcrumb bg-transparent p-0 m-0 small">
                  <li className="breadcrumb-item text-muted">Admin</li>
                  <li className="breadcrumb-item text-muted">Broker</li>
                  <li className="breadcrumb-item active text-primary fw-semibold">Subscriptions</li>
                </ul>
              </div>
            </div>
          </div>

          <BrokerTabs />

          {/* Filters & Actions Card */}
          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
              {/* Status Tabs */}
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${status === "" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => { setStatus(""); setPage(1); }}
                >
                  All Subscriptions
                </button>
                <button
                  type="button"
                  className={`btn ${status === "pending" ? "btn-warning text-dark" : "btn-outline-warning text-dark"}`}
                  onClick={() => { setStatus("pending"); setPage(1); }}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={`btn ${status === "matched" ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => { setStatus("matched"); setPage(1); }}
                >
                  Matched
                </button>
                <button
                  type="button"
                  className={`btn ${status === "suspicious" ? "btn-danger" : "btn-outline-danger"}`}
                  onClick={() => { setStatus("suspicious"); setPage(1); }}
                >
                  Suspicious
                </button>
                <button
                  type="button"
                  className={`btn ${status === "rejected" ? "btn-secondary" : "btn-outline-secondary"}`}
                  onClick={() => { setStatus("rejected"); setPage(1); }}
                >
                  Rejected
                </button>
                <button
                  type="button"
                  className={`btn ${status === "revoked" ? "btn-dark text-light" : "btn-outline-dark"}`}
                  onClick={() => { setStatus("revoked"); setPage(1); }}
                >
                  Revoked
                </button>
              </div>

              {/* Search, Limit & Refresh */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="input-group" style={{ maxWidth: "250px" }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search users, emails..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>

                <select
                  className="form-select"
                  style={{ width: "70px" }}
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>

                <button className="btn btn-outline-secondary px-3" onClick={fetchSubscriptions}>
                  <i className="fas fa-redo"></i> Refresh
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="card-body pt-0">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <div>
                    {error} <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchSubscriptions}>Retry</button>
                  </div>
                </div>
              )}

              <div className="table-responsive rounded-3 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold">Sub ID</th>
                      <th className="fw-semibold">User Name</th>
                      <th className="fw-semibold">Email</th>
                      <th className="fw-semibold">Mobile</th>
                      <th className="fw-semibold">Broker</th>
                      <th className="fw-semibold">Submitted Date</th>
                      <th className="fw-semibold text-center">Status</th>
                      <th className="fw-semibold text-center">Match %</th>
                      <th className="fw-semibold text-center">Premium</th>
                      <th className="fw-semibold text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="10" className="text-center py-5">
                          <GlobalLoader visible={true} size="small" />
                          <p className="text-muted small mt-2">Fetching subscription records...</p>
                        </td>
                      </tr>
                    ) : subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center py-5">
                          <div className="py-4">
                            <i className="fas fa-folder-open text-muted fa-3x mb-3"></i>
                            <h5 className="text-secondary fw-semibold">No Subscription Records Found</h5>
                            <p className="text-muted small">No data aligns with the current filters and search query.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((sub) => (
                        <tr
                          key={sub.id}
                          className="cursor-pointer"
                          onClick={() => handleOpenDetails(sub.id)}
                        >
                          <td className="font-monospace fw-bold small text-primary">{sub.id}</td>
                          <td className="fw-semibold text-dark">{sub.user_name}</td>
                          <td>{sub.user_email || sub.email}</td>
                          <td className="text-nowrap">{sub.mobile || sub.account_number || "N/A"}</td>
                          <td>
                            <span className="badge bg-light text-dark border">{sub.broker_name}</span>
                          </td>
                          <td className="small text-muted">
                            {new Date(sub.submitted_at || sub.submitted_date).toLocaleString()}
                          </td>
                          <td className="text-center">{getStatusBadge(sub.validation_status, sub.status)}</td>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <span className="small fw-semibold">
                                {sub.match_confidence !== null && sub.match_confidence !== undefined
                                  ? `${Math.round(sub.match_confidence <= 1 ? sub.match_confidence * 100 : sub.match_confidence)}%`
                                  : "0%"}
                              </span>
                              <div className="progress" style={{ width: "40px", height: "6px" }}>
                                <div
                                  className={`progress-bar ${
                                    (sub.match_confidence !== null && sub.match_confidence !== undefined
                                      ? (sub.match_confidence <= 1 ? sub.match_confidence * 100 : sub.match_confidence)
                                      : 0) > 80
                                      ? "bg-success"
                                      : (sub.match_confidence !== null && sub.match_confidence !== undefined
                                          ? (sub.match_confidence <= 1 ? sub.match_confidence * 100 : sub.match_confidence)
                                          : 0) > 50
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
                                  style={{
                                    width: `${
                                      sub.match_confidence !== null && sub.match_confidence !== undefined
                                        ? (sub.match_confidence <= 1 ? sub.match_confidence * 100 : sub.match_confidence)
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">{getPremiumBadge(sub.access_granted_until, sub.premium_status)}</td>
                          <td className="text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="btn btn-sm btn-soft-primary"
                              onClick={() => handleOpenDetails(sub.id)}
                            >
                              <i className="fas fa-eye me-1"></i> View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted small">
                    Showing <strong>{(page - 1) * limit + 1}</strong> to{" "}
                    <strong>{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> records
                  </div>
                  <nav aria-label="Subscription pagination">
                    <ul className="pagination mb-0">
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

      {/* Subscription Detail Modal */}
      <BrokerSubscriptionDetailModal
        show={modalOpen}
        subId={selectedSubId}
        subscription={selectedSubscription}
        isLoading={modalLoading}
        onClose={() => {
          setModalOpen(false);
          setSelectedSubscription(null);
          setSelectedSubId(null);
        }}
        onActionSuccess={handleActionSuccess}
      />
    </div>
  );
}
