import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ROLE_PERMISSIONS } from '../lib/data.js';
import { useSettings } from './SettingsContext.jsx';
import { loadJSON, removeKey, saveJSON } from '../lib/id.js';

const LOCAL_KEY = '2hs.session.local';
const SESSION_KEY = '2hs.session.temp';

const AuthContext = createContext(null);

const DEMO_ACCOUNT = {
  id: 'usr_1',
  name: 'مدیر سیستم',
  email: 'admin@2hs.ir',
  role: 'owner',
};

function readSession() {
  return loadJSON(LOCAL_KEY, null) || loadJSON(SESSION_KEY, null) || null;
}

export function AuthProvider({ children }) {
  const { settings } = useSettings();
  const [user, setUser] = useState(readSession);

  const persist = useCallback((account, remember) => {
    removeKey(LOCAL_KEY);
    removeKey(SESSION_KEY);
    if (!account) return;
    const withMeta = { ...account, loginAt: new Date().toISOString() };
    saveJSON(remember ? LOCAL_KEY : SESSION_KEY, withMeta);
  }, []);

  const login = useCallback(
    ({ email, password, remember = true }) => {
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, error: 'ایمیل وارد‌شده معتبر نیست.' };
      }
      if (!password || String(password).length < 4) {
        return { ok: false, error: 'رمز عبور باید حداقل ۴ کاراکتر باشد.' };
      }
      const isDemo = cleanEmail === DEMO_ACCOUNT.email;
      const account = {
        ...DEMO_ACCOUNT,
        email: cleanEmail,
        name: isDemo ? DEMO_ACCOUNT.name : cleanEmail.split('@')[0],
        role: 'owner',
      };
      persist(account, remember);
      setUser(account);
      return { ok: true };
    },
    [persist]
  );

  const register = useCallback(
    ({ name, email, password, remember = true }) => {
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!name || String(name).trim().length < 2) {
        return { ok: false, error: 'نام و نام خانوادگی را کامل وارد کنید.' };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, error: 'ایمیل وارد‌شده معتبر نیست.' };
      }
      if (!password || String(password).length < 6) {
        return { ok: false, error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' };
      }
      const account = {
        id: `usr_${Date.now().toString(36)}`,
        name: String(name).trim(),
        email: cleanEmail,
        role: 'owner',
        onboardingDone: false,
      };
      persist(account, remember);
      setUser(account);
      return { ok: true };
    },
    [persist]
  );

  const completeOnboarding = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, onboardingDone: true };
      const remember = Boolean(loadJSON(LOCAL_KEY, null));
      persist(next, remember);
      return next;
    });
  }, [persist]);

  const logout = useCallback(() => {
    removeKey(LOCAL_KEY);
    removeKey(SESSION_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      const remember = Boolean(loadJSON(LOCAL_KEY, null));
      persist(next, remember);
      return next;
    });
  }, [persist]);

  // The access matrix edited in Settings is authoritative; lib/data.js defaults
  // are the fallback for a profile that has not been customised yet.
  const permissions = useMemo(
    () => settings?.rolePermissions?.[user?.role] || ROLE_PERMISSIONS[user?.role] || [],
    [user?.role, settings?.rolePermissions]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      permissions,
      hasPermission: (perm) => permissions.includes(perm),
      login,
      register,
      logout,
      completeOnboarding,
      updateProfile,
    }),
    [user, permissions, login, register, logout, completeOnboarding, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export const DEMO_CREDENTIALS = { email: DEMO_ACCOUNT.email, password: 'demo1234' };
