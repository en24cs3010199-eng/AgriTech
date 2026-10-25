import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import hiTranslations from '../locales/hi.json';

const LanguageContext = createContext();

const translations = {
  en: enTranslations,
  hi: hiTranslations
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agritech_lang') || 'hi';
  });

  useEffect(() => {
    localStorage.setItem('agritech_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  /**
   * Helper to retrieve nested localization keys, e.g. t('nav.dashboard')
   */
  const t = (keyPath, fallback = '') => {
    if (!keyPath) return fallback;
    const parts = keyPath.split('.');
    let current = translations[language];

    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        // Fallback to English if missing in Hindi
        let enCurrent = translations['en'];
        for (const enPart of parts) {
          if (enCurrent && enCurrent[enPart] !== undefined) {
            enCurrent = enCurrent[enPart];
          } else {
            return fallback || keyPath;
          }
        }
        return enCurrent || fallback || keyPath;
      }
    }
    return typeof current === 'string' ? current : fallback || keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
