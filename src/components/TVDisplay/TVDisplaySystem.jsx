import React, { useState, useEffect } from 'react';
import { Clock, Car, Tv, AlertCircle, Users, Wrench } from 'lucide-react';
import config from '../../config.local';

const TVDisplaySystem = () => {
  const [currentView, setCurrentView] = useState('service'); // 'service' or 'advertising'
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

      // Update to fetch multiple services
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
    }, 4000); // Change news every 4 seconds

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

  // Fixed timer calculation - calculate elapsed minutes since service started
  const getTimeElapsed = (startTime) => {
    if (!startTime) return 0;
    const now = new Date();
    const start = new Date(startTime);
    const elapsed = Math.floor((now - start) / (1000 * 60));
    return Math.max(0, elapsed);
  };

  // Estimate remaining time based on service type and elapsed time
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain filter brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">JOUINI LAVAGE AUTO</h1>
              <p className="text-slate-600">Système de gestion professionnel</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-slate-900">
              {currentTime.toLocaleTimeString('fr-FR')}
            </div>
            <div className="text-sm text-slate-500">
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Breaking News Bar */}
      <div className="bg-blue-600 text-white py-2 px-6 overflow-hidden">
        <div className="flex items-center space-x-4">
          <AlertCircle className="w-5 h-5 text-blue-200 flex-shrink-0" />
          <div className="animate-pulse font-semibold text-sm">ACTUALITÉS</div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-scroll whitespace-nowrap">
              {breakingNews[currentNewsIndex]}
            </div>
          </div>
        </div>
      </div>

      {/* Services en cours */}
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Wrench className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800">
            SERVICES EN COURS ({currentServices.length})
          </h2>
        </div>
        
        {currentServices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentServices.map((service, index) => {
              const elapsed = getTimeElapsed(service.start_time);
              const remaining = getEstimatedTimeRemaining(service.service_type, elapsed);
              
              return (
                <div key={service.id} className="bg-white border-l-4 border-blue-500 shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {service.immatriculation}
                      </div>
                      <div className="text-slate-600">
                        {service.vehicle_brand} {service.vehicle_model}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {service.vehicle_color} • {getServiceTypeLabel(service.service_type)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {remaining} min
                      </div>
                      <div className="text-xs text-slate-500">restantes</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>Début: {formatTime(service.start_time)}</span>
                      <span>• {elapsed} min écoulées</span>
                    </div>
                    {Array.isArray(service.staff) && service.staff.length > 0 && (
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Users className="w-4 h-4" />
                        <span>{service.staff.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${Math.min(100, Math.max(10, (elapsed / (elapsed + remaining)) * 100))}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-12 text-center rounded-lg">
            <Car className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <div className="text-xl text-slate-600 mb-2">Aucun service en cours</div>
            <div className="text-slate-500">Toutes les stations sont disponibles</div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>
    </div>
  );

  const AdvertisingDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto p-8">
        <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
        </div>
        
        <h1 className="text-6xl font-bold mb-6">
          JOUINI LAVAGE AUTO
        </h1>
        <p className="text-2xl text-blue-200 mb-8">
          Excellence • Professionnalisme • Confiance
        </p>
        
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <Car className="w-12 h-12 mx-auto mb-4 text-blue-300" />
            <div className="font-semibold">Service Rapide</div>
            <div className="text-sm text-blue-200">15-45 minutes</div>
          </div>
          <div>
            <Wrench className="w-12 h-12 mx-auto mb-4 text-blue-300" />
            <div className="font-semibold">Équipe Experte</div>
            <div className="text-sm text-blue-200">Personnel qualifié</div>
          </div>
          <div>
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-blue-300" />
            <div className="font-semibold">Qualité Garantie</div>
            <div className="text-sm text-blue-200">Satisfaction 100%</div>
          </div>
        </div>
      </div>

      {currentServices.length > 0 && (
        <div className="absolute bottom-6 right-6 bg-black/30 backdrop-blur-sm rounded-lg p-4">
          <div className="text-sm text-blue-200 mb-1">
            {currentServices.length} service{currentServices.length > 1 ? 's' : ''} en cours
          </div>
          {currentServices.slice(0, 2).map(service => (
            <div key={service.id} className="text-sm">
              <span className="font-medium">{service.immatriculation}</span>
              <span className="text-green-300 ml-2">
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
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Tv className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-400" />
          <div className="text-xl">Initialisation du système TV...</div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-red-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <div className="text-2xl mb-2">Erreur de connexion</div>
          <div className="text-lg mb-4">{error}</div>
          <button
            onClick={fetchTVData}
            className="px-6 py-2 bg-white text-red-900 rounded-lg hover:bg-gray-100 font-semibold"
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