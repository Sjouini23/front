// utils/dataSafetyUtils.js - Add this new file
// This will fix ALL your NaN and data sync issues

// ✅ SAFE NUMBER CONVERSION - Fixes NaN and weird decimals
export const safeNumber = (value, fallback = 0) => {
  try {
    if (value === null || value === undefined || value === '') return fallback;
    
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    
    // Check for NaN, Infinity, or invalid numbers
    if (!isFinite(parsed) || isNaN(parsed)) return fallback;
    
    // Round to 2 decimal places to fix floating-point precision
    return Math.round(parsed * 100) / 100;
  } catch (error) {
    console.warn('safeNumber conversion error:', { value, error: error.message });
    return fallback;
  }
};

// ✅ SAFE DIVISION - Prevents NaN from division
export const safeDivision = (numerator, denominator, fallback = 0) => {
  const safeNum = safeNumber(numerator);
  const safeDenom = safeNumber(denominator);
  
  if (safeDenom === 0) return fallback;
  
  const result = safeNum / safeDenom;
  return safeNumber(result, fallback);
};

// ✅ SAFE PERCENTAGE CALCULATION
export const safePercentage = (part, total, fallback = 0) => {
  const safePart = safeNumber(part);
  const safeTotal = safeNumber(total);
  
  if (safeTotal === 0) return fallback;
  
  const percentage = (safePart / safeTotal) * 100;
  return safeNumber(percentage, fallback);
};

// ✅ STANDARDIZED SERVICE DATA TRANSFORMATION
export const standardizeServiceData = (rawService) => {
  try {
    if (!rawService || typeof rawService !== 'object') {
      throw new Error('Invalid service data');
    }

    // Core fields with fallbacks
    const standardized = {
      // IDs and identification
      id: rawService.id || rawService._id || null,
      licensePlate: (rawService.immatriculation || rawService.licensePlate || '').toString().trim(),
      
      // Service details
      serviceType: rawService.service_type || rawService.serviceType || 'lavage-ville',
      vehicleType: rawService.vehicle_type || rawService.vehicleType || 'voiture',
      vehicleBrand: rawService.vehicle_brand || rawService.vehicleBrand || '',
      vehicleModel: rawService.vehicle_model || rawService.vehicleModel || '',
      vehicleColor: rawService.vehicle_color || rawService.vehicleColor || '',
      
      // Financial data - USE SAFE CONVERSION
      totalPrice: safeNumber(rawService.price || rawService.totalPrice || rawService.total_price, 0),
      priceAdjustment: safeNumber(rawService.price_adjustment || rawService.priceAdjustment, 0),
      basePrice: safeNumber(rawService.base_price || rawService.basePrice, 0),
      
      // Staff and timing
      staff: Array.isArray(rawService.staff) ? rawService.staff : 
             rawService.staff ? [rawService.staff] : [],
      
      // Dates and timing
      date: rawService.time_started?.split('T')[0] || rawService.created_at?.split('T')[0] || rawService.date || new Date().toISOString().split('T')[0],
      createdAt: rawService.created_at || rawService.createdAt || new Date().toISOString(),
      updatedAt: rawService.updated_at || rawService.updatedAt || new Date().toISOString(),
      
      // Status and completion
      completed: rawService.status === 'completed' || rawService.status === 'termine' || rawService.completed || false,
      isActive: rawService.is_active || rawService.isActive || false,
      
      // Optional fields
      phone: rawService.phone || '',
      notes: rawService.notes || '',
      photos: Array.isArray(rawService.photos) ? rawService.photos : [],
      
      // Timer fields
      timeStarted: rawService.start_time || rawService.timeStarted || null,
      timeFinished: rawService.end_time || rawService.timeFinished || null,
      totalDuration: safeNumber(rawService.duration || rawService.totalDuration, 0),
      status: rawService.status || (rawService.completed ? 'completed' : 'active'),
      // Moto details
      motoDetails: rawService.moto_details || rawService.motoDetails || null
    };

    // Validate critical fields
    if (!standardized.licensePlate) {
      console.warn('Service missing license plate:', rawService);
    }

    // Calculate total price if missing but have base + adjustment
    if (standardized.totalPrice === 0 && (standardized.basePrice > 0 || standardized.priceAdjustment !== 0)) {
      standardized.totalPrice = safeNumber(standardized.basePrice + standardized.priceAdjustment);
    }

    return standardized;
  } catch (error) {
    console.error('Service standardization error:', error);
    return null; // Return null for invalid services
  }
};

// ✅ SAFE ARRAY FILTERING - Remove null/invalid services
export const safeFilterServices = (services) => {
  try {
    if (!Array.isArray(services)) {
      console.warn('Services is not an array:', typeof services);
      return [];
    }

    return services
      .map(service => standardizeServiceData(service))
      .filter(service => service !== null) // Remove failed transformations
      .filter(service => service.licensePlate && service.serviceType); // Must have core data
  } catch (error) {
    console.error('Service filtering error:', error);
    return [];
  }
};

