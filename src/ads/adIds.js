/**
 * AdMob kimlikleri
 *
 * App ID  → AdMob → Uygulamalar → Uygulama ayarları (~ ile)
 * Unit ID → her reklam biriminin kimliği (/ ile)
 *
 * Geliştirmede (__DEV__) Google test birimleri kullanılır.
 * Release / EAS build’te aşağıdaki production birimler açılır.
 */

export const ADMOB_APP_IDS = {
  android: 'ca-app-pub-3258433091491871~2816858267',
  ios: 'ca-app-pub-3258433091491871~2816858267',
};

export const PROD_AD_UNITS = {
  banner: 'ca-app-pub-3258433091491871/2513711132',
  rewarded: 'ca-app-pub-3258433091491871/9210197602',
};

export function getBannerUnitId(TestIds) {
  if (__DEV__) return TestIds.ADAPTIVE_BANNER || TestIds.BANNER;
  return PROD_AD_UNITS.banner;
}

export function getRewardedUnitId(TestIds) {
  if (__DEV__) return TestIds.REWARDED;
  return PROD_AD_UNITS.rewarded;
}
