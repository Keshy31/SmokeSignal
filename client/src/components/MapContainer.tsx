import React, { useEffect, useRef, useState } from 'react';
import ControlButtons from './ControlButtons';
import FireDangerIndex from './FireDangerIndex';
import LanguageSelector from './LanguageSelector';
import LocationButton from './LocationButton';
import FireMarkers from './FireMarkers';
import DangerZoneOverlay from './DangerZoneOverlay';
import MapFallback from './MapFallback';
import { FireLocation, MapViewState } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import mapboxgl from 'mapbox-gl';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { MapContext } from '@/contexts/MapContext';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapContainerProps {
  onFireSelect: (fire: FireLocation) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ onFireSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { location } = useGeolocation();
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapInitError, setMapInitError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  
  // Check for WebGL support immediately
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.log('WebGL not supported, switching to fallback dashboard immediately');
      setUseFallback(true);
    }
  }, []);
  const [viewportCenter, setViewportCenter] = useState<[number, number]>([18.4241, -33.9249]);
  const [mapView, setMapView] = useState<MapViewState>({
    latitude: -33.9249,   // Cape Town latitude
    longitude: 18.4241,   // Cape Town longitude
    zoom: 9,
    pitch: 45,           // Add 3D perspective
    bearing: 0
  });
  
  // Fetch Mapbox token from our API
  const { data: mapboxData, isLoading: isLoadingMapbox } = useQuery({
    queryKey: ['/api/mapbox-token'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/mapbox-token', undefined);
      return res.json();
    }
  });
  
  // Initialize map when the component mounts and token is available
  useEffect(() => {
    if (map.current || !mapboxData?.token || isLoadingMapbox || mapInitialized) return;
    if (!mapContainer.current) return;
    
    // Create a timeout to detect map initialization failures
    const initTimeout = setTimeout(() => {
      if (!mapInitialized && !mapInitError) {
        console.error('Map initialization timed out');
        setMapInitError('Map loading timed out. This may be due to network issues or WebGL compatibility problems.');
      }
    }, 10000); // 10 second timeout
    
    // Add an aggressive fallback to switch to list view if nothing happens
    const forceInitTimeout = setTimeout(() => {
      if (!mapInitialized && !mapInitError) {
        console.warn('Map initialization taking too long, switching to fallback dashboard');
        setUseFallback(true);
        clearTimeout(initTimeout);
      }
    }, 5000); // 5 second force timeout
    
    try {
      console.log('Initializing map with token:', mapboxData.token ? 'Present' : 'Missing');
      mapboxgl.accessToken = mapboxData.token;
      
      // Use the most basic and reliable style
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Most basic and reliable style
        center: [24.0, -29.0], // Centered on central South Africa
        zoom: 5.5, // Adjusted view to see more of the country
        pitch: 0, // Flat 2D view
        bearing: 0,
        antialias: false, // Disable for better compatibility
        preserveDrawingBuffer: false, 
        failIfMajorPerformanceCaveat: true, // Fail fast if performance issues
        attributionControl: true,
        crossSourceCollisions: false // Disable for better performance
      });
      
      // Set initialized once map is loaded - use multiple events for reliability
      const markAsInitialized = () => {
        if (!mapInitialized) {
          console.log("Map loaded successfully");
          setMapInitialized(true);
          clearTimeout(initTimeout);
        }
      };

      map.current.on('load', markAsInitialized);
      map.current.on('idle', markAsInitialized);

      // Update viewport center when map moves
      map.current.on('moveend', () => {
        if (map.current) {
          const center = map.current.getCenter();
          setViewportCenter([center.lng, center.lat]);
        }
      });
      
      // Handle WebGL errors and try fallback
      map.current.on('error', (e) => {
        console.error('Map error:', e.error);
        clearTimeout(initTimeout);
        
        // Switch to fallback dashboard on any map error
        console.log('Map error detected, switching to fallback dashboard');
        setUseFallback(true);
        clearTimeout(initTimeout);
        clearTimeout(forceInitTimeout);
        return;
        
        // Provide more specific error message based on the error type
        if (e.error && e.error.message) {
          if (e.error.message.includes('network')) {
            setMapInitError('Network error loading map resources. Please check your connection.');
          } else if (e.error.message.includes('token')) {
            setMapInitError('Error with map authorization. Please refresh the page or try again later.');
          } else if (e.error.message.includes('WebGL')) {
            setMapInitError('WebGL is not supported or disabled in your browser.');
          } else {
            setMapInitError(`Map error: ${e.error.message}`);
          }
        } else {
          setMapInitError('Could not initialize the map. WebGL may not be supported in this environment.');
        }
      });
      
      // Add more robust style loading handling with aggressive fallback
      let styleLoadAttempts = 0;
      map.current.on('styledata', () => {
        styleLoadAttempts++;
        console.log(`Style loading attempt ${styleLoadAttempts}`);
        
        if (map.current?.isStyleLoaded()) {
          console.log('Map style loaded successfully');
          if (!mapInitialized) {
            setMapInitialized(true);
            clearTimeout(initTimeout);
          }
        } else {
          console.warn('Map style failed to load completely');
          
          // After 3 failed attempts, force initialization anyway
          if (styleLoadAttempts >= 3 && !mapInitialized) {
            console.log('Forcing map initialization after multiple style load failures');
            setMapInitialized(true);
            clearTimeout(initTimeout);
          }
        }
      });
      
      // Add data loading event
      map.current.on('data', (e) => {
        if (e.dataType === 'style' && map.current?.isStyleLoaded()) {
          console.log('Map style data loaded');
        }
      });
      
      // Add source loading events
      map.current.on('sourcedata', (e) => {
        if (e.isSourceLoaded && e.sourceId) {
          console.log(`Source ${e.sourceId} loaded`);
        }
      });
      
    } catch (err) {
      console.error('Error initializing map:', err);
      clearTimeout(initTimeout);
      clearTimeout(forceInitTimeout);
      
      // Switch to fallback on any initialization error
      console.log('Map initialization failed, switching to fallback dashboard');
      setUseFallback(true);
    }
    
    // Clean up on unmount
    return () => {
      clearTimeout(initTimeout);
      clearTimeout(forceInitTimeout);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxData, isLoadingMapbox]);
  
  // Update map if location changes (e.g. from geolocation)
  useEffect(() => {
    if (location && map.current) {
      map.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 11,
        essential: true
      });
    }
  }, [location]);
  
  // Handle map settings toggle
  const handleToggleSettings = () => {
    // This would be implemented to show settings panel
    console.log('Toggle settings');
  };
  
  // Handle map layers toggle
  const handleToggleLayers = () => {
    // This would be implemented to toggle map layers
    console.log('Toggle layers');
  };
  
  // Handle location update from location button
  const handleLocationUpdate = (latitude: number, longitude: number) => {
    if (map.current) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 11,
        essential: true
      });
    }
  };
  
  // Create a ref to track if markers have been added
  const markersAddedRef = useRef(false);
  
  // Just update context when map is initialized (no marker creation)
  useEffect(() => {
    if (mapInitialized && map.current) {
      console.log("Map initialized successfully");
      // No need to do anything here - FireMarkers component will handle marker creation
    }
  }, [mapInitialized]);
  
  // If using fallback, render the dashboard instead of map
  if (useFallback) {
    return <MapFallback onFireSelect={onFireSelect} />;
  }

  return (
    <MapContext.Provider value={{ map: map.current }}>
      <div className="map-container flex-1 w-full h-screen absolute inset-0 z-0">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Temporarily removed smoke effect for better visibility */}
        
        {/* Show loading indicator while map is initializing */}
        {!mapInitialized && !mapInitError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
            <div className="bg-app-dark p-6 rounded-lg max-w-md text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-white mb-2">Loading Map</h3>
              <p className="text-gray-300">Initializing map and loading fire data...</p>
            </div>
          </div>
        )}
        
        {/* Show error message if map fails to load */}
        {mapInitError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
            <div className="bg-app-dark p-6 rounded-lg max-w-md text-center">
              <h3 className="text-xl font-bold text-white mb-2">Map Error</h3>
              <p className="text-gray-300">{mapInitError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        <div className="absolute top-20 right-4 z-10 flex items-center space-x-3">
          <LanguageSelector />
          <ControlButtons 
            onToggleLayers={handleToggleLayers}
            onToggleSettings={handleToggleSettings}
          />
        </div>
        
        <FireDangerIndex />
        
        <LocationButton onLocationUpdate={handleLocationUpdate} />
        
        {/* Use the FireMarkers component to handle marker rendering */}
        <FireMarkers onFireSelect={onFireSelect} />
      </div>
    </MapContext.Provider>
  );
};

export default MapContainer;
