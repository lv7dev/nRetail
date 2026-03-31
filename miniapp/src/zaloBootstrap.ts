// Bootstrap: seeds localStorage from Zalo system info before i18n and theme store initialize.
// MUST be imported before '@/i18n' in app.tsx — i18next LanguageDetector reads localStorage
// during i18n.init(), so the seed must exist before that call runs.
//
// Note: getSystemInfo is imported at module level (exception to the lazy-import rule) because
// this module is never loaded outside the project's Vite/Vitest pipeline, and the function
// is only CALLED inside the isZalo guard — never in browser-dev or test environments.
import { getSystemInfo } from 'zmp-sdk';

const SUPPORTED_LANGUAGES = new Set(['vi', 'en']);
const KNOWN_THEMES = new Set(['light', 'dark']);

export function initZaloBootstrap(): void {
  // Only run inside the Zalo WebView. window.APP_ID is set by the Zalo container before
  // the mini app boots; it is undefined in browser dev and all test environments.
  if (typeof window === 'undefined' || !window.APP_ID) return;

  const { zaloLanguage, zaloTheme } = getSystemInfo();

  // ── Language ────────────────────────────────────────────────────────────────
  // Seed only when the user has no stored preference yet.
  if (!localStorage.getItem('i18nextLng')) {
    const lang = zaloLanguage.split('-')[0];
    if (SUPPORTED_LANGUAGES.has(lang)) {
      localStorage.setItem('i18nextLng', lang);
    }
  }

  // ── Theme ───────────────────────────────────────────────────────────────────
  // Seed only when no stored preference exists.
  if (!localStorage.getItem('theme-preference')) {
    const preference = KNOWN_THEMES.has(zaloTheme) ? zaloTheme : 'system';
    localStorage.setItem('theme-preference', JSON.stringify({ state: { preference }, version: 0 }));
  }
}

// Run on module load — this is the side-effect that app.tsx depends on.
initZaloBootstrap();
