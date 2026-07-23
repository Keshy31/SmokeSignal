import React from 'react';
import { useTranslation } from 'react-i18next';

const AppHeader: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center">
      <div className="bg-app-dark bg-opacity-70 p-2 rounded-lg">
        <i className="ri-fire-line text-[#FF4500] text-2xl"></i>
      </div>
      <h1 className="ml-2 text-xl font-bold font-rubik text-white">{t('app.name')}</h1>
    </div>
  );
};

export default AppHeader;
