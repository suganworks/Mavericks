/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', 'monospace'],
        'sans': ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        code: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', 'monospace']
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        bold: 700
      },
       fontSize: {
        sm: "0.875rem", // small text
        base: "1rem", // normal
        lg: "1.125rem", // large
        xl: "1.25rem", // heading
        "2xl": "1.5rem" // big headings
      },
      animation: {
        'liquid-float': 'liquid-float 6s ease-in-out infinite',
        'glass-shimmer': 'glass-shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        liquidFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' }
        },
        glassShimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 255, 255, 0.2)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }
        }
      },
      colors: {
        glass: {
          primary: 'rgba(255, 255, 255, 0.08)',
          secondary: 'rgba(255, 255, 255, 0.05)',
          accent: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.1)',
          borderHover: 'rgba(255, 255, 255, 0.2)',
          text: 'rgba(255, 255, 255, 0.95)',
          textSecondary: 'rgba(255, 255, 255, 0.7)',
          shadow: 'rgba(0, 0, 0, 0.3)',
          shadowHover: 'rgba(0, 0, 0, 0.4)'
        },
        liquid: {
          blue: '#60a5fa',
          purple: '#a78bfa',
          pink: '#f472b6',
          green: '#34d399',
          yellow: '#fbbf24',
          red: '#f87171',
          cyan: '#22d3ee',
          orange: '#fb923c'
        }
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px'
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.4)',
        'glass-accent': '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)',
        'glow': '0 0 20px rgba(255, 255, 255, 0.1)',
        'glow-hover': '0 0 40px rgba(255, 255, 255, 0.2)',
        'inner-glass': 'inset 0 2px 4px rgba(255, 255, 255, 0.1)'
      },
      borderRadius: {
        'glass': '16px',
        'glass-lg': '20px',
        'glass-xl': '24px'
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'glass-shimmer': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
        'liquid-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'cosmic-gradient': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      zIndex: {
        'glass': '10',
        'glass-hover': '20',
        'modal': '50',
        'tooltip': '60'
      }
    },
  },
  plugins: [
    function({ addUtilities, theme }) {
      const glassUtilities = {
        '.glass-primary': {
          background: theme('colors.glass.primary'),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme('colors.glass.border')}`,
          boxShadow: theme('boxShadow.glass'),
          borderRadius: theme('borderRadius.glass'),
        },
        '.glass-secondary': {
          background: theme('colors.glass.secondary'),
          backdropFilter: 'blur(15px)',
          border: `1px solid ${theme('colors.glass.border')}`,
          boxShadow: theme('boxShadow.glass'),
          borderRadius: theme('borderRadius.glass'),
        },
        '.glass-accent': {
          background: theme('colors.glass.accent'),
          backdropFilter: 'blur(25px)',
          border: `1px solid ${theme('colors.glass.borderHover')}`,
          boxShadow: theme('boxShadow.glass-accent'),
          borderRadius: theme('borderRadius.glass'),
        },
        '.glass-button': {
          background: theme('backgroundImage.glass-gradient'),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme('colors.glass.borderHover')}`,
          boxShadow: theme('boxShadow.glass'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        },
        '.glass-select': {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme('colors.glass.borderHover')}`,
          borderRadius: theme('borderRadius.md'),
          color: theme('colors.white'),
          transition: 'all 0.3s ease',
        },
        '.glass-text': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        },
        '.liquid-border': {
          background: theme('backgroundImage.glass-shimmer'),
          backgroundSize: '200% 100%',
          animation: 'glass-shimmer 2s infinite',
        }
      }
      addUtilities(glassUtilities)
    }
  ],
  plugins:[]
};
