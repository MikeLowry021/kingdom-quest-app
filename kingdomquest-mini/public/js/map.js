// Biblical locations data
const biblicalLocations = [
  {
    id: 'jerusalem',
    name: 'Jerusalem',
    description: 'The holy city and capital of ancient Israel. Site of the Temple and many biblical events across both testaments.',
    era: 'oldTestament',
    coordinates: {
      lat: 31.7683,
      lng: 35.2137
    },
    scriptures: [
      '1 Kings 11:36',
      'Psalm 122:6',
      'Matthew 23:37',
      'Luke 13:34'
    ],
    image: '/images/locations/jerusalem.jpg',
  },
  {
    id: 'bethlehem',
    name: 'Bethlehem',
    description: 'Birthplace of Jesus Christ and King David. Located in Judea, about 6 miles south of Jerusalem.',
    era: 'newTestament',
    coordinates: {
      lat: 31.7054,
      lng: 35.2024
    },
    scriptures: [
      'Micah 5:2',
      'Matthew 2:1',
      'Luke 2:4-7',
      'Ruth 1:1-2'
    ],
    image: '/images/locations/bethlehem.jpg',
  },
  {
    id: 'nazareth',
    name: 'Nazareth',
    description: 'Childhood home of Jesus. A small village in Galilee where Jesus grew up after returning from Egypt.',
    era: 'newTestament',
    coordinates: {
      lat: 32.7021,
      lng: 35.2978
    },
    scriptures: [
      'Matthew 2:23',
      'Luke 1:26-27',
      'Luke 2:39-40',
      'John 1:46'
    ],
    image: '/images/locations/jerusalem.jpg',
  },
  {
    id: 'sea-of-galilee',
    name: 'Sea of Galilee',
    description: 'Freshwater lake where Jesus performed many miracles, including walking on water and calming the storm.',
    era: 'newTestament',
    coordinates: {
      lat: 32.8268,
      lng: 35.5716
    },
    scriptures: [
      'Matthew 4:18',
      'Matthew 8:23-27',
      'Matthew 14:22-33',
      'John 21:1-14'
    ],
    image: '/images/locations/jerusalem.jpg',
  },
  {
    id: 'jericho',
    name: 'Jericho',
    description: 'One of the oldest inhabited cities in the world. The Israelites famously marched around its walls.',
    era: 'oldTestament',
    coordinates: {
      lat: 31.8667,
      lng: 35.4441
    },
    scriptures: [
      'Joshua 6:1-27',
      'Luke 19:1-10',
      '2 Kings 2:4-5',
      'Mark 10:46-52'
    ],
    image: '/images/locations/jerusalem.jpg',
  },
  {
    id: 'mount-sinai',
    name: 'Mount Sinai',
    description: 'The mountain where Moses received the Ten Commandments from God.',
    era: 'oldTestament',
    coordinates: {
      lat: 28.5392,
      lng: 33.9729
    },
    scriptures: [
      'Exodus 19:1-25',
      'Exodus 20:1-21',
      'Exodus 24:12-18',
      'Deuteronomy 5:1-22'
    ],
    image: '/images/locations/jerusalem.jpg',
  },
  {
    id: 'babylon',
    name: 'Babylon',
    description: 'Ancient city where the Israelites were exiled. Site of the Tower of Babel and Nebuchadnezzar\'s kingdom.',
    era: 'oldTestament',
    coordinates: {
      lat: 32.5436,
      lng: 44.4275
    },
    scriptures: [
      'Genesis 11:1-9',
      'Daniel 1:1-7',
      'Daniel 3:1-30',
      'Jeremiah 29:1-14'
    ],
    image: '/images/locations/jerusalem.jpg',
  },
  {
    id: 'mount-of-olives',
    name: 'Mount of Olives',
    description: 'Hill east of Jerusalem where Jesus often taught, prayed before His arrest, and ascended to heaven.',
    era: 'newTestament',
    coordinates: {
      lat: 31.7788,
      lng: 35.2425
    },
    scriptures: [
      'Matthew 24:3',
      'Matthew 26:36-46',
      'Luke 22:39-46',
      'Acts 1:9-12'
    ],
    image: '/images/locations/jerusalem.jpg',
  }
];

// Initialize the map
let map;
let markers = [];
let activeInfoWindow = null;
let currentEra = 'all';

function initMap() {
  const mapElement = document.getElementById('map');
  
  if (!mapElement) {
    console.error('Map element not found');
    return;
  }
  
  // Create the map centered on Jerusalem
  map = new google.maps.Map(mapElement, {
    center: { lat: 31.7683, lng: 35.2137 },
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeControl: true,
    fullscreenControl: true,
    streetViewControl: false,
    zoomControl: true,
  });

  // Add markers for all locations
  addMarkersToMap();

  // Add filter event listeners
  document.getElementById('filter-all').addEventListener('click', () => filterMarkers('all'));
  document.getElementById('filter-old-testament').addEventListener('click', () => filterMarkers('oldTestament'));
  document.getElementById('filter-new-testament').addEventListener('click', () => filterMarkers('newTestament'));
  document.getElementById('filter-intertestamental').addEventListener('click', () => filterMarkers('intertestamental'));

  // Save the map settings to localStorage for offline use
  cacheMapData();
}

