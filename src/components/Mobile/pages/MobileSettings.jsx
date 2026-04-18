import React, { useState } from 'react';
import { Sun, Moon, LogOut, Users, Plus, Edit3, Trash2 } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../../utils/luxuryThemes';

const MobileSettings = ({ theme, setTheme, staffMembers = {}, addStaff, renameStaff, deleteStaff, onLogout, onSwitchDevice }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [newName, setNewName] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editingName, setEditingName] = useState('');

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
