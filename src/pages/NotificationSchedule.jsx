import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import GlobalLoader from "../components/GlobalLoader";
import BrokerTabs from "../components/BrokerTabs";
import Swal from "sweetalert2";
import { getNotificationSchedule, resendNotification } from "../api/brokerSubscriptionsApi";

export default function NotificationSchedule() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In-row resending states
  const [resendingIds, setResendingIds] = useState({});

  // Pagination & Search
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNotificationSchedule({ page, limit, search });
      if (res.success) {
        setNotifications(res.data);
        setTotal(res.total);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("An unexpected error occurred while loading notifications.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Resend notification trigger
  const handleResend = async (notifId) => {
    // Prevent duplicate triggers
    if (resendingIds[notifId]) return;

    try {
      // Set local resending loading state
      setResendingIds(prev => ({ ...prev, [notifId]: true }));

      const res = await resendNotification(notifId);
      if (res.success) {
        Swal.fire({
          title: "Queued!",
          text: res.message || "Notification was queued for resend.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // Refetch database state to display the newly queued state cleanly
        fetchNotifications();
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong while sending the notification.", "error");
    } finally {
      // Clear resending loading state
      setResendingIds(prev => {
        const next = { ...prev };
        delete next[notifId];
        return next;
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return <span className="badge bg-success"><i className="fas fa-check me-1"></i> Sent</span>;
      case "failed":
        return <span className="badge bg-danger"><i className="fas fa-exclamation-triangle me-1"></i> Failed</span>;
      case "pending":
        return <span className="badge bg-warning text-dark"><i className="fas fa-spinner fa-spin me-1"></i> Pending</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel?.toLowerCase()) {
      case "email":
        return <i className="fas fa-envelope text-primary me-2" title="Email Channel"></i>;
      case "sms":
        return <i className="fas fa-comment-alt text-success me-2" title="SMS Channel"></i>;
      case "push":
        return <i className="fas fa-bell text-warning me-2" title="Push Notification"></i>;
      default:
        return <i className="fas fa-paper-plane text-secondary me-2"></i>;
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
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title fw-bold text-dark">
                  <i className="fas fa-clock text-primary me-2"></i>
                  Notification Delivery Schedule
                </h3>
                <ul className="breadcrumb bg-transparent p-0 m-0 small">
                  <li className="breadcrumb-item text-muted">Admin</li>
                  <li className="breadcrumb-item text-muted">System</li>
                  <li className="breadcrumb-item active text-primary fw-semibold">Notifications</li>
                </ul>
              </div>
            </div>
          </div>

          <BrokerTabs />

          {/* Table list Card */}
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="card-title fw-bold text-dark mb-0">Delivery Logs</h5>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* 🔍 Search */}
                <div className="input-group" style={{ maxWidth: "240px" }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search users, actions..."
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

                <button className="btn btn-outline-secondary" onClick={fetchNotifications}>
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
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold">Notif ID</th>
                      <th className="fw-semibold">Target User</th>
                      <th className="fw-semibold">Channel</th>
                      <th className="fw-semibold">Type</th>
                      <th className="fw-semibold text-center">Status</th>
                      <th className="fw-semibold">Sent At</th>
                      <th className="fw-semibold" style={{ width: "20%" }}>Failure Reason</th>
                      <th className="fw-semibold text-center">Retries</th>
                      <th className="fw-semibold text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          <GlobalLoader visible={true} size="small" />
                          <p className="text-muted small mt-2">Loading notification schedules...</p>
                        </td>
                      </tr>
                    ) : notifications.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          <div className="py-4">
                            <i className="fas fa-paper-plane text-muted fa-3x mb-3"></i>
                            <h5 className="text-secondary fw-semibold">No Notifications Scheduled</h5>
                            <p className="text-muted small">No items align with search query.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      notifications.map((notif) => {
                        const isFailed = notif.status === "failed";
                        return (
                          <tr
                            key={notif.id}
                            style={{
                              backgroundColor: isFailed ? "#fff5f5" : "transparent",
                            }}
                          >
                            <td className="font-monospace fw-bold small text-secondary">{notif.id}</td>
                            <td className="fw-semibold text-dark">{notif.user || `User ID: ${notif.user_id}`}</td>
                            <td className="text-nowrap">
                              {getChannelIcon(notif.channel)}
                              <span className="text-capitalize small">{notif.channel}</span>
                            </td>
                            <td className="small fw-semibold text-capitalize">
                              {(notif.trigger_event || notif.type || "").replace("_", " ")}
                            </td>
                            <td className="text-center">{getStatusBadge(notif.status)}</td>
                            <td className="small text-muted">
                              {notif.sent_at ? (
                                <span>
                                  <i className="fas fa-check-double text-success me-1"></i>
                                  {new Date(notif.sent_at).toLocaleString()}
                                </span>
                              ) : notif.scheduled_for ? (
                                <span>
                                  <i className="fas fa-clock text-warning me-1"></i>
                                  {new Date(notif.scheduled_for).toLocaleString()} (Scheduled)
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td>
                              {(notif.error_message || notif.failure_reason) ? (
                                <span className="text-danger small fw-semibold d-inline-block text-truncate" style={{ maxWidth: "200px" }} title={notif.error_message || notif.failure_reason}>
                                  <i className="fas fa-times-circle me-1"></i> {notif.error_message || notif.failure_reason}
                                </span>
                              ) : (
                                <span className="text-muted small">—</span>
                              )}
                            </td>
                            <td className="text-center">
                              <span className={`badge ${(notif.retry_count || 0) > 2 ? 'bg-danger' : 'bg-light text-dark border'}`}>
                                {notif.retry_count || 0} / 3
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className={`btn btn-sm shadow-sm px-3 text-nowrap ${
                                  notif.status === "failed" 
                                    ? "btn-danger" 
                                    : notif.status === "pending"
                                    ? "btn-warning text-dark"
                                    : "btn-outline-primary"
                                }`}
                                onClick={() => handleResend(notif.id)}
                                disabled={resendingIds[notif.id]}
                              >
                                {resendingIds[notif.id] ? (
                                  <span><i className="fas fa-spinner fa-spin me-1"></i> Queuing...</span>
                                ) : (
                                  <span><i className="fas fa-paper-plane me-1"></i> Resend</span>
                                )}
                              </button>
                            </td>
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
                    <strong>{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> entries
                  </div>
                  <nav aria-label="Notification pagination">
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
