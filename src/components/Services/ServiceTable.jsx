import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Phone, CheckCircle, Clock, FileText } from 'lucide-react';
import { VEHICLE_TYPES } from '../../utils/configs';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
import { isDateBeforeToday, formatDateLocal } from '../../utils/dateUtils';
import { PREMIUM_SERVICES } from './ServicesFilters';
import { openWhatsAppInvoice } from '../../utils/whatsapp';

const ServiceTable = ({ 
  theme, 
  filteredServices, 
  serviceConfig, 
  onEditService, 
  onDeleteService,
  onFinishService,
  sortOrder = 'default',
  staffMembers = {}
}) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sentWhatsApp, setSentWhatsApp] = useState({});

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate average time for service types from completed services
  const getServiceTypeAverage = (serviceType) => {
    const completedServices = filteredServices.filter(s => 
      s.serviceType === serviceType && 
      s.timeFinished && 
      s.totalDuration > 0
    );
    
    if (completedServices.length === 0) {
      // Default averages based on service type duration
      const defaultDurations = {
        'lavage-ville': 45 * 60,
        'interieur': 25 * 60,
        'exterieur': 20 * 60,
        'complet-premium': 90 * 60
      };
      return defaultDurations[serviceType] || 30 * 60;
    }
    
    const totalDuration = completedServices.reduce((sum, s) => sum + s.totalDuration, 0);
    return Math.floor(totalDuration / completedServices.length);
  };

  // Format timer duration
 // Replace the formatDuration function in ServiceTable.jsx:

