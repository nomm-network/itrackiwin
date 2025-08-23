import { supabase } from "@/integrations/supabase/client";

// Translation cache to avoid repeated API calls
const translationCache = new Map<string, Map<string, string>>();

/**
 * Core translation function - fetches from Supabase text_translations table
 */
export async function fetchTranslations(languageCode: string = 'en'): Promise<Map<string, string>> {
  if (translationCache.has(languageCode)) {
    return translationCache.get(languageCode)!;
  }

  try {
    const { data, error } = await supabase
      .from('text_translations')
      .select('key, value')
      .eq('language_code', languageCode);

    if (error) {
      console.error('Error fetching translations:', error);
      // Fallback to English if current language fails
      if (languageCode !== 'en') {
        return fetchTranslations('en');
      }
      return new Map();
    }

    const translations = new Map<string, string>();
    data?.forEach(({ key, value }) => {
      translations.set(key, value);
    });

    translationCache.set(languageCode, translations);
    return translations;
  } catch (error) {
    console.error('Translation fetch error:', error);
    return new Map();
  }
}

/**
 * Get translated text with fallback support
 */
export async function getTranslation(
  key: string, 
  languageCode: string = 'en',
  fallback?: string
): Promise<string> {
  try {
    // Use the get_text function from Supabase for optimized translation retrieval
    const { data, error } = await supabase.rpc('get_text', {
      p_key: key,
      p_language_code: languageCode
    });

    if (error) {
      console.error('Translation RPC error:', error);
      return fallback || key;
    }

    return data || fallback || key;
  } catch (error) {
    console.error('Translation error:', error);
    return fallback || key;
  }
}

/**
 * Batch translation fetcher for better performance
 */
export async function getBatchTranslations(
  keys: string[],
  languageCode: string = 'en'
): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('text_translations')
      .select('key, value')
      .eq('language_code', languageCode)
      .in('key', keys);

    if (error) {
      console.error('Batch translation error:', error);
      return {};
    }

    const translations: Record<string, string> = {};
    data?.forEach(({ key, value }) => {
      translations[key] = value;
    });

    // Fill missing keys with fallback values
    keys.forEach(key => {
      if (!translations[key]) {
        translations[key] = key;
      }
    });

    return translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    return {};
  }
}

/**
 * Clear translation cache (useful for language switching)
 */
export function clearTranslationCache(languageCode?: string) {
  if (languageCode) {
    translationCache.delete(languageCode);
  } else {
    translationCache.clear();
  }
}