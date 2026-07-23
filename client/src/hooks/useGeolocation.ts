import { useState, useEffect } from 'react';
import { UserLocation } from '@/types';

export const useGeolocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const savePosition = (position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    });
    setIsLoading(false);
    setError(null);
  };

  const handleError = (err: GeolocationPositionError) => {
    setIsLoading(false);
    setError(err.message);
  };

  const requestLocation = (): Promise<UserLocation | null> => {
    setIsLoading(true);
    
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setIsLoading(false);
        const error = 'Geolocation is not supported by your browser';
        setError(error);
        reject(error);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          savePosition(position);
          resolve(userLocation);
        },
        (err) => {
          handleError(err);
          reject(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  };

  // Initialize geolocation on mount
  useEffect(() => {
    const getInitialLocation = async () => {
      try {
        await requestLocation();
      } catch (err) {
        // Initial error is handled by requestLocation
      }
    };
    
    getInitialLocation();
  }, []);

  return { location, error, isLoading, requestLocation };
};
