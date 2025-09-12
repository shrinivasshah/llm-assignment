/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ffffff', // Pure white
          100: '#fefefe', // Almost white
          200: '#fdfdfd', // Very light gray-white
          300: '#fbfbfb', // Light gray-white
          400: '#f8f8f8', // Lighter gray
          500: '#ffffff', // Main white (default)
          600: '#f5f5f5', // Light gray
          700: '#eeeeee', // Medium light gray
          800: '#e0e0e0', // Medium gray
          900: '#d4d4d4', // Darker gray
        },
        secondary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb', // Your specified gray
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          500: '#6b7280',
          900: '#111827',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },

      // Typography - Now with 10px base
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['1.2rem', { lineHeight: '1.6rem' }],
        sm: ['1.4rem', { lineHeight: '2rem' }],
        base: ['1.6rem', { lineHeight: '2.4rem' }],
        lg: ['1.8rem', { lineHeight: '2.8rem' }],
        xl: ['2rem', { lineHeight: '2.8rem' }],
        '2xl': ['2.4rem', { lineHeight: '3.2rem' }],
        '3xl': ['3rem', { lineHeight: '3.6rem' }],
        '4xl': ['3.6rem', { lineHeight: '4rem' }],
        '5xl': ['4.8rem', { lineHeight: '1' }],
        '6xl': ['6rem', { lineHeight: '1' }],
      },

      // Spacing - Now in 10px increments
      spacing: {
        0.5: '0.5rem', // 5px
        1: '1rem', // 10px
        1.5: '1.5rem', // 15px
        2: '2rem', // 20px
        2.5: '2.5rem', // 25px
        3: '3rem', // 30px
        3.5: '3.5rem', // 35px
        4: '4rem', // 40px
        5: '5rem', // 50px
        6: '6rem', // 60px
        7: '7rem', // 70px
        8: '8rem', // 80px
        9: '9rem', // 90px
        10: '10rem', // 100px
        11: '11rem', // 110px
        12: '12rem', // 120px
        14: '14rem', // 140px
        16: '16rem', // 160px
        18: '18rem', // 180px
        20: '20rem', // 200px
        24: '24rem', // 240px
        28: '28rem', // 280px
        32: '32rem', // 320px
        36: '36rem', // 360px
        40: '40rem', // 400px
        44: '44rem', // 440px
        48: '48rem', // 480px
        52: '52rem', // 520px
        56: '56rem', // 560px
        60: '60rem', // 600px
        64: '64rem', // 640px
        72: '72rem', // 720px
        80: '80rem', // 800px
        96: '96rem', // 960px
      },

      // Border radius
      borderRadius: {
        none: '0',
        sm: '0.2rem', // 2px
        base: '0.4rem', // 4px
        md: '0.6rem', // 6px
        lg: '0.8rem', // 8px
        xl: '1.2rem', // 12px
        '2xl': '1.6rem', // 16px
        '3xl': '2.4rem', // 24px
        full: '9999px',
      },

      // Background Images
      backgroundImage: {
        'primary-gradient': 'radial-gradient(circle, #1D4ED8, #7C3AED)',
      },

      // Shadows
      boxShadow: {
        soft: '0 0.2rem 0.4rem 0 rgba(0, 0, 0, 0.05)',
        medium: '0 0.4rem 0.6rem -0.1rem rgba(0, 0, 0, 0.1)',
        hard: '0 1rem 1.5rem -0.3rem rgba(0, 0, 0, 0.1)',
      },

      // Animation
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(1rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
