import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, translations, TranslationMap } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const LS_KEY = 'mp-language';

function loadLanguage(): Language {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === 'zh' || stored === 'en') return stored;
  } catch {}
  return 'zh';
}

const availableLanguages: Language[] = ['zh', 'en'];

export { availableLanguages };

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(loadLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LS_KEY, lang);
    } catch {}
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const map: TranslationMap = translations[language];
    let value = map[key];
    if (value === undefined) return key;
    if (params) {
      value = value.replace(/\{(\w+)\}/g, (_, p) => String(params[p] ?? `{${p}}`));
    }
    return value;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
