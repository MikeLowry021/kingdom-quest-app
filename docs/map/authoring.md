# Map Cartographer Authoring Guide

## Overview

The MapCartographer module allows users to explore biblical locations and stories through an interactive map interface. This document provides guidelines for adding new locations, updating existing ones, and managing the map data.

## Location Data Structure

Biblical locations are stored in `lib/map/data/biblical-locations.json` and follow this structure:

```typescript
interface BiblicalLocation {
  id: string;                // Unique identifier for the location
  name: string;              // Name of the biblical location
  description: string;       // Brief description of the location's significance
  era: 'oldTestament' | 'newTestament' | 'intertestamental'; // Historical era
  coordinates: {             // Geographic coordinates
    lat: number;             // Latitude
    lng: number;             // Longitude
  };
  scriptures: string[];      // Array of scripture references
  image?: string;            // Path to an illustration (optional)
  relatedQuestId?: string;   // ID of a related quest in the app (optional)
}
```

## Adding a New Location

To add a new biblical location:

1. Edit `lib/map/data/biblical-locations.json`
2. Add a new location object following the structure above
3. Ensure the `id` is unique
4. Verify coordinates are accurate
5. Include relevant scripture references
6. Add an appropriate image to `/public/images/map/`

### Example

```json
{
  "id": "capernaum",
  "name": "Capernaum",
  "description": "The town where Jesus based His ministry in Galilee, called His 'own city'.",
  "era": "newTestament",
  "coordinates": {
    "lat": 32.8808,
    "lng": 35.5751
  },
  "scriptures": [
    "Matthew 4:13",
    "Matthew 8:5-13",
    "Mark 1:21-28",
    "Luke 7:1-10"
  ],
  "image": "/images/map/capernaum.png",
  "relatedQuestId": "jesus-ministry-galilee"
}
```

## Marker Icons

Marker icons are automatically assigned based on the location's era:

- Old Testament: `/public/images/map/marker-old-testament.png`
- New Testament: `/public/images/map/marker-new-testament.png`
- Intertestamental: `/public/images/map/marker-intertestamental.png`

Ensure these images exist in your project.

## Accessibility Requirements

When adding new locations, please follow these accessibility guidelines:

1. Write clear, concise descriptions that provide contextual information
2. Include accurate scripture references that help users connect the location to biblical narratives
3. Ensure location images are appropriate for all age groups
4. Use descriptive ID values that reflect the location name

## Offline Support

The MapCartographer module includes offline support through static map tiles and local data storage. To ensure your locations work in offline mode:

1. Keep image sizes reasonable (recommend < 100KB per image)
2. Test your additions in offline mode by toggling your browser's network connection

## Connecting to Quests

To link a location to an existing quest in the KingdomQuest application:

1. Find the quest ID in the quests database
2. Add this ID to the `relatedQuestId` property
3. This creates a seamless connection between the map and quest content

## Verification Process

Before submitting new locations, please verify:

- [ ] All required fields are completed
- [ ] Coordinates are accurate (verify on an external map service)
- [ ] Scripture references are correctly formatted and relevant
- [ ] Description is age-appropriate and educationally sound
- [ ] Image is properly sized and optimized for web
- [ ] The location is linked to a relevant quest if applicable

## Questions and Support

For any questions about adding map locations or technical assistance, please contact the KingdomQuest development team.
