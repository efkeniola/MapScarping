
export interface BusinessInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  rating?: string;
  mapsUrl?: string;
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface SearchResponse {
  rawText: string;
  businesses: BusinessInfo[];
  sources: GroundingLink[];
}

export interface LocationState {
  lat: number;
  lng: number;
  error?: string;
}
