import { useState, useCallback } from 'react';

const STORAGE_KEY = 'carwash_device_mode';

export const useDeviceMode = () => {
  const [deviceMode, setDeviceModeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const setDeviceMode = useCallback((mode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
      setDeviceModeState(mode);
    } catch {
      setDeviceModeState(mode);
    }
  }, []);

  const clearDeviceMode = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setDeviceModeState(null);
    } catch {
      setDeviceModeState(null);
    }
  }, []);

  return { deviceMode, setDeviceMode, clearDeviceMode };
};
