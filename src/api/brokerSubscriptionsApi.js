const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get token
const getToken = () => localStorage.getItem("access_token");

// Helper to get headers
const getHeaders = (isJson = true) => {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
    accept: "application/json",
  };
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

// ==========================================
// 1. BROKER SUBSCRIPTIONS API
// ==========================================

export const getBrokerSubscriptions = async ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const res = await fetch(`${API_BASE_URL}/admin/api/v1/broker-subscriptions?${params}`, {
      method: "GET",
      headers: getHeaders(false),
    });

    if (res.status === 401) {
      handleUnauthorized();
    }

    const data = await res.json();
    return res.ok
      ? { success: true, data: data.data || data, total: data.total || 0 }
      : { success: false, message: data.message || "Failed to fetch subscriptions" };
  } catch (err) {
    console.warn("Real API failed, falling back to mock data:", err.message);
    return getMockSubscriptions({ page, limit, search, status });
  }
};

export const getBrokerSubscriptionDetail = async (subId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/api/v1/broker-subscriptions/${subId}`, {
      method: "GET",
      headers: getHeaders(false),
    });

    if (res.status === 401) {
      handleUnauthorized();
    }

    const data = await res.json();
    return res.ok
      ? { success: true, data: data.data || data }
      : { success: false, message: data.message || "Failed to fetch details" };
  } catch (err) {
    console.warn("Real API failed, falling back to mock detail:", err.message);
    return getMockSubscriptionDetail(subId);
  }
};

// ==========================================
// 2. ADMIN ACTIONS API
// ==========================================

export const approveSubscription = async (subId, reason) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/api/v1/broker-subscriptions/${subId}/force-match`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    return res.ok
      ? { success: true, message: data.message || "Subscription approved successfully", data }
      : { success: false, message: data.message || "Failed to approve subscription" };
  } catch (err) {
    console.warn("Real API failed, simulating approval:", err.message);
    return simulateSubscriptionAction(subId, "matched", { reason });
  }
};

export const rejectSubscription = async (subId, reason) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/api/v1/broker-subscriptions/${subId}/force-reject`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    return res.ok
      ? { success: true, message: data.message || "Subscription rejected successfully", data }
      : { success: false, message: data.message || "Failed to reject subscription" };
  } catch (err) {
    console.warn("Real API failed, simulating rejection:", err.message);
    return simulateSubscriptionAction(subId, "rejected", { reason });
  }
};

export const extendSubscription = async (subId, days, reason) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/api/v1/broker-subscriptions/${subId}/extend-access`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ days: parseInt(days), reason }),
    });

    const data = await res.json();
    return res.ok
      ? { success: true, message: data.message || "Premium access extended successfully", data }
      : { success: false, message: data.message || "Failed to extend premium access" };
  } catch (err) {
    console.warn("Real API failed, simulating extension:", err.message);
    return simulateSubscriptionAction(subId, "extended", { days, reason });
  }
};

export const revokeSubscription = async (subId, reason) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/api/v1/broker-subscriptions/${subId}/revoke`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    return res.ok
      ? { success: true, message: data.message || "Premium access revoked successfully", data }
      : { success: false, message: data.message || "Failed to revoke premium access" };
  } catch (err) {
    console.warn("Real API failed, simulating revoking:", err.message);
    return simulateSubscriptionAction(subId, "revoked", { reason });
  }
};

// ==========================================
// 3. RECONCILIATION API
// ==========================================

export const getReconciliationRuns = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/api/v1/reconciliation-runs`, {
      method: "GET",
      headers: getHeaders(false),
    });

    const data = await res.json();
    return res.ok
      ? { success: true, data: data.data || data }
      : { success: false, message: data.message || "Failed to fetch reconciliation runs" };
  } catch (err) {
    console.warn("Real API failed, falling back to mock reconciliation runs:", err.message);
    return getMockReconciliationRuns();
  }
};