// ✅ SAFE REVENUE CALCULATION
export const calculateSafeRevenue = (services, filters = {}) => {
  try {
    const safeServices = safeFilterServices(services);
    
    // Apply filters if provided
    let filteredServices = safeServices;
    
    if (filters.dateStart || filters.dateEnd) {
      filteredServices = filteredServices.filter(service => {
        const serviceDate = new Date(service.date);
        const startDate = filters.dateStart ? new Date(filters.dateStart) : null;
        const endDate = filters.dateEnd ? new Date(filters.dateEnd) : null;
        
        if (startDate && serviceDate < startDate) return false;
        if (endDate && serviceDate > endDate) return false;
        return true;
      });
    }
    
    if (filters.serviceType && filters.serviceType !== 'all') {
      filteredServices = filteredServices.filter(service => service.serviceType === filters.serviceType);
    }
    
    if (filters.completed !== undefined) {
      filteredServices = filteredServices.filter(service => service.completed === filters.completed);
    }

    // Calculate safe totals
    const totalRevenue = filteredServices.reduce((sum, service) => {
      return sum + safeNumber(service.totalPrice, 0);
    }, 0);
    
    const serviceCount = filteredServices.length;
    const averagePrice = safeDivision(totalRevenue, serviceCount, 0);
    
    return {
      totalRevenue: safeNumber(totalRevenue),
      serviceCount: serviceCount,
      averagePrice: safeNumber(averagePrice),
      services: filteredServices
    };
  } catch (error) {
    console.error('Revenue calculation error:', error);
    return {
      totalRevenue: 0,
      serviceCount: 0,
      averagePrice: 0,
      services: []
    };
  }
};

// ✅ FORMAT CURRENCY SAFELY
export const formatCurrencySafe = (amount, currency = 'DT') => {
  const safeAmount = safeNumber(amount, 0);
  
  // Format with proper decimals only if needed
  if (safeAmount % 1 === 0) {
    return `${safeAmount} ${currency}`;
  } else {
    return `${safeAmount.toFixed(2)} ${currency}`;
  }
};

// ✅ BACKEND DATA TRANSFORMER (use in your useServices hook)
export const transformBackendResponse = (backendServices) => {
  try {
    if (!Array.isArray(backendServices)) {
      console.warn('Backend response is not an array:', typeof backendServices);
      return [];
    }

    console.log('🔄 Transforming backend data:', backendServices.length, 'services');
    
    const transformed = backendServices
      .map((service, index) => {
        try {
          const standardized = standardizeServiceData(service);
          
          if (!standardized) {
            console.warn(`⚠️ Service ${index} failed transformation:`, service);
            return null;
          }
          
          return standardized;
        } catch (transformError) {
          console.error(`❌ Service ${index} transform error:`, transformError);
          return null;
        }
      })
      .filter(service => service !== null);

    console.log('✅ Successfully transformed:', transformed.length, 'services');
    
    // Log any missing data for debugging
    const missingData = transformed.filter(s => s.totalPrice === 0);
    if (missingData.length > 0) {
      console.warn('⚠️ Services with 0 price:', missingData.map(s => s.licensePlate));
    }
    
    return transformed;
  } catch (error) {
    console.error('❌ Backend transformation failed:', error);
    return [];
  }
};

// ✅ VALIDATION FOR FORM DATA BEFORE SENDING
export const validateServiceBeforeSend = (serviceData) => {
  const errors = [];
  
  // Required fields
  if (!serviceData.licensePlate?.trim()) {
    errors.push('License plate is required');
  }
  
  if (!serviceData.serviceType) {
    errors.push('Service type is required');
  }
  
  if (!serviceData.vehicleType) {
    errors.push('Vehicle type is required');
  }
  
  // Price validation
  const price = safeNumber(serviceData.totalPrice);
  if (price < 0) {
    errors.push('Price cannot be negative');
  }
  
  // Transform to safe format for sending
  const safeData = {
    licensePlate: serviceData.licensePlate?.trim() || '',
    serviceType: serviceData.serviceType || 'lavage-ville',
    vehicleType: serviceData.vehicleType || 'voiture',
    totalPrice: safeNumber(serviceData.totalPrice, 0),
    priceAdjustment: safeNumber(serviceData.priceAdjustment, 0),
    vehicleBrand: serviceData.vehicleBrand || '',
    vehicleModel: serviceData.vehicleModel || '',
    vehicleColor: serviceData.vehicleColor || '',
    staff: Array.isArray(serviceData.staff) ? serviceData.staff : [],
    phone: serviceData.phone || '',
    notes: serviceData.notes || '',
    photos: Array.isArray(serviceData.photos) ? serviceData.photos : [],
    motoDetails: serviceData.motoDetails || null,
    date: serviceData.date,
    createdAt: serviceData.createdAt
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    safeData
  };
}; 
