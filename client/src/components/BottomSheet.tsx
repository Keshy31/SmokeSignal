import React from 'react';
import DirectFireAlertsList from './DirectFireAlertsList';
import SafetyTips from './SafetyTips';
import OfflineIndicator from './OfflineIndicator';
import { useTranslation } from 'react-i18next';

interface BottomSheetProps {
  isExpanded: boolean;
  toggleExpand: () => void;
  isOffline: boolean;
  onAlertMe: (fireId: string) => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isExpanded, 
  toggleExpand, 
  isOffline,
  onAlertMe
}) => {
  const { t } = useTranslation();
  
  return (
    <div 
      className={`bottom-sheet bg-black/80 rounded-t-2xl border-t border-x border-gray-700/40 shadow-[0_-5px_25px_rgba(0,0,0,0.4)] absolute bottom-0 left-0 right-0 z-30 ${isExpanded ? 'expanded' : 'collapsed'}`}
    >
      <div 
        className="flex justify-center py-3 cursor-pointer" 
        onClick={toggleExpand}
      >
        <div className="w-12 h-1.5 bg-gray-400 rounded-full"></div>
      </div>

      <div className="pb-6 px-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 30px)' }}>
        <h2 className="text-xl font-bold font-rubik mb-3">{t('fire.activeTitle')}</h2>
        
        <DirectFireAlertsList onAlertMe={onAlertMe} />
        
        <SafetyTips />
        
        {isOffline && <OfflineIndicator />}
        
        {/* Bottom spacing for extended content */}
        <div className="h-10"></div>
      </div>
    </div>
  );
};

export default BottomSheet;
