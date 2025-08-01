// hooks/useServices.js - REPLACE YOUR ENTIRE FILE WITH THIS
import { useState, useCallback, useMemo, useEffect } from 'react';
import config from '../config.local';
import { SERVICE_TYPES } from '../utils/configs';
import { 
  transformBackendResponse, 
  safeFilterServices,
  validateServiceBeforeSend,
  safeNumber,
  calculateSafeRevenue
} from '../utils/dataSafetyUtils'; // ✅ Import the safety utils

export const useServices = (addNotification) => {
  // ✅ FIXED - Use React state with better initialization
  const [services, setServices] = useState([]);
  const [serviceConfig, setServiceConfig] = useState(SERVICE_TYPES);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // ✅ FIXED - Improved fetch with better error handling and data transformation
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('🔄 Fetching services from:', config.API_ENDPOINTS.WASHES);
      
      const response = await fetch(config.API_ENDPOINTS.WASHES, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const backendServices = await response.json();
      console.log('📥 Raw backend data:', backendServices);
      
      // ✅ USE THE SAFE TRANSFORMER
      const transformedServices = transformBackendResponse(backendServices);
      console.log('✅ Transformed services:', transformedServices);
      
      setServices(transformedServices);
      
      // Log summary for debugging
      const revenue = calculateSafeRevenue(transformedServices);
      console.log('💰 Revenue summary:', revenue);
      
      if (transformedServices.length > 0) {
        addNotification('✅ Données Synchronisées', `${transformedServices.length} services chargés`, 'success');
      }

    } catch (error) {
      console.error('❌ Error fetching services:', error);
      addNotification('❌ Erreur de Synchronisation', error.message, 'error');
      
      // Set empty array on error instead of keeping stale data
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Load services on component mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ✅ FIXED - Safe filtered services with better error handling
  const filteredServices = useMemo(() => {
    try {
      const safeServices = safeFilterServices(services);
      
      if (safeServices.length === 0) return [];

      return safeServices.filter(service => {
        try {
          // Search filter
          const matchesSearch = !searchTerm || 
            (service.licensePlate && service.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (service.phone && service.phone.includes(searchTerm)) ||
            (service.vehicleBrand && service.vehicleBrand.toLowerCase().includes(searchTerm.toLowerCase()));
          
          // Type filters
          const matchesVehicleType = filterVehicleType === 'all' || service.vehicleType === filterVehicleType;
          const matchesStaff = filterStaff === 'all' || (Array.isArray(service.staff) && service.staff.includes(filterStaff));
          const matchesServiceType = filterServiceType === 'all' || service.serviceType === filterServiceType;
          const matchesBrand = filterBrand === 'all' || service.vehicleBrand === filterBrand;
          
          // Date filter
          let matchesDateRange = true;
          if (service.date && (dateRange.start || dateRange.end)) {
            const serviceDate = new Date(service.date);
            if (!isNaN(serviceDate)) {
              matchesDateRange = (!dateRange.start || serviceDate >= new Date(dateRange.start)) &&
                                (!dateRange.end || serviceDate <= new Date(dateRange.end));
            }
          }
          
          return matchesSearch && matchesVehicleType && matchesStaff && 
                 matchesServiceType && matchesBrand && matchesDateRange;
        } catch (filterError) {
          console.warn('Service filter error:', filterError);
          return false;
        }
      });
    } catch (error) {
      console.error('❌ Error filtering services:', error);
      return [];
    }
  }, [services, searchTerm, filterVehicleType, filterStaff, filterServiceType, filterBrand, dateRange]);

  // ✅ FIXED - Safe service creation with validation
  const handleCreateService = useCallback(async (serviceData) => {
    console.log('🚀 Creating service via API...', serviceData);
    
    try {
      // ✅ VALIDATE BEFORE SENDING
      const validation = validateServiceBeforeSend(serviceData);
      
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      // ✅ USE SAFE DATA
      const safeData = validation.safeData;
      
      if (editingService) {
        // UPDATE existing service
        console.log('📝 Updating service:', editingService.id);
        
        const response = await fetch(`${config.API_ENDPOINTS.WASHES}/${editingService.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            immatriculation: safeData.licensePlate,
            serviceType: safeData.serviceType,
            vehicleType: safeData.vehicleType,
            price: safeData.totalPrice,
            price_adjustment: safeData.priceAdjustment,
            photos: safeData.photos,
            motoDetails: safeData.motoDetails,
            vehicle_brand: safeData.vehicleBrand,
            vehicle_model: safeData.vehicleModel,
            vehicle_color: safeData.vehicleColor,
            staff: safeData.staff,
            phone: safeData.phone,
            notes: safeData.notes
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
        }

        // ✅ REFRESH FROM SERVER instead of local update
        await fetchServices();
        addNotification('✅ Service Modifié', `Service ${safeData.licensePlate} mis à jour`, 'success');
        
      } else {
        // CREATE new service
        console.log('➕ Creating new service');
        
        const response = await fetch(config.API_ENDPOINTS.WASHES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            immatriculation: safeData.licensePlate,
            serviceType: safeData.serviceType,
            vehicleType: safeData.vehicleType,
            price: safeData.totalPrice,
            price_adjustment: safeData.priceAdjustment,
            photos: safeData.photos,
            motoDetails: safeData.motoDetails,
            vehicle_brand: safeData.vehicleBrand,
            vehicle_model: safeData.vehicleModel,
            vehicle_color: safeData.vehicleColor,
            staff: safeData.staff,
            phone: safeData.phone,
            notes: safeData.notes
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
        }

        // ✅ REFRESH FROM SERVER to ensure sync
        await fetchServices();
        addNotification('✅ Service Créé', `Nouveau service ${safeData.licensePlate}`, 'success');
      }
      
      setShowServiceForm(false);
      setEditingService(null);
      
    } catch (error) {
      console.error('❌ Error creating/updating service:', error);
      addNotification('❌ Erreur', error.message || 'Impossible de sauvegarder le service', 'error');
    }
  }, [editingService, addNotification, fetchServices]);

  // ✅ FIXED - Safe edit service
  const handleEditService = useCallback((service) => {
    try {
      if (!service || !service.id) {
        throw new Error('Service invalide pour modification');
      }
      
      // ✅ ENSURE WE HAVE SAFE DATA
      const safeService = safeFilterServices([service])[0];
      if (!safeService) {
        throw new Error('Impossible de préparer le service pour modification');
      }
      
      setEditingService(safeService);
      setShowServiceForm(true);
    } catch (error) {
      console.error('❌ Error editing service:', error);
      addNotification('❌ Erreur', error.message, 'error');
    }
  }, [addNotification]);

  // ✅ FIXED - Safe delete with refresh
  const handleDeleteService = useCallback(async (serviceId) => {
    try {
      if (!serviceId) {
        throw new Error('ID de service invalide');
      }

      if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
        return;
      }

      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${config.API_ENDPOINTS.WASHES}/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      // ✅ REFRESH FROM SERVER
      await fetchServices();
      addNotification('✅ Service Supprimé', 'Service supprimé avec succès', 'success');
      
    } catch (error) {
      console.error('❌ Error deleting service:', error);
      addNotification('❌ Erreur', error.message, 'error');
    }
  }, [addNotification, fetchServices]);

  // ✅ FIXED - Safe complete service
  const handleCompleteService = useCallback(async (serviceId) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${config.API_ENDPOINTS.WASHES}/${serviceId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      // ✅ REFRESH FROM SERVER
      await fetchServices();
      addNotification('✅ Service Terminé', 'Service marqué comme terminé', 'success');
      
    } catch (error) {
      console.error('❌ Error completing service:', error);
      addNotification('❌ Erreur', error.message, 'error');
    }
  }, [addNotification, fetchServices]);

  // ✅ SAFE EXPORT WITH PROPER DATA
  const exportToCSV = useCallback(() => {
    try {
      const safeServices = safeFilterServices(filteredServices);
      
      if (safeServices.length === 0) {
        addNotification('⚠️ Aucune Donnée', 'Aucun service à exporter', 'warning');
        return;
      }

      const headers = [
        'Date', 'Plaque', 'Type Service', 'Type Véhicule', 'Marque', 
        'Prix Total', 'Ajustement Prix', 'Staff', 'Téléphone', 'Notes', 'Statut'
      ];
      
      const csvData = safeServices.map(service => [
        service.date || '',
        service.licensePlate || '',
        service.serviceType || '',
        service.vehicleType || '',
        service.vehicleBrand || '',
        safeNumber(service.totalPrice, 0),
        safeNumber(service.priceAdjustment, 0),
        Array.isArray(service.staff) ? service.staff.join(', ') : service.staff || '',
        service.phone || '',
        service.notes || '',
        service.completed ? 'Terminé' : 'En cours'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `services_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addNotification('✅ Export Réussi', `${safeServices.length} services exportés`, 'success');
      
    } catch (error) {
      console.error('❌ Export error:', error);
      addNotification('❌ Erreur Export', error.message, 'error');
    }
  }, [filteredServices, addNotification]);

  // Filter functions
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterVehicleType('all');
    setFilterStaff('all');
    setFilterServiceType('all');
    setFilterBrand('all');
    setDateRange({ start: '', end: '' });
  }, []);

  return {
    // Data - ALWAYS SAFE
    services: safeFilterServices(filteredServices),
    serviceConfig,
    loading,
    
    // Form state
    showServiceForm,
    editingService,
    
    // Filter state
    searchTerm,
    filterVehicleType,
    filterStaff,
    filterServiceType,
    filterBrand,
    dateRange,
    
    // Actions
    handleCreateService,
    handleEditService,
    handleDeleteService,
    handleCompleteService,
    fetchServices,
    exportToCSV,
    
    // Form controls
    setShowServiceForm,
    setEditingService,
    
    // Filter controls
    setSearchTerm,
    setFilterVehicleType,
    setFilterStaff,
    setFilterServiceType,
    setFilterBrand,
    setDateRange,
    clearFilters
  };
}; 