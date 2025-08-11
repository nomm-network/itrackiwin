import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const current = (i18n.language || 'en').split('-')[0];

  const onChange = (val: string) => {
    i18n.changeLanguage(val);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', val);
    }
  };

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-[100px]" aria-label="Select language">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Español</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageToggle;
