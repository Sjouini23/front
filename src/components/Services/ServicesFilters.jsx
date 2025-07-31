import React from 'react';
import { Filter, Search, Car, Users, Droplets, Star, Calendar, ArrowUpDown, TrendingUp } from 'lucide-react';
import { VEHICLE_TYPES, STAFF_MEMBERS } from '../../utils/configs';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';

// Define the four premium services
const PREMIUM_SERVICES = {
  'lavage-ville': {
    icon: <Car size={16} />,
    name: 'Lavage Ville',
    description: 'Intérieur complet + Extérieur standard',
    price: 20
  },
  'interieur': {
    icon: <Users size={16} />,
    name: 'Intérieur',
    description: 'Aspirateur + Nettoyage sièges',
    price: 19

  },
  'exterieur': {
    icon: <Droplets size={16} />,
    name: 'Extérieur',
    description: 'Lavage carrosserie + Rinçage',
    price: 12
  },
  'complet-premium': {
    icon: <Star size={16} />,
    name: 'Complet Premium',
    description: 'Service complet haut de gamme',
    duration: 90,
    price: 45

  },
};

const SORT_OPTIONS = [
  { value: 'default', label: 'Ordre par défaut', icon: <ArrowUpDown size={16} /> },
  { value: 'chronological', label: 'Chronologique', icon: <Calendar size={16} /> },
  { value: 'anti-chronological', label: 'Anti-chronologique', icon: <Calendar size={16} /> },
  { value: 'price-high', label: 'Plus cher', icon: <TrendingUp size={16} /> },
  { value: 'price-low', label: 'Moins cher', icon: <TrendingUp size={16} /> },
  { value: 'adjustments', label: 'Avec ajustements', icon: <TrendingUp size={16} /> }
];

const ServicesFilters = ({ 
  theme,
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
  sortOrder,
  setSortOrder
}) => {
  const currentTheme = LUXURY_THEMES_2025[theme];

  return (
    <div className={`${currentTheme.surface} rounded-2xl p-4 shadow-xl mb-4 border ${currentTheme.border}`}>
      <h3 className={`font-bold ${currentTheme.text} mb-3 flex items-center space-x-2 text-base`}>
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
          <Filter className="text-white" size={16} />
        </div>
        <span>Filtres Intelligents Multi-Critères</span>
      </h3>
      
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} placeholder-gray-400 ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-[1.02] w-full`}
          />
        </div>
        
        {/* Vehicle Type Filter */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Car className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <select
            value={filterVehicleType}
            onChange={(e) => setFilterVehicleType(e.target.value)}
            className={`pl-10 px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-[1.02] w-full appearance-none`}
          >
            <option value="all">Tous véhicules</option>
            {Object.entries(VEHICLE_TYPES).map(([key, vehicle]) => (
              <option key={key} value={key}>{vehicle.name}</option>
            ))}
          </select>
        </div>
        
        {/* Staff Filter */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Users className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <select
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value)}
            className={`pl-10 px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-[1.02] w-full appearance-none`}
          >
            <option value="all">Tout le staff</option>
            {Object.entries(STAFF_MEMBERS).map(([key, staff]) => (
              <option key={key} value={key}>{staff.name}</option>
            ))}
          </select>
        </div>
        
        {/* Service Type Filter */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Star className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <select
            value={filterServiceType}
            onChange={(e) => setFilterServiceType(e.target.value)}
            className={`pl-10 px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-[1.02] w-full appearance-none`}
          >
            <option value="all">Tous services</option>
            {Object.entries(PREMIUM_SERVICES).map(([key, service]) => (
              <option key={key} value={key}>{service.name}</option>
            ))}
          </select>
        </div>
        
        {/* Sort Order */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <select
            value={sortOrder || 'default'}
            onChange={(e) => setSortOrder(e.target.value)}
            className={`pl-10 px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-[1.02] w-full appearance-none`}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        {/* Date Range Start */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className={`pl-10 px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-[1.02] w-full`}
          />
        </div>
        
        {/* Date Range End */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className={`pl-10 px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md hover:shadow-lg hover:scale-[1.02] w-full`}
          />
        </div>
      </div>
    </div>
  );
};

export { PREMIUM_SERVICES, SORT_OPTIONS };
export default ServicesFilters;