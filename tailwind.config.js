/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        panel: 'rgb(var(--c-panel) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        card: 'rgb(var(--c-card) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        ghost: 'rgb(var(--c-ghost) / <alpha-value>)',
        heading: 'rgb(var(--c-heading) / <alpha-value>)',
        onAccent: 'rgb(var(--c-on-accent) / <alpha-value>)',

        signal: {
          DEFAULT: 'rgb(var(--c-signal) / <alpha-value>)',
        },

        status: {
          online: 'rgb(var(--c-status-online) / <alpha-value>)',
          offline: 'rgb(var(--c-status-offline) / <alpha-value>)',
          critical: 'rgb(var(--c-status-critical) / <alpha-value>)',
          neutral: 'rgb(var(--c-status-neutral) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px -4px rgb(var(--c-signal) / var(--glow-o1, 0))',
        'glow-sm': '0 0 12px -2px rgb(var(--c-signal) / var(--glow-o2, 0))',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgb(var(--c-signal) / var(--grid-o, 0)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--c-signal) / var(--grid-o, 0)) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
    },
  },
  plugins: [],
};
