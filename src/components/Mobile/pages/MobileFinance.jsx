import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../../utils/luxuryThemes';

const MobileFinance = ({ services, theme, staffMembers = {} }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [period, setPeriod] = useState('today');

  const data = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const filter = (s) => {
      if (period === 'today') return s.date === today;
      if (period === 'week') return s.date >= weekStart;
      if (period === 'month') return s.date >= monthStart;
      return true;
    };

    const filtered = services.filter(filter);
    const revenue = filtered.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const count = filtered.length;
    const average = count > 0 ? Math.round(revenue / count) : 0;

    const staffBreakdown = Object.keys(staffMembers).map(key => {
      const staffServices = filtered.filter(s =>
        Array.isArray(s.staff) ? s.staff.includes(key) : s.staff === key
      );
      const staffRevenue = staffServices.reduce((sum, s) => {
        const share = Array.isArray(s.staff) ? s.staff.length : 1;
        return sum + (s.totalPrice || 0) / share;
      }, 0);
      return {
        key,
        name: staffMembers[key]?.name || key,
        revenue: Math.round(staffRevenue),
        count: staffServices.length
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return { revenue, count, average, staffBreakdown };
  }, [services, period, staffMembers]);

  const periods = [
    { id: 'today', label: "Aujourd'hui" },
    { id: 'week', label: '7 jours' },
    { id: 'month', label: 'Ce mois' },
    { id: 'all', label: 'Total' },
  ];

  return (
    <div className="pb-6">

      {/* Header */}
      <div className={`px-4 pt-4 pb-3 ${currentTheme.surface} border-b ${currentTheme.border} mb-4`}>
        <h1 className={`text-xl font-bold ${currentTheme.text}`}>Finances</h1>
      </div>

      {/* Period Selector */}
      <div className="px-4 mb-4">
        <div className={`flex ${currentTheme.surface} rounded-xl p-1 border ${currentTheme.border}`}>
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                period === p.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow'
                  : currentTheme.textSecondary
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Revenus', value: `${data.revenue} DT`, icon: DollarSign, color: 'from-green-500 to-emerald-600' },
          { label: 'Services', value: data.count, icon: Calendar, color: 'from-blue-500 to-indigo-600' },
          { label: 'Moyenne', value: `${data.average} DT`, icon: TrendingUp, color: 'from-purple-500 to-pink-600' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`${currentTheme.surface} rounded-2xl p-3 border ${currentTheme.border} text-center`}>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${s.color} inline-block mb-2`}>
                <Icon className="text-white" size={16} />
              </div>
              <p className={`text-base font-bold ${currentTheme.text}`}>{s.value}</p>
              <p className={`text-xs ${currentTheme.textSecondary}`}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Staff Breakdown */}
      <div className="px-4">
        <h2 className={`text-base font-bold ${currentTheme.text} mb-3 flex items-center space-x-2`}>
          <Users size={16} />
          <span>Performance Équipe</span>
        </h2>
        <div className="space-y-2">
          {data.staffBreakdown.map(s => (
            <div key={s.key} className={`${currentTheme.surface} rounded-xl p-4 border ${currentTheme.border} flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{s.name[0]}</span>
                </div>
                <div>
                  <p className={`font-bold ${currentTheme.text}`}>{s.name}</p>
                  <p className={`text-xs ${currentTheme.textSecondary}`}>{s.count} service(s)</p>
                </div>
              </div>
              <p className="text-lg font-bold text-green-500">{s.revenue} DT</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileFinance;
