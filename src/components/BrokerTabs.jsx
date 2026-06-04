import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BrokerTabs() {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path
      ? "btn-primary active text-white"
      : "btn-light text-secondary border border-light-gray";

  return (
    <div className="card border-0 shadow-sm mb-4 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="card-body p-2 d-flex flex-wrap gap-2 align-items-center">
        <Link
          to="/admin/broker-subscriptions"
          className={`btn btn-sm px-3 py-2 rounded-pill fw-bold ${isActive(
            "/admin/broker-subscriptions"
          )}`}
          style={{ transition: "all 0.2s" }}
        >
          <i className="fas fa-handshake me-1"></i> Subscriptions
        </Link>
        <Link
          to="/admin/reconciliation-runs"
          className={`btn btn-sm px-3 py-2 rounded-pill fw-bold ${isActive(
            "/admin/reconciliation-runs"
          )}`}
          style={{ transition: "all 0.2s" }}
        >
          <i className="fas fa-sync-alt me-1"></i> Reconciliation Runs
        </Link>
        <Link
          to="/admin/audit-logs"
          className={`btn btn-sm px-3 py-2 rounded-pill fw-bold ${isActive(
            "/admin/audit-logs"
          )}`}
          style={{ transition: "all 0.2s" }}
        >
          <i className="fas fa-history me-1"></i> Audit Logs
        </Link>
        <Link
          to="/admin/notification-schedule"
          className={`btn btn-sm px-3 py-2 rounded-pill fw-bold ${isActive(
            "/admin/notification-schedule"
          )}`}
          style={{ transition: "all 0.2s" }}
        >
          <i className="fas fa-bell me-1"></i> Notification Delivery
        </Link>
        {/* <Link
          to="/admin/broker-entitlements"
          className={`btn btn-sm px-3 py-2 rounded-pill fw-bold ${isActive(
            "/admin/broker-entitlements"
          )}`}
          style={{ transition: "all 0.2s" }}
        >
          <i className="fas fa-award me-1"></i> Entitlements
        </Link>
        <Link
          to="/admin/broker-review-queue"
          className={`btn btn-sm px-3 py-2 rounded-pill fw-bold ${isActive(
            "/admin/broker-review-queue"
          )}`}
          style={{ transition: "all 0.2s" }}
        >
          <i className="fas fa-clipboard-list me-1"></i> Review Queue
        </Link> */}
      </div>
    </div>
  );
}
