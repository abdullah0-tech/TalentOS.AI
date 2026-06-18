/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Theme Tokens
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        accent: 'var(--accent)',

        // Mapped variables for backward compatibility
        'on-surface': 'var(--foreground)',
        'on-surface-variant': 'var(--on-surface-variant)',
        outline: 'var(--border)',
        surface: 'var(--card)',
        'surface-container': 'var(--card)',
        'surface-high': 'var(--surface-high)',
        'surface-highest': 'var(--surface-highest)',
        'primary-light': 'var(--primary-light)',
        error: 'var(--danger)',
        info: 'var(--primary)',


      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Geist', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.15s ease-out forwards',
      }
    },
  },
  plugins: [],
}
