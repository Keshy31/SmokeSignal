import React, { useState, useEffect } from 'react';
import { FireLocation } from '@/types';
import { useFires } from '@/hooks/useFires';

interface MapFallbackProps {
  onFireSelect: (fire: FireLocation) => void;
}

const MapFallback: React.FC<MapFallbackProps> = ({ onFireSelect }) => {
  const { fires, isLoading } = useFires();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'intensity' | 'distance' | 'time'>('intensity');

  // Filter and sort fires for display
  const getFilteredFires = () => {
    if (!fires) return [];
    
    let filteredFires = [...fires];
    
    // Filter by region
    if (selectedRegion !== 'all') {
      filteredFires = filteredFires.filter(fire => 
        fire.location?.toLowerCase().includes(selectedRegion.toLowerCase())
      );
    }
    
    // Sort fires
    switch (sortBy) {
      case 'intensity':
        filteredFires.sort((a, b) => (b.frp || 0) - (a.frp || 0));
        break;
      case 'distance':
        filteredFires.sort((a, b) => parseFloat(String(a.distance || '0')) - parseFloat(String(b.distance || '0')));
        break;
      case 'time':
        filteredFires.sort((a, b) => (a.detectedTime || '').localeCompare(b.detectedTime || ''));
        break;
    }
    
    // Limit to top 50 for performance
    return filteredFires.slice(0, 50);
  };

  const filteredFires = getFilteredFires();
  const uniqueRegions = Array.from(new Set(fires?.map(fire => fire.location).filter(Boolean) || [])).slice(0, 10);

  const getIntensityColor = (frp: number) => {
    if (frp > 100) return 'bg-red-600';
    if (frp > 50) return 'bg-orange-500';
    if (frp > 20) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIntensityText = (frp: number) => {
    if (frp > 100) return 'Extreme';
    if (frp > 50) return 'High';
    if (frp > 20) return 'Moderate';
    return 'Low';
  };

  return (
    <div className="flex-1 w-full h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Fire Alert Dashboard</h2>
        <div className="flex flex-wrap gap-4">
          {/* Region Filter */}
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-300 mb-1">Region</label>
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="all">All Regions</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          
          {/* Sort By */}
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'intensity' | 'distance' | 'time')}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="intensity">Fire Intensity</option>
              <option value="distance">Distance</option>
              <option value="time">Detection Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-2xl font-bold text-orange-400">{fires?.length || 0}</div>
            <div className="text-sm text-gray-300">Total Fires</div>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-2xl font-bold text-red-400">
              {fires?.filter(f => (f.frp || 0) > 50).length || 0}
            </div>
            <div className="text-sm text-gray-300">High Intensity</div>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-2xl font-bold text-yellow-400">
              {fires?.filter(f => (f.frp || 0) > 20 && (f.frp || 0) <= 50).length || 0}
            </div>
            <div className="text-sm text-gray-300">Moderate</div>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-2xl font-bold text-green-400">
              {fires?.filter(f => (f.frp || 0) <= 20).length || 0}
            </div>
            <div className="text-sm text-gray-300">Low Intensity</div>
          </div>
        </div>
      </div>

      {/* Fire List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-300">Loading fire data...</span>
          </div>
        ) : filteredFires.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-lg">No fires found</div>
              <div className="text-gray-500 text-sm mt-2">
                {selectedRegion !== 'all' ? 'Try selecting a different region' : 'No active fires in the selected area'}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredFires.map((fire) => (
              <div 
                key={fire.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors"
                onClick={() => onFireSelect(fire)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getIntensityColor(fire.frp || 0)}`}></div>
                      <h3 className="font-semibold text-white">{fire.location || 'Unknown Location'}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                        getIntensityColor(fire.frp || 0)
                      } bg-opacity-80`}>
                        {getIntensityText(fire.frp || 0)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Coordinates:</span>
                        <div className="text-white">{fire.latitude.toFixed(4)}, {fire.longitude.toFixed(4)}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Intensity (FRP):</span>
                        <div className="text-white">{fire.frp?.toFixed(1) || 'N/A'} MW</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Detected:</span>
                        <div className="text-white">{fire.detectedTime}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Satellite:</span>
                        <div className="text-white">{fire.satellite}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapFallback;