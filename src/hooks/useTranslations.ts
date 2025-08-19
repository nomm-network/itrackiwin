import { useTranslation } from 'react-i18next';

export const useTranslations = () => {
  const { i18n } = useTranslation();

  const getTranslatedName = (item: {
    translations: Record<string, { name: string; description?: string }> | null;
    fallback_name: string;
  }) => {
    if (item.translations?.[i18n.language]?.name) {
      return item.translations[i18n.language].name;
    }
    if (item.translations?.en?.name) {
      return item.translations.en.name;
    }
    return item.fallback_name;
  };

  const getTranslatedDescription = (item: {
    translations: Record<string, { name: string; description?: string }> | null;
  }) => {
    if (item.translations?.[i18n.language]?.description) {
      return item.translations[i18n.language].description;
    }
    if (item.translations?.en?.description) {
      return item.translations.en.description;
    }
    return null;
  };

  return {
    getTranslatedName,
    getTranslatedDescription,
    currentLanguage: i18n.language,
  };
};