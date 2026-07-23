export interface FireLocation {
  id: string;
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string | number; // VIIRS uses 'n','l','h' while MODIS uses numbers
  version: string;
  bright_t31: number;
  frp: number;
  daynight: string;
  
  // Computed properties
  location?: string;
  distance?: string | number; // Allow string or number
  detectedTime?: string;
  intensity?: 'Low' | 'Moderate' | 'High' | 'Extreme';
  displayStatus?: 'Monitor' | 'Be Ready' | 'Evacuate';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
}

export interface FireDangerIndex {
  level: 'Low' | 'Moderate' | 'High' | 'Severe' | 'Extreme';
  value: number; // 0-100
  color: string;
}

export interface SafetyTip {
  id: string;
  icon: string;
  title: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface AppSettings {
  language: 'en' | 'af' | 'xh';
  notificationsEnabled: boolean;
  trackingAreas: string[];
  lastUpdated: string;
}
