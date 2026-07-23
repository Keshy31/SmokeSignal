import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FireLocation, AppSettings, WeatherData, UserLocation } from '@/types';
import { useFires } from '@/hooks/useFires';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { fetchWeatherData, calculateDistance } from '@/lib/api';
import { useGeolocation } from '@/hooks/useGeolocation';

interface AppContextType {
  fires: FireLocation[];
  isLoading: boolean;
  appSettings: AppSettings;
  setAppSettings: (settings: AppSettings) => void;
  isOffline: boolean;
  weatherData: WeatherData | null;
  selectedLanguage: string;
  setSelectedLanguage: (language: 'en' | 'af' | 'xh') => void;
}

// Provide a default value for the context to avoid "undefined" errors
const defaultAppSettings: AppSettings = {
  language: 'en',
  notificationsEnabled: false,
  trackingAreas: [],
  lastUpdated: new Date().toISOString()
};

const AppContext = createContext<AppContextType>({
  fires: [],
  isLoading: false,
  appSettings: defaultAppSettings,
  setAppSettings: () => {},
  isOffline: false,
  weatherData: null,
  selectedLanguage: 'en',
  setSelectedLanguage: () => {}
});

export const useAppContext = () => {
  const context = useContext(AppContext);
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { fires: originalFires, isLoading } = useFires();
  const { isOffline } = useOfflineStatus();
  const { location: userLocation } = useGeolocation();
  const [fires, setFires] = useState<FireLocation[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'af' | 'xh'>('en');
  
  // Update fires with calculated distances when original fires or user location changes
  useEffect(() => {
    if (originalFires && originalFires.length > 0) {
      // Calculate distance for each fire based on user location
      const updatedFires = originalFires.map((fire: FireLocation) => {
        let fireWithDistance = { ...fire };
        // Only calculate distance if we have user location
        if (userLocation && userLocation.latitude && userLocation.longitude) {
          const distanceKm = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            fire.latitude,
            fire.longitude
          );
          
          // Debug log distance calculation
          if (fire.id === originalFires[0].id) {
            console.log('Distance calculation for first fire:', {
              userLocation: `${userLocation.latitude}, ${userLocation.longitude}`,
              fireLocation: `${fire.latitude}, ${fire.longitude}`,
              distance: distanceKm
            });
          }
          
          fireWithDistance.distance = distanceKm.toFixed(1);
        } else {
          // Default distance if no user location available
          fireWithDistance.distance = fire.distance || '0';
        }
        return fireWithDistance;
      });
      
      setFires(updatedFires);
    } else {
      setFires([]);
    }
  }, [originalFires, userLocation]);
  
  // Log fires data for debugging
  useEffect(() => {
    if (fires && fires.length > 0) {
      console.log('Fires data in AppContext:', fires.length, 'fires');
      console.log('First fire:', fires[0]);
    } else {
      console.log('No fires data in AppContext yet');
    }
  }, [fires]);
  
  // Default app settings
  const [appSettings, setAppSettings] = useState<AppSettings>({
    language: 'en',
    notificationsEnabled: false,
    trackingAreas: [],
    lastUpdated: new Date().toISOString()
  });
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setAppSettings(parsedSettings);
        
        // Set language from saved settings
        if (parsedSettings.language) {
          setSelectedLanguage(parsedSettings.language);
        }
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
  }, [appSettings]);
  
  // Fetch weather data when we have fires
  useEffect(() => {
    if (fires.length > 0 && !isOffline) {
      // Use an IIFE to properly handle async errors
      (async () => {
        try {
          // Use the first fire location for weather
          const weather = await fetchWeatherData(fires[0].latitude, fires[0].longitude);
          setWeatherData(weather);
        } catch (error) {
          console.error('Failed to fetch weather data:', error);
          // Set default weather data to prevent undefined values
          setWeatherData({
            temperature: 25,
            humidity: 60,
            windSpeed: 10,
            windDirection: 'SE'
          });
        }
      })();
    }
  }, [fires, isOffline]);
  
  const updateAppSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    
    // Update language if it changed
    if (newSettings.language !== selectedLanguage) {
      setSelectedLanguage(newSettings.language);
    }
  };
  
  const value = {
    fires,
    isLoading,
    appSettings,
    setAppSettings: updateAppSettings,
    isOffline,
    weatherData,
    selectedLanguage,
    setSelectedLanguage
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
