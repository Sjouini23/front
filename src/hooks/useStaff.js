import { useState, useCallback } from 'react';

const DEFAULT_STAFF = {
  bilal: { name: 'Bilal', color: 'blue', icon: '👨‍🔧', emoji: '💪' },
  ayoub: { name: 'Ayoub', color: 'green', icon: '👨‍💼', emoji: '🎯' }
};

const STORAGE_KEY = 'carwash_staff_v1';

const loadStaff = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STAFF;
    const parsed = JSON.parse(stored);
    if (typeof parsed !== 'object' || Object.keys(parsed).length === 0) {
      return DEFAULT_STAFF;
    }
    return parsed;
  } catch {
    return DEFAULT_STAFF;
  }
};

export const useStaff = () => {
  const [staffMembers, setStaffMembersState] = useState(loadStaff);

  const addStaff = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    if (!key) return;
    setStaffMembersState(prev => {
      if (prev[key]) return prev;
      const updated = {
        ...prev,
        [key]: { name: trimmed, color: 'blue', icon: '👨‍🔧', emoji: '💪' }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const renameStaff = useCallback((key, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setStaffMembersState(prev => {
      if (!prev[key]) return prev;
      const updated = {
        ...prev,
        [key]: { ...prev[key], name: trimmed }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteStaff = useCallback((key) => {
    setStaffMembersState(prev => {
      if (Object.keys(prev).length <= 1) return prev;
      const updated = { ...prev };
      delete updated[key];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { staffMembers, addStaff, renameStaff, deleteStaff };
};
