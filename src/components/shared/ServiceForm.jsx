import { useSecureLocalStorage } from '../../hooks/useSecureLocalStorages';
import { useNotifications } from '../../hooks/useNotifications1';
import { 
  Car, Truck, Calendar, Download, Plus, CheckCircle, Edit3, Trash2, Filter, Search, 
  Moon, Sun, Settings, Home, History, Brain, Users, Zap, AlertCircle, Star, Target, 
  Award, Phone, Eye, EyeOff, Save, X, ChevronDown, FileText, Camera, Upload, 
  PieChart, Activity, Gauge, Coins, Bell, Clock, TrendingUp, BarChart3, Shield,
  LogOut, User, Wifi, WifiOff, RefreshCw, ExternalLink, Copy, Share2, Globe,
  MapPin, Palette, Sparkles, Crown, Diamond, Heart, Flame, Layers, Database,
  DollarSign, Mic, MicOff, ArrowUp, ArrowDown, MessageCircle, Bot, Calculator,
  Receipt, FileBarChart, Banknote, CreditCard, Wallet, TrendingDown, LineChart,
  Lightbulb, Menu, ChevronRight, Maximize2, Minimize2, Timer, ChevronLeft, Image,
  Percent, TrendingUpIcon
} from 'lucide-react';
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
import { SERVICE_TYPES, STAFF_MEMBERS, VEHICLE_TYPES, ALL_BRANDS, VEHICLE_COLORS } from '../../utils/configs';
import { sanitizeInput, validateLicensePlate, validatePhone, isValidDate, safeParseNumber } from '../../utils/validation';
import config from '../../config.local';
import { getCurrentDateString } from '../../utils/dateUtils';
import { isDateBeforeToday } from '../../utils/dateUtils';
// ENHANCED VEHICLE_TYPES with TAXI
const ENHANCED_VEHICLE_TYPES = {
  ...VEHICLE_TYPES,
  taxi: {
    name: 'Taxi',
    icon: '🚕',
    color: 'yellow',
    description: 'Véhicule taxi professionnel'
  }
};

// EXACTLY 4 SERVICES as requested
// SINGLE SOURCE OF TRUTH - FINAL PRICES
const REORDERED_SERVICE_TYPES = {
  'lavage-ville': {
    name: 'Lavage Ville',
    description: 'Intérieur complet + Extérieur standard',
    icon: '🚗',
    color: 'blue',
    basePrice: 15, // ← FIXED: Added missing basePrice
    features: ['Intérieur complet', 'Extérieur standard', 'Aspirateur', 'Lavage carrosserie']
  },
  'interieur': {
    name: 'Intérieur',
    description: 'Nettoyage intérieur uniquement',
    icon: '🧽',
    color: 'green',
    basePrice: 8, // ← FIXED: Added missing basePrice (matches your screenshot)
    features: ['Aspirateur', 'Nettoyage sièges', 'Tableau de bord', 'Vitres intérieures']
  },
  'exterieur': {
    name: 'Extérieur',
    description: 'Lavage extérieur uniquement',
    icon: '🚿',
    color: 'purple',
    basePrice: 8, // ← FIXED: Added missing basePrice (matches your screenshot)
    features: ['Lavage carrosserie', 'Rinçage', 'Séchage', 'Pneus']
  },
  'complet-premium': {
    name: 'Complet Premium',
    description: 'Service complet premium avec finitions spéciales',
    icon: '⭐',
    color: 'gold',
    basePrice: 60, // ← FIXED: Added missing basePrice
    features: ['Tout inclus', 'Cire protection', 'Détailing', 'Parfum intérieur']
  }
};

// UPDATED PROFESSIONAL STAFF MEMBERS
const UPDATED_STAFF_MEMBERS = {
  ...STAFF_MEMBERS,
  bilal: {
    ...STAFF_MEMBERS.bilal,
    emoji: null, // Remove emoji
    icon: User // Use Lucide User icon
  },
  ayoub: {
    ...STAFF_MEMBERS.ayoub,
    emoji: null, // Remove emoji
    icon: User // Use Lucide User icon
  }
};

