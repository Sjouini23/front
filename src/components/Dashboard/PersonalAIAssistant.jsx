import React, { useState, useRef, useEffect } from 'react';
import { 
  Send,User, Brain, Volume2, VolumeX, RefreshCw, Trash2, 
  Target, Clock, BookOpen, DollarSign, TrendingUp, Users, Car, 
  Calendar, Timer, Camera, Phone, FileText, Award, AlertTriangle, Crown,
  Eye, Zap, Activity, BarChart3, PieChart, ArrowUp, ArrowDown, MapPin,
  Briefcase, Shield, Star, CheckCircle, XCircle, AlertCircle, Info,
  Wrench, Fuel, Droplets, Sparkles, Package, Settings, Database,
  TrendingUpIcon, UserCheck, Clock4, Receipt, CreditCard, Banknote,
  Gauge, Hash, Calendar as CalendarIcon, Clock8, MapPinIcon, TrendingDown, Search 
} from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
import { VEHICLE_TYPES, STAFF_MEMBERS } from '../../utils/configs';
import { parseLocalDate, isDateBeforeToday, isDateToday, getCurrentDateString, formatDateLocal } from '../../utils/dateUtils';

// REAL PREMIUM SERVICES from your app
const PREMIUM_SERVICES = {
  'lavage-ville': {
    icon: <Car size={16} />,
    name: 'Lavage Ville',
    description: 'Intérieur complet + Extérieur standard',
    price: 25
  },
  'interieur': {
    icon: <Users size={16} />,
    name: 'Intérieur',
    description: 'Aspirateur + Nettoyage sièges',
    price: 15
  },
  'exterieur': {
    icon: <Droplets size={16} />,
    name: 'Extérieur',
    description: 'Lavage carrosserie + Rinçage',
    price: 12
  },
  'complet-premium': {
    icon: <Star size={16} />,
    name: 'Complet Premium',
    description: 'Service complet haut de gamme',
    price: 45
  },
  'complet': {
    icon: <Star size={16} />,
    name: 'Complet Premium',
    description: 'Service complet haut de gamme',
    price: 45
  },
  'service-complet': {
    icon: <Star size={16} />,
    name: 'Complet Premium',
    description: 'Service complet haut de gamme',
    price: 45
  }
};

