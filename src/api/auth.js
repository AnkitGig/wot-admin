import { apiCall } from './config';

const BASE_URL = 'https://api.wayoftrading.com/aitredding/api';
const postForm = async (endpoint, fields) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(fields),
  });
  return response.json();
};

export const loginAdmin = async (email, password) => {
  try {
    const data = await postForm('/admin/login', { email, password });

    if (data.status === 1) return { step: 'done',      data: data.data };
    if (data.status === 4) return { step: '2fa_setup', adminId: data.data.admin_id };

    if (data.status === 2 || data.status === 3) {
      return { step: '2fa_login', adminId: data.data.admin_id };
    }

    return { step: 'error', message: data.message || 'Login failed' };
  } catch (err) {
    console.error('[loginAdmin] error:', err);
    return { step: 'error', message: err.message || 'Network error' };
  }
};

export const fetch2FASetup = async (adminId) => {
  try {
    const data = await postForm('/admin/2fa/setup', { admin_id: adminId });
    if (data.status === 1) {
      return { success: true, qrCode: data.qr_code, secret: data.secret };
    }
    return { success: false, message: data.message || '2FA setup failed' };
  } catch (err) {
    return { success: false, message: err.message || 'Network error' };
  }
};

export const verifySetup2FA = async (adminId, code) => {
  try {
    const data = await postForm('/admin/2fa/verify-setup', { admin_id: adminId, code });
    return {
      success: data.status === 1,
      message: data.message || (data.status === 1 ? '2FA enabled' : 'Verification failed'),
    };
  } catch (err) {
    return { success: false, message: err.message || 'Network error' };
  }
};


export const login2FA = async (adminId, code) => {
  try {
    const data = await postForm('/admin/2fa/login', { admin_id: adminId, code });
    if (data.status === 1) return { success: true, data: data.data };
    return { success: false, message: data.message || '2FA login failed' };
  } catch (err) {
    return { success: false, message: err.message || 'Network error' };
  }
};

export const getAdminProfile = async (token) => {
  return apiCall('/admin/profile', {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateAdminProfile = async (token, profileData) => {
  return apiCall('/admin/profile', {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
};