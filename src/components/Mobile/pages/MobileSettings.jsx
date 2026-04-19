import React, { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, Users, Plus, Edit3, Trash2 } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../../utils/luxuryThemes';
import config from '../../../config.local';

const MobileSettings = ({ theme, setTheme, staffMembers = {}, addStaff, renameStaff, deleteStaff, onLogout, onSwitchDevice }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [newName, setNewName] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [availability, setAvailability] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilitySaved, setAvailabilitySaved] = useState(false);

  const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    fetch(`${config.API_BASE_URL}/api/availability`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(setAvailability).catch(console.warn);

    fetch(`${config.API_BASE_URL}/api/blocked-dates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(setBlockedDates).catch(console.warn);
  }, []);

  const updateDaySetting = (dayOfWeek, field, value) => {
    setAvailability(prev => prev.map(day =>
      day.day_of_week === dayOfWeek ? { ...day, [field]: value } : day
    ));
  };

  const saveAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      const token = localStorage.getItem('auth_token');
      await fetch(`${config.API_BASE_URL}/api/availability`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: availability })
      });
      setAvailabilitySaved(true);
      setTimeout(() => setAvailabilitySaved(false), 3000);
    } catch (e) {
      console.warn(e);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const addBlockedDate = async () => {
    if (!newBlockedDate) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${config.API_BASE_URL}/api/blocked-dates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: newBlockedDate })
      });
      setBlockedDates(prev => [...prev, { blocked_date: newBlockedDate }]);
      setNewBlockedDate('');
    } catch (e) {
      console.warn(e);
    }
  };

  const removeBlockedDate = async (date) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${config.API_BASE_URL}/api/blocked-dates/${date}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBlockedDates(prev => prev.filter(d => d.blocked_date !== date));
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="pb-6">

      {/* Header */}
      <div className={`px-4 pt-4 pb-3 ${currentTheme.surface} border-b ${currentTheme.border} mb-4`}>
        <h1 className={`text-xl font-bold ${currentTheme.text}`}>Paramètres</h1>
      </div>

      <div className="px-4 space-y-4">

        {/* Theme */}
        <div className={`${currentTheme.surface} rounded-2xl p-4 border ${currentTheme.border}`}>
          <h2 className={`font-bold ${currentTheme.text} mb-3`}>🎨 Apparence</h2>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`w-full flex items-center justify-between p-3 rounded-xl ${currentTheme.glass} border ${currentTheme.border} active:scale-95 transition-all`}
          >
            <span className={`font-medium ${currentTheme.text}`}>
              {theme === 'dark' ? '🌙 Mode Sombre' : '☀️ Mode Clair'}
            </span>
            {theme === 'dark'
              ? <Moon size={18} className="text-blue-400" />
              : <Sun size={18} className="text-yellow-400" />
            }
          </button>
        </div>

        {/* Staff Management */}
        <div className={`${currentTheme.surface} rounded-2xl p-4 border ${currentTheme.border}`}>
          <h2 className={`font-bold ${currentTheme.text} mb-3 flex items-center space-x-2`}>
            <Users size={16} />
            <span>Personnel</span>
          </h2>

          <div className="space-y-2 mb-3">
            {Object.entries(staffMembers).map(([key, staff]) => (
              <div key={key} className={`${currentTheme.glass} rounded-xl p-3 border ${currentTheme.border}`}>
                {editingKey === key ? (
                  <div className="flex space-x-2">
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { renameStaff(key, editingName); setEditingKey(null); }
                        if (e.key === 'Escape') setEditingKey(null);
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border ${currentTheme.border} ${currentTheme.text} bg-transparent text-sm focus:outline-none`}
                      autoFocus
                    />
                    <button onClick={() => { renameStaff(key, editingName); setEditingKey(null); }}
                      className="px-3 py-2 rounded-lg bg-green-500/20 text-green-600 text-sm font-bold">
                      ✓
                    </button>
                    <button onClick={() => setEditingKey(null)}
                      className="px-3 py-2 rounded-lg bg-gray-500/20 text-gray-500 text-sm">
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{staff.icon}</span>
                      <span className={`font-semibold ${currentTheme.text}`}>{staff.name}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => { setEditingKey(key); setEditingName(staff.name); }}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-500 active:scale-95">
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteStaff(key)}
                        disabled={Object.keys(staffMembers).length <= 1}
                        className="p-2 rounded-lg bg-red-500/20 text-red-500 active:scale-95 disabled:opacity-30">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) { addStaff(newName); setNewName(''); } }}
              placeholder="Nom du nouvel employé..."
              className={`flex-1 px-3 py-3 rounded-xl border ${currentTheme.border} ${currentTheme.text} bg-transparent text-sm focus:outline-none`}
            />
            <button
              onClick={() => { if (newName.trim()) { addStaff(newName); setNewName(''); } }}
              disabled={!newName.trim()}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold disabled:opacity-40 active:scale-95"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* AVAILABILITY */}
        <div className={`${currentTheme.surface} rounded-2xl p-4 border ${currentTheme.border}`}>
          <h2 className={`font-bold ${currentTheme.text} mb-4 flex items-center space-x-2`}>
            <span>🕐</span>
            <span>Horaires d'ouverture</span>
          </h2>

          <div className="space-y-2 mb-4">
            {availability.map(day => (
              <div key={day.day_of_week} className={`${currentTheme.glass} rounded-xl p-3 border ${currentTheme.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold text-sm ${currentTheme.text}`}>
                    {DAYS[day.day_of_week]}
                  </span>
                  <button
                    onClick={() => updateDaySetting(day.day_of_week, 'is_open', !day.is_open)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                      day.is_open ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                      day.is_open ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>
                {day.is_open && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={day.open_time}
                      onChange={(e) => updateDaySetting(day.day_of_week, 'open_time', e.target.value)}
                      className={`flex-1 px-2 py-1.5 rounded-lg border ${currentTheme.border} ${currentTheme.text} bg-transparent text-sm focus:outline-none`}
                    />
                    <span className={`text-xs ${currentTheme.textSecondary}`}>→</span>
                    <input
                      type="time"
                      value={day.close_time}
                      onChange={(e) => updateDaySetting(day.day_of_week, 'close_time', e.target.value)}
                      className={`flex-1 px-2 py-1.5 rounded-lg border ${currentTheme.border} ${currentTheme.text} bg-transparent text-sm focus:outline-none`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={saveAvailability}
            disabled={availabilityLoading}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
              availabilitySaved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
            } disabled:opacity-50 active:scale-95`}
          >
            {availabilitySaved ? '✅ Sauvegardé!' : 'Sauvegarder'}
          </button>

          {/* Blocked dates */}
          <div className="mt-4">
            <p className={`text-sm font-bold ${currentTheme.text} mb-2`}>🚫 Jours fermés</p>
            {blockedDates.map((bd, i) => (
              <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${currentTheme.glass} border ${currentTheme.border} mb-2`}>
                <span className={`text-sm ${currentTheme.text}`}>
                  {new Date(bd.blocked_date).toLocaleDateString('fr-FR')}
                </span>
                <button
                  onClick={() => removeBlockedDate(bd.blocked_date)}
                  className="text-red-500 text-xs font-bold px-2 py-1 rounded-lg bg-red-500/20 active:scale-95"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex space-x-2 mt-2">
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-xl border ${currentTheme.border} ${currentTheme.text} bg-transparent text-sm focus:outline-none`}
                style={{ colorScheme: 'dark' }}
              />
              <button
                onClick={addBlockedDate}
                disabled={!newBlockedDate}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-500 font-bold text-sm disabled:opacity-40 active:scale-95"
              >
                🚫
              </button>
            </div>
          </div>
        </div>

        {/* Switch to Desktop */}
        <button
          onClick={onSwitchDevice}
          className={`w-full py-4 rounded-2xl ${currentTheme.surface} border ${currentTheme.border} font-bold ${currentTheme.text} active:scale-95 transition-all`}
        >
          💻 Passer en mode Ordinateur
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-2xl bg-red-500/20 text-red-500 font-bold active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default MobileSettings;
