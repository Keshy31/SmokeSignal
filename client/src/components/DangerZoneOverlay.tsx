import React, { useEffect, useRef } from 'react';
import { FireLocation } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
import { useMapContext } from '@/contexts/MapContext';
import mapboxgl from 'mapbox-gl';

const DangerZoneOverlay: React.FC = () => {
  const { fires } = useAppContext();
  const { map } = useMapContext();
  const overlaysRef = useRef<HTMLDivElement[]>([]);
  
  // Helper function to determine danger zone size based on fire intensity
  const getZoneSize = (fire: FireLocation) => {
    const baseSize = 2000; // Meters
    const frp = fire.frp || 10;
    
    if (frp > 100) return baseSize * 3; // Extreme
    if (frp > 50) return baseSize * 2.5; // Severe
    if (frp > 20) return baseSize * 2; // High
    return baseSize; // Moderate or Low
  };
  
  // Helper function to determine danger zone color based on fire intensity
  const getZoneColor = (fire: FireLocation) => {
    const frp = fire.frp || 10;
    
    if (frp > 100) return 'var(--danger-severe)';
    if (frp > 50) return 'var(--danger-high)';
    if (frp > 20) return 'var(--danger-moderate)';
    return 'var(--danger-safe)';
  };
  
  useEffect(() => {
    if (!map || !fires || fires.length === 0) return;
    
    console.log("Adding fire danger zones to map");
    
    // Remove existing circles if present
    const existingCircles = document.querySelectorAll('.danger-zone-circle');
    existingCircles.forEach(circle => {
      try {
        const sourceId = circle.getAttribute('data-source-id');
        if (sourceId && map.getSource(sourceId)) {
          map.removeLayer(`${sourceId}-fill`);
          map.removeLayer(`${sourceId}-line`);
          map.removeSource(sourceId);
        }
      } catch (e) {
        console.error("Error removing circle source/layer:", e);
      }
      circle.remove();
    });
    
    // Add danger zone circles for each fire
    fires.forEach((fire, index) => {
      if (!fire.latitude || !fire.longitude) return;
      
      try {
        const sourceId = `danger-zone-${fire.id}`;
        const center: [number, number] = [fire.longitude, fire.latitude];
        const radiusKm = getZoneSize(fire) / 1000;
        const color = getZoneColor(fire);
        
        // Create a circle with given radius in km
        const options = {
          steps: 50,
          units: 'kilometers' as const,
          properties: { 
            fireId: fire.id, 
            intensity: fire.intensity || 'Low'
          }
        };
        
        // Add circle to map
        const circle = new mapboxgl.Marker({
          element: document.createElement('div'),
          anchor: 'center'
        })
          .setLngLat(center);
        
        const el = circle.getElement();
        el.className = 'danger-zone-circle';
        el.setAttribute('data-source-id', sourceId);
        el.style.width = '0';
        el.style.height = '0';
        
        circle.addTo(map);
        
        // Add a source and layer for the danger zone
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: center
            }
          }
        });
        
        map.addLayer({
          id: `${sourceId}-fill`,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': {
              stops: [
                [0, 0],
                [10, radiusKm * 200], // Scale radius based on zoom level
                [15, radiusKm * 1000]
              ]
            },
            'circle-color': color,
            'circle-opacity': 0.2,
            'circle-blur': 0.5
          }
        });
        
        map.addLayer({
          id: `${sourceId}-line`,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': {
              stops: [
                [0, 0],
                [10, radiusKm * 200],
                [15, radiusKm * 1000]
              ]
            },
            'circle-color': 'transparent',
            'circle-stroke-color': color,
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.3
          }
        });
      } catch (e) {
        console.error("Error adding danger zone:", e);
      }
    });
    
    // Cleanup on unmount
    return () => {
      if (!map) return;
      
      const existingCircles = document.querySelectorAll('.danger-zone-circle');
      existingCircles.forEach(circle => {
        try {
          const sourceId = circle.getAttribute('data-source-id');
          if (sourceId && map.getSource(sourceId)) {
            map.removeLayer(`${sourceId}-fill`);
            map.removeLayer(`${sourceId}-line`);
            map.removeSource(sourceId);
          }
        } catch (e) {
          console.error("Error removing circle source/layer:", e);
        }
        circle.remove();
      });
    };
  }, [map, fires]);
  
  // Elements are added directly to the map, no need to render anything here
  return null;
};

export default DangerZoneOverlay;
