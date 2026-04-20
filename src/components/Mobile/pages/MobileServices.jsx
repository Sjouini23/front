import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Edit3, Trash2, ChevronDown, ChevronUp, Plus, Play, X, Clock, Phone } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../../utils/luxuryThemes';
import { isDateBeforeToday } from '../../../utils/dateUtils';
import { openWhatsAppInvoice } from '../../../utils/whatsapp';
import config from '../../../config.local';

const SERVICE_NAMES = {
  'lavage-ville': 'Lavage Ville',
  'interieur': 'Intérieur',
  'exterieur': 'Extérieur',
  'complet-premium': 'Complet Premium'
};

const MobileServices = ({ filteredServices, theme, onEdit, onDelete, onFinish, onNewService, staffMembers = {} }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [sentWhatsApp, setSentWhatsApp] = useState({});
  const [activeTab, setActiveTab] = useState('services');
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  const displayed = filteredServices.filter(s =>
    !search || s.licensePlate?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (s) => {
    if (s.isActive && !s.timeFinished && !isDateBeforeToday(s.date)) return 'text-green-500';
    if (s.timeFinished || isDateBeforeToday(s.date)) return 'text-gray-400';
    return 'text-orange-500';
  };

  const getStatusLabel = (s) => {
    if (s.isActive && !s.timeFinished && !isDateBeforeToday(s.date)) return '🟢 En cours';
    if (s.timeFinished || isDateBeforeToday(s.date)) return '✅ Terminé';
    return '🟡 En attente';
  };

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
      console.warn(e);
    } finally {
      setReservationsLoading(false);
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${config.API_BASE_URL}/api/reservations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleStart = async (reservation) => {
    await updateReservationStatus(reservation.id, 'completed');
    window.__reservationPrefill = {
      licensePlate: reservation.license_plate,
      vehicleType: reservation.vehicle_type,
      serviceType: reservation.service_type,
      phone: reservation.customer_phone,
      notes: `Reservation ${reservation.confirmation_code} - ${reservation.customer_name}`,
      date: new Date().toISOString().split('T')[0]
    };
    onNewService();
  };

  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [activeTab]);

  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  return (
    <div className="pb-6">

      {/* Header + Search */}
      <div className={`px-4 pt-4 pb-3 ${currentTheme.surface} border-b ${currentTheme.border} mb-3 sticky top-0 z-10`}>
        <div className="flex items-center justify-between mb-3">
          <h1 className={`text-xl font-bold ${currentTheme.text}`}>
            {activeTab === 'services' ? 'Services' : 'Réservations'}
          </h1>
          {activeTab === 'services' && (
            <button
              onClick={onNewService}
              className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md active:scale-95"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        {/* Tab Toggle */}
        <div className={`flex ${currentTheme.glass} rounded-xl p-1 border ${currentTheme.border} mb-3`}>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow'
                : currentTheme.textSecondary
            }`}
          >
            🚗 Services ({displayed.length})
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'reservations'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow'
                : currentTheme.textSecondary
            }`}
          >
            📅 Réservations
            {pendingCount > 0 && activeTab !== 'reservations' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Search — only for services */}
        {activeTab === 'services' && (
          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une plaque..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
            />
          </div>
        )}
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="px-4 space-y-2">
          {displayed.length === 0 ? (
            <div className={`${currentTheme.surface} rounded-2xl p-8 text-center border ${currentTheme.border}`}>
              <p className={`${currentTheme.textSecondary}`}>Aucun service trouvé</p>
            </div>
          ) : (
            displayed.map(s => {
              const isExpanded = expandedId === s.id;
              const isPast = isDateBeforeToday(s.date);
              return (
                <div key={s.id} className={`${currentTheme.surface} rounded-2xl border ${currentTheme.border} overflow-hidden shadow-sm`}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    className="w-full p-4 flex items-center justify-between active:bg-white/5"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                        <span className="text-white text-sm font-bold">
                          {s.vehicleType === 'taxi' ? '🚕' :
                           s.vehicleType === 'moto' ? '🏍️' :
                           s.vehicleType === 'camion' ? '🚛' : '🚗'}
                        </span>
                      </div>
                      <div>
                        <p className={`font-bold ${currentTheme.text}`}>{s.licensePlate}</p>
                        <p className={`text-xs ${currentTheme.textSecondary}`}>{s.serviceType} • {s.totalPrice} DT</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getStatusColor(s)}`}>
                        {getStatusLabel(s)}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className={currentTheme.textSecondary} /> : <ChevronDown size={16} className={currentTheme.textSecondary} />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className={`px-4 pb-4 border-t ${currentTheme.border} pt-3 space-y-3`}>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className={`text-xs ${currentTheme.textSecondary}`}>Date</p>
                          <p className={`font-medium ${currentTheme.text}`}>{s.date}</p>
                        </div>
                        <div>
                          <p className={`text-xs ${currentTheme.textSecondary}`}>Staff</p>
                          <p className={`font-medium ${currentTheme.text}`}>
                            {Array.isArray(s.staff) ? s.staff.map(k => staffMembers[k]?.name || k).join(', ') : s.staff || '-'}
                          </p>
                        </div>
                        {s.vehicleBrand && (
                          <div>
                            <p className={`text-xs ${currentTheme.textSecondary}`}>Véhicule</p>
                            <p className={`font-medium ${currentTheme.text}`}>{s.vehicleBrand} {s.vehicleModel}</p>
                          </div>
                        )}
                        {(s.phone || s.phoneNumber) && (
                          <div>
                            <p className={`text-xs ${currentTheme.textSecondary}`}>Téléphone</p>
                            <a href={`tel:${s.phone || s.phoneNumber}`} className="font-medium text-blue-500">
                              📞 {s.phone || s.phoneNumber}
                            </a>
                          </div>
                        )}
                      </div>
                      {s.notes && (
                        <div className={`p-2 rounded-lg ${currentTheme.glass} text-xs ${currentTheme.textSecondary}`}>
                          📝 {s.notes}
                        </div>
                      )}
                      <div className="flex space-x-2 pt-1">
                        {s.isActive && !isPast && (
                          <button
                            onClick={() => { onFinish(s.id); setExpandedId(null); }}
                            className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-600 font-bold text-sm flex items-center justify-center space-x-1 active:scale-95"
                          >
                            <CheckCircle size={16} />
                            <span>Terminer</span>
                          </button>
                        )}
                        {(s.phone || s.phoneNumber) && (
                          <button
                            onClick={() => {
                              openWhatsAppInvoice(s, staffMembers);
                              setSentWhatsApp(prev => ({ ...prev, [s.id]: true }));
                            }}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-1 active:scale-95 transition-all ${
                              sentWhatsApp[s.id] ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-600'
                            }`}
                          >
                            {sentWhatsApp[s.id] ? (
                              <><span>✅</span><span>Envoyé!</span></>
                            ) : (
                              <><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span>WhatsApp</span></>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => { onEdit(s); setExpandedId(null); }}
                          className="flex-1 py-3 rounded-xl bg-blue-500/20 text-blue-600 font-bold text-sm flex items-center justify-center space-x-1 active:scale-95"
                        >
                          <Edit3 size={16} />
                          <span>Modifier</span>
                        </button>
                        <button
                          onClick={() => { onDelete(s.id); setExpandedId(null); }}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-1 active:scale-95 ${
                            s.isReservation ? 'bg-orange-500/20 text-orange-500' : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          <Trash2 size={16} />
                          <span>{s.isReservation ? 'Annuler' : 'Supprimer'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="px-4 space-y-3">
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
              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = dateStr === todayStr;
              const displayDate = isToday ? "Aujourd'hui" :
                new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'short', day: 'numeric', month: 'short'
                });

              return (
                <div key={r.id} className={`${currentTheme.surface} rounded-2xl p-4 border ${
                  isToday ? 'border-blue-500/50' : currentTheme.border
                } shadow-sm`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isToday ? 'bg-blue-500/20 text-blue-600' : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {displayDate}
                      </span>
                      <span className={`text-xs font-bold ${currentTheme.text}`}>
                        {r.reservation_time}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-500">
                      {r.confirmation_code}
                    </span>
                  </div>
                  <p className={`font-bold ${currentTheme.text}`}>{r.license_plate}</p>
                  <p className={`text-xs ${currentTheme.textSecondary} mb-3`}>
                    {r.customer_name} • {r.customer_phone} • {SERVICE_NAMES[r.service_type] || r.service_type}
                  </p>
                  <div className="flex space-x-2">
                    {isToday && (
                      <button
                        onClick={() => handleStart(r)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-1 active:scale-95"
                      >
                        <Play size={12} />
                        <span>Démarrer</span>
                      </button>
                    )}
                    {r.status === 'pending' && (
                      <button
                        onClick={() => updateReservationStatus(r.id, 'confirmed')}
                        className="flex-1 py-2.5 rounded-xl bg-blue-500/20 text-blue-600 font-bold text-xs flex items-center justify-center space-x-1 active:scale-95"
                      >
                        <CheckCircle size={12} />
                        <span>Confirmer</span>
                      </button>
                    )}
                    <button
                      onClick={() => updateReservationStatus(r.id, 'cancelled')}
                      className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-500 font-bold text-xs flex items-center justify-center space-x-1 active:scale-95"
                    >
                      <X size={12} />
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

export default MobileServices;
