export function getExerciseDisplayName(ex: any): string {
  // Debug logging to see the actual data structure
  console.log('🔍 getExerciseDisplayName input:', {
    ex,
    exercise: ex?.exercise,
    translations: ex?.exercise?.translations,
    translationsType: Array.isArray(ex?.exercise?.translations) ? 'array' : typeof ex?.exercise?.translations
  });

  // Handle new array-based translations structure
  const translations = ex?.exercise?.translations;
  if (translations && Array.isArray(translations)) {
    // Try English first
    const enTranslation = translations.find(t => t.language_code === 'en');
    if (enTranslation?.name) {
      console.log('🎯 Found English translation:', enTranslation.name);
      return enTranslation.name;
    }
    
    // Fallback to any available translation
    const anyTranslation = translations.find(t => t.name);
    if (anyTranslation?.name) {
      console.log('🎯 Found any translation:', anyTranslation.name);
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
  return fallbackName;
}