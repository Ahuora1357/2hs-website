import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { defaultSettings } from '../lib/data.js';
import { loadJSON, saveJSON } from '../lib/id.js';

const STORAGE_KEY = '2hs.settings.v1';
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => ({
    ...defaultSettings(),
    ...loadJSON(STORAGE_KEY, {}),
  }));

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const next = defaultSettings();
    saveJSON(STORAGE_KEY, next);
    setSettings(next);
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings, currency: settings.currency }),
    [settings, updateSettings, resetSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
