import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { useThemeStore } from '@/store/useThemeStore';

let darkMatches = false;
let changeHandler: ((e: { matches: boolean }) => void) | null = null;
const mockRemoveEventListener = vi.fn();

const mockMediaQueryList = () => ({
  get matches() {
    return darkMatches;
  },
  addEventListener: vi.fn((_event: string, handler: (e: { matches: boolean }) => void) => {
    changeHandler = handler;
  }),
  removeEventListener: mockRemoveEventListener,
});

beforeEach(() => {
  darkMatches = false;
  changeHandler = null;
  mockRemoveEventListener.mockClear();
  document.documentElement.classList.remove('dark');
  document.body.removeAttribute('zaui-theme');
  localStorage.removeItem('theme-preference');
  useThemeStore.setState({ preference: 'system' });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(mockMediaQueryList),
  });
});

describe('ThemeProvider — light preference', () => {
  it('adds no dark class to html and sets zaui-theme to light', () => {
    useThemeStore.setState({ preference: 'light' });
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.body.getAttribute('zaui-theme')).toBe('light');
  });
});

describe('ThemeProvider — dark preference', () => {
  it('adds dark class to html and sets zaui-theme to dark', () => {
    useThemeStore.setState({ preference: 'dark' });
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.body.getAttribute('zaui-theme')).toBe('dark');
  });
});

describe('ThemeProvider — system preference', () => {
  it('follows OS dark when matchMedia matches', () => {
    darkMatches = true;
    useThemeStore.setState({ preference: 'system' });
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.body.getAttribute('zaui-theme')).toBe('dark');
  });

  it('follows OS light when matchMedia does not match', () => {
    darkMatches = false;
    useThemeStore.setState({ preference: 'system' });
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.body.getAttribute('zaui-theme')).toBe('light');
  });

  it('updates DOM when OS scheme changes to dark', () => {
    darkMatches = false;
    useThemeStore.setState({ preference: 'system' });
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    darkMatches = true;
    changeHandler!({ matches: true });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.body.getAttribute('zaui-theme')).toBe('dark');
  });

  it('removes matchMedia listener on unmount', () => {
    useThemeStore.setState({ preference: 'system' });
    const { unmount } = render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });

  it('never sets zaui-theme to system', () => {
    useThemeStore.setState({ preference: 'system' });
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    expect(document.body.getAttribute('zaui-theme')).not.toBe('system');
  });
});

describe('ThemeProvider — renders children', () => {
  it('renders children without a wrapper element', () => {
    useThemeStore.setState({ preference: 'light' });
    const { container } = render(
      <ThemeProvider>
        <span data-testid="child">hello</span>
      </ThemeProvider>,
    );
    // ThemeProvider renders a Fragment — container's first child is the span directly
    expect(container.firstChild).not.toBeNull();
    expect((container.firstChild as HTMLElement).tagName).toBe('SPAN');
  });
});
