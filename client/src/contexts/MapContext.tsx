import React, { createContext, useContext } from 'react';
import mapboxgl from 'mapbox-gl';

// Create a context to share map instance with child components
interface MapContextType {
  map: mapboxgl.Map | null;
}

export const MapContext = createContext<MapContextType>({ map: null });
export const useMapContext = () => useContext(MapContext);