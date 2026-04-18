import React, { useState } from 'react';
import { Smartphone, Monitor, Car } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';

const DevicePicker = ({ theme, onSelect }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [remember, setRemember] = useState(true);

  const handleSelect = (mode) => {
    onSelect(mode, remember);
  };

  return (
    <div className={`min-h-screen ${currentTheme.background} flex flex-col items-center justify-center p-6`}>

      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg inline-block mb-4">
          <Car className="text-white" size={32} />
        </div>
        <h1 className={`text-2xl font-bold ${currentTheme.text}`}>JOUINI AI</h1>
        <p className={`${currentTheme.textSecondary} text-sm mt-1`}>Comment accédez-vous ?</p>
      </div>

      {/* Picker Cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-sm sm:max-w-lg">

        {/* Phone */}
        <button
          onClick={() => handleSelect('mobile')}
          className={`flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border-2
            ${currentTheme.surface} ${currentTheme.border}
            hover:border-blue-500 hover:shadow-xl transition-all duration-300
            active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
        >
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 mb-4 shadow-md">
            <Smartphone className="text-white" size={32} />
          </div>
          <span className={`text-lg font-bold ${currentTheme.text}`}>📱 Téléphone</span>
          <span className={`text-xs ${currentTheme.textSecondary} mt-1 text-center`}>
            Interface optimisée mobile
          </span>
        </button>

        {/* Laptop */}
        <button
          onClick={() => handleSelect('desktop')}
          className={`flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border-2
            ${currentTheme.surface} ${currentTheme.border}
            hover:border-purple-500 hover:shadow-xl transition-all duration-300
            active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
        >
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 mb-4 shadow-md">
            <Monitor className="text-white" size={32} />
          </div>
          <span className={`text-lg font-bold ${currentTheme.text}`}>💻 Ordinateur</span>
          <span className={`text-xs ${currentTheme.textSecondary} mt-1 text-center`}>
            Interface complète bureau
          </span>
        </button>
      </div>

      {/* Remember choice */}
      <div className="mt-8 flex items-center space-x-3">
        <input
          id="remember-device"
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="w-5 h-5 rounded accent-blue-500"
        />
        <label htmlFor="remember-device" className={`text-sm ${currentTheme.textSecondary}`}>
          Se souvenir de mon choix
        </label>
      </div>

      <p className={`mt-4 text-xs ${currentTheme.textSecondary} opacity-60`}>
        Vous pourrez changer ce choix dans les paramètres
      </p>
    </div>
  );
};

export default DevicePicker;
