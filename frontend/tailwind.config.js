/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        line: 'var(--border)',
        ink: 'var(--ink)',
        muted: 'var(--ink-muted)',
        primary: 'var(--primary)',
        'primary-soft': 'var(--primary-soft)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['Geist Variable', 'Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['13px', '18px'],
        base: ['14px', '20px'],
        md: ['16px', '24px'],
        lg: ['20px', '28px'],
        xl: ['24px', '32px'],
        '2xl': ['32px', '40px'],
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        overlay: 'var(--shadow-overlay)',
      },
      letterSpacing: {
        heading: '-0.01em',
      },
      maxWidth: {
        page: '1280px',
      },
    },
  },
  plugins: [],
};
