import React, { useEffect, useState, useCallback, useRef } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import GlobalLoader from "../components/GlobalLoader";
import Swal from "sweetalert2";
import BrokerTabs from "../components/BrokerTabs";
import { getReconciliationRuns, triggerReconciliation } from "../api/brokerSubscriptionsApi";

export default function ReconciliationRuns() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const pollIntervalRef = useRef(null);

  // Fetch sync runs
  const fetchRuns = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await getReconciliationRuns();
      if (res.success) {
        setRuns(res.data);
      } else {
        if (!isSilent) setError(res.message);
      }
    } catch (err) {
      if (!isSilent) setError("Failed to load sync runs.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Poll when sync is active
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    
    console.log("Starting reconciliation running status polling...");
    pollIntervalRef.current = setInterval(() => {
      fetchRuns(true);
    }, 10000); // 10 seconds
  }, [fetchRuns]);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      console.log("Stopping running status polling.");
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    fetchRuns();
    return () => stopPolling();
  }, [fetchRuns]);

  // Dynamically check if any run is still in "running" state
  useEffect(() => {
    const hasRunningJob = runs.some(run => run.status === "running");
    if (hasRunningJob) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [runs, startPolling]);



  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i> Success</span>;
      case "running":
        return (
          <span className="badge bg-info text-dark animate-pulse">
            <i className="fas fa-sync fa-spin me-1"></i> Running...
          </span>
        );
      case "failed":
        return <span className="badge bg-danger"><i className="fas fa-times-circle me-1"></i> Failed</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getTriggerTypeBadge = (type) => {
    const trigger = (type || "").toLowerCase();
    if (trigger === "manual") {
      return (
        <span className="badge bg-primary-light text-primary border border-primary"><i className="fas fa-user me-1"></i> Manual</span>
      );
    } else if (trigger === "scheduled") {
      return (
        <span className="badge bg-light text-secondary border"><i className="fas fa-clock me-1"></i> Scheduled</span>
      );
    } else {
      return (
        <span className="badge bg-light text-dark border font-monospace"><i className="fas fa-robot text-purple me-1"></i> {type}</span>
      );
    }
  };

  const getDuration = (run) => {
    if (run.duration) return run.duration;
    const start = new Date(run.started_at);
    const end = run.finished_at || run.completed_at ? new Date(run.finished_at || run.completed_at) : null;
    if (!end || isNaN(start.getTime()) || isNaN(end.getTime())) return "—";
    const seconds = Math.round((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes}m ${remainingSecs}s`;
  };

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
                  <i className="fas fa-sync-alt me-2 text-primary animate-spin-slow"></i>
                  Reconciliation Sync History
                </h3>
                <ul className="breadcrumb bg-transparent p-0 m-0 small">
                  <li className="breadcrumb-item text-muted">Admin</li>
                  <li className="breadcrumb-item text-muted">Broker</li>
                  <li className="breadcrumb-item active text-primary fw-semibold">Reconciliation</li>
                </ul>
              </div>

            </div>
          </div>

          <BrokerTabs />

          {runs.some(run => run.status === "running") && (
            <div className="alert alert-info border-0 shadow-sm d-flex align-items-center mb-4 rounded-3" role="alert">
              <div className="spinner-border spinner-border-sm text-info me-3" role="status"></div>
              <div>
                <strong>Active Sync In Progress:</strong> The dashboard is auto-refreshing every 10 seconds until completed.
              </div>
            </div>
          )}

          {/* Sync History Card */}
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="card-title fw-bold text-dark mb-0">Historical Integration Runs</h5>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => fetchRuns()}>
                <i className="fas fa-redo"></i> Force Refresh
              </button>
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
                      <th className="fw-semibold">Run ID</th>
                      <th className="fw-semibold">Started At</th>
                      <th className="fw-semibold">Completed At</th>
                      <th className="fw-semibold text-center">Status</th>
                      <th className="fw-semibold text-center">Fetched</th>
                      <th className="fw-semibold text-center">Matched</th>
                      <th className="fw-semibold text-center text-danger">Suspicious</th>
                      <th className="fw-semibold">Duration</th>
                      <th className="fw-semibold text-center">Trigger Type</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          <GlobalLoader visible={true} size="small" />
                          <p className="text-muted small mt-2">Loading sync history...</p>
                        </td>
                      </tr>
                    ) : runs.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          <div className="py-4">
                            <i className="fas fa-history text-muted fa-3x mb-3"></i>
                            <h5 className="text-secondary fw-semibold">No Sync History Registered</h5>
                            <p className="text-muted small">No reconciliation runs have been triggered yet.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      runs.map((run) => (
                        <tr key={run.id}>
                          <td className="font-monospace fw-bold small text-secondary">{run.id}</td>
                          <td className="small text-muted">
                            {new Date(run.started_at).toLocaleString()}
                          </td>
                          <td className="small text-muted">
                            {(run.finished_at || run.completed_at) ? new Date(run.finished_at || run.completed_at).toLocaleString() : "—"}
                          </td>
                          <td className="text-center">{getStatusBadge(run.status)}</td>
                          <td className="text-center fw-semibold text-dark">{run.records_fetched}</td>
                          <td className="text-center fw-semibold text-success">{run.records_matched}</td>
                          <td className={`text-center fw-bold ${(run.records_suspicious !== undefined ? run.records_suspicious : run.suspicious_records) > 0 ? 'text-danger' : 'text-muted'}`}>
                            {run.records_suspicious !== undefined ? run.records_suspicious : (run.suspicious_records || 0)}
                          </td>
                          <td className="small text-secondary">{getDuration(run)}</td>
                          <td className="text-center">{getTriggerTypeBadge(run.triggered_by || run.trigger_type)}</td>
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

      <Footer />
    </div>
  );
}
