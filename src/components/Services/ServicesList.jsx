import React, { useState, useEffect } from 'react';
import { Plus, Car, Calendar, Clock, Phone, CheckCircle, X, Play } from 'lucide-react';
import ServicesFilters from './ServicesFilters';
import ServiceTable from './ServiceTable';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
import { isDateBeforeToday } from '../../utils/dateUtils';
import config from '../../config.local';

const SERVICE_NAMES = {
  'lavage-ville': 'Lavage Ville',
  'interieur': 'Intérieur',
  'exterieur': 'Extérieur',
  'complet-premium': 'Complet Premium'
};

const ServicesList = ({ 
  theme,
  filteredServices,
  services,
  serviceConfig,
  onShowServiceForm,
  onEditService,
  onDeleteService,
  onFinishService,
  searchTerm, setSearchTerm,
  filterVehicleType, setFilterVehicleType,
  filterStaff, setFilterStaff,
  filterServiceType, setFilterServiceType,
  filterBrand, setFilterBrand,
  dateRange, setDateRange,
  sortOrder, setSortOrder,
  staffMembers = {}
}) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [activeTab, setActiveTab] = useState('services');
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  const safeServices = Array.isArray(services) ? services : [];
  const safeFiltered = Array.isArray(filteredServices) ? filteredServices : safeServices;

  const totalServices = safeFiltered.length;
  const activeServices = safeFiltered.filter(s =>
    s.isActive && !s.timeFinished && !isDateBeforeToday(s.date)
  ).length;
  const completedServices = safeFiltered.filter(s =>
    s.timeFinished || isDateBeforeToday(s.date)
  ).length;
  const totalRevenue = safeFiltered.reduce((sum, s) => sum + (s.totalPrice || 0), 0);

  const fetchReservations = async () => {
    try {
      setReservationsLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${config.API_BASE_URL}/api/reservations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data
          .filter(r => r.status !== 'cancelled' && r.status !== 'completed')
          .sort((a, b) => {
            const dateA = a.reservation_date.split('T')[0];
            const dateB = b.reservation_date.split('T')[0];
            if (dateA !== dateB) return dateA.localeCompare(dateB);
            return a.reservation_time.localeCompare(b.reservation_time);
          })
        );
      }
    } catch (e) {
      console.warn('Failed to fetch reservations:', e);
    } finally {
      setReservationsLoading(false);
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${config.API_BASE_URL}/api/reservations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReservations(prev => prev.filter(r => r.id !== id));
      }
    } catch (e) {
      console.warn('Failed to update reservation:', e);
    }
  };

  const handleStart = async (reservation) => {
    await updateReservationStatus(reservation.id, 'completed');
    window.__reservationPrefill = {
      licensePlate: reservation.license_plate,
      vehicleType: reservation.vehicle_type,
      serviceType: reservation.service_type,
      phone: reservation.customer_phone,
      notes: `Réservation ${reservation.confirmation_code} - ${reservation.customer_name}`,
      date: new Date().toISOString().split('T')[0]
    };
    onShowServiceForm();
  };

  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [activeTab]);

  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
        <div>
          <h2 className={`text-2xl font-bold ${currentTheme.text} mb-1`}>
            {activeTab === 'services' ? 'Gestion Services' : 'Réservations'}
          </h2>
          {activeTab === 'services' && (
            <div className={`${currentTheme.textSecondary} text-sm space-y-1`}>
              <p>{totalServices} service(s) • {activeServices} en cours • {completedServices} terminé(s)</p>
              <p className="font-medium text-green-600">Chiffre d'affaires: {totalRevenue} DT</p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Toggle */}
      <div className={`flex ${currentTheme.surface} rounded-xl p-1 border ${currentTheme.border}`}>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'services'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow'
              : currentTheme.textSecondary
          }`}
        >
          🚗 Services ({safeFiltered.length})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative ${
            activeTab === 'reservations'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow'
              : currentTheme.textSecondary
          }`}
        >
          📅 Réservations
          {pendingCount > 0 && activeTab !== 'reservations' && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <>
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
            staffMembers={staffMembers}
          />
          {safeFiltered.length === 0 ? (
            <div className={`${currentTheme.surface} rounded-2xl p-6 text-center shadow-xl border ${currentTheme.border}`}>
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Car className="text-white" size={40} />
              </div>
              <h3 className={`text-xl font-bold ${currentTheme.text} mb-3`}>Aucun service trouvé</h3>
              <button
                onClick={onShowServiceForm}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 text-white font-bold hover:scale-105 transition-all duration-300 text-sm shadow-lg"
              >
                Nouveau Service
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
              staffMembers={staffMembers}
            />
          )}
        </>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="space-y-3">
          {reservationsLoading ? (
            <div className={`${currentTheme.surface} rounded-2xl p-8 text-center border ${currentTheme.border}`}>
              <p className={currentTheme.textSecondary}>Chargement...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className={`${currentTheme.surface} rounded-2xl p-8 text-center border ${currentTheme.border}`}>
              <p className="text-4xl mb-3">📅</p>
              <h3 className={`font-bold ${currentTheme.text} mb-2`}>Aucune réservation</h3>
              <p className={`text-sm ${currentTheme.textSecondary}`}>
                Les réservations en ligne apparaîtront ici
              </p>
            </div>
          ) : (
            reservations.map(r => {
              const dateStr = r.reservation_date.split('T')[0];
              const today = new Date().toISOString().split('T')[0];
              const isToday = dateStr === today;
              const displayDate = isToday ? "Aujourd'hui" :
                new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long'
                });

              return (
                <div key={r.id} className={`${currentTheme.surface} rounded-2xl p-5 border ${
                  isToday ? 'border-blue-500/50' : currentTheme.border
                } shadow-lg`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        isToday ? 'bg-blue-500/20 text-blue-600' : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {displayDate}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} className={currentTheme.textSecondary} />
                        <span className={`font-bold ${currentTheme.text}`}>{r.reservation_time}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        r.status === 'confirmed'
                          ? 'bg-green-500/20 text-green-600'
                          : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        {r.status === 'confirmed' ? '✅ Confirmé' : '⏳ En attente'}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-500">
                        {r.confirmation_code}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Car size={14} className={currentTheme.textSecondary} />
                      <div>
                        <p className={`font-bold text-sm ${currentTheme.text}`}>{r.license_plate}</p>
                        <p className={`text-xs ${currentTheme.textSecondary}`}>
                          {SERVICE_NAMES[r.service_type] || r.service_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={14} className={currentTheme.textSecondary} />
                      <div>
                        <p className={`font-bold text-sm ${currentTheme.text}`}>{r.customer_name}</p>
                        <p className={`text-xs ${currentTheme.textSecondary}`}>{r.customer_phone}</p>
                      </div>
                    </div>
                  </div>

                  {r.notes && (
                    <p className={`text-xs ${currentTheme.textSecondary} mb-3 p-2 rounded-lg ${currentTheme.glass}`}>
                      📝 {r.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {isToday && (
                      <button
                        onClick={() => handleStart(r)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm flex items-center justify-center space-x-2 hover:opacity-90 transition-all shadow-md"
                      >
                        <Play size={14} />
                        <span>Démarrer</span>
                      </button>
                    )}
                    {r.status === 'pending' && (
                      <button
                        onClick={() => updateReservationStatus(r.id, 'confirmed')}
                        className="flex-1 py-2.5 rounded-xl bg-blue-500/20 text-blue-600 font-bold text-sm flex items-center justify-center space-x-2 hover:bg-blue-500/30 transition-all"
                      >
                        <CheckCircle size={14} />
                        <span>Confirmer</span>
                      </button>
                    )}
                    <button
                      onClick={() => updateReservationStatus(r.id, 'cancelled')}
                      className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-500 font-bold text-sm flex items-center justify-center space-x-2 hover:bg-red-500/30 transition-all"
                    >
                      <X size={14} />
                      <span>Annuler</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ServicesList;
