import React from 'react';
import { Home, Car, DollarSign, Settings } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Accueil', icon: Home },
  { id: 'services', label: 'Services', icon: Car },
  { id: 'money', label: 'Finances', icon: DollarSign },
  { id: 'settings', label: 'Réglages', icon: Settings },
];

const MobileBottomNav = ({ activeTab, setActiveTab, theme, activeTimers = 0 }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 ${currentTheme.surface} border-t ${currentTheme.border}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const showBadge = item.id === 'services' && activeTimers > 0;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-200
                ${isActive ? 'text-blue-500' : currentTheme.textSecondary}`}
            >
              <div className="relative">
                <Icon size={22} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {activeTimers}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
