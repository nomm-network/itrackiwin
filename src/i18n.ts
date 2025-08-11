import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: {} },
  es: { translation: {} },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

// Keep <html lang> in sync with active language
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', i18n.language.split('-')[0]);
  i18n.on('languageChanged', (lng) => {
    document.documentElement.setAttribute('lang', (lng || 'en').split('-')[0]);
  });
}

export default i18n;