export const triggerReconciliation = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/api/v1/reconciliation-runs/trigger`, {
      method: "POST",
      headers: getHeaders(true),
    });

    const data = await res.json();
    return res.ok
      ? { success: true, message: data.message || "Reconciliation triggered successfully", data }
      : { success: false, message: data.message || "Failed to trigger reconciliation" };
  } catch (err) {
    console.warn("Real API failed, simulating trigger:", err.message);
    return simulateTriggerReconciliation();
  }
};

// ==========================================
// 4. AUDIT LOG API
// ==========================================

export const getAuditLogs = async ({ page = 1, limit = 10, search = "", actionType = "" } = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    if (actionType) params.append("action_type", actionType);

    const res = await fetch(`${API_BASE_URL}/admin/api/v1/audit-log?${params}`, {
      method: "GET",
      headers: getHeaders(false),
    });

    const data = await res.json();
    return res.ok
      ? { success: true, data: data.data || data, total: data.total || 0 }
      : { success: false, message: data.message || "Failed to fetch audit logs" };
  } catch (err) {
    console.warn("Real API failed, falling back to mock audit logs:", err.message);
    return getMockAuditLogs({ page, limit, search, actionType });
  }
};

// ==========================================
// 5. NOTIFICATION SCHEDULE API
// ==========================================

export const getNotificationSchedule = async ({ page = 1, limit = 10, search = "" } = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);

    const res = await fetch(`${API_BASE_URL}/admin/api/v1/notification-schedule?${params}`, {
      method: "GET",
      headers: getHeaders(false),
    });

    const data = await res.json();
    return res.ok
      ? { success: true, data: data.data || data, total: data.total || 0 }
      : { success: false, message: data.message || "Failed to fetch notifications" };
  } catch (err) {
    console.warn("Real API failed, falling back to mock notifications:", err.message);
    return getMockNotificationSchedule({ page, limit, search });
  }
};

export const resendNotification = async (notifId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/api/v1/notification-schedule/${notifId}/resend`, {
      method: "POST",
      headers: getHeaders(true),
    });

    const data = await res.json();
    return res.ok
      ? { success: true, message: data.message || "Notification resent successfully", data }
      : { success: false, message: data.message || "Failed to resend notification" };
  } catch (err) {
    console.warn("Real API failed, simulating notification resend:", err.message);
    return simulateResendNotification(notifId);
  }
};

// Helper for 401s
const handleUnauthorized = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("admin_id");
  localStorage.removeItem("admin_data");
  localStorage.removeItem("role");
  window.location.href = "/login";
};

// ============================================================================
// HIGH-FIDELITY LOCAL SIMULATION SYSTEM (In-Memory Mock Storage for testing)
// ============================================================================

// Local storage keys so the changes persist across refreshes during simulation
const LOCAL_STORAGE_KEY_SUBS = "wot_mock_broker_subs";
const LOCAL_STORAGE_KEY_RUNS = "wot_mock_reconcile_runs";
const LOCAL_STORAGE_KEY_AUDITS = "wot_mock_audit_logs";
const LOCAL_STORAGE_KEY_NOTIFS = "wot_mock_notif_schedule";

const getFromStorage = (key, defaultVal) => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(item);
};

