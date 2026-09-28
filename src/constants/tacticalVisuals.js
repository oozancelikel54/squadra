/** Talimat → saha görseli (yayın grafiği / taktik tahtası dili) */

export const TACTICAL_VISUALS = {
  press_high: {
    kind: 'thrust',
    length: 48,
    weight: 2.2,
    zone: 'press',
  },
  hold_shape: {
    kind: 'brace',
    r: 28,
    weight: 1.8,
  },
  play_wide: {
    kind: 'spread',
    length: 40,
    weight: 2,
    zone: 'wide',
  },
  long_ball: {
    kind: 'loft',
    length: 56,
    weight: 2,
  },
  short_pass: {
    kind: 'link',
    length: 26,
    weight: 1.8,
  },
  man_mark: {
    kind: 'lock',
    r: 22,
    weight: 2,
  },
  counter: {
    kind: 'burst',
    length: 52,
    weight: 2.1,
  },
  time_waste: {
    kind: 'tempo',
    r: 18,
    weight: 1.7,
  },
  shoot_more: {
    kind: 'strike',
    length: 42,
    weight: 2.4,
  },
  support_run: {
    kind: 'curve',
    length: 36,
    weight: 1.9,
  },
};

export function getTacticalVisual(instructionId) {
  return TACTICAL_VISUALS[instructionId] || null;
}
