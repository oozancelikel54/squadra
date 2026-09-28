import { getFormationSlots } from '../constants/initialData';

function parsePercent(value) {
  if (typeof value === 'number') return value;
  return parseFloat(String(value).replace('%', '')) || 0;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/** Orijinal diziliş % → VS yarı saha (alt / üst) */
const HOME_MIN = 54;
const HOME_SPAN = 40; // 54 → 94
const AWAY_MAX = 46;
const AWAY_SPAN = 40; // 46 → 6

/**
 * Kendi takımı: alt yarı (GK altta).
 * left biraz içeri çekilir ki forma taşmasın.
 */
export function mapHomeSlotForVs(slot) {
  const t = parsePercent(slot.top);
  const l = parsePercent(slot.left);
  return {
    ...slot,
    side: 'home',
    sourceId: slot.id,
    id: `h-${slot.id}`,
    top: `${(HOME_MIN + (t / 100) * HOME_SPAN).toFixed(1)}%`,
    left: `${clamp(8 + (l / 100) * 76, 8, 84).toFixed(1)}%`,
  };
}

/**
 * Rakip: üst yarı, dikey ayna (GK üstte). Yatay ayna yok — daha doğal.
 */
export function mapAwaySlotForVs(slot) {
  const t = parsePercent(slot.top);
  const l = parsePercent(slot.left);
  return {
    ...slot,
    side: 'away',
    sourceId: slot.id,
    id: `a-${slot.id}`,
    top: `${(AWAY_MAX - (t / 100) * AWAY_SPAN).toFixed(1)}%`,
    left: `${clamp(8 + (l / 100) * 76, 8, 84).toFixed(1)}%`,
  };
}

export function buildVsSlots(homeSize, homeFormation, awaySize, awayFormation) {
  const homeSlots = (getFormationSlots(homeSize, homeFormation) || []).map(
    mapHomeSlotForVs
  );
  const awaySlots = (getFormationSlots(awaySize, awayFormation) || []).map(
    mapAwaySlotForVs
  );
  return { homeSlots, awaySlots };
}

/** Sürükleme sonrası yarı sahada tut */
export function clampVsPosition(side, top, left) {
  const t = parsePercent(top);
  const l = parsePercent(left);
  if (side === 'away') {
    return {
      top: `${clamp(t, 4, 46).toFixed(1)}%`,
      left: `${clamp(l, 4, 84).toFixed(1)}%`,
    };
  }
  return {
    top: `${clamp(t, 52, 92).toFixed(1)}%`,
    left: `${clamp(l, 4, 84).toFixed(1)}%`,
  };
}
