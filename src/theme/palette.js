/**
 * Squadra marka paleti — açık / koyu
 * Accent: electric green · Pitch: deep forest · Ink: charcoal
 */

const shared = {
  accent: '#22C55E',
  accentBright: '#16A34A',
  accentSoft: 'rgba(34, 197, 94, 0.16)',
  accentGlow: 'rgba(34, 197, 94, 0.45)',
  jerseyBronze: '#16A34A',
  jerseyBronzeLight: '#D9F99D',
  jerseyBronzeDark: '#14532D',
  jerseyGk: '#84CC16',
  jerseyGkLight: '#14532D',
  pitch: '#166534',
  pitchDeep: '#0F3D24',
  pitchLine: 'rgba(248, 250, 252, 0.72)',
  neon: '#84CC16',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  forest: '#166534',
  emerald: '#16A34A',
  lime: '#84CC16',
  limeSoft: '#D9F99D',
  charcoal: '#1F2937',
  onAccent: '#FFFFFF',
};

export const lightColors = {
  ...shared,
  mode: 'light',
  bg: '#F4F7F5',
  bgElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSoft: '#E8F8EE',
  surfaceSelected: '#CFF5DC',
  border: '#C5E6D1',
  text: '#0B1220',
  textMuted: '#4B5563',
  textDim: '#6B7280',
  /** Koyu chip / saha rozeti üzeri yazı */
  onDark: '#F8FAFC',
  onDarkMuted: 'rgba(248, 250, 252, 0.78)',
  chipDark: 'rgba(8, 16, 12, 0.88)',
  nav: '#0F3D24',
  navBorder: 'rgba(217, 249, 157, 0.22)',
  navText: 'rgba(248, 250, 252, 0.58)',
  navTextActive: '#D9F99D',
  line: '#F8FAFC',
  overlay: 'rgba(11, 18, 32, 0.55)',
  cardShadow: 'rgba(15, 61, 36, 0.12)',
};

export const darkColors = {
  ...shared,
  mode: 'dark',
  accentBright: '#4ADE80',
  accentSoft: 'rgba(34, 197, 94, 0.22)',
  bg: '#0B1220',
  bgElevated: '#121A2A',
  surface: '#152033',
  surfaceSoft: '#163024',
  surfaceSelected: '#1A3D2C',
  border: '#243247',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  textDim: '#9CA3AF',
  onDark: '#F8FAFC',
  onDarkMuted: 'rgba(248, 250, 252, 0.78)',
  chipDark: 'rgba(8, 16, 12, 0.88)',
  nav: '#071018',
  navBorder: 'rgba(34, 197, 94, 0.28)',
  navText: 'rgba(243, 244, 246, 0.5)',
  navTextActive: '#86EFAC',
  pitch: '#14532D',
  pitchDeep: '#0A2E1A',
  pitchLine: 'rgba(248, 250, 252, 0.55)',
  line: '#E5E7EB',
  overlay: 'rgba(0, 0, 0, 0.62)',
  cardShadow: 'rgba(0, 0, 0, 0.35)',
  limeSoft: '#86EFAC',
};

/** Geriye uyumluluk: varsayılan açık tema */
export const colors = lightColors;

export function getColors(mode) {
  return mode === 'dark' ? darkColors : lightColors;
}

export const spacing = {
  navHeight: 64,
  navBottom: 6,
  screenPad: 16,
};

export const motion = {
  tabMs: 280,
  spring: { friction: 7, tension: 92 },
  softSpring: { friction: 9, tension: 70 },
};

export const navReserve = spacing.navHeight + spacing.navBottom;
