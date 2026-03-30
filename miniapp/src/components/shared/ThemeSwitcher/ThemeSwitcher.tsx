import { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon/Icon';
import { useThemeStore, type ThemePreference } from '@/store/useThemeStore';

const THEMES: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'light', label: 'Sáng', icon: 'sun' },
  { value: 'system', label: 'Hệ thống', icon: 'display' },
  { value: 'dark', label: 'Tối', icon: 'moon' },
];

export function ThemeSwitcher() {
  const preference = useThemeStore((s) => s.preference);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* v8 ignore next */
  const activeTheme = THEMES.find((t) => t.value === preference) ?? THEMES[1];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 p-2 rounded-md text-content-muted hover:text-content hover:bg-surface-muted transition-colors dark:text-content-dark-muted dark:hover:text-content-dark dark:hover:bg-surface-dark-muted"
        aria-label="Change theme"
        type="button"
      >
        <Icon name={activeTheme.icon} variant="regular" size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-md border border-border bg-surface shadow-md z-50 dark:bg-surface-dark dark:border-border-dark">
          {THEMES.map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => {
                setTheme(theme.value);
                setOpen(false);
              }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-surface-muted transition-colors flex items-center gap-2 dark:hover:bg-surface-dark-muted',
                preference === theme.value
                  ? 'text-primary font-medium'
                  : 'text-content dark:text-content-dark',
              )}
            >
              <Icon name={theme.icon} variant="regular" size={14} />
              {theme.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
