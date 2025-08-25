import React, { useState, useEffect } from 'react';
import { Clock, Car, Tv, AlertCircle, Users, Wrench, Zap, Star, Award } from 'lucide-react';
import config from '../../config.local';

const TVDisplaySystem = () => {
  const [currentView, setCurrentView] = useState('service');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentServices, setCurrentServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Breaking news data
  const breakingNews = [
    "NOUVEAU: Service express 15 minutes - Lavage extérieur complet",
    "PROMOTION: -20% sur tous les services premium ce mois-ci", 
    "SPÉCIALITÉ: Traitement céramique disponible sur demande",
    "RAPIDE: Réservation en ligne maintenant disponible",
    "QUALITÉ: Produits écologiques certifiés pour tous nos services"
  ];
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data from API
  const fetchTVData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${config.API_BASE_URL}/api/tv/current-services`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const servicesData = await response.json();
      setCurrentServices(Array.isArray(servicesData) ? servicesData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching TV data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and every 5 seconds
  useEffect(() => {
    fetchTVData();
    const interval = setInterval(fetchTVData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-switch between service and advertising views
  useEffect(() => {
    const mainViewTime = 10000; // 10 seconds for main page
    const otherViewTime = 5000; // 5 seconds for others
    
    const switchTimer = setInterval(() => {
      setCurrentView(prev => prev === 'service' ? 'advertising' : 'service');
    }, currentView === 'service' ? mainViewTime : otherViewTime);

    return () => clearInterval(switchTimer);
  }, [currentView]);

  // Breaking news rotation
  useEffect(() => {
    const newsTimer = setInterval(() => {
      setCurrentNewsIndex(prev => (prev + 1) % breakingNews.length);
    }, 4000);

    return () => clearInterval(newsTimer);
  }, []);

  const getServiceTypeLabel = (type) => {
    const types = {
      'lavage-ville': 'Lavage Ville',
      'interieur': 'Intérieur',
      'exterieur': 'Extérieur', 
      'complet-premium': 'Premium',
      'complet': 'Complet'
    };
    return types[type] || type;
  };

  const getTimeElapsed = (startTime) => {
    if (!startTime) return 0;
    const now = new Date();
    const start = new Date(startTime);
    const elapsed = Math.floor((now - start) / (1000 * 60));
    return Math.max(0, elapsed);
  };

  const getEstimatedTimeRemaining = (serviceType, elapsed) => {
    const estimatedDurations = {
      'lavage-ville': 25,
      'interieur': 30,
      'exterieur': 20,
      'complet-premium': 45,
      'complet': 35
    };
    const totalEstimated = estimatedDurations[serviceType] || 30;
    const remaining = Math.max(0, totalEstimated - elapsed);
    return remaining;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const ServiceDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center space-x-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain filter brightness-0 invert" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                JOUINI LAVAGE AUTO
              </h1>
              <p className="text-slate-600 font-medium tracking-wide">Centre de lavage professionnel</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-mono">
              {currentTime.toLocaleTimeString('fr-FR')}
            </div>
            <div className="text-sm font-semibold text-slate-500 tracking-wider uppercase">
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 pb-24">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            SERVICES EN COURS
          </h2>
          <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-bold shadow-lg">
            {currentServices.length} ACTIF{currentServices.length > 1 ? 'S' : ''}
          </div>
        </div>
        
        {currentServices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentServices.map((service, index) => {
              const elapsed = getTimeElapsed(service.start_time);
              const remaining = getEstimatedTimeRemaining(service.service_type, elapsed);
              const progress = elapsed / (elapsed + remaining) * 100;
              
              return (
                <div key={service.id} className="group relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                  
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:scale-105 transition-all duration-500">
                    {/* Service Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                          {service.immatriculation}
                        </div>
                        <div className="text-slate-700 font-semibold">
                          {service.vehicle_brand} {service.vehicle_model}
                        </div>
                        <div className="inline-flex items-center space-x-2 mt-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
                          <span className="text-sm font-medium text-slate-600">
                            {service.vehicle_color} • {getServiceTypeLabel(service.service_type)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text">
                          {remaining}
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">MINUTES</div>
                      </div>
                    </div>
                    
                    {/* Progress Ring */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="rgb(226 232 240)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgb(59 130 246)" />
                            <stop offset="100%" stopColor="rgb(99 102 241)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-slate-700">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Service Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Début: {formatTime(service.start_time)}</span>
                        </div>
                        <span className="font-bold text-blue-600">{elapsed} min</span>
                      </div>
                      
                      {Array.isArray(service.staff) && service.staff.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 text-slate-600">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">Équipe</span>
                          </div>
                          <span className="font-bold text-indigo-600">
                            {service.staff.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 via-gray-200 to-slate-200 rounded-3xl blur opacity-50"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 p-16 text-center rounded-2xl shadow-xl">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Car className="w-12 h-12 text-white" />
              </div>
              <div className="text-2xl font-black text-slate-700 mb-3">Stations Disponibles</div>
              <div className="text-slate-500 font-medium">Prêt pour accueillir vos véhicules</div>
            </div>
          </div>
        )}
      </div>

      {/* Breaking News Bar - MOVED TO BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl border-t-2 border-white/20">
        <div className="flex items-center px-8 py-4">
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="font-black text-sm tracking-wider">ACTUALITÉS</div>
          </div>
          <div className="flex-1 overflow-hidden ml-8">
            <div className="animate-scroll whitespace-nowrap text-lg font-semibold">
              {breakingNews[currentNewsIndex]}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );

  const AdvertisingDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto p-8">
        {/* Logo */}
        <div className="relative mb-12">
          <div className="w-40 h-40 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-white/20">
            <img src="/logo.png" alt="Logo" className="w-32 h-32 object-contain" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl blur opacity-30 animate-pulse"></div>
        </div>
        
        {/* Main Title */}
        <h1 className="text-7xl font-black mb-8 bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
          JOUINI LAVAGE AUTO
        </h1>
        
        {/* Subtitle */}
        <p className="text-3xl text-blue-200 mb-12 font-light tracking-wide">
          Excellence • Innovation • Confiance
        </p>
        
        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-12 mb-12">
          <div className="group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-500">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="font-bold text-xl mb-2">Service Express</div>
            <div className="text-blue-200">Lavage complet en 15-45 minutes</div>
          </div>
          
          <div className="group">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-500">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div className="font-bold text-xl mb-2">Équipe Experte</div>
            <div className="text-blue-200">Personnel qualifié et expérimenté</div>
          </div>
          
          <div className="group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-500">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="font-bold text-xl mb-2">Qualité Premium</div>
            <div className="text-blue-200">Garantie satisfaction 100%</div>
          </div>
        </div>
      </div>

      {/* Service Indicator */}
      {currentServices.length > 0 && (
        <div className="absolute bottom-8 right-8 bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="text-sm text-blue-200 mb-3 font-semibold">
            {currentServices.length} SERVICE{currentServices.length > 1 ? 'S' : ''} ACTIF{currentServices.length > 1 ? 'S' : ''}
          </div>
          {currentServices.slice(0, 3).map(service => (
            <div key={service.id} className="flex justify-between items-center text-sm mb-2">
              <span className="font-bold">{service.immatriculation}</span>
              <span className="text-green-300 font-semibold ml-4">
                {getEstimatedTimeRemaining(service.service_type, getTimeElapsed(service.start_time))} min
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Tv className="w-10 h-10 text-white" />
          </div>
          <div className="text-2xl font-bold">Initialisation du système...</div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <div className="text-3xl font-bold mb-4">Erreur de connexion</div>
          <div className="text-xl mb-6">{error}</div>
          <button
            onClick={fetchTVData}
            className="px-8 py-4 bg-white text-red-900 rounded-xl hover:bg-gray-100 font-bold text-lg transition-all duration-300 hover:scale-105"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {currentView === 'service' ? <ServiceDisplay /> : <AdvertisingDisplay />}
    </div>
  );
};

export default TVDisplaySystem;
