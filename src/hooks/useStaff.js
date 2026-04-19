import { useState, useCallback, useEffect } from 'react';
import config from '../config.local';

const DEFAULT_STAFF = {
  bilal: { name: 'Bilal', color: 'blue', icon: '👨‍🔧', emoji: '💪' },
  ayoub: { name: 'Ayoub', color: 'green', icon: '👨‍💼', emoji: '🎯' }
};

export const useStaff = () => {
  const [staffMembers, setStaffMembersState] = useState(DEFAULT_STAFF);

  // Load from backend on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        const response = await fetch(`${config.API_BASE_URL}/api/staff`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            setStaffMembersState(data);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch staff, using defaults:', error);
      }
    };
    fetchStaff();
  }, []);

  // Save to backend
  const saveToBackend = useCallback(async (updated) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      await fetch(`${config.API_BASE_URL}/api/staff`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updated)
      });
    } catch (error) {
      console.warn('Failed to save staff to backend:', error);
    }
  }, []);

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
      saveToBackend(updated);
      return updated;
    });
  }, [saveToBackend]);

  const renameStaff = useCallback((key, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setStaffMembersState(prev => {
      if (!prev[key]) return prev;
      const updated = {
        ...prev,
        [key]: { ...prev[key], name: trimmed }
      };
      saveToBackend(updated);
      return updated;
    });
  }, [saveToBackend]);

  const deleteStaff = useCallback((key) => {
    setStaffMembersState(prev => {
      if (Object.keys(prev).length <= 1) return prev;
      const updated = { ...prev };
      delete updated[key];
      saveToBackend(updated);
      return updated;
    });
  }, [saveToBackend]);

  return { staffMembers, addStaff, renameStaff, deleteStaff };
};
