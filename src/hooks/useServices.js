import { useState, useCallback, useMemo } from 'react';
import { useSecureLocalStorage } from './useSecureLocalStorages';
import { SERVICE_TYPES } from '../utils/configs';

export const useServices = (addNotification) => {
  // Data State
  const [services, setServices] = useSecureLocalStorage('jouini_luxury_services_2025', []);
  const [serviceConfig, setServiceConfig] = useSecureLocalStorage('jouini_luxury_config_2025', SERVICE_TYPES);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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

  // CRUD Operations with enhanced error handling
  const handleCreateService = useCallback((serviceData) => {
    console.log('🔄 Creating service...', serviceData);
    try {
      if (!serviceData || typeof serviceData !== 'object') {
        throw new Error('Invalid service data');
      }

      if (editingService) {
        setServices(prev => prev.map(s => s.id === editingService.id ? serviceData : s));
        addNotification('Service Modifié', `Service ${serviceData.licensePlate} mis à jour`, 'success');
      } else {
        setServices(prev => [...prev, serviceData]);
        addNotification('Service Créé', `Nouveau service ${serviceData.licensePlate}`, 'success');
      }
      
    
      setShowServiceForm(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error creating/updating service:', error);
      addNotification('Erreur', 'Impossible de sauvegarder le service', 'error');
    }
  }, [editingService, setServices, addNotification]);

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

  const handleDeleteService = useCallback((serviceId) => {
    try {
      if (!serviceId) {
        throw new Error('Invalid service ID');
      }

      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
        setServices(prev => prev.filter(s => s.id !== serviceId));
        addNotification('Service Supprimé', 'Le service a été supprimé avec succès', 'success');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      addNotification('Erreur', 'Impossible de supprimer le service', 'error');
    }
  }, [setServices, addNotification]);

  // NEW: Finish Service Timer Function
  const finishService = useCallback((serviceId) => {
    try {
      const now = new Date().toISOString();
      
      setServices(prev => prev.map(service => {
        if (service.id === serviceId && service.isActive) {
          const startTime = new Date(service.timeStarted);
          const endTime = new Date(now);
          const totalDuration = Math.floor((endTime - startTime) / 1000);
          
          // Calculate individual staff durations
          const updatedStaffDurations = { ...service.staffDurations };
          if (updatedStaffDurations) {
            Object.keys(updatedStaffDurations).forEach(staffId => {
              if (updatedStaffDurations[staffId] && updatedStaffDurations[staffId].isActive) {
                const staffStartTime = new Date(updatedStaffDurations[staffId].startTime);
                updatedStaffDurations[staffId] = {
                  ...updatedStaffDurations[staffId],
                  totalTime: Math.floor((endTime - staffStartTime) / 1000),
                  isActive: false
                };
              }
            });
          }
          
          return {
            ...service,
            timeFinished: now,
            totalDuration,
            staffDurations: updatedStaffDurations,
            isActive: false,
            completed: true
          };
        }
        return service;
      }));
      
      addNotification('Service Terminé', 'Timer arrêté et service marqué comme terminé', 'success');
    } catch (error) {
      console.error('Error finishing service:', error);
      addNotification('Erreur', 'Impossible de terminer le service', 'error');
    }
  }, [setServices, addNotification]);

  // Enhanced export functionality
  const exportToCSV = useCallback(() => {
    try {
      const headers = [
        'Date', 'Plaque', 'Type Plaque', 'Type Véhicule', 'Marque', 'Modèle', 'Couleur',
        'Service', 'Staff', 'Prix (DT)', 'Téléphone', 'Notes', 'Durée (min)', 'Statut', 'Créé le', 'Modifié le'
      ];
      
      const csvData = filteredServices.map(service => [
        service.date || '',
        service.licensePlate || '',
        service.plateType === 'tunisienne' ? 'Tunisienne' : 'Internationale',
        service.vehicleType || '',
        service.vehicleBrand || '',
        service.vehicleModel || '',
        service.vehicleColor || '',
        serviceConfig[service.serviceType]?.name || service.serviceType || '',
        Array.isArray(service.staff) ? service.staff.join(' + ') : '',
        service.totalPrice || 0,
        service.phone || '',
        service.notes || '',
        service.totalDuration ? Math.floor(service.totalDuration / 60) : 0,
        service.isActive ? 'En cours' : service.completed ? 'Terminé' : 'Non démarré',
        service.createdAt || '',
        service.updatedAt || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `jouini_luxury_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      localStorage.setItem('jouini_last_export', new Date().toISOString());
      addNotification('Export Réussi', 'Données luxury exportées avec succès', 'success');
    } catch (error) {
      console.error('Export error:', error);
      addNotification('Erreur Export', 'Impossible d\'exporter les données', 'error');
    }
  }, [filteredServices, serviceConfig, addNotification]);

  return {
    services,
    setServices,
    serviceConfig,
    setServiceConfig,
    filteredServices,
    showServiceForm,
    setShowServiceForm,
    editingService,
    setEditingService,
    searchTerm,
    setSearchTerm,
    filterVehicleType,
    setFilterVehicleType,
    filterStaff,
    setFilterStaff,
    filterServiceType,
    setFilterServiceType,
    filterBrand,
    setFilterBrand,
    dateRange,
    setDateRange,
    handleCreateService,
    handleEditService,
    handleDeleteService,
    exportToCSV,
    finishService
  };
}; 