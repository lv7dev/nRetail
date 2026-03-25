import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import viAuth from '@/locales/vi/auth.json'
import enAuth from '@/locales/en/auth.json'
import viCommon from '@/locales/vi/common.json'
import enCommon from '@/locales/en/common.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'vi',
    defaultNS: 'common',
    resources: {
      vi: { auth: viAuth, common: viCommon },
      en: { auth: enAuth, common: enCommon },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

export default i18n
