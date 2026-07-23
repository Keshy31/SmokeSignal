import React, { useEffect, useRef } from 'react';
import { FireLocation } from '@/types';
import mapboxgl from 'mapbox-gl';
import { useMapContext } from '@/contexts/MapContext';
import { useFires } from '@/hooks/useFires';

interface FireMarkersProps {
  onFireSelect: (fire: FireLocation) => void;
}

const FireMarkers: React.FC<FireMarkersProps> = ({ onFireSelect }) => {
  const { map } = useMapContext();
  const sourcesAddedRef = useRef(false);
  const { fires, isLoading } = useFires();
  
  // Limit the number of fires to prevent performance issues
  const MAX_FIRES_TO_DISPLAY = 1000;

  // Filter and process fires for performance
  const getDisplayFires = (allFires: FireLocation[]) => {
    if (!allFires || allFires.length === 0) return [];
    
    // Sort by FRP (intensity) to show the most significant fires first
    const sortedFires = [...allFires].sort((a, b) => (b.frp || 0) - (a.frp || 0));
    
    // Take only the top fires for performance
    const limitedFires = sortedFires.slice(0, MAX_FIRES_TO_DISPLAY);
    
    console.log(`Displaying ${limitedFires.length} fires out of ${allFires.length} total fires`);
    return limitedFires;
  };

  // Add fire data to map using Mapbox layers for better performance
  useEffect(() => {
    if (!map || isLoading || !fires || fires.length === 0) {
      if (!map) console.warn('Map not initialized yet, skipping fire data');
      if (isLoading) console.log('Fire data is still loading');
      if (!fires || fires.length === 0) console.warn('No fire data available to display');
      return;
    }

    if (!map.loaded()) {
      const checkMapLoaded = () => {
        if (map.loaded()) {
          addFireLayersToMap();
        } else {
          setTimeout(checkMapLoaded, 500);
        }
      };
      checkMapLoaded();
      return;
    }

    addFireLayersToMap();

    function addFireLayersToMap() {
      if (!map) return;

      // Get limited fire data for display
      const displayFires = getDisplayFires(fires);

      // Remove existing sources and layers
      try {
        if (map.getLayer('fires-layer')) map.removeLayer('fires-layer');
        if (map.getLayer('fires-clusters')) map.removeLayer('fires-clusters');
        if (map.getLayer('fires-cluster-count')) map.removeLayer('fires-cluster-count');
        if (map.getSource('fires')) map.removeSource('fires');
      } catch (e) {
        // Source/layer might not exist yet
      }

      // Create GeoJSON feature collection from fire data
      const fireFeatures = displayFires.map(fire => ({
        type: 'Feature' as const,
        properties: {
          id: fire.id,
          frp: fire.frp || 0,
          intensity: fire.intensity,
          location: fire.location,
          detectedTime: fire.detectedTime,
          confidence: fire.confidence,
          satellite: fire.satellite
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [fire.longitude, fire.latitude]
        }
      }));

      const fireGeoJSON = {
        type: 'FeatureCollection' as const,
        features: fireFeatures
      };

      // Add source
      map.addSource('fires', {
        type: 'geojson',
        data: fireGeoJSON,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add clustered points layer
      map.addLayer({
        id: 'fires-clusters',
        type: 'circle',
        source: 'fires',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#FFA500',
            10, '#FF4500',
            30, '#FF0000'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15,
            10, 20,
            30, 25
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // Add cluster labels
      map.addLayer({
        id: 'fires-cluster-count',
        type: 'symbol',
        source: 'fires',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Add individual fire points
      map.addLayer({
        id: 'fires-layer',
        type: 'circle',
        source: 'fires',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['>', ['get', 'frp'], 100], '#FF0000',
            ['>', ['get', 'frp'], 50], '#FF4500',
            ['>', ['get', 'frp'], 20], '#FFA500',
            '#FFD700'
          ],
          'circle-radius': [
            'case',
            ['>', ['get', 'frp'], 100], 8,
            ['>', ['get', 'frp'], 50], 7,
            ['>', ['get', 'frp'], 20], 6,
            5
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.8
        }
      });

      // Add click handler for individual fires
      map.on('click', 'fires-layer', (e) => {
        if (e.features && e.features[0]) {
          const fireId = e.features[0].properties?.id;
          const fire = displayFires.find(f => f.id === fireId);
          if (fire) {
            onFireSelect(fire);
          }
        }
      });

      // Add click handler for clusters
      map.on('click', 'fires-clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['fires-clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId) {
          const source = map.getSource('fires') as mapboxgl.GeoJSONSource;
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (!err && e.lngLat) {
              map.easeTo({
                center: e.lngLat,
                zoom: zoom || map.getZoom() + 1
              });
            }
          });
        }
      });

      // Change cursor on hover
      map.on('mouseenter', 'fires-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'fires-layer', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('mouseenter', 'fires-clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'fires-clusters', () => {
        map.getCanvas().style.cursor = '';
      });

      sourcesAddedRef.current = true;
      console.log(`Added ${displayFires.length} fires to map using layers`);
    }

    // Cleanup function
    return () => {
      try {
        if (map.getLayer('fires-layer')) map.removeLayer('fires-layer');
        if (map.getLayer('fires-clusters')) map.removeLayer('fires-clusters');
        if (map.getLayer('fires-cluster-count')) map.removeLayer('fires-cluster-count');
        if (map.getSource('fires')) map.removeSource('fires');
      } catch (e) {
        // Layers might not exist
      }
      sourcesAddedRef.current = false;
    };
  }, [map, fires, isLoading, onFireSelect]);

  // No visible UI - adds layers directly to map
  return null;
};

export default FireMarkers;