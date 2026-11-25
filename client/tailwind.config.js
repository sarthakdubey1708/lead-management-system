/** @type {import('tailwindcss').Config} */
// Single source of truth for design tokens. Values mirror DESIGN.md (v1.0).
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
          50: '#E3F1F1', // subtle tint: active nav, selected states
          600: '#0E5A5F', // primary actions, links, focus ring, charts
          700: '#0A4A4E', // primary hover / pressed
        },
        ink: {
          800: '#1F2D3A', // secondary: headings, tooltip background
        },
        canvas: '#F6F5F1', // app background
        surface: {
          DEFAULT: '#FFFFFF', // cards, table, modals, inputs
          muted: '#F0EEE8', // table header
          hover: '#FAF9F6', // table row hover
        },
        line: {
          DEFAULT: '#E4E2DA', // dividers, card borders (decorative)
          strong: '#CFCCC1', // emphasized dividers, hover borders (decorative)
          input: '#8C8A80', // input/select boundaries (3.46:1 on white)
        },
        fg: {
          DEFAULT: '#1A2430', // primary text
          2: '#4B5663', // secondary text, table headers
          3: '#5F6875', // muted: captions, placeholders (still >= 4.5:1)
        },
        success: { DEFAULT: '#166534', bg: '#E3F4E8' },
        warning: { DEFAULT: '#92400E', bg: '#FEF3C7' },
        error: { DEFAULT: '#B42318', bg: '#FDECEA' },
        info: { DEFAULT: '#1D4ED8', bg: '#E8EEFB' },
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
        h2: ['1.125rem', { lineHeight: '1.625rem', fontWeight: '600' }], // 18/26
        h1: ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }], // 24/32
        kpi: ['2rem', { lineHeight: '2.25rem', fontWeight: '600' }], // 32/36
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
        content: '75rem', // 1200px page content
        modal: '32.5rem', // 520px
      },
      minHeight: {
        control: '2.5rem', // 40px desktop controls
        touch: '2.75rem', // 44px mobile controls and tap targets
      },
      borderRadius: {
        control: '6px', // buttons, inputs
        card: '8px', // cards, table container, menus
        modal: '12px',
      },
      boxShadow: {
        // Borders do the work; shadows only for floating layers.
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