const formatDuration = (startTime, endTime = null, totalDuration = null) => {
  // 1. If we have final duration, show it (completed timers)
  if (totalDuration) {
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const seconds = totalDuration % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // 2. If no start time, show 00:00:00
  if (!startTime) return '00:00:00';
  
  // 3. Calculate elapsed time using consistent timezone handling
  const startUTC = new Date(startTime).getTime(); // Convert to UTC milliseconds
  const nowUTC = endTime ? new Date(endTime).getTime() : Date.now(); // Current UTC time
  
  // Calculate difference in seconds (always positive)
  let diffSeconds = Math.floor((nowUTC - startUTC) / 1000);
  
  // 4. Safety checks for data integrity
  if (diffSeconds < 0) diffSeconds = 0;        // Handle future times
  if (diffSeconds > 28800) diffSeconds = 0;    // Reset if more than 8 hours (data error)
  
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

  // Sort services based on sortOrder
  const getSortedServices = (services) => {
    let sorted = [...services];
    
    switch (sortOrder) {
      case 'chronological':
        sorted = sorted.sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt);
          const dateB = new Date(b.date || b.createdAt);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      
      case 'anti-chronological':
        sorted = sorted.sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt);
          const dateB = new Date(b.date || b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      
      case 'price-high':
        sorted = sorted.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
        break;
      
      case 'price-low':
        sorted = sorted.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
        break;
      
      case 'adjustments':
        sorted = sorted.filter(service => service.priceAdjustment && service.priceAdjustment !== 0);
        break;
      
      default:
        // Default sorting: newest first (by date, then by creation time)
        sorted = sorted.sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt);
          const dateB = new Date(b.date || b.createdAt);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB.getTime() - dateA.getTime();
          }
          const createdA = new Date(a.createdAt || 0);
          const createdB = new Date(b.createdAt || 0);
          return createdB.getTime() - createdA.getTime();
        });
    }
    
    return sorted;
  };

  // Render price with adjustments
  const renderPrice = (service) => {
    const basePrice = PREMIUM_SERVICES[service.serviceType]?.price || service.basePrice || 0;
    const adjustment = service.priceAdjustment || 0;
    const totalPrice = service.totalPrice || basePrice + adjustment;

    if (adjustment !== 0) {
      return (
        <div className="space-y-1">
          <div className="text-base font-bold text-green-600">
            {totalPrice} DT
          </div>
          <div className="font-medium text-red-500">
              {adjustment > 0 ? '+' : ''}{adjustment} DT
            </div>
          </div>
      );
    }

    return (
      <span className="text-base font-bold text-green-600">
        {totalPrice} DT
      </span>
    );
  };

  const sortedServices = getSortedServices(filteredServices);

  return (
    <div className={`${currentTheme.surface} rounded-2xl overflow-hidden shadow-xl border ${currentTheme.border}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${currentTheme.glass}`}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-bold ${currentTheme.text} uppercase tracking-wider`}>
                Véhicule
              </th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${currentTheme.text} uppercase tracking-wider`}>
                Service
              </th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${currentTheme.text} uppercase tracking-wider`}>
                Staff
              </th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${currentTheme.text} uppercase tracking-wider`}>
                Timer
              </th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${currentTheme.text} uppercase tracking-wider`}>
                Prix
              </th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${currentTheme.text} uppercase tracking-wider`}>
                Date
              </th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${currentTheme.text} uppercase tracking-wider hidden sm:table-cell`}>
                Photos
              </th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${currentTheme.text} uppercase tracking-wider`}>
                Notes
              </th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${currentTheme.text} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedServices.slice(0, 100).map((service) => {
              const isPastDate = isDateBeforeToday(service.date);
              const shouldShowAsFinished = isPastDate || service.timeFinished || !service.isActive;
              const averageTime = isPastDate && !service.timeFinished ? getServiceTypeAverage(service.serviceType) : null;
              
              return (
                <tr key={service.id} className={`${currentTheme.hover} transition-all duration-300 hover:shadow-md`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className={`text-base font-bold ${currentTheme.text} flex items-center space-x-2`}>
                          <span>{service.licensePlate}</span>
                          {service.isReservation && (
                            <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-500/30">
                              📅 Réservation
                            </span>
                          )}
                        </div>
                        <div className={`${currentTheme.textSecondary} text-sm`}>
                          {service.vehicleBrand} {service.vehicleModel}
                        </div>
                        {service.phone && (
                          <div className={`text-xs ${currentTheme.textMuted} flex items-center space-x-1 mt-1`}>
                            <Phone size={10} />
                            <span>{service.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          {PREMIUM_SERVICES[service.serviceType]?.icon}
                          <span className={`font-bold text-sm ${currentTheme.text}`}>
                            {PREMIUM_SERVICES[service.serviceType]?.name || serviceConfig[service.serviceType]?.name || service.serviceType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className={`font-bold ${currentTheme.text} text-sm`}>
                        {Array.isArray(service.staff) 
                          ? service.staff.map(s => staffMembers[s]?.name || s).join(' + ')
                          : 'Non assigné'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {isPastDate && !service.timeFinished ? (
                      <div className="text-xs text-blue-600">
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock size={10} />
                          <span>Auto-terminé</span>
                        </div>
                        <div className="font-mono font-bold">
                          {formatDuration(null, null, averageTime)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          (Moyenne)
                        </div>
                      </div>
                    ) : service.isActive && !shouldShowAsFinished ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-mono text-green-600 font-bold">
                            {formatDuration(service.timeStarted)}
                          </span>
                        </div>
                        <div className="text-xs text-green-600 font-medium">En cours</div>
                      </div>
                    ) : service.timeFinished ? (
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock size={10} />
                          <span>Terminé</span>
                        </div>
                        <div className="font-mono font-bold">
                          {formatDuration(service.timeStarted, service.timeFinished)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Non chronométré</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderPrice(service)}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap ${currentTheme.textSecondary} text-sm`}>
                    {formatDateLocal(service.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                    {Array.isArray(service.photos) && service.photos.length > 0 ? (
                      <div className="flex items-center space-x-2">
                        <img 
                          src={service.photos[0]} 
                          alt="Preview véhicule" 
                          className="w-10 h-10 rounded-lg object-cover shadow-md hover:shadow-lg transition-shadow"
                        />
                        {service.photos.length > 1 && (
                          <span className={`text-xs ${currentTheme.textMuted} bg-blue-500/20 text-blue-600 px-2 py-1 rounded-md font-bold border border-blue-500/30`}>
                            +{service.photos.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={`text-xs ${currentTheme.textMuted}`}>Aucune</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap max-w-xs">
                    {service.notes ? (
                      <div className="flex items-start space-x-1">
                        <FileText size={12} className={`${currentTheme.textMuted} mt-0.5 flex-shrink-0`} />
                        <span className={`text-xs ${currentTheme.textSecondary} truncate`} title={service.notes}>
                          {service.notes.length > 30 ? `${service.notes.substring(0, 30)}...` : service.notes}
                        </span>
                      </div>
                    ) : (
                      <span className={`text-xs ${currentTheme.textMuted}`}>Aucune note</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {service.isActive && !isPastDate && (
                        <button
  onClick={() => {

    onFinishService(service.id);
  }}
  className="p-2 rounded-lg bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-all duration-300 hover:scale-110 shadow-md focus:outline-none focus:ring-1 focus:ring-green-500/50 hover:shadow-lg"
  aria-label={`Terminer le service ${service.licensePlate}`}
>
  <CheckCircle size={14} />
</button>
                      )}
                      {(service.phone || service.phoneNumber || service.client_phone) && (
                        <button
                          onClick={() => {
                            openWhatsAppInvoice(service, staffMembers);
                            setSentWhatsApp(prev => ({ ...prev, [service.id]: true }));
                          }}
                          title="Envoyer reçu WhatsApp"
                          className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 shadow-md flex items-center justify-center ${
                            sentWhatsApp[service.id]
                              ? 'bg-gray-500/20 text-gray-400 cursor-default'
                              : 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                          }`}
                        >
                          {sentWhatsApp[service.id] ? (
                            <span className="text-xs">✅</span>
                          ) : (
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => onEditService(service)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 transition-all duration-300 hover:scale-110 shadow-md focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:shadow-lg"
                        aria-label={`Modifier le service ${service.licensePlate}`}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteService(service.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-all duration-300 hover:scale-110 shadow-md focus:outline-none focus:ring-1 focus:ring-red-500/50 hover:shadow-lg"
                        aria-label={`Supprimer le service ${service.licensePlate}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedServices.length > 100 && (
        <div className={`text-center p-4 ${currentTheme.textSecondary} text-sm`}>
          Affichage de 100 sur {sortedServices.length} services. 
          Utilisez les filtres pour affiner.
        </div>
      )}
    </div>
  );
};

export default ServiceTable;
