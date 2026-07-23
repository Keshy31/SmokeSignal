import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const SafetyTips: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  
  const safetyTips = [
    { id: '1', icon: 'ri-run-line', title: t('safety.evacuateEarly') },
    { id: '2', icon: 'ri-phone-line', title: t('safety.callEmergency') },
    { id: '3', icon: 'ri-water-flash-line', title: t('safety.clearDebris') },
    { id: '4', icon: 'ri-broadcast-line', title: t('safety.stayInformed') },
    { id: '5', icon: 'ri-home-heart-line', title: t('safety.preparePlan') },
    { id: '6', icon: 'ri-first-aid-kit-line', title: t('safety.packEssentials') }
  ];
  
  // Only show first 3 tips in collapsed mode
  const visibleTips = isOpen ? safetyTips : safetyTips.slice(0, 3);
  
  return (
    <div className="bg-app-dark-lighter rounded-xl p-4 shadow-md mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg">{t('safety.title')}</h3>
          <CollapsibleTrigger asChild>
            <button className="text-gray-400">
              <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-xl`}></i>
            </button>
          </CollapsibleTrigger>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {visibleTips.map((tip) => (
            <div key={tip.id} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-app-dark rounded-full flex items-center justify-center mb-2">
                <i className={`${tip.icon} text-[hsl(var(--amber-warning))] text-xl`}></i>
              </div>
              <span className="text-xs">{tip.title}</span>
            </div>
          ))}
        </div>
        
        <CollapsibleContent>
          <div className="mt-4 text-sm text-gray-300 p-2 bg-app-dark bg-opacity-50 rounded-lg">
            <p>Stay upwind of fires. Pack important documents, medications, water, and non-perishable food. Keep vehicles fueled and ready for evacuation.</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SafetyTips;
