import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FireLocation, WeatherData } from '@/types';
import { useTranslation } from 'react-i18next';
import { useGeolocation } from '@/hooks/useGeolocation';
import { X } from 'lucide-react';

interface FireDetailModalProps {
  fire: FireLocation;
  onClose: () => void;
  onGetAlerts: () => void;
}

const FireDetailModal: React.FC<FireDetailModalProps> = ({ 
  fire, 
  onClose,
  onGetAlerts 
}) => {
  const { t } = useTranslation();
  
  // Formatted date for display
  const formattedDate = fire.acq_date 
    ? new Date(fire.acq_date.replace(/\//g, '-')).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown date';
  
  // Formatted time for display
  const formattedTime = fire.acq_time 
    ? `${fire.acq_time.substring(0, 2)}:${fire.acq_time.substring(2, 4)}`
    : '00:00';
  
  // Get the intensity level
  const getIntensityText = () => {
    if (!fire.frp) return t('fire.intensity.moderate');
    
    if (fire.frp > 100) return t('fire.intensity.extreme');
    if (fire.frp > 50) return t('fire.intensity.high');
    if (fire.frp > 20) return t('fire.intensity.moderate');
    return t('fire.intensity.low');
  };

  // Get confidence level description
  const getConfidenceText = () => {
    // With NASA FIRMS data, confidence may be a number, a string, or undefined
    const confidence = fire.confidence;
    
    // Default to low if undefined
    if (!confidence) return 'Low';
    
    // For string values (VIIRS often uses 'l', 'n', 'h')
    if (typeof confidence === 'string') {
      const confidenceStr = String(confidence).toLowerCase();
      if (confidenceStr.includes('h')) return 'High';
      if (confidenceStr.includes('n')) return 'Nominal'; // Medium confidence
      if (confidenceStr.includes('l')) return 'Low';
      return 'Nominal'; // Default for any other string value
    }
    
    // For numerical values (MODIS uses 0-100%)
    const confidenceNum = Number(confidence);
    if (!isNaN(confidenceNum)) {
      if (confidenceNum >= 80) return 'High';
      if (confidenceNum >= 40) return 'Medium';
      return 'Low';
    }
    
    // Default to low if we can't determine
    return 'Low';
  };

  // Get satellite source
  const getSatelliteSource = () => {
    if (fire.satellite.includes('N21')) {
      return 'NOAA-21 VIIRS';
    } else if (fire.satellite.includes('MODIS')) {
      return 'Terra/Aqua MODIS';
    }
    return fire.satellite;
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        hideCloseButton={true} 
        className="bg-app-dark-lighter p-0 border-0 rounded-xl overflow-hidden w-full max-w-md mx-auto"
      >
        <DialogTitle className="sr-only">Fire Details for {fire.location}</DialogTitle>
        <DialogDescription className="sr-only">Information about fire detected near {fire.location}</DialogDescription>
        <div className="relative h-40 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1601901035685-964d66d9dc2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Thermal detection" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-app-dark-lighter"></div>
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold font-rubik">
              {fire.location && !fire.location.includes('Unknown') 
                ? `${t('fire.near')} ${fire.location}` 
                : "Fire Location"}
            </h2>
            <span className={`text-white text-xs px-2 py-1 rounded-full ${
              fire.daynight === 'D' ? 'bg-red-600 animate-pulse-fire' : 'bg-amber-600'
            }`}>
              {fire.daynight === 'D' ? 'Active' : 'Recent'}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <i className="ri-time-line text-gray-400 mt-1 mr-3"></i>
              <div>
                <div className="text-sm text-gray-300">{t('fire.firstDetected')}</div>
                <div className="font-medium">{formattedDate} at {formattedTime}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <i className="ri-map-pin-line text-gray-400 mt-1 mr-3"></i>
              <div>
                <div className="text-sm text-gray-300">{t('fire.location')}</div>
                <div className="font-medium">
                  {fire.location ? (
                    fire.location
                  ) : (
                    'South Africa'
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {fire.latitude?.toFixed(4)}° S, {fire.longitude?.toFixed(4)}° E
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <i className="ri-fire-line text-gray-400 mt-1 mr-3"></i>
              <div>
                <div className="text-sm text-gray-300">Intensity</div>
                <div className="font-medium">{getIntensityText()} (FRP: {fire.frp?.toFixed(1) || 'N/A'} MW)</div>
                <div className="text-sm text-gray-400">Brightness: {fire.brightness?.toFixed(1) || 'N/A'} K</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <i className="ri-radar-line text-gray-400 mt-1 mr-3"></i>
              <div>
                <div className="text-sm text-gray-300">Detection Details</div>
                <div className="font-medium">
                  Confidence: {getConfidenceText()}
                  {fire.confidence && typeof fire.confidence === 'number' ? ` (${fire.confidence}%)` : ''}
                </div>
                <div className="text-sm text-gray-400">
                  Source: {getSatelliteSource()}
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <i className="ri-windy-line text-gray-400 mt-1 mr-3"></i>
              <div>
                <div className="text-sm text-gray-300">Status</div>
                <div className="font-medium">{fire.displayStatus || 'Monitor'}</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Button 
              className="bg-[hsl(var(--fire-orange))] hover:bg-orange-600 text-white py-3 rounded-lg font-medium flex items-center justify-center"
              onClick={onGetAlerts}
            >
              <i className="ri-notification-3-line mr-2"></i>
              {t('fire.getAlerts')}
            </Button>
            <Button 
              variant="outline" 
              className="border border-gray-600 hover:bg-gray-800 text-white py-3 rounded-lg font-medium flex items-center justify-center"
            >
              <i className="ri-share-line mr-2"></i>
              {t('fire.share')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FireDetailModal;
