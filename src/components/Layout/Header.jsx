import React from 'react';
import { MessageSquare, ExternalLink, Download, Plus } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';

const Header = ({ theme, currentTime, serviceData }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  
  // DEBUG CHECK - Remove this after fixing
 
  const handleFeedbackClick = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSeu8c3U__QmoK6YUpJJc6uIGW_C4CtYWBh8yU67yYTOX3YQXA/viewform?usp=header', '_blank');
  };

  return (
    <header className={`${currentTheme.surface} rounded-2xl p-4 mb-4 shadow-xl relative overflow-hidden`}
            style={{ backdropFilter: 'blur(30px)' }}>
      {/* Clean Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/8 to-indigo-600/8 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/8 to-blue-600/8 rounded-full blur-2xl"></div>
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
        <div className="flex items-center space-x-4">
          {/* Professional Logo Container */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/logo.png" 
                alt="JOUINI Logo" 
                className="w-8 h-8 object-contain filter brightness-0 invert"
                onError={(e) => {
                  // Fallback if logo doesn't exist
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden w-8 h-8 text-white flex items-center justify-center font-bold text-lg">
                J
              </div>
            </div>
          </div>
          
          {/* Clean Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className={`text-2xl font-bold ${currentTheme.text} bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}>
                JOUINI AI
              </h1>
              <span className="text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1 rounded-full">
                2025
              </span>
            </div>
            <p className={`${currentTheme.textSecondary} text-sm`}>
              Intelligence Artificielle • Gestion Avancée • Analytics Prédictifs
            </p>
          </div>
        </div>
                
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="text-left md:text-right">
            <p className={`${currentTheme.text} font-bold text-base`}>
              {currentTime.toLocaleDateString('fr-TN', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className={`${currentTheme.textSecondary} text-sm`}>
              {currentTime.toLocaleTimeString('fr-TN')}
            </p>
          </div>
                     
          <div className="flex items-center space-x-3">
            {/* Export Luxury Button - WITH DEBUG */}
            <button
              onClick={() => {
                console.log('🔍 Export button clicked!');
                console.log('🔍 serviceData:', serviceData);
                console.log('🔍 exportToCSV function:', serviceData?.exportToCSV);
                
                if (serviceData?.exportToCSV) {
                  console.log('✅ Calling exportToCSV...');
                  try {
                    serviceData.exportToCSV();
                    console.log('✅ exportToCSV called successfully');
                  } catch (error) {
                    console.error('❌ Error calling exportToCSV:', error);
                  }
                } else {
                  console.error('❌ exportToCSV function not found!');
                  console.error('❌ Available serviceData properties:', serviceData ? Object.keys(serviceData) : 'serviceData is null/undefined');
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              title="Exporter les données"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Nouveau Service Button */}
            <button
              onClick={() => {
                console.log('🔍 Nouveau Service button clicked!');
                console.log('🔍 setShowServiceForm:', serviceData?.setShowServiceForm);
                
                if (serviceData?.setShowServiceForm) {
                  console.log('✅ Calling setShowServiceForm(true)...');
                  serviceData.setShowServiceForm(true);
                } else {
                  console.error('❌ setShowServiceForm function not found!');
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 text-white font-medium hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              title="Créer un nouveau service"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nouveau</span>
            </button>
            
            {/* Clean Feedback Button */}
            <button
              onClick={handleFeedbackClick}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              title="Donnez votre avis"
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Feedback</span>
              <ExternalLink size={12} className="opacity-70" />
            </button>
            
            {/* Minimalist Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-xs ${currentTheme.textMuted} font-medium`}>V1.0</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;