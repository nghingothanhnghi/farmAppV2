// src/hooks/useLanguage.ts
import { useCallback } from 'react';
import i18n from '../i18n';

export const useLanguage = () => {
  const changeLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
  }, []);

  return {
    language: i18n.language,
    changeLanguage,
  };
};
