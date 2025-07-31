import { sanitizeInput } from '../utils/validation';
import { useState, useCallback } from 'react';
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((title, message, type = 'info', duration = 5000) => {
    try {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const notification = { 
        id, 
        title: sanitizeInput(title, 100), 
        message: sanitizeInput(message, 500), 
        type, 
        timestamp: new Date() 
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
      
      if (duration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
      }
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, addNotification, removeNotification, clearAllNotifications };
};