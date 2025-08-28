export interface BiblicalLocation {
  id: string;
  name: string;
  description: string;
  era: 'oldTestament' | 'newTestament' | 'intertestamental';
  coordinates: {
    lat: number;
    lng: number;
  };
  scriptures: string[];
  image?: string;
  relatedQuestId?: string;
}

export interface MapSettings {
  defaultCenter: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
  offlineMode: boolean;
}
