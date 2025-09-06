export function getExerciseDisplayName(ex: any): string {
  // Debug logging to see the actual data structure
  console.log('🔍 getExerciseDisplayName input:', {
    ex,
    exercise: ex?.exercise,
    translations: ex?.exercise?.exercises_translations,
    translationsType: Array.isArray(ex?.exercise?.exercises_translations) ? 'array' : typeof ex?.exercise?.exercises_translations,
    legacyTranslations: ex?.exercise?.translations,
    legacyTranslationsType: typeof ex?.exercise?.translations
  });

  // Handle new array-based translations structure from exercises_translations
  const translations = ex?.exercise?.exercises_translations;
  if (translations && Array.isArray(translations)) {
    console.log('🎯 Found exercises_translations array:', translations);
    
    // Try English first
    const enTranslation = translations.find(t => t.language_code === 'en');
    if (enTranslation?.name) {
      console.log('🎯 Found English translation from exercises_translations:', enTranslation.name);
      return enTranslation.name;
    }
    
    // Fallback to any available translation
    const anyTranslation = translations.find(t => t.name);
    if (anyTranslation?.name) {
      console.log('🎯 Found any translation from exercises_translations:', anyTranslation.name);
      return anyTranslation.name;
    }
  }
  
  // Handle old array-based translations structure (legacy)
  const legacyTranslations = ex?.exercise?.translations;
  if (legacyTranslations && Array.isArray(legacyTranslations)) {
    console.log('🎯 Found legacy translations array:', legacyTranslations);
    
    // Try English first
    const enTranslation = legacyTranslations.find(t => t.language_code === 'en');
    if (enTranslation?.name) {
      console.log('🎯 Found English translation from legacy:', enTranslation.name);
      return enTranslation.name;
    }
    
    // Fallback to any available translation
    const anyTranslation = legacyTranslations.find(t => t.name);
    if (anyTranslation?.name) {
      console.log('🎯 Found any translation from legacy:', anyTranslation.name);
      return anyTranslation.name;
    }
  }
  
  // Legacy fallbacks for old data structure
  const fallbackName = (
    ex?.exercise?.translations?.en?.name ??
    ex?.translations?.en?.name ??
    ex?.exercise?.name ??
    ex?.name ??
    'Exercise'
  );
  
  console.log('🎯 Using fallback name:', fallbackName);
  console.log('🔍 All fallback paths checked:', {
    'ex.exercise.translations.en.name': ex?.exercise?.translations?.en?.name,
    'ex.translations.en.name': ex?.translations?.en?.name,
    'ex.exercise.name': ex?.exercise?.name,
    'ex.name': ex?.name
  });
  
  return fallbackName;
}