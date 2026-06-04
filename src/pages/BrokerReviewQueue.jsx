import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import GlobalLoader from "../components/GlobalLoader";
import BrokerTabs from "../components/BrokerTabs";
import { getBrokerReviewQueue } from "../api/tools";
import { useAuth } from "../context/AuthContext";

export default function BrokerReviewQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & limits
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // Filtering & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" means All

  const { token } = useAuth();

  const fetchQueue = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getBrokerReviewQueue(token, page, limit, statusFilter);
      if (res.success) {
        setQueue(res.data || []);
        setTotal(res.total || 0);
      } else {
        setError(res.message || "Failed to load broker review queue.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while fetching broker review queue.");
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, statusFilter]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case "suspicious":
        return <span className="badge bg-danger">Suspicious</span>;
      default:
        return <span className="badge bg-secondary">{status || "Unknown"}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return <span className="text-muted">-</span>;
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  // Perform local search in case search is not API-bound
  const filteredData = queue.filter((item) => {
    const matchesSearch =
      (item.account_number && item.account_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.broker && item.broker.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.user && item.user.name && item.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.user && item.user.email && item.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.user && item.user.id && item.user.id.toString().includes(searchQuery));

    return matchesSearch;
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
                  <i className="fas fa-clipboard-list me-2 text-primary"></i>
                  Broker Review Queue
                </h3>
                <ul className="breadcrumb bg-transparent p-0 m-0 small">
                  <li className="breadcrumb-item text-muted">Admin</li>
                  <li className="breadcrumb-item text-muted">Broker</li>
                  <li className="breadcrumb-item active text-primary fw-semibold">Review Queue</li>
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
                  onClick={() => { setStatusFilter(""); setPage(1); }}
                >
                  All Queue
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${statusFilter === "pending" ? "btn-warning text-dark" : "btn-outline-warning text-dark"}`}
                  onClick={() => { setStatusFilter("pending"); setPage(1); }}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${statusFilter === "suspicious" ? "btn-danger" : "btn-outline-danger"}`}
                  onClick={() => { setStatusFilter("suspicious"); setPage(1); }}
                >
                  Suspicious
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
                    placeholder="Search User, Email, Account..."
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

                <button className="btn btn-sm btn-outline-secondary px-3" onClick={fetchQueue}>
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
                    {error} <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchQueue}>Retry</button>
                  </div>
                </div>
              )}

              <div className="table-responsive rounded-3 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-dark">
                    <tr>
                      <th className="fw-semibold text-dark">#</th>
                      <th className="fw-semibold text-center text-dark">ID</th>
                      <th className="fw-semibold text-dark">User</th>
                      <th className="fw-semibold text-dark">Broker</th>
                      <th className="fw-semibold text-dark">Account Number</th>
                      <th className="fw-semibold text-center text-dark">Validation Status</th>
                      <th className="fw-semibold text-center text-dark">Match Score</th>
                      <th className="fw-semibold text-dark">Names (WoT / Broker)</th>
                      <th className="fw-semibold text-end text-dark">FTD Amount</th>
                      <th className="fw-semibold text-dark">Submitted Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="10" className="text-center py-5">
                          <GlobalLoader visible={true} size="small" />
                          <p className="text-muted small mt-2">Fetching review queue...</p>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center py-5">
                          <div className="py-4">
                            <i className="fas fa-folder-open text-muted fa-3x mb-3"></i>
                            <h5 className="text-secondary fw-semibold">No Review Queue Records Found</h5>
                            <p className="text-muted small">No data aligns with the current filters and search query.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((ent, index) => {
                        const scoreValue = ent.match_score !== null && ent.match_score !== undefined
                          ? (ent.match_score <= 1 ? ent.match_score * 100 : ent.match_score)
                          : null;

                        return (
                          <tr key={ent.id}>
                            <td className="font-monospace fw-bold small text-primary">{(page - 1) * limit + index + 1}</td>
                            <td className="text-center font-monospace small fw-bold">{ent.id}</td>
                            <td>
                              <div className="d-flex flex-column">
                                <span className="fw-semibold text-dark">{ent.user?.name || <span className="text-muted">-</span>}</span>
                                <span className="small text-muted">{ent.user?.email || "No Email"}</span>
                                <span className="small font-monospace text-primary">UID: {ent.user?.id || "-"}</span>
                              </div>
                            </td>
                            <td>
                              {ent.broker ? (
                                <span className="badge bg-light text-dark border">{ent.broker}</span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="fw-semibold text-dark">{ent.account_number || <span className="text-muted">-</span>}</td>
                            <td className="text-center">{getStatusBadge(ent.validation_status)}</td>
                            <td className="text-center">
                              {scoreValue !== null ? (
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  <span className="small fw-semibold">{Math.round(scoreValue)}%</span>
                                  <div className="progress" style={{ width: "40px", height: "6px" }}>
                                    <div
                                      className={`progress-bar ${
                                        scoreValue > 80
                                          ? "bg-success"
                                          : scoreValue > 50
                                          ? "bg-warning"
                                          : "bg-danger"
                                      }`}
                                      style={{ width: `${scoreValue}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex flex-column small">
                                <div><span className="text-muted">WoT:</span> {ent.name_in_wot || <span className="text-muted">-</span>}</div>
                                <div><span className="text-muted">Broker:</span> {ent.name_in_broker || <span className="text-muted">-</span>}</div>
                              </div>
                            </td>
                            <td className="text-end fw-semibold">
                              {ent.ftd_amount !== null && ent.ftd_amount !== undefined ? (
                                `$${ent.ftd_amount.toLocaleString()}`
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="small text-muted">{formatDate(ent.submitted_at)}</td>
                          </tr>
                        );
                      })
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
                  <nav aria-label="Queue pagination">
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
