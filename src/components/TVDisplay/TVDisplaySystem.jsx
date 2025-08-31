// FIXED TVDisplaySystem.jsx - All issues resolved

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Car, Tv, AlertCircle, Users, Wrench, Zap, Star, Award, Activity, Timer, CheckCircle, Play } from 'lucide-react';
import config from '../../config.local';

const TVDisplaySystem = () => {
  const [currentView, setCurrentView] = useState('service');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentServices, setCurrentServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewTransition, setViewTransition] = useState(false);

  // Enhanced breaking news with categories
  const breakingNews = [
    { text: "NOUVEAU: Service express 15 minutes - Lavage extérieur complet", category: "NOUVEAU" },
    { text: "PROMOTION: -20% sur tous les services premium ce mois-ci", category: "PROMO" },
    { text: "SPÉCIALITÉ: Traitement céramique disponible sur demande", category: "SERVICE" },
    { text: "RAPIDE: Réservation en ligne maintenant disponible", category: "DIGITAL" },
    { text: "QUALITÉ: Produits écologiques certifiés pour tous nos services", category: "ECO" }
  ];
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // Particle animation state
  const [particles, setParticles] = useState([]);

  // Initialize particles for background animation
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1
    }));
    setParticles(newParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y + particle.speed * 0.1) % 100,
        opacity: 0.1 + Math.sin(Date.now() * 0.001 + particle.id) * 0.3
      })));
    }, 100);

    return () => clearInterval(interval);
  }, []);

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

  // Enhanced auto-switch with smooth transitions
  useEffect(() => {
    const mainViewTime = 10000; // 10 seconds for main page
    const otherViewTime = 5000; // 5 seconds for others
    
    const switchTimer = setInterval(() => {
      setViewTransition(true);
      setTimeout(() => {
        setCurrentView(prev => prev === 'service' ? 'advertising' : 'service');
        setViewTransition(false);
      }, 300);
    }, currentView === 'service' ? mainViewTime : otherViewTime);

    return () => clearInterval(switchTimer);
  }, [currentView]);

  // Breaking news rotation
  useEffect(() => {
    const newsTimer = setInterval(() => {
      setCurrentNewsIndex(prev => (prev + 1) % breakingNews.length);
    }, 6000);

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

  // 🔥 FIXED: Correct time elapsed calculation
  const getTimeElapsed = (startTime) => {
    if (!startTime) return 0;
    const now = new Date();
    const start = new Date(startTime);
    const elapsed = Math.floor((now - start) / (1000 * 60));
    return Math.max(0, elapsed);
  };

  // 🔥 FIXED: Better estimated time remaining calculation
  const getEstimatedTimeRemaining = (serviceType, elapsed) => {
    const estimatedDurations = {
      'lavage-ville': 25,
      'interieur': 30,
      'exterieur': 20,
      'complet-premium': 45,
      'complet': 35
    };
    const totalEstimated = estimatedDurations[serviceType] || 30;
    
    // 🔥 FIX: Don't let remaining go below 0 abruptly
    const remaining = Math.max(0, totalEstimated - elapsed);
    
    // If service is running longer than expected, show "En finition" status
    if (elapsed > totalEstimated) {
      return { remaining: 0, status: 'finishing' };
    }
    
    return { remaining, status: 'normal' };
  };

  // 🔥 FIXED: Correct progress calculation that never shows false 100%
  const getServiceProgress = (serviceType, elapsed) => {
    const estimatedDurations = {
      'lavage-ville': 25,
      'interieur': 30,
      'exterieur': 20,
      'complet-premium': 45,
      'complet': 35
    };
    const totalEstimated = estimatedDurations[serviceType] || 30;
    
    // Calculate progress based on estimated total duration
    let progress = (elapsed / totalEstimated) * 100;
    
    // Cap progress at 95% until service is manually completed
    // This prevents the false 100% complete issue
    progress = Math.min(progress, 95);
    
    return {
      progress: Math.max(0, progress),
      isOvertime: elapsed > totalEstimated
    };
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 🔥 FIXED: Remove revenue calculation for security
  // Real-time stats calculation - NO REVENUE EXPOSURE
  const statsData = useMemo(() => {
    const totalServices = currentServices.length;
    const totalElapsed = currentServices.reduce((sum, service) => sum + getTimeElapsed(service.start_time), 0);
    const avgTimePerService = totalServices > 0 ? Math.round(totalElapsed / totalServices) : 0;

    return { totalServices, totalElapsed, avgTimePerService };
  }, [currentServices]);

  const ServiceDisplay = () => (
    <div className={`min-h-screen transition-all duration-500 ${viewTransition ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
      {/* Animated Background with Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-300 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
              transform: `scale(${particle.size})`
            }}
          />
        ))}
      </div>

      {/* Header with Breaking News */}
      <div className="relative z-20 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-bold uppercase tracking-wider">
                {breakingNews[currentNewsIndex].category}
              </span>
            </div>
            <div className="h-6 w-px bg-red-300"></div>
            <div className="text-sm font-medium">
              {breakingNews[currentNewsIndex].text}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">
              {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs opacity-90">
              {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar - REMOVED REVENUE FOR SECURITY */}
      <div className="relative z-20 bg-white/90 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-black text-slate-800">{statsData.totalServices}</div>
              <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Services actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-800">{statsData.totalElapsed}</div>
              <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Minutes totales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-800">{statsData.avgTimePerService}</div>
              <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Temps moyen</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-sm font-bold uppercase">Système Actif</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-8 pb-32 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-40 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">SERVICES EN COURS</h2>
              <p className="text-slate-600 font-medium">Suivi en temps réel</p>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">EN DIRECT</span>
          </div>
        </div>
        
        {currentServices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {currentServices.map((service, index) => {
              const elapsed = getTimeElapsed(service.start_time);
              const timeInfo = getEstimatedTimeRemaining(service.service_type, elapsed);
              const progressInfo = getServiceProgress(service.service_type, elapsed);
              const isUrgent = timeInfo.remaining <= 5;
              const isOvertime = progressInfo.isOvertime;
              
              return (
                <div key={service.id} className="group relative">
                  {/* Dynamic glow based on urgency */}
                  <div className={`absolute -inset-2 rounded-3xl blur-lg transition-all duration-1000 ${
                    isOvertime 
                      ? 'bg-gradient-to-r from-purple-400 to-pink-500 opacity-30'
                      : isUrgent 
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 opacity-30'
                      : 'bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20'
                  } group-hover:opacity-50`}></div>
                  
                  {/* Service Card */}
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500">
                    
                    {/* Status Badge */}
                    <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isOvertime 
                        ? 'bg-purple-100 text-purple-700'
                        : isUrgent 
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isOvertime ? 'En finition' : isUrgent ? 'Urgent' : 'En cours'}
                    </div>

                    {/* Vehicle Info Header */}
                    <div className="mb-8">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isOvertime ? 'bg-purple-100' : isUrgent ? 'bg-orange-100' : 'bg-blue-100'
                        }`}>
                          <Car className={`w-6 h-6 ${
                            isOvertime ? 'text-purple-600' : isUrgent ? 'text-orange-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider">
                            {service.immatriculation}
                          </h3>
                          <p className="text-slate-600 font-medium">
                            {service.vehicle_brand} {service.vehicle_model}
                            {service.vehicle_color && ` • ${service.vehicle_color}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl p-4">
                        <div className="text-center">
                          <div className="text-lg font-black text-slate-800 mb-1">
                            {getServiceTypeLabel(service.service_type)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time Remaining Display */}
                    <div className="text-center mb-8">
                      <div className={`text-4xl font-black mb-2 ${
                        isOvertime 
                          ? 'text-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text' 
                          : isUrgent 
                          ? 'text-transparent bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text animate-pulse' 
                          : 'text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text'
                      }`}>
                        {isOvertime ? '+ Temps' : `${timeInfo.remaining} min`}
                      </div>
                      <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        {isOvertime ? 'Dépassé' : 'Minutes restantes'}
                      </div>
                    </div>

                    {/* 🔥 FIXED: Enhanced Progress Ring - No false 100% */}
                    <div className="relative w-32 h-32 mx-auto mb-8">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={isOvertime ? "#a855f7" : isUrgent ? "#f97316" : "#3b82f6"} />
                            <stop offset="50%" stopColor={isOvertime ? "#ec4899" : isUrgent ? "#ef4444" : "#6366f1"} />
                            <stop offset="100%" stopColor={isOvertime ? "#f472b6" : isUrgent ? "#ec4899" : "#8b5cf6"} />
                          </linearGradient>
                          <filter id={`glow-${index}`}>
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge> 
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        
                        {/* Background circle */}
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="rgb(226 232 240)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        
                        {/* Progress circle - FIXED CALCULATION */}
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke={`url(#gradient-${index})`}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressInfo.progress / 100)}`}
                          className="transition-all duration-1000 ease-out drop-shadow-lg"
                          filter={`url(#glow-${index})`}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-black text-slate-700">
                            {Math.round(progressInfo.progress)}%
                          </div>
                          <div className="text-xs font-semibold text-slate-500 uppercase">Complété</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Service Details Grid - ENHANCED */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-slate-700">Début</span>
                        </div>
                        <span className="font-black text-slate-900">{formatTime(service.start_time)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Activity className="w-5 h-5 text-indigo-600" />
                          <span className="font-semibold text-slate-700">Temps écoulé</span>
                        </div>
                        <span className="font-black text-slate-900">{elapsed} min</span>
                      </div>
                      
                      {Array.isArray(service.staff) && service.staff.length > 0 && (
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-slate-700">Équipe</span>
                          </div>
                          <span className="font-black text-slate-900">{service.staff.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <Clock className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-600 mb-2">Aucun service actif</h3>
            <p className="text-slate-500">Les services en cours apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  );

  const AdvertisingDisplay = () => (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center transition-all duration-500 ${viewTransition ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
      <div className="text-center max-w-4xl mx-auto px-8">
        <div className="mb-8">
          <Star className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-6xl font-black mb-4">TOUINI AUTO</h2>
          <p className="text-2xl font-light opacity-90">Excellence • Qualité • Confiance</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <Zap className="w-8 h-8 mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-bold mb-2">Service Rapide</h3>
            <p className="text-sm opacity-80">Lavage express en 15 minutes</p>
          </div>
          <div className="text-center">
            <Award className="w-8 h-8 mx-auto mb-4 text-green-400" />
            <h3 className="text-xl font-bold mb-2">Qualité Premium</h3>
            <p className="text-sm opacity-80">Produits écologiques certifiés</p>
          </div>
          <div className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-4 text-purple-400" />
            <h3 className="text-xl font-bold mb-2">Satisfaction Garantie</h3>
            <p className="text-sm opacity-80">Service client exceptionnel</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Erreur de connexion</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchTVData}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return currentView === 'service' ? <ServiceDisplay /> : <AdvertisingDisplay />;
};

export default TVDisplaySystem;
