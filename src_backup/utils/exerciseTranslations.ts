// Utility function to get exercise name from translations
export const getExerciseNameFromTranslations = (translations: any, exerciseId?: string): string => {
  if (!translations) {
    return exerciseId ? `Exercise ${exerciseId.slice(0, 8)}` : 'Unknown Exercise';
  }
  
  // Try to get name from translations in order of preference
  const name = translations?.en?.name || 
               translations?.ro?.name || 
               (Object.values(translations)[0] as any)?.name;
  
  return name || (exerciseId ? `Exercise ${exerciseId.slice(0, 8)}` : 'Unknown Exercise');
};

// Utility function to get exercise description from translations  
export const getExerciseDescriptionFromTranslations = (translations: any): string | undefined => {
  if (!translations) return undefined;
  
  // Try to get description from translations in order of preference
  return translations?.en?.description || 
         translations?.ro?.description || 
         (Object.values(translations)[0] as any)?.description;
};