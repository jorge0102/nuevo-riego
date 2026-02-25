// Colores que mapean directamente al tailwind config del proyecto web
export const Colors = {
  primary: '#137fec',
  primaryDark: '#0d5fb0',
  secondary: '#22c55e',
  success: '#16a34a',

  backgroundLight: '#f0f4f8',
  backgroundDark: '#0f172a',

  surfaceLight: '#ffffff',
  surfaceDark: '#1e293b',

  cardLight: '#ffffff',
  cardDark: '#1e293b',

  textLight: '#101922',
  textDark: '#e2e8f0',

  inactiveLight: '#e2e8f0',
  inactiveDark: '#334155',

  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray700: '#374151',
  gray800: '#1f2937',

  green400: '#4ade80',
  green600: '#16a34a',
  yellow600: '#ca8a04',
  yellow400: '#facc15',
  red600: '#dc2626',
  red400: '#f87171',

  white: '#ffffff',
};

export type ColorScheme = 'light' | 'dark';

export const getThemeColors = (scheme: ColorScheme) => ({
  background: scheme === 'dark' ? Colors.backgroundDark : Colors.backgroundLight,
  surface: scheme === 'dark' ? Colors.surfaceDark : Colors.surfaceLight,
  card: scheme === 'dark' ? Colors.cardDark : Colors.cardLight,
  text: scheme === 'dark' ? Colors.textDark : Colors.textLight,
  textMuted: scheme === 'dark' ? Colors.gray400 : Colors.gray500,
  inactive: scheme === 'dark' ? Colors.inactiveDark : Colors.inactiveLight,
  border: scheme === 'dark' ? Colors.gray700 : Colors.gray200,
});
