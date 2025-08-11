import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: {
    common: {
      home: 'Home',
      admin: 'Admin',
      dashboard: 'Dashboard',
      account: 'Account',
      loading: 'Loading...'
    },
    admin: {
      categories: 'Categories',
      subcategories: 'Subcategories',
      no_categories: 'No categories found.',
      no_subcategories: 'No subcategories yet.'
    },
    categories: {
      health: 'Health'
    },
    subcategories: {
      // example: cardio: 'Cardio'
    }
  } },
  es: { translation: {
    common: {
      home: 'Inicio',
      admin: 'Admin',
      dashboard: 'Panel',
      account: 'Cuenta',
      loading: 'Cargando...'
    },
    admin: {
      categories: 'Categorías',
      subcategories: 'Subcategorías',
      no_categories: 'No se encontraron categorías.',
      no_subcategories: 'Aún no hay subcategorías.'
    },
    categories: {
      health: 'Salud'
    },
    subcategories: {
    }
  } },
  ro: { translation: {
    common: {
      home: 'Acasă',
      admin: 'Admin',
      dashboard: 'Panou',
      account: 'Cont',
      loading: 'Se încarcă...'
    },
    admin: {
      categories: 'Categorii',
      subcategories: 'Subcategorii',
      no_categories: 'Nu s-au găsit categorii.',
      no_subcategories: 'Încă nu există subcategorii.'
    },
    categories: {
      health: 'Sănătate'
    },
    subcategories: {
    }
  } }
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
