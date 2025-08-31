// hooks/useServices.js - COMPLETE VERSION WITH ALL YOUR FEATURES
import { useState, useCallback, useMemo, useEffect } from 'react';
import config from '../config.local';
import { SERVICE_TYPES } from '../utils/configs';
import { 
  transformBackendResponse, 
  safeFilterServices,
  validateServiceBeforeSend,
  safeNumber,
  calculateSafeRevenue
} from '../utils/dataSafetyUtils'; // ✅ These imports work fine!
import { washesAPI } from '../utils/api';
export const useServices = (addNotification) => {
  const [services, setServices] = useState([]);
  const [serviceConfig, setServiceConfig] = useState(SERVICE_TYPES);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // ✅ KEEP ALL YOUR FILTERS
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // ✅ FIXED fetchServices - uses your dataSafetyUtils properly
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.warn('No auth token found');
        setServices([]);
        return;
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
      
      // ✅ USE YOUR SAFE TRANSFORMER - this works!
      const transformedServices = transformBackendResponse(backendServices);
      console.log('✅ Transformed services:', transformedServices);
      console.log('📥 SETTING SERVICES TO STATE');
console.log('📥 Raw backend services:', backendServices.length);
console.log('📥 Transformed services:', transformedServices.length);
console.log('📥 All license plates:', transformedServices.map(s => s.licensePlate));
      setServices(transformedServices);
      
      if (transformedServices.length > 0) {
        addNotification('✅ Données Synchronisées', `${transformedServices.length} services chargés`, 'success');
      }

    } catch (error) {
      console.error('❌ Error fetching services:', error);
      addNotification('❌ Erreur de Synchronisation', error.message, 'error');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ FIXED: Remove addNotification from dependencies

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ✅ KEEP ALL YOUR FILTERS - FIXED the circular reference bug
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

  // ✅ KEEP ALL YOUR SERVICE FUNCTIONS
  const handleCreateService = useCallback(async (serviceData) => {
    console.log('🚀 Creating service via API...', serviceData);
    
    try {
      const validation = validateServiceBeforeSend(serviceData);
      
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const safeData = validation.safeData;
      
      if (editingService) {
        // UPDATE existing service
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

        await fetchServices();
        addNotification('✅ Service Modifié', `Service ${safeData.licensePlate} mis à jour`, 'success');
        
      } else {
        // CREATE new service
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
            notes: safeData.notes,
            date: serviceData.date,
           
          })
        });
console.log('🚀 Sending date to server:', {
  date: safeData.date,
  createdAt: safeData.createdAt,
  licensePlate: safeData.licensePlate
});
console.log('🚗 NEW CAR CREATION STARTED');
console.log('🚗 Service data received:', serviceData);
console.log('🚗 Service date:', serviceData.date);
console.log('🚗 Service isActive:', serviceData.isActive);
console.log('🚗 Current time:', new Date().toString());
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
        }

        await fetchServices();
        addNotification('✅ Service Créé', `Nouveau service ${safeData.licensePlate}`, 'success');
      }
      console.log('🔄 REFETCH COMPLETED - checking if new car appears');
console.log('🔄 Total services in state:', services.length);
console.log('🔄 Looking for new car:', serviceData.licensePlate);
const newCar = services.find(s => s.licensePlate === serviceData.licensePlate);
console.log('🔄 Found new car in state:', newCar ? 'YES ✅' : 'NO ❌');
if (newCar) {
  console.log('🔄 New car details:', newCar);
}
      setShowServiceForm(false);
      setEditingService(null);
      
    } catch (error) {
      console.error('❌ Error creating/updating service:', error);
      addNotification('❌ Erreur', error.message || 'Impossible de sauvegarder le service', 'error');
    }
  }, [editingService, addNotification, fetchServices]);

  const handleEditService = useCallback((service) => {
    try {
      if (!service || !service.id) {
        throw new Error('Service invalide pour modification');
      }
      
      setEditingService(service);
      setShowServiceForm(true);
    } catch (error) {
      console.error('❌ Error editing service:', error);
      addNotification('❌ Erreur', error.message, 'error');
    }
  }, [addNotification]);

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

      await fetchServices();
      addNotification('✅ Service Supprimé', 'Service supprimé avec succès', 'success');
      
    } catch (error) {
      console.error('❌ Error deleting service:', error);
      addNotification('❌ Erreur', error.message, 'error');
    }
  }, [addNotification, fetchServices]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterVehicleType('all');
    setFilterStaff('all');
    setFilterServiceType('all');
    setFilterBrand('all');
    setDateRange({ start: '', end: '' });
  }, []);
// ✅ ADD EXPORT FUNCTION
const exportToCSV = useCallback(() => {
  console.log('📊 Exporting services to CSV...');
  
  try {
    if (!filteredServices || filteredServices.length === 0) {
      addNotification('⚠️ Aucune Donnée', 'Aucun service à exporter', 'warning');
      return;
    }
    
    const headers = ['Date', 'Plaque', 'Type Service', 'Type Véhicule', 'Marque', 'Prix Total', 'Staff', 'Statut'];
    
    const csvData = filteredServices.map(service => [
      service.date || '',
      service.licensePlate || '',
      service.serviceType || '',
      service.vehicleType || '',
      service.vehicleBrand || '',
      service.totalPrice || 0,
      Array.isArray(service.staff) ? service.staff.join(', ') : '',
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
    
    addNotification('✅ Export Réussi', `${filteredServices.length} services exportés`, 'success');
    
  } catch (error) {
    console.error('❌ Export error:', error);
    addNotification('❌ Erreur Export', error.message, 'error');
  }
}, [filteredServices, addNotification]);

// Replace the finishService function in useServices.js (around line 180-210):

const finishService = useCallback(async (serviceId) => {
  console.log('🏁 Finishing service:', serviceId);
  
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }
    
    // 🔧 FIX: Use config.local.js like other API calls
    const response = await fetch(`${config.API_ENDPOINTS.WASHES}/${serviceId}/finish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    setServices(prev => prev.map(service => 
      service.id === serviceId ? {
        ...service,
        timeFinished: result.service.time_finished,
        totalDuration: result.service.total_duration,
        isActive: false,
        completed: true,
        updatedAt: result.service.updated_at
      } : service
    ));
    
    addNotification('🏁 Service Terminé', `Durée: ${result.durationMinutes}min`, 'success');
    
    // Refresh data from server to ensure consistency
    await fetchServices();
    
  } catch (error) {
    console.error('❌ Error finishing service:', error);
    addNotification('❌ Erreur', error.message, 'error');
  }
}, [addNotification, setServices, fetchServices]);

// ✅ CLEAN RETURN STATEMENT
return {
  // Data
  services: filteredServices,
  filteredServices: filteredServices,
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
  fetchServices,
  exportToCSV,
  finishService,
  
  // Form controls
  setShowServiceForm,
  setEditingService,
  setServiceConfig,
  
  // Filter controls
  setSearchTerm,
  setFilterVehicleType,
  setFilterStaff,
  setFilterServiceType,
  setFilterBrand,
  setDateRange,
  clearFilters
};
}; // ✅ CLOSE THE FUNCTION PROPERLY
