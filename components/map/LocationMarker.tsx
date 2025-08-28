"use client";

import React, { useEffect, useState } from 'react';
import { BiblicalLocation } from '../../lib/map/types';

interface LocationMarkerProps {
  map: google.maps.Map;
  location: BiblicalLocation;
  onClick: () => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ 
  map, 
  location, 
  onClick 
}) => {
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create a marker instance
    const markerInstance = new google.maps.Marker({
      position: { lat: location.coordinates.lat, lng: location.coordinates.lng },
      map,
      title: location.name,
      animation: google.maps.Animation.DROP,
      // Add icon based on the location's era
      icon: {
        url: getIconForEra(location.era),
        scaledSize: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 32)
      },
      // For accessibility
      optimized: false
    });

    // Add click event listener
    markerInstance.addListener('click', onClick);

    // Add keyboard focus support for accessibility
    markerInstance.addListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClick();
      }
    });

    // Store marker instance in state
    setMarker(markerInstance);

    // Cleanup function to remove marker when component unmounts
    return () => {
      if (markerInstance) {
        markerInstance.setMap(null);
      }
    };
  }, [map, location, onClick]);

  // Helper function to get the appropriate icon based on era
  const getIconForEra = (era: string): string => {
    switch (era) {
      case 'oldTestament':
        return '/images/map/marker-old-testament.png';
      case 'newTestament':
        return '/images/map/marker-new-testament.png';
      case 'intertestamental':
        return '/images/map/marker-intertestamental.png';
      default:
        return '/images/map/marker-default.png';
    }
  };

  return null; // The marker is managed by the Google Maps API, not React DOM
};

export default LocationMarker;