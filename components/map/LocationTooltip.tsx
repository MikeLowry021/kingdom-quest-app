"use client";

import React, { useEffect, useState } from 'react';
import { BiblicalLocation } from '../../lib/map/types';

interface LocationTooltipProps {
  map: google.maps.Map;
  location: BiblicalLocation;
  onClose: () => void;
}

const LocationTooltip: React.FC<LocationTooltipProps> = ({ 
  map, 
  location, 
  onClose 
}) => {
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!map || !location) return;

    // Create an info window
    const content = buildInfoWindowContent(location);
    const infoWindowInstance = new google.maps.InfoWindow({
      content,
      position: { lat: location.coordinates.lat, lng: location.coordinates.lng },
      ariaLabel: `Information about ${location.name}`
    });

    // Add close listener
    infoWindowInstance.addListener('closeclick', onClose);

    // Open the info window on the map
    infoWindowInstance.open(map);

    // Store the info window instance in state
    setInfoWindow(infoWindowInstance);

    // Cleanup function to close and remove info window when component unmounts
    return () => {
      if (infoWindowInstance) {
        infoWindowInstance.close();
      }
    };
  }, [map, location, onClose]);

  // Helper function to build the info window content
  const buildInfoWindowContent = (location: BiblicalLocation): string => {
    // Format scripture references
    const scripturesList = location.scriptures
      .map(ref => `<li>${ref}</li>`)
      .join('');

    // Create HTML content for the info window
    return `
      <div class="p-4 max-w-xs">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-lg font-bold text-gray-900">${location.name}</h3>
          <span class="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">${location.era}</span>
        </div>
        <div class="mb-3">
          <p class="text-gray-700">${location.description}</p>
        </div>
        ${location.image ? `
          <div class="mb-3">
            <img 
              src="${location.image}" 
              alt="Historical depiction of ${location.name}" 
              class="w-full h-auto rounded-md"
              loading="lazy"
            />
          </div>
        ` : ''}
        <div class="mb-2">
          <h4 class="text-sm font-semibold text-gray-800">Scripture References:</h4>
          <ul class="text-xs text-gray-600 list-disc pl-4">
            ${scripturesList}
          </ul>
        </div>
        <div class="mt-3 text-right">
          <button 
            class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm px-2 py-1"
            onclick="window.location.href='/quest/${location.relatedQuestId || ''}'"
            aria-label="Explore quest related to ${location.name}"
          >
            Explore Related Quest
          </button>
        </div>
      </div>
    `;
  };

  return null; // The info window is managed by the Google Maps API, not React DOM
};

export default LocationTooltip;