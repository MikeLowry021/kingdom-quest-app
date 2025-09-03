import biblicalLocations from '../data/biblical-locations.json';
import { BiblicalLocation, MapSettings } from '../types';

/**
 * Fetches biblical locations data from JSON file or API
 * @returns Promise<BiblicalLocation[]>
 */
export const getBiblicalLocations = async (): Promise<BiblicalLocation[]> => {
  try {
    // In a real application, this might be fetched from an API
    // For now, we'll return the imported JSON data
    return Promise.resolve(biblicalLocations);
  } catch (error) {
    console.error('Error fetching biblical locations:', error);
    return [];
  }
};

/**
 * Filters locations by era
 * @param locations Array of biblical locations
 * @param era Era to filter by (oldTestament, newTestament, intertestamental)
 * @returns Filtered array of locations
 */
export const filterLocationsByEra = (
  locations: BiblicalLocation[],
  era: 'oldTestament' | 'newTestament' | 'intertestamental' | 'all'
): BiblicalLocation[] => {
  if (era === 'all') return locations;
  return locations.filter(location => location.era === era);
};

/**
 * Gets the default map settings, with offline mode detection
 * @returns MapSettings object
 */
export const getMapSettings = (): MapSettings => {
  // Check if we're offline
  const isOffline = !navigator.onLine;
  
  return {
    defaultCenter: { lat: 31.7683, lng: 35.2137 }, // Jerusalem
    defaultZoom: 8,
    offlineMode: isOffline
  };
};

/**
 * Calculates the bounding box to fit all provided locations
 * @param locations Array of biblical locations
 * @returns LatLngBounds compatible object
 */
export const getBoundsForLocations = (locations: BiblicalLocation[]): {
  north: number;
  south: number;
  east: number;
  west: number;
} => {
  if (!locations.length) {
    // Default to a view centered on Israel if no locations
    return {
      north: 33.5, // Northern Israel
      south: 29.5, // Southern Israel
      east: 36.0, // Eastern border
      west: 34.0, // Mediterranean coast
    };
  }

  // Find the extremes
  let north = -90, south = 90, east = -180, west = 180;

  locations.forEach(location => {
    const { lat, lng } = location.coordinates;
    
    north = Math.max(north, lat);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    west = Math.min(west, lng);
  });

  // Add some padding
  north += 0.5;
  south -= 0.5;
  east += 0.5;
  west -= 0.5;

  return { north, south, east, west };
};

/**
 * Finds a location by ID
 * @param locationId ID of the location to find
 * @returns BiblicalLocation or undefined if not found
 */
export const getLocationById = (locationId: string): BiblicalLocation | undefined => {
  return biblicalLocations.find(location => location.id === locationId);
};

/**
 * Gets scripture references for a specific location
 * @param locationId ID of the location
 * @returns Array of scripture references
 */
export const getScriptureReferencesForLocation = (locationId: string): string[] => {
  const location = getLocationById(locationId);
  return location ? location.scriptures : [];
};
