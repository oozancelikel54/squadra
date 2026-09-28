/** 10 hazır taktik talimatı */

export const INSTRUCTIONS = [
  {
    id: 'press_high',
    title: 'Yüksek Pres',
    short: 'Pres',
    description: 'Rakibi kendi sahasında baskıla, topu erken kap.',
    color: '#ef4444',
  },
  {
    id: 'hold_shape',
    title: 'Şekli Koru',
    short: 'Şekil',
    description: 'Dizilişi bozma, kompakt ve disiplinli kal.',
    color: '#22C55E',
  },
  {
    id: 'play_wide',
    title: 'Geniş Oyna',
    short: 'Geniş',
    description: 'Kanatları kullan, sahayı yatay aç.',
    color: '#22c55e',
  },
  {
    id: 'long_ball',
    title: 'Uzun Top',
    short: 'Uzun',
    description: 'Hızlı uzun paslarla forvete çık.',
    color: '#f59e0b',
  },
  {
    id: 'short_pass',
    title: 'Kısa Pas',
    short: 'Kısa',
    description: 'Topa sahip ol, kısa kombinasyonlarla ilerle.',
    color: '#06b6d4',
  },
  {
    id: 'man_mark',
    title: 'Adam Adam',
    short: 'Markaj',
    description: 'Direkt eşleş, yakından takip et.',
    color: '#a855f7',
  },
  {
    id: 'counter',
    title: 'Kontra Atak',
    short: 'Kontra',
    description: 'Topu kapınca hızla ileri çık.',
    color: '#f97316',
  },
  {
    id: 'time_waste',
    title: 'Tempo Düşür',
    short: 'Tempo',
    description: 'Oyunu yavaşlat, skoru koru.',
    color: '#64748b',
  },
  {
    id: 'shoot_more',
    title: 'Şut Ara',
    short: 'Şut',
    description: 'Uzak mesafeden de şut seçeneklerini dene.',
    color: '#e11d48',
  },
  {
    id: 'support_run',
    title: 'Destek Koşusu',
    short: 'Destek',
    description: 'Pas opsiyonu sun, boş alana koş.',
    color: '#14b8a6',
  },
];

export function getInstructionById(id) {
  return INSTRUCTIONS.find((item) => item.id === id) || null;
}
