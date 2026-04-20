import React, { useState, useEffect } from 'react';
import { Car, DollarSign, Clock, TrendingUp, Plus } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../../utils/luxuryThemes';
import { isDateBeforeToday } from '../../../utils/dateUtils';
import config from '../../../config.local';

const MobileDashboard = ({ services, theme, onNewService, staffMembers = {} }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const today = new Date().toISOString().split('T')[0];
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchRes = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${config.API_BASE_URL}/api/reservations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReservations(data
            .filter(r => r.status === 'pending' && r.reservation_date >= today)
            .slice(0, 3)
          );
        }
      } catch (e) {}
    };
    fetchRes();
  }, []);

  const todayServices = services.filter(s => s.date === today);
  const activeServices = services.filter(s =>
    s.isActive && !s.timeFinished && !isDateBeforeToday(s.date)
  );
  const todayRevenue = todayServices.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const totalRevenue = services.reduce((sum, s) => sum + (s.totalPrice || 0), 0);

  const stats = [
    { label: "Aujourd'hui", value: `${todayRevenue} DT`, icon: DollarSign, color: 'from-green-500 to-emerald-600' },
    { label: 'En cours', value: activeServices.length, icon: Clock, color: 'from-orange-500 to-red-500' },
    { label: 'Ce jour', value: todayServices.length, icon: Car, color: 'from-blue-500 to-indigo-600' },
    { label: 'Total revenus', value: `${totalRevenue} DT`, icon: TrendingUp, color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div className="pb-6">

      {/* Header */}
      <div className={`px-4 pt-4 pb-3 ${currentTheme.surface} border-b ${currentTheme.border} mb-4`}>
        <h1 className={`text-xl font-bold ${currentTheme.text}`}>🚗 JOUINI AI</h1>
        <p className={`text-sm ${currentTheme.textSecondary}`}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Reservations alert */}
      {reservations.length > 0 && (
        <div className="px-4 mb-4">
          <div className={`${currentTheme.surface} rounded-2xl p-4 border border-blue-500/50 shadow-lg`}>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <h2 className={`font-bold ${currentTheme.text} text-base`}>
                📅 {reservations.length} Réservation(s)
              </h2>
            </div>
            {reservations.map(r => (
              <div key={r.id} className={`${currentTheme.glass} rounded-xl p-3 mb-2 border ${currentTheme.border}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold text-sm ${currentTheme.text}`}>
                      {r.reservation_time} — {r.license_plate}
                    </p>
                    <p className={`text-xs ${currentTheme.textSecondary}`}>
                      {r.customer_name} • {r.confirmation_code}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-1 rounded-full font-bold">
                    {r.reservation_date.split('T')[0] === today ? "Auj." :
                      new Date(r.reservation_date.split('T')[0] + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`${currentTheme.surface} rounded-2xl p-4 border ${currentTheme.border} shadow-sm`}>
              <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color} inline-block mb-2`}>
                <Icon className="text-white" size={18} />
              </div>
              <p className={`text-xl font-bold ${currentTheme.text}`}>{stat.value}</p>
              <p className={`text-xs ${currentTheme.textSecondary}`}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Active Services */}
      {activeServices.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className={`text-base font-bold ${currentTheme.text} mb-3`}>⚡ En cours</h2>
          <div className="space-y-2">
            {activeServices.map(s => (
              <div key={s.id} className={`${currentTheme.surface} rounded-xl p-3 border border-orange-500/30 flex items-center justify-between`}>
                <div>
                  <p className={`font-bold ${currentTheme.text}`}>{s.licensePlate}</p>
                  <p className={`text-xs ${currentTheme.textSecondary}`}>
                    {Array.isArray(s.staff) ? s.staff.map(k => staffMembers[k]?.name || k).join(', ') : s.staff}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-500">{s.totalPrice} DT</p>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-auto mt-1 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Button */}
      <div className="px-4">
        <button
          onClick={onNewService}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-base shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Nouveau Service</span>
        </button>
      </div>
    </div>
  );
};

export default MobileDashboard;
