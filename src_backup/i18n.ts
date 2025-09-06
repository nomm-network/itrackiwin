import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: {
    common: {
      home: 'Home',
      admin: 'Admin',
      dashboard: 'Dashboard',
      account: 'Account',
      loading: 'Loading...',
      viewAll: 'View All'
    },
    navigation: {
      categories: 'Categories',
      subcategories: 'Subcategories',
      exercises: 'Exercises',
      translations: 'Translations',
      main_menu: 'Main Menu',
      translations_menu: 'Translations Menu'
    },
    fitness: 'Fitness',
    progress: 'Progress',
    profile: 'Profile',
    quickActions: 'Quick Actions',
    quickStart: 'Quick Start',
    templates: 'Templates',
    history: 'History',
    quickLog: 'Quick Log',
    logSet: 'Log Set',
    settings: 'Settings',
    configure: 'Configure',
    workout: 'Workout',
    recentWorkouts: 'Recent Workouts',
    completed: 'Completed',
    inProgress: 'In Progress',
    noWorkouts: 'No workouts yet',
    startFirstWorkout: 'Start First Workout',
    labels: {
      no_categories: 'No categories found.',
      no_subcategories: 'No subcategories yet.',
      select_language: 'Select Language',
      select_category: 'Select Category',
      select_exercise: 'Select Exercise',
      search_exercises: 'Search exercises...',
      add_new_translation: 'Add New Translation',
      existing_translations: 'Existing Translations',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      name: 'Name',
      description: 'Description',
      exercise: 'Exercise',
      category: 'Category',
      subcategory: 'Subcategory',
      enter_name: 'Enter name',
      enter_description: 'Enter description',
      add_translation: 'Add Translation',
      no_translations_found: 'No translations found.',
      no_subcategories_found: 'No subcategories found for selected category.',
      select_subcategory: 'Select Subcategory',
      translation_saved: 'Translation saved successfully!',
      translation_deleted: 'Translation deleted successfully!',
      error: 'Error'
    },
    pages: {
      category_translations: 'Category Translations',
      subcategory_translations: 'Subcategory Translations', 
      exercise_translations: 'Exercise Translations'
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
      loading: 'Cargando...',
      viewAll: 'Ver Todo'
    },
    navigation: {
      categories: 'Categorías',
      subcategories: 'Subcategorías',
      exercises: 'Ejercicios',
      translations: 'Traducciones',
      main_menu: 'Menú Principal',
      translations_menu: 'Menú de Traducciones'
    },
    fitness: 'Fitness',
    progress: 'Progreso',
    profile: 'Perfil',
    quickActions: 'Acciones Rápidas',
    quickStart: 'Inicio Rápido',
    templates: 'Plantillas',
    history: 'Historial',
    quickLog: 'Registro Rápido',
    logSet: 'Registrar Serie',
    settings: 'Configuración',
    configure: 'Configurar',
    workout: 'Entrenamiento',
    recentWorkouts: 'Entrenamientos Recientes',
    completed: 'Completado',
    inProgress: 'En Progreso',
    noWorkouts: 'Sin entrenamientos aún',
    startFirstWorkout: 'Iniciar Primer Entrenamiento',
    labels: {
      no_categories: 'No se encontraron categorías.',
      no_subcategories: 'Aún no hay subcategorías.',
      select_language: 'Seleccionar Idioma',
      select_category: 'Seleccionar Categoría',
      select_exercise: 'Seleccionar Ejercicio',
      search_exercises: 'Buscar ejercicios...',
      add_new_translation: 'Agregar Nueva Traducción',
      existing_translations: 'Traducciones Existentes',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      cancel: 'Cancelar',
      name: 'Nombre',
      description: 'Descripción',
      exercise: 'Ejercicio',
      category: 'Categoría',
      subcategory: 'Subcategoría',
      enter_name: 'Introducir nombre',
      enter_description: 'Introducir descripción',
      add_translation: 'Agregar Traducción',
      no_translations_found: 'No se encontraron traducciones.',
      no_subcategories_found: 'No se encontraron subcategorías para la categoría seleccionada.',
      select_subcategory: 'Seleccionar Subcategoría',
      translation_saved: '¡Traducción guardada exitosamente!',
      translation_deleted: '¡Traducción eliminada exitosamente!',
      error: 'Error'
    },
    pages: {
      category_translations: 'Traducciones de Categorías',
      subcategory_translations: 'Traducciones de Subcategorías',
      exercise_translations: 'Traducciones de Ejercicios'
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
      loading: 'Se încarcă...',
      viewAll: 'Vezi Tot'
    },
    navigation: {
      categories: 'Categorii',
      subcategories: 'Subcategorii',
      exercises: 'Exerciții',
      translations: 'Traduceri',
      main_menu: 'Meniu Principal',
      translations_menu: 'Meniu Traduceri'
    },
    fitness: 'Fitness',
    progress: 'Progres',
    profile: 'Profil',
    quickActions: 'Acțiuni Rapide',
    quickStart: 'Start Rapid',
    templates: 'Șabloane',
    history: 'Istoric',
    quickLog: 'Jurnal Rapid',
    logSet: 'Înregistrează Set',
    settings: 'Setări',
    configure: 'Configurează',
    workout: 'Antrenament',
    recentWorkouts: 'Antrenamente Recente',
    completed: 'Completat',
    inProgress: 'În Progres',
    noWorkouts: 'Încă fără antrenamente',
    startFirstWorkout: 'Începe Primul Antrenament',
    labels: {
      no_categories: 'Nu s-au găsit categorii.',
      no_subcategories: 'Încă nu există subcategorii.',
      select_language: 'Selectează Limba',
      select_category: 'Selectează Categoria',
      select_exercise: 'Selectează Exercițiul',
      search_exercises: 'Caută exerciții...',
      add_new_translation: 'Adaugă Traducere Nouă',
      existing_translations: 'Traduceri Existente',
      save: 'Salvează',
      edit: 'Editează',
      delete: 'Șterge',
      cancel: 'Anulează',
      name: 'Nume',
      description: 'Descriere',
      exercise: 'Exercițiu',
      category: 'Categorie',
      subcategory: 'Subcategorie',
      enter_name: 'Introdu numele',
      enter_description: 'Introdu descrierea',
      add_translation: 'Adaugă Traducere',
      no_translations_found: 'Nu s-au găsit traduceri.',
      no_subcategories_found: 'Nu s-au găsit subcategorii pentru categoria selectată.',
      select_subcategory: 'Selectează Subcategoria',
      translation_saved: 'Traducere salvată cu succes!',
      translation_deleted: 'Traducere ștearsă cu succes!',
      error: 'Eroare'
    },
    pages: {
      category_translations: 'Traduceri Categorii',
      subcategory_translations: 'Traduceri Subcategorii',
      exercise_translations: 'Traduceri Exerciții'
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
