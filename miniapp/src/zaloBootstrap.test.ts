import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock zmp-sdk before importing bootstrap
vi.mock('zmp-sdk', () => ({
  getSystemInfo: vi.fn(),
}));

import { getSystemInfo } from 'zmp-sdk';
import { initZaloBootstrap } from './zaloBootstrap';

const mockGetSystemInfo = vi.mocked(getSystemInfo);

function setZaloEnv(info: { zaloLanguage: string; zaloTheme: string }) {
  (window as Record<string, unknown>).APP_ID = 'test-app-id';
  mockGetSystemInfo.mockReturnValue({
    version: '1.0',
    apiVersion: '2.0',
    zaloVersion: '22.0',
    platform: 'android',
    language: 'vi-VN',
    zaloLanguage: info.zaloLanguage,
    zaloTheme: info.zaloTheme,
  });
}

beforeEach(() => {
  localStorage.clear();
  delete (window as Record<string, unknown>).APP_ID;
  mockGetSystemInfo.mockReset();
});

// ─── 3.1 No-op outside Zalo ─────────────────────────────────────────────────

describe('outside the Zalo container (no window.APP_ID)', () => {
  it('does not write i18nextLng to localStorage', () => {
    initZaloBootstrap();
    expect(localStorage.getItem('i18nextLng')).toBeNull();
  });

  it('does not write theme-preference to localStorage', () => {
    initZaloBootstrap();
    expect(localStorage.getItem('theme-preference')).toBeNull();
  });

  it('does not call getSystemInfo', () => {
    initZaloBootstrap();
    expect(mockGetSystemInfo).not.toHaveBeenCalled();
  });
});

// ─── 3.2 Seeds i18nextLng from zaloLanguage ──────────────────────────────────

describe('seeds i18nextLng from zaloLanguage when key absent', () => {
  it('writes vi when zaloLanguage is vi', () => {
    setZaloEnv({ zaloLanguage: 'vi', zaloTheme: 'light' });
    initZaloBootstrap();
    expect(localStorage.getItem('i18nextLng')).toBe('vi');
  });

  it('writes en when zaloLanguage is en', () => {
    setZaloEnv({ zaloLanguage: 'en', zaloTheme: 'light' });
    initZaloBootstrap();
    expect(localStorage.getItem('i18nextLng')).toBe('en');
  });
});

// ─── 3.3 Normalizes region tag ───────────────────────────────────────────────

describe('normalizes region tag from zaloLanguage', () => {
  it('writes vi when zaloLanguage is vi-VN', () => {
    setZaloEnv({ zaloLanguage: 'vi-VN', zaloTheme: 'light' });
    initZaloBootstrap();
    expect(localStorage.getItem('i18nextLng')).toBe('vi');
  });

  it('writes en when zaloLanguage is en-US', () => {
    setZaloEnv({ zaloLanguage: 'en-US', zaloTheme: 'light' });
    initZaloBootstrap();
    expect(localStorage.getItem('i18nextLng')).toBe('en');
  });
});

// ─── 3.4 Unsupported zaloLanguage does not seed ───────────────────────────────

describe('does not seed i18nextLng for unsupported language', () => {
  it('does not write when zaloLanguage is ja', () => {
    setZaloEnv({ zaloLanguage: 'ja', zaloTheme: 'light' });
    initZaloBootstrap();
    expect(localStorage.getItem('i18nextLng')).toBeNull();
  });

  it('does not write when zaloLanguage is zh-CN', () => {
    setZaloEnv({ zaloLanguage: 'zh-CN', zaloTheme: 'light' });
    initZaloBootstrap();
    expect(localStorage.getItem('i18nextLng')).toBeNull();
  });
});

// ─── 3.5 Does not overwrite existing i18nextLng ───────────────────────────────

describe('does not overwrite existing i18nextLng', () => {
  it('preserves user-stored en when zaloLanguage is vi', () => {
    localStorage.setItem('i18nextLng', 'en');
    setZaloEnv({ zaloLanguage: 'vi', zaloTheme: 'light' });
    initZaloBootstrap();
    expect(localStorage.getItem('i18nextLng')).toBe('en');
  });
});

// ─── 3.6 Seeds theme-preference from zaloTheme ────────────────────────────────

describe('seeds theme-preference from zaloTheme when key absent', () => {
  it('writes dark Zustand persist JSON when zaloTheme is dark', () => {
    setZaloEnv({ zaloLanguage: 'vi', zaloTheme: 'dark' });
    initZaloBootstrap();
    const stored = localStorage.getItem('theme-preference');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual({ state: { preference: 'dark' }, version: 0 });
  });

  it('writes light Zustand persist JSON when zaloTheme is light', () => {
    setZaloEnv({ zaloLanguage: 'vi', zaloTheme: 'light' });
    initZaloBootstrap();
    const stored = localStorage.getItem('theme-preference');
    expect(JSON.parse(stored!)).toEqual({ state: { preference: 'light' }, version: 0 });
  });
});

// ─── 3.7 Unknown zaloTheme maps to system ────────────────────────────────────

describe('maps unknown zaloTheme to system', () => {
  it('writes system when zaloTheme is classic', () => {
    setZaloEnv({ zaloLanguage: 'vi', zaloTheme: 'classic' });
    initZaloBootstrap();
    const stored = localStorage.getItem('theme-preference');
    expect(JSON.parse(stored!)).toEqual({ state: { preference: 'system' }, version: 0 });
  });

  it('writes system when zaloTheme is empty string', () => {
    setZaloEnv({ zaloLanguage: 'vi', zaloTheme: '' });
    initZaloBootstrap();
    const stored = localStorage.getItem('theme-preference');
    expect(JSON.parse(stored!)).toEqual({ state: { preference: 'system' }, version: 0 });
  });
});

// ─── 3.8 Does not overwrite existing theme-preference ────────────────────────

describe('does not overwrite existing theme-preference', () => {
  it('preserves stored light when zaloTheme is dark', () => {
    const existing = JSON.stringify({ state: { preference: 'light' }, version: 0 });
    localStorage.setItem('theme-preference', existing);
    setZaloEnv({ zaloLanguage: 'vi', zaloTheme: 'dark' });
    initZaloBootstrap();
    const stored = localStorage.getItem('theme-preference');
    expect(JSON.parse(stored!)).toEqual({ state: { preference: 'light' }, version: 0 });
  });
});
