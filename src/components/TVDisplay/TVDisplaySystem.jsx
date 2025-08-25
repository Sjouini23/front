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

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const ServiceDisplay = () => (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center p-8 border-b border-gray-200">
        <div className="flex items-center space-x-6">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">JOUINI LAVAGE AUTO</h1>
            <p className="text-gray-500">Système de gestion en temps réel</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-gray-900">
            {currentTime.toLocaleTimeString('fr-FR')}
          </div>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </div>
        </div>
      </div>

      {/* Current Service */}
      <div className="p-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">SERVICE EN COURS</h2>
        
        {currentService ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-4xl font-bold text-blue-900 mb-2">
                  {currentService.immatriculation}
                </div>
                <div className="text-lg text-gray-700 mb-2">
                  {currentService.vehicle_brand} {currentService.vehicle_model}
                </div>
                <div className="text-gray-600">
                  Couleur: {currentService.vehicle_color} • Service: {getServiceTypeLabel(currentService.service_type)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {getEstimatedTimeRemaining(currentService.service_type, getTimeElapsed(currentService.start_time))} min
                </div>
                <div className="text-sm text-gray-500">temps restant estimé</div>
                <div className="text-sm text-gray-600 mt-2">
                  Début: {formatTime(currentService.start_time)}
                </div>
              </div>
            </div>
            
            {Array.isArray(currentService.staff) && currentService.staff.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="text-sm text-gray-600">
                  Équipe: <span className="font-medium">{currentService.staff.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-8 text-center mb-8">
            <div className="text-gray-400 text-6xl mb-4">🚗</div>
            <div className="text-xl text-gray-600">Aucun service en cours</div>
            <div className="text-gray-500">Station disponible</div>
          </div>
        )}

        {/* Queue */}
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          FILE D'ATTENTE ({queue.length})
        </h2>
        
        {queue.length > 0 ? (
          <div className="space-y-4">
            {queue.slice(0, 8).map((service, index) => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{service.immatriculation}</div>
                    <div className="text-sm text-gray-600">
                      {service.vehicle_brand} {service.vehicle_model} • {service.vehicle_color}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {getServiceTypeLabel(service.service_type)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Ajouté: {formatTime(service.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <div className="text-lg text-gray-600">Aucun véhicule en attente</div>
          </div>
        )}
      </div>
    </div>
  );

  const AdvertisingDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 text-white flex items-center justify-center">
      <div className="text-center">
        <img src="/logo.png" alt="Logo" className="w-32 h-32 mx-auto mb-8 opacity-90" />
        <h1 className="text-6xl font-bold mb-6">
          JOUINI LAVAGE AUTO
        </h1>
        <p className="text-2xl text-blue-200 mb-8">
          Service Professionnel • Qualité Garantie
        </p>
        
        {currentService && (
          <div className="absolute bottom-8 right-8 bg-black/30 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-blue-200">Service en cours:</div>
            <div className="font-bold">{currentService.immatriculation}</div>
            <div className="text-sm text-green-300">
              {getEstimatedTimeRemaining(currentService.service_type, getTimeElapsed(currentService.start_time))} min restantes
            </div>
          </div>
        )}
      </div>
    </div>
  );

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