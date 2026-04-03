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
import viHome from '@/locales/vi/home.json';
import enHome from '@/locales/en/home.json';
import viOutletDetail from '@/locales/vi/outlet-detail.json';
import enOutletDetail from '@/locales/en/outlet-detail.json';
import viAccount from '@/locales/vi/account.json';
import enAccount from '@/locales/en/account.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'vi',
    defaultNS: 'common',
    ns: ['common', 'auth', 'errors', 'outlets', 'home', 'outlet-detail', 'account'],
    resources: {
      vi: {
        auth: viAuth,
        common: viCommon,
        errors: viErrors,
        outlets: viOutlets,
        home: viHome,
        'outlet-detail': viOutletDetail,
        account: viAccount,
      },
      en: {
        auth: enAuth,
        common: enCommon,
        errors: enErrors,
        outlets: enOutlets,
        home: enHome,
        'outlet-detail': enOutletDetail,
        account: enAccount,
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      convertDetectedLanguage: (lng: string) => lng.split('-')[0],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
