import React, { useState } from 'react';
import { Search, CheckCircle, Edit3, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../../utils/luxuryThemes';
import { isDateBeforeToday } from '../../../utils/dateUtils';

const MobileServices = ({ filteredServices, theme, onEdit, onDelete, onFinish, onNewService, staffMembers = {} }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

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

  return (
    <div className="pb-6">

      {/* Header + Search */}
      <div className={`px-4 pt-4 pb-3 ${currentTheme.surface} border-b ${currentTheme.border} mb-3 sticky top-0 z-10`}>
        <div className="flex items-center justify-between mb-3">
          <h1 className={`text-xl font-bold ${currentTheme.text}`}>Services</h1>
          <button
            onClick={onNewService}
            className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary}`} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une plaque..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
          />
        </div>
        <p className={`text-xs ${currentTheme.textSecondary} mt-2`}>{displayed.length} service(s)</p>
      </div>

      {/* Service Cards */}
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

                {/* Card Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="w-full p-4 flex items-center justify-between active:bg-white/5"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                      <span className="text-white text-sm font-bold">
                        {s.vehicleType === 'taxi' ? '🚕' : s.vehicleType === 'moto' ? '🏍️' : s.vehicleType === 'camion' ? '🚛' : '🚗'}
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

                {/* Expanded Details */}
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
                          {Array.isArray(s.staff) ? s.staff.map(k => staffMembers[k]?.name || k).join(', ') : s.staff || '—'}
                        </p>
                      </div>
                      {s.vehicleBrand && (
                        <div>
                          <p className={`text-xs ${currentTheme.textSecondary}`}>Véhicule</p>
                          <p className={`font-medium ${currentTheme.text}`}>{s.vehicleBrand} {s.vehicleModel}</p>
                        </div>
                      )}
                      {(s.phone || s.phoneNumber || s.client_phone) && (
                        <div>
                          <p className={`text-xs ${currentTheme.textSecondary}`}>Téléphone</p>
                          <a
                            href={`tel:${s.phone || s.phoneNumber || s.client_phone}`}
                            className="font-medium text-blue-500"
                          >
                            📞 {s.phone || s.phoneNumber || s.client_phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {s.notes && (
                      <div className={`p-2 rounded-lg ${currentTheme.glass} text-xs ${currentTheme.textSecondary}`}>
                        📝 {s.notes}
                      </div>
                    )}

                    {/* Action Buttons */}
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
                      <button
                        onClick={() => { onEdit(s); setExpandedId(null); }}
                        className="flex-1 py-3 rounded-xl bg-blue-500/20 text-blue-600 font-bold text-sm flex items-center justify-center space-x-1 active:scale-95"
                      >
                        <Edit3 size={16} />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => { onDelete(s.id); setExpandedId(null); }}
                        className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-500 font-bold text-sm flex items-center justify-center space-x-1 active:scale-95"
                      >
                        <Trash2 size={16} />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileServices;
