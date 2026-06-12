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
    return { success: false, message: err.message || "Failed to fetch subscriptions" };
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
    return { success: false, message: err.message || "Failed to fetch details" };
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
    return { success: false, message: err.message || "Failed to approve subscription" };
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
    return { success: false, message: err.message || "Failed to reject subscription" };
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
    return { success: false, message: err.message || "Failed to extend premium access" };
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
    return { success: false, message: err.message || "Failed to revoke premium access" };
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
    return { success: false, message: err.message || "Failed to fetch reconciliation runs" };
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
    return { success: false, message: err.message || "Failed to trigger reconciliation" };
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
    return { success: false, message: err.message || "Failed to fetch audit logs" };
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
    return { success: false, message: err.message || "Failed to fetch notifications" };
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
    return { success: false, message: err.message || "Failed to resend notification" };
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
