/**
 * Forma renkleri — az ve net; geri kalanı özel renk (+) ile.
 */

export const COLOR_SWATCHES = [
  '#FFFFFF', // beyaz
  '#000000', // siyah
  '#FFEB3B', // sarı
  '#FF9800', // turuncu
  '#F44336', // kırmızı
  '#E91E63', // pembe
  '#9C27B0', // mor
  '#0D1B4C', // lacivert
  '#1565C0', // mavi
  '#00BCD4', // camgöbeği
  '#22C55E', // yeşil
  '#84CC16', // limon
  '#14532D', // koyu yeşil
  '#795548', // kahve
  '#9E9E9E', // gri
];

export const COLOR_GROUPS = [{ id: 'all', colors: COLOR_SWATCHES }];

/** Özel renk modal hızlı seçimler */
export const QUICK_COLORS = [
  '#FFFFFF',
  '#000000',
  '#FFEB3B',
  '#FF9800',
  '#F44336',
  '#0D1B4C',
  '#1565C0',
  '#22C55E',
  '#84CC16',
  '#9C27B0',
  '#E91E63',
  '#795548',
];

export function isLightColor(hex) {
  const raw = String(hex || '')
    .replace('#', '')
    .trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 186;
}

export function sameHex(a, b) {
  return String(a || '').toLowerCase() === String(b || '').toLowerCase();
}

export function contrastInk(hex) {
  return isLightColor(hex) ? '#111827' : '#FFFFFF';
}
