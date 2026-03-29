import { nativeStorage } from 'zmp-sdk';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// window.APP_ID is set by the Zalo container before the mini app boots.
// It is undefined in browser dev and test environments.
/* v8 ignore start */
const isZalo = typeof window !== 'undefined' && !!(window as any).APP_ID;

const store = {
  getItem: (key: string): string | null =>
    isZalo ? (nativeStorage.getItem(key) as string | null) : localStorage.getItem(key),
  setItem: (key: string, value: string): void =>
    isZalo ? nativeStorage.setItem(key, value) : localStorage.setItem(key, value),
  removeItem: (key: string): void =>
    isZalo ? nativeStorage.removeItem(key) : localStorage.removeItem(key),
};
/* v8 ignore stop */

export const storage = {
  getAccessToken(): string | null {
    return store.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return store.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken: string): void {
    store.setItem(ACCESS_TOKEN_KEY, accessToken);
    store.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens(): void {
    store.removeItem(ACCESS_TOKEN_KEY);
    store.removeItem(REFRESH_TOKEN_KEY);
  },
};
