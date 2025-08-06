import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  Home,
  DollarSign,
  Car,
  Settings,
  Menu,
  Sun,
  Moon,
  LogOut,
  Timer,
  CheckCircle,
  Crown,
  AlertTriangle,
  Database
} from 'lucide-react';

import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';

// Custom hook for window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Currency formatter for Tunisian Dinar
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Navigation Item Component
const NavigationItem = React.memo(({ 
  item, 
  isActive, 
  isCollapsed, 
  currentTheme, 
  onNavigate 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (isCollapsed) {
      const timer = setTimeout(() => setShowTooltip(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const buttonClasses = useMemo(() => {
    const baseClasses = `w-full group relative transition-all duration-200 ${
      isCollapsed ? 'p-3' : 'p-4'
    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:scale-105`;
    
    const activeClasses = isActive
      ? `${item.gradient ? `bg-gradient-to-r ${item.gradient}` : currentTheme.glass} ${item.gradient ? 'text-white' : currentTheme.text} shadow-lg ${item.urgent ? 'ring-2 ring-red-500/50' : ''}`
      : `${currentTheme.textSecondary} hover:${currentTheme.text} hover:${currentTheme.glass} ${
          item.urgent ? 'ring-2 ring-red-500/50' : ''
        }`;
    
    return `${baseClasses} ${activeClasses}`;
  }, [isActive, isCollapsed, item.gradient, item.urgent, currentTheme]);

  return (
    <button
      onClick={() => onNavigate(item.id)}
      className={buttonClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`Navigate to ${item.label}`}
      role="menuitem"
      tabIndex={0}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
        <div className={`${isCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-200 ${
          isActive && item.gradient 
            ? 'bg-white/20' 
            : 'bg-current/10'
        }`}>
          <item.icon size={isCollapsed ? 18 : 18} aria-hidden="true" />
        </div>
        
        {!isCollapsed && (
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">
                  {item.label}
                </p>
                <p className={`text-xs opacity-75 ${
                  isActive && item.gradient 
                    ? 'text-white/75' 
                    : currentTheme.textMuted
                }`}>
                  {item.description}
                </p>
                {item.stats && (
                  <p className={`text-xs font-medium mt-1 ${
                    item.urgent ? 'text-red-300' : 
                    isActive && item.gradient ? 'text-white/90' : 'text-blue-500'
                  }`}>
                    {item.stats}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {item.badge > 0 && (
                  <span 
                    className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                    aria-label={`${item.badge} total services`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.urgent && (
                  <div 
                    className="w-2 h-2 bg-red-500 rounded-full animate-pulse" 
                    aria-label="Urgent status indicator"
                    role="status"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clean Tooltip for collapsed state */}
      {isCollapsed && showTooltip && (
        <div 
          className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 pointer-events-none z-50 opacity-100"
          role="tooltip"
        >
          <div className={`${currentTheme.modal} rounded-xl p-3 shadow-xl whitespace-nowrap border ${currentTheme.border} backdrop-blur-xl`}>
            <p className={`font-bold text-sm ${currentTheme.text}`}>{item.label}</p>
            <p className={`text-xs ${currentTheme.textMuted}`}>{item.description}</p>
            {item.stats && (
              <p className="text-xs text-blue-500 font-medium">{item.stats}</p>
            )}
          </div>
        </div>
      )}
    </button>
  );
});

NavigationItem.displayName = 'NavigationItem';

// Theme Toggle Component
const ThemeToggle = React.memo(({ 
  theme, 
  onThemeToggle, 
  isCollapsed 
}) => {
  const themeConfig = useMemo(() => ({
    dark: {
      label: 'Mode Jour',
      description: 'Thème clair',
      icon: Sun,
      colors: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
    },
    light: {
      label: 'Mode Nuit',
      description: 'Thème sombre',
      icon: Moon,
      colors: 'bg-purple-500/20 text-purple-600 hover:bg-purple-500/30'
    }
  }), []);

  const config = themeConfig[theme];
  const Icon = config.icon;

  return (
    <button
      onClick={onThemeToggle}
      className={`w-full ${isCollapsed ? 'p-2' : 'p-3'} rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${config.colors}`}
      aria-label={`Switch to ${config.label.toLowerCase()}`}
      role="switch"
      aria-checked={theme === 'dark'}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
        <div className={`${isCollapsed ? 'p-1.5' : 'p-2'} rounded-lg bg-current/20`}>
          <Icon size={isCollapsed ? 14 : 16} aria-hidden="true" />
        </div>
        {!isCollapsed && (
          <div className="text-left">
            <p className="font-semibold text-sm">
              {config.label}
            </p>
            <p className="text-xs opacity-70">
              {config.description}
            </p>
          </div>
        )}
      </div>
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

// Logout Modal Component
const LogoutModal = React.memo(({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentTheme, 
  activeTimers
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-[70] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      aria-describedby="logout-description"
    >
      <div className={`${currentTheme.modal} rounded-3xl p-8 max-w-lg w-full shadow-2xl border ${currentTheme.border}`}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-red-500 mb-6 shadow-lg">
            <AlertTriangle className="text-white" size={28} aria-hidden="true" />
          </div>
          <h3 
            id="logout-title"
            className={`text-xl font-bold ${currentTheme.text} mb-3`}
          >
            Confirmer la Déconnexion
          </h3>
          <div 
            id="logout-description"
            className={`${currentTheme.textSecondary} text-sm mb-8 space-y-4`}
          >
            <p className="text-base leading-relaxed">Vous êtes sur le point de vous déconnecter du système JOUINI AI.</p>

            {activeTimers > 0 && (
              <div 
                className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Timer className="text-red-500" size={16} />
                  <p className="text-red-600 font-semibold">
                    ⚠️ {activeTimers} service(s) en cours !
                  </p>
                </div>
                <p className="text-red-500 text-xs">
                  Assurez-vous de terminer ou de mettre en pause vos services actifs.
                </p>
              </div>
            )}
            
            {/* Friendly reminders */}
            <div className={`p-4 rounded-xl ${currentTheme.glass} border ${currentTheme.border}`}>
              <p className="font-semibold text-blue-600 mb-3 flex items-center">
                💡 N'oubliez pas de :
              </p>
              <ul className="text-xs space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span>Sauvegarder vos rapports financiers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span>Vérifier les services en attente</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span>Exporter vos données si nécessaire</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <span>Nettoyer votre espace de travail</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-xl border ${currentTheme.border} ${currentTheme.textSecondary} font-semibold text-sm hover:${currentTheme.text} hover:bg-gray-500/10 transition-all duration-200 transform hover:scale-105`}
              aria-label="Cancel logout"
            >
              Rester Connecté
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
              aria-label="Confirm logout"
            >
              <LogOut size={16} aria-hidden="true" />
              <span>Se Déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

LogoutModal.displayName = 'LogoutModal';

// Main Sidebar Component
const TeslaVerticalSidebar = React.memo(({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  onLogout, 
  isCollapsed, 
  setIsCollapsed, 
  services = []
}) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { width } = useWindowSize();

  // Service statistics with memoization
  const serviceStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayServices = services.filter(s => s.date === today);
    
    // Only count services that are actively running (en cours) - not auto-terminated
    const activeTimers = services.filter(s => 
      s.isActive && 
      !s.timeFinished && 
      s.timeStarted &&
      !s.completed &&
      !s.autoTerminated // Exclude auto-terminated services
    ).length;
    
    const completedToday = todayServices.filter(s => s.timeFinished || s.completed || s.autoTerminated).length;
    const todayRevenue = todayServices.reduce((sum, s) => sum + (s.totalPrice || 0), 0);

    return {
      totalServices: services.length,
      activeTimers,
      todayServices: todayServices.length,
      completedToday,
      todayRevenue
    };
  }, [services]);

  // Navigation items with memoization - FIXED: Only show meaningful stats, hide 0 values
  const navigationItems = useMemo(() => [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      description: 'Vue d\'ensemble',
      stats: serviceStats.activeTimers > 0 ? `${serviceStats.activeTimers} actif${serviceStats.activeTimers !== 1 ? 's' : ''}` : null
    },
    { 
      id: 'money', 
      label: 'Finances', 
      icon: DollarSign, 
      description: 'Gestion financière', 
      gradient: 'from-green-500 to-emerald-600',
      // FIXED: Only show revenue if > 0, otherwise null
      stats: serviceStats.todayRevenue > 0 ? `${formatCurrency(serviceStats.todayRevenue).replace('TND', '').trim()} TND` : null
    },
    { 
      id: 'services', 
      label: 'Services', 
      icon: Car, 
      description: 'Gestion services',
      badge: serviceStats.totalServices,
      urgent: serviceStats.activeTimers > 0,
      stats: serviceStats.activeTimers > 0 
        ? `${serviceStats.activeTimers} EN COURS` 
        : (serviceStats.todayServices > 0 ? `${serviceStats.todayServices} aujourd'hui` : null)
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: Settings, 
      description: 'Configuration'
    }
  ], [serviceStats]);

  // Event handlers with useCallback
  const handleNavigation = useCallback((tabId) => {
    setActiveTab(tabId);
    // Auto-collapse on mobile after navigation
    if (width < 1024) {
      setTimeout(() => setIsCollapsed(true), 200);
    }
  }, [setActiveTab, setIsCollapsed, width]);

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // FIXED: Proper hamburger toggle function
  const handleToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    setShowLogoutConfirm(false);
    onLogout();
  }, [onLogout]);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && width < 1024 && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        currentTheme={currentTheme}
        activeTimers={serviceStats.activeTimers}
      />
      
      {/* Main Sidebar */}
      <nav 
        className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-out ${
          isCollapsed ? 'w-20' : width < 640 ? 'w-72' : width < 1024 ? 'w-80' : 'w-80'
        } ${currentTheme.sidebar}`}
        style={{ 
          backdropFilter: 'blur(20px)',
          borderRight: theme === 'dark' 
            ? '1px solid rgba(59, 130, 246, 0.2)' 
            : '1px solid rgba(99, 102, 241, 0.15)'
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <header className={`p-4 border-b ${currentTheme.border}`}>
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                    <Car className="text-white" size={20} aria-hidden="true" />
                  </div>
                  {serviceStats.activeTimers > 0 && (
                    <div 
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
                      aria-label={`${serviceStats.activeTimers} active services`}
                      role="status"
                    >
                      <span className="text-xs text-white font-bold">{serviceStats.activeTimers}</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className={`text-xl font-bold ${currentTheme.text}`}>JOUINI AI</h1>
                    <Crown className="text-yellow-500" size={16} aria-hidden="true" />
                  </div>
                  <p className={`text-xs ${currentTheme.textMuted}`}>Développé par Seif</p>
                </div>
              </div>
            )}
            
            {/* Collapsed state - Logo centered with menu button on side */}
            {isCollapsed && (
              <div className="flex items-center justify-center w-full relative">
                <div className="relative">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                    <Car className="text-white" size={16} aria-hidden="true" />
                  </div>
                  {serviceStats.activeTimers > 0 && (
                    <div 
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                      aria-label={`${serviceStats.activeTimers} active services`}
                      role="status"
                    >
                      <span className="text-xs text-white font-bold">{serviceStats.activeTimers}</span>
                    </div>
                  )}
                </div>
                
                {/* Menu button positioned to the right when collapsed */}
                <button
                  onClick={handleToggle}
                  className={`absolute right-0 p-2 rounded-xl transition-all duration-200 hover:scale-110 ${currentTheme.glass} ${currentTheme.hover} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  aria-label="Expand sidebar"
                  aria-expanded={false}
                >
                  <Menu 
                    size={16} 
                    className={`${currentTheme.text}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}
            
            {/* Menu button for expanded state */}
            {!isCollapsed && (
              <button
                onClick={handleToggle}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${currentTheme.glass} ${currentTheme.hover} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                aria-label="Collapse sidebar"
                aria-expanded={true}
              >
                <Menu 
                  size={16} 
                  className={`${currentTheme.text}`}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </header>

        {/* Navigation Items - Clean Layout */}
        <main className={`flex-1 ${isCollapsed ? 'p-2 pt-4' : 'p-4'} space-y-2 overflow-y-auto`} role="menu">
          {navigationItems.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              isCollapsed={isCollapsed}
              currentTheme={currentTheme}
              onNavigate={handleNavigation}
            />
          ))}
        </main>

        {/* Bottom Actions */}
        <footer className={`${isCollapsed ? 'p-2' : 'p-4'} border-t ${currentTheme.border} space-y-2`}>
          {/* Theme Toggle */}
          <ThemeToggle
            theme={theme}
            onThemeToggle={handleThemeToggle}
            isCollapsed={isCollapsed}
          />

          {/* Logout */}
          <button
            onClick={handleLogoutClick}
            className={`w-full ${isCollapsed ? 'p-2' : 'p-3'} rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50`}
            aria-label="Logout from system"
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
              <div className={`${isCollapsed ? 'p-1.5' : 'p-2'} rounded-lg bg-red-500/20`}>
                <LogOut size={isCollapsed ? 14 : 16} aria-hidden="true" />
              </div>
              {!isCollapsed && (
                <div className="text-left">
                  <p className="font-semibold text-sm">Déconnexion</p>
                  <p className="text-xs opacity-70 flex items-center space-x-1">
                    <span>Sauvegarder</span>
                    <Database size={10} aria-hidden="true" />
                  </p>
                </div>
              )}
            </div>
          </button>
        </footer>
      </nav>
    </>
  );
});

TeslaVerticalSidebar.displayName = 'TeslaVerticalSidebar';

export default TeslaVerticalSidebar;