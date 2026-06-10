import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import GlobalLoader from "../components/GlobalLoader";
import BrokerTabs from "../components/BrokerTabs";
import { getAuditLogs } from "../api/brokerSubscriptionsApi";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAuditLogs({ page, limit, search, actionType });
      if (res.success) {
        setLogs(res.data);
        setTotal(res.total);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("An unexpected error occurred while loading audit logs.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, actionType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // CSV Exporter Action
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    
    // Header columns
    const headers = ["Log ID", "Admin Name", "Action Type", "Entity", "Entity ID", "Reason", "IP Address", "Created At"];
    
    // Map logs to CSV rows
    const rows = logs.map(log => [
      log.id,
      log.admin_name,
      log.action_type,
      log.entity || "Broker Subscription",
      `"${log.target_id || log.entity_id || "N/A"}"`,
      `"${(log.reason || "").replace(/"/g, '""')}"`, // escape quotes
      log.ip_address || "System",
      new Date(log.created_at).toLocaleString()
    ]);
    
    // Join items
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    // Create hidden link and download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WOT_Admin_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionTypeBadge = (type) => {
    const action = (type || "").toLowerCase();
    switch (action) {
      case "force-match":
      case "force_match":
        return <span className="badge bg-success"><i className="fas fa-check-double me-1"></i> force-match</span>;
      case "reject":
      case "force_reject":
        return <span className="badge bg-danger"><i className="fas fa-ban me-1"></i> reject</span>;
      case "revoke":
        return <span className="badge bg-warning text-dark"><i className="fas fa-times me-1"></i> revoke</span>;
      case "extend-access":
      case "extend_access":
        return <span className="badge bg-purple"><i className="fas fa-calendar-plus me-1"></i> extend-access</span>;
      case "resend-notification":
        return <span className="badge bg-info text-dark"><i className="fas fa-paper-plane me-1"></i> resend</span>;
      default:
        return <span className="badge bg-secondary text-capitalize">{type.replace("_", " ")}</span>;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header mb-4">
            <div className="row align-items-center justify-content-between">
              <div className="col">
                <h3 className="page-title fw-bold text-dark">
                  <i className="fas fa-history text-primary me-2"></i>
                  System Audit Logs
                </h3>
                <ul className="breadcrumb bg-transparent p-0 m-0 small">
                  <li className="breadcrumb-item text-muted">Admin</li>
                  <li className="breadcrumb-item text-muted">System</li>
                  <li className="breadcrumb-item active text-primary fw-semibold">Audit Logs</li>
                </ul>
              </div>
              <div className="col-auto">
                <button
                  className="btn btn-outline-success px-4"
                  onClick={handleExportCSV}
                  disabled={logs.length === 0}
                >
                  <i className="fas fa-file-csv me-2"></i> Export to CSV
                </button>
              </div>
            </div>
          </div>

          <BrokerTabs />

          {/* Filters Card */}
          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="card-title fw-bold text-dark mb-0">System Activity Records</h5>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Action Type Filter */}
                <select
                  className="form-select"
                  style={{ width: "180px" }}
                  value={actionType}
                  onChange={(e) => { setActionType(e.target.value); setPage(1); }}
                >
                  <option value="">All Actions</option>
                  <option value="force-match">force-match</option>
                  <option value="reject">reject</option>
                  <option value="revoke">revoke</option>
                  <option value="extend-access">extend-access</option>
                  <option value="resend-notification">resend-notification</option>
                </select>

                {/* 🔍 Search */}
                <div className="input-group" style={{ maxWidth: "220px" }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search logs, details..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>

                <select
                  className="form-select"
                  style={{ width: "80px" }}
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>

                <button className="btn btn-light" onClick={fetchLogs}>
                  <i className="fas fa-redo"></i>
                </button>
              </div>
            </div>

            <div className="card-body pt-0">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i> {error}
                </div>
              )}

              <div className="table-responsive rounded-3 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="fw-semibold">Log ID</th>
                      <th className="fw-semibold">Admin Name</th>
                      <th className="fw-semibold text-center">Action Type</th>
                      <th className="fw-semibold">Entity</th>
                      <th className="fw-semibold font-monospace">Entity ID</th>
                      <th className="fw-semibold" style={{ width: "25%" }}>Reason / Notes</th>
                      <th className="fw-semibold">IP Address</th>
                      <th className="fw-semibold">Created At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5">
                          <GlobalLoader visible={true} size="small" />
                          <p className="text-muted small mt-2">Loading activity logs...</p>
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5">
                          <div className="py-4">
                            <i className="fas fa-history text-muted fa-3x mb-3"></i>
                            <h5 className="text-secondary fw-semibold">No Activity Logs Found</h5>
                            <p className="text-muted small">No audit logs matched your query criteria.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id}>
                          <td className="font-monospace fw-bold small text-secondary">{log.id}</td>
                          <td className="fw-semibold text-dark">{log.admin_name}</td>
                          <td className="text-center">{getActionTypeBadge(log.action_type)}</td>
                          <td>
                            <span className="badge bg-light text-dark border">{log.entity || "Broker Subscription"}</span>
                          </td>
                          <td className="font-monospace small text-primary">{log.target_id || log.entity_id || "N/A"}</td>
                          <td>
                            <div className="text-dark fw-semibold small text-wrap" style={{ maxWidth: "260px" }} title={log.reason}>
                              {log.reason}
                            </div>
                            {log.before_state && log.after_state && (
                              <div className="mt-1 font-monospace text-muted d-flex align-items-center gap-1 flex-wrap" style={{ fontSize: "10px" }}>
                                <i className="fas fa-random text-secondary me-1"></i>
                                {Object.keys(log.after_state).map((key) => {
                                  const beforeVal = log.before_state[key];
                                  const afterVal = log.after_state[key];
                                  const formatVal = (v) => {
                                    if (v === null || v === undefined) return "None";
                                    if (typeof v === "string" && v.includes("T")) {
                                      try { return new Date(v).toLocaleDateString(); } catch(e) {}
                                    }
                                    return String(v);
                                  };
                                  return (
                                    <span key={key} className="badge bg-light text-secondary border px-1 py-0.5">
                                      {key}: {formatVal(beforeVal)} ➔ {formatVal(afterVal)}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td className="font-monospace small text-secondary">{log.ip_address || "System"}</td>
                          <td className="small text-muted">
                            {new Date(log.created_at).toLocaleString()}
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
                    <strong>{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> entries
                  </div>
                  <nav aria-label="Audit Log pagination">
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
    </div>
  );
}