// Add markers to the map
function addMarkersToMap() {
  biblicalLocations.forEach(location => {
    const marker = new google.maps.Marker({
      position: location.coordinates,
      map: map,
      title: location.name,
      animation: google.maps.Animation.DROP,
      icon: getMarkerIcon(location.era),
      visible: shouldShowMarker(location.era)
    });

    // Create info window content
    const contentString = createInfoWindowContent(location);
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 300
    });

    // Add click event to marker
    marker.addListener('click', () => {
      // Close any open info window
      if (activeInfoWindow) {
        activeInfoWindow.close();
      }
      
      // Open this info window
      infoWindow.open(map, marker);
      activeInfoWindow = infoWindow;
    });

    // Store marker reference
    markers.push({ marker, location });
  });
}

// Get the appropriate marker icon based on era
function getMarkerIcon(era) {
  switch (era) {
    case 'oldTestament':
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#B87333',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#ffffff',
        scale: 8
      };
    case 'newTestament':
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#4169E1',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#ffffff',
        scale: 8
      };
    case 'intertestamental':
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#8A2BE2',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#ffffff',
        scale: 8
      };
    default:
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#808080',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#ffffff',
        scale: 8
      };
  }
}

// Create the HTML content for the info window
function createInfoWindowContent(location) {
  // Format scripture references
  const scripturesList = location.scriptures
    .map(ref => `<li>${ref}</li>`)
    .join('');

  return `
    <div class="p-4 max-w-xs">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-bold text-gray-900">${location.name}</h3>
        <span class="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">${location.era === 'oldTestament' ? 'Old Testament' : location.era === 'newTestament' ? 'New Testament' : 'Intertestamental'}</span>
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
    </div>
  `;
}

// Filter markers by era
function filterMarkers(era) {
  // Update current era
  currentEra = era;
  
  // Update filter button styles
  updateFilterButtons(era);
  
  // Update marker visibility
  markers.forEach(({ marker, location }) => {
    marker.setVisible(shouldShowMarker(location.era));
  });
  
  // Close any open info window
  if (activeInfoWindow) {
    activeInfoWindow.close();
    activeInfoWindow = null;
  }
}

// Check if a marker should be visible based on current filter
function shouldShowMarker(era) {
  return currentEra === 'all' || era === currentEra;
}

// Update filter button styles
function updateFilterButtons(activeEra) {
  // Reset all buttons
  document.getElementById('filter-all').className = 'px-3 py-1 text-xs rounded-full transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200';
  document.getElementById('filter-all').setAttribute('aria-pressed', 'false');
  
  document.getElementById('filter-old-testament').className = 'px-3 py-1 text-xs rounded-full transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200';
  document.getElementById('filter-old-testament').setAttribute('aria-pressed', 'false');
  
  document.getElementById('filter-new-testament').className = 'px-3 py-1 text-xs rounded-full transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200';
  document.getElementById('filter-new-testament').setAttribute('aria-pressed', 'false');
  
  document.getElementById('filter-intertestamental').className = 'px-3 py-1 text-xs rounded-full transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200';
  document.getElementById('filter-intertestamental').setAttribute('aria-pressed', 'false');
  
  // Set active button
  switch (activeEra) {
    case 'all':
      document.getElementById('filter-all').className = 'px-3 py-1 text-xs rounded-full transition-colors bg-gray-800 text-white';
      document.getElementById('filter-all').setAttribute('aria-pressed', 'true');
      break;
    case 'oldTestament':
      document.getElementById('filter-old-testament').className = 'px-3 py-1 text-xs rounded-full transition-colors bg-[#B87333] text-white';
      document.getElementById('filter-old-testament').setAttribute('aria-pressed', 'true');
      break;
    case 'newTestament':
      document.getElementById('filter-new-testament').className = 'px-3 py-1 text-xs rounded-full transition-colors bg-[#4169E1] text-white';
      document.getElementById('filter-new-testament').setAttribute('aria-pressed', 'true');
      break;
    case 'intertestamental':
      document.getElementById('filter-intertestamental').className = 'px-3 py-1 text-xs rounded-full transition-colors bg-[#8A2BE2] text-white';
      document.getElementById('filter-intertestamental').setAttribute('aria-pressed', 'true');
      break;
  }
}

// Cache map data for offline use
function cacheMapData() {
  try {
    localStorage.setItem('biblicalLocations', JSON.stringify(biblicalLocations));
    localStorage.setItem('mapDataTimestamp', Date.now().toString());
    console.log('Map data cached successfully');
  } catch (error) {
    console.error('Failed to cache map data:', error);
  }
}

// Initialize the map when the Google Maps API is loaded
google.maps.event.addDomListener(window, 'load', initMap);
