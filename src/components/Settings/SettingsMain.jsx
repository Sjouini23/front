import React, { useState } from 'react';
import { Shield, Database,Square,Wifi, Settings, Users, Car, Droplets, Star, DollarSign, Clock, MessageCircle, Mail, Send, Heart, Code } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
import { safeParseNumber } from '../../utils/validation';

const SettingsMain = ({ 
  theme, 
  setTheme, 
  serviceConfig, 
  setServiceConfig, 
  services 
}) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Calculate average duration from completed services + 5 minutes
  const calculateServiceDuration = (serviceType) => {
    // Handle different variations of service keys
    const serviceVariations = {
      'lavage-ville': ['lavage-ville'],
      'interieur': ['interieur'],
      'exterieur': ['exterieur'],
      'complet-premium': ['complet-premium', 'complet', 'service-complet']
    };
    
    const variations = serviceVariations[serviceType] || [serviceType];
    
    const completedServices = services.filter(s => 
      variations.includes(s.serviceType) && 
      (s.timeFinished || s.totalDuration > 0)
    );
    
    if (completedServices.length === 0) {
      // Default durations if no data
      const defaults = {
        'lavage-ville': 45,
        'interieur': 25,
        'exterieur': 20,
        'complet-premium': 90
      };
      return defaults[serviceType] || 45;
    }
    
    // Calculate from actual table data
    const totalDuration = completedServices.reduce((sum, s) => {
      if (s.totalDuration) {
        return sum + s.totalDuration;
      }
      // If totalDuration not available, calculate from start/end times
      if (s.timeStarted && s.timeFinished) {
        const start = new Date(s.timeStarted);
        const end = new Date(s.timeFinished);
        const durationInSeconds = Math.floor((end - start) / 1000);
        return sum + durationInSeconds;
      }
      return sum;
    }, 0);
    
    const averageInMinutes = Math.floor(totalDuration / completedServices.length / 60);
    return averageInMinutes + 5; // Add 5 minutes to average from table
  };

  // Handle feedback submission
  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      const subject = 'Feedback - Application de Gestion Services';
      const body = `Bonjour,\n\nVoici mon commentaire/suggestion:\n\n${feedback}\n\nCordialement`;
      const mailtoLink = `mailto:developer@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
    }
  };

  // Define the four services with their icons
  const DEFAULT_SERVICES = {
    'lavage-ville': {
      icon: <Car size={24} className="text-blue-500" />,
      name: 'Lavage Ville',
      description: 'Intérieur complet + Extérieur standard',
      duration: calculateServiceDuration('lavage-ville'),
      basePrice: 25
    },
    'interieur': {
      icon: <Users size={24} className="text-green-500" />,
      name: 'Intérieur',
      description: 'Aspirateur + Nettoyage sièges',
      duration: calculateServiceDuration('interieur'),
      basePrice: 19
    },
    'exterieur': {
      icon: <Droplets size={24} className="text-cyan-500" />,
      name: 'Extérieur',
      description: 'Lavage carrosserie + Rinçage',
      duration: calculateServiceDuration('exterieur'),
      basePrice: 12
    },
    'complet-premium': {
      icon: <Star size={24} className="text-yellow-500" />,
      name: 'Complet Premium',
      description: 'Service complet haut de gamme',
      duration: calculateServiceDuration('complet-premium'),
      basePrice: 45
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
            <Settings className="text-white" size={28} />
          </div>
        </div>
        <h2 className={`text-3xl sm:text-4xl font-bold ${currentTheme.text}`}>Configuration Système</h2>
        <p className={`${currentTheme.textSecondary} text-base sm:text-lg max-w-3xl mx-auto leading-relaxed`}>
          Gérez vos services, tarifs et paramètres avancés pour optimiser votre activité
        </p>
      </div>

      {/* Service Configuration */}
      <div className={`${currentTheme.surface} rounded-2xl p-6 sm:p-8 shadow-xl border ${currentTheme.border}`}>
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 shadow-md">
            <DollarSign className="text-white" size={20} />
          </div>
          <div>
            <h3 className={`text-2xl sm:text-3xl font-bold ${currentTheme.text}`}>Configuration des Services</h3>
            <p className={`${currentTheme.textSecondary} text-sm sm:text-base mt-1`}>Ajustez les tarifs et paramètres de vos services</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Object.entries(DEFAULT_SERVICES).map(([key, service]) => {
            const currentService = serviceConfig[key] || service;
            return (
              <div key={key} className={`${currentTheme.glass} rounded-xl p-5 sm:p-6 border ${currentTheme.border} hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow-sm">
                      {service.icon}
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg sm:text-xl ${currentTheme.text}`}>{service.name}</h4>
                      <p className={`${currentTheme.textSecondary} text-sm sm:text-base mt-1`}>{service.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium ${currentTheme.textMuted} mb-2`}>
                      <Clock size={14} className="inline mr-1" />
                      Durée (min)
                    </label>
                    <div className={`px-4 py-3 rounded-lg ${currentTheme.glass} ${currentTheme.border} text-center`}>
                      <span className={`font-bold text-lg ${currentTheme.text}`}>{service.duration}</span>
                    </div>
                  </div>
                  
                  {/* FIXED PRICE ADJUSTMENT SECTION */}
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium ${currentTheme.textMuted} mb-2`}>
                      <DollarSign size={14} className="inline mr-1" />
                      Tarif (DT)
                    </label>
                    <div className="flex items-center space-x-2">
                      {/* MINUS BUTTON - FIXED */}
                      <button
                        onClick={() => {
                          const currentPrice = serviceConfig[key]?.basePrice ?? service.basePrice;
                          const newPrice = Math.max(0, currentPrice - 1);
                          setServiceConfig(prev => ({
                            ...prev,
                            [key]: { 
                              ...service, 
                              ...prev[key], 
                              basePrice: newPrice 
                            }
                          }));
                        }}
                        className={`w-10 h-10 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-all duration-200 hover:scale-110 shadow-sm flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-red-500/50`}
                      >
                        −
                      </button>
                      
                      {/* EDITABLE INPUT FIELD - NEW */}
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          value={serviceConfig[key]?.basePrice ?? service.basePrice}
                          onChange={(e) => {
                            const newPrice = Math.max(0, Math.min(1000, parseFloat(e.target.value) || 0));
                            setServiceConfig(prev => ({
                              ...prev,
                              [key]: { 
                                ...service, 
                                ...prev[key], 
                                basePrice: newPrice 
                              }
                            }));
                          }}
                          onBlur={(e) => {
                            // Ensure valid number on blur
                            const newPrice = Math.max(0, Math.min(1000, parseFloat(e.target.value) || 0));
                            setServiceConfig(prev => ({
                              ...prev,
                              [key]: { 
                                ...service, 
                                ...prev[key], 
                                basePrice: newPrice 
                              }
                            }));
                          }}
                          min="0"
                          max="1000"
                          step="0.5"
                          className={`w-full px-4 py-3 rounded-lg ${currentTheme.glass} ${currentTheme.border} text-center font-bold text-lg ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500`}
                        />
                        <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${currentTheme.textMuted} text-sm font-medium pointer-events-none`}>
                          DT
                        </span>
                      </div>
                      
                      {/* PLUS BUTTON - FIXED */}
                      <button
                        onClick={() => {
                          const currentPrice = serviceConfig[key]?.basePrice ?? service.basePrice;
                          const newPrice = Math.min(1000, currentPrice + 1);
                          setServiceConfig(prev => ({
                            ...prev,
                            [key]: { 
                              ...service, 
                              ...prev[key], 
                              basePrice: newPrice 
                            }
                          }));
                        }}
                        className={`w-10 h-10 rounded-lg bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-all duration-200 hover:scale-110 shadow-sm flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50`}
                      >
                        +
                      </button>
                    </div>
                    
                    {/* QUICK ADJUSTMENT BUTTONS - NEW */}
                    <div className="flex justify-center space-x-2 mt-2">
                      <button
                        onClick={() => {
                          const currentPrice = serviceConfig[key]?.basePrice ?? service.basePrice;
                          const newPrice = Math.max(0, currentPrice - 5);
                          setServiceConfig(prev => ({
                            ...prev,
                            [key]: { 
                              ...service, 
                              ...prev[key], 
                              basePrice: newPrice 
                            }
                          }));
                        }}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-bold"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => {
                          const currentPrice = serviceConfig[key]?.basePrice ?? service.basePrice;
                          const newPrice = Math.min(1000, currentPrice + 5);
                          setServiceConfig(prev => ({
                            ...prev,
                            [key]: { 
                              ...service, 
                              ...prev[key], 
                              basePrice: newPrice 
                            }
                          }));
                        }}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors font-bold"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className={`${currentTheme.surface} rounded-2xl p-6 sm:p-8 shadow-xl border ${currentTheme.border}`}>
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 shadow-md">
            <Database className="text-white" size={20} />
          </div>
          <div>
            <h3 className={`text-2xl sm:text-3xl font-bold ${currentTheme.text}`}>Statistiques & Données</h3>
            <p className={`${currentTheme.textSecondary} text-sm sm:text-base mt-1`}>Vue d'ensemble de votre activité</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${currentTheme.glass} rounded-xl p-6 text-center border ${currentTheme.border} hover:shadow-lg transition-all`}>
            <div className="p-4 rounded-full bg-blue-500/20 inline-block mb-4">
              <Database className="text-blue-500" size={28} />
            </div>
            <h4 className={`font-bold ${currentTheme.text} mb-2 text-xl`}>{services.length}</h4>
            <p className={`text-sm sm:text-base ${currentTheme.textSecondary}`}>Services enregistrés</p>
            <div className="mt-3">
              <span className={`text-xs ${currentTheme.textMuted} bg-blue-500/20 text-blue-600 px-3 py-1 rounded-full font-bold`}>
                Sauvegarde auto
              </span>
            </div>
          </div>
          
          <div className={`${currentTheme.glass} rounded-xl p-6 text-center border ${currentTheme.border} hover:shadow-lg transition-all`}>
            <div className="p-4 rounded-full bg-green-500/20 inline-block mb-4">
              <Shield className="text-green-500" size={28} />
            </div>
            <h4 className={`font-bold ${currentTheme.text} mb-2 text-xl`}>Sécurisé</h4>
            <p className={`text-sm sm:text-base ${currentTheme.textSecondary}`}>Données protégées</p>
            <div className="mt-3">
              <span className={`text-xs ${currentTheme.textMuted} bg-green-500/20 text-green-600 px-3 py-1 rounded-full font-bold`}>
                Chiffrement local
              </span>
            </div>
          </div>
          
          <div className={`${currentTheme.glass} rounded-xl p-6 text-center border ${currentTheme.border} hover:shadow-lg transition-all`}>
            <div className="p-4 rounded-full bg-purple-500/20 inline-block mb-4">
              <Wifi className="text-purple-500" size={28} />
            </div>
            <h4 className={`font-bold ${currentTheme.text} mb-2 text-xl`}>Hors ligne</h4>
            <p className={`text-sm sm:text-base ${currentTheme.textSecondary}`}>Mode autonome</p>
            <div className="mt-3">
              <span className={`text-xs ${currentTheme.textMuted} bg-purple-500/20 text-purple-600 px-3 py-1 rounded-full font-bold`}>
                Toujours disponible
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Keyboard Shortcuts */}
        <div className={`${currentTheme.surface} rounded-2xl p-6 sm:p-8 shadow-xl border ${currentTheme.border}`}>
          <h3 className={`text-xl sm:text-2xl font-bold ${currentTheme.text} mb-6`}>Raccourcis Clavier</h3>
          <div className="space-y-4">
            {[
              { keys: 'Ctrl + N', action: 'Nouveau Service', icon: <Send size={18} className="text-green-500" /> },
              { keys: 'Ctrl + E', action: 'Exporter Données', icon: <Database size={18} className="text-blue-500" /> },
              { keys: 'Escape', action: 'Fermer Formulaire', icon: <Shield size={18} className="text-red-500" /> },
              { keys: 'Tab', action: 'Navigation', icon: <Settings size={18} className="text-purple-500" /> }
            ].map((shortcut, index) => (
              <div key={index} className={`${currentTheme.glass} rounded-lg p-4 flex items-center justify-between border ${currentTheme.border} hover:shadow-md transition-all`}>
                <div className="flex items-center space-x-3">
                  {shortcut.icon}
                  <span className={`font-medium ${currentTheme.text} text-sm sm:text-base`}>{shortcut.action}</span>
                </div>
                <div className="flex space-x-1">
                  {shortcut.keys.split(' + ').map((key, keyIndex) => (
                    <span key={keyIndex} className={`px-3 py-1 rounded-md bg-gray-500/20 text-gray-600 text-xs font-mono`}>
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Features */}
        <div className={`${currentTheme.surface} rounded-2xl p-6 sm:p-8 shadow-xl border ${currentTheme.border}`}>
          <h3 className={`text-xl sm:text-2xl font-bold ${currentTheme.text} mb-6`}>Fonctionnalités Système</h3>
          <div className="space-y-4">
            {[
              { title: 'Interface Responsive', desc: 'Compatible mobile & desktop', icon: <Car size={18} className="text-blue-500" /> },
              { title: 'Thèmes Adaptatifs', desc: 'Mode sombre et clair', icon: <Settings size={18} className="text-purple-500" /> },
              { title: 'Validation Stricte', desc: 'Contrôle des données', icon: <Shield size={18} className="text-green-500" /> },
              { title: 'Performance Optimisée', desc: 'Chargement ultra-rapide', icon: <Star size={18} className="text-yellow-500" /> }
            ].map((feature, index) => (
              <div key={index} className={`${currentTheme.glass} rounded-lg p-4 border ${currentTheme.border} hover:shadow-md transition-all`}>
                <div className="flex items-center space-x-3">
                  {feature.icon}
                  <div>
                    <h4 className={`font-bold ${currentTheme.text} text-sm sm:text-base`}>{feature.title}</h4>
                    <p className={`${currentTheme.textSecondary} text-xs sm:text-sm`}>{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`${currentTheme.surface} rounded-2xl p-6 sm:p-8 shadow-xl border ${currentTheme.border} text-center`}>
        <div className="space-y-6">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className={`text-xs sm:text-sm ${currentTheme.textMuted}`}>
              © 2025 Seif Jouini Development. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SettingsMain;