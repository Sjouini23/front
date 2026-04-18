import React, { useState } from 'react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
import MobileBottomNav from './MobileBottomNav';
import MobileDashboard from './pages/MobileDashboard';
import MobileServices from './pages/MobileServices';
import MobileFinance from './pages/MobileFinance';
import MobileSettings from './pages/MobileSettings';
import { isDateBeforeToday } from '../../utils/dateUtils';

const MobileApp = ({
  theme, setTheme,
  serviceData,
  staffMembers, addStaff, renameStaff, deleteStaff,
  onLogout,
  onSwitchDevice,
  addNotification,
  onNewService,
  onEditService,
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const currentTheme = LUXURY_THEMES_2025[theme];

  const activeTimers = serviceData.services.filter(s =>
    s.isActive && !s.timeFinished && !isDateBeforeToday(s.date)
  ).length;

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <div className="pb-20 overflow-y-auto min-h-screen">
        {activeTab === 'dashboard' && (
          <MobileDashboard
            services={serviceData.services}
            theme={theme}
            onNewService={onNewService}
            staffMembers={staffMembers}
          />
        )}
        {activeTab === 'services' && (
          <MobileServices
            filteredServices={serviceData.filteredServices}
            theme={theme}
            onEdit={onEditService}
            onDelete={serviceData.handleDeleteService}
            onFinish={serviceData.finishService}
            onNewService={onNewService}
            staffMembers={staffMembers}
          />
        )}
        {activeTab === 'money' && (
          <MobileFinance
            services={serviceData.services}
            theme={theme}
            staffMembers={staffMembers}
          />
        )}
        {activeTab === 'settings' && (
          <MobileSettings
            theme={theme}
            setTheme={setTheme}
            staffMembers={staffMembers}
            addStaff={addStaff}
            renameStaff={renameStaff}
            deleteStaff={deleteStaff}
            onLogout={onLogout}
            onSwitchDevice={onSwitchDevice}
          />
        )}
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        activeTimers={activeTimers}
      />
    </div>
  );
};

export default MobileApp;
