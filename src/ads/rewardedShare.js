import { getAds, initializeAds, isAdsAvailable } from './adsRuntime';
import { getRewardedUnitId } from './adIds';

/**
 * Paylaşım öncesi ödüllü reklam.
 * Sonuç: 'rewarded' | 'skipped' | 'unavailable'
 */

const LOAD_TIMEOUT_MS = 8000;

let rewardedAd = null;
let isLoaded = false;
let isLoading = false;

function createRewardedAd() {
  const ads = getAds();
  if (!ads?.RewardedAd) return null;

  try {
    const { RewardedAd, AdEventType, RewardedAdEventType, TestIds } = ads;
    const unitId = getRewardedUnitId(TestIds);
    if (!unitId) return null;

    const ad = RewardedAd.createForAdRequest(unitId, {
      // Kişiselleştirilmemiş zorunluluğu fill’i düşürüyordu — kaldırıldı
    });

    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isLoaded = true;
      isLoading = false;
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      isLoaded = false;
      isLoading = false;
      // Yeniden preload — hata yut
      preloadRewardedAd().catch(() => {});
    });

    ad.addAdEventListener(AdEventType.ERROR, (e) => {
      isLoaded = false;
      isLoading = false;
      console.warn('[ads] Rewarded hata:', e?.message || e);
    });

    return ad;
  } catch (e) {
    console.warn('[ads] rewarded create failed', e?.message || e);
    return null;
  }
}

function getOrCreateRewardedAd() {
  if (!rewardedAd) rewardedAd = createRewardedAd();
  return rewardedAd;
}

export async function preloadRewardedAd() {
  try {
    if (!isAdsAvailable()) return false;
    await initializeAds();

    const ad = getOrCreateRewardedAd();
    if (!ad || isLoading || isLoaded) return isLoaded;

    isLoading = true;
    ad.load();
    return true;
  } catch (e) {
    isLoading = false;
    console.warn('[ads] preload failed', e?.message || e);
    return false;
  }
}

export async function showRewardedForShare() {
  try {
    if (!isAdsAvailable()) return 'unavailable';

    await initializeAds();
    const ads = getAds();
    const ad = getOrCreateRewardedAd();
    if (!ads || !ad) return 'unavailable';

    const { AdEventType, RewardedAdEventType } = ads;

    return await new Promise((resolve) => {
      let settled = false;
      let earned = false;
      let timeoutId = null;
      const unsubscribers = [];

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribers.forEach((unsub) => {
          try {
            unsub();
          } catch {
            // ignore
          }
        });
      };

      const finish = (result) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(result);
      };

      try {
        unsubscribers.push(
          ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
            earned = true;
          }),
          ad.addAdEventListener(AdEventType.CLOSED, () => {
            finish(earned ? 'rewarded' : 'skipped');
          }),
          ad.addAdEventListener(AdEventType.ERROR, () => {
            finish('unavailable');
          })
        );
      } catch (e) {
        finish('unavailable');
        return;
      }

      const showNow = () => {
        if (!ad.loaded && !isLoaded) {
          finish('unavailable');
          return;
        }
        Promise.resolve()
          .then(() => ad.show())
          .catch(() => finish('unavailable'));
      };

      if (ad.loaded || isLoaded) {
        showNow();
        return;
      }

      isLoading = true;
      timeoutId = setTimeout(() => finish('unavailable'), LOAD_TIMEOUT_MS);

      try {
        unsubscribers.push(
          ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
            isLoaded = true;
            isLoading = false;
            showNow();
          })
        );
        ad.load();
      } catch {
        finish('unavailable');
      }
    });
  } catch (e) {
    console.warn('[ads] showRewardedForShare failed', e?.message || e);
    return 'unavailable';
  }
}
