import React, { useState, useEffect } from 'react';
import { Clock, Car, Users, Calendar, Monitor } from 'lucide-react';
import config from '../../config.local';

const TVDisplaySystem = () => {
  const [currentView, setCurrentView] = useState('service'); // 'service' or 'advertising'
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentService, setCurrentService] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Advertisements data
  const advertisements = [
    {
      id: 1,
      type: 'text',
      content: 'JOUINI LAVAGE AUTO - Service Premium',
      subtitle: 'Qualité Professionnelle • Équipe Experte • Résultats Garantis',
      duration: 8000
    },
    {
      id: 2,
      type: 'text',
      content: 'OFFRE SPÉCIALE -20%',
      subtitle: 'Sur tous les services complets ce mois-ci',
      duration: 6000
    },
    {
      id: 3,
      type: 'text',
      content: 'LAVAGE MOTO SPÉCIALISÉ',
      subtitle: 'Équipement adapté • Produits spécifiques • Prix avantageux',
      duration: 7000
    }
  ];

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

      // Fetch current service and queue simultaneously
      const [currentResponse, queueResponse] = await Promise.all([
        fetch(config.API_ENDPOINTS.TV_CURRENT, { headers }),
        fetch(config.API_ENDPOINTS.TV_QUEUE, { headers })
      ]);

      if (!currentResponse.ok || !queueResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const currentData = await currentResponse.json();
      const queueData = await queueResponse.json();

      setCurrentService(currentData);
      setQueue(queueData || []);
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
    const switchTimer = setInterval(() => {
      if (currentService) {
        // If there's an active service, show it 70% of the time
        setCurrentView(prev => prev === 'service' ? 'advertising' : 'service');
      } else {
        // If no active service, show advertising more often
        setCurrentView('advertising');
      }
    }, currentService ? 10000 : 8000); // 10s with service, 8s without

    return () => clearInterval(switchTimer);
  }, [currentService]);

  // Advertisement rotation
  useEffect(() => {
    if (currentView !== 'advertising') return;

    const adTimer = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % advertisements.length);
    }, advertisements[currentAdIndex]?.duration || 8000);

    return () => clearInterval(adTimer);
  }, [currentView, currentAdIndex]);

  const getServiceTypeLabel = (type) => {
    const types = {
      'lavage-ville': 'Lavage Ville',
      'interieur': 'Intérieur',
      'exterieur': 'Extérieur',
      'complet-premium': 'Complet Premium',
      'complet': 'Complet'
    };
    return types[type] || type;
  };

  const getTimeElapsed = (startTime) => {
    if (!startTime) return 0;
    const elapsed = Math.floor((Date.now() - new Date(startTime)) / (1000 * 60));
    return elapsed;
  };

  const getEstimatedTimeRemaining = (serviceType, elapsed) => {
    const estimatedDurations = {
      'lavage-ville': 30,
      'interieur': 25,
      'exterieur': 20,
      'complet-premium': 45,
      'complet': 35
    };
    const estimated = estimatedDurations[serviceType] || 30;
    return Math.max(0, estimated - elapsed);
  };

  const ServiceDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Car className="w-12 h-12 text-cyan-400" />
          <h1 className="text-4xl font-bold">JOUINI LAVAGE AUTO</h1>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono">{currentTime.toLocaleTimeString('fr-FR')}</div>
          <div className="text-lg text-cyan-300">{currentTime.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>
      </div>

      {/* Current Service */}
      {currentService ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-cyan-400 mb-2">SERVICE EN COURS</h2>
              <div className="text-6xl font-bold mb-2">{currentService.immatriculation}</div>
              <div className="text-2xl text-gray-300">
                {currentService.vehicle_brand} {currentService.vehicle_model} • {currentService.vehicle_color}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-400">
                {getEstimatedTimeRemaining(currentService.service_type, getTimeElapsed(currentService.start_time))} min
              </div>
              <div className="text-lg text-gray-300">estimées restantes</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-gray-300 mb-1">Service</div>
              <div className="text-xl font-semibold">{getServiceTypeLabel(currentService.service_type)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-gray-300 mb-1">Temps écoulé</div>
              <div className="text-xl font-semibold">{getTimeElapsed(currentService.start_time)} min</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-gray-300 mb-1">Équipe</div>
              <div className="text-xl font-semibold">
                {Array.isArray(currentService.staff) && currentService.staff.length > 0
                  ? currentService.staff.join(', ')
                  : 'Équipe Pro'
                }
              </div>
            </div>
          </div>

          {/* Progress visualization */}
          <div className="w-full bg-white/20 rounded-full h-4 mb-2">
            <div
              className="bg-gradient-to-r from-green-400 to-cyan-400 h-4 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, (getTimeElapsed(currentService.start_time) / (getTimeElapsed(currentService.start_time) + getEstimatedTimeRemaining(currentService.service_type, getTimeElapsed(currentService.start_time)))) * 100)}%`
              }}
            />
          </div>
          <div className="text-center text-sm text-gray-300">
            Service en cours...
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20 text-center">
          <Car className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-400 mb-2">AUCUN SERVICE EN COURS</h2>
          <p className="text-xl text-gray-500">Station disponible pour le prochain véhicule</p>
        </div>
      )}

      {/* Queue */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Users className="w-8 h-8 mr-3 text-cyan-400" />
          FILE D'ATTENTE ({queue.length})
        </h2>

        {queue.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queue.slice(0, 6).map((service, index) => (
              <div key={service.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-lg font-bold">{service.immatriculation}</div>
                  <div className="text-sm bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
                <div className="text-sm text-gray-300 mb-1">
                  {service.vehicle_brand} {service.vehicle_model}
                </div>
                <div className="text-sm text-gray-300 mb-2">{service.vehicle_color}</div>
                <div className="flex justify-between text-sm">
                  <span>{getServiceTypeLabel(service.service_type)}</span>
                  <span className="text-cyan-400">
                    {new Date(service.created_at).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">Aucun véhicule en attente</p>
            <p className="text-sm mt-2">Prêt pour de nouveaux clients</p>
          </div>
        )}
      </div>
    </div>
  );

  const AdvertisingDisplay = () => {
    const currentAd = advertisements[currentAdIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 text-white flex items-center justify-center relative">
        <div className="text-center max-w-6xl mx-auto p-8">
          <div className="mb-8">
            <Car className="w-32 h-32 mx-auto mb-8 text-white/20" />
          </div>
          
          <h1 className="text-8xl font-bold mb-6 animate-pulse">
            {currentAd?.content}
          </h1>
          
          {currentAd?.subtitle && (
            <p className="text-3xl text-white/80 mb-8">
              {currentAd.subtitle}
            </p>
          )}

          <div className="text-4xl font-light text-white/60">
            JOUINI SERVICE • Votre expert lavage automobile
          </div>
        </div>

        {/* Small service indicator */}
        {currentService && (
          <div className="absolute bottom-8 right-8 bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="text-sm text-gray-300 mb-1">Service en cours:</div>
            <div className="text-lg font-bold">{currentService.immatriculation}</div>
            <div className="text-sm text-cyan-400">
              {getEstimatedTimeRemaining(currentService.service_type, getTimeElapsed(currentService.start_time))} min restantes
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 mx-auto mb-4 animate-pulse text-cyan-400" />
          <div className="text-2xl">Chargement du système TV...</div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-red-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-2xl mb-2">Erreur de connexion</div>
          <div className="text-lg">{error}</div>
          <button
            onClick={fetchTVData}
            className="mt-4 px-6 py-2 bg-white text-red-900 rounded-lg hover:bg-gray-100"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Main display
  return (
    <div className="relative">
      {currentView === 'service' ? <ServiceDisplay /> : <AdvertisingDisplay />}
    </div>
  );
};

export default TVDisplaySystem;