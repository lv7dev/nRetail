import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.removeItem('theme-preference');
    useThemeStore.setState({ preference: 'system' });
  });

  it('has system as the default preference', () => {
    const { preference } = useThemeStore.getState();
    expect(preference).toBe('system');
  });

  it('setTheme updates preference to light', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().preference).toBe('light');
  });

  it('setTheme updates preference to dark', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().preference).toBe('dark');
  });

  it('setTheme updates preference to system', () => {
    useThemeStore.getState().setTheme('dark');
    useThemeStore.getState().setTheme('system');
    expect(useThemeStore.getState().preference).toBe('system');
  });
});

describe('useThemeStore — Zalo bootstrap pre-seeding', () => {
  it('rehydrates dark when zaloBootstrap has pre-seeded theme-preference', async () => {
    // Simulate what zaloBootstrap writes to localStorage before the store is first accessed
    localStorage.setItem(
      'theme-preference',
      JSON.stringify({ state: { preference: 'dark' }, version: 0 }),
    );

    await useThemeStore.persist.rehydrate();

    expect(useThemeStore.getState().preference).toBe('dark');
  });

  it('rehydrates light when zaloBootstrap has pre-seeded light theme', async () => {
    localStorage.setItem(
      'theme-preference',
      JSON.stringify({ state: { preference: 'light' }, version: 0 }),
    );

    await useThemeStore.persist.rehydrate();

    expect(useThemeStore.getState().preference).toBe('light');
  });
});
