import { useSecureLocalStorage } from '../../hooks/useSecureLocalStorages';
import { useNotifications } from '../../hooks/useNotifications1';
import React, { useCallback } from 'react';
import {
  AlertCircle,
  X,
  Bell,
  CheckCircle,
  Info,
  AlertTriangle,
  DollarSign,
  Clock
} from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';

export const LuxuryNotifications = React.memo(({ notifications, onDismiss, theme }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  
  const getTypeIcon = useCallback((type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-400" size={20} />;
      case 'warning': return <AlertCircle className="text-amber-400" size={20} />;
      case 'error': return <X className="text-red-400" size={20} />;
      case 'money': return <DollarSign className="text-green-400" size={20} />;
      case 'reminder': return <Bell className="text-blue-400" size={20} />;
      default: return <Bell className="text-blue-400" size={20} />;
    }
  }, []);

  if (!notifications.length) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-[100] space-y-4 max-w-sm"
      role="alert"
      aria-live="polite"
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${currentTheme.modal} rounded-2xl p-4 sm:p-6 transform transition-all duration-700 ease-out animate-in slide-in-from-right border-l-4 border-blue-400 shadow-2xl`}
          style={{
            backdropFilter: 'blur(20px)',
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(17,24,39,0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,1) 100%)'
          }}
        >
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 mt-1 p-2 sm:p-3 rounded-xl bg-blue-500/20">
              {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold ${currentTheme.text} text-sm mb-1`}>
                {notification.title}
              </p>
              <p className={`${currentTheme.textSecondary} text-sm leading-relaxed`}>
                {notification.message}
              </p>
              <p className={`${currentTheme.textMuted} text-xs mt-2 sm:mt-3 flex items-center space-x-1`}>
                <Clock size={12} />
                <span>{notification.timestamp.toLocaleTimeString('fr-TN')}</span>
              </p>
            </div>
            <button
              onClick={() => onDismiss(notification.id)}
              className={`${currentTheme.textMuted} hover:${currentTheme.text} transition-colors flex-shrink-0 p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              aria-label="Fermer la notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});
export default LuxuryNotifications;
