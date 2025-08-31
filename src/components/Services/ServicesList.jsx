import React from 'react';
import { Plus, Car } from 'lucide-react';
import ServicesFilters from './ServicesFilters';
import ServiceTable from './ServiceTable';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
import { isDateBeforeToday } from '../../utils/dateUtils';

const ServicesList = ({ 
  theme,
  filteredServices,
  services,
  serviceConfig,
  onShowServiceForm,
  onEditService,
  onDeleteService,
  onFinishService, 
  // Filter props
  searchTerm,
  setSearchTerm,
  filterVehicleType,
  setFilterVehicleType,
  filterStaff,
  setFilterStaff,
  filterServiceType,
  setFilterServiceType,
  filterBrand,
  setFilterBrand,
  dateRange,
  setDateRange,
  // New sorting props
  sortOrder,
  setSortOrder
}) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const safeServices = Array.isArray(services) ? services : [];
  const safeFiltered = Array.isArray(filteredServices) ? filteredServices : safeServices;
  // Calculate statistics
   const totalServices     = safeFiltered.length;
   const activeServices = safeFiltered.filter(s => {

  const isActive = s.isActive;
  const notFinished = !s.timeFinished;
  const notPastDate = !isDateBeforeToday(s.date);
  
 
  const shouldShow = isActive && notFinished && notPastDate;

  
  return shouldShow;
}).length;
   const completedServices = safeFiltered.filter(s => s.timeFinished || isDateBeforeToday(s.date)).length;
   const totalRevenue      = safeFiltered.reduce((sum, s) => sum + (s.totalPrice || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
        <div>
          <h2 className={`text-2xl font-bold ${currentTheme.text} mb-1`}>Gestion Services</h2>
          <div className={`${currentTheme.textSecondary} text-sm space-y-1`}>
            <p>
              {totalServices} service(s) • {activeServices} en cours • {completedServices} terminé(s)
            </p>
            <p className="font-medium text-green-600">
              Chiffre d'affaires: {totalRevenue} DT
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <ServicesFilters 
        theme={theme}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterVehicleType={filterVehicleType}
        setFilterVehicleType={setFilterVehicleType}
        filterStaff={filterStaff}
        setFilterStaff={setFilterStaff}
        filterServiceType={filterServiceType}
        setFilterServiceType={setFilterServiceType}
        filterBrand={filterBrand}
        setFilterBrand={setFilterBrand}
        dateRange={dateRange}
        setDateRange={setDateRange}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Enhanced Services Display */}
      {safeFiltered.length === 0 ? (
        <div className={`${currentTheme.surface} rounded-2xl p-6 text-center shadow-xl border ${currentTheme.border}`}>
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Car className="text-white" size={40} />
          </div>
          <h3 className={`text-xl font-bold ${currentTheme.text} mb-3`}>Aucun service trouvé</h3>
          <p className={`${currentTheme.textSecondary} mb-4 text-sm`}>
            {(safeServices.length === 0) 
              ? "Commencez par créer votre premier service"
              : "Aucun service ne correspond à vos critères de recherche"
            }
          </p>
          <button
            onClick={onShowServiceForm}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 text-white font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {safeServices.length === 0 ? 'Créer le Premier Service' : 'Nouveau Service Premium'}
          </button>
        </div>
      ) : (
        <ServiceTable
        theme={theme} 
        filteredServices={safeFiltered}
          serviceConfig={serviceConfig}
          onEditService={onEditService}
          onDeleteService={onDeleteService}
          onFinishService={onFinishService}
          sortOrder={sortOrder}
        />
      )}
    </div>
  );
};

export default ServicesList;