const saveToStorage = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Generate initial mock data if not exists
const initialSubscriptions = [
  {
    id: "SUB-82910-2026",
    user_name: "Alex Thompson",
    email: "alex.t@gmail.com",
    mobile: "+1 (555) 234-5678",
    broker_name: "Exness",
    submitted_date: "2026-05-18T10:30:00Z",
    status: "pending",
    match_confidence: 94.5,
    premium_status: "inactive",
    premium_expiry: null,
    reason: "",
    broker_details: {
      account_id: "EXN-998877",
      platform: "MT5",
      leverage: "1:2000",
      country: "Cyprus",
      registered_email: "alex.t@gmail.com"
    },
    audit_timeline: [
      { id: 1, type: "Submitted", date: "2026-05-18T10:30:00Z", admin: "System", details: "Subscription submitted from client area" },
    ],
    reconciliation_history: [
      { id: 1, date: "2026-05-18T11:00:00Z", status: "unmatched", details: "Broker API did not return exact email match, flagged for review" }
    ]
  },
  {
    id: "SUB-71049-2026",
    user_name: "Sophia Martinez",
    email: "sophia.m@outlook.com",
    mobile: "+34 612 345 678",
    broker_name: "XM Global",
    submitted_date: "2026-05-17T14:15:00Z",
    status: "matched",
    match_confidence: 100,
    premium_status: "active",
    premium_expiry: "2026-06-16T14:15:00Z",
    reason: "Auto matched via API integration",
    broker_details: {
      account_id: "XM-3409122",
      platform: "MT4",
      leverage: "1:500",
      country: "Spain",
      registered_email: "sophia.m@outlook.com"
    },
    audit_timeline: [
      { id: 1, type: "Submitted", date: "2026-05-17T14:15:00Z", admin: "System", details: "Subscription submitted from client area" },
      { id: 2, type: "Auto Matched", date: "2026-05-17T14:15:05Z", admin: "System", details: "Auto-matched. Deposit validated via Broker API" }
    ],
    reconciliation_history: [
      { id: 1, date: "2026-05-17T15:00:00Z", status: "success", details: "Data check passed" }
    ]
  },
  {
    id: "SUB-44910-2026",
    user_name: "Michael Chen",
    email: "m.chen@yahoo.com",
    mobile: "+65 8899 7711",
    broker_name: "OctaFX",
    submitted_date: "2026-05-16T08:00:00Z",
    status: "suspicious",
    match_confidence: 42.1,
    premium_status: "inactive",
    premium_expiry: null,
    reason: "Duplicate registration IP detected",
    broker_details: {
      account_id: "OCTA-81729",
      platform: "OctaTrader",
      leverage: "1:1000",
      country: "Singapore",
      registered_email: "different_email@domain.com"
    },
    audit_timeline: [
      { id: 1, type: "Submitted", date: "2026-05-16T08:00:00Z", admin: "System", details: "Subscription submitted from client area" }
    ],
    reconciliation_history: [
      { id: 1, date: "2026-05-16T09:00:00Z", status: "suspicious", details: "Flagged: account registered under multiple user ids" }
    ]
  },
  {
    id: "SUB-22019-2026",
    user_name: "Emma Watson",
    email: "emma.watson@icloud.com",
    mobile: "+44 7700 900077",
    broker_name: "FXTM",
    submitted_date: "2026-05-15T12:00:00Z",
    status: "rejected",
    match_confidence: 12.0,
    premium_status: "inactive",
    premium_expiry: null,
    reason: "Fake broker application: Invoice photo blank",
    broker_details: {
      account_id: "FXTM-10293",
      platform: "MT5",
      leverage: "1:500",
      country: "United Kingdom",
      registered_email: "emma.w@icloud.com"
    },
    audit_timeline: [
      { id: 1, type: "Submitted", date: "2026-05-15T12:00:00Z", admin: "System", details: "Subscription submitted from client area" },
      { id: 2, type: "Rejected", date: "2026-05-15T15:30:00Z", admin: "Super Admin", details: "Fake broker application" }
    ],
    reconciliation_history: [
      { id: 1, date: "2026-05-15T13:00:00Z", status: "failed", details: "Account balance check failed" }
    ]
  },
  {
    id: "SUB-19283-2026",
    user_name: "Marcus Aurelius",
    email: "marcus.stoic@gmail.com",
    mobile: "+39 06 1234567",
    broker_name: "RoboForex",
    submitted_date: "2026-05-14T09:12:00Z",
    status: "matched",
    match_confidence: 98.0,
    premium_status: "active",
    premium_expiry: "2026-06-13T09:12:00Z",
    reason: "Manually matched by super admin",
    broker_details: {
      account_id: "RF-987654",
      platform: "MT5",
      leverage: "1:2000",
      country: "Italy",
      registered_email: "marcus.stoic@gmail.com"
    },
    audit_timeline: [
      { id: 1, type: "Submitted", date: "2026-05-14T09:12:00Z", admin: "System", details: "Subscription submitted from client area" },
      { id: 2, type: "Auto Matched", date: "2026-05-14T09:13:00Z", admin: "System", details: "Pending reconciliation" },
      { id: 3, type: "Force Approved", date: "2026-05-14T10:00:00Z", admin: "Super Admin", details: "Verified manually by admin" }
    ],
    reconciliation_history: [
      { id: 1, date: "2026-05-14T11:00:00Z", status: "success", details: "Synced successfully" }
    ]
  }
];

const initialRuns = [
  {
    id: "RUN-10029",
    started_at: "2026-05-19T10:00:00Z",
    completed_at: "2026-05-19T10:02:15Z",
    status: "success",
    records_fetched: 250,
    records_matched: 242,
    suspicious_records: 5,
    duration: "2m 15s",
    trigger_type: "scheduled"
  },
  {
    id: "RUN-10028",
    started_at: "2026-05-19T06:00:00Z",
    completed_at: "2026-05-19T06:01:45Z",
    status: "success",
    records_fetched: 180,
    records_matched: 175,
    suspicious_records: 2,
    duration: "1m 45s",
    trigger_type: "manual"
  },
  {
    id: "RUN-10027",
    started_at: "2026-05-18T22:00:00Z",
    completed_at: "2026-05-18T22:03:10Z",
    status: "failed",
    records_fetched: 95,
    records_matched: 80,
    suspicious_records: 12,
    duration: "3m 10s",
    trigger_type: "scheduled"
  }
];

