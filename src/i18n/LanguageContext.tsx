import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, SUPPORTED_LANGUAGES, LanguageInfo } from './types';
import { translations, detectUserLocale } from './translations';
import { StorageService } from '../services/storage';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentLanguageInfo: LanguageInfo;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = StorageService.getLanguage();
    if (saved && (saved === 'ru' || saved === 'en' || saved === 'zh' || saved === 'tr')) {
      return saved as Language;
    }
    return detectUserLocale();
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    StorageService.setLanguage(newLang);
    try {
      document.documentElement.lang = newLang;
    } catch {}
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {}
  }, [language]);

  /**
   * Helper to look up nested translation key (e.g. 'nav.jokes', 'reels.aiCutBtn')
   * with fallback to Russian if key is missing.
   */
  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let cur: any = translations[language];

    for (const k of keys) {
      if (cur && typeof cur === 'object' && k in cur) {
        cur = cur[k];
      } else {
        cur = undefined;
        break;
      }
    }

    // Fallback to Russian
    if (cur === undefined) {
      let fallback: any = translations.ru;
      for (const k of keys) {
        if (fallback && typeof fallback === 'object' && k in fallback) {
          fallback = fallback[k];
        } else {
          fallback = undefined;
          break;
        }
      }
      cur = fallback ?? path;
    }

    if (typeof cur !== 'string') {
      return path;
    }

    // Interpolation {param}
    if (params) {
      return Object.entries(params).reduce((acc, [k, v]) => {
        return acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }, cur);
    }

    return cur;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageInfo: SUPPORTED_LANGUAGES[language],
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
