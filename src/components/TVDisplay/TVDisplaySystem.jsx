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

  // Real-time stats calculation
  const statsData = useMemo(() => {
    const totalServices = currentServices.length;
    const totalElapsed = currentServices.reduce((sum, service) => sum + getTimeElapsed(service.start_time), 0);
    const totalRevenue = currentServices.reduce((sum, service) => sum + (service.price || 0), 0);
    const avgTimePerService = totalServices > 0 ? Math.round(totalElapsed / totalServices) : 0;

    return { totalServices, totalElapsed, totalRevenue, avgTimePerService };
  }, [currentServices]);

  const ServiceDisplay = () => (
    <div className={`min-h-screen transition-all duration-500 ${viewTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 via-indigo-50 to-purple-50">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
              transform: `scale(${particle.size})`
            }}
          />
        ))}
      </div>

      {/* Premium Header */}
      <div className="relative z-20 bg-white/95 backdrop-blur-2xl border-b border-white/30 shadow-2xl">
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center space-x-8">
            {/* Logo with premium treatment */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500">
                <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain filter brightness-0 invert" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center animate-pulse">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                JOUINI LAVAGE AUTO
              </h1>
              <p className="text-slate-600 font-semibold tracking-wide">Centre de lavage professionnel premium</p>
            </div>
          </div>
          
          {/* Real-time clock with enhanced styling */}
          <div className="text-right">
            <div className="text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-mono">
              {currentTime.toLocaleTimeString('fr-FR')}
            </div>
            <div className="text-sm font-bold text-slate-500 tracking-wider uppercase mt-1">
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-black">{statsData.totalServices}</div>
              <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Services Actifs</div>
            </div>
            <div>
              <div className="text-2xl font-black">{statsData.totalRevenue} DT</div>
              <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Revenus en cours</div>
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
              const remaining = getEstimatedTimeRemaining(service.service_type, elapsed);
              const progress = elapsed / (elapsed + remaining) * 100;
              const isUrgent = remaining <= 5;
              
              return (
                <div key={service.id} className="group relative">
                  {/* Dynamic glow based on urgency */}
                  <div className={`absolute -inset-2 rounded-3xl blur-lg transition-all duration-1000 ${
                    isUrgent 
                      ? 'bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 opacity-60' 
                      : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-30'
                  } group-hover:opacity-70`}></div>
                  
                  <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-white/30 transform hover:scale-105 hover:rotate-1 transition-all duration-700">
                    
                    {/* Service Status Indicator */}
                    <div className="absolute top-4 right-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isUrgent ? 'bg-orange-500' : 'bg-green-500'
                      } shadow-lg animate-pulse`}>
                        {isUrgent ? <Timer className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="mb-8">
                      <div className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                        {service.immatriculation}
                      </div>
                      <div className="text-xl font-bold text-slate-700 mb-2">
                        {service.vehicle_brand} {service.vehicle_model}
                      </div>
                      
                      {/* Service Type Badge */}
                      <div className="inline-flex items-center space-x-3">
                        <div className={`px-4 py-2 rounded-xl font-bold text-sm text-white shadow-lg ${
                          isUrgent 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`}>
                          {getServiceTypeLabel(service.service_type)}
                        </div>
                        <div className="flex items-center space-x-2 text-slate-600">
                          <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                          <span className="font-medium">{service.vehicle_color}</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Display */}
                    <div className="text-center mb-8">
                      <div className={`text-6xl font-black mb-2 ${
                        isUrgent 
                          ? 'text-transparent bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text animate-pulse' 
                          : 'text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text'
                      }`}>
                        {remaining}
                      </div>
                      <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        MINUTES RESTANTES
                      </div>
                    </div>

                    {/* Enhanced Progress Ring */}
                    <div className="relative w-32 h-32 mx-auto mb-8">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={isUrgent ? "#f97316" : "#3b82f6"} />
                            <stop offset="50%" stopColor={isUrgent ? "#ef4444" : "#6366f1"} />
                            <stop offset="100%" stopColor={isUrgent ? "#ec4899" : "#8b5cf6"} />
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
                        
                        {/* Progress circle */}
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke={`url(#gradient-${index})`}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                          className="transition-all duration-1000 ease-out drop-shadow-lg"
                          filter={`url(#glow-${index})`}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-black text-slate-700">
                            {Math.round(progress)}%
                          </div>
                          <div className="text-xs font-semibold text-slate-500 uppercase">Complété</div>
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
                            <Users className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold text-slate-700">Équipe</span>
                          </div>
                          <span className="font-black text-slate-900">
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
            <div className="absolute -inset-4 bg-gradient-to-r from-slate-200 via-gray-200 to-slate-200 rounded-3xl blur opacity-50"></div>
            <div className="relative bg-white/95 backdrop-blur-2xl border border-white/30 p-20 text-center rounded-3xl shadow-2xl">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-400 to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-110 transition-all duration-500">
                <Car className="w-16 h-16 text-white" />
              </div>
              <div className="text-4xl font-black text-slate-700 mb-4">Stations Disponibles</div>
              <div className="text-xl text-slate-500 font-medium">Toutes nos stations sont prêtes à accueillir vos véhicules</div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Breaking News Bar - BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl border-t-4 border-white/20 backdrop-blur-xl">
        <div className="flex items-center px-8 py-5">
          <div className="flex items-center space-x-6 flex-shrink-0">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-white/30 rounded-2xl blur animate-pulse"></div>
            </div>
            <div>
              <div className="font-black text-lg tracking-wider">ACTUALITÉS</div>
              <div className="text-xs font-semibold opacity-80 uppercase">
                {breakingNews[currentNewsIndex].category}
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden ml-8">
            <div className="animate-scroll whitespace-nowrap text-xl font-bold tracking-wide">
              {breakingNews[currentNewsIndex].text}
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
          animation: scroll 25s linear infinite;
        }
      `}</style>
    </div>
  );

  const AdvertisingDisplay = () => (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 via-indigo-900 to-purple-900 text-white flex items-center justify-center relative overflow-hidden transition-all duration-500 ${viewTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity * 0.3,
              transform: `scale(${particle.size})`
            }}
          />
        ))}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-15 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-7xl mx-auto p-8">
        {/* Premium Logo Treatment */}
        <div className="relative mb-16">
          <div className="absolute -inset-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
          <div className="relative w-48 h-48 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white/20">
            <img src="/logo.png" alt="Logo" className="w-36 h-36 object-contain" />
          </div>
        </div>
        
        {/* Main Branding */}
        <h1 className="text-8xl font-black mb-8 bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent tracking-tight">
          JOUINI LAVAGE AUTO
        </h1>
        
        <p className="text-4xl text-blue-200 mb-16 font-light tracking-wide">
          Excellence • Innovation • Confiance
        </p>
        
        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-3 gap-16 mb-16">
          <div className="group transform hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="font-black text-2xl mb-3">Service Express</div>
            <div className="text-blue-200 text-lg">Lavage complet en 15-45 minutes</div>
          </div>
          
          <div className="group transform hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Star className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="font-black text-2xl mb-3">Équipe Premium</div>
            <div className="text-blue-200 text-lg">Personnel expert et certifié</div>
          </div>
          
          <div className="group transform hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-400 to-purple-400 rounded-3xl blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Award className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="font-black text-2xl mb-3">Qualité Garantie</div>
            <div className="text-blue-200 text-lg">Satisfaction client 100%</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
          <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <div className="text-3xl font-black mb-4">Réservation Immédiate</div>
            <div className="text-xl text-blue-200">Appelez-nous ou venez directement</div>
          </div>
        </div>
      </div>

      {/* Live Service Indicator */}
      {currentServices.length > 0 && (
        <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="text-sm text-blue-200 mb-4 font-bold uppercase tracking-wider">
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
      {currentView === 'service' ? <ServiceDisplay /> : <AdvertisingDisplay />}
    </div>
  );
};

export default TVDisplaySystem;