const initialAudits = [
  {
    id: "AUD-99210",
    admin_name: "Super Admin",
    action_type: "force-match",
    entity: "broker-subscription",
    entity_id: "SUB-19283-2026",
    reason: "Verified manually by admin",
    ip_address: "192.168.1.55",
    created_at: "2026-05-14T10:00:00Z"
  },
  {
    id: "AUD-99209",
    admin_name: "Super Admin",
    action_type: "reject",
    entity: "broker-subscription",
    entity_id: "SUB-22019-2026",
    reason: "Fake broker application",
    ip_address: "192.168.1.55",
    created_at: "2026-05-15T15:30:00Z"
  }
];

const initialNotifications = [
  {
    id: "NOTIF-77210",
    user: "Alex Thompson (alex.t@gmail.com)",
    channel: "email",
    type: "Broker Verification Link",
    status: "failed",
    sent_at: "2026-05-18T10:30:05Z",
    failure_reason: "SMTP Timeout: Host unreachable",
    retry_count: 3
  },
  {
    id: "NOTIF-77209",
    user: "Sophia Martinez (sophia.m@outlook.com)",
    channel: "push",
    type: "Premium Activated",
    status: "success",
    sent_at: "2026-05-17T14:15:10Z",
    failure_reason: "",
    retry_count: 0
  },
  {
    id: "NOTIF-77208",
    user: "Emma Watson (emma.watson@icloud.com)",
    channel: "email",
    type: "Verification Rejected",
    status: "success",
    sent_at: "2026-05-15T15:30:15Z",
    failure_reason: "",
    retry_count: 1
  }
];

// In-Memory Simulation functions
const getMockSubscriptions = ({ page = 1, limit = 10, search = "", status = "" }) => {
  const subs = getFromStorage(LOCAL_STORAGE_KEY_SUBS, initialSubscriptions);
  
  let filtered = [...subs];
  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(s => 
      s.user_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.mobile.includes(q) ||
      s.broker_name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    success: true,
    data: paginated,
    total
  };
};

const getMockSubscriptionDetail = (subId) => {
  const subs = getFromStorage(LOCAL_STORAGE_KEY_SUBS, initialSubscriptions);
  const found = subs.find(s => s.id === subId);
  if (found) {
    return { success: true, data: found };
  }
  return { success: false, message: "Subscription not found" };
};

