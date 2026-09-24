// src/hooks/useLanguage.ts
import { useCallback } from 'react';
import i18n from '../i18n';

export const useLanguage = () => {
  const changeLanguage = useCallback((lang: string) => {
    // Save language for the backend 
    document.cookie = `lang=${lang}; path=/; max-age=31536000`; 
    
    // Update frontend language
    i18n.changeLanguage(lang);
  }, []);

  return {
    language: i18n.language,
    changeLanguage,
  };
};
