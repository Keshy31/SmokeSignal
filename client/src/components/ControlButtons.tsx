import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';

interface ControlButtonsProps {
  onToggleLayers: () => void;
  onToggleSettings: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({ 
  onToggleLayers,
  onToggleSettings
}) => {
  const [layersOpen, setLayersOpen] = useState(false);
  const { t } = useTranslation();
  
  const handleLayersToggle = () => {
    setLayersOpen(!layersOpen);
    onToggleLayers();
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover open={layersOpen} onOpenChange={setLayersOpen}>
        <PopoverTrigger asChild>
          <button 
            className="bg-app-dark bg-opacity-70 p-2 rounded-full"
            onClick={handleLayersToggle}
            aria-label={t('map.layers')}
          >
            <i className="ri-layers-line text-app-text-light text-xl"></i>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 bg-app-dark-lighter bg-opacity-90 border-gray-700">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-1">
              <span className="text-sm">3D Terrain</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between p-1">
              <span className="text-sm">Danger Zones</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between p-1">
              <span className="text-sm">Smoke Effect</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ControlButtons;
