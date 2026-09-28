import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

/**
 * AdMob SDK erişimi.
 * Expo Go’da native modül yoktur → null döner (uygulama çökmez).
 * Init sırası: UMP (GDPR) consent → MobileAds.initialize → reklamlar.
 */

let cachedModule = null;
let initPromise = null;

function hasNativeBridge() {
  try {
    if (NativeModules.RNGoogleMobileAdsModule) return true;
    if (TurboModuleRegistry?.get?.('RNGoogleMobileAdsModule')) return true;
  } catch {
    // ignore
  }
  return false;
}

function loadAdsModule() {
  if (cachedModule !== null) return cachedModule;

  if (Platform.OS === 'web' || !hasNativeBridge()) {
    if (__DEV__ && Platform.OS !== 'web') {
      console.warn(
        '[ads] Native AdMob yok. Expo Go desteklemez — `npx expo run:android` veya EAS build gerekir.'
      );
    }
    cachedModule = false;
    return cachedModule;
  }

  try {
    // eslint-disable-next-line global-require
    cachedModule = require('react-native-google-mobile-ads');
  } catch (error) {
    console.warn('[ads] Modül yüklenemedi:', error?.message || error);
    cachedModule = false;
  }

  return cachedModule;
}

/** @returns {object|null} react-native-google-mobile-ads exports */
export function getAds() {
  const mod = loadAdsModule();
  return mod || null;
}

export function isAdsAvailable() {
  return !!getAds();
}

/**
 * EEA / UK vb. için UMP formu (gerekirse).
 * Form yoksa / hata olursa reklamları engelleme — yine init dene.
 */
async function gatherAdsConsent(ads) {
  if (!ads?.AdsConsent?.gatherConsent) return { canRequestAds: true };
  try {
    const info = await ads.AdsConsent.gatherConsent();
    console.log('[ads] Consent:', info?.status, 'canRequestAds=', info?.canRequestAds);
    return info;
  } catch (error) {
    console.warn('[ads] Consent hatası (reklam yine denenecek):', error?.message || error);
    return { canRequestAds: true };
  }
}

/** SDK’yı bir kez başlatır (önce UMP) */
export function initializeAds() {
  const ads = getAds();
  if (!ads?.default) return Promise.resolve(false);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const consent = await gatherAdsConsent(ads);
    if (consent && consent.canRequestAds === false) {
      console.warn('[ads] canRequestAds=false — reklam istenmeyecek');
      return false;
    }

    try {
      await ads.default().initialize();
      console.log('[ads] SDK hazır (__DEV__=', __DEV__, ')');
      return true;
    } catch (error) {
      console.warn('[ads] Init hatası:', error?.message || error);
      return false;
    }
  })();

  return initPromise;
}
