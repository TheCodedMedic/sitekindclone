/**
 * Sitekind brand tokens — synced from artifacts/sitekind/src/styles.css
 * "Fresh Paint" design system: warm, light-first, Main Street not Silicon Valley.
 */

const colors = {
  light: {
    // Legacy aliases
    text: '#2a2118',
    tint: '#c2410c',

    // Core surfaces
    background: '#fffbf5', // warm cream
    foreground: '#2a2118', // warm espresso ink

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#2a2118',

    // Primary — clementine
    primary: '#c2410c',
    primaryForeground: '#ffffff',
    primaryHover: '#9a3412',

    // Secondary surface — peach tint
    secondary: '#fdf3e7',
    secondaryForeground: '#2a2118',

    // Muted
    muted: '#fdf3e7',
    mutedForeground: '#6b5d4f',

    // Accent — deep teal
    accent: '#0f766e',
    accentForeground: '#ffffff',

    // Warning — sunshine amber
    warning: '#f59e0b',

    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    border: '#f0e4d4',
    input: '#f0e4d4',

    // Industry tint family
    blush: '#fbe7e0',
    sky: '#e3f1f5',
    mint: '#e4f2e8',
  },
  dark: {
    text: '#f7f1e8',
    tint: '#fdba74',

    background: '#1c1712', // espresso
    foreground: '#f7f1e8',

    card: '#28211a',
    cardForeground: '#f7f1e8',

    primary: '#c2410c',
    primaryForeground: '#ffffff',
    primaryHover: '#9a3412',

    secondary: '#322a22',
    secondaryForeground: '#f7f1e8',

    muted: '#322a22',
    mutedForeground: '#c4b5a4',

    accent: '#0f766e',
    accentForeground: '#ffffff',

    warning: '#f59e0b',

    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    border: '#3a3128',
    input: '#3a3128',

    blush: '#3a2a24',
    sky: '#22303a',
    mint: '#243228',
  },

  // Matches web --radius-btn: 14px (cards use 20 via radiusCard below)
  radius: 14,
  radiusCard: 20,
};

export default colors;
