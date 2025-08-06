import React, { useState, useEffect, Suspense } from 'react';
import { Download, Plus, RefreshCw } from 'lucide-react';

// UTILITIES
import { LUXURY_THEMES_2025 } from './utils/luxuryThemes';
import { useSecureLocalStorage } from './hooks/useSecureLocalStorages';
import { useNotifications } from './hooks/useNotifications1';

// CUSTOM HOOKS
import { useAuth } from './hooks/useAuth';
import { useServices } from './hooks/useServices';

// COMPONENTS
import AppErrorBoundary from './components/shared/AppErrorBoundary';
import VerticalSidebar from './components/shared/VerticalSidebar';
import ServiceForm from './components/shared/ServiceForm';
import Notifications from './components/shared/Notifications';
import MoneyAIDashboard from './components/shared/MoneyAIDashboard';

// NEW SPLIT COMPONENTS
import { LoginForm } from './components/Auth';
import { Header } from './components/Layout';
import { PersonalAIAssistant } from './components/Dashboard';
import { ServicesList } from './components/Services';
import { SettingsMain } from './components/Settings';



export default function JouiniLuxuryAI2025() {
  // Theme & UI State
  const [theme, setTheme] = useSecureLocalStorage('jouini_luxury_theme_2025', 'dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [sortOrder, setSortOrder] = useState('default');
  // Notifications
  const { notifications, addNotification, removeNotification, clearAllNotifications } = useNotifications();

  // Custom Hooks
  const authData = useAuth(addNotification);
  const serviceData = useServices(addNotification);

  const currentTheme = LUXURY_THEMES_2025[theme];

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time clock with cleanup
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle logout with services hook
  const handleLogout = () => {
    authData.handleLogout();
    setActiveTab('dashboard');
    clearAllNotifications();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            serviceData.setShowServiceForm(true);
            break;
          case 'e':
            event.preventDefault();
            serviceData.exportToCSV();
            break;
          case 'Escape':
            event.preventDefault();
            if (serviceData.showServiceForm) {
              serviceData.setShowServiceForm(false);
              serviceData.setEditingService(null);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [serviceData.exportToCSV, serviceData.showServiceForm]);

  // Enhanced Login Screen
  if (!authData.isAuthenticated) {
    return (
      <AppErrorBoundary>
        <LoginForm 
          theme={theme}
          setTheme={setTheme}
          authData={authData}
          onSubmit={authData.handleLogin}
        />
        <Notifications 
          notifications={notifications} 
          onDismiss={removeNotification} 
          theme={theme} 
        />
      </AppErrorBoundary>
    );
  }

  // Main Application with Error Boundary
  return (
    <AppErrorBoundary>
      <div className={`min-h-screen transition-all duration-500 ${currentTheme.background}`}>
        {/* Luxury Notifications */}
        <Notifications 
          notifications={notifications} 
          onDismiss={removeNotification} 
          theme={theme} 
        />

        {/* Tesla-inspired Vertical Sidebar */}
        <VerticalSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          services={serviceData.services}
        />

        {/*  Service Form */}
        {serviceData.showServiceForm && (
          <Suspense fallback={<div>Loading...</div>}>
            <ServiceForm
              onSubmit={serviceData.handleCreateService}
              existingService={serviceData.editingService}
              onCancel={() => {
                serviceData.setShowServiceForm(false);
                serviceData.setEditingService(null);
              }}
              theme={theme}
              addNotification={addNotification}
              serviceConfig={serviceData.serviceConfig}
            />
          </Suspense>
        )}

        {/* Main Content Area */}
        <main className={`transition-all duration-500 ${
          sidebarCollapsed ? 'ml-16 lg:ml-20' : 'ml-64 sm:ml-72 lg:ml-80'
        } p-4`}>
          
          {/* Header */}
          <Header theme={theme} currentTime={currentTime} serviceData={serviceData} />

          {/* Content Based on Active Tab */}
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="animate-spin text-blue-500" size={36} />
            </div>
          }>
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
                  <div>
                  
                    <p className={`${currentTheme.textSecondary} text-sm`}>
                    </p>
                  </div>
                </div>
                
                {/* Multi-Agent Intelligence Grid */}
                <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6">
                   <PersonalAIAssistant services={serviceData.services} theme={theme} />
                  </div>
              </div>
)}
            {activeTab === 'money' && (
              <MoneyAIDashboard services={serviceData.services} theme={theme} />
            )}

      

{activeTab === 'services' && (
  <ServicesList 
    theme={theme}
    filteredServices={serviceData.filteredServices}
    services={serviceData.services}
    serviceConfig={serviceData.serviceConfig}
    onShowServiceForm={() => serviceData.setShowServiceForm(true)}
    onEditService={serviceData.handleEditService}
    onDeleteService={serviceData.handleDeleteService}
    onFinishService={serviceData.finishService}  // ADD THIS LINE
    // Filter props
    searchTerm={serviceData.searchTerm}
    setSearchTerm={serviceData.setSearchTerm}
    filterVehicleType={serviceData.filterVehicleType}
    setFilterVehicleType={serviceData.setFilterVehicleType}
    filterStaff={serviceData.filterStaff}
    setFilterStaff={serviceData.setFilterStaff}
    filterServiceType={serviceData.filterServiceType}
    setFilterServiceType={serviceData.setFilterServiceType}
    filterBrand={serviceData.filterBrand}
    setFilterBrand={serviceData.setFilterBrand}
    dateRange={serviceData.dateRange}
    setDateRange={serviceData.setDateRange}
    sortOrder={sortOrder}
    setSortOrder={setSortOrder}
  />
)}

            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div>
                  <h2 className={`text-2xl font-bold ${currentTheme.text} mb-1`}>Analytics Multi-Agent</h2>
                  <p className={`${currentTheme.textSecondary} text-sm`}>
                    Intelligence distribuée • Service AI • Money AI • Smart Assistant
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PersonalAIAssistant services={serviceData.services} theme={theme} />
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <SettingsMain 
                theme={theme}
                setTheme={setTheme}
                serviceConfig={serviceData.serviceConfig}
                setServiceConfig={serviceData.setServiceConfig}
                services={serviceData.services}
              />
            )}
          </Suspense>
        </main>
      </div>
    </AppErrorBoundary>
  );
}