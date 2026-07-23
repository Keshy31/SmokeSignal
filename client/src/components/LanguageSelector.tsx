import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  
  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };
  
  return (
    <div className="bg-app-dark bg-opacity-80 p-2 rounded-lg">
      <Select 
        defaultValue={i18n.language} 
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="bg-transparent text-app-text-light border-none w-24 h-8 focus:ring-0">
          <SelectValue placeholder={t('app.languageName')} />
        </SelectTrigger>
        <SelectContent className="bg-app-dark-lighter border-gray-700">
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="af">Afrikaans</SelectItem>
          <SelectItem value="xh">isiXhosa</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
