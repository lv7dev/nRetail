import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viAuth from '@/locales/vi/auth.json';
import enAuth from '@/locales/en/auth.json';
import viCommon from '@/locales/vi/common.json';
import enCommon from '@/locales/en/common.json';
import viErrors from '@/locales/vi/errors.json';
import enErrors from '@/locales/en/errors.json';
import viOutlets from '@/locales/vi/outlets.json';
import enOutlets from '@/locales/en/outlets.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'vi',
    defaultNS: 'common',
    ns: ['common', 'auth', 'errors', 'outlets'],
    resources: {
      vi: { auth: viAuth, common: viCommon, errors: viErrors, outlets: viOutlets },
      en: { auth: enAuth, common: enCommon, errors: enErrors, outlets: enOutlets },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      convertDetectedLanguage: (lng: string) => lng.split('-')[0],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
