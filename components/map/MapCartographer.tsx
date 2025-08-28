"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import LocationMarker from './LocationMarker';
import LocationTooltip from './LocationTooltip';
import { getBiblicalLocations } from '../../lib/map/utils/mapUtils';
import { BiblicalLocation } from '../../lib/map/types';
import { 
  cacheLocationsData, 
  getCachedLocations, 
  isCacheValid,
  saveMapPosition,
  getLastMapPosition
} from '../../lib/map/utils/storageUtils';

interface MapCartographerProps {
  apiKey: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

type Era = 'all' | 'oldTestament' | 'newTestament' | 'intertestamental';

const MapCartographer: React.FC<MapCartographerProps> = ({
  apiKey,
  initialCenter = { lat: 31.7683, lng: 35.2137 }, // Default to Jerusalem
  initialZoom = 8,
}) => {
  const [locations, setLocations] = useState<BiblicalLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<BiblicalLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<BiblicalLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [activeEra, setActiveEra] = useState<Era>('all');
  const mapRef = useRef<HTMLDivElement>(null);

  // Load biblical locations data
  useEffect(() => {
    const loadLocations = async () => {
      try {
        // Check if we have valid cached data first
        if (isCacheValid(24)) {
          const cachedLocations = getCachedLocations();
          if (cachedLocations && cachedLocations.length > 0) {
            console.log('Using cached map data');
            setLocations(cachedLocations);
            setFilteredLocations(cachedLocations);
            setIsLoading(false);
            return;
          }
        }

        // If no valid cache, fetch from API/JSON
        const data = await getBiblicalLocations();
        setLocations(data);
        setFilteredLocations(data);
        
        // Cache the data for offline use
        if (data.length > 0) {
          cacheLocationsData(data);
        }
      } catch (error) {
        console.error('Failed to load biblical locations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLocations();
  }, []);

  // Initialize map when the component mounts
  useEffect(() => {
    if (mapRef.current && !mapInstance) {
      // Check if we have a saved position
      const savedPosition = getLastMapPosition();
      const mapCenter = savedPosition ? savedPosition.center : initialCenter;
      const mapZoom = savedPosition ? savedPosition.zoom : initialZoom;

      const mapOptions: google.maps.MapOptions = {
        center: mapCenter,
        zoom: mapZoom,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
        // Add a biblical style to the map
        styles: [
          // Custom map styles can be added here
        ]
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);
      
      // Save position when map changes
      map.addListener('idle', () => {
        const center = map.getCenter();
        if (center) {
          saveMapPosition(
            { lat: center.lat(), lng: center.lng() },
            map.getZoom() || mapZoom
          );
        }
      });
      
      setMapInstance(map);
    }
  }, [initialCenter, initialZoom, mapInstance]);

  // Filter locations when era filter changes
  useEffect(() => {
    if (locations.length > 0) {
      if (activeEra === 'all') {
        setFilteredLocations(locations);
      } else {
        const filtered = locations.filter(location => location.era === activeEra);
        setFilteredLocations(filtered);
      }
    }
  }, [locations, activeEra]);

  // Handle marker click to show tooltip
  const handleMarkerClick = (location: BiblicalLocation) => {
    setSelectedLocation(location);
  };

  // Handle closing the tooltip
  const handleCloseTooltip = () => {
    setSelectedLocation(null);
  };

  // If Google Maps API key is missing, show an error message
  if (!apiKey) {
    return (
      <div className="p-6 bg-red-50 text-red-800 rounded-lg" role="alert">
        <h2 className="text-lg font-semibold">Google Maps API Key Missing</h2>
        <p>Please provide a valid Google Maps API key to load the map.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] relative rounded-lg overflow-hidden">
      <div className="absolute top-3 right-3 z-10 bg-white rounded-md shadow-md p-2">
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setActiveEra('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${activeEra === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            aria-pressed={activeEra === 'all'}
          >
            All Eras
          </button>
          <button
            onClick={() => setActiveEra('oldTestament')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${activeEra === 'oldTestament' ? 'bg-[#B87333] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            aria-pressed={activeEra === 'oldTestament'}
          >
            Old Testament
          </button>
          <button
            onClick={() => setActiveEra('newTestament')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${activeEra === 'newTestament' ? 'bg-[#4169E1] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            aria-pressed={activeEra === 'newTestament'}
          >
            New Testament
          </button>
          <button
            onClick={() => setActiveEra('intertestamental')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${activeEra === 'intertestamental' ? 'bg-[#8A2BE2] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            aria-pressed={activeEra === 'intertestamental'}
          >
            Intertestamental
          </button>
        </div>
      </div>
      <Wrapper apiKey={apiKey} libraries={['places']}>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
              <p className="mt-2 text-gray-600">Loading Biblical Map...</p>
            </div>
          </div>
        ) : (
          <>
            <div 
              ref={mapRef} 
              className="w-full h-full" 
              aria-label="Interactive map of biblical locations"
              role="application"
            />
            {mapInstance && filteredLocations.map((location) => (
              <LocationMarker
                key={location.id}
                map={mapInstance}
                location={location}
                onClick={() => handleMarkerClick(location)}
              />
            ))}
            {selectedLocation && mapInstance && (
              <LocationTooltip
                map={mapInstance}
                location={selectedLocation}
                onClose={handleCloseTooltip}
              />
            )}
          </>
        )}
      </Wrapper>
    </div>
  );
};

export default MapCartographer;