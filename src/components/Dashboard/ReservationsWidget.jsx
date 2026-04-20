import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Car, Phone, CheckCircle, X, Play } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
import config from '../../config.local';

const SERVICE_NAMES = {
  'lavage-ville': 'Lavage Ville',
  'interieur': 'Intérieur',
  'exterieur': 'Extérieur',
  'complet-premium': 'Complet Premium'
};

const ReservationsWidget = ({ theme, onStartService }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No token found');
        setLoading(false);
        return;
      }
      const res = await fetch(`${config.API_BASE_URL}/api/reservations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Widget fetched:', data.length, 'reservations');
        const relevant = data
          .filter(r => r.status === 'pending' || r.status === 'confirmed')
          .sort((a, b) => {
            const dateA = a.reservation_date.split('T')[0];
            const dateB = b.reservation_date.split('T')[0];
            if (dateA !== dateB) return dateA.localeCompare(dateB);
            return a.reservation_time.localeCompare(b.reservation_time);
          })
          .slice(0, 5);
        console.log('Widget relevant:', relevant.length, 'after filter');
        setReservations(relevant);
      }
    } catch (e) {
      console.warn('Failed to fetch reservations:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
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
      console.warn('Failed to update reservation:', e);
    }
  };

  const handleStart = async (reservation) => {
    // Convert reservation to real service
    await updateStatus(reservation.id, 'completed');
    // Open service form pre-filled with reservation data
    if (onStartService) {
      onStartService({
        licensePlate: reservation.license_plate,
        vehicleType: reservation.vehicle_type,
        serviceType: reservation.service_type,
        phone: reservation.customer_phone,
        notes: `Réservation ${reservation.confirmation_code} — ${reservation.customer_name}`,
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  useEffect(() => {
    fetchReservations();
    // Refresh every 2 minutes
    const interval = setInterval(fetchReservations, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading || reservations.length === 0) return null;

  return (
    <div className={`${currentTheme.surface} rounded-2xl p-5 shadow-xl border border-blue-500/30`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">
            <Calendar className="text-white" size={18} />
          </div>
          <div>
            <h3 className={`font-bold ${currentTheme.text}`}>
              Réservations
            </h3>
            <p className={`text-xs ${currentTheme.textSecondary}`}>
              {reservations.length} en attente
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs text-blue-500 font-bold">LIVE</span>
        </div>
      </div>
      {/* List */}
      <div className="space-y-3">
        {reservations.map(r => {
          const dateStr = r.reservation_date.split('T')[0];
          const tunisiaToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Tunis' });
          const isToday = dateStr === tunisiaToday;
          const displayDate = isToday ? "Aujourd'hui" :
            new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
              weekday: 'short', day: 'numeric', month: 'short'
            });

          return (
            <div key={r.id} className={`${currentTheme.glass} rounded-xl p-4 border ${
              isToday ? 'border-blue-500/50' : currentTheme.border
            }`}>
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isToday ? 'bg-blue-500/20 text-blue-600' : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {displayDate}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Clock size={12} className={currentTheme.textSecondary} />
                    <span className={`text-xs font-bold ${currentTheme.text}`}>
                      {r.reservation_time}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-500">
                  {r.confirmation_code}
                </span>
              </div>

              {/* Details */}
              <div className="flex items-center space-x-2 mb-1">
                <Car size={13} className={currentTheme.textSecondary} />
                <span className={`text-sm font-bold ${currentTheme.text}`}>
                  {r.license_plate}
                </span>
                <span className={`text-xs ${currentTheme.textSecondary}`}>
                  • {SERVICE_NAMES[r.service_type] || r.service_type}
                </span>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <Phone size={12} className={currentTheme.textSecondary} />
                <span className={`text-xs ${currentTheme.textSecondary}`}>
                  {r.customer_name} • {r.customer_phone}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {isToday && (
                  <button
                    onClick={() => handleStart(r)}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-1 active:scale-95 transition-all shadow-md"
                  >
                    <Play size={12} />
                    <span>Démarrer</span>
                  </button>
                )}
                <button
                  onClick={() => updateStatus(r.id, 'confirmed')}
                  className="flex-1 py-2 rounded-lg bg-blue-500/20 text-blue-600 font-bold text-xs flex items-center justify-center space-x-1 hover:bg-blue-500/30 transition-all active:scale-95"
                >
                  <CheckCircle size={12} />
                  <span>Confirmer</span>
                </button>
                <button
                  onClick={() => updateStatus(r.id, 'cancelled')}
                  className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-500 font-bold text-xs flex items-center justify-center space-x-1 hover:bg-red-500/30 transition-all active:scale-95"
                >
                  <X size={12} />
                  <span>Annuler</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservationsWidget;
