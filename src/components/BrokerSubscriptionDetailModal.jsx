import React, { useState } from "react";
import GlobalLoader from "./GlobalLoader";
import Swal from "sweetalert2";
import {
  approveSubscription,
  rejectSubscription,
  extendSubscription,
  revokeSubscription
} from "../api/brokerSubscriptionsApi";

export default function BrokerSubscriptionDetailModal({
  show,
  subId,
  subscription,
  isLoading,
  onClose,
  onActionSuccess
}) {
  const [actionLoading, setActionLoading] = useState(false);
  
  // Inputs for action forms
  const [approveReason, setApproveReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [extendDays, setExtendDays] = useState(30);
  const [extendReason, setExtendReason] = useState("");
  const [revokeReason, setRevokeReason] = useState("");

  if (!show) return null;

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!approveReason.trim()) {
      Swal.fire("Required", "Please provide a reason for manual approval", "warning");
      return;
    }
    
    const confirm = await Swal.fire({
      title: "Approve Subscription?",
      text: "This will enable premium access for this user instantly.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      confirmButtonColor: "#10b981",
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);
      const res = await approveSubscription(subId, approveReason);
      if (res.success) {
        Swal.fire("Success", res.message || "Subscription approved successfully", "success");
        setApproveReason("");
        // Fetch freshly updated subscription details from database
        const detailRes = await getBrokerSubscriptionDetail(subId);
        if (detailRes.success) {
          onActionSuccess(detailRes.data);
        } else {
          onActionSuccess(res.data);
        }
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      Swal.fire("Required", "Please provide a reason for rejection", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Reject Subscription?",
      text: "This will reject the application and disable future approval actions.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reject",
      confirmButtonColor: "#ef4444",
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);
      const res = await rejectSubscription(subId, rejectReason);
      if (res.success) {
        Swal.fire("Rejected", res.message || "Subscription rejected successfully", "success");
        setRejectReason("");
        // Fetch freshly updated subscription details from database
        const detailRes = await getBrokerSubscriptionDetail(subId);
        if (detailRes.success) {
          onActionSuccess(detailRes.data);
        } else {
          onActionSuccess(res.data);
        }
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async (e) => {
    e.preventDefault();
    if (!extendReason.trim()) {
      Swal.fire("Required", "Please provide a reason for extension", "warning");
      return;
    }

    try {
      setActionLoading(true);
      const res = await extendSubscription(subId, extendDays, extendReason);
      if (res.success) {
        Swal.fire("Extended", res.message || "Premium access extended successfully", "success");
        setExtendReason("");
        // Fetch freshly updated subscription details from database
        const detailRes = await getBrokerSubscriptionDetail(subId);
        if (detailRes.success) {
          onActionSuccess(detailRes.data);
        } else {
          onActionSuccess(res.data);
        }
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (e) => {
    e.preventDefault();
    if (!revokeReason.trim()) {
      Swal.fire("Required", "Please provide a reason for revocation", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Revoke Premium Access?",
      text: "This will revoke premium privileges immediately.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Revoke",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);
      const res = await revokeSubscription(subId, revokeReason);
      if (res.success) {
        Swal.fire("Revoked", res.message || "Premium access revoked successfully", "success");
        setRevokeReason("");
        // Fetch freshly updated subscription details from database
        const detailRes = await getBrokerSubscriptionDetail(subId);
        if (detailRes.success) {
          onActionSuccess(detailRes.data);
        } else {
          onActionSuccess(res.data);
        }
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const subStatus = subscription?.validation_status || status;
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

  const getTimelineIcon = (type) => {
    const action = (type || "").toLowerCase();
    switch (action) {
      case "submitted":
      case "submit":
        return <i className="fas fa-file-upload text-primary"></i>;
      case "auto matched":
      case "auto_matched":
        return <i className="fas fa-magic text-info"></i>;
      case "force approved":
      case "force_match":
      case "force match":
        return <i className="fas fa-check-double text-success"></i>;
      case "rejected":
      case "reject":
        return <i className="fas fa-ban text-danger"></i>;
      case "revoked":
      case "revoke":
        return <i className="fas fa-exclamation-triangle text-warning"></i>;
      case "extended":
      case "extend_access":
      case "extend access":
        return <i className="fas fa-calendar-plus text-purple"></i>;
      default:
        return <i className="fas fa-circle text-secondary"></i>;
    }
  };

  const subStatus = subscription ? (subscription.validation_status || subscription.status) : "";

  // Safe field extractions supporting both list and detail structures
  const userName = subscription?.user?.name || subscription?.user_name || "N/A";
  const userEmail = subscription?.user?.email || subscription?.user_email || subscription?.email || "N/A";
  const brokerName = subscription?.broker?.name || subscription?.broker_name || "N/A";
  const accountNumber = subscription?.account_number || subscription?.broker_details?.account_id || "N/A";
  const brokerEmail = subscription?.broker_details?.registered_email || userEmail;
  
  const rawConfidence = subscription?.match_info?.confidence !== undefined
    ? subscription.match_info.confidence
    : subscription?.match_confidence;
  const confidencePercent = rawConfidence !== null && rawConfidence !== undefined
    ? Math.round(rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence)
    : 0;

  const isPremiumActive = subscription?.access_granted_until
    ? new Date(subscription.access_granted_until) > new Date()
    : subscription?.premium_status === "active";

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0 rounded-3">
          <div className="modal-header bg-light border-bottom">
            <div className="d-flex align-items-center">
              <h5 className="modal-title fw-bold text-dark me-3">
                <i className="fas fa-id-card me-2 text-primary"></i>
                Subscription Detail
              </h5>
              <span className="text-muted small">ID: {subId}</span>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading || actionLoading}
            ></button>
          </div>

          <div className="modal-body p-4" style={{ backgroundColor: "#f8f9fc" }}>
            {isLoading ? (
              <div className="text-center py-5">
                <GlobalLoader visible={true} size="medium" />
                <p className="text-muted mt-2">Loading detailed data...</p>
              </div>
            ) : subscription ? (
              <div className="row g-4">
                
                {/* LEFT SIDE: Info Cards & Admin Actions */}
                <div className="col-lg-7">
                  
                  {/* User Profile Card */}
                  <div className="card border-0 shadow-sm mb-4 rounded-3">
                    <div className="card-header bg-white border-0 py-3">
                      <h6 className="card-title fw-bold mb-0 text-primary">
                        <i className="fas fa-user-circle me-2"></i>User Information
                      </h6>
                    </div>
                    <div className="card-body pt-0">
                      <div className="row g-3">
                        <div className="col-sm-6">
                          <label className="text-muted small d-block">Full Name</label>
                          <span className="fw-semibold text-dark">{userName}</span>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-muted small d-block">Email Address</label>
                          <span className="fw-semibold text-dark">{userEmail}</span>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-muted small d-block">Phone Number</label>
                          <span className="fw-semibold text-dark">{subscription.mobile || "N/A"}</span>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-muted small d-block">Broker Registered Email</label>
                          <span className="fw-semibold text-dark">{brokerEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Broker & Platform Details Card */}
                  <div className="card border-0 shadow-sm mb-4 rounded-3">
                    <div className="card-header bg-white border-0 py-3">
                      <h6 className="card-title fw-bold mb-0 text-info">
                        <i className="fas fa-university me-2"></i>Broker Account Details
                      </h6>
                    </div>
                    <div className="card-body pt-0">
                      <div className="row g-3">
                        <div className="col-sm-4">
                          <label className="text-muted small d-block">Broker Partner</label>
                          <span className="fw-semibold text-dark badge bg-light text-dark border p-2">
                            {brokerName}
                          </span>
                        </div>
                        <div className="col-sm-4">
                          <label className="text-muted small d-block">Account ID / Code</label>
                          <span className="fw-bold text-dark font-monospace">
                            {accountNumber}
                          </span>
                        </div>
                        <div className="col-sm-4">
                          <label className="text-muted small d-block">Trading Platform</label>
                          <span className="fw-semibold text-dark">
                            {subscription.broker_details?.platform || "MT5"}
                          </span>
                        </div>
                        <div className="col-sm-4">
                          <label className="text-muted small d-block">Max Leverage</label>
                          <span className="fw-semibold text-dark">
                            {subscription.broker_details?.leverage || "1:500"}
                          </span>
                        </div>
                        <div className="col-sm-4">
                          <label className="text-muted small d-block">Country Code</label>
                          <span className="fw-semibold text-dark">
                            {subscription.broker_details?.country || "Global"}
                          </span>
                        </div>
                        <div className="col-sm-4">
                          <label className="text-muted small d-block">Match Status</label>
                          <div>{getStatusBadge(subStatus)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium Access Status Card */}
                  <div className="card border-0 shadow-sm mb-4 rounded-3">
                    <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                      <h6 className="card-title fw-bold mb-0 text-success">
                        <i className="fas fa-crown me-2 text-warning"></i>Premium Status & Matching
                      </h6>
                      <span className={`badge ${isPremiumActive ? 'bg-success' : 'bg-secondary'}`}>
                        Premium {isPremiumActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="card-body pt-0">
                      <div className="row g-3 align-items-center">
                        <div className="col-sm-6">
                          <label className="text-muted small d-block">Match Confidence Level</label>
                          <div className="d-flex align-items-center mt-1">
                            <span className="fw-bold text-dark me-2">{confidencePercent}%</span>
                            <div className="progress w-100" style={{ height: "8px" }}>
                              <div
                                className={`progress-bar ${
                                  confidencePercent > 80
                                    ? "bg-success"
                                    : confidencePercent > 50
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                                role="progressbar"
                                style={{ width: `${confidencePercent}%` }}
                                aria-valuenow={confidencePercent}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-muted small d-block">Premium Expiry Date</label>
                          <span className="fw-bold text-dark">
                            {subscription.access_granted_until || subscription.premium_expiry
                              ? new Date(subscription.access_granted_until || subscription.premium_expiry).toLocaleString()
                              : "No Active Premium Expiry"}
                          </span>
                        </div>
                        {subscription.reason && (
                          <div className="col-12">
                            <label className="text-muted small d-block">Last Action Note</label>
                            <div className="bg-light p-2 rounded text-secondary border-start border-3 border-info">
                              {subscription.reason}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FTD & Match details Card */}
                  {(subscription.ftd_amount !== undefined || subscription.match_info) && (
                    <div className="card border-0 shadow-sm mb-4 rounded-3">
                      <div className="card-header bg-white border-0 py-3">
                        <h6 className="card-title fw-bold mb-0 text-dark">
                          <i className="fas fa-search-dollar text-warning me-2"></i>First Time Deposit & Matching Details
                        </h6>
                      </div>
                      <div className="card-body pt-0">
                        <div className="row g-3">
                          <div className="col-sm-6">
                            <label className="text-muted small d-block">FTD Amount</label>
                            <span className="fw-bold text-success fs-5">
                              {subscription.ftd_amount !== null && subscription.ftd_amount !== undefined
                                ? `$${subscription.ftd_amount.toLocaleString()}`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="col-sm-6">
                            <label className="text-muted small d-block">FTD Date</label>
                            <span className="fw-semibold text-dark">
                              {subscription.ftd_date || "N/A"}
                            </span>
                          </div>
                          {subscription.match_info && (
                            <>
                              <div className="col-sm-6">
                                <label className="text-muted small d-block">Fuzzy Name (Way Of Trading)</label>
                                <span className="badge bg-light text-dark border font-monospace p-2 mt-1">
                                  {subscription.match_info.fuzzy_name_wot || "—"}
                                </span>
                              </div>
                              <div className="col-sm-6">
                                <label className="text-muted small d-block">Fuzzy Name (Broker Partner)</label>
                                <span className="badge bg-light text-dark border font-monospace p-2 mt-1">
                                  {subscription.match_info.fuzzy_name_broker || "—"}
                                </span>
                              </div>
                            </>
                          )}
                          {subscription.admin_notes && (
                            <div className="col-12">
                              <label className="text-muted small d-block">System Admin Notes / Tier Tag</label>
                              <div className="bg-light p-2 rounded text-dark font-monospace small">
                                {subscription.admin_notes}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADMIN ACTION CENTER PANEL */}
                  <div className="card border-primary shadow-sm mb-4 rounded-3" style={{ borderLeftWidth: "4px" }}>
                    <div className="card-header bg-white border-0 py-3">
                      <h6 className="card-title fw-bold mb-0 text-primary">
                        <i className="fas fa-user-shield me-2"></i>Admin Control Center
                      </h6>
                    </div>
                    <div className="card-body pt-0">
                      {actionLoading && (
                        <div className="text-center py-3">
                          <GlobalLoader visible={true} size="small" />
                          <span className="text-muted ms-2">Executing action...</span>
                        </div>
                      )}

                      {!actionLoading && (
                        <div className="accordion" id="adminActionsAccordion">
                          
                           {/* Approve (Force Match) Section */}
                          {(subStatus === "pending" || subStatus === "suspicious") && (
                            <div className="accordion-item border-0 mb-2">
                              <h2 className="accordion-header" id="headingApprove">
                                <button
                                  className="accordion-button collapsed btn btn-soft-primary w-100 text-start py-2 px-3 fw-bold rounded"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseApprove"
                                  aria-expanded="false"
                                  aria-controls="collapseApprove"
                                >
                                  <i className="fas fa-check me-2 text-success"></i> Force Match & Approve Subscription
                                </button>
                              </h2>
                              <div
                                id="collapseApprove"
                                className="accordion-collapse collapse"
                                aria-labelledby="headingApprove"
                                data-bs-parent="#adminActionsAccordion"
                              >
                                <div className="accordion-body bg-white border rounded p-3 mt-1">
                                  <form onSubmit={handleApprove}>
                                    <div className="mb-3">
                                      <label className="form-label small fw-bold">Manual Match Justification Reason</label>
                                      <textarea
                                        className="form-control"
                                        rows="2"
                                        placeholder="e.g. Verified deposit record manually with broker partner..."
                                        value={approveReason}
                                        onChange={(e) => setApproveReason(e.target.value)}
                                        required
                                      />
                                    </div>
                                    <button type="submit" className="btn btn-success w-100">
                                      Confirm & Activate Premium
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Reject (Force Reject) Section */}
                          {(subStatus === "pending" || subStatus === "suspicious") && (
                            <div className="accordion-item border-0 mb-2">
                              <h2 className="accordion-header" id="headingReject">
                                <button
                                  className="accordion-button collapsed btn btn-soft-danger w-100 text-start py-2 px-3 fw-bold rounded"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseReject"
                                  aria-expanded="false"
                                  aria-controls="collapseReject"
                                >
                                  <i className="fas fa-times me-2 text-danger"></i> Force Reject Application
                                </button>
                              </h2>
                              <div
                                id="collapseReject"
                                className="accordion-collapse collapse"
                                aria-labelledby="headingReject"
                                data-bs-parent="#adminActionsAccordion"
                              >
                                <div className="accordion-body bg-white border rounded p-3 mt-1">
                                  <form onSubmit={handleReject}>
                                    <div className="mb-3">
                                      <label className="form-label small fw-bold">Rejection Reason</label>
                                      <textarea
                                        className="form-control"
                                        rows="2"
                                        placeholder="e.g. Account not registered under wayoftrading partner tag..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        required
                                      />
                                    </div>
                                    <button type="submit" className="btn btn-danger w-100">
                                      Reject Application
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Extend Access Section */}
                          {subStatus === "matched" && (
                            <div className="accordion-item border-0 mb-2">
                              <h2 className="accordion-header" id="headingExtend">
                                <button
                                  className="accordion-button collapsed btn btn-soft-primary w-100 text-start py-2 px-3 fw-bold rounded"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseExtend"
                                  aria-expanded="false"
                                  aria-controls="collapseExtend"
                                >
                                  <i className="fas fa-calendar-plus me-2 text-purple"></i> Extend Premium Expiry
                                </button>
                              </h2>
                              <div
                                id="collapseExtend"
                                className="accordion-collapse collapse"
                                aria-labelledby="headingExtend"
                                data-bs-parent="#adminActionsAccordion"
                              >
                                <div className="accordion-body bg-white border rounded p-3 mt-1">
                                  <form onSubmit={handleExtend}>
                                    <div className="row g-2 mb-3">
                                      <div className="col-sm-4">
                                        <label className="form-label small fw-bold">Extension Period</label>
                                        <select
                                          className="form-select"
                                          value={extendDays}
                                          onChange={(e) => setExtendDays(Number(e.target.value))}
                                        >
                                          <option value={7}>7 Days</option>
                                          <option value={15}>15 Days</option>
                                          <option value={30}>30 Days</option>
                                          <option value={60}>60 Days</option>
                                          <option value={90}>90 Days</option>
                                        </select>
                                      </div>
                                      <div className="col-sm-8">
                                        <label className="form-label small fw-bold">Extension Reason / Ticket Code</label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="e.g. Loyalty program bonus..."
                                          value={extendReason}
                                          onChange={(e) => setExtendReason(e.target.value)}
                                          required
                                        />
                                      </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">
                                      Extend Expiry
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Revoke Access Section */}
                          {subStatus === "matched" && (
                            <div className="accordion-item border-0 mb-2">
                              <h2 className="accordion-header" id="headingRevoke">
                                <button
                                  className="accordion-button collapsed btn btn-soft-danger w-100 text-start py-2 px-3 fw-bold rounded"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseRevoke"
                                  aria-expanded="false"
                                  aria-controls="collapseRevoke"
                                >
                                  <i className="fas fa-exclamation-triangle me-2 text-warning"></i> Revoke Premium Access
                                </button>
                              </h2>
                              <div
                                id="collapseRevoke"
                                className="accordion-collapse collapse"
                                aria-labelledby="headingRevoke"
                                data-bs-parent="#adminActionsAccordion"
                              >
                                <div className="accordion-body bg-white border rounded p-3 mt-1">
                                  <form onSubmit={handleRevoke}>
                                    <div className="mb-3">
                                      <label className="form-label small fw-bold">Revocation Justification / Audit Reason</label>
                                      <textarea
                                        className="form-control"
                                        rows="2"
                                        placeholder="e.g. Chargeback detected or user disconnected from partner tag..."
                                        value={revokeReason}
                                        onChange={(e) => setRevokeReason(e.target.value)}
                                        required
                                      />
                                    </div>
                                    <button type="submit" className="btn btn-danger w-100">
                                      Revoke Access Immediately
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>
                          )}

                          {(subStatus === "rejected" || subStatus === "revoked") && (
                            <div className="alert alert-secondary mb-0 py-2 border text-center">
                              <i className="fas fa-ban me-2"></i> This subscription application has been {subStatus} and cannot be modified.
                            </div>
                          )}
                          
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* RIGHT SIDE: Audit Timeline & Reconciliation History */}
                <div className="col-lg-5">
                  
                  {/* Audit Timeline Card */}
                  <div className="card border-0 shadow-sm mb-4 rounded-3">
                    <div className="card-header bg-white border-0 py-3">
                      <h6 className="card-title fw-bold mb-0 text-dark">
                        <i className="fas fa-history me-2 text-warning"></i>Audit & Action Timeline
                      </h6>
                    </div>
                    <div className="card-body pt-0">
                      {(() => {
                        const timelineLogs = subscription.audit_logs || subscription.audit_timeline || [];
                        return timelineLogs.length > 0 ? (
                          <div className="timeline-container ps-2 mt-2" style={{ borderLeft: "2px dashed #dee2e6", position: "relative" }}>
                            {timelineLogs.map((item, index) => {
                              const actionName = item.action || item.type || "Event";
                              const eventDate = item.created_at || item.date;
                              const reasonNote = item.reason || item.details || "";
                              const authorName = item.admin_name || item.admin || "System";
                              return (
                                <div key={item.id || index} className="timeline-item position-relative mb-3 pb-1" style={{ marginLeft: "20px" }}>
                                  <span
                                    className="timeline-badge-icon position-absolute d-flex align-items-center justify-content-center bg-white border rounded-circle shadow-sm"
                                    style={{ left: "-31px", top: "0px", width: "24px", height: "24px", fontSize: "11px" }}
                                  >
                                    {getTimelineIcon(actionName)}
                                  </span>
                                  <div className="timeline-content">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                                      <span className="fw-bold text-dark small text-capitalize">
                                        {actionName.replace("_", " ")}
                                      </span>
                                      <span className="text-muted small font-monospace" style={{ fontSize: "11px" }}>
                                        {eventDate ? new Date(eventDate).toLocaleString() : "N/A"}
                                      </span>
                                    </div>
                                    <div className="text-secondary small mt-1">{reasonNote}</div>
                                    <div className="text-muted small-text mt-1" style={{ fontSize: "10px" }}>
                                      Triggered by: <strong>{authorName}</strong>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-muted text-center py-3 mb-0">No audit events logged yet</p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Reconciliation History Card */}
                  <div className="card border-0 shadow-sm rounded-3">
                    <div className="card-header bg-white border-0 py-3">
                      <h6 className="card-title fw-bold mb-0 text-dark">
                        <i className="fas fa-sync-alt me-2 text-info"></i>Reconciliation Integrity History
                      </h6>
                    </div>
                    <div className="card-body pt-0">
                      {subscription.reconciliation_history && subscription.reconciliation_history.length > 0 ? (
                        <div className="list-group list-group-flush mt-1">
                          {subscription.reconciliation_history.map((rec, index) => (
                            <div key={rec.id || index} className="list-group-item bg-transparent px-0 py-3 border-bottom">
                              <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <span className={`badge ${rec.status === 'success' ? 'bg-success text-white border' : 'bg-warning text-dark border'}`}>
                                  {rec.status?.toUpperCase() || "UNVERIFIED"}
                                </span>
                                <span className="text-muted font-monospace" style={{ fontSize: "11px" }}>
                                  {new Date(rec.date).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-secondary small mb-0 mt-1">{rec.details}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted text-center py-3 mb-0">No reconciliation checks logged yet</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">Unable to load details for this subscription ID.</p>
              </div>
            )}
          </div>

          <div className="modal-footer border-top bg-light justify-content-between">
            <span className="text-secondary small">
              <i className="fas fa-lock me-1 text-muted"></i> Super Admin Privileges Active
            </span>
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={onClose}
              disabled={isLoading || actionLoading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
