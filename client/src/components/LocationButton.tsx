import React from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTranslation } from 'react-i18next';

interface LocationButtonProps {
  onLocationUpdate?: (latitude: number, longitude: number) => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ onLocationUpdate }) => {
  const { requestLocation, isLoading } = useGeolocation();
  const { t } = useTranslation();
  
  const handleClick = async () => {
    try {
      const location = await requestLocation();
      if (location && onLocationUpdate) {
        onLocationUpdate(location.latitude, location.longitude);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };
  
  return (
    <div className="absolute bottom-32 right-4 z-10">
      <button 
        className="bg-app-dark-lighter bg-opacity-90 p-3 rounded-full shadow-lg"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={t('map.locate')}
      >
        {isLoading ? (
          <i className="ri-loader-2-line text-app-text-light text-xl loading-indicator"></i>
        ) : (
          <i className="ri-focus-3-line text-app-text-light text-xl"></i>
        )}
      </button>
    </div>
  );
};

export default LocationButton;
