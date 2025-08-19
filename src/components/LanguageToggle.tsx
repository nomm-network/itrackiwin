import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const current = (i18n.language || 'en').split('-')[0];

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('languages')
        .select('code, name, native_name, flag_emoji')
        .eq('is_active', true)
        .order('code');
      if (error) throw error;
      return data || [];
    },
  });

  const onChange = (val: string) => {
    i18n.changeLanguage(val);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', val);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === current);

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-[120px]" aria-label="Select language">
        <SelectValue>
          {currentLanguage && (
            <span className="flex items-center gap-2">
              <span>{currentLanguage.flag_emoji}</span>
              <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag_emoji}</span>
              <span>{lang.native_name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageToggle;