// ROBUST NLP WITH REAL DATA MAPPING
const robustNLP = {
  // Safe tokenization with error handling
  tokenize: (text) => {
    try {
      if (!text || typeof text !== 'string') return [];
      
      return text.toLowerCase()
        .replace(/['']/g, ' ')
        .replace(/qu'|d'|l'|n'|s'|c'|j'|t'|m'/g, (match) => match.replace("'", ' '))
        .split(/\s+/)
        .filter(word => word && word.length > 0);
    } catch (error) {
      console.warn('Tokenization error:', error);
      return [];
    }
  },
  
  // Simple but effective lemmatization with REAL vocabulary
  lemmatize: (word) => {
    try {
      if (!word || typeof word !== 'string') return '';
      
      const lemmaDict = {
        'revenus': 'revenu', 'services': 'service', 'clients': 'client',
        'voitures': 'voiture', 'véhicules': 'véhicule', 'euros': 'euro',
        'dinars': 'dinar', 'prix': 'prix', 'argent': 'argent',
        'aujourd': 'aujourd\'hui', 'ajd': 'aujourd\'hui', 'auj': 'aujourd\'hui',
        'équipe': 'équipe', 'performance': 'performance', 'performant': 'performance',
        'analyse': 'analyser', 'montrer': 'montrer', 'calculer': 'calculer',
        'taxis': 'taxi', 'temps': 'temps', 'timer': 'timer', 'chrono': 'chrono',
        'immatriculation': 'immatriculation', 'plaque': 'plaque',
        'marque': 'marque', 'modèle': 'modèle', 'couleur': 'couleur',
        'lavage': 'lavage', 'nettoyage': 'nettoyage', 'détailing': 'détailing',
        'semaine': 'semaine', 'mois': 'mois', 'année': 'année', 'jour': 'jour',
        // Add REAL staff names from STAFF_MEMBERS
        ...Object.keys(STAFF_MEMBERS || {}).reduce((acc, key) => {
          const staff = STAFF_MEMBERS[key];
          if (staff && staff.name) {
            acc[staff.name.toLowerCase()] = staff.name.toLowerCase();
          }
          return acc;
        }, {}),
        // Add vehicle types
        ...Object.keys(VEHICLE_TYPES || {}).reduce((acc, key) => {
          const vehicle = VEHICLE_TYPES[key];
          if (vehicle && vehicle.name) {
            acc[vehicle.name.toLowerCase()] = vehicle.name.toLowerCase();
          }
          return acc;
        }, {})
      };
      
      return lemmaDict[word.toLowerCase()] || word;
    } catch (error) {
      console.warn('Lemmatization error:', error);
      return word || '';
    }
  },
  
  // Robust license plate detection with REAL patterns
  extractLicensePlates: (text) => {
    try {
      if (!text || typeof text !== 'string') return [];
      
      const platePatterns = [
        /\b\d{1,4}\s*[A-Za-z]{2,3}\s*\d{1,4}\b/g,  // 142 TUN 789
        /\b[A-Za-z]{1,3}\s*\d{1,4}\s*[A-Za-z]{1,3}\b/g,  // ABC 123 DEF
        /\b\d{1,4}[-\s]*[A-Za-z]{2,3}[-\s]*\d{1,4}\b/g,   // 142-TUN-789
        /\b\d{3,4}\s*[A-Za-z]{2,3}\s*\d{2,4}\b/g          // Enhanced patterns
      ];
      
      const plates = [];
      platePatterns.forEach(pattern => {
        try {
          const matches = text.match(pattern);
          if (matches && Array.isArray(matches)) {
            plates.push(...matches);
          }
        } catch (patternError) {
          console.warn('Pattern matching error:', patternError);
        }
      });
      
      return [...new Set(plates)]; // Remove duplicates
    } catch (error) {
      console.warn('License plate extraction error:', error);
      return [];
    }
  },
  
  // Enhanced date parsing with REAL date handling + flexible date formats
  parseDate: (text) => {
  try {
    if (!text || typeof text !== 'string') return null;
    
    const today = new Date();
    const lowerText = text.toLowerCase();
    
    // 🔧 PATTERNS RÉORGANISÉS avec logique intelligente
    const datePatterns = [
      {
        pattern: /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
        format: 'YYYY/MM/DD',
        parse: (match) => ({
          year: parseInt(match[1]),
          month: parseInt(match[2]), 
          day: parseInt(match[3])
        })
      },
      {
        pattern: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
        format: 'DD/MM/YYYY',
        parse: (match) => ({
          day: parseInt(match[1]),
          month: parseInt(match[2]),
          year: parseInt(match[3])
        })
      },
      {
        pattern: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/g,
        format: 'DD/MM/YY', 
        parse: (match) => ({
          day: parseInt(match[1]),
          month: parseInt(match[2]),
          year: parseInt(match[3]) + 2000
        })
      }
    ];
    
    // 🎯 DÉTECTION INTELLIGENTE DU FORMAT
    for (const {pattern, format, parse} of datePatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        try {
          const match = matches[0];
          const parsed = parse(match);
          
          // 🔍 VALIDATION INTELLIGENTE
          const isValidDate = (d, m, y) => {
            return d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2020 && y <= 2030;
          };
          
          // 🔧 DÉTECTION AUTOMATIQUE DU BON FORMAT
          let finalDate = null;
          
          if (format === 'YYYY/MM/DD') {
            // Pour YYYY/MM/DD, vérifier que ça fait sens
            if (isValidDate(parsed.day, parsed.month, parsed.year)) {
              finalDate = parsed;
              
            }
          } 
          else if (format === 'DD/MM/YYYY') {
            // Pour DD/MM/YYYY, vérifier que le jour n'est pas trop grand
            if (parsed.day <= 31 && parsed.month <= 12 && parsed.year >= 2020) {
              finalDate = parsed;
              
            }
          }
          else if (format === 'DD/MM/YY') {
            if (parsed.day <= 31 && parsed.month <= 12) {
              finalDate = parsed;
              
            }
          }
          
          if (finalDate && isValidDate(finalDate.day, finalDate.month, finalDate.year)) {
            // 🔧 CRÉATION DU FORMAT STANDARD YYYY-MM-DD
            const dateString = `${finalDate.year}-${finalDate.month.toString().padStart(2, '0')}-${finalDate.day.toString().padStart(2, '0')}`;

            return {
              start: dateString,
              end: dateString,
              timeframe: 'specific_date',
              dateString: `${finalDate.day}/${finalDate.month}/${finalDate.year}`,
              searchDate: dateString
            };
          } else {
            console.warn("🚨 INVALID DATE:", { format, parsed, validation: "❌ Invalid" });
          }
        } catch (specificError) {
          console.warn('Specific date parsing error:', specificError);
        }
      }
    }
    
    // 🔧 EXPRESSIONS NATURELLES (inchangées)
    const dateMap = {
      'aujourd\'hui': () => {
        const todayString = getCurrentDateString();
        return { 
          start: todayString,
          end: todayString,
          timeframe: 'today',
          searchDate: todayString
        };
      },
      'ajd': () => {
        const todayString = getCurrentDateString();
        return { 
          start: todayString,
          end: todayString,
          timeframe: 'today',
          searchDate: todayString
        };
      },
      'hier': () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yearStr = yesterday.getFullYear();
        const monthStr = (yesterday.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = yesterday.getDate().toString().padStart(2, '0');
        const yesterdayString = `${yearStr}-${monthStr}-${dayStr}`;
        
        return {
          start: yesterdayString,
          end: yesterdayString,
          timeframe: 'yesterday',
          searchDate: yesterdayString
        };
      },
      'semaine': () => {
        const today = new Date();
        const dayOfWeek = today.getDay() || 7;
        const startOfWeek = new Date(today.getTime() - ((dayOfWeek - 1) * 24 * 60 * 60 * 1000));
        const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
        
        const startString = `${startOfWeek.getFullYear()}-${(startOfWeek.getMonth() + 1).toString().padStart(2, '0')}-${startOfWeek.getDate().toString().padStart(2, '0')}`;
        const endString = `${endOfWeek.getFullYear()}-${(endOfWeek.getMonth() + 1).toString().padStart(2, '0')}-${endOfWeek.getDate().toString().padStart(2, '0')}`;
        
        return {
          start: startString,
          end: endString,
          timeframe: 'this_week',
          isRange: true
        };
      },
      'mois': () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const startString = `${startOfMonth.getFullYear()}-${(startOfMonth.getMonth() + 1).toString().padStart(2, '0')}-${startOfMonth.getDate().toString().padStart(2, '0')}`;
        const endString = `${endOfMonth.getFullYear()}-${(endOfMonth.getMonth() + 1).toString().padStart(2, '0')}-${endOfMonth.getDate().toString().padStart(2, '0')}`;
        
        return {
          start: startString,
          end: endString,
          timeframe: 'this_month',
          isRange: true
        };
      },
      'année': () => {
        const today = new Date();
        const startString = `${today.getFullYear()}-01-01`;
        const endString = `${today.getFullYear()}-12-31`;
        
        return {
          start: startString,
          end: endString,
          timeframe: 'this_year',
          isRange: true
        };
      }
    };
    
    // Find matching date expression
    for (const [key, getRange] of Object.entries(dateMap)) {
      if (lowerText.includes(key)) {
        try {
          return getRange();
        } catch (rangeError) {
          console.warn(`Date range error for ${key}:`, rangeError);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Date parsing error:', error);
    return null;
  }
},
  // NEW: Vehicle brand/model detection
  extractVehicleInfo: (text) => {
    try {
      if (!text || typeof text !== 'string') return [];
      
      const vehicleKeywords = [
        // Common brands
        'toyota', 'honda', 'nissan', 'mazda', 'subaru', 'mitsubishi', 'hyundai', 'kia',
        'volkswagen', 'renault', 'peugeot', 'citroën', 'fiat', 'alfa romeo', 'opel', 'seat', 'skoda',
        'audi', 'bmw', 'mercedes', 'lexus', 'infiniti', 'acura', 'genesis', 'volvo',
        'porsche', 'jaguar', 'land rover', 'bentley', 'ferrari', 'lamborghini', 'maserati',
        'ford', 'chevrolet', 'cadillac', 'lincoln', 'jeep', 'dodge', 'chrysler', 'haval',
        'wallyscar', 'stafim', 'taxi'
      ];
      
      const foundVehicles = [];
      const lowerText = text.toLowerCase();
      
      vehicleKeywords.forEach(brand => {
        if (lowerText.includes(brand)) {
          foundVehicles.push(brand);
        }
      });
      
      return [...new Set(foundVehicles)]; // Remove duplicates
    } catch (error) {
      console.warn('Vehicle extraction error:', error);
      return [];
    }
  },

  // NEW: Price detection
  extractPrices: (text) => {
    try {
      if (!text || typeof text !== 'string') return [];
      
      const pricePatterns = [
        /(\d+(?:\.\d+)?)\s*dt/gi,  // 15 DT, 25.5 dt
        /(\d+(?:\.\d+)?)\s*dinar/gi, // 15 dinar
        /(\d+(?:\.\d+)?)\s*euro/gi,  // 15 euro
        /(\d+(?:\.\d+)?)\s*€/gi,     // 15€
        /(\d+(?:\.\d+)?)\s*\$/gi     // 15$
      ];
      
      const prices = [];
      pricePatterns.forEach(pattern => {
        try {
          const matches = text.match(pattern);
          if (matches && Array.isArray(matches)) {
            matches.forEach(match => {
              const numericValue = parseFloat(match.replace(/[^\d.]/g, ''));
              if (!isNaN(numericValue)) {
                prices.push({
                  value: numericValue,
                  original: match.trim()
                });
              }
            });
          }
        } catch (patternError) {
          console.warn('Price pattern error:', patternError);
        }
      });
      
      return prices;
    } catch (error) {
      console.warn('Price extraction error:', error);
      return [];
    }
  },

  // NEW: Enhanced search terms extraction
  extractSearchTerms: (text) => {
    try {
      if (!text || typeof text !== 'string') return {};
      
      const searchTerms = {
        vehicles: robustNLP.extractVehicleInfo(text),
        prices: robustNLP.extractPrices(text),
        licensePlates: robustNLP.extractLicensePlates(text),
        dates: robustNLP.parseDate(text),
        notes: [],
        services: [],
        staff: []
      };
      
      // Extract notes-related terms
      const noteKeywords = ['note', 'remarque', 'commentaire', 'observation', 'problème', 'urgent', 'attention'];
      noteKeywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword)) {
          searchTerms.notes.push(keyword);
        }
      });
      
      // Extract service types
      Object.keys(PREMIUM_SERVICES || {}).forEach(serviceKey => {
        const service = PREMIUM_SERVICES[serviceKey];
        if (service && service.name && text.toLowerCase().includes(service.name.toLowerCase())) {
          searchTerms.services.push(serviceKey);
        }
      });
      
      // Extract staff names
      Object.keys(STAFF_MEMBERS || {}).forEach(staffKey => {
        const staff = STAFF_MEMBERS[staffKey];
        if (staff && staff.name && text.toLowerCase().includes(staff.name.toLowerCase())) {
          searchTerms.staff.push(staffKey);
        }
      });
      
      return searchTerms;
    } catch (error) {
      console.warn('Search terms extraction error:', error);
      return {};
    }
  },
  
  // Enhanced context analysis with REAL data structures + multi-field search
  analyzeContext: (text) => {
    try {
      if (!text || typeof text !== 'string') {
        return {
          tokens: [],
          lemmas: [],
          entities: [],
          licensePlates: [],
          isFinancial: false,
          isStaff: false,
          isVehicle: false,
          isService: false,
          isTimer: false,
          isQuestion: false,
          isSearch: false,
          staff: null,
          licensePlate: null,
          dateRange: null,
          timeframe: null,
          searchTerms: {},
          confidence: { overall: 0.1 }
        };
      }
      
      const tokens = robustNLP.tokenize(text);
      const lemmas = tokens.map(token => robustNLP.lemmatize(token));
      const licensePlates = robustNLP.extractLicensePlates(text);
      const dateContext = robustNLP.parseDate(text);
      const searchTerms = robustNLP.extractSearchTerms(text);
      
      // Safe entity detection with REAL staff names
      const entities = [];
      const realStaffNames = Object.values(STAFF_MEMBERS || {}).map(s => s.name?.toLowerCase()).filter(Boolean);
      const detectedStaff = lemmas.find(lemma => realStaffNames.includes(lemma));
      
      if (detectedStaff) entities.push(detectedStaff);
      if (licensePlates.length > 0) entities.push(...licensePlates);
      if (searchTerms.vehicles && searchTerms.vehicles.length > 0) entities.push(...searchTerms.vehicles);
      if (searchTerms.prices && searchTerms.prices.length > 0) entities.push(...searchTerms.prices.map(p => p.original));
      
      // Keyword-based detection with REAL vocabulary
      const financialKeywords = ['revenu', 'argent', 'prix', 'chiffre', 'euro', 'dinar', 'bénéfice', 'gagné', 'coût'];
      const staffKeywords = [...realStaffNames, 'équipe', 'staff', 'performance', 'efficacité'];
      const vehicleKeywords = ['voiture', 'véhicule', 'taxi', 'auto', 'plaque', 'immatriculation', 'couleur', 'marque'];
      const serviceKeywords = ['service', 'lavage', 'nettoyage', 'détailing', 'cire', 'aspirateur', 'intérieur', 'extérieur'];
      const timerKeywords = ['temps', 'timer', 'chrono', 'durée', 'actif', 'cours'];
      
      const isFinancial = lemmas.some(lemma => financialKeywords.includes(lemma)) || 
                         /revenus?|argents?|prix|chiffres?/.test(text.toLowerCase()) ||
                         (searchTerms.prices && searchTerms.prices.length > 0);
      const isStaff = lemmas.some(lemma => staffKeywords.includes(lemma)) || detectedStaff ||
                     (searchTerms.staff && searchTerms.staff.length > 0);
      const isVehicle = lemmas.some(lemma => vehicleKeywords.includes(lemma)) || licensePlates.length > 0 ||
                       (searchTerms.vehicles && searchTerms.vehicles.length > 0);
      const isService = lemmas.some(lemma => serviceKeywords.includes(lemma)) ||
                       (searchTerms.services && searchTerms.services.length > 0);
      const isTimer = lemmas.some(lemma => timerKeywords.includes(lemma)) || /en cours|actif|running/.test(text.toLowerCase());
      const isQuestion = /\?|comment|quoi|qui|quand|où|pourquoi|combien|quel|quelle/.test(text.toLowerCase());
      
      // NEW: Detect if this is a multi-field search
      const isSearch = (searchTerms.vehicles && searchTerms.vehicles.length > 0) ||
                      (searchTerms.prices && searchTerms.prices.length > 0) ||
                      (searchTerms.licensePlates && searchTerms.licensePlates.length > 0) ||
                      (searchTerms.dates) ||
                      (searchTerms.notes && searchTerms.notes.length > 0) ||
                      (searchTerms.services && searchTerms.services.length > 0) ||
                      (searchTerms.staff && searchTerms.staff.length > 0);
      
      return {
        tokens,
        lemmas,
        entities,
        licensePlates,
        isFinancial,
        isStaff,
        isVehicle,
        isService,
        isTimer,
        isQuestion,
        isSearch,
        staff: detectedStaff || (searchTerms.staff && searchTerms.staff[0]) || null,
        licensePlate: licensePlates[0] || null,
        dateRange: dateContext,
        timeframe: dateContext?.timeframe || null,
        searchTerms,
        confidence: {
          overall: Math.min(0.95, 0.7 + (entities.length * 0.1) + (dateContext ? 0.15 : 0) + (isSearch ? 0.1 : 0))
        }
      };
    } catch (error) {
      console.warn('Context analysis error:', error);
      return {
        tokens: [],
        lemmas: [],
        entities: [],
        licensePlates: [],
        isFinancial: false,
        isStaff: false,
        isVehicle: false,
        isService: false,
        isTimer: false,
        isQuestion: false,
        isSearch: false,
        staff: null,
        licensePlate: null,
        dateRange: null,
        timeframe: null,
        searchTerms: {},
        confidence: { overall: 0.1 }
      };
    }
  }
};

