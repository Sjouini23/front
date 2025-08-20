export const VEHICLE_BRANDS = {
  premium: ['Audi', 'BMW', 'Mercedes-Benz', 'Lexus', 'Infiniti', 'Acura', 'Genesis', 'Volvo'],
  luxury: ['Porsche', 'Jaguar', 'Land Rover', 'Bentley', 'Ferrari', 'Lamborghini', 'Maserati', 'Aston Martin'],
  mainstream: ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Hyundai', 'Kia', 'Mahindra','BYD','SsangYong'],
  european: ['Volkswagen', 'Renault', 'Peugeot', 'Citroën', 'Fiat', 'Alfa Romeo', 'Opel', 'SEAT', 'Skoda', 'TATA', 'Chery', 'MG Motors','Lancia','Cupra','Dacia','Tapis','Isuzu motors'],
  american: ['Ford', 'Chevrolet', 'Cadillac', 'Lincoln', 'Jeep', 'Dodge', 'Chrysler' , 'Haval', 'Suzuki', ],
  local: ['Wallyscar', 'STAFIM'],
};

export const ALL_BRANDS = Object.values(VEHICLE_BRANDS).flat().sort();

// ENHANCED VEHICLE_TYPES with TAXI
export const VEHICLE_TYPES = {
  voiture: {
    name: 'Voiture',
    icon: '🚗',
    color: 'blue',
    description: 'Véhicule de tourisme standard'
  },
  camion: {
    name: 'Camion',
    icon: '🚛',
    color: 'orange',
    description: 'Véhicule utilitaire lourd'
  },
  moto: {
    name: 'Moto',
    icon: '🏍️',
    color: 'green',
    description: 'Motocyclette et scooter'
  },
  taxi: {
    name: 'Taxi',
    icon: '🚕',
    color: 'yellow',
    description: 'Véhicule taxi professionnel'
  }
};

// REORDERED SERVICE_TYPES - moved intérieur + extérieur before complet and renamed as requested
export const SERVICE_TYPES = {
  rapide: {
    name: 'Lavage Rapide',
    icon: '⚡',
    description: 'Nettoyage extérieur express pour un véhicule propre en quelques minutes',
    features: ['Extérieur seulement', 'Séchage rapide', 'Produits premium'],
    duration: 15,
    basePrice: 8,
    color: 'blue'
  },
  exterieur: {
    name: 'Extérieur Complet',
    icon: '🌟',
    description: 'Nettoyage extérieur approfondi avec finition brillante',
    features: ['Lavage carrosserie', 'Jantes et pneus', 'Séchage premium'],
    duration: 30,
    basePrice: 15,
    color: 'green'
  },
  interieur: {
    name: 'Intérieur Profond',
    icon: '🧼',
    description: 'Nettoyage intérieur complet avec aspiration et désinfection',
    features: ['Aspiration complète', 'Tableaux de bord', 'Désinfection'],
    duration: 45,
    basePrice: 20,
    color: 'purple'
  },
  'interieur-exterieur': {
    name: 'Lavage Ville', // RENAMED as requested
    icon: '🏙️',
    description: 'Nettoyage intérieur et extérieur standard pour circulation urbaine',
    features: ['Intérieur + Extérieur', 'Finition standard', 'Séchage inclus'],
    duration: 60,
    basePrice: 30,
    color: 'blue'
  },
  complet: {
    name: 'Service Complet',
    icon: '✨',
    description: 'Service de nettoyage complet premium avec tous les services inclus',
    features: ['Tout inclus', 'Finition premium', 'Garantie qualité'],
    duration: 90,
    basePrice: 45,
    color: 'purple'
  }
};

export const STAFF_MEMBERS = {
  bilal: { name: 'Bilal', color: 'blue', icon: '👨‍🔧', emoji: '💪' },
  ayoub: { name: 'Ayoub', color: 'green', icon: '👨‍💼', emoji: '🎯' }
};

export const VEHICLE_COLORS = [
  { name: 'Blanc', value: 'blanc', hex: '#FFFFFF' },
  { name: 'Noir', value: 'noir', hex: '#000000' },
  { name: 'Gris', value: 'gris', hex: '#6B7280' },
  { name: 'Rouge', value: 'rouge', hex: '#EF4444' },
  { name: 'Bleu', value: 'bleu', hex: '#3B82F6' },
  { name: 'Vert', value: 'vert', hex: '#10B981' },
  { name: 'Jaune', value: 'jaune', hex: '#F59E0B' },
  { name: 'Marron', value: 'marron', hex: '#92400E' }
];

