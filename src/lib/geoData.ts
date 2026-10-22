export interface CityGeo {
  latitude: number;
  longitude: number;
  streetFallback: string;
}

export const CITY_GEO_COORDINATES: Record<string, CityGeo> = {
  // United States
  'new-york': { latitude: 40.7128, longitude: -74.0060, streetFallback: 'Manhattan' },
  'los-angeles': { latitude: 34.0522, longitude: -118.2437, streetFallback: 'Downtown' },
  'chicago': { latitude: 41.8781, longitude: -87.6298, streetFallback: 'The Loop' },
  'miami': { latitude: 25.7617, longitude: -80.1918, streetFallback: 'South Beach' },
  'las-vegas': { latitude: 36.1699, longitude: -115.1398, streetFallback: 'Las Vegas Blvd' },
  'boston': { latitude: 42.3601, longitude: -71.0589, streetFallback: 'Back Bay' },
  'san-francisco': { latitude: 37.7749, longitude: -122.4194, streetFallback: 'Nob Hill' },
  'washington-dc': { latitude: 38.9072, longitude: -77.0369, streetFallback: 'Downtown DC' },
  'austin': { latitude: 30.2672, longitude: -97.7431, streetFallback: 'Downtown Austin' },
  'seattle': { latitude: 47.6062, longitude: -122.3321, streetFallback: 'Downtown Seattle' },
  'nashville': { latitude: 36.1627, longitude: -86.7816, streetFallback: 'Downtown Nashville' },
  'new-orleans': { latitude: 29.9511, longitude: -90.0715, streetFallback: 'French Quarter' },
  'houston': { latitude: 29.7604, longitude: -95.3698, streetFallback: 'Downtown Houston' },
  'dallas': { latitude: 32.7767, longitude: -96.7970, streetFallback: 'Downtown Dallas' },
  'atlanta': { latitude: 33.7490, longitude: -84.3880, streetFallback: 'Buckhead' },
  'denver': { latitude: 39.7392, longitude: -104.9903, streetFallback: 'Downtown Denver' },
  'phoenix': { latitude: 33.4484, longitude: -112.0740, streetFallback: 'Downtown Phoenix' },
  'philadelphia': { latitude: 39.9526, longitude: -75.1652, streetFallback: 'Center City' },
  'san-diego': { latitude: 32.7157, longitude: -117.1611, streetFallback: 'Gaslamp Quarter' },
  'honolulu': { latitude: 21.3069, longitude: -157.8583, streetFallback: 'Waikiki Beach' },
  'maui': { latitude: 20.7984, longitude: -156.3319, streetFallback: 'Wailea' },
  'napa': { latitude: 38.2975, longitude: -122.2869, streetFallback: 'Napa Valley' },
  'aspen': { latitude: 39.1911, longitude: -106.8175, streetFallback: 'Downtown Aspen' },
  'key-west': { latitude: 24.5551, longitude: -81.7800, streetFallback: 'Old Town Key West' },
  'charleston': { latitude: 32.7765, longitude: -79.9311, streetFallback: 'Historic District' },
  'savannah': { latitude: 32.0809, longitude: -81.0912, streetFallback: 'Historic District' },
  'baltimore': { latitude: 39.2904, longitude: -76.6122, streetFallback: 'Inner Harbor' },
  'kansas-city': { latitude: 39.0997, longitude: -94.5786, streetFallback: 'Country Club Plaza' },
  'poconos': { latitude: 41.1343, longitude: -75.2977, streetFallback: 'Pocono Mountains' },
  'sedona': { latitude: 34.8697, longitude: -111.7610, streetFallback: 'Uptown Sedona' },
  'gatlinburg': { latitude: 35.7143, longitude: -83.5102, streetFallback: 'Parkway' },
  'scottsdale': { latitude: 33.4942, longitude: -111.9261, streetFallback: 'Old Town Scottsdale' },
  'palm-springs': { latitude: 33.8303, longitude: -116.5453, streetFallback: 'Palm Canyon Drive' },

  // United Kingdom
  'london': { latitude: 51.5074, longitude: -0.1278, streetFallback: 'Mayfair' },
  'edinburgh': { latitude: 55.9533, longitude: -3.1883, streetFallback: 'Old Town' },
  'bath': { latitude: 51.3811, longitude: -2.3590, streetFallback: 'Royal Crescent' },
  'cotswolds': { latitude: 51.8330, longitude: -1.8433, streetFallback: 'High Street' },
  'manchester': { latitude: 53.4808, longitude: -2.2426, streetFallback: 'City Centre' },
  'birmingham': { latitude: 52.4862, longitude: -1.8904, streetFallback: 'Colmore Row' },
  'oxford': { latitude: 51.7520, longitude: -1.2577, streetFallback: 'Broad Street' },
  'cambridge': { latitude: 52.2053, longitude: 0.1218, streetFallback: 'Bridge Street' },
  'york': { latitude: 53.9590, longitude: -1.0815, streetFallback: 'The Shambles' },

  // France
  'paris': { latitude: 48.8566, longitude: 2.3522, streetFallback: '1er Arrondissement' },
  'nice': { latitude: 43.7102, longitude: 7.2620, streetFallback: 'Promenade des Anglais' },
  'cannes': { latitude: 43.5528, longitude: 7.0174, streetFallback: 'Boulevard de la Croisette' },
  'lyon': { latitude: 45.7640, longitude: 4.8357, streetFallback: 'Presqu\'île' },
  'marseille': { latitude: 43.2965, longitude: 5.3698, streetFallback: 'Vieux-Port' },
  'bordeaux': { latitude: 44.8378, longitude: -0.5792, streetFallback: 'Place de la Bourse' },
  'strasbourg': { latitude: 48.5734, longitude: 7.7521, streetFallback: 'Petite France' },

  // Italy
  'rome': { latitude: 41.9028, longitude: 12.4964, streetFallback: 'Centro Storico' },
  'milan': { latitude: 45.4642, longitude: 9.1900, streetFallback: 'Duomo District' },
  'florence': { latitude: 43.7696, longitude: 11.2558, streetFallback: 'Piazza del Duomo' },
  'venice': { latitude: 45.4408, longitude: 12.3155, streetFallback: 'San Marco' },
  'amalfi': { latitude: 40.6340, longitude: 14.6027, streetFallback: 'Amalfi Coast Drive' },
  'positano': { latitude: 40.6281, longitude: 14.4850, streetFallback: 'Via Cristoforo Colombo' },
  'lake-como': { latitude: 45.9934, longitude: 9.2577, streetFallback: 'Bellagio' },

  // Spain
  'barcelona': { latitude: 41.3879, longitude: 2.1699, streetFallback: 'Passeig de Gràcia' },
  'madrid': { latitude: 40.4168, longitude: -3.7038, streetFallback: 'Gran Vía' },
  'seville': { latitude: 37.3891, longitude: -5.9845, streetFallback: 'Santa Cruz' },
  'mallorca': { latitude: 39.6953, longitude: 3.0176, streetFallback: 'Palma Old Town' },
  'ibiza': { latitude: 38.9067, longitude: 1.4206, streetFallback: 'Marina Botafoch' },

  // Greece
  'athens': { latitude: 37.9838, longitude: 23.7275, streetFallback: 'Plaka' },
  'santorini': { latitude: 36.3932, longitude: 25.4615, streetFallback: 'Oia' },
  'mykonos': { latitude: 37.4467, longitude: 25.3289, streetFallback: 'Chora' },
  'crete': { latitude: 35.2401, longitude: 24.8093, streetFallback: 'Chania Old Town' },

  // Other European
  'amsterdam': { latitude: 52.3676, longitude: 4.9041, streetFallback: 'Herengracht' },
  'berlin': { latitude: 52.5200, longitude: 13.4050, streetFallback: 'Mitte' },
  'munich': { latitude: 48.1351, longitude: 11.5820, streetFallback: 'Altstadt-Lehel' },
  'vienna': { latitude: 48.2082, longitude: 16.3738, streetFallback: 'Innere Stadt' },
  'zurich': { latitude: 47.3769, longitude: 8.5417, streetFallback: 'Bahnhofstrasse' },
  'geneva': { latitude: 46.2044, longitude: 6.1432, streetFallback: 'Quai du Mont-Blanc' },
  'prague': { latitude: 50.0755, longitude: 14.4378, streetFallback: 'Old Town' },
  'budapest': { latitude: 47.4979, longitude: 19.0402, streetFallback: 'District V' },
  'dublin': { latitude: 53.3498, longitude: -6.2603, streetFallback: 'Temple Bar' },
  'lisbon': { latitude: 38.7223, longitude: -9.1393, streetFallback: 'Baixa' },
  'porto': { latitude: 41.1579, longitude: -8.6291, streetFallback: 'Ribeira' },

  // Asia / Middle East
  'tokyo': { latitude: 35.6762, longitude: 139.6503, streetFallback: 'Shinjuku' },
  'kyoto': { latitude: 35.0116, longitude: 135.7681, streetFallback: 'Gion' },
  'bangkok': { latitude: 13.7563, longitude: 100.5018, streetFallback: 'Sukhumvit' },
  'phuket': { latitude: 7.8804, longitude: 98.3923, streetFallback: 'Patong Beach' },
  'singapore': { latitude: 1.3521, longitude: 103.8198, streetFallback: 'Marina Bay' },
  'bali': { latitude: -8.3405, longitude: 115.0920, streetFallback: 'Seminyak' },
  'dubai': { latitude: 25.2048, longitude: 55.2708, streetFallback: 'Downtown Dubai' },
  'abu-dhabi': { latitude: 24.4539, longitude: 54.3773, streetFallback: 'Corniche Road' },

  // India
  'delhi': { latitude: 28.6139, longitude: 77.2090, streetFallback: 'Connaught Place' },
  'new-delhi': { latitude: 28.6139, longitude: 77.2090, streetFallback: 'Connaught Place' },
  'mumbai': { latitude: 19.0760, longitude: 72.8777, streetFallback: 'Colaba' },
  'bangalore': { latitude: 12.9716, longitude: 77.5946, streetFallback: 'MG Road' },
  'bengaluru': { latitude: 12.9716, longitude: 77.5946, streetFallback: 'MG Road' },
  'kolkata': { latitude: 22.5726, longitude: 88.3639, streetFallback: 'Park Street' },
  'chennai': { latitude: 13.0827, longitude: 80.2707, streetFallback: 'Nungambakkam' },
  'hyderabad': { latitude: 17.3850, longitude: 78.4867, streetFallback: 'Banjara Hills' },
  'jaipur': { latitude: 26.9124, longitude: 75.7873, streetFallback: 'Pink City' },
  'udaipur': { latitude: 24.5854, longitude: 73.7125, streetFallback: 'Lake Pichola' },
  'goa': { latitude: 15.2993, longitude: 74.1240, streetFallback: 'Candolim' },
  'munnar': { latitude: 10.0889, longitude: 77.0595, streetFallback: 'Tea Valley Road' },
  'manali': { latitude: 32.2432, longitude: 77.1892, streetFallback: 'Old Manali Road' },
  'shimla': { latitude: 31.1048, longitude: 77.1734, streetFallback: 'The Mall Road' },
  'rishikesh': { latitude: 30.0869, longitude: 78.2676, streetFallback: 'Tapovan' },
  'agra': { latitude: 27.1767, longitude: 78.0081, streetFallback: 'Fatehabad Road' },
  'pune': { latitude: 18.5204, longitude: 73.8567, streetFallback: 'Koregaon Park' },
  'ahmedabad': { latitude: 23.0225, longitude: 72.5714, streetFallback: 'SG Highway' },
  'kochi': { latitude: 9.9312, longitude: 76.2673, streetFallback: 'Fort Kochi' },
  'ooty': { latitude: 11.4100, longitude: 76.6950, streetFallback: 'Club Road' },
  'coorg': { latitude: 12.3375, longitude: 75.8069, streetFallback: 'Madikeri' },
  'mussoorie': { latitude: 30.4598, longitude: 78.0644, streetFallback: 'Mall Road' },
  'amritsar': { latitude: 31.6340, longitude: 74.8723, streetFallback: 'Golden Temple Road' },

  // Australia / Canada
  'sydney': { latitude: -33.8688, longitude: 151.2093, streetFallback: 'Circular Quay' },
  'melbourne': { latitude: -37.8136, longitude: 144.9631, streetFallback: 'Collins Street' },
  'toronto': { latitude: 43.6532, longitude: -79.3832, streetFallback: 'Downtown Toronto' },
  'vancouver': { latitude: 49.2827, longitude: -123.1207, streetFallback: 'Burrard Street' },
  'montreal': { latitude: 45.5017, longitude: -73.5673, streetFallback: 'Old Montreal' },
};

export function getCityGeoCoordinates(citySlug: string): CityGeo {
  const normalized = citySlug.toLowerCase().trim();
  if (CITY_GEO_COORDINATES[normalized]) {
    return CITY_GEO_COORDINATES[normalized];
  }
  // Generic fallback if completely unrecognized
  return {
    latitude: 37.0902,
    longitude: -95.7129,
    streetFallback: 'Central District'
  };
}
