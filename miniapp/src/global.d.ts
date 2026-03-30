// Global browser window augmentations for the miniapp bootstrap.
// APP_CONFIG is set in src/app.tsx from app-config.json before the app
// renders, making the Zalo Mini App configuration available globally.
declare global {
  interface Window {
    APP_CONFIG?: unknown;
  }
}

export {};
