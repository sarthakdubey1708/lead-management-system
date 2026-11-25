/** @type {import('tailwindcss').Config} */
// Design tokens mirror DESIGN.md.
// Do not hardcode hex values or arbitrary px sizes in components; use these tokens.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Mobile-first. Only two breakpoints are used: md (tablet) and lg (desktop).
    screens: {
      md: '768px',
      lg: '1024px',
    },
    extend: {
      colors: {
        brand: {
          50: '#E4F5F1',
          200: '#A5ECDD',
          400: '#58C9B9',
          600: '#0C6566',
          700: '#094F53',
          800: '#103E4B',
        },
        navy: {
          100: '#E1E8F6',
          200: '#C1CEE5',
          800: '#263653',
          850: '#1D2A47',
          900: '#17213A',
          950: '#10182C',
        },
        ink: { 800: '#142038' },
        canvas: '#F2F4F9',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#EAF0F8',
          hover: '#F6F8FC',
        },
        line: {
          DEFAULT: '#DDE4EF',
          strong: '#C7D2E2',
          input: '#808DA2',
        },
        fg: {
          DEFAULT: '#1C2841',
          2: '#45536B',
          3: '#566580',
        },
        success: { DEFAULT: '#166534', bg: '#E3F4E8' },
        warning: { DEFAULT: '#92400E', bg: '#FEF3C7' },
        error: { DEFAULT: '#B42318', bg: '#FDECEA' },
        info: { DEFAULT: '#1D4ED8', bg: '#E8EEFB' },
        accent: {
          indigo: '#5252A3',
          'indigo-bg': '#E6E5FB',
          blue: '#2369A7',
          'blue-bg': '#DFEBFD',
          violet: '#7842AE',
          emerald: '#17634A',
          'emerald-deep': '#103F36',
          'emerald-bg': '#CFF1E3',
          amber: '#94600D',
          'amber-bg': '#FAEDD2',
          coral: '#B74551',
        },
        // Lead statuses. Used ONLY for status. fg = label, bg = badge fill, dot = graphic/chart fill.
        status: {
          new: { fg: '#1D4ED8', bg: '#E8EEFB', dot: '#3B6FE0' },
          contacted: { fg: '#8A5A00', bg: '#FBF1D9', dot: '#B97A00' },
          interested: { fg: '#6D3FC0', bg: '#F0EAFB', dot: '#8B5CD6' },
          converted: { fg: '#166534', bg: '#E3F4E8', dot: '#2E9F57' },
          lost: { fg: '#9F1239', bg: '#FCE8EC', dot: '#D1435F' },
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      // [size, { lineHeight, fontWeight }]
      fontSize: {
        caption: ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }], // 12/16
        badge: ['0.8125rem', { lineHeight: '1rem', fontWeight: '500' }], // 13/16
        body: ['0.875rem', { lineHeight: '1.375rem', fontWeight: '400' }], // 14/22
        'body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 16/24 (mobile inputs)
        h3: ['0.9375rem', { lineHeight: '1.375rem', fontWeight: '600' }], // 15/22
        h2: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 20/28
        h1: ['1.75rem', { lineHeight: '2.125rem', fontWeight: '600' }], // 28/34
        'h1-wide': ['2.25rem', { lineHeight: '2.625rem', fontWeight: '600' }], // 36/42
        display: ['clamp(2.5rem, 4.25vw, 3.75rem)', { lineHeight: '1.04', fontWeight: '600' }],
        kpi: ['2.125rem', { lineHeight: '2.25rem', fontWeight: '600' }], // 34/36
        'kpi-wide': ['2.75rem', { lineHeight: '2.75rem', fontWeight: '600' }], // 44/44
      },
      // Tailwind's default 4px spacing scale stays. ALLOWED steps: 1,2,3,4,5,6,8,12 (4,8,12,16,20,24,32,48px)
      // plus the layout sizes below and the safe-area insets.
      spacing: {
        'safe-t': 'env(safe-area-inset-top, 0px)',
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
        sidebar: '14.5rem', // 232px
        rail: '4rem', // 64px
        topbar: '3.5rem', // 56px
        'bottom-nav': '3.5rem', // 56px (excludes safe-area inset)
      },
      maxWidth: {
        content: '104rem', // 1664px page content
        login: '27rem', // 432px sign-in form
        modal: '32.5rem', // 520px
      },
      minHeight: {
        control: '2.5rem', // 40px desktop controls
        touch: '2.75rem', // 44px mobile controls and tap targets
      },
      borderRadius: {
        control: '8px',
        card: '14px',
        modal: '16px',
        hero: '20px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 44, .045), 0 6px 16px rgba(16, 24, 44, .035)',
        control: '0 1px 2px rgba(26, 36, 48, .16)',
        pop: '0 8px 24px rgba(26, 36, 48, 0.12)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '160ms',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)', // entering
        in: 'cubic-bezier(0.55, 0, 1, 0.45)', // leaving
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'modal-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-in': {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 120ms cubic-bezier(0.23, 1, 0.32, 1)',
        'modal-in': 'modal-in 160ms cubic-bezier(0.23, 1, 0.32, 1)',
        'sheet-in': 'sheet-in 160ms cubic-bezier(0.23, 1, 0.32, 1)',
        'toast-in': 'toast-in 160ms cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
};