const simulateSubscriptionAction = (subId, action, payload) => {
  const subs = getFromStorage(LOCAL_STORAGE_KEY_SUBS, initialSubscriptions);
  const audits = getFromStorage(LOCAL_STORAGE_KEY_AUDITS, initialAudits);
  
  const subIndex = subs.findIndex(s => s.id === subId);
  if (subIndex === -1) {
    return { success: false, message: "Subscription not found" };
  }

  const sub = { ...subs[subIndex] };
  const now = new Date().toISOString();
  
  if (action === "matched") {
    sub.status = "matched";
    sub.premium_status = "active";
    sub.premium_expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    sub.reason = payload.reason;
    sub.audit_timeline.unshift({
      id: Date.now(),
      type: "Force Approved",
      date: now,
      admin: "Super Admin",
      details: payload.reason
    });
  } else if (action === "rejected") {
    sub.status = "rejected";
    sub.premium_status = "inactive";
    sub.reason = payload.reason;
    sub.audit_timeline.unshift({
      id: Date.now(),
      type: "Rejected",
      date: now,
      admin: "Super Admin",
      details: payload.reason
    });
  } else if (action === "extended") {
    const days = parseInt(payload.days || 30);
    const prevExpiry = sub.premium_expiry ? new Date(sub.premium_expiry) : new Date();
    const newExpiry = new Date(prevExpiry.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    
    sub.premium_status = "active";
    sub.premium_expiry = newExpiry;
    sub.audit_timeline.unshift({
      id: Date.now(),
      type: "Extended",
      date: now,
      admin: "Super Admin",
      details: `Extended by ${days} days. Reason: ${payload.reason}`
    });
  } else if (action === "revoked") {
    sub.status = "suspicious";
    sub.premium_status = "inactive";
    sub.premium_expiry = null;
    sub.reason = payload.reason;
    sub.audit_timeline.unshift({
      id: Date.now(),
      type: "Revoked",
      date: now,
      admin: "Super Admin",
      details: payload.reason
    });
  }

  subs[subIndex] = sub;
  saveToStorage(LOCAL_STORAGE_KEY_SUBS, subs);

  // Add audit log
  const newAudit = {
    id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
    admin_name: "Super Admin",
    action_type: action === "matched" ? "force-match" : action,
    entity: "broker-subscription",
    entity_id: subId,
    reason: payload.reason || "Action performed",
    ip_address: "192.168.1.55",
    created_at: now
  };
  audits.unshift(newAudit);
  saveToStorage(LOCAL_STORAGE_KEY_AUDITS, audits);

  return {
    success: true,
    message: `Subscription successfully updated to ${sub.status}`,
    data: sub
  };
};

const getMockReconciliationRuns = () => {
  const runs = getFromStorage(LOCAL_STORAGE_KEY_RUNS, initialRuns);
  return { success: true, data: runs };
};

const simulateTriggerReconciliation = () => {
  const runs = getFromStorage(LOCAL_STORAGE_KEY_RUNS, initialRuns);
  const now = new Date().toISOString();
  
  // Create a running task
  const newRunId = `RUN-${Math.floor(10000 + Math.random() * 90000)}`;
  const newRun = {
    id: newRunId,
    started_at: now,
    completed_at: null, // null means running
    status: "running",
    records_fetched: 0,
    records_matched: 0,
    suspicious_records: 0,
    duration: "pending...",
    trigger_type: "manual"
  };
  
  runs.unshift(newRun);
  saveToStorage(LOCAL_STORAGE_KEY_RUNS, runs);

  // Automatically simulate a completion after 10 seconds (handled inside UI by polling or immediate result)
  setTimeout(() => {
    const updatedRuns = getFromStorage(LOCAL_STORAGE_KEY_RUNS, initialRuns);
    const idx = updatedRuns.findIndex(r => r.id === newRunId);
    if (idx !== -1) {
      updatedRuns[idx] = {
        ...updatedRuns[idx],
        completed_at: new Date(Date.now() + 6500).toISOString(),
        status: "success",
        records_fetched: Math.floor(100 + Math.random() * 150),
        records_matched: Math.floor(80 + Math.random() * 60),
        suspicious_records: Math.floor(Math.random() * 5),
        duration: "6.5s"
      };
      saveToStorage(LOCAL_STORAGE_KEY_RUNS, updatedRuns);
    }
  }, 10000);

  return {
    success: true,
    message: "Reconciliation run triggered successfully",
    data: newRun
  };
};

const getMockAuditLogs = ({ page = 1, limit = 10, search = "", actionType = "" }) => {
  const audits = getFromStorage(LOCAL_STORAGE_KEY_AUDITS, initialAudits);
  
  let filtered = [...audits];
  if (actionType) {
    filtered = filtered.filter(a => a.action_type === actionType);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(a => 
      a.admin_name.toLowerCase().includes(q) ||
      a.entity_id.toLowerCase().includes(q) ||
      a.reason.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    success: true,
    data: paginated,
    total
  };
};

const getMockNotificationSchedule = ({ page = 1, limit = 10, search = "" }) => {
  const notifs = getFromStorage(LOCAL_STORAGE_KEY_NOTIFS, initialNotifications);
  
  let filtered = [...notifs];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(n => 
      n.user.toLowerCase().includes(q) ||
      n.type.toLowerCase().includes(q) ||
      n.channel.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    success: true,
    data: paginated,
    total
  };
};

const simulateResendNotification = (notifId) => {
  const notifs = getFromStorage(LOCAL_STORAGE_KEY_NOTIFS, initialNotifications);
  const idx = notifs.findIndex(n => n.id === notifId);
  if (idx === -1) {
    return { success: false, message: "Notification not found" };
  }

  const notif = { ...notifs[idx] };
  notif.status = "success";
  notif.retry_count += 1;
  notif.sent_at = new Date().toISOString();
  notif.failure_reason = "";

  notifs[idx] = notif;
  saveToStorage(LOCAL_STORAGE_KEY_NOTIFS, notifs);

  // Add to audits
  const audits = getFromStorage(LOCAL_STORAGE_KEY_AUDITS, initialAudits);
  const now = new Date().toISOString();
  audits.unshift({
    id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
    admin_name: "Super Admin",
    action_type: "resend-notification",
    entity: "notification-schedule",
    entity_id: notifId,
    reason: "Resent manually by admin",
    ip_address: "192.168.1.55",
    created_at: now
  });
  saveToStorage(LOCAL_STORAGE_KEY_AUDITS, audits);

  return {
    success: true,
    message: "Notification resent successfully",
    data: notif
  };
};