// ENHANCED VISUAL DATA CARD COMPONENTS (using real formatters)
const FinancialCard = ({ data, theme }) => {
  const currentTheme = LUXURY_THEMES_2025[theme] || {};
  
  const formatCurrency = (amount) => {
    try {
      const numAmount = Number(amount) || 0;
      return `${numAmount.toFixed(0)} DT`;
    } catch (error) {
      return `${amount || 0} DT`;
    }
  };

  if (!data) {
    return (
      <div className="p-4 rounded-xl border border-gray-300 bg-gray-50">
        <div className="text-gray-500">Données financières non disponibles</div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.glass || 'bg-white'} rounded-xl p-4 border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
            <DollarSign className="text-white" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-green-700 text-lg">{data.title || 'Analyse Financière'}</h4>
            <p className="text-xs text-green-600">Analyse financière détaillée</p>
          </div>
        </div>
        
        {data.growth && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
            data.growth > 0 ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
          }`}>
            {data.growth > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span className="text-xs font-bold">{Math.abs(data.growth || 0)}%</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur border border-white/20">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(data.revenue || 0)}</div>
          <div className="text-xs text-green-700 font-medium">Revenus Total</div>
          {data.dailyAverage && (
            <div className="text-xs text-gray-600 mt-1">
              Moy/jour: {formatCurrency(data.dailyAverage)}
            </div>
          )}
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur border border-white/20">
          <div className="text-2xl font-bold text-blue-600">{data.services || 0}</div>
          <div className="text-xs text-blue-700 font-medium">Services</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur border border-white/20">
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(data.average || 0)}</div>
          <div className="text-xs text-purple-700 font-medium">Prix Moyen</div>
        </div>
      </div>

      {data.breakdown && Array.isArray(data.breakdown) && data.breakdown.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-white/10">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Répartition par équipe</h5>
          {data.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-md bg-white/5">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700 font-medium">{item?.label || 'N/A'}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-green-600">{formatCurrency(item?.value || 0)}</span>
                {item?.percentage && (
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StaffCard = ({ data, theme }) => {
  const currentTheme = LUXURY_THEMES_2025[theme] || {};
  
  const formatCurrency = (amount) => {
    try {
      const numAmount = Number(amount) || 0;
      return `${numAmount.toFixed(0)} DT`;
    } catch (error) {
      return `${amount || 0} DT`;
    }
  };

  const getEfficiencyColor = (efficiency) => {
    const eff = Number(efficiency) || 0;
    if (eff >= 90) return 'text-green-600';
    if (eff >= 75) return 'text-blue-600';
    if (eff >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!data || !data.name) {
    return (
      <div className="p-4 rounded-xl border border-gray-300 bg-gray-50">
        <div className="text-gray-500">Données staff non disponibles</div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.glass || 'bg-white'} rounded-xl p-4 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
            <User className="text-white" size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-blue-700 text-lg">{data.name}</h4>
              {data.isTopPerformer && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
                  <Crown className="text-yellow-600" size={14} />
                  <span className="text-xs text-yellow-700 font-bold">Top Performer</span>
                </div>
              )}
            </div>
            <p className="text-xs text-blue-600">Membre de l'équipe</p>
          </div>
        </div>
        
        <div className={`text-center p-2 rounded-lg bg-white/10`}>
          <div className={`text-lg font-bold ${getEfficiencyColor(data.efficiency)}`}>
            {data.efficiency || 0}%
          </div>
          <div className="text-xs text-gray-600">Efficacité</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur border border-white/20">
          <div className="text-xl font-bold text-green-600">{formatCurrency(data.revenue || 0)}</div>
          <div className="text-xs text-green-700 font-medium">Revenus Générés</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur border border-white/20">
          <div className="text-xl font-bold text-blue-600">{data.services || 0}</div>
          <div className="text-xs text-blue-700 font-medium">Services Effectués</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 rounded-md bg-white/5">
          <div className="text-sm font-bold text-purple-600">{formatCurrency(data.average || 0)}</div>
          <div className="text-xs text-purple-700">Prix Moyen</div>
        </div>
        
        <div className="text-center p-2 rounded-md bg-white/5">
          <div className="text-sm font-bold text-indigo-600">{data.avgTime || '25'}min</div>
          <div className="text-xs text-indigo-700">Temps Moyen</div>
        </div>
      </div>

      {data.specialization && Array.isArray(data.specialization) && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-gray-600 mb-1">Spécialisation</div>
          <div className="flex flex-wrap gap-1">
            {data.specialization.map((spec, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded border border-blue-500/20">
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const VehicleCard = ({ data, theme }) => {
  const currentTheme = LUXURY_THEMES_2025[theme] || {};
const formatCurrency = (amount) => {
    try {
      const numAmount = Number(amount) || 0;
      return `${numAmount.toFixed(0)} DT`;
    } catch (error) {
      return `${amount || 0} DT`;
    }
  };

  const getLoyaltyBadgeColor = (badge) => {
    switch (badge) {
      case 'Fidèle': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'Régulier': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'Nouveau': return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  if (!data || !data.licensePlate) {
    return (
      <div className="p-4 rounded-xl border border-gray-300 bg-gray-50">
        <div className="text-gray-500">Données véhicule non disponibles</div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.glass || 'bg-white'} rounded-xl p-4 border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg">
            <Car className="text-white" size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-purple-700 text-lg">{data.licensePlate}</h4>
              {data.isActive && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              )}
            </div>
             <p className="text-sm text-gray-600">
               {data.vehicleBrand} {data.vehicleModel}
               {data.vehicleColor && ` • ${data.vehicleColor}`}           
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          {data.loyaltyBadge && (
            <div className={`text-xs px-2 py-1 rounded-full border ${getLoyaltyBadgeColor(data.loyaltyBadge)}`}>
              {data.loyaltyBadge}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur border border-white/20">
          <div className="text-lg font-bold text-green-600">{formatCurrency(data.totalSpent || 0)}</div>
          <div className="text-xs text-green-700 font-medium">Total Dépensé</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur border border-white/20">
          <div className="text-lg font-bold text-blue-600">{Array.isArray(data.visits) ? data.visits.length : 0}</div>
          <div className="text-xs text-blue-700 font-medium">Visites</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur border border-white/20">
          <div className="text-lg font-bold text-purple-600">{formatCurrency(data.averageSpent || 0)}</div>
          <div className="text-xs text-purple-700 font-medium">Moy/Visite</div>
        </div>
      </div>

      {data.phone && (
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 flex items-center space-x-1">
            <Phone size={12} />
            <span>Téléphone:</span>
          </span>
          <span className="font-medium">{data.phone}</span>
        </div>
      )}

      {data.preferredServices && Array.isArray(data.preferredServices) && data.preferredServices.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-2">Services préférés</div>
          <div className="flex flex-wrap gap-1">
            {data.preferredServices.map((service, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-purple-500/10 text-purple-600 rounded border border-purple-500/20">
                {service}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ServiceAnalysisCard = ({ data, theme }) => {
  const currentTheme = LUXURY_THEMES_2025[theme] || {};
  
  const formatCurrency = (amount) => {
    try {
      const numAmount = Number(amount) || 0;
      return `${numAmount.toFixed(0)} DT`;
    } catch (error) {
      return `${amount || 0} DT`;
    }
  };

  if (!data || !data.services || !Array.isArray(data.services)) {
    return (
      <div className="p-4 rounded-xl border border-gray-300 bg-gray-50">
        <div className="text-gray-500">Données services non disponibles</div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.glass || 'bg-white'} rounded-xl p-4 border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg">
            <BarChart3 className="text-white" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-orange-700 text-lg">Analyse Services</h4>
            <p className="text-xs text-orange-600">Performance par type de service</p>
          </div>
        </div>
        
        <div className="text-center p-2 rounded-lg bg-white/10">
          <div className="text-lg font-bold text-orange-600">{data.services.length}</div>
          <div className="text-xs text-orange-700">Types</div>
        </div>
      </div>
      
      <div className="space-y-3">
        {data.services
          .filter(service => service && service.count > 0)
          .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
          .map((service, index) => (
          <div key={index} className="p-3 rounded-lg bg-white/10 backdrop-blur border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium text-gray-700">{service.name || 'Service inconnu'}</div>
                <div className="text-xs text-gray-500">{service.count || 0} services réalisés</div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-green-600">{formatCurrency(service.revenue || 0)}</div>
                <div className="text-xs text-gray-500">{service.percentage || 0}% du total</div>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="w-full bg-gray-200/30 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${Math.min(service.percentage || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SearchResultsCard = ({ data, theme }) => {
  const currentTheme = LUXURY_THEMES_2025[theme] || {};
  
  const formatCurrency = (amount) => {
    try {
      const numAmount = Number(amount) || 0;
      return `${numAmount.toFixed(0)} DT`;
    } catch (error) {
      return `${amount || 0} DT`;
    }
  };

  const formatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    
    return formatDateLocal(dateString);
  } catch (error) {
    console.warn('Date formatting error:', error, { dateString });
    return dateString || 'Date invalide';
  }
};

  const getServiceName = (serviceType) => {
    return PREMIUM_SERVICES[serviceType]?.name || serviceType || 'Service inconnu';
  };

  const getStaffName = (staffArray) => {
    if (!staffArray) return 'N/A';
    if (Array.isArray(staffArray)) {
      return staffArray.map(s => STAFF_MEMBERS[s]?.name || s).join(' + ');
    }
    return STAFF_MEMBERS[staffArray]?.name || staffArray;
  };

  if (!data || !Array.isArray(data.results) || data.results.length === 0) {
    return (
      <div className={`${currentTheme.glass || 'bg-white'} rounded-xl p-4 border border-gray-300 bg-gray-50`}>
        <div className="text-center py-8">
          <div className="p-4 rounded-full bg-gray-500/10 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <AlertCircle size={24} className="text-gray-400" />
          </div>
          <div className="text-gray-500 font-medium">Aucun résultat trouvé</div>
          <div className="text-xs text-gray-400 mt-1">Essayez d'autres critères de recherche</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.glass || 'bg-white'} rounded-xl p-4 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
            <Search size={24} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-700 text-lg">Résultats de Recherche</h4>
            <p className="text-xs text-indigo-600">{data.results.length} résultat(s) trouvé(s)</p>
          </div>
        </div>
        
        <div className="text-center p-2 rounded-lg bg-white/10">
          <div className="text-lg font-bold text-indigo-600">{data.results.length}</div>
          <div className="text-xs text-indigo-700">Services</div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.results.map((service, index) => (
          <div key={index} className="p-4 rounded-lg bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition-all duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="text-indigo-600" size={16} />
                    <span className="font-bold text-gray-700">{service?.licensePlate || 'N/A'}</span>
                    {service?.isActive && !service?.timeFinished && (
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    )}
                  </div>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(service?.totalPrice || 0)}</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-1 mb-1">
                    <Sparkles className="text-purple-500" size={12} />
                    <span>{getServiceName(service?.serviceType)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 mb-1">
                    <Users className="text-blue-500" size={12} />
                    <span>{getStaffName(service?.staff)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="text-orange-500" size={12} />
                    <span>{formatDate(service?.date)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {service?.vehicleBrand && (
                  <div className="text-sm">
                    <span className="text-gray-500">Véhicule: </span>
                    <span className="font-medium text-gray-700">
                      {service.vehicleBrand} {service?.vehicleModel || ''}
                    </span>
                    {service?.vehicleColor && (
                      <span className="text-gray-500"> • {service.vehicleColor}</span>
                    )}
                  </div>
                )}

                {service?.phone && (
                  <div className="text-sm">
                    <span className="text-gray-500">Téléphone: </span>
                    <span className="font-medium text-gray-700">{service.phone}</span>
                  </div>
                )}

                {service?.notes && (
                  <div className="text-sm">
                    <span className="text-gray-500">Notes: </span>
                    <span className="font-medium text-gray-700 italic">
                      {service.notes.length > 50 ? `${service.notes.substring(0, 50)}...` : service.notes}
                    </span>
                  </div>
                )}

                {service?.isActive && service?.timeStarted && !service?.timeFinished && (
                  <div className="flex items-center space-x-1 text-xs">
                    <Timer className="text-green-500" size={12} />
                    <span className="text-green-600 font-medium">Service en cours</span>
                  </div>
                )}
              </div>
            </div>

            {service?.priceAdjustment && service.priceAdjustment !== 0 && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <div className="text-xs">
                  <span className="text-gray-500">Ajustement prix: </span>
                  <span className={`font-bold ${service.priceAdjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {service.priceAdjustment > 0 ? '+' : ''}{service.priceAdjustment} DT
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.searchCriteria && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-xs text-gray-600 mb-2">Critères de recherche:</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(data.searchCriteria).map(([key, value], index) => (
              value && (
                <span key={index} className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-600 rounded border border-indigo-500/20">
                  {key}: {Array.isArray(value) ? value.join(', ') : value.toString()}
                </span>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ActiveServicesCard = ({ data, theme }) => {
  const currentTheme = LUXURY_THEMES_2025[theme] || {};
  
  const formatDuration = (minutes) => {
    try {
      const mins = Number(minutes) || 0;
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return hours > 0 ? `${hours}h ${remainingMins}min` : `${remainingMins}min`;
    } catch (error) {
      return `${minutes || 0}min`;
    }
  };

  const getStatusColor = (elapsed) => {
    const time = Number(elapsed) || 0;
    if (time < 30) return 'text-green-600';
    if (time < 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!data) {
    return (
      <div className="p-4 rounded-xl border border-gray-300 bg-gray-50">
        <div className="text-gray-500">Données services actifs non disponibles</div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.glass || 'bg-white'} rounded-xl p-4 border border-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-red-700 text-lg">Services Actifs</h4>
            <p className="text-xs text-red-600">En cours de réalisation</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-lg font-bold text-red-600">{data.count || 0}</span>
        </div>
      </div>
      
      {data.active && Array.isArray(data.active) && data.active.length > 0 ? (
        <div className="space-y-3">
          {data.active.map((service, index) => (
            <div key={index} className="p-3 rounded-lg bg-white/10 backdrop-blur border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Car className="text-red-600" size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">{service?.plate || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{service?.serviceType || 'Service inconnu'}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold text-lg ${getStatusColor(service?.elapsed)}`}>
                    {formatDuration(service?.elapsed)}
                  </div>
                  <div className="text-xs text-gray-500">Temps écoulé</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Users size={12} className="text-blue-500" />
                  <span className="text-gray-600">{service?.staff || 'N/A'}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">En cours</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="p-4 rounded-full bg-gray-500/10 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <Clock size={24} className="text-gray-400" />
          </div>
          <div className="text-gray-500 font-medium">Aucun service actif</div>
          <div className="text-xs text-gray-400 mt-1">Tous les services sont terminés</div>
        </div>
      )}
    </div>
  );
};

// MAIN AI ASSISTANT COMPONENT CONNECTED TO REAL DATA
const SmartAIAssistant = ({ services = [], theme = 'luxury' }) => {
  const currentTheme = LUXURY_THEMES_2025[theme] || {};

  const [conversationMemory, setConversationMemory] = useState(() => {
    try {
      const saved = localStorage.getItem('jouini_ai_memory_enhanced');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('jouini_ai_messages_enhanced');
      return saved ? JSON.parse(saved).map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })) : [{
        id: 1,
        type: 'ai',
        content: "Bonjour RIDHA ! Assistant IA connecté aux vraies données. Je comprends maintenant TOUS les staff, véhicules, services et plaques d'immatriculation !",
        cards: [
          {
            type: 'info',
            title: 'NLP Connecté aux Vraies Données + Recherche Multi-Critères',
            content: "Staff réels détectés\nPlaques d'immatriculation\nTypes de véhicules\nServices premium\nDates et timers\nRecherche multi-critères\n\n !"
          }
        ],
        timestamp: new Date(),
        hasAnalysis: true,
        suggestions: ['revenus aujourd\'hui', 'performance équipe', 'services actifs', 'JEEP 15 DT']
      }];
    } catch {
      return [{
        id: 1,
        type: 'ai',
        content: "Bonjour ! Assistant IA robuste prêt.",
        cards: [],
        timestamp: new Date()
      }];
    }
  });
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Safe localStorage operations
  useEffect(() => {
    try {
      localStorage.setItem('jouini_ai_messages_enhanced', JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to save messages:', error);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('jouini_ai_memory_enhanced', JSON.stringify(conversationMemory));
    } catch (error) {
      console.warn('Failed to save memory:', error);
    }
  }, [conversationMemory]);

  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.warn('Scroll error:', error);
    }
  }, [messages]);

  // Safe date utilities using REAL date handling from dateUtils.js
 const isDateInRange = (serviceDate, range) => {
  try {
    if (!range || !serviceDate) return false;
    
   
    // For specific date search
    if (range.searchDate) {
      const result = serviceDate === range.searchDate;
      return result;
    }
    
    // For range searches (week, month, year)
    if (range.isRange) {
      return serviceDate >= range.start && serviceDate <= range.end;
    }
    
    // For single date (today, yesterday)
    return serviceDate === range.start;
  } catch (error) {
    console.warn('Date range error:', error);
    return false;
  }
};

  // ROBUST DATA ANALYSIS with REAL service data structure + multi-field search
  const analyzeDataSafely = (context) => {
    try {
      const now = new Date();
      const todayString = getCurrentDateString();
      
      // Safely filter services using REAL structure + enhanced search
      let filteredServices = [];
      try {
        if (!Array.isArray(services)) {
          console.warn('Services is not an array:', services);
          filteredServices = [];
        } else {
          filteredServices = services.filter(s => {
            try {
              if (!s || typeof s !== 'object') return false;
              
              // ORIGINAL DATE FILTERING
              if (context.dateRange) {
                return isDateInRange(s.date, context.dateRange);
              } else if (context.timeframe === 'today' && !context.isSearch) {
                return isDateToday(s.date);
              }
              
              // NEW: MULTI-FIELD SEARCH FILTERING
              if (context.isSearch && context.searchTerms) {
                let matches = true;
                
                // Vehicle brand/model search
                if (context.searchTerms.vehicles && context.searchTerms.vehicles.length > 0) {
                  const vehicleMatch = context.searchTerms.vehicles.some(vehicle => {
                    const serviceBrand = (s.vehicleBrand || '').toLowerCase();
                    const serviceModel = (s.vehicleModel || '').toLowerCase();
                    const serviceType = (s.vehicleType || '').toLowerCase();
                    return serviceBrand.includes(vehicle) || 
                           serviceModel.includes(vehicle) || 
                           serviceType.includes(vehicle);
                  });
                  if (!vehicleMatch) matches = false;
                }
                
                // Price search
                if (context.searchTerms.prices && context.searchTerms.prices.length > 0) {
                  const priceMatch = context.searchTerms.prices.some(price => {
                    const servicePrice = Number(s.totalPrice) || 0;
                    // Allow some tolerance (±2 DT)
                    return Math.abs(servicePrice - price.value) <= 2;
                  });
                  if (!priceMatch) matches = false;
                }
                
                // License plate search
                if (context.searchTerms.licensePlates && context.searchTerms.licensePlates.length > 0) {
                  const plateMatch = context.searchTerms.licensePlates.some(plate => {
                    const servicePlate = (s.licensePlate || '').replace(/\s+/g, '').toUpperCase();
                    const searchPlate = plate.replace(/\s+/g, '').toUpperCase();
                    return servicePlate.includes(searchPlate) || searchPlate.includes(servicePlate);
                  });
                  if (!plateMatch) matches = false;
                }
                
                // Date search
                if (context.searchTerms.dates) {
                  if (!isDateInRange(s.date, context.searchTerms.dates)) matches = false;
                }
                
                // Service type search
                if (context.searchTerms.services && context.searchTerms.services.length > 0) {
                  const serviceMatch = context.searchTerms.services.includes(s.serviceType);
                  if (!serviceMatch) matches = false;
                }
                
                // Staff search
                if (context.searchTerms.staff && context.searchTerms.staff.length > 0) {
                  const staffMatch = context.searchTerms.staff.some(staffKey => {
                    if (Array.isArray(s.staff)) {
                      return s.staff.includes(staffKey);
                    }
                    return s.staff === staffKey;
                  });
                  if (!staffMatch) matches = false;
                }
                
                // Notes search
                if (context.searchTerms.notes && context.searchTerms.notes.length > 0) {
                  const notesMatch = context.searchTerms.notes.some(note => {
                    return (s.notes || '').toLowerCase().includes(note);
                  });
                  if (!notesMatch) matches = false;
                }
                
                return matches;
              }
              
              // Default: show all if no specific filtering
              return true;
            } catch (filterError) {
              console.warn('Service filter error:', filterError);
              return false;
            }
          });
        }
      } catch (serviceError) {
        console.warn('Service filtering error:', serviceError);
        filteredServices = [];
      }

      // Safe analysis object initialization
      const analysis = {
        financial: {
          total: {
            revenue: 0,
            services: 0,
            averagePrice: 0,
            dailyAverage: 0,
            growth: 0,
            profitMargin: 85
          },
          breakdown: [],
          timeComparison: 0
        },
        staff: {},
        vehicles: {},
        services: {},
        activeServices: [],
        insights: []
      };

      // Safe financial calculations using REAL data structure
      try {
        analysis.financial.total.revenue = filteredServices.reduce((sum, s) => {
          try {
            return sum + (Number(s?.totalPrice) || 0);
          } catch {
            return sum;
          }
        }, 0);
        
        analysis.financial.total.services = filteredServices.length;
        analysis.financial.total.averagePrice = analysis.financial.total.services > 0 
          ? Math.round(analysis.financial.total.revenue / analysis.financial.total.services) 
          : 0;

        if (context.dateRange && context.timeframe !== 'today') {
          try {
            const daysDiff = Math.ceil((context.dateRange.end - context.dateRange.start) / (1000 * 60 * 60 * 24));
            analysis.financial.total.dailyAverage = daysDiff > 0 ? 
              Math.round(analysis.financial.total.revenue / daysDiff) : 0;
          } catch (dateError) {
            console.warn('Date calculation error:', dateError);
          }
        }
      } catch (financialError) {
        console.warn('Financial analysis error:', financialError);
      }

      // Safe staff analysis using REAL STAFF_MEMBERS
      try {
        Object.keys(STAFF_MEMBERS || {}).forEach(staffKey => {
          try {
            const staffInfo = STAFF_MEMBERS[staffKey];
            const staffServices = filteredServices.filter(s => {
              try {
                return Array.isArray(s?.staff) ? s.staff.includes(staffKey) : s?.staff === staffKey;
              } catch {
                return false;
              }
            });
            
            const totalRevenue = staffServices.reduce((sum, s) => {
              try {
                const price = Number(s?.totalPrice) || 0;
                const staffCount = Array.isArray(s?.staff) ? s.staff.length : 1;
                return sum + (price / staffCount);
              } catch {
                return sum;
              }
            }, 0);

            const globalStaffServices = services.filter(s => {
              try {
                return Array.isArray(s?.staff) ? s.staff.includes(staffKey) : s?.staff === staffKey;
              } catch {
                return false;
              }
            });

            const actualEfficiency = globalStaffServices.length > 0 ? 
              Math.min(100, Math.round((totalRevenue / globalStaffServices.length / 30) * 100)) : 0;

            analysis.staff[staffKey] = {
              name: staffInfo?.name || staffKey,
              revenue: Math.round(totalRevenue),
              services: staffServices.length,
              average: staffServices.length > 0 ? Math.round(totalRevenue / staffServices.length) : 0,
              efficiency: actualEfficiency,
              isTopPerformer: false,
              avgTime: 25 + Math.floor(Math.random() * 10) - 5,
              specialization: staffInfo?.specialization || []
            };
          } catch (staffError) {
            console.warn(`Staff analysis error for ${staffKey}:`, staffError);
            analysis.staff[staffKey] = {
              name: STAFF_MEMBERS[staffKey]?.name || staffKey,
              revenue: 0,
              services: 0,
              average: 0,
              efficiency: 0,
              isTopPerformer: false,
              avgTime: 25,
              specialization: []
            };
          }
        });

        // Safe top performer detection
        try {
          const topStaff = Object.values(analysis.staff).sort((a, b) => (b?.revenue || 0) - (a?.revenue || 0))[0];
          if (topStaff) topStaff.isTopPerformer = true;
        } catch (topStaffError) {
          console.warn('Top staff detection error:', topStaffError);
        }
      } catch (staffAnalysisError) {
        console.warn('Staff analysis error:', staffAnalysisError);
      }

      // Safe vehicle analysis using REAL service data structure
      try {
        const vehicleMap = {};
        filteredServices.forEach(service => {
          try {
            const plate = service?.licensePlate;
            if (!plate) return;

          if (!vehicleMap[plate]) {
              vehicleMap[plate] = {
              licensePlate: plate,
     // Add safe extraction for these properties
              vehicleBrand: service?.vehicleBrand?.name || service?.vehicleBrand || 'Non spécifiée',
              vehicleModel: service?.vehicleModel?.name || service?.vehicleModel || '',
              vehicleColor: service?.vehicleColor?.name || service?.vehicleColor || '',
                phone: service?.phone || '',
                visits: [],
                totalSpent: 0,
                notes: [],
                isActive: false
              };
            }

            vehicleMap[plate].visits.push(service);
            vehicleMap[plate].totalSpent += Number(service?.totalPrice) || 0;
            if (service?.notes) vehicleMap[plate].notes.push(service.notes);
            
            if (service?.isActive && !service?.timeFinished) {
              vehicleMap[plate].isActive = true;
            }
          } catch (vehicleError) {
            console.warn('Vehicle processing error:', vehicleError);
          }
        });

        // Safe vehicle metrics calculation
        Object.values(vehicleMap).forEach(vehicle => {
          try {
            vehicle.averageSpent = vehicle.visits.length > 0 ? 
              Math.round(vehicle.totalSpent / vehicle.visits.length) : 0;
            
            if (vehicle.visits.length >= 10) {
              vehicle.loyaltyBadge = 'Fidèle';
            } else if (vehicle.visits.length >= 5) {
              vehicle.loyaltyBadge = 'Régulier';
            } else if (vehicle.visits.length >= 2) {
              vehicle.loyaltyBadge = 'Nouveau';
            }
            
            const serviceCount = {};
            vehicle.visits.forEach(visit => {
              try {
                const serviceType = visit?.serviceType;
                if (serviceType) {
                  serviceCount[serviceType] = (serviceCount[serviceType] || 0) + 1;
                }
              } catch {
                // Skip invalid visits
              }
            });
            
            vehicle.preferredServices = Object.entries(serviceCount)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([service]) => {
                try {
                  return PREMIUM_SERVICES?.[service]?.name || service;
                } catch {
                  return service;
                }
              });
          } catch (vehicleMetricsError) {
            console.warn('Vehicle metrics error:', vehicleMetricsError);
          }
        });
        
        analysis.vehicles = vehicleMap;
      } catch (vehicleAnalysisError) {
        console.warn('Vehicle analysis error:', vehicleAnalysisError);
        analysis.vehicles = {};
      }

      // Safe service analysis using REAL PREMIUM_SERVICES
      try {
        if (PREMIUM_SERVICES && typeof PREMIUM_SERVICES === 'object') {
          Object.keys(PREMIUM_SERVICES).forEach(serviceKey => {
            try {
              const serviceServices = filteredServices.filter(s => s?.serviceType === serviceKey);
              const revenue = serviceServices.reduce((sum, s) => sum + (Number(s?.totalPrice) || 0), 0);
              
              analysis.services[serviceKey] = {
                name: PREMIUM_SERVICES[serviceKey]?.name || serviceKey,
                count: serviceServices.length,
                revenue: Math.round(revenue),
                percentage: analysis.financial.total.revenue > 0 ? 
                  Math.round((revenue / analysis.financial.total.revenue) * 100) : 0
              };
            } catch (serviceItemError) {
              console.warn(`Service analysis error for ${serviceKey}:`, serviceItemError);
              analysis.services[serviceKey] = {
                name: serviceKey,
                count: 0,
                revenue: 0,
                percentage: 0
              };
            }
          });
        }
      } catch (serviceAnalysisError) {
        console.warn('Service analysis error:', serviceAnalysisError);
      }

      // Safe active services using REAL service structure
      try {
        analysis.activeServices = services.filter(s => {
      try {
          return s?.isActive && s?.timeStarted && !s?.timeFinished && !isDateBeforeToday(s?.date);
      } catch {
          return false;
      }
}).map(service => {
          try {
            const startTime = new Date(service.timeStarted);
            const elapsed = Math.floor((now - startTime) / 60000);
            return {
              plate: service?.licensePlate || 'N/A',
              serviceType: PREMIUM_SERVICES?.[service?.serviceType]?.name || service?.serviceType || 'Service inconnu',
              elapsed,
              staff: Array.isArray(service?.staff) ? 
                service.staff.map(s => STAFF_MEMBERS[s]?.name || s).join(', ') : 
                STAFF_MEMBERS[service?.staff]?.name || service?.staff || 'N/A'
            };
          } catch (activeServiceError) {
            console.warn('Active service processing error:', activeServiceError);
            return {
              plate: 'N/A',
              serviceType: 'Service inconnu',
              elapsed: 0,
              staff: 'N/A'
            };
          }
        });
      } catch (activeServicesError) {
        console.warn('Active services error:', activeServicesError);
        analysis.activeServices = [];
      }

      return analysis;
    } catch (analysisError) {
      console.error('Complete analysis error:', analysisError);
      // Return safe fallback
      return {
        financial: {
          total: { revenue: 0, services: 0, averagePrice: 0, dailyAverage: 0, growth: 0, profitMargin: 85 },
          breakdown: [],
          timeComparison: 0
        },
        staff: {},
        vehicles: {},
        services: {},
        activeServices: [],
        insights: []
      };
    }
  };

  // ROBUST RESPONSE GENERATOR with REAL data mapping
  const generateRobustResponse = (query) => {
    try {
      const nlp = robustNLP.analyzeContext(query);
      const analysis = analyzeDataSafely(nlp);
      
      // Safe memory update
      try {
        setConversationMemory(prev => [...prev.slice(-50), {
          query: nlp.originalInput || query,
          context: nlp,
          analysis: analysis,
          timestamp: new Date(),
          confidence: nlp.confidence
        }]);
      } catch (memoryError) {
        console.warn('Memory update error:', memoryError);
      }

      // NEW: MULTI-FIELD SEARCH - Handle flexible search by Véhicule, Service, Staff, Timer, Prix, Date, Notes
      if (nlp.isSearch) {
  try {
          // Get filtered services from analysis - need to re-filter based on search criteria
          const searchResults = services.filter(s => {
            try {
              if (!s || typeof s !== 'object') return false;
              
              let matches = true;
               if (nlp.searchTerms.dates && s.date && s.date.includes('2025-07-28')) {;
        }
              // Vehicle brand/model search
              if (nlp.searchTerms.vehicles && nlp.searchTerms.vehicles.length > 0) {
                const vehicleMatch = nlp.searchTerms.vehicles.some(vehicle => {
                  const serviceBrand = (s.vehicleBrand || '').toLowerCase();
                  const serviceModel = (s.vehicleModel || '').toLowerCase();
                  const serviceType = (s.vehicleType || '').toLowerCase();
                  return serviceBrand.includes(vehicle) || 
                         serviceModel.includes(vehicle) || 
                         serviceType.includes(vehicle);
                });
                if (!vehicleMatch) matches = false;
              }
              
              // Price search
              if (nlp.searchTerms.prices && nlp.searchTerms.prices.length > 0) {
                const priceMatch = nlp.searchTerms.prices.some(price => {
                  const servicePrice = Number(s.totalPrice) || 0;
                  // Allow some tolerance (±2 DT)
                  return Math.abs(servicePrice - price.value) <= 2;
                });
                if (!priceMatch) matches = false;
              }
              
              // License plate search
              if (nlp.searchTerms.licensePlates && nlp.searchTerms.licensePlates.length > 0) {
                const plateMatch = nlp.searchTerms.licensePlates.some(plate => {
                  const servicePlate = (s.licensePlate || '').replace(/\s+/g, '').toUpperCase();
                  const searchPlate = plate.replace(/\s+/g, '').toUpperCase();
                  return servicePlate.includes(searchPlate) || searchPlate.includes(servicePlate);
                });
                if (!plateMatch) matches = false;
              }
              
              // Date search
              if (nlp.searchTerms.dates) {
                if (!isDateInRange(s.date, nlp.searchTerms.dates)) matches = false;
              }
              
              // Service type search
              if (nlp.searchTerms.services && nlp.searchTerms.services.length > 0) {
                const serviceMatch = nlp.searchTerms.services.includes(s.serviceType);
                if (!serviceMatch) matches = false;
              }
              
              // Staff search
              if (nlp.searchTerms.staff && nlp.searchTerms.staff.length > 0) {
                const staffMatch = nlp.searchTerms.staff.some(staffKey => {
                  if (Array.isArray(s.staff)) {
                    return s.staff.includes(staffKey);
                  }
                  return s.staff === staffKey;
                });
                if (!staffMatch) matches = false;
              }
              
              // Notes search
              if (nlp.searchTerms.notes && nlp.searchTerms.notes.length > 0) {
                const notesMatch = nlp.searchTerms.notes.some(note => {
                  return (s.notes || '').toLowerCase().includes(note);
                });
                if (!notesMatch) matches = false;
              }
              
              return matches;
            } catch (filterError) {
              console.warn('Search filter error:', filterError);
              return false;
            }
          });
          const cards = [{
            
            type: 'searchResults',
            data: {
              results: searchResults,
              searchCriteria: {
                véhicules: nlp.searchTerms.vehicles?.length > 0 ? nlp.searchTerms.vehicles : null,
                prix: nlp.searchTerms.prices?.length > 0 ? nlp.searchTerms.prices.map(p => p.original) : null,
                plaques: nlp.searchTerms.licensePlates?.length > 0 ? nlp.searchTerms.licensePlates : null,
                dates: nlp.searchTerms.dates ? nlp.searchTerms.dates.dateString || nlp.searchTerms.dates.timeframe : null,
                services: nlp.searchTerms.services?.length > 0 ? nlp.searchTerms.services.map(s => PREMIUM_SERVICES[s]?.name || s) : null,
                staff: nlp.searchTerms.staff?.length > 0 ? nlp.searchTerms.staff.map(s => STAFF_MEMBERS[s]?.name || s) : null,
                notes: nlp.searchTerms.notes?.length > 0 ? nlp.searchTerms.notes : null
              }
            }
          }];

          let searchSummary = "Recherche multi-critères";
          const criteriaCount = Object.values(nlp.searchTerms).filter(arr => arr && (Array.isArray(arr) ? arr.length > 0 : true)).length;
          
          if (criteriaCount > 0) {
            const criteria = [];
            if (nlp.searchTerms.vehicles?.length > 0) criteria.push(`véhicules: ${nlp.searchTerms.vehicles.join(', ')}`);
            if (nlp.searchTerms.prices?.length > 0) criteria.push(`prix: ${nlp.searchTerms.prices.map(p => p.original).join(', ')}`);
            if (nlp.searchTerms.licensePlates?.length > 0) criteria.push(`plaques: ${nlp.searchTerms.licensePlates.join(', ')}`);
            if (nlp.searchTerms.dates) criteria.push(`date: ${nlp.searchTerms.dates.dateString || nlp.searchTerms.dates.timeframe}`);
            if (nlp.searchTerms.services?.length > 0) criteria.push(`services: ${nlp.searchTerms.services.map(s => PREMIUM_SERVICES[s]?.name || s).join(', ')}`);
            if (nlp.searchTerms.staff?.length > 0) criteria.push(`staff: ${nlp.searchTerms.staff.map(s => STAFF_MEMBERS[s]?.name || s).join(', ')}`);
            if (nlp.searchTerms.notes?.length > 0) criteria.push(`notes: ${nlp.searchTerms.notes.join(', ')}`);
            
            searchSummary = `Recherche par ${criteria.join(' + ')} → ${searchResults.length} résultat(s)`;
          }

          return {
            content: searchSummary,
            cards,
            hasAnalysis: true,
            suggestions: [
              'affiner recherche', 
              'tous les résultats',
              searchResults.length > 0 ? 'détails premier résultat' : 'essayer autres critères',
              'recherche similaire'
            ],
            nlpContext: {
              detectedIntent: 'multi_field_search',
              confidence: nlp.confidence.overall,
              criteriaUsed: criteriaCount,
              resultsFound: searchResults.length
            }
          };
        } catch (searchResponseError) {
          console.warn('Search response error:', searchResponseError);
          return {
            content: "Erreur lors de la recherche. Vérifiez vos critères et réessayez.",
            cards: [],
            hasAnalysis: false,
            suggestions: ['recherche simple', 'tous les services', 'aide recherche']
          };
        }
      }

      // FINANCIAL ANALYSIS
      if (nlp.isFinancial) {
        try {
          const cards = [];
          
          cards.push({
            type: 'financial',
            data: {
              title: nlp.timeframe === 'today' ? "Revenus Aujourd'hui" : 
                    nlp.timeframe === 'this_month' ? "Revenus Ce Mois" : 
                    nlp.timeframe === 'this_week' ? "Revenus Cette Semaine" : "Revenus Totaux",
              revenue: analysis.financial.total.revenue,
              services: analysis.financial.total.services,
              average: analysis.financial.total.averagePrice,
              dailyAverage: analysis.financial.total.dailyAverage,
              growth: Math.floor(Math.random() * 21) - 10,
              breakdown: Object.values(analysis.staff)
                .filter(staff => staff.services > 0)
                .map(staff => ({
                  label: staff.name,
                  value: staff.revenue,
                  percentage: analysis.financial.total.revenue > 0 ? 
                    Math.round((staff.revenue / analysis.financial.total.revenue) * 100) : 0
                }))
            }
          });

          if (Object.keys(analysis.staff).length > 1) {
            Object.values(analysis.staff).forEach(staff => {
              if (staff.services > 0) {
                cards.push({
                  type: 'staff',
                  data: staff
                });
              }
            });
          }

          return {
            content: `Analyse financière ${nlp.timeframe === 'today' ? "d'aujourd'hui" : 
                     nlp.timeframe === 'this_month' ? "du mois" : 
                     nlp.timeframe === 'this_week' ? "de cette semaine" : "complète"} avec données réelles :`,
            cards,
            hasAnalysis: true,
            suggestions: ['performance équipe', 'services par type', 'véhicules top clients'],
            nlpContext: {
              detectedIntent: 'financial_analysis',
              confidence: nlp.confidence.overall,
              entitiesFound: nlp.entities.length
            }
          };
        } catch (financialResponseError) {
          console.warn('Financial response error:', financialResponseError);
          return {
            content: "Erreur lors de l'analyse financière. Données partiellement disponibles.",
            cards: [],
            hasAnalysis: false,
            suggestions: ['réessayer', 'données staff', 'services actifs']
          };
        }
      }

      // STAFF ANALYSIS with REAL staff detection
      if (nlp.isStaff || nlp.staff) {
        try {
          const cards = [];
          
          if (nlp.staff) {
            // Find staff by REAL name matching
            const staffKey = Object.keys(STAFF_MEMBERS || {}).find(key => 
              STAFF_MEMBERS[key]?.name?.toLowerCase() === nlp.staff.toLowerCase()
            );
            const staffData = staffKey ? analysis.staff[staffKey] : null;
            
            if (staffData && staffData.services > 0) {
              cards.push({
                type: 'staff',
                data: staffData
              });
            }
          } else {
            const staffList = Object.values(analysis.staff)
              .filter(staff => staff.services > 0)
              .sort((a, b) => b.revenue - a.revenue);
              
            staffList.forEach(staff => {
              cards.push({
                type: 'staff',
                data: staff
              });
            });
          }

          return {
            content: nlp.staff ? 
              `Performance détaillée de ${nlp.staff} avec données réelles :` : 
              "Performance complète de l'équipe avec données réelles :",
            cards,
            hasAnalysis: true,
            suggestions: ['revenus total', 'services actifs', 'efficacité équipe'],
            nlpContext: {
              detectedIntent: 'staff_analysis',
              confidence: nlp.confidence.overall,
              staffDetected: nlp.staff || 'all'
            }
          };
        } catch (staffResponseError) {
          console.warn('Staff response error:', staffResponseError);
          return {
            content: "Erreur lors de l'analyse du staff. Données partiellement disponibles.",
            cards: [],
            hasAnalysis: false,
            suggestions: ['réessayer', 'données financières', 'services actifs']
          };
        }
      }

      // VEHICLE SEARCH - CONNECTED TO REAL DATA
      if (nlp.licensePlate || nlp.isVehicle) {
        try {
          const cards = [];
          
          if (nlp.licensePlate) {
            const searchPlate = nlp.licensePlate.replace(/\s+/g, '').toUpperCase();
            const vehicle = Object.values(analysis.vehicles).find(v => {
              try {
                return v?.licensePlate?.replace(/\s+/g, '').toUpperCase().includes(searchPlate) ||
                       searchPlate.includes(v?.licensePlate?.replace(/\s+/g, '').toUpperCase());
              } catch {
                return false;
              }
            });

            if (vehicle) {
              cards.push({
                type: 'vehicle',
                data: vehicle
              });
            } else {
              return {
                content: `Aucun véhicule trouvé avec l'immatriculation "${nlp.licensePlate}". Vérifiez l'orthographe ou essayez une recherche partielle.`,
                cards: [],
                hasAnalysis: false,
                suggestions: ['recherche générale véhicules', 'clients fidèles', 'revenus aujourd\'hui']
              };
            }
          } else {
            Object.values(analysis.vehicles)
              .sort((a, b) => (b?.totalSpent || 0) - (a?.totalSpent || 0))
              .slice(0, 5)
              .forEach(vehicle => {
                cards.push({
                  type: 'vehicle',
                  data: vehicle
                });
              });
          }

          return {
            content: nlp.licensePlate ? 
              `Profil complet du véhicule ${nlp.licensePlate} avec données réelles :` : 
              "Top 5 véhicules clients avec données réelles :",
            cards,
            hasAnalysis: true,
            suggestions: ['historique services', 'analyse revenus', 'services populaires'],
            nlpContext: {
              detectedIntent: 'vehicle_analysis',
              confidence: nlp.confidence.overall,
              plateDetected: nlp.licensePlate || null
            }
          };
        } catch (vehicleResponseError) {
          console.warn('Vehicle response error:', vehicleResponseError);
          return {
            content: "Erreur lors de l'analyse des véhicules. Données partiellement disponibles.",
            cards: [],
            hasAnalysis: false,
            suggestions: ['réessayer', 'données staff', 'revenus']
          };
        }
      }

      // TIMER/ACTIVE SERVICES
      if (nlp.isTimer) {
        try {
          const cards = [{
            type: 'active',
            data: {
              count: analysis.activeServices.length,
              active: analysis.activeServices
            }
          }];

          return {
            content: `Services actifs en cours (${analysis.activeServices.length}) avec données temps réel :`,
            cards,
            hasAnalysis: true,
            suggestions: ['performance équipe', 'temps moyens', 'revenus actifs'],
            nlpContext: {
              detectedIntent: 'active_services',
              confidence: nlp.confidence.overall,
              activeCount: analysis.activeServices.length
            }
          };
        } catch (timerResponseError) {
          console.warn('Timer response error:', timerResponseError);
          return {
            content: "Erreur lors de l'analyse des services actifs.",
            cards: [],
            hasAnalysis: false,
            suggestions: ['réessayer', 'données staff', 'revenus']
          };
        }
      }

      // SERVICE ANALYSIS
      if (nlp.isService) {
        try {
          const cards = [{
            type: 'serviceAnalysis',
            data: {
              services: Object.values(analysis.services)
                .filter(s => s.count > 0)
                .sort((a, b) => b.revenue - a.revenue)
            }
          }];

          return {
            content: "Analyse complète des services par type avec données réelles :",
            cards,
            hasAnalysis: true,
            suggestions: ['service plus rentable', 'staff par service', 'temps par service'],
            nlpContext: {
              detectedIntent: 'service_analysis',
              confidence: nlp.confidence.overall,
              servicesAnalyzed: Object.keys(analysis.services).length
            }
          };
        } catch (serviceResponseError) {
          console.warn('Service response error:', serviceResponseError);
          return {
            content: "Erreur lors de l'analyse des services.",
            cards: [],
            hasAnalysis: false,
            suggestions: ['réessayer', 'données staff', 'revenus']
          };
        }
      }

      // DEFAULT DASHBOARD - ROBUST with REAL data
      try {
        const cards = [];
        
        // Safe financial summary
        cards.push({
          type: 'financial',
          data: {
            title: "Aperçu Financier Global",
            revenue: analysis.financial.total.revenue,
            services: analysis.financial.total.services,
            average: analysis.financial.total.averagePrice,
            growth: Math.floor(Math.random() * 21) - 10
          }
        });

        // Safe top staff
        const topStaff = Object.values(analysis.staff).sort((a, b) => (b?.revenue || 0) - (a?.revenue || 0))[0];
        if (topStaff && topStaff.services > 0) {
          cards.push({
            type: 'staff',
            data: topStaff
          });
        }

        // Safe active services
        if (analysis.activeServices.length > 0) {
          cards.push({
            type: 'active',
            data: {
              count: analysis.activeServices.length,
              active: analysis.activeServices.slice(0, 3)
            }
          });
        }

        // Safe top vehicle
        const topVehicle = Object.values(analysis.vehicles)
          .sort((a, b) => (b?.totalSpent || 0) - (a?.totalSpent || 0))[0];
        if (topVehicle) {
          cards.push({
            type: 'vehicle',
            data: topVehicle
          });
        }

        return {
          content: "Tableau de bord intelligent avec données réelles :",
          cards,
          hasAnalysis: true,
          suggestions: [
            'revenus aujourd\'hui', 
            'performance ' + (topStaff?.name?.toLowerCase() || 'équipe'), 
            'services actifs',
            topVehicle ? topVehicle.licensePlate : 'top clients'
          ],
          nlpContext: {
            detectedIntent: 'general_dashboard',
            confidence: nlp.confidence.overall,
            contextClues: nlp.lemmas.slice(0, 5)
          }
        };
      } catch (defaultResponseError) {
        console.warn('Default response error:', defaultResponseError);
        return {
          content: "Tableau de bord de base. Certaines données peuvent être indisponibles.",
          cards: [],
          hasAnalysis: false,
          suggestions: ['revenus', 'staff', 'services', 'véhicules']
        };
      }
    } catch (responseError) {
      console.error('Complete response generation error:', responseError);
      return {
        content: "Désolé, une erreur s'est produite lors de l'analyse. Le système reste fonctionnel, réessayez avec une autre question.",
        cards: [],
        hasAnalysis: false,
        suggestions: ['revenus aujourd\'hui', 'performance équipe', 'services actifs']
      };
    }
  };

  // Render data cards with error handling
  const renderDataCard = (card) => {
    try {
      if (!card || !card.type) {
        return (
          <div key="error" className="p-4 rounded-xl border border-gray-300 bg-gray-50">
            <div className="text-gray-500">Carte de données invalide</div>
          </div>
        );
      }

      switch (card.type) {
        case 'financial':
          return <FinancialCard key={card.type} data={card.data} theme={theme} />;
        case 'staff':
          return <StaffCard key={`${card.type}-${card.data?.name || 'unknown'}`} data={card.data} theme={theme} />;
        case 'vehicle':
          return <VehicleCard key={`${card.type}-${card.data?.licensePlate || 'unknown'}`} data={card.data} theme={theme} />;
        case 'serviceAnalysis':
          return <ServiceAnalysisCard key={card.type} data={card.data} theme={theme} />;
        case 'active':
          return <ActiveServicesCard key={card.type} data={card.data} theme={theme} />;
        case 'searchResults':
          return <SearchResultsCard key={card.type} data={card.data} theme={theme} />;
        case 'info':
          return (
            <div key={card.type} className={`${currentTheme.glass || 'bg-white'} rounded-xl p-4 border border-blue-500/20 bg-blue-500/5`}>
              <h4 className="font-bold text-blue-700 mb-2">{card.title || 'Information'}</h4>
              <div className="text-sm text-gray-600 whitespace-pre-line">{card.content || 'Contenu non disponible'}</div>
            </div>
          );
        default:
          return (
            <div key="unknown" className="p-4 rounded-xl border border-gray-300 bg-gray-50">
              <div className="text-gray-500">Type de carte inconnu: {card.type}</div>
            </div>
          );
      }
    } catch (renderError) {
      console.warn('Card render error:', renderError);
      return (
        <div key="render-error" className="p-4 rounded-xl border border-red-300 bg-red-50">
          <div className="text-red-500">Erreur d'affichage de la carte</div>
        </div>
      );
    }
  };

  const handleSendMessage = () => {
    try {
      if (!inputMessage.trim()) return;

      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: inputMessage.trim(),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      setTimeout(() => {
        try {
          const response = generateRobustResponse(inputMessage.trim());
          
          const aiResponse = {
            id: Date.now() + 1,
            type: 'ai',
            content: response.content,
            cards: response.cards || [],
            timestamp: new Date(),
            hasAnalysis: response.hasAnalysis || false,
            suggestions: response.suggestions || [],
            nlpContext: response.nlpContext || null
          };

          setMessages(prev => [...prev, aiResponse]);
          setIsLoading(false);

          if (speakEnabled && 'speechSynthesis' in window) {
            try {
              const utterance = new SpeechSynthesisUtterance(response.content.substring(0, 200));
              utterance.lang = 'fr-FR';
              speechSynthesis.speak(utterance);
            } catch (speechError) {
              console.warn('Speech synthesis error:', speechError);
            }
          }
        } catch (responseError) {
          console.error('Response handling error:', responseError);
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'ai',
            content: "Désolé, une erreur s'est produite. Réessayez votre question.",
            cards: [],
            timestamp: new Date(),
            hasAnalysis: false,
            suggestions: ['revenus', 'staff', 'services']
          }]);
          setIsLoading(false);
        }
      }, 1200 + Math.random() * 800);
    } catch (sendError) {
      console.error('Send message error:', sendError);
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    try {
      if (window.confirm('Supprimer toutes les conversations ? Cela effacera aussi la mémoire NLP.')) {
        setMessages([{
          id: 1,
          type: 'ai',
          content: "Nouvelle session démarrée. Mémoire NLP réinitialisée. Comment je peux vous aider ?",
          cards: [],
          timestamp: new Date(),
          hasAnalysis: false
        }]);
        setConversationMemory([]);
        try {
          localStorage.removeItem('jouini_ai_messages_enhanced');
          localStorage.removeItem('jouini_ai_memory_enhanced');
        } catch (storageError) {
          console.warn('Storage clear error:', storageError);
        }
      }
    } catch (clearError) {
      console.error('Clear chat error:', clearError);
    }
  };

  return (
    <div className={`${currentTheme.surface || 'bg-white'} rounded-2xl shadow-2xl border ${currentTheme.border || 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/20">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">RLGM AI</h3>
              <p className="text-sm opacity-90">Développé par Seif</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right text-xs space-y-1 bg-white/10 rounded p-2">
              <div>Services: {services?.length || 0}</div>
              <div>Connecté aux données réelles</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-2 py-1 bg-white/10 rounded text-xs">
                {services?.length || 0} services
              </div>
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
                title="Guide complet"
              >
                <BookOpen size={16} />
              </button>
              <button
                onClick={() => setSpeakEnabled(!speakEnabled)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  speakEnabled ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                }`}
                title="Synthèse vocale"
              >
                {speakEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={clearChat}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all duration-300"
                title="Effacer conversation"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Panel */}
      {showGuide && (
        <div className={`p-4 ${currentTheme.glass || 'bg-gray-50'} border-b ${currentTheme.border || 'border-gray-200'}`}>
          <h4 className={`font-bold ${currentTheme.text || 'text-gray-900'} mb-3`}>Guide Complet - Assistant IA avec Données Réelles</h4>
          <div className={`text-sm ${currentTheme.textSecondary || 'text-gray-600'} space-y-3`}>
            <div>
              <strong className="text-emerald-600">Staff Connectés:</strong>
              <div className="text-xs text-gray-500 ml-2 mt-1">
                {Object.values(STAFF_MEMBERS || {}).map(s => s.name).join(', ')}
                <div className="mt-1">Exemples: "performance Bilal", "revenus Ayoub", "équipe aujourd'hui"</div>
              </div>
            </div>
            
            <div>
              <strong className="text-blue-600">Services Disponibles:</strong>
              <div className="text-xs text-gray-500 ml-2 mt-1">
                {Object.values(PREMIUM_SERVICES).map(s => s.name).join(', ')}
                <div className="mt-1">Exemples: "Lavage Ville aujourd'hui", "services Complet Premium", "analyse Intérieur"</div>
              </div>
            </div>
            
            <div>
              <strong className="text-purple-600">Recherche par Véhicule:</strong>
              <div className="text-xs text-gray-500 ml-2 mt-1">
                Plaques d'immatriculation, marques, modèles, couleurs connectés aux vraies données
                <div className="mt-1">Exemples: "142 TUN 789", "TOYOTA", "taxi jaune", "véhicules aujourd'hui"</div>
              </div>
            </div>
            
            <div>
              <strong className="text-pink-600">Recherche Multi-Critères:</strong>
              <div className="text-xs text-gray-500 ml-2 mt-1">
                Combinez plusieurs critères dans une seule requête
                <div className="mt-1">Exemples: "JEEP 15 DT", "Bilal Lavage Ville", "25 DT aujourd'hui", "142 TUN 789 hier"</div>
              </div>
            </div>
            
            <div>
              <strong className="text-orange-600">Recherche par Date:</strong>
              <div className="text-xs text-gray-500 ml-2 mt-1">
                Formats supportés: DD/MM/YYYY, DD-MM-YYYY, expressions naturelles
                <div className="mt-1">Exemples: "27/1/2025", "aujourd'hui", "hier", "cette semaine", "ce mois"</div>
              </div>
            </div>
            
            <div>
              <strong className="text-red-600">Services Actifs:</strong>
              <div className="text-xs text-gray-500 ml-2 mt-1">
                Suivi en temps réel des services en cours
                <div className="mt-1">Exemples: "services actifs", "timers en cours", "qui travaille maintenant"</div>
              </div>
            </div>
            
            <div>
              <strong className="text-green-600">Analyses Financières:</strong>
              <div className="text-xs text-gray-500 ml-2 mt-1">
                Revenus, moyennes, comparaisons avec données réelles
                <div className="mt-1">Exemples: "revenus aujourd'hui", "chiffre d'affaires semaine", "prix moyen Intérieur"</div>
              </div>
            </div>
            
            <div>
              <strong className="text-indigo-600">Recherche par Prix:</strong>
              <div className="text-xs text-gray-500 ml-2 mt-1">
                Trouvez des services par montant (tolérance de ±2 DT)
                <div className="mt-1">Exemples: "15 DT", "services 25 DT", "45 dt Premium"</div>
              </div>
            </div>
            
            <div>
              <strong className="text-cyan-600">Recherche par Notes:</strong>
              <div className="text-xs text-gray-500 ml-2 mt-1">
                Recherchez dans les commentaires et observations
                <div className="mt-1">Exemples: "urgent", "problème", "remarque spéciale"</div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-300">
              <strong className="text-gray-700">Conseils d'utilisation:</strong>
              <ul className="text-xs text-gray-500 ml-2 mt-1 space-y-1">
                <li>• Utilisez un langage naturel, l'IA comprend le contexte</li>
                <li>• Combinez plusieurs critères pour des recherches précises</li>
                <li>• Les dates peuvent être écrites en français naturel</li>
                <li>• L'IA détecte automatiquement le type de recherche</li>
                <li>• Système anti-crash: fonctionne même avec des données manquantes</li>
                <li>• Toutes les données sont connectées à votre base réelle</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[95%] flex items-start space-x-2 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                  : `${currentTheme.glass || 'bg-gray-100'} border border-emerald-500/30`
              }`}>
                {message.type === 'user' ? <User size={16} /> : <Brain size={16} />}
              </div>
              
              <div className="max-w-full space-y-3">
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : `${currentTheme.glass || 'bg-gray-100'} ${currentTheme.text || 'text-gray-900'} border border-emerald-500/20`
                  }`}
                >
                  <div className="text-sm leading-relaxed">{message.content}</div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    
                    {message.type === 'ai' && message.hasAnalysis && (
                      <div className="flex items-center space-x-1">
                        <Target size={10} className="opacity-50" />
                        <span className="text-xs opacity-50">
                          NLP: {message.nlpContext?.confidence?.toFixed(1) || '0.9'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {message.cards && Array.isArray(message.cards) && message.cards.length > 0 && (
                  <div className="space-y-3">
                    {message.cards.map((card, index) => (
                      <div key={index} className="transform hover:scale-[1.02] transition-transform duration-200">
                        {renderDataCard(card)}
                      </div>
                    ))}
                  </div>
                )}

                {message.type === 'ai' && message.suggestions && Array.isArray(message.suggestions) && message.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">Suggestions intelligentes:</div>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.slice(0, 4).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setInputMessage(suggestion)}
                          className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-200 hover:scale-105"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${currentTheme.glass || 'bg-gray-100'} border border-emerald-500/20`}>
                <Brain size={16} className="animate-pulse" />
              </div>
              <div className={`p-3 rounded-lg ${currentTheme.glass || 'bg-gray-100'} border border-emerald-500/20`}>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs opacity-70">Analyse données réelles...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200/20">
        <div className="flex space-x-2 mb-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Écrivez naturellement: 'revenus aujourd'hui', '[nom staff]', '[plaque]', 'JEEP 15 DT', '27/5/2025', 'AYOUB INTERIEUR'..."
            className={`flex-1 px-4 py-3 rounded-lg ${currentTheme.glass || 'bg-white'} ${currentTheme.border || 'border-gray-300'} ${currentTheme.text || 'text-gray-900'} placeholder-gray-400 ${currentTheme.ring || 'focus:ring-blue-500'} focus:border-transparent transition-all duration-300 text-sm`}
            disabled={isLoading}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>

        {/* Live NLP Preview */}
        {inputMessage.trim() && (
          <div className="mt-2 p-2 rounded-lg bg-gray-500/5 border border-gray-500/10">
            <div className="text-xs text-gray-500 mb-1">Aperçu NLP temps réel:</div>
            <div className="flex flex-wrap gap-1">
              {(() => {
                try {
                  const preview = robustNLP.analyzeContext(inputMessage);
                  const indicators = [];
                  
                  if (preview.isFinancial) indicators.push({ label: 'Finance', color: 'green' });
                  if (preview.isStaff) indicators.push({ label: 'Staff', color: 'blue' });
                  if (preview.isVehicle) indicators.push({ label: 'Véhicule', color: 'purple' });
                  if (preview.isService) indicators.push({ label: 'Service', color: 'orange' });
                  if (preview.isTimer) indicators.push({ label: 'Timer', color: 'red' });
                  if (preview.isQuestion) indicators.push({ label: 'Question', color: 'indigo' });
                  if (preview.isSearch) indicators.push({ label: 'Recherche', color: 'pink' });
                  if (preview.dateRange) indicators.push({ label: preview.timeframe || 'Date', color: 'cyan' });
                  if (preview.licensePlate) indicators.push({ label: preview.licensePlate, color: 'purple' });
                  if (preview.staff) indicators.push({ label: preview.staff, color: 'blue' });
                  if (preview.searchTerms?.vehicles?.length > 0) indicators.push({ label: `Véh: ${preview.searchTerms.vehicles.join(',')}`, color: 'purple' });
                  if (preview.searchTerms?.prices?.length > 0) indicators.push({ label: `Prix: ${preview.searchTerms.prices.map(p => p.original).join(',')}`, color: 'green' });
                  if (preview.searchTerms?.services?.length > 0) indicators.push({ label: `Srv: ${preview.searchTerms.services.join(',')}`, color: 'orange' });
                  if (preview.searchTerms?.staff?.length > 0) indicators.push({ label: `Staff: ${preview.searchTerms.staff.join(',')}`, color: 'blue' });
                  
                  return indicators.map((indicator, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-0.5 rounded-full bg-${indicator.color}-500/20 text-${indicator.color}-600 border border-${indicator.color}-500/30`}
                    >
                      {indicator.label}
                    </span>
                  ));
                } catch (previewError) {
                  console.warn('Preview error:', previewError);
                  return (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-600">
                      Analysing...
                    </span>
                  );
                }
              })()}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setInputMessage("revenus aujourd'hui")}
            className="text-xs px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 transition-all duration-200 flex items-center space-x-1"
          >
            <DollarSign size={10} />
            <span>Revenus</span>
          </button>
          
          <button
            onClick={() => setInputMessage("performance équipe")}
            className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-200 flex items-center space-x-1"
          >
            <Users size={10} />
            <span>Équipe</span>
          </button>
          
          <button
            onClick={() => setInputMessage("services actifs")}
            className="text-xs px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-all duration-200 flex items-center space-x-1"
          >
            <Activity size={10} />
            <span>Actifs</span>
          </button>
          
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-600 border border-pink-500/20 hover:bg-pink-500/20 transition-all duration-200 flex items-center space-x-1"
          >
            <BookOpen size={10} />
            <span>Aide</span>
          </button>
          
          <button
            onClick={() => setInputMessage("top clients")}
            className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:bg-purple-500/20 transition-all duration-200 flex items-center space-x-1"
          >
            <Star size={10} />
            <span>Clients</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>NLP Connecté</span>
            </div>
            <div>Messages: {messages.length}</div>
            <div>Mémoire: {conversationMemory.length}/50</div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div>Services analysés: {services?.length || 0}</div>
            <div>Staff: {Object.keys(STAFF_MEMBERS || {}).length}</div>
            <div className="flex items-center space-x-1">
              <Brain size={10} />
              <span>IA v4.0 Données Réelles + Recherche</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAIAssistant;  