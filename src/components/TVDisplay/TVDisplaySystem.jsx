import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Car, Tv, AlertCircle, Users, Wrench, Zap, Star, Award, Activity, Timer, CheckCircle, Play, Trophy } from 'lucide-react';
import config from '../../config.local';

const TVDisplaySystem = () => {
  const [currentView, setCurrentView] = useState('service');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentServices, setCurrentServices] = useState([]);
  const [completedServices, setCompletedServices] = useState([]);
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

      // Fetch active services
      const activeResponse = await fetch(`${config.API_BASE_URL}/api/tv/current-services`, { headers });
      // Fetch completed services for today
      const completedResponse = await fetch(`${config.API_BASE_URL}/api/washes?status=completed&date=today`, { headers });

      if (!activeResponse.ok) {
        throw new Error('Failed to fetch active services');
      }

      const activeServicesData = await activeResponse.json();
      const completedServicesData = completedResponse.ok ? await completedResponse.json() : [];
      
      setCurrentServices(Array.isArray(activeServicesData) ? activeServicesData : []);
      setCompletedServices(Array.isArray(completedServicesData) ? completedServicesData : []);
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

  // Enhanced auto-switch with smooth transitions - Updated to include completion view
  useEffect(() => {
    const mainViewTime = 15000; // 15 seconds for service page
    const otherViewTime = 8000;  // 8 seconds for others
    const completionViewTime = 10000; // 10 seconds for completion page
    
    const switchTimer = setInterval(() => {
      setViewTransition(true);
      setTimeout(() => {
        setCurrentView(prev => {
          // Cycle through: service -> completion -> advertising -> service
          if (prev === 'service') return 'completion';
          if (prev === 'completion') return 'advertising';
          return 'service';
        });
        setViewTransition(false);
      }, 300);
    }, currentView === 'service' ? mainViewTime : 
       currentView === 'completion' ? completionViewTime : otherViewTime);

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

  // 🔧 FIXED: Correct time elapsed calculation in minutes
  const getTimeElapsed = (startTime) => {
    if (!startTime) return 0;
    const now = new Date();
    const start = new Date(startTime);
    const elapsed = Math.floor((now - start) / (1000 * 60));
    return Math.max(0, elapsed);
  };

  // 🔧 FIXED: Correct service durations (updated lavage-ville to 45 minutes)
  const getEstimatedTimeRemaining = (serviceType, elapsed) => {
    const estimatedDurations = {
      'lavage-ville': 45,        // FIXED: Changed from 25 to 45 minutes
      'interieur': 30,
      'exterieur': 20,
      'complet-premium': 60,     // Premium should be longer
      'complet': 40
    };
    const totalEstimated = estimatedDurations[serviceType] || 35;
    const remaining = Math.max(0, totalEstimated - elapsed);
    return remaining;
  };

  // 🔧 FIXED: Correct progress calculation
  const calculateProgress = (serviceType, elapsed) => {
    const estimatedDurations = {
      'lavage-ville': 45,
      'interieur': 30,
      'exterieur': 20,
      'complet-premium': 60,
      'complet': 40
    };
    const totalDuration = estimatedDurations[serviceType] || 35;
    
    // Calculate percentage based on elapsed time vs total expected duration
    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    // After 100%, show "En Finition" status
    if (elapsed > totalDuration) {
      return { percent: 100, status: 'finishing', overtime: elapsed - totalDuration };
    }
    
    return { percent: progressPercent, status: 'active', overtime: 0 };
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Real-time stats calculation - REMOVED REVENUE FOR PRIVACY
  const statsData = useMemo(() => {
    const totalServices = currentServices.length;
    const totalElapsed = currentServices.reduce((sum, service) => sum + getTimeElapsed(service.start_time), 0);
    const avgTimePerService = totalServices > 0 ? Math.round(totalElapsed / totalServices) : 0;
    const completedToday = completedServices.length;

    return { totalServices, totalElapsed, avgTimePerService, completedToday };
  }, [currentServices, completedServices]);

  // 🆕 NEW: Service Completion Display
  const CompletionDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-700 text-white relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-green-400 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black">SERVICES TERMINÉS</h1>
              <p className="text-green-200 font-medium">Aujourd'hui - {formatTime(new Date())}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{statsData.completedToday}</div>
            <div className="text-green-200">Services Complétés</div>
          </div>
        </div>
      </div>

      {/* Completed Services Grid */}
      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {completedServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {completedServices.slice(0, 8).map((service, index) => (
              <div key={service.id || index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-green-300/20 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs text-green-300 font-bold">
                    TERMINÉ
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-xl font-black text-white">
                    {service.immatriculation || service.licensePlate}
                  </div>
                  
                  <div className="text-green-200 font-semibold">
                    {getServiceTypeLabel(service.service_type || service.serviceType)}
                  </div>
                  
                  {(service.vehicle_brand || service.vehicleBrand) && (
                    <div className="text-sm text-green-300">
                      {service.vehicle_brand || service.vehicleBrand} {service.vehicle_model || service.vehicleModel || ''}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-green-300/20">
                    <div className="text-xs text-green-300">
                      Durée: {Math.floor((service.duration || 0) / 60)}min
                    </div>
                    <div className="text-xs text-green-300">
                      {formatTime(service.end_time || service.timeFinished)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-green-200 mb-4">Aucun Service Terminé</h3>
            <p className="text-green-300">Les services complétés apparaîtront ici</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-xl p-6">
        <div className="flex justify-center space-x-8 text-center">
          <div>
            <div className="text-2xl font-black text-white">{statsData.completedToday}</div>
            <div className="text-xs text-green-300 uppercase">Terminés Aujourd'hui</div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{statsData.totalServices}</div>
            <div className="text-xs text-green-300 uppercase">En Cours</div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{statsData.avgTimePerService} min</div>
            <div className="text-xs text-green-300 uppercase">Temps Moyen</div>
          </div>
        </div>
      </div>
    </div>
  );

  const ServiceDisplay = () => (
    <div className={`min-h-screen transition-all duration-500 ${viewTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden`}>
      {/* Background Animation */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity
            }}
          />
        ))}
      </div>

      {/* Breaking News Ticker */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 py-3 z-20">
        <div className="flex items-center">
          <div className="bg-white text-red-600 px-4 py-1 font-black text-sm rounded-r-full mr-4">
            {breakingNews[currentNewsIndex].category}
          </div>
          <div className="text-white font-bold animate-pulse">
            {breakingNews[currentNewsIndex].text}
          </div>
        </div>
      </div>

      {/* Header with Time and Stats - REMOVED REVENUE */}
      <div className="relative z-10 pt-16 p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-4xl font-black">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-blue-200 font-semibold">{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-8 text-right">
            <div>
              <div className="text-2xl font-black">{statsData.totalServices}</div>
              <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Services Actifs</div>
            </div>
            <div>
              <div className="text-2xl font-black">{statsData.avgTimePerService} min</div>
              <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Temps moyen</div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="text-sm font-bold uppercase">Système Actif</div>
            </div>
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
              <h2 className="text-3xl font-black text-white">SERVICES EN COURS</h2>
              <p className="text-blue-200 font-medium">Suivi en temps réel</p>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">EN DIRECT</span>
          </div>
        </div>
        
        {currentServices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {currentServices.map((service, index) => {
              const elapsed = getTimeElapsed(service.start_time);
              const remaining = getEstimatedTimeRemaining(service.service_type, elapsed);
              const progressData = calculateProgress(service.service_type, elapsed);  // 🔧 FIXED
              const isUrgent = remaining <= 5;
              const isOvertime = progressData.status === 'finishing';
              
              return (
                <div key={service.id} className="group relative">
                  {/* Dynamic glow based on urgency */}
                  <div className={`absolute -inset-2 rounded-3xl blur-lg transition-all duration-1000 ${
                    isOvertime
                      ? 'bg-gradient-to-r from-orange-500/40 to-red-500/40 animate-pulse'
                      : isUrgent 
                      ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30'
                      : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20'
                  }`}></div>
                  
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                    {/* Service Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-2xl font-black text-slate-900 mb-2">
                          {service.immatriculation}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                            {getServiceTypeLabel(service.service_type)}
                          </span>
                          {(service.vehicle_brand || service.vehicle_model) && (
                            <span className="text-sm text-slate-600 font-medium">
                              {service.vehicle_brand} {service.vehicle_model}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`px-4 py-2 rounded-2xl font-bold text-sm ${
                        isOvertime
                          ? 'bg-orange-100 text-orange-800'
                          : isUrgent
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isOvertime ? 'EN FINITION' : isUrgent ? 'URGENT' : 'EN COURS'}
                      </div>
                    </div>

                    {/* Time Display Grid - FIXED DISPLAY */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="text-center">
                        <div className={`text-3xl font-black mb-2 ${
                          isOvertime ? 'text-orange-600' : isUrgent ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {elapsed}
                        </div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                          MINUTES ÉCOULÉES
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-3xl font-black mb-2 ${
                          isOvertime 
                            ? 'text-transparent bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text animate-pulse'
                            : remaining <= 5
                            ? 'text-transparent bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text animate-pulse' 
                            : 'text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text'
                        }`}>
                          {isOvertime ? `+${progressData.overtime}` : remaining}
                        </div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                          {isOvertime ? 'MINUTES SUPPLÉMENTAIRES' : 'MINUTES RESTANTES'}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Progress Ring - FIXED PROGRESS */}
                    <div className="relative w-32 h-32 mx-auto mb-8">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={isOvertime ? "#f97316" : isUrgent ? "#ef4444" : "#3b82f6"} />
                            <stop offset="50%" stopColor={isOvertime ? "#ef4444" : isUrgent ? "#ec4899" : "#6366f1"} />
                            <stop offset="100%" stopColor={isOvertime ? "#ec4899" : isUrgent ? "#8b5cf6" : "#8b5cf6"} />
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
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressData.percent / 100)}`}
                          className="transition-all duration-1000 ease-out drop-shadow-lg"
                          filter={`url(#glow-${index})`}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-black text-slate-700">
                            {Math.round(progressData.percent)}%
                          </div>
                          <div className="text-xs font-semibold text-slate-500 uppercase">
                            {isOvertime ? 'Finition' : 'Complété'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Service Details Grid */}
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
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur opacity-40"></div>
              <div className="relative w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
                <Car className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="text-4xl font-black mb-6 text-white">Aucun Service Actif</div>
            <div className="text-xl text-blue-200 mb-8">En attente de nouveaux clients</div>
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 rounded-2xl">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-200 font-bold">Système Prêt</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Advertising Display
  const AdvertisingDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity * 0.6
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-8 text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-lg opacity-40 animate-pulse"></div>
          <div className="relative w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
            <Zap className="w-16 h-16 text-white" />
          </div>
        </div>
        <h1 className="text-6xl font-black mb-6">JOUINI CAR WASH</h1>
        <p className="text-2xl text-purple-200 font-semibold">Service Premium - Qualité Garantie</p>
      </div>

      {/* Services Grid */}
      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-black mb-3">Lavage Extérieur</div>
            <div className="text-purple-200 text-lg">Nettoyage complet extérieur</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-black mb-3">Service Premium</div>
            <div className="text-purple-200 text-lg">Intérieur + Extérieur complet</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-black mb-3">Qualité Garantie</div>
            <div className="text-purple-200 text-lg">Satisfaction client 100%</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
          <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
            <div className="text-3xl font-black mb-4">Réservation Immédiate</div>
            <div className="text-xl text-purple-200">Appelez-nous ou venez directement</div>
          </div>
        </div>
      </div>

      {/* Live Service Indicator */}
      {currentServices.length > 0 && (
        <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="text-sm text-purple-200 mb-4 font-bold uppercase tracking-wider">
            Services en cours
          </div>
          {currentServices.slice(0, 4).map(service => {
            const elapsed = getTimeElapsed(service.start_time);
            const remaining = getEstimatedTimeRemaining(service.service_type, elapsed);
            
            return (
              <div key={service.id} className="flex justify-between items-center text-sm mb-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <span className="font-bold">{service.immatriculation}</span>
                <span className="text-green-300 font-bold ml-4">
                  {remaining} min
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                opacity: particle.opacity
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 text-center">
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur opacity-40 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Tv className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-black mb-4">Initialisation du système TV</div>
          <div className="text-blue-200">Connexion aux données en temps réel...</div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-red-400 rounded-3xl blur opacity-40"></div>
            <div className="relative w-24 h-24 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="text-4xl font-black mb-6">Erreur de connexion</div>
          <div className="text-xl mb-8 text-red-200">{error}</div>
          <button
            onClick={fetchTVData}
            className="px-12 py-4 bg-white text-red-900 rounded-2xl hover:bg-gray-100 font-black text-xl transition-all duration-300 hover:scale-110 shadow-2xl"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {currentView === 'service' && <ServiceDisplay />}
      {currentView === 'completion' && <CompletionDisplay />}
      {currentView === 'advertising' && <AdvertisingDisplay />}
    </div>
  );
};

export default TVDisplaySystem;
