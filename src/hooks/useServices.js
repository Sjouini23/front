import { useState, useCallback, useMemo, useEffect } from 'react';
import config from '../config.local';
import { SERVICE_TYPES } from '../utils/configs';

export const useServices = (addNotification) => {
  // ✅ CHANGED - Use React state instead of localStorage
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

  // ✅ NEW - Fetch services from backend on component mount
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(config.API_ENDPOINTS.WASHES, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const backendServices = await response.json();
      
      // Convert backend format to frontend format
      const frontendServices = backendServices.map(service => ({
        id: service.id,
        licensePlate: service.immatriculation,
        serviceType: service.service_type,
        vehicleType: service.vehicle_type,
        totalPrice: service.price,
        photos: service.photos || [],
        motoDetails: service.moto_details,
        date: service.created_at?.split('T')[0], // Convert to date string
        createdAt: service.created_at,
        updatedAt: service.updated_at,
        completed: service.status === 'completed'
      }));

      setServices(frontendServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      addNotification('Erreur', 'Impossible de charger les services', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Load services on component mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Enhanced filtered services with error handling
  const filteredServices = useMemo(() => {
    try {
      if (!Array.isArray(services)) return [];

      return services.filter(service => {
        if (!service || typeof service !== 'object') return false;

        const matchesSearch = !searchTerm || 
          (service.licensePlate && service.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (service.phone && service.phone.includes(searchTerm)) ||
          (service.vehicleBrand && service.vehicleBrand.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesVehicleType = filterVehicleType === 'all' || service.vehicleType === filterVehicleType;
        const matchesStaff = filterStaff === 'all' || (Array.isArray(service.staff) && service.staff.includes(filterStaff));
        const matchesServiceType = filterServiceType === 'all' || service.serviceType === filterServiceType;
        const matchesBrand = filterBrand === 'all' || service.vehicleBrand === filterBrand;
        
        let matchesDateRange = true;
        if (service.date) {
          const serviceDate = new Date(service.date);
          if (!isNaN(serviceDate)) {
            matchesDateRange = (!dateRange.start || serviceDate >= new Date(dateRange.start)) &&
                              (!dateRange.end || serviceDate <= new Date(dateRange.end));
          }
        }
        
        return matchesSearch && matchesVehicleType && matchesStaff && 
               matchesServiceType && matchesBrand && matchesDateRange;
      });
    } catch (error) {
      console.error('Error filtering services:', error);
      return [];
    }
  }, [services, searchTerm, filterVehicleType, filterStaff, filterServiceType, filterBrand, dateRange]);

  // ✅ FIXED - Backend API CRUD Operations
  const handleCreateService = useCallback(async (serviceData) => {
    console.log('🚀 Creating service via API...', serviceData);
    try {
      if (!serviceData || typeof serviceData !== 'object') {
        throw new Error('Invalid service data');
      }

      const token = localStorage.getItem('auth_token');
      
      if (editingService) {
        // UPDATE existing service
        const response = await fetch(`${config.API_ENDPOINTS.WASHES}/${editingService.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            immatriculation: serviceData.licensePlate,
            serviceType: serviceData.serviceType,
            vehicleType: serviceData.vehicleType,
            price: serviceData.totalPrice,
            photos: serviceData.photos,
            motoDetails: serviceData.motoDetails || null
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update service');
        }

        const updatedService = await response.json();
        
        // Convert backend response to frontend format
        const frontendService = {
          ...serviceData,
          id: updatedService.id,
          createdAt: updatedService.created_at,
          updatedAt: updatedService.updated_at
        };

        // Update local state
        setServices(prev => prev.map(s => s.id === editingService.id ? frontendService : s));
        addNotification('Service Modifié', `Service ${serviceData.licensePlate} mis à jour`, 'success');
        
      } else {
        // CREATE new service
        const response = await fetch(config.API_ENDPOINTS.WASHES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            immatriculation: serviceData.licensePlate,
            serviceType: serviceData.serviceType,
            vehicleType: serviceData.vehicleType,
            price: serviceData.totalPrice,
            photos: serviceData.photos,
            motoDetails: serviceData.motoDetails || null
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create service');
        }

        const savedService = await response.json();
        
        // Convert backend response to frontend format
        const frontendService = {
          ...serviceData,
          id: savedService.id,
          createdAt: savedService.created_at,
          updatedAt: savedService.updated_at
        };

        // Add to local state
        setServices(prev => [...prev, frontendService]);
        addNotification('Service Créé', `Nouveau service ${serviceData.licensePlate}`, 'success');
      }
      
      setShowServiceForm(false);
      setEditingService(null);
      
    } catch (error) {
      console.error('Error creating/updating service:', error);
      addNotification('Erreur', error.message || 'Impossible de sauvegarder le service', 'error');
    }
  }, [editingService, addNotification]);

  const handleEditService = useCallback((service) => {
    try {
      if (!service || !service.id) {
        throw new Error('Invalid service for editing');
      }
      setEditingService(service);
      setShowServiceForm(true);
    } catch (error) {
      console.error('Error editing service:', error);
      addNotification('Erreur', 'Impossible de modifier le service', 'error');
    }
  }, [addNotification]);

  // ✅ FIXED - Delete via backend API
  const handleDeleteService = useCallback(async (serviceId) => {
    try {
      if (!serviceId) {
        throw new Error('Invalid service ID');
      }

      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch(`${config.API_ENDPOINTS.WASHES}/${serviceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to delete service');
        }

        // Remove from local state
        setServices(prev => prev.filter(s => s.id !== serviceId));
        addNotification('Service Supprimé', 'Service supprimé avec succès', 'success');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      addNotification('Erreur', error.message || 'Impossible de supprimer le service', 'error');
    }
  }, [addNotification]);

  // ✅ FIXED - Complete service via backend API
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
        throw new Error(errorData.error || 'Failed to complete service');
      }

      // Update local state
      setServices(prev => prev.map(s => 
        s.id === serviceId ? { ...s, completed: true } : s
      ));
      
      addNotification('Service Terminé', 'Service marqué comme terminé', 'success');
    } catch (error) {
      console.error('Error completing service:', error);
      addNotification('Erreur', error.message || 'Impossible de terminer le service', 'error');
    }
  }, [addNotification]);

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
    // Data
    services: filteredServices,
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