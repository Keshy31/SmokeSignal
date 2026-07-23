import React from 'react';
import { useTranslation } from 'react-i18next';

const OfflineIndicator: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-[hsl(var(--amber-warning))] bg-opacity-10 border border-[hsl(var(--amber-warning))] border-opacity-30 rounded-lg p-3 flex items-center mb-6">
      <i className="ri-wifi-off-line text-[hsl(var(--amber-warning))] mr-2"></i>
      <div className="text-sm">
        <span className="text-[hsl(var(--amber-warning))] font-medium">{t('offline.title')}</span>
        <p className="text-gray-300 text-xs mt-0.5">{t('offline.description')}</p>
      </div>
    </div>
  );
};

export default OfflineIndicator;
