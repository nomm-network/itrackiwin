import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslation, getBatchTranslations, clearTranslationCache } from '@/lib/translations';
import { enumDisplayMaps, EnumDisplayMapKeys, EnumDisplayConfig } from '@/lib/enumDisplay';

interface TranslationContextType {
  t: (key: string, fallback?: string) => Promise<string>;
  tSync: (key: string, fallback?: string) => string;
  enumDisplay: (enumType: EnumDisplayMapKeys, value: string, locale?: string) => Promise<EnumDisplayInfo>;
  enumDisplaySync: (enumType: EnumDisplayMapKeys, value: string) => EnumDisplayInfo;
  batchTranslate: (keys: string[]) => Promise<Record<string, string>>;
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  isLoading: boolean;
}

interface EnumDisplayInfo {
  label: string;
  icon?: string;
  color?: string;
  description?: string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children, 
  defaultLanguage = 'en' 
}) => {
  const { i18n, t: i18nT } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Sync language with i18next
  useEffect(() => {
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  /**
   * Async translation function with caching
   */
  const t = async (key: string, fallback?: string): Promise<string> => {
    // Check cache first
    const cacheKey = `${currentLanguage}:${key}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    try {
      const translation = await getTranslation(key, currentLanguage, fallback);
      
      // Cache the result
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translation
      }));
      
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return fallback || key;
    }
  };

  /**
   * Synchronous translation function (fallback to i18next)
   */
  const tSync = (key: string, fallback?: string): string => {
    const cacheKey = `${currentLanguage}:${key}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    // Fallback to i18next for immediate needs
    const i18nResult = i18nT(key, { defaultValue: fallback || key });
    return i18nResult;
  };

  /**
   * Async enum display function
   */
  const enumDisplay = async (
    enumType: EnumDisplayMapKeys, 
    value: string, 
    locale: string = currentLanguage
  ): Promise<EnumDisplayInfo> => {
    const enumConfig = enumDisplayMaps[enumType];
    const enumItem = enumConfig?.[value];

    if (!enumItem) {
      return {
        label: value,
        icon: '❓',
        color: 'gray'
      };
    }

    // Translate the label
    const label = await t(enumItem.key, value);
    let description: string | undefined;
    
    if (enumItem.description) {
      description = await t(enumItem.description);
    }

    return {
      label,
      icon: enumItem.icon,
      color: enumItem.color,
      description
    };
  };

  /**
   * Synchronous enum display function
   */
  const enumDisplaySync = (enumType: EnumDisplayMapKeys, value: string): EnumDisplayInfo => {
    const enumConfig = enumDisplayMaps[enumType];
    const enumItem = enumConfig?.[value];

    if (!enumItem) {
      return {
        label: value,
        icon: '❓',
        color: 'gray'
      };
    }

    const label = tSync(enumItem.key, value);
    let description: string | undefined;
    
    if (enumItem.description) {
      description = tSync(enumItem.description);
    }

    return {
      label,
      icon: enumItem.icon,
      color: enumItem.color,
      description
    };
  };

  /**
   * Batch translation function
   */
  const batchTranslate = async (keys: string[]): Promise<Record<string, string>> => {
    setIsLoading(true);
    try {
      const translations = await getBatchTranslations(keys, currentLanguage);
      
      // Update cache
      setTranslationCache(prev => {
        const updated = { ...prev };
        Object.entries(translations).forEach(([key, value]) => {
          updated[`${currentLanguage}:${key}`] = value;
        });
        return updated;
      });
      
      return translations;
    } catch (error) {
      console.error('Batch translation error:', error);
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Language setter with cache clearing
   */
  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    clearTranslationCache(lang);
    
    // Clear relevant cache entries
    setTranslationCache(prev => {
      const filtered: Record<string, string> = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (!key.startsWith(`${lang}:`)) {
          filtered[key] = value;
        }
      });
      return filtered;
    });
  };

  const contextValue: TranslationContextType = {
    t,
    tSync,
    enumDisplay,
    enumDisplaySync,
    batchTranslate,
    currentLanguage,
    setLanguage,
    isLoading
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

/**
 * Hook to use translation context
 */
export const useAppTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useAppTranslation must be used within a TranslationProvider');
  }
  return context;
};

/**
 * Higher-order component for translation injection
 */
export function withTranslation<P extends object>(
  Component: React.ComponentType<P & { t: TranslationContextType['t'], enumDisplay: TranslationContextType['enumDisplay'] }>
) {
  return function WrappedComponent(props: P) {
    const { t, enumDisplay } = useAppTranslation();
    return <Component {...props} t={t} enumDisplay={enumDisplay} />;
  };
}

/**
 * Utility hook for enum display
 */
export const useEnumDisplay = () => {
  const { enumDisplay, enumDisplaySync } = useAppTranslation();
  
  return {
    enumDisplay,
    enumDisplaySync,
    getEnumOptions: (enumType: EnumDisplayMapKeys) => {
      const enumConfig = enumDisplayMaps[enumType];
      return Object.keys(enumConfig || {});
    }
  };
};