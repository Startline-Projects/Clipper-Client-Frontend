module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Semantic colors — switch via CSS vars in global.css
        ink:               'var(--color-ink)',
        bg:                'var(--color-bg)',
        bgWarm:            'var(--color-bg-warm)',
        bgHover:           'var(--color-bg-hover)',
        bgMuted:           'var(--color-bg-muted)',
        surface:           'var(--color-surface)',
        card:              'var(--color-card)',
        primary:           'var(--color-primary)',
        secondary:         'var(--color-secondary)',
        tertiary:          'var(--color-tertiary)',
        quaternary:        'var(--color-quaternary)',
        separator:         'var(--color-separator)',
        'separator-opaque':'var(--color-separator-opaque)',

        // Brand (blue)
        brand:             'var(--color-brand)',
        brandLight:        'var(--color-brand-light)',
        brandPale:         'var(--color-brand-pale)',
        brandAccent:       'var(--color-brand-accent)',

        // Tier indicators
        regular:           'var(--color-brand)',
        recurring:         '#C47F17',
        recurringPale:     '#FDF3E0',
        recurringBg:       '#FFF8ED',
        afterHours:        '#6C5CE7',
        afterHoursPale:    '#F0EDFF',
        dayOff:            '#E67E22',
        dayOffPale:        '#FFF0E0',

        // Status
        success:           '#2D8653',
        successPale:       '#E6F4EC',
        warning:           '#B8860B',
        warningPale:       '#FFF5DC',
        danger:            '#C0392B',
        dangerPale:        '#FDECEB',

        // Accent colors
        green:  '#30D158',
        red:    '#FF453A',
        orange: '#FF9F0A',
        purple: '#BF5AF2',
        blue:   '#0A84FF',
        yellow: '#FFD60A',
        teal:   '#64D2FF',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px',
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        full: '999px',
      },
    },
  },
};
