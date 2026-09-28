/** Diziliş slotları — top/left yüzde cinsinden. Anahtar: takım kişi sayısı (5–11). */

export const TEAM_SIZES = [5, 6, 7, 8, 9, 10, 11];

export const FORMATIONS = {
  5: {
    '2-1-1': [
      { id: 1, role: 'GK', top: '86%', left: '42%' },
      { id: 2, role: 'CB_L', top: '62%', left: '22%' },
      { id: 3, role: 'CB_R', top: '62%', left: '62%' },
      { id: 4, role: 'CM', top: '40%', left: '42%' },
      { id: 5, role: 'ST', top: '16%', left: '42%' },
    ],
    '1-2-1': [
      { id: 1, role: 'GK', top: '86%', left: '42%' },
      { id: 2, role: 'CB', top: '64%', left: '42%' },
      { id: 3, role: 'LM', top: '40%', left: '16%' },
      { id: 4, role: 'RM', top: '40%', left: '68%' },
      { id: 5, role: 'ST', top: '16%', left: '42%' },
    ],
  },
  6: {
    '2-2-1': [
      { id: 1, role: 'GK', top: '86%', left: '42%' },
      { id: 2, role: 'CB_L', top: '65%', left: '22%' },
      { id: 3, role: 'CB_R', top: '65%', left: '62%' },
      { id: 4, role: 'CM_L', top: '42%', left: '22%' },
      { id: 5, role: 'CM_R', top: '42%', left: '62%' },
      { id: 6, role: 'ST', top: '16%', left: '42%' },
    ],
    '3-1-1': [
      { id: 1, role: 'GK', top: '86%', left: '42%' },
      { id: 2, role: 'LB', top: '68%', left: '12%' },
      { id: 3, role: 'CB', top: '70%', left: '42%' },
      { id: 4, role: 'RB', top: '68%', left: '72%' },
      { id: 5, role: 'CM', top: '42%', left: '42%' },
      { id: 6, role: 'ST', top: '16%', left: '42%' },
    ],
    '2-1-2': [
      { id: 1, role: 'GK', top: '86%', left: '42%' },
      { id: 2, role: 'CB_L', top: '68%', left: '22%' },
      { id: 3, role: 'CB_R', top: '68%', left: '62%' },
      { id: 4, role: 'CM', top: '45%', left: '42%' },
      { id: 5, role: 'ST_L', top: '16%', left: '25%' },
      { id: 6, role: 'ST_R', top: '16%', left: '60%' },
    ],
  },
  7: {
    '2-3-1': [
      { id: 1, role: 'GK', top: '86%', left: '42%' },
      { id: 2, role: 'CB_L', top: '68%', left: '20%' },
      { id: 3, role: 'CB_R', top: '68%', left: '65%' },
      { id: 4, role: 'LM', top: '42%', left: '12%' },
      { id: 5, role: 'CM', top: '48%', left: '42%' },
      { id: 6, role: 'RM', top: '42%', left: '72%' },
      { id: 7, role: 'ST', top: '16%', left: '42%' },
    ],
    '3-2-1': [
      { id: 1, role: 'GK', top: '86%', left: '42%' },
      { id: 2, role: 'LB', top: '70%', left: '15%' },
      { id: 3, role: 'CB', top: '73%', left: '42%' },
      { id: 4, role: 'RB', top: '70%', left: '70%' },
      { id: 5, role: 'LCM', top: '44%', left: '28%' },
      { id: 6, role: 'RCM', top: '44%', left: '56%' },
      { id: 7, role: 'ST', top: '16%', left: '42%' },
    ],
    '2-2-2': [
      { id: 1, role: 'GK', top: '86%', left: '42%' },
      { id: 2, role: 'CB_L', top: '68%', left: '25%' },
      { id: 3, role: 'CB_R', top: '68%', left: '60%' },
      { id: 4, role: 'CM_L', top: '45%', left: '25%' },
      { id: 5, role: 'CM_R', top: '45%', left: '60%' },
      { id: 6, role: 'ST_L', top: '18%', left: '25%' },
      { id: 7, role: 'ST_R', top: '18%', left: '60%' },
    ],
  },
  8: {
    '3-3-1': [
      { id: 1, role: 'GK', top: '88%', left: '42%' },
      { id: 2, role: 'LB', top: '70%', left: '12%' },
      { id: 3, role: 'CB', top: '72%', left: '42%' },
      { id: 4, role: 'RB', top: '70%', left: '72%' },
      { id: 5, role: 'LM', top: '46%', left: '12%' },
      { id: 6, role: 'CM', top: '48%', left: '42%' },
      { id: 7, role: 'RM', top: '46%', left: '72%' },
      { id: 8, role: 'ST', top: '16%', left: '42%' },
    ],
    '3-2-2': [
      { id: 1, role: 'GK', top: '88%', left: '42%' },
      { id: 2, role: 'LB', top: '70%', left: '12%' },
      { id: 3, role: 'CB', top: '72%', left: '42%' },
      { id: 4, role: 'RB', top: '70%', left: '72%' },
      { id: 5, role: 'CM_L', top: '46%', left: '28%' },
      { id: 6, role: 'CM_R', top: '46%', left: '56%' },
      { id: 7, role: 'ST_L', top: '18%', left: '28%' },
      { id: 8, role: 'ST_R', top: '18%', left: '56%' },
    ],
    '2-3-2': [
      { id: 1, role: 'GK', top: '88%', left: '42%' },
      { id: 2, role: 'CB_L', top: '70%', left: '25%' },
      { id: 3, role: 'CB_R', top: '70%', left: '60%' },
      { id: 4, role: 'LM', top: '46%', left: '12%' },
      { id: 5, role: 'CM', top: '48%', left: '42%' },
      { id: 6, role: 'RM', top: '46%', left: '72%' },
      { id: 7, role: 'ST_L', top: '18%', left: '28%' },
      { id: 8, role: 'ST_R', top: '18%', left: '56%' },
    ],
  },
  9: {
    '3-3-2': [
      { id: 1, role: 'GK', top: '88%', left: '42%' },
      { id: 2, role: 'LB', top: '72%', left: '12%' },
      { id: 3, role: 'CB', top: '74%', left: '42%' },
      { id: 4, role: 'RB', top: '72%', left: '72%' },
      { id: 5, role: 'LM', top: '48%', left: '12%' },
      { id: 6, role: 'CM', top: '50%', left: '42%' },
      { id: 7, role: 'RM', top: '48%', left: '72%' },
      { id: 8, role: 'ST_L', top: '18%', left: '28%' },
      { id: 9, role: 'ST_R', top: '18%', left: '56%' },
    ],
    '3-4-1': [
      { id: 1, role: 'GK', top: '88%', left: '42%' },
      { id: 2, role: 'LB', top: '72%', left: '12%' },
      { id: 3, role: 'CB', top: '74%', left: '42%' },
      { id: 4, role: 'RB', top: '72%', left: '72%' },
      { id: 5, role: 'LM', top: '48%', left: '8%' },
      { id: 6, role: 'LCM', top: '50%', left: '30%' },
      { id: 7, role: 'RCM', top: '50%', left: '54%' },
      { id: 8, role: 'RM', top: '48%', left: '76%' },
      { id: 9, role: 'ST', top: '16%', left: '42%' },
    ],
    '4-3-1': [
      { id: 1, role: 'GK', top: '88%', left: '42%' },
      { id: 2, role: 'LB', top: '70%', left: '8%' },
      { id: 3, role: 'CB_L', top: '74%', left: '30%' },
      { id: 4, role: 'CB_R', top: '74%', left: '54%' },
      { id: 5, role: 'RB', top: '70%', left: '76%' },
      { id: 6, role: 'CM_L', top: '48%', left: '22%' },
      { id: 7, role: 'CM', top: '46%', left: '42%' },
      { id: 8, role: 'CM_R', top: '48%', left: '62%' },
      { id: 9, role: 'ST', top: '16%', left: '42%' },
    ],
  },
  10: {
    '4-3-2': [
      { id: 1, role: 'GK', top: '90%', left: '42%' },
      { id: 2, role: 'LB', top: '72%', left: '8%' },
      { id: 3, role: 'CB_L', top: '76%', left: '30%' },
      { id: 4, role: 'CB_R', top: '76%', left: '54%' },
      { id: 5, role: 'RB', top: '72%', left: '76%' },
      { id: 6, role: 'CM_L', top: '50%', left: '22%' },
      { id: 7, role: 'CM', top: '48%', left: '42%' },
      { id: 8, role: 'CM_R', top: '50%', left: '62%' },
      { id: 9, role: 'ST_L', top: '18%', left: '28%' },
      { id: 10, role: 'ST_R', top: '18%', left: '56%' },
    ],
    '3-4-2': [
      { id: 1, role: 'GK', top: '90%', left: '42%' },
      { id: 2, role: 'LB', top: '72%', left: '12%' },
      { id: 3, role: 'CB', top: '76%', left: '42%' },
      { id: 4, role: 'RB', top: '72%', left: '72%' },
      { id: 5, role: 'LM', top: '50%', left: '8%' },
      { id: 6, role: 'LCM', top: '52%', left: '30%' },
      { id: 7, role: 'RCM', top: '52%', left: '54%' },
      { id: 8, role: 'RM', top: '50%', left: '76%' },
      { id: 9, role: 'ST_L', top: '18%', left: '28%' },
      { id: 10, role: 'ST_R', top: '18%', left: '56%' },
    ],
    '4-4-1': [
      { id: 1, role: 'GK', top: '90%', left: '42%' },
      { id: 2, role: 'LB', top: '72%', left: '8%' },
      { id: 3, role: 'CB_L', top: '76%', left: '30%' },
      { id: 4, role: 'CB_R', top: '76%', left: '54%' },
      { id: 5, role: 'RB', top: '72%', left: '76%' },
      { id: 6, role: 'LM', top: '48%', left: '8%' },
      { id: 7, role: 'LCM', top: '50%', left: '30%' },
      { id: 8, role: 'RCM', top: '50%', left: '54%' },
      { id: 9, role: 'RM', top: '48%', left: '76%' },
      { id: 10, role: 'ST', top: '16%', left: '42%' },
    ],
  },
  11: {
    '4-4-2': [
      { id: 1, role: 'GK', top: '90%', left: '42%' },
      { id: 2, role: 'LB', top: '74%', left: '6%' },
      { id: 3, role: 'CB_L', top: '78%', left: '28%' },
      { id: 4, role: 'CB_R', top: '78%', left: '56%' },
      { id: 5, role: 'RB', top: '74%', left: '78%' },
      { id: 6, role: 'LM', top: '48%', left: '6%' },
      { id: 7, role: 'LCM', top: '50%', left: '30%' },
      { id: 8, role: 'RCM', top: '50%', left: '54%' },
      { id: 9, role: 'RM', top: '48%', left: '78%' },
      { id: 10, role: 'ST_L', top: '16%', left: '28%' },
      { id: 11, role: 'ST_R', top: '16%', left: '56%' },
    ],
    '4-3-3': [
      { id: 1, role: 'GK', top: '90%', left: '42%' },
      { id: 2, role: 'LB', top: '74%', left: '6%' },
      { id: 3, role: 'CB_L', top: '78%', left: '28%' },
      { id: 4, role: 'CB_R', top: '78%', left: '56%' },
      { id: 5, role: 'RB', top: '74%', left: '78%' },
      { id: 6, role: 'CM_L', top: '50%', left: '22%' },
      { id: 7, role: 'CM', top: '48%', left: '42%' },
      { id: 8, role: 'CM_R', top: '50%', left: '62%' },
      { id: 9, role: 'LW', top: '18%', left: '12%' },
      { id: 10, role: 'ST', top: '14%', left: '42%' },
      { id: 11, role: 'RW', top: '18%', left: '72%' },
    ],
    '3-5-2': [
      { id: 1, role: 'GK', top: '90%', left: '42%' },
      { id: 2, role: 'CB_L', top: '76%', left: '18%' },
      { id: 3, role: 'CB', top: '78%', left: '42%' },
      { id: 4, role: 'CB_R', top: '76%', left: '66%' },
      { id: 5, role: 'LWB', top: '52%', left: '4%' },
      { id: 6, role: 'LCM', top: '50%', left: '26%' },
      { id: 7, role: 'CM', top: '48%', left: '42%' },
      { id: 8, role: 'RCM', top: '50%', left: '58%' },
      { id: 9, role: 'RWB', top: '52%', left: '80%' },
      { id: 10, role: 'ST_L', top: '16%', left: '28%' },
      { id: 11, role: 'ST_R', top: '16%', left: '56%' },
    ],
  },
};

export const SAMPLE_PLAYERS = [
  { id: 'p1', name: 'Emre', number: 1, rating: 72, isGoalkeeper: true },
  { id: 'p2', name: 'Can', number: 4, rating: 78, isGoalkeeper: false },
  { id: 'p3', name: 'Burak', number: 5, rating: 75, isGoalkeeper: false },
  { id: 'p4', name: 'Ozan', number: 8, rating: 81, isGoalkeeper: false },
  { id: 'p5', name: 'Mert', number: 6, rating: 74, isGoalkeeper: false },
  { id: 'p6', name: 'Kerem', number: 7, rating: 79, isGoalkeeper: false },
  { id: 'p7', name: 'Yusuf', number: 9, rating: 84, isGoalkeeper: false },
  { id: 'p8', name: 'Ali', number: 10, rating: 77, isGoalkeeper: false },
  { id: 'p9', name: 'Deniz', number: 11, rating: 70, isGoalkeeper: false },
  { id: 'p10', name: 'Hakan', number: 3, rating: 73, isGoalkeeper: false },
  { id: 'p11', name: 'Serkan', number: 2, rating: 71, isGoalkeeper: false },
];

/** Forma renk paleti — colorPalette.js */
export {
  COLOR_GROUPS,
  COLOR_SWATCHES,
  QUICK_COLORS,
  isLightColor,
  sameHex,
  contrastInk,
} from './colorPalette';

export const KIT_PATTERNS = [
  { id: 'solid', label: 'Düz' },
  { id: 'stripes', label: 'Şerit' },
  { id: 'hoops', label: 'Halka' },
  { id: 'sash', label: 'Kuşak' },
  { id: 'shoulders', label: 'Omuz' },
];

export const KIT_PRESETS = [
  {
    id: 'bronze-blue',
    name: 'Emerald Pitch',
    primary: '#22C55E',
    secondary: '#D9F99D',
    sleeveColor: '#14532D',
    number: '#FFFFFF',
    border: '#D9F99D',
    pattern: 'solid',
    gkPrimary: '#84CC16',
    gkSecondary: '#14532D',
    gkSleeveColor: '#166534',
    gkNumber: '#111827',
    gkBorder: '#D9F99D',
    gkPattern: 'solid',
  },
  {
    id: 'classic-red',
    name: 'Klasik Kırmızı',
    primary: '#d32f2f',
    secondary: '#ffffff',
    sleeveColor: '#b71c1c',
    number: '#ffffff',
    border: '#ffffff',
    pattern: 'solid',
    gkPrimary: '#f57c00',
    gkSecondary: '#ffffff',
    gkSleeveColor: '#e65100',
    gkNumber: '#ffffff',
    gkBorder: '#ffffff',
    gkPattern: 'solid',
  },
  {
    id: 'navy-stripes',
    name: 'Lacivert Şerit',
    primary: '#1a237e',
    secondary: '#ffffff',
    sleeveColor: '#0d47a1',
    number: '#ffffff',
    border: '#c5cae9',
    pattern: 'stripes',
    gkPrimary: '#ffeb3b',
    gkSecondary: '#1a237e',
    gkSleeveColor: '#fbc02d',
    gkNumber: '#1a237e',
    gkBorder: '#1a237e',
    gkPattern: 'solid',
  },
  {
    id: 'sky-blue',
    name: 'Gök Mavi',
    primary: '#0288d1',
    secondary: '#ffffff',
    sleeveColor: '#0277bd',
    number: '#ffffff',
    border: '#ffffff',
    pattern: 'solid',
    gkPrimary: '#7b1fa2',
    gkSecondary: '#ce93d8',
    gkSleeveColor: '#6a1b9a',
    gkNumber: '#ffffff',
    gkBorder: '#ffffff',
    gkPattern: 'solid',
  },
  {
    id: 'forest-hoops',
    name: 'Yeşil Halka',
    primary: '#2e7d32',
    secondary: '#ffffff',
    sleeveColor: '#1b5e20',
    number: '#ffffff',
    border: '#a5d6a7',
    pattern: 'hoops',
    gkPrimary: '#ef6c00',
    gkSecondary: '#ffffff',
    gkSleeveColor: '#e65100',
    gkNumber: '#ffffff',
    gkBorder: '#ffffff',
    gkPattern: 'solid',
  },
  {
    id: 'black-gold',
    name: 'Siyah-Altın',
    primary: '#212121',
    secondary: '#ffc107',
    sleeveColor: '#000000',
    number: '#ffc107',
    border: '#ffc107',
    pattern: 'shoulders',
    gkPrimary: '#1565c0',
    gkSecondary: '#ffffff',
    gkSleeveColor: '#0d47a1',
    gkNumber: '#ffffff',
    gkBorder: '#ffffff',
    gkPattern: 'solid',
  },
  {
    id: 'white-red-sash',
    name: 'Beyaz Kuşak',
    primary: '#ffffff',
    secondary: '#d32f2f',
    sleeveColor: '#eceff1',
    number: '#d32f2f',
    border: '#d32f2f',
    pattern: 'sash',
    gkPrimary: '#00897b',
    gkSecondary: '#ffffff',
    gkSleeveColor: '#00695c',
    gkNumber: '#ffffff',
    gkBorder: '#ffffff',
    gkPattern: 'solid',
  },
  {
    id: 'purple',
    name: 'Mor',
    primary: '#6a1b9a',
    secondary: '#ffffff',
    sleeveColor: '#4a148c',
    number: '#ffffff',
    border: '#ce93d8',
    pattern: 'solid',
    gkPrimary: '#ffca28',
    gkSecondary: '#4a148c',
    gkSleeveColor: '#fbc02d',
    gkNumber: '#4a148c',
    gkBorder: '#4a148c',
    gkPattern: 'solid',
  },
  {
    id: 'orange-stripes',
    name: 'Turuncu Şerit',
    primary: '#ef6c00',
    secondary: '#212121',
    sleeveColor: '#e65100',
    number: '#ffffff',
    border: '#ffffff',
    pattern: 'stripes',
    gkPrimary: '#37474f',
    gkSecondary: '#ff9100',
    gkSleeveColor: '#263238',
    gkNumber: '#ffffff',
    gkBorder: '#ffffff',
    gkPattern: 'hoops',
  },
  {
    id: 'teal-white',
    name: 'Turkuaz',
    primary: '#00897b',
    secondary: '#ffffff',
    sleeveColor: '#00695c',
    number: '#ffffff',
    border: '#b2dfdb',
    pattern: 'shoulders',
    gkPrimary: '#ff1744',
    gkSecondary: '#ffffff',
    gkSleeveColor: '#c62828',
    gkNumber: '#ffffff',
    gkBorder: '#ffffff',
    gkPattern: 'solid',
  },
  {
    id: 'pink-night',
    name: 'Pembe Gece',
    primary: '#f50057',
    secondary: '#212121',
    sleeveColor: '#c51162',
    number: '#ffffff',
    border: '#f8bbd0',
    pattern: 'sash',
    gkPrimary: '#00e5ff',
    gkSecondary: '#006064',
    gkSleeveColor: '#00bcd4',
    gkNumber: '#006064',
    gkBorder: '#006064',
    gkPattern: 'solid',
  },
];

export const DEFAULT_KIT = {
  presetId: KIT_PRESETS[0].id,
  ...KIT_PRESETS[0],
  customSwatches: [],
};

export function normalizeKit(kit) {
  const base = { ...DEFAULT_KIT };
  if (!kit || typeof kit !== 'object') return { ...base, customSwatches: [] };
  const customSwatches = Array.isArray(kit.customSwatches)
    ? kit.customSwatches.filter((c) => typeof c === 'string').slice(0, 24)
    : [];

  const hex = (value, fallback) => {
    if (value == null || value === '') return fallback;
    let h = String(value).trim();
    if (!h.startsWith('#')) h = `#${h}`;
    if (/^#[0-9a-fA-F]{3}$/.test(h)) {
      h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    if (!/^#[0-9a-fA-F]{6}$/i.test(h)) return fallback;
    return h.toUpperCase();
  };

  const primary = hex(kit.primary, base.primary);
  const gkPrimary = hex(kit.gkPrimary, base.gkPrimary);

  return {
    ...base,
    ...kit,
    primary,
    secondary: hex(kit.secondary, base.secondary),
    sleeveColor: hex(kit.sleeveColor ?? kit.primary, primary),
    number: hex(kit.number, base.number),
    border: hex(kit.border, base.border),
    pattern: kit.pattern || base.pattern || 'solid',
    gkPrimary,
    gkSecondary: hex(kit.gkSecondary ?? kit.gkBorder, base.gkSecondary),
    gkSleeveColor: hex(kit.gkSleeveColor ?? kit.gkPrimary, gkPrimary),
    gkNumber: hex(kit.gkNumber, base.gkNumber),
    gkBorder: hex(kit.gkBorder, base.gkBorder),
    gkPattern: kit.gkPattern || base.gkPattern || 'solid',
    customSwatches,
  };
}

export function kitFromPreset(presetId) {
  const preset = KIT_PRESETS.find((k) => k.id === presetId) || KIT_PRESETS[0];
  return normalizeKit({ ...preset, presetId: preset.id });
}

export function normalizeTeamSize(value) {
  const size = Number(value);
  if (TEAM_SIZES.includes(size)) return size;
  // Eski '7v7' / '6v6' formatı
  const match = String(value).match(/^(\d+)/);
  if (match) {
    const parsed = Number(match[1]);
    if (TEAM_SIZES.includes(parsed)) return parsed;
  }
  return 7;
}

export function sizeLabel(size) {
  const n = normalizeTeamSize(size);
  return `${n}v${n}`;
}

export function getFormationsForSize(teamSize) {
  const size = normalizeTeamSize(teamSize);
  return Object.keys(FORMATIONS[size] || FORMATIONS[7]);
}

/** Geriye uyumluluk: mode string veya size kabul eder */
export function getFormationsForMode(modeOrSize) {
  return getFormationsForSize(modeOrSize);
}

export function getFormationSlots(teamSize, formation) {
  const size = normalizeTeamSize(teamSize);
  const bySize = FORMATIONS[size] || FORMATIONS[7];
  if (bySize[formation]) return bySize[formation];
  const firstKey = Object.keys(bySize)[0];
  return bySize[firstKey];
}

export function createEmptyLineup(teamSize, formation) {
  const slots = getFormationSlots(teamSize, formation);
  const lineup = {};
  slots.forEach((slot) => {
    lineup[slot.id] = null;
  });
  return lineup;
}

export function createDefaultLineupAndBench(players, teamSize, formation) {
  const slots = getFormationSlots(teamSize, formation);
  const lineup = createEmptyLineup(teamSize, formation);
  const assigned = [];

  slots.forEach((slot, index) => {
    const player = players[index];
    if (player) {
      lineup[slot.id] = player.id;
      assigned.push(player.id);
    }
  });

  const benchIds = players
    .filter((p) => !assigned.includes(p.id))
    .map((p) => p.id);

  return { lineup, benchIds };
}

export function buildSahaKadro(players, lineup) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const sahaKadro = {};

  Object.entries(lineup).forEach(([slotId, playerId]) => {
    if (playerId && byId[playerId]) {
      sahaKadro[Number(slotId)] = byId[playerId];
    }
  });

  return sahaKadro;
}

export function createTeamId() {
  return `team_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export function createPlayerId() {
  return `p_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function createPlayer({
  name = 'Oyuncu',
  number = 0,
  isGoalkeeper = false,
  instructionId = null,
} = {}) {
  return {
    id: createPlayerId(),
    name: String(name).trim() || 'Oyuncu',
    number: Math.max(0, Math.min(99, Number(number) || 0)),
    isGoalkeeper: !!isGoalkeeper,
    instructionId: instructionId || null,
  };
}

export function createTeam({
  name = 'Yeni Takım',
  managerName = 'Teknik Direktör',
  teamSize = 7,
  formation,
  withSamplePlayers = false,
} = {}) {
  const size = normalizeTeamSize(teamSize);
  const formations = getFormationsForSize(size);
  const nextFormation = formations.includes(formation)
    ? formation
    : formations[0];

  const players = withSamplePlayers
    ? SAMPLE_PLAYERS.slice(0, Math.max(size, 7)).map((p) => ({ ...p }))
    : [];

  const { lineup, benchIds } = withSamplePlayers
    ? createDefaultLineupAndBench(players, size, nextFormation)
    : {
        lineup: createEmptyLineup(size, nextFormation),
        benchIds: [],
      };

  return {
    id: createTeamId(),
    name: name.trim() || 'Yeni Takım',
    managerName,
    teamSize: size,
    formation: nextFormation,
    players,
    lineup,
    benchIds,
    customPositions: {},
    kit: normalizeKit(DEFAULT_KIT),
  };
}

export function createInitialSquadState() {
  const defaultTeam = createTeam({
    name: 'Bizim Takım',
    managerName: 'Teknik Direktör',
    teamSize: 7,
    formation: '2-3-1',
    withSamplePlayers: true,
  });

  return {
    teams: [defaultTeam],
    activeTeamId: defaultTeam.id,
    activeTab: 'pitch',
  };
}

export function getActiveTeam(state) {
  if (!state?.teams?.length) return null;
  return (
    state.teams.find((t) => t.id === state.activeTeamId) || state.teams[0]
  );
}
