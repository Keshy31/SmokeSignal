import { FireLocation, WeatherData, FireDangerIndex } from "@/types";
import { apiRequest } from "./queryClient";

// Service worker registration for offline support
export const registerServiceWorker = async () => {
  // Instead of just logging a message, let's create a basic cache for API responses
  // This will help with offline functionality even without a full service worker
  if ('caches' in window) {
    try {
      // Create a cache for fire data and other critical API responses
      const cache = await caches.open('fire-app-cache-v1');
      
      // List of critical API routes to cache for offline use
      const urlsToCache = [
        '/api/fires',
        '/api/fire-danger'
      ];
      
      // Cache the latest responses for these endpoints
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response.clone());
            console.log(`Cached ${url} for offline use`);
          }
        } catch (err) {
          console.warn(`Could not cache ${url}:`, err);
        }
      }
      
      console.log('Basic offline caching initialized');
    } catch (error) {
      console.error('Error setting up offline cache:', error);
    }
  } else {
    console.log('Cache API not available in this browser - offline functionality will be limited');
  }
  
  // Future implementation - proper service worker registration
  // Uncomment when a proper service-worker.js is created
  /*
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
    }
  }
  */
};

// API for fetching fire data
export const fetchFireLocations = async (): Promise<FireLocation[]> => {
  try {
    const response = await apiRequest('GET', '/api/fires', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching fire locations:', error);
    // Try to get cached data when offline
    if ('caches' in window) {
      try {
        const cache = await caches.open('fire-data');
        const cachedResponse = await cache.match('/api/fires');
        if (cachedResponse) {
          return await cachedResponse.json();
        }
      } catch (cacheError) {
        console.error('Error retrieving cached fire data:', cacheError);
      }
    }
    return [];
  }
};

// API for fetching weather data for a location
export const fetchWeatherData = async (latitude: number, longitude: number): Promise<WeatherData> => {
  try {
    const response = await apiRequest('GET', `/api/weather?lat=${latitude}&lon=${longitude}`, undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return reasonable defaults if offline
    return {
      temperature: 25,
      humidity: 50,
      windSpeed: 10,
      windDirection: 'SE'
    };
  }
};

// API for fetching fire danger index
export const fetchFireDangerIndex = async (latitude: number, longitude: number): Promise<FireDangerIndex> => {
  try {
    const response = await apiRequest('GET', `/api/fire-danger?lat=${latitude}&lon=${longitude}`, undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching fire danger index:', error);
    // Return moderate by default if offline
    return {
      level: 'Moderate',
      value: 50,
      color: '#FFA500' // Warning Orange from color palette
    };
  }
};

// API for subscribing to fire alerts
export const subscribeToAlerts = async (fireId: string, deviceToken: string): Promise<void> => {
  await apiRequest('POST', '/api/subscribe', { fireId, deviceToken });
};

// API for getting Firebase messaging token
export const getMessagingToken = async (): Promise<string | null> => {
  try {
    const response = await apiRequest('GET', '/api/messaging-token', undefined);
    
    if (!response.ok) {
      console.error(`Error getting messaging token: HTTP ${response.status}`);
      throw new Error(`Failed to get messaging token: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.token) {
      console.error('Invalid messaging token response:', data);
      throw new Error('Invalid messaging token received from server');
    }
    
    return data.token;
  } catch (error) {
    console.error('Error getting messaging token:', error);
    // Don't silently fail - let the caller know something went wrong
    throw new Error('Failed to get messaging token. Please try again later.');
  }
};

// Utility function to determine if we're in offline mode
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

// Function to calculate distance between two coordinates (in km)
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};
