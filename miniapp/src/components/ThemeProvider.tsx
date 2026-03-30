import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const preference = useThemeStore((s) => s.preference);

  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      document.documentElement.classList.toggle('dark', isDark);
      document.body.setAttribute('zaui-theme', isDark ? 'dark' : 'light');
    };

    if (preference === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mql.matches);
      const handler = (e: { matches: boolean }) => applyTheme(e.matches);
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }

    applyTheme(preference === 'dark');
  }, [preference]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
