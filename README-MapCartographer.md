# MapCartographer Module

## Overview
The MapCartographer module is an interactive biblical map feature for the KingdomQuest application. It allows users to explore key locations from biblical times, learning about their historical significance and connection to biblical stories.

## Features
- Interactive Google Maps integration with biblical locations marked
- Filtering by era (Old Testament, New Testament, Intertestamental)
- Rich tooltips showing location details, scripture references, and illustrations
- Offline capability with local data caching
- Full accessibility support with keyboard navigation and ARIA attributes

## File Structure

### Components
- `/components/map/MapCartographer.tsx` - Main map component
- `/components/map/LocationMarker.tsx` - Individual marker component
- `/components/map/LocationTooltip.tsx` - Tooltip component for location details

### Library
- `/lib/map/types.ts` - TypeScript interfaces for map data
- `/lib/map/data/biblical-locations.json` - Biblical location database
- `/lib/map/utils/mapUtils.ts` - Map utility functions
- `/lib/map/utils/storageUtils.ts` - Local storage utilities for offline support

### Documentation
- `/docs/map/authoring.md` - Guide for adding new locations

### Assets
- `/public/images/map/marker-*.png` - Map marker icons for different eras
- `/public/images/map/locations/*.png` - Location illustrations

## Integration
The MapCartographer is integrated into the KingdomQuest app via:
1. A dedicated route at `/map` (implemented in `/app/map/page.tsx`)
2. Navigation link in the main menu under "Map Explorer"

## Usage

### Basic Usage
```tsx
// Example usage in a page component
import MapCartographer from '@/components/map/MapCartographer';

export default function MapPage() {
  return (
    <div className="container">
      <h1>Biblical Map Explorer</h1>
      <MapCartographer apiKey="YOUR_GOOGLE_MAPS_API_KEY" />
    </div>
  );
}
```

### Props
- `apiKey` (string, required): Google Maps API key
- `initialCenter` (object, optional): Default map center coordinates
- `initialZoom` (number, optional): Default zoom level

## Accessibility
The MapCartographer component is built with accessibility in mind:
- All interactive elements are keyboard navigable
- ARIA labels and roles are used appropriately
- Color contrast meets WCAG guidelines
- Screen reader support for map elements

## Offline Support
The module includes offline capability:
- Location data is cached in localStorage
- The last viewed map position is remembered
- Fallback UI for when maps API is unavailable
