module.exports = {
  darkMode: 'class',
  purge: {
    enabled: true,
    content: ['./src/**/*.{js,jsx,ts,tsx,vue}'],
  },
  theme: {
    extend: {
      fontFamily: {
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          fg: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f4f4f5',
          overlay: '#e4e4e7',
          dark: '#18181b',
          'dark-muted': '#27272a',
          'dark-overlay': '#3f3f46',
        },
        border: {
          DEFAULT: '#d4d4d8',
          strong: '#a1a1aa',
          dark: '#3f3f46',
          'dark-strong': '#71717a',
        },
        content: {
          DEFAULT: '#18181b',
          muted: '#71717a',
          subtle: '#a1a1aa',
          inverse: '#ffffff',
          dark: '#f4f4f5',
          'dark-muted': '#a1a1aa',
          'dark-subtle': '#71717a',
        },
        destructive: {
          DEFAULT: '#ef4444',
          fg: '#ffffff',
        },
        success: {
          DEFAULT: '#22c55e',
          fg: '#ffffff',
        },
      },
    },
  },
};
