import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';
import { getAds, initializeAds, isAdsAvailable } from './adsRuntime';
import { getBannerUnitId, PROD_AD_UNITS } from './adIds';

/**
 * Alt navbar üstünde adaptive banner.
 * ViewShot dışında kalmalı — paylaşım görüntüsüne girmez.
 */
export default function AdBanner() {
  const { colors } = useTheme();
  const [ready, setReady] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    initializeAds().then((ok) => {
      if (alive) setReady(!!ok && isAdsAvailable());
    });
    return () => {
      alive = false;
    };
  }, []);

  const onFail = useCallback((err) => {
    const msg = err?.message || String(err);
    console.warn('[ads] Banner hatası:', msg, 'unit=', PROD_AD_UNITS.banner);
    setFailed(true);
    // Kısa süre sonra yeniden dene (fill / network)
    setTimeout(() => {
      setFailed(false);
      setLoadKey((k) => k + 1);
    }, 12000);
  }, []);

  if (!isAdsAvailable() || !ready || Platform.OS === 'web') {
    return null;
  }

  if (failed) {
    return (
      <View
        style={[
          styles.wrap,
          { backgroundColor: colors.bg, borderTopColor: colors.border },
        ]}
      />
    );
  }

  const ads = getAds();
  if (!ads) return null;

  const { BannerAd, BannerAdSize, TestIds } = ads;
  const unitId = getBannerUnitId(TestIds);

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.bg, borderTopColor: colors.border },
      ]}
    >
      <BannerAd
        key={`banner-${loadKey}-${unitId}`}
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER || BannerAdSize.BANNER}
        onAdFailedToLoad={onFail}
        onAdLoaded={() => console.log('[ads] Banner yüklendi')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 50,
    overflow: 'hidden',
  },
});
