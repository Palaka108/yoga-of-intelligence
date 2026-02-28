import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sacred: {
          black: '#0a0a0f',
          deep: '#0d0d1a',
          indigo: '#1a1a3e',
          gold: '#c9a84c',
          'gold-light': '#e8d48b',
          'gold-dim': '#8b7230',
          neon: '#00d4ff',
          'neon-dim': '#0088aa',
          violet: '#7c3aed',
          'violet-dim': '#4c1d95',
          ember: '#f59e0b',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.05)',
          'white-10': 'rgba(255, 255, 255, 0.10)',
          'white-20': 'rgba(255, 255, 255, 0.20)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-light': 'rgba(255, 255, 255, 0.15)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-sacred': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a3e 50%, #0d0d1a 100%)',
        'gradient-gold': 'linear-gradient(135deg, #c9a84c 0%, #e8d48b 50%, #8b7230 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(201, 168, 76, 0.2), 0 0 20px rgba(201, 168, 76, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(201, 168, 76, 0.4), 0 0 60px rgba(201, 168, 76, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
