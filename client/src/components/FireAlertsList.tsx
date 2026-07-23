import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/contexts/AppContext';
import { useMapContext } from '@/contexts/MapContext';
import { FireLocation } from '@/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGeolocation } from '@/hooks/useGeolocation';
import { AlertCircle } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

interface FireAlertsListProps {
  onAlertMe: (fireId: string) => void;
}

// Define the filter options
type FilterOption = 'all' | 'nearby' | 'severe' | 'recent';
type SortOption = 'distance' | 'intensity' | 'time';
type ProvinceOption = 'all' | 'eastern-cape' | 'western-cape' | 'northern-cape' | 'gauteng' | 'kwazulu-natal' | 'free-state' | 'north-west' | 'mpumalanga' | 'limpopo';

const FireAlertsList: React.FC<FireAlertsListProps> = ({ onAlertMe }) => {
  const { fires } = useAppContext();
  const { map } = useMapContext();
  const { location, error: locationError } = useGeolocation();
  const { t } = useTranslation();
  
  // States for filtering and sorting
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all'); // Default to showing all fires
  const [sortBy, setSortBy] = useState<SortOption>('intensity'); // Default to sorting by intensity
  const [maxDistance, setMaxDistance] = useState<number>(1300); // Set default radius to slightly over the closest fire
  const [selectedProvince, setSelectedProvince] = useState<ProvinceOption>('all'); // Default to all provinces
  const [filteredFires, setFilteredFires] = useState<FireLocation[]>([]); // Initialize empty, will be filled with fires
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(true); // Show filters by default
  
  // Initial load of fires when the component mounts or when fires data changes
  useEffect(() => {
    console.log('Fires data changed:', fires ? fires.length : 0, 'fires available');
    if (fires && fires.length > 0) {
      setFilteredFires(fires);
    }
  }, [fires]);
  
  // Check if we have user location for distance calculation
  const hasLocation = location && location.latitude && location.longitude;
  
  // Helper function to determine appropriate status label
  const getStatusLabel = (fire: FireLocation) => {
    const intensity = fire.intensity || 'Moderate';
    
    switch (intensity) {
      case 'Low': return { 
        text: t('fire.status.monitor'), 
        bg: 'bg-[hsl(var(--danger-safe))]' 
      };
      case 'Moderate': return { 
        text: t('fire.status.ready'), 
        bg: 'bg-[hsl(var(--danger-high))]' 
      };
      case 'High':
      case 'Extreme':
      default: return { 
        text: t('fire.status.evacuate'), 
        bg: 'bg-[hsl(var(--danger-severe))]' 
      };
    }
  };
  
  // Function to sort fires based on current sort option
  const sortFires = (firesToSort: FireLocation[]): FireLocation[] => {
    return [...firesToSort].sort((a, b) => {
      if (sortBy === 'distance') {
        // Sort by distance (closest first)
        const distanceA = parseFloat(a.distance as string) || 999999;
        const distanceB = parseFloat(b.distance as string) || 999999;
        return distanceA - distanceB;
      } else if (sortBy === 'intensity') {
        // Sort by intensity (most severe first)
        const intensityOrder = { 'Extreme': 0, 'High': 1, 'Moderate': 2, 'Low': 3 };
        const intensityA = a.intensity || 'Low';
        const intensityB = b.intensity || 'Low';
        return intensityOrder[intensityA as keyof typeof intensityOrder] - intensityOrder[intensityB as keyof typeof intensityOrder];
      } else { // sortBy === 'time'
        // Sort by detection time (most recent first)
        // Parse the "X hours ago" or similar text to get a sortable value
        const timeA = a.detectedTime?.match(/\d+/)?.[0] || '0';
        const timeB = b.detectedTime?.match(/\d+/)?.[0] || '0';
        return parseInt(timeA) - parseInt(timeB);
      }
    });
  };
  
  // Function to filter fires based on current map bounds
  const getFiresInMapView = (): FireLocation[] => {
    if (!map || !map.loaded()) return fires;
    
    try {
      // Get the current map bounds - this won't be null if the map is loaded
      const bounds = map.getBounds();
      
      if (!bounds) {
        console.warn('Map bounds are null');
        return fires;
      }
      
      return fires.filter(fire => {
        try {
          const lngLat = new mapboxgl.LngLat(fire.longitude, fire.latitude);
          return bounds.contains(lngLat);
        } catch (err) {
          // If there's an error with a specific fire coordinate, include it in the result
          console.warn(`Error checking if fire ${fire.id} is in bounds:`, err);
          return true;
        }
      });
    } catch (error) {
      console.warn('Error getting map bounds:', error);
      return fires; // Return all fires if there's an error getting bounds
    }
  };
  
  // Function to determine which province a fire is in based on its coordinates
  const getFireProvince = (fire: FireLocation): ProvinceOption => {
    // Rough coordinates for South African provinces
    // These are simplified bounds and may not be 100% accurate for border cases
    
    // Western Cape (southwest)
    if (fire.longitude >= 18.0 && fire.longitude <= 23.5 && 
        fire.latitude >= -34.8 && fire.latitude <= -31.0) {
      return 'western-cape';
    }
    
    // Eastern Cape (south)
    if (fire.longitude >= 23.5 && fire.longitude <= 30.0 && 
        fire.latitude >= -34.0 && fire.latitude <= -30.5) {
      return 'eastern-cape';
    }
    
    // Northern Cape (west/central)
    if (fire.longitude >= 16.5 && fire.longitude <= 25.5 && 
        fire.latitude >= -31.0 && fire.latitude <= -26.5) {
      return 'northern-cape';
    }
    
    // KwaZulu-Natal (east)
    if (fire.longitude >= 29.0 && fire.longitude <= 32.0 && 
        fire.latitude >= -31.0 && fire.latitude <= -26.5) {
      return 'kwazulu-natal';
    }
    
    // Free State (central)
    if (fire.longitude >= 24.5 && fire.longitude <= 29.5 && 
        fire.latitude >= -30.5 && fire.latitude <= -26.5) {
      return 'free-state';
    }
    
    // Gauteng (central north)
    if (fire.longitude >= 27.5 && fire.longitude <= 29.5 && 
        fire.latitude >= -26.5 && fire.latitude <= -25.0) {
      return 'gauteng';
    }
    
    // North West (northwest)
    if (fire.longitude >= 22.5 && fire.longitude <= 28.0 && 
        fire.latitude >= -28.0 && fire.latitude <= -24.5) {
      return 'north-west';
    }
    
    // Limpopo (north)
    if (fire.longitude >= 26.5 && fire.longitude <= 32.0 && 
        fire.latitude >= -25.0 && fire.latitude <= -22.0) {
      return 'limpopo';
    }
    
    // Mpumalanga (northeast)
    if (fire.longitude >= 28.5 && fire.longitude <= 32.0 && 
        fire.latitude >= -27.0 && fire.latitude <= -24.5) {
      return 'mpumalanga';
    }
    
    // Default if no match
    return 'all';
  };
  
  // Apply filtering and sorting whenever dependencies change
  useEffect(() => {
    // Make sure we have something to filter even if the state hasn't synchronized
    // Use the fires directly from context on every render
    let result = fires && fires.length > 0 ? [...fires] : [];
    console.log('Applying filters to', result.length, 'fires');
    
    // Apply filters based on activeFilter
    switch(activeFilter) {
      case 'nearby':
        // Filter by distance
        result = result.filter(fire => {
          const distance = parseFloat(fire.distance as string);
          return !isNaN(distance) && distance <= maxDistance;
        });
        break;
      case 'severe':
        // Filter to show only high or extreme intensity fires
        result = result.filter(fire => 
          fire.intensity === 'High' || fire.intensity === 'Extreme'
        );
        break;
      case 'recent':
        // Filter to show fires detected in the last 24 hours
        // This is an approximation based on the "X hours ago" text
        result = result.filter(fire => {
          const hours = fire.detectedTime?.match(/\d+/)?.[0] || '0';
          return parseInt(hours) <= 24;
        });
        break;
      case 'visible':
        // Filter to show only fires visible in the current map view
        result = getFiresInMapView();
        break;
      case 'province':
        // Filter by selected province
        if (selectedProvince !== 'all') {
          result = result.filter(fire => getFireProvince(fire) === selectedProvince);
        }
        break;
      case 'all':
      default:
        // No filtering needed
        break;
    }
    
    // Sort the filtered results
    const sortedResult = sortFires(result);
    setFilteredFires(sortedResult);
  }, [fires, activeFilter, sortBy, maxDistance, selectedProvince, map]);
  
  // For debugging purpose
  useEffect(() => {
    console.log('FireAlertsList Debugging:');
    console.log('Total fires available:', fires ? fires.length : 0);
    console.log('Filtered fires count:', filteredFires.length);
    console.log('Active filter:', activeFilter);
    console.log('Sort by:', sortBy);
    console.log('Has location:', hasLocation);
    
    if (fires && fires.length > 0) {
      console.log('First fire object:', fires[0]);
      // Force immediate update of filteredFires when fires change
      if (filteredFires.length === 0) {
        console.log('Fires exist but filtered fires empty - forcing update');
        setFilteredFires(fires);
      }
      console.log('First filtered fire (if any):', filteredFires.length > 0 ? filteredFires[0] : 'No filtered fires');
    }

    if (location) {
      console.log('User location available:', location.latitude, location.longitude);
    } else {
      console.log('No user location available');
    }
  }, [fires, filteredFires, activeFilter, sortBy, location]);

  // Force direct rendering of the fire list
  // We'll use a temporary array to ensure we have something to render
  // even if the state hasn't fully synchronized yet
  const tempFires = fires && fires.length > 0 ? fires : [];
  
  // Console.log for debugging
  console.log("Rendering with fires:", tempFires.length);
  
  return (
    <div className="space-y-4 mb-8">
      {/* Location notice banner when location is not available but needed */}
      {(!hasLocation && (activeFilter === 'nearby' || sortBy === 'distance')) && (
        <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-3 mb-3 flex items-start">
          <AlertCircle className="text-amber-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
          <div className="text-sm text-amber-100">
            <p className="font-medium">{t('fire.locationNeeded')}</p>
            <p className="text-amber-200/80 mt-1">{t('fire.enableLocation')}</p>
          </div>
        </div>
      )}
      
      {/* Filter and sort controls */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3 bg-gray-900/75 p-3 rounded-lg border border-gray-700/40 shadow-md backdrop-blur-sm">
          <h2 className="text-white font-semibold flex items-center">
            <i className="ri-fire-line text-orange-500 mr-2 text-lg"></i>
            {t('fire.listTitle')} ({filteredFires.length})
          </h2>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setShowFilterOptions(!showFilterOptions)}
            className="text-sm text-white bg-red-700/90 hover:bg-red-600/90"
          >
            <i className="ri-filter-line mr-1"></i>
            {showFilterOptions ? t('fire.hideFilters') : t('fire.filter')}
          </Button>
        </div>
        
        {showFilterOptions && (
          <div className="bg-gray-900/75 border border-gray-700/40 rounded-lg p-4 mb-3 shadow-lg backdrop-blur-sm">
            <Tabs defaultValue="filter" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2 bg-gray-900/80">
                <TabsTrigger value="filter" className="data-[state=active]:bg-red-900">{t('fire.filterBy')}</TabsTrigger>
                <TabsTrigger value="sort" className="data-[state=active]:bg-red-900">{t('fire.sortBy')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="filter" className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Button 
                    variant={activeFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveFilter('all')}
                    className="w-full"
                  >
                    {t('fire.filterOptions.all')}
                  </Button>
                  <Button 
                    variant={activeFilter === 'nearby' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveFilter('nearby')}
                    className="w-full"
                  >
                    {t('fire.filterOptions.nearby')}
                  </Button>
                  <Button 
                    variant={activeFilter === 'severe' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveFilter('severe')}
                    className="w-full"
                  >
                    {t('fire.filterOptions.severe')}
                  </Button>
                  <Button 
                    variant={activeFilter === 'recent' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setActiveFilter('recent')}
                    className="w-full"
                  >
                    {t('fire.filterOptions.recent')}
                  </Button>
                  
                </div>
                
                {activeFilter === 'nearby' && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{t('fire.maxDistance')}:</span>
                      <span>{maxDistance} km</span>
                    </div>
                    <Slider
                      defaultValue={[maxDistance]}
                      min={5}
                      max={1500}
                      step={25}
                      onValueChange={(values) => setMaxDistance(values[0])}
                    />
                    
                    {!hasLocation && (
                      <div className="mt-2 p-2 bg-amber-950/30 border border-amber-800/30 rounded text-xs text-amber-300">
                        <div className="flex items-center">
                          <AlertCircle size={12} className="mr-1.5 flex-shrink-0" />
                          <span>{t('fire.locationFilter')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                
              </TabsContent>
              
              <TabsContent value="sort" className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <Button 
                    variant={sortBy === 'distance' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSortBy('distance')}
                    className="w-full"
                  >
                    {t('fire.sort.distance')}
                  </Button>
                  <Button 
                    variant={sortBy === 'intensity' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSortBy('intensity')}
                    className="w-full"
                  >
                    {t('fire.sort.intensity')}
                  </Button>
                  <Button 
                    variant={sortBy === 'time' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSortBy('time')}
                    className="w-full"
                  >
                    {t('fire.sort.time')}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Fire list - we'll use tempFires directly if filteredFires is empty */}
      {(filteredFires.length === 0 && tempFires.length === 0) ? (
        <div className="bg-gray-900/70 border border-gray-700/40 rounded-xl p-5 shadow-lg text-center backdrop-blur-sm">
          {activeFilter === 'nearby' && !hasLocation ? (
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center mx-auto bg-amber-500/20 p-3 rounded-full border border-amber-500/30 mb-2">
                <i className="ri-map-pin-user-line text-amber-400 text-2xl"></i>
              </div>
              <p className="text-amber-100 font-medium">{t('fire.noLocationNoNearbyFires')}</p>
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  className="text-xs bg-amber-900/60 border-amber-700/60 text-amber-100 hover:bg-amber-800/80"
                >
                  {t('fire.showAllFires')}
                </Button>
              </div>
            </div>
          ) : activeFilter === 'nearby' && hasLocation && fires.length > 0 ? (
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center mx-auto bg-orange-500/20 p-3 rounded-full border border-orange-500/30 mb-2">
                <i className="ri-map-pin-distance-line text-orange-400 text-2xl"></i>
              </div>
              <p className="text-orange-100 font-medium">{t('fire.noNearbyFires')}</p>
              <div className="mt-3 mb-3 p-4 bg-gray-900/90 border border-gray-700 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <i className="ri-map-pin-range-line text-orange-500 text-xl mr-2"></i>
                  <p className="text-white font-medium">
                    {`${t('fire.closestFire')} ${Math.floor(parseFloat(fires[0].distance as string))} km ${t('fire.away')}`}
                  </p>
                </div>
                <div className="flex items-center justify-center text-sm mt-1">
                  <i className="ri-map-pin-line text-gray-400 mr-1.5"></i>
                  <p className="text-gray-300">
                    {`${fires[0].location}`}
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setMaxDistance(Math.ceil(parseFloat(fires[0].distance as string) / 100) * 100)}
                  className="text-white bg-red-800 hover:bg-red-700"
                >
                  <i className="ri-radar-line mr-1.5"></i>
                  {t('fire.increaseRadius')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center mx-auto bg-blue-500/20 p-3 rounded-full border border-blue-500/30 mb-2">
                <i className="ri-filter-line text-blue-300 text-2xl"></i>
              </div>
              <p className="text-white">{t('fire.noMatchingFires')}</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Use filteredFires if available, otherwise use tempFires directly */}
          {(filteredFires.length > 0 ? filteredFires : tempFires).map((fire) => {
            const status = getStatusLabel(fire);
            
            return (
              <div 
                key={fire.id} 
                className="bg-gray-900/70 border border-gray-700/40 rounded-xl p-4 shadow-lg hover:border-gray-600/80 transition-colors backdrop-blur-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <i className="ri-fire-line text-orange-500 mr-2 text-lg"></i>
                      <h3 className="font-semibold text-lg text-white">{t('fire.near')} {fire.location || t('fire.unknownLocation')}</h3>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">
                      {t('fire.detected')} {fire.detectedTime || t('fire.recentlyDetected')} {fire.detectedTime ? t('fire.ago') : ''} • 
                      {' '}{t(`fire.intensity.${(fire.intensity || 'moderate').toLowerCase()}`)}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className={`${status.bg} text-white text-xs px-2 py-1 rounded-full`}>
                        {status.text}
                      </span>
                      <span className="text-gray-300 text-xs ml-2 flex items-center">
                        <i className="ri-map-pin-range-line mr-1"></i>
                        {fire.distance ? `${fire.distance} km ${t('fire.away')}` : t('fire.distanceUnknown')}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="bg-red-800 hover:bg-red-700 transition text-white px-3 py-1 rounded-lg text-sm shadow-md"
                    onClick={() => onAlertMe(fire.id)}
                  >
                    <i className="ri-notification-3-line mr-1"></i>
                    {t('fire.alertMe')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FireAlertsList;
