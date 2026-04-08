import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, fetch2FASetup, verifySetup2FA, login2FA } from '../api/auth';

/**
 * authStage values
 *   'idle'          – not logged in
 *   '2fa_setup'     – first-time 2FA: show QR → verify code → advance to '2fa_login'
 *   '2fa_login'     – 2FA enabled, waiting for TOTP code
 *   'authenticated' – JWT in hand
 */

const AuthContext = createContext();

const KEYS = {
  token:     'access_token',
  tokenType: 'token_type',
  adminId:   'admin_id',
  adminData: 'admin_data',
};

const persistSession = ({ access_token, token_type, admin_id }) => {
  localStorage.setItem(KEYS.token,     access_token);
  localStorage.setItem(KEYS.tokenType, token_type);
  localStorage.setItem(KEYS.adminId,   admin_id);
  localStorage.setItem(KEYS.adminData, JSON.stringify({ admin_id, token_type }));
};

const clearSession = () => Object.values(KEYS).forEach((k) => localStorage.removeItem(k));

export const AuthProvider = ({ children }) => {
  const [admin,          setAdmin]          = useState(null);
  const [token,          setToken]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [authStage,      setAuthStage]      = useState('idle');
  const [pendingAdminId, setPendingAdminId] = useState(null);
  const [twoFAQrCode,    setTwoFAQrCode]    = useState(null);
  const [twoFASecret,    setTwoFASecret]    = useState(null);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(KEYS.token);
    const storedAdmin = localStorage.getItem(KEYS.adminData);
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
      setAuthStage('authenticated');
    }
    setLoading(false);
  }, []);

  // ── Step 1: email + password ──────────────────────────────────────────────
  const login = async (email, password) => {
    const result = await loginAdmin(email, password);

    if (result.step === 'done') {
      _finalizeLogin(result.data);
      return { success: true };
    }

    if (result.step === '2fa_login') {
      setPendingAdminId(result.adminId);
      setAuthStage('2fa_login');
      return { success: true, stage: '2fa_login' };
    }

    if (result.step === '2fa_setup') {
      setPendingAdminId(result.adminId);
      const setup = await fetch2FASetup(result.adminId);
      if (setup.success) {
        setTwoFAQrCode(setup.qrCode);
        setTwoFASecret(setup.secret);
        setAuthStage('2fa_setup');
        return { success: true, stage: '2fa_setup', qrCode: setup.qrCode, secret: setup.secret };
      }
      return { success: false, message: setup.message };
    }

    return { success: false, message: result.message };
  };

  // ── Step 2a: confirm TOTP after QR scan (setup only) ─────────────────────
  const confirmSetup2FA = async (code) => {
    if (!pendingAdminId) return { success: false, message: 'Session expired. Please log in again.' };

    const result = await verifySetup2FA(pendingAdminId, code);
    if (result.success) setAuthStage('2fa_login'); // advance: user now enters a fresh code
    return result;
  };

  // ── Step 2b / 3: TOTP code → JWT ─────────────────────────────────────────
  const submitTwoFACode = async (code) => {
    if (!pendingAdminId) return { success: false, message: 'Session expired. Please log in again.' };

    const result = await login2FA(pendingAdminId, code);
    if (result.success) _finalizeLogin(result.data);
    return result.success
      ? { success: true }
      : { success: false, message: result.message };
  };

  // ── Shared finalizer ──────────────────────────────────────────────────────
  const _finalizeLogin = (data) => {
    persistSession(data);
    setToken(data.access_token);
    setAdmin({ admin_id: data.admin_id, token_type: data.token_type });
    setAuthStage('authenticated');
    setPendingAdminId(null);
    setTwoFAQrCode(null);
    setTwoFASecret(null);
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    clearSession();
    setToken(null);
    setAdmin(null);
    setAuthStage('idle');
    setPendingAdminId(null);
    setTwoFAQrCode(null);
    setTwoFASecret(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated: authStage === 'authenticated',
        authStage,
        twoFAQrCode,
        twoFASecret,
        login,
        confirmSetup2FA,
        submitTwoFACode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};