import { BiblicalLocation } from '../types';

/**
 * Caches biblical locations data in localStorage for offline use
 * @param locations BiblicalLocation array to cache
 */
export const cacheLocationsData = (locations: BiblicalLocation[]): void => {
  try {
    localStorage.setItem('map_locations', JSON.stringify(locations));
    localStorage.setItem('map_locations_timestamp', Date.now().toString());
    console.log('Map locations cached successfully');
  } catch (error) {
    console.error('Failed to cache map locations:', error);
  }
};

/**
 * Retrieves cached biblical locations data from localStorage
 * @returns BiblicalLocation[] or null if no cached data exists
 */
export const getCachedLocations = (): BiblicalLocation[] | null => {
  try {
    const cachedData = localStorage.getItem('map_locations');
    if (!cachedData) return null;
    return JSON.parse(cachedData) as BiblicalLocation[];
  } catch (error) {
    console.error('Failed to retrieve cached map locations:', error);
    return null;
  }
};

/**
 * Checks if cached data is still valid (not too old)
 * @param maxAgeHours Maximum age of cache in hours
 * @returns boolean indicating if cache is valid
 */
export const isCacheValid = (maxAgeHours: number = 24): boolean => {
  try {
    const timestamp = localStorage.getItem('map_locations_timestamp');
    if (!timestamp) return false;
    
    const cachedTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    
    return (currentTime - cachedTime) < maxAgeMs;
  } catch (error) {
    console.error('Failed to check cache validity:', error);
    return false;
  }
};

/**
 * Saves the user's last viewed map position and zoom level
 * @param center Map center coordinates
 * @param zoom Map zoom level
 */
export const saveMapPosition = (center: {lat: number, lng: number}, zoom: number): void => {
  try {
    localStorage.setItem('map_last_position', JSON.stringify({
      center,
      zoom,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Failed to save map position:', error);
  }
};

/**
 * Retrieves the user's last viewed map position and zoom level
 * @returns Object containing center coordinates and zoom level, or null if not found
 */
export const getLastMapPosition = (): {center: {lat: number, lng: number}, zoom: number} | null => {
  try {
    const positionData = localStorage.getItem('map_last_position');
    if (!positionData) return null;
    
    const data = JSON.parse(positionData);
    return {
      center: data.center,
      zoom: data.zoom
    };
  } catch (error) {
    console.error('Failed to retrieve last map position:', error);
    return null;
  }
};
