/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/views/**/*.ejs",
        "./src/public/**/*.{js,html}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Primary - Soft Gold (Heritage brand)
                gold: {
                    50:  '#FBF7E8',
                    100: '#F5EBC4',
                    200: '#EDD68E',
                    300: '#E2BC52',
                    400: '#CEA224',
                    500: '#B8960C', // Soft Gold — primary
                    600: '#9A7D09',
                    700: '#7C6507',
                    800: '#634F05',
                    900: '#4A3B04',
                },
                // Secondary - Heritage Navy
                navy: {
                    50:  '#F0F4FA',
                    100: '#D6E0EF',
                    200: '#ADBFD8',
                    300: '#7B9BBF',
                    400: '#4A74A0',
                    500: '#0D2545', // Heritage Navy — primary
                    600: '#152D50',
                    700: '#0F2240',
                    800: '#091C38',
                    900: '#061429',
                    950: '#040E1A',
                },
                // Accent Colors
                emerald: {
                    50:  '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                },
                ruby: {
                    50:  '#FEF2F2',
                    100: '#FEE2E2',
                    200: '#FECACA',
                    300: '#FCA5A5',
                    400: '#F87171',
                    500: '#EF4444',
                    600: '#DC2626',
                    700: '#B91C1C',
                    800: '#991B1B',
                    900: '#7F1D1D',
                },
                amber: {
                    50:  '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                    800: '#92400E',
                    900: '#78350F',
                },
            },
            fontFamily: {
                display: ['"Playfair Display"', 'serif'],
                body:    ['Inter', 'sans-serif'],
                mono:    ['"JetBrains Mono"', 'monospace'],
            },
            fontSize: {
                xs:   ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',  { lineHeight: '1.5' }],
                sm:   ['clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',   { lineHeight: '1.5' }],
                base: ['clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',    { lineHeight: '1.6' }],
                lg:   ['clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',{ lineHeight: '1.6' }],
                xl:   ['clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',    { lineHeight: '1.4' }],
                '2xl':['clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)', { lineHeight: '1.3' }],
                '3xl':['clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)',{ lineHeight: '1.2' }],
                '4xl':['clamp(2.25rem, 1.95rem + 1.5vw, 3rem)',      { lineHeight: '1.1' }],
            },
            spacing: {
                '18':  '4.5rem',
                '88':  '22rem',
                '128': '32rem',
            },
            boxShadow: {
                'luxury':       '0 10px 40px rgba(184, 150, 12, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
                'luxury-lg':    '0 20px 60px rgba(184, 150, 12, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15)',
                'inner-luxury': 'inset 0 2px 8px rgba(184, 150, 12, 0.1)',
                'navy-glow':    '0 8px 32px rgba(13, 37, 69, 0.25)',
            },
            backgroundImage: {
                'gradient-luxury': 'linear-gradient(135deg, #B8960C 0%, #9A7D09 100%)',
                'gradient-navy':   'linear-gradient(135deg, #0D2545 0%, #091C38 100%)',
                'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
            },
            animation: {
                'fade-in':    'fadeIn 0.3s ease-in-out',
                'slide-up':   'slideUp 0.4s ease-out',
                'slide-down': 'slideDown 0.4s ease-out',
                'scale-in':   'scaleIn 0.2s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideUp:  { '0%': { transform: 'translateY(10px)',  opacity: '0' }, '100%': { transform: 'translateY(0)',  opacity: '1' } },
                slideDown:{ '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)',  opacity: '1' } },
                scaleIn:  { '0%': { transform: 'scale(0.95)',       opacity: '0' }, '100%': { transform: 'scale(1)',       opacity: '1' } },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
}