const AppleLuxuryServiceForm = React.memo(({ 
  onSubmit, 
  existingService, 
  onCancel, 
  theme, 
  addNotification,
  serviceConfig // ADD serviceConfig prop to get prices from settings
}) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  const [showTaxiMode, setShowTaxiMode] = useState(false);
  const [formData, setFormData] = useState(() => existingService || {
    licensePlate: '',
    plateType: 'tunisienne',
    vehicleType: 'voiture',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleColor: '',
    serviceType: 'lavage-ville', // Default to most common service
    staff: [],
    date: getCurrentDateString(),
    phone: '',
    notes: '',
    photos: [],
    priceAdjustment: 0, // ADD PRICE ADJUSTMENT FIELD
    // NEW TIMER FIELDS
    timeStarted: null,
    timeFinished: null,
    totalDuration: 0,
    staffDurations: {}, // Track individual staff time
    isActive: false
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  
  // Memoized filtered brands for performance
  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return ALL_BRANDS;
    const searchTerm = brandSearch.toLowerCase().trim();
    return ALL_BRANDS.filter(brand => 
      brand.toLowerCase().includes(searchTerm)
    );
  }, [brandSearch]);
  
  // FIXED price calculation using serviceConfig from settings + manual adjustment
  // Add this temporarily to debug

  const calculatePrice = useCallback(() => {
  try {
    // Priority 1: Try serviceConfig first
    let service = serviceConfig && serviceConfig[formData.serviceType];
    
    // Priority 2: Map serviceConfig keys (for the key mismatch issue)
    if (!service) {
      const keyMapping = {
        'lavage-ville': 'interieur-exterieur',
        'interieur': 'interieur',
        'exterieur': 'exterieur',
        'complet-premium': 'complet'
      };
      const mappedKey = keyMapping[formData.serviceType];
      if (mappedKey && serviceConfig) {
        service = serviceConfig[mappedKey];
      }
    }
    
    // Priority 3: Fallback to REORDERED_SERVICE_TYPES (our source of truth)
    if (!service) {
      service = REORDERED_SERVICE_TYPES[formData.serviceType];
    }
    
    // Priority 4: Hard-coded fallback as last resort
    if (!service) {
      const hardcodedPrices = {
        'lavage-ville': 15,
        'interieur': 8,
        'exterieur': 8,
        'complet-premium': 60
      };
      service = { basePrice: hardcodedPrices[formData.serviceType] || 0 };
    }
    
    const basePrice = (service?.basePrice ?? service?.price ?? 0);
    const adjustment = parseFloat(formData.priceAdjustment) || 0;
    const total = Math.max(0, basePrice + adjustment);
    
    
    return total;
  } catch (error) {
    console.error('Error calculating price:', error);
    return 0;
  }
}, [formData.serviceType, formData.priceAdjustment, serviceConfig]);
  // Get base price for display from settings
  const getBasePrice = useCallback(() => {
  try {
    // Same priority system as calculatePrice
    let service = serviceConfig && serviceConfig[formData.serviceType];
    
    if (!service) {
      const keyMapping = {
        'lavage-ville': 'interieur-exterieur',
        'interieur': 'interieur',
        'exterieur': 'exterieur',
        'complet-premium': 'complet'
      };
      const mappedKey = keyMapping[formData.serviceType];
      if (mappedKey && serviceConfig) {
        service = serviceConfig[mappedKey];
      }
    }
    
    if (!service) {
      service = REORDERED_SERVICE_TYPES[formData.serviceType];
    }
    
    if (!service) {
      const hardcodedPrices = {
        'lavage-ville': 25,
        'interieur': 20,
        'exterieur': 15,
        'complet-premium': 45
      };
      return hardcodedPrices[formData.serviceType] || 0;
    }
    
    return service.basePrice || service.price || 0;
  } catch (error) {
    console.error('Error getting base price:', error);
    return 0;
  }
}, [formData.serviceType, serviceConfig]);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    
    // License plate validation
    if (!formData.licensePlate.trim()) {
      errors.licensePlate = 'La plaque d\'immatriculation est obligatoire';
    } else if (!validateLicensePlate(formData.licensePlate, formData.plateType)) {
      errors.licensePlate = 'Format de plaque invalide';
    }
    
    // Staff validation
    if (!Array.isArray(formData.staff) || formData.staff.length === 0) {
      errors.staff = 'Au moins un membre du staff doit être assigné';
    }
    
    // Date validation
    if (!isValidDate(formData.date)) {
      errors.date = 'Date invalide';
    }
    
    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Format de téléphone invalide';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // ✅ UPDATED - Cloudinary photo upload function with authentication
  const handlePhotoCapture = useCallback(async (event, source = 'camera') => {
    try {
      setIsPhotoUploading(true);
      const files = event.target.files;
      
      if (!files || files.length === 0) {
        setIsPhotoUploading(false);
        return;
      }
      
      const fileArray = Array.from(files);
      
      // Limit number of photos
      const maxPhotos = 5;
      const currentPhotoCount = formData.photos.length;
      const availableSlots = maxPhotos - currentPhotoCount;
      
      if (availableSlots <= 0) {
        addNotification('Limite atteinte', `Maximum ${maxPhotos} photos autorisées`, 'warning');
        setIsPhotoUploading(false);
        return;
      }
      
      const filesToProcess = fileArray.slice(0, availableSlots);
      
      // Validate and prepare files for upload
      const formDataToUpload = new FormData();
      filesToProcess.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          addNotification('Fichier invalide', `${file.name} n'est pas une image`, 'warning');
          return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          addNotification('Fichier trop volumineux', `${file.name} dépasse 10MB`, 'warning');
          return;
        }
        
        formDataToUpload.append('photos', file);
      });
      
      // Get authentication token (adjust this based on how you store tokens)
      const token = localStorage.getItem('auth_token');
      
      // Upload to Cloudinary via your API
      const response = await fetch(config.API_ENDPOINTS.UPLOAD, {
  method: 'POST',
  headers: {
    ...(token && { 'Authorization': `Bearer ${token}` })
  },
  body: formDataToUpload
});
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }
      
      const uploadResult = await response.json();
      
      // Use Cloudinary URLs instead of base64
      const newPhotos = uploadResult.files.map(file => file.url);
      
      if (newPhotos.length > 0) {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, ...newPhotos]
        }));
        addNotification(
          'Photos ajoutées', 
          `${newPhotos.length} photo(s) uploadée(s) sur Cloudinary depuis ${source === 'camera' ? 'l\'appareil' : 'la galerie'}`,
          'success'
        );
      }
      
    } catch (error) {
      console.error(`Error uploading photos:`, error);
      addNotification('Erreur upload', `Impossible d'uploader les photos: ${error.message}`, 'error');
    } finally {
      setIsPhotoUploading(false);
      
      // Reset input values
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  }, [formData.photos.length, addNotification]);

  // NEW: Initialize timer when service is created
  const initializeTimer = useCallback(() => {
  const selectedDate = formData.date || getCurrentDateString();
  const isPastDate = isDateBeforeToday(selectedDate);
  const now = new Date().toISOString();
  
  // Initialize staff durations
  const staffDurations = {};
  formData.staff.forEach(staffId => {
    staffDurations[staffId] = {
      startTime: now,
      totalTime: isPastDate ? 2700 : 0,
      isActive: !isPastDate
    };
  });

  if (isPastDate) {
    // Auto-complete old data
    const estimatedDuration = 2700; // 45 minutes
    const startTime = new Date(selectedDate + 'T09:00:00').toISOString();
    const endTime = new Date(new Date(startTime).getTime() + (estimatedDuration * 1000)).toISOString();
    
    return {
      timeStarted: startTime,
      timeFinished: endTime,
      totalDuration: estimatedDuration,
      staffDurations,
      isActive: false
    };
  } else {
    return {
      timeStarted: now,
      timeFinished: null,
      totalDuration: 0,
      staffDurations,
      isActive: true
    };
  }
}, [formData.staff, formData.date]);

  // Form submission with enhanced error handling and TIMER INITIALIZATION
  const handleSubmit = useCallback(async () => {
    try {
      if (!validateForm()) {
        addNotification('Validation', 'Veuillez corriger les erreurs du formulaire', 'warning');
        return;
      }
      
      setIsSubmitting(true);
      
      // Initialize timer data for new services
      const timerData = !existingService ? initializeTimer() : {};

      // Sanitize form data
     const sanitizedData = {
  ...formData,
  ...timerData,
  id: existingService?.id || `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  licensePlate: sanitizeInput(formData.licensePlate.toUpperCase(), 20),
  vehicleModel: sanitizeInput(formData.vehicleModel, 50),
  phone: sanitizeInput(formData.phone, 20),
  notes: sanitizeInput(formData.notes, 1000),
  totalPrice: calculatePrice(),
  priceAdjustment: parseFloat(formData.priceAdjustment) || 0,
  // 🚨 FIX: Don't force today's date if user selected a specific date
 date: (() => {
  const finalDate = formData.date || getCurrentDateString();

  return finalDate;
})(),
  createdAt: existingService?.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
completed: existingService?.completed || isDateBeforeToday(formData.date || getCurrentDateString()),  motoDetails: formData.motoDetails || {}
};

      // Simulate async operation
      // Get authentication token
onSubmit(sanitizedData);



      addNotification(
        'Succès',
        `${existingService ? 'Service modifié' : 'Service créé et timer démarré'} : ${formData.licensePlate}`,
        'success'
      );
    } catch (error) {
      console.error('Error submitting form:', error);
      addNotification('Erreur', 'Impossible de sauvegarder le service', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, existingService, validateForm, calculatePrice, onSubmit, addNotification, initializeTimer]);

  // Update form field with validation
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific validation error when field is updated
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Remove photo handler
  const removePhoto = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  }, []);

  // NEW: Handle taxi mode toggle
  const handleTaxiMode = useCallback(() => {
    setShowTaxiMode(true);
    updateFormField('vehicleType', 'taxi');
    updateFormField('vehicleColor', 'yellow'); // Default taxi color
    updateFormField('vehicleBrand', 'Taxi'); // Default brand for taxi
  }, [updateFormField]);

  // NEW: Get taxi-specific colors
  const getTaxiColors = useMemo(() => [
    { value: 'yellow', name: 'Jaune Standard', hex: '#FFD700' },
    { value: 'white', name: 'Blanc', hex: '#FFFFFF' },
    { value: 'red', name: 'Rouge', hex: '#DC2626' },
    { value: 'white-red', name: 'Blanc et Rouge', hex: 'linear-gradient(45deg, #FFFFFF 50%, #DC2626 50%)' }
  ], []);

  // Get vehicle color styles - Enhanced for taxi
  const getVehicleTypeStyles = (key, isSelected) => {
    const vehicle = ENHANCED_VEHICLE_TYPES[key];
    if (!vehicle) return '';
    
    const colorMap = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-gray-300 hover:border-blue-400',
        bg: isSelected ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20' : '',
        text: isSelected ? 'text-blue-700 font-semibold' : ''
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-gray-300 hover:border-green-400',
        bg: isSelected ? 'bg-gradient-to-r from-green-500/20 to-green-600/20' : '',
        text: isSelected ? 'text-green-700 font-semibold' : ''
      },
      orange: {
        border: isSelected ? 'border-orange-500' : 'border-gray-300 hover:border-orange-400',
        bg: isSelected ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20' : '',
        text: isSelected ? 'text-orange-700 font-semibold' : ''
      },
      yellow: {
        border: isSelected ? 'border-yellow-500' : 'border-gray-300 hover:border-yellow-400',
        bg: isSelected ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20' : '',
        text: isSelected ? 'text-yellow-700 font-semibold' : ''
      }
    };
    
    const colors = colorMap[vehicle.color] || colorMap.blue;
    return `${colors.border} ${colors.bg} ${colors.text}`;
  };

  // Get service type styles - Fixed color handling for reordered services
  const getServiceTypeStyles = (key, isSelected) => {
    const service = REORDERED_SERVICE_TYPES[key];
    if (!service) return '';
    
    const colorMap = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-gray-300 hover:border-blue-400',
        bg: isSelected ? 'bg-gradient-to-r from-blue-500/15 to-blue-600/15' : '',
        text: isSelected ? 'text-blue-700 font-semibold' : '',
        features: isSelected ? 'bg-blue-500/30 text-blue-700 border border-blue-500/40' : 'bg-gray-100 text-gray-600'
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-gray-300 hover:border-green-400',
        bg: isSelected ? 'bg-gradient-to-r from-green-500/15 to-green-600/15' : '',
        text: isSelected ? 'text-green-700 font-semibold' : '',
        features: isSelected ? 'bg-green-500/30 text-green-700 border border-green-500/40' : 'bg-gray-100 text-gray-600'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-gray-300 hover:border-purple-400',
        bg: isSelected ? 'bg-gradient-to-r from-purple-500/15 to-purple-600/15' : '',
        text: isSelected ? 'text-purple-700 font-semibold' : '',
        features: isSelected ? 'bg-purple-500/30 text-purple-700 border border-purple-500/40' : 'bg-gray-100 text-gray-600'
      },
      gold: {
        border: isSelected ? 'border-yellow-500' : 'border-gray-300 hover:border-yellow-400',
        bg: isSelected ? 'bg-gradient-to-r from-yellow-500/15 to-yellow-600/15' : '',
        text: isSelected ? 'text-yellow-700 font-semibold' : '',
        features: isSelected ? 'bg-yellow-500/30 text-yellow-700 border border-yellow-500/40' : 'bg-gray-100 text-gray-600'
      },
      orange: {
    border: isSelected ? 'border-orange-500' : 'border-gray-300 hover:border-orange-400',
    bg: isSelected ? 'bg-gradient-to-r from-orange-500/15 to-orange-600/15' : '',
    text: isSelected ? 'text-orange-700 font-semibold' : '',
    features: isSelected ? 'bg-orange-500/30 text-orange-700 border border-orange-500/40' : 'bg-gray-100 text-gray-600'
  }
    };
    
    return colorMap[service.color] || colorMap.blue;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[60] p-2 overflow-y-auto"
         style={{ backdropFilter: 'blur(16px)' }}
         role="dialog"
         aria-modal="true"
         aria-labelledby="form-title">
      
      {/* Compact Modal Container */}
      <div className={`${currentTheme.modal} rounded-2xl w-full max-w-5xl shadow-xl transform transition-all duration-300 my-4`}
           style={{ 
             backdropFilter: 'blur(20px)',
             background: theme === 'dark' 
               ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.92) 100%)' 
               : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 100%)',
             border: theme === 'dark' 
               ? '1px solid rgba(59, 130, 246, 0.2)' 
               : '1px solid rgba(99, 102, 241, 0.15)'
           }}>
        
        {/* Compact Header with TAXI BUTTON */}
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 p-3 border-b border-white/15 backdrop-blur-xl rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
                <Car className="text-white" size={18} />
              </div>
              <div>
                <h2 id="form-title" className={`text-lg font-bold ${currentTheme.text}`}>
                  {existingService ? 'Modifier Service' : 'Nouveau Service'}
                  {formData.vehicleType === 'taxi' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-yellow-500 text-black rounded-full font-bold">
                      🚕 TAXI
                    </span>
                  )}
                </h2>
                <p className={`${currentTheme.textSecondary} text-xs flex items-center space-x-1`}>
                  <Sparkles size={12} className="text-yellow-500" />
                  <span>Interface Premium • Cloudinary Storage</span>
                  {!existingService && (
                    <>
                      <Timer size={12} className="text-green-500 ml-2" />
                      <span className="text-green-600 font-medium">Timer auto-start</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* NEW TAXI BUTTON */}
              {!showTaxiMode && formData.vehicleType !== 'taxi' && (
                <button
                  onClick={handleTaxiMode}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-sm hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 shadow-md"
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">🚕</span>
                    <span>TAXI</span>
                  </div>
                </button>
              )}
              
              <button
                onClick={onCancel}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${currentTheme.glass} ${currentTheme.hover} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                aria-label="Fermer"
              >
                <X size={18} className={currentTheme.text} />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Main Content */}
        <div className="p-4 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left Column - Vehicle Info */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Vehicle Information Card */}
              <div className={`${currentTheme.surface} rounded-xl p-4 border border-gray-200/50 shadow-sm`}>
                <div className="flex items-center space-x-2 mb-3">
                  <Car className="text-blue-500" size={16} />
                  <h3 className={`text-sm font-bold ${currentTheme.text}`}>Informations Véhicule</h3>
                </div>
                
                {/* Plate Type Selection - Compact */}
                <div className="space-y-2 mb-4">
                  <label className={`block text-xs font-medium ${currentTheme.textSecondary} uppercase`}>
                    Type de plaque *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'tunisienne', label: 'Tunisienne', flag: '🇹🇳' },
                      { key: 'internationale', label: 'Internationale', flag: '🌍' }
                    ].map(type => (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => {
                          updateFormField('plateType', type.key);
                          updateFormField('licensePlate', '');
                        }}
                        className={`relative p-2 rounded-lg border transition-all duration-200 text-xs font-medium transform hover:scale-105 ${
                          formData.plateType === type.key
                            ? `border-blue-500 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 shadow-md ${currentTheme.glow}`
                            : `border-gray-300 ${currentTheme.surface} hover:border-blue-300 hover:shadow-sm`
                        }`}
                      >
                        <div className="text-center space-y-1">
                          <div className="text-lg transform transition-transform duration-200 group-hover:scale-110">{type.flag}</div>
                          <div className={formData.plateType === type.key ? 'text-blue-700 font-semibold' : currentTheme.text}>{type.label}</div>
                        </div>
                        {formData.plateType === type.key && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle size={10} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* License Plate - Compact */}
                <div className="space-y-2 mb-4">
                  <label htmlFor="licensePlate" className={`block text-xs font-medium ${currentTheme.textSecondary} uppercase`}>
                    Plaque d'immatriculation *
                  </label>
                  <input
                    id="licensePlate"
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => updateFormField('licensePlate', e.target.value.toUpperCase())}
                    placeholder={formData.plateType === 'tunisienne' ? '123 TUN 4567' : 'ABC-1234'}
                    className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${
                      validationErrors.licensePlate ? 'border-red-500' : currentTheme.border
                    } ${currentTheme.text} placeholder-gray-400 text-sm font-mono text-center transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500`}
                    required
                  />
                  {validationErrors.licensePlate && (
                    <p className="text-red-500 text-xs flex items-center space-x-1">
                      <AlertCircle size={12} />
                      <span>{validationErrors.licensePlate}</span>
                    </p>
                  )}
                </div>

                {/* Vehicle Type - Enhanced with TAXI */}
                <div className="space-y-2 mb-4">
                  <label className={`block text-xs font-medium ${currentTheme.textSecondary} uppercase`}>
                    Type de véhicule
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(ENHANCED_VEHICLE_TYPES).map(([key, vehicle]) => {
                      const isSelected = formData.vehicleType === key;
                      const styles = getVehicleTypeStyles(key, isSelected);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            updateFormField('vehicleType', key);
                            if (key === 'taxi') {
                              setShowTaxiMode(true);
                              updateFormField('vehicleBrand', 'Taxi');
                              updateFormField('vehicleColor', 'yellow');
                            } else {
                              setShowTaxiMode(false);
                              updateFormField('vehicleBrand', '');
                              updateFormField('vehicleModel', '');
                            }
                          }}
                          className={`relative p-2 rounded-lg border transition-all duration-200 transform hover:scale-105 ${styles} ${currentTheme.surface} hover:shadow-md hover:bg-white/10`}
                        >
                          <div className="text-center space-y-1">
                            <div className="text-lg transform transition-transform duration-200 hover:scale-125">{vehicle.icon}</div>
                            <p className={`text-xs font-medium ${isSelected ? getVehicleTypeStyles(key, true).split(' ').find(c => c.includes('text-')) || currentTheme.text : currentTheme.text}`}>
                              {vehicle.name}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle size={10} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vehicle Brand - Enhanced for TAXI */}
                {((formData.vehicleType === 'voiture' && !showTaxiMode) || (formData.vehicleType === 'taxi' && showTaxiMode)) && (
                  <div className="relative space-y-2 mb-4">
                    <label className={`block text-xs font-medium ${currentTheme.textSecondary} uppercase`}>
                      {formData.vehicleType === 'taxi' ? 'Compagnie de Taxi' : 'Marque'}
                    </label>
                    {formData.vehicleType === 'taxi' ? (
                      <input
                        type="text"
                        value={formData.vehicleBrand}
                        onChange={(e) => updateFormField('vehicleBrand', e.target.value)}
                        placeholder="Ex: Taxi Jaune, Taxi Plus..."
                        className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} placeholder-gray-400 text-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500`}
                        maxLength={50}
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                          className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} text-left flex items-center justify-between text-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/30`}
                        >
                          <span className="flex items-center space-x-2">
                            <Star size={12} className={formData.vehicleBrand ? 'text-yellow-500' : 'text-gray-400'} />
                            <span>{formData.vehicleBrand || 'Sélectionner'}</span>
                          </span>
                          <ChevronDown size={14} className={`transition-transform duration-200 ${showBrandDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showBrandDropdown && (
                          <div className={`absolute top-full left-0 right-0 mt-1 ${currentTheme.modal} rounded-lg shadow-lg z-50 border`}>
                            <div className="p-2 border-b">
                              <div className="relative">
                                <Search size={14} className="absolute left-2 top-2 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Rechercher..."
                                  value={brandSearch}
                                  onChange={(e) => setBrandSearch(e.target.value)}
                                  className={`w-full pl-7 pr-2 py-1 rounded ${currentTheme.glass} text-xs border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30`}
                                />
                              </div>
                            </div>
                            <div className="max-h-32 overflow-y-auto">
                              {filteredBrands.map(brand => (
                                <button
                                  key={brand}
                                  onClick={() => {
                                    updateFormField('vehicleBrand', brand);
                                    setShowBrandDropdown(false);
                                    setBrandSearch('');
                                  }}
                                  className={`w-full px-3 py-1 text-left hover:bg-white/10 hover:text-blue-600 text-xs ${currentTheme.text} transition-colors duration-150`}
                                >
                                  {brand}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Vehicle Model & Color - Enhanced for TAXI */}
                <div className="grid grid-cols-2 gap-3">
                  {formData.vehicleBrand && (
                    <div className="space-y-2">
                      <label className={`block text-xs font-medium ${currentTheme.textSecondary} uppercase`}>
                        {formData.vehicleType === 'taxi' ? 'Numéro Taxi' : 'Modèle'}
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleModel}
                        onChange={(e) => updateFormField('vehicleModel', e.target.value)}
                        placeholder={formData.vehicleType === 'taxi' ? 'Ex: T-1234' : 'Ex: A4, Serie 3...'}
                        className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} placeholder-gray-400 text-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500`}
                        maxLength={50}
                      />
                    </div>
                  )}

                  {/* Enhanced Color Picker for TAXI */}
                  <div className="space-y-2">
                    <label className={`block text-xs font-medium ${currentTheme.textSecondary} uppercase`}>
                      Couleur
                    </label>
                    <select
                      value={formData.vehicleColor}
                      onChange={(e) => updateFormField('vehicleColor', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} text-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer`}
                      style={{
                        colorScheme: theme === 'dark' ? 'dark' : 'light'
                      }}
                    >
                      <option value="">Sélectionner une couleur</option>
                      {(formData.vehicleType === 'taxi' ? getTaxiColors : VEHICLE_COLORS).map(color => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                    {formData.vehicleColor && (
                      <div className="flex items-center space-x-2 mt-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                          style={{ 
                            backgroundColor: formData.vehicleType === 'taxi' 
                              ? getTaxiColors.find(c => c.value === formData.vehicleColor)?.hex
                              : VEHICLE_COLORS.find(c => c.value === formData.vehicleColor)?.hex 
                          }}
                        />
                        <span className="text-xs text-gray-600">
                          {formData.vehicleType === 'taxi' 
                            ? getTaxiColors.find(c => c.value === formData.vehicleColor)?.name
                            : VEHICLE_COLORS.find(c => c.value === formData.vehicleColor)?.name
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Phone - Compact Row */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="space-y-2">
                    <label className={`block text-xs font-medium ${currentTheme.textSecondary} uppercase`}>
                      Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => updateFormField('date', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} text-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer`}
                        style={{
                          colorScheme: theme === 'dark' ? 'dark' : 'light'
                        }}
                        required
                      />
                      <Calendar size={14} className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${currentTheme.textSecondary} pointer-events-none`} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-xs font-medium ${currentTheme.textSecondary} uppercase`}>
                      Téléphone
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormField('phone', e.target.value)}
                        placeholder="+216 XX XXX XXX"
                        className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} placeholder-gray-400 text-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500`}
                      />
                      <Phone size={14} className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${currentTheme.textSecondary} pointer-events-none`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ UPDATED Photos Section - Cloudinary Integration */}
              <div className={`${currentTheme.surface} rounded-xl p-4 border border-gray-200/50 shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Camera className="text-purple-500" size={16} />
                    <h3 className={`text-sm font-bold ${currentTheme.text}`}>Photos Cloudinary (max 5)</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{formData.photos.length}/5</span>
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* CAMERA BUTTON - Opens camera */}
                  <button
                    type="button"
                    onClick={() => {
                      if (cameraInputRef.current) {
                        cameraInputRef.current.click();
                      }
                    }}
                    disabled={isPhotoUploading || formData.photos.length >= 5}
                    className="relative p-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center space-x-1 transition-all duration-200 transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    {isPhotoUploading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Camera size={14} className="group-hover:scale-110 transition-transform duration-200" />
                    )}
                    <span className="relative z-10">{isPhotoUploading ? 'Upload...' : 'Appareil'}</span>
                  </button>
                  
                  {/* GALLERY BUTTON - Opens photo gallery */}
                  <button
                    type="button"
                    onClick={() => {
                      if (galleryInputRef.current) {
                        galleryInputRef.current.click();
                      }
                    }}
                    disabled={isPhotoUploading || formData.photos.length >= 5}
                    className="relative p-2 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center space-x-1 transition-all duration-200 transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-green-500/50 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    {isPhotoUploading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Image size={14} className="group-hover:scale-110 transition-transform duration-200" />
                    )}
                    <span className="relative z-10">{isPhotoUploading ? 'Upload...' : 'Galerie'}</span>
                  </button>
                </div>
                
                {/* CAMERA INPUT - for camera capture */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment" // This forces camera to open
                  onChange={(e) => handlePhotoCapture(e, 'camera')}
                  className="hidden"
                  key="camera-input"
                />
                
                {/* GALLERY INPUT - for gallery selection */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple // Allow multiple selection from gallery
                  onChange={(e) => handlePhotoCapture(e, 'gallery')}
                  className="hidden"
                  key="gallery-input"
                />
                
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo} 
                          alt={`Photo ${index + 1}`} 
                          className="w-full h-16 object-cover rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105" 
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                        >
                          <X size={10} />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded text-center">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Cloudinary Status Indicator */}
                <div className="mt-2 text-center">
                  <span className="text-xs text-purple-600 font-medium">
                    ☁️ Stockage Cloudinary sécurisé
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Service & Staff */}
            <div className="space-y-4">
              
              {/* Service Type Card with EXACTLY 4 SERVICES */}
              <div className={`${currentTheme.surface} rounded-xl p-4 border border-gray-200/50 shadow-sm`}>
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="text-purple-500" size={16} />
                  <h3 className={`text-sm font-bold ${currentTheme.text}`}>Service Premium</h3>
                  {!existingService && (
                    <div className="flex items-center space-x-1 ml-2">
                      <Timer size={12} className="text-green-500" />
                      <span className="text-xs text-green-600">Auto-timer</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {Object.entries(REORDERED_SERVICE_TYPES).map(([key, service]) => {
                    const isSelected = formData.serviceType === key;
                    const styles = getServiceTypeStyles(key, isSelected);
                    // Get price from serviceConfig settings
                    const servicePrice = serviceConfig && serviceConfig[key] ? serviceConfig[key].basePrice : service.basePrice;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateFormField('serviceType', key)}
                        className={`relative w-full p-3 rounded-lg border text-left transition-all duration-200 transform hover:scale-102 ${styles.border} ${styles.bg} ${currentTheme.surface} hover:shadow-md hover:bg-white/5`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2 flex-1">
                            <div className="text-lg transform transition-transform duration-200 hover:scale-110">{service.icon}</div>
                            <div className="flex-1">
                              <h4 className={`font-medium text-sm ${styles.text || currentTheme.text}`}>
                                {service.name}
                              </h4>
                              <p className={`text-xs ${currentTheme.textSecondary} mt-1 leading-relaxed`}>{service.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {service.features.slice(0, 2).map((feature, idx) => (
                                  <span key={idx} className={`text-xs px-2 py-0.5 rounded-full ${styles.features}`}>
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-green-600">{servicePrice} DT</span>
                            <p className="text-xs text-green-600">Prix de base</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Staff Assignment Card with UPDATED PROFESSIONAL EMOJIS */}
              <div className={`${currentTheme.surface} rounded-xl p-4 border border-gray-200/50 shadow-sm`}>
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="text-blue-500" size={16} />
                  <h3 className={`text-sm font-bold ${currentTheme.text}`}>Personnel *</h3>
                  {!existingService && (
                    <div className="flex items-center space-x-1 ml-2">
                      <Timer size={12} className="text-blue-500" />
                      <span className="text-xs text-blue-600">Timer individuel</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {Object.entries(UPDATED_STAFF_MEMBERS).map(([key, staff]) => (
                    <label 
                      key={key} 
                      className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-102 ${
                        formData.staff.includes(key) 
                          ? `${currentTheme.glass} border border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 shadow-sm` 
                          : `${currentTheme.surface} hover:bg-white/5 hover:shadow-md border border-transparent`
                      }`}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.staff.includes(key)}
                          onChange={(e) => {
                            const newStaff = e.target.checked
                              ? [...formData.staff, key]
                              : formData.staff.filter(s => s !== key);
                            updateFormField('staff', newStaff);
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500/30 transition-all duration-200"
                        />
                      </div>
                      <div className="flex items-center space-x-2 flex-1">
                        <User size={16} className="text-blue-600 transform transition-transform duration-200 hover:scale-110" />
                        {staff.emoji && <span className="text-lg transform transition-transform duration-200 hover:scale-110">{staff.emoji}</span>}
                        <div className="flex-1">
                          <span className={`font-medium text-sm transition-colors duration-200 ${
                            formData.staff.includes(key) 
                              ? 'text-blue-700 font-semibold' 
                              : currentTheme.text
                          }`}>{staff.name}</span>
                          <p className="text-xs text-gray-500">Spécialiste certifié</p>
                        </div>
                      </div>
                      {formData.staff.includes(key) && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle size={10} className="text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                {validationErrors.staff && (
                  <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                    <AlertCircle size={12} />
                    <span>{validationErrors.staff}</span>
                  </p>
                )}
              </div>

              {/* Notes Card */}
              <div className={`${currentTheme.surface} rounded-xl p-4 border border-gray-200/50 shadow-sm`}>
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="text-orange-500" size={16} />
                  <h3 className={`text-sm font-bold ${currentTheme.text}`}>Notes</h3>
                </div>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormField('notes', e.target.value)}
                  placeholder="Remarques spéciales..."
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} placeholder-gray-400 resize-none text-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500`}
                  maxLength={1000}
                />
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">{formData.notes.length}/1000</span>
                </div>
              </div>

              {/* ENHANCED PRICE SUMMARY with MANUAL ADJUSTMENT */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border border-green-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 pb-2 border-b border-green-200/50">
                    <Calculator className="text-green-600" size={16} />
                    <span className={`text-sm font-bold ${currentTheme.text}`}>Résumé Facturation</span>
                    {!existingService && (
                      <div className="flex items-center space-x-1 ml-auto">
                        <Timer size={12} className="text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Démarrage auto</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Service Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/60">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium text-gray-700">Service:</span>
                        <span className="text-xs font-semibold text-blue-700">
                          {serviceConfig && serviceConfig[formData.serviceType] 
                            ? serviceConfig[formData.serviceType].name 
                            : REORDERED_SERVICE_TYPES[formData.serviceType]?.name || 'Non sélectionné'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {getBasePrice()} DT
                      </span>
                    </div>
                    
                    {/* PRICE ADJUSTMENT SECTION */}
                    <div className="p-2 rounded-lg bg-white/60">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Percent size={12} className="text-orange-600" />
                          <span className="text-xs font-medium text-gray-700">Ajustement:</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={formData.priceAdjustment || ''}
                          onChange={(e) => updateFormField('priceAdjustment', e.target.value)}
                          placeholder="0"
                          step="0.5"
                          min="-100"
                          max="100"
                          className={`flex-1 px-2 py-1 rounded text-xs border ${currentTheme.border} ${currentTheme.text} text-center`}
                        />
                        <span className="text-xs text-gray-600">DT</span>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => updateFormField('priceAdjustment', (parseFloat(formData.priceAdjustment) || 0) - 5)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => updateFormField('priceAdjustment', (parseFloat(formData.priceAdjustment) || 0) + 5)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                      {formData.priceAdjustment && parseFloat(formData.priceAdjustment) !== 0 && (
                        <div className="mt-1 text-center">
                          <span className={`text-xs font-semibold ${
                            parseFloat(formData.priceAdjustment) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {parseFloat(formData.priceAdjustment) > 0 ? '+' : ''}{parseFloat(formData.priceAdjustment)} DT
                            {parseFloat(formData.priceAdjustment) > 0 ? ' (Supplément)' : ' (Remise)'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Staff Details */}
                    {formData.staff.length > 0 && (
                      <div className="p-2 rounded-lg bg-white/60">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <Users size={12} className="text-purple-600" />
                            <span className="text-xs font-medium text-gray-700">Personnel assigné:</span>
                          </div>
                          <span className="text-xs font-semibold text-purple-700">{formData.staff.length} membre(s)</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {formData.staff.map(staffId => (
                            <span key={staffId} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium flex items-center space-x-1">
                              <User size={10} />
                              <span>{UPDATED_STAFF_MEMBERS[staffId]?.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Vehicle Details */}
                    {formData.licensePlate && (
                      <div className="p-2 rounded-lg bg-white/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Car size={12} className="text-indigo-600" />
                            <span className="text-xs font-medium text-gray-700">Véhicule:</span>
                          </div>
                          <span className="text-xs font-semibold text-indigo-700 font-mono">
                            {formData.licensePlate}
                            {formData.vehicleType === 'taxi' && (
                              <span className="ml-1 text-yellow-600">🚕</span>
                            )}
                          </span>
                        </div>
                        {formData.vehicleBrand && (
                          <div className="mt-1 text-xs text-gray-600">
                            {formData.vehicleBrand} {formData.vehicleModel && `- ${formData.vehicleModel}`}
                            {formData.vehicleColor && (
                              <span className="ml-2 inline-flex items-center space-x-1">
                                <div 
                                  className="w-2 h-2 rounded-full border border-gray-300"
                                  style={{ 
                                    backgroundColor: formData.vehicleType === 'taxi' 
                                      ? getTaxiColors.find(c => c.value === formData.vehicleColor)?.hex
                                      : VEHICLE_COLORS.find(c => c.value === formData.vehicleColor)?.hex 
                                  }}
                                />
                                <span>
                                  {formData.vehicleType === 'taxi' 
                                    ? getTaxiColors.find(c => c.value === formData.vehicleColor)?.name
                                    : VEHICLE_COLORS.find(c => c.value === formData.vehicleColor)?.name
                                  }
                                </span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* PRICING BREAKDOWN */}
                  <div className="border-t border-green-300/50 pt-3 space-y-2">
                    {/* Base Price */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Prix de base:</span>
                      <span className="font-semibold text-green-700">{getBasePrice()} DT</span>
                    </div>
                    
                    {/* Adjustment if any */}
                    {formData.priceAdjustment && parseFloat(formData.priceAdjustment) !== 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Ajustement:</span>
                        <span className={`font-semibold ${
                          parseFloat(formData.priceAdjustment) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {parseFloat(formData.priceAdjustment) > 0 ? '+' : ''}{parseFloat(formData.priceAdjustment)} DT
                        </span>
                      </div>
                    )}
                    
                    {/* Total */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="text-green-700" size={16} />
                        <span className="text-sm font-bold text-green-800">Total Final:</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-700">{calculatePrice()} DT</span>
                        <p className="text-xs text-green-600 font-medium">Prix tout inclus</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Info with Timer */}
                  <div className="flex items-center justify-center space-x-2 text-xs text-green-700 font-medium pt-2">
                    <Shield size={10} />
                    <span>Service premium • Garantie qualité</span>
                    {!existingService && (
                      <>
                        <Timer size={10} className="ml-2" />
                        <span>Timer automatique</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200/50">
            <button
              type="button"
              onClick={onCancel}
              className={`w-full sm:w-auto px-6 py-2 rounded-lg border border-gray-300 ${currentTheme.textSecondary} font-medium text-sm hover:${currentTheme.text} hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500/30`}
            >
              <div className="flex items-center justify-center space-x-2">
                <X size={14} />
                <span>Annuler</span>
              </div>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.licensePlate || formData.staff.length === 0 || isSubmitting}
              className="relative w-full sm:w-auto px-8 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 transform hover:scale-105 hover:shadow-lg disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {isSubmitting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : !existingService ? (
                <>
                  <Timer size={16} className="group-hover:scale-110 transition-transform duration-200" />
                  <span className="relative z-10">Créer & Démarrer</span>
                </>
              ) : (
                <>
                  <Save size={16} className="group-hover:scale-110 transition-transform duration-200" />
                  <span className="relative z-10">Modifier</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AppleLuxuryServiceForm; 
