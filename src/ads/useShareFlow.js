import { useCallback, useState } from 'react';
import {
  capturePitchImage,
  friendlyError,
  savePitchImageToGallery,
  sharePitchImage,
} from '../utils/sharePitch';
import {
  preloadRewardedAd,
  showRewardedForShare,
} from './rewardedShare';
import { initializeAds } from './adsRuntime';
import { useDialog } from '../components/AppDialog';

/**
 * Paylaşım + ödüllü reklam akışı.
 * Dialog tamamen kapandıktan sonra reklam / ikinci dialog açılır (crash önlemi).
 */
export function useShareFlow({
  activeTeam,
  activeTab,
  setActiveTab,
  pitchShotRef,
  t,
}) {
  const { showDialog } = useDialog();
  const [sharing, setSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  const bootAds = useCallback(() => {
    initializeAds().then(() => preloadRewardedAd()).catch(() => {});
  }, []);

  const prepareCapture = useCallback(async () => {
    if (activeTab !== 'pitch') {
      setActiveTab('pitch');
      setShareStatus(t('share.preparing'));
      await delay(450);
    }
    setShareStatus(t('share.capturing'));
    await nextFrame();
    await delay(50);
    return capturePitchImage(pitchShotRef);
  }, [activeTab, setActiveTab, pitchShotRef, t]);

  const runWithShareUi = useCallback(
    (label, action) => {
      setTimeout(async () => {
        try {
          setSharing(true);
          setShareStatus(label);
          await nextFrame();
          await delay(80);
          await action();
        } catch (error) {
          const msg = friendlyError(error, t('share.fail'));
          if (msg) {
            await showDialog({
              title: t('share.sharing'),
              message: msg,
              buttons: [{ text: t('common.ok') }],
            });
          }
        } finally {
          setSharing(false);
          setShareStatus('');
        }
      }, 80);
    },
    [showDialog, t]
  );

  const openShareOptions = useCallback(async () => {
    const choice = await showDialog({
      title: t('share.title'),
      message: t('share.body'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('share.saveGallery') },
        { text: t('common.share') },
      ],
    });

    if (choice === t('share.saveGallery')) {
      runWithShareUi(t('share.savingGallery'), async () => {
        const uri = await prepareCapture();
        setShareStatus(t('share.writingGallery'));
        await savePitchImageToGallery(uri);
        await showDialog({
          title: t('share.savedTitle'),
          message: t('share.savedBody'),
          buttons: [{ text: t('common.ok') }],
        });
      });
      return;
    }

    if (choice === t('common.share')) {
      // Loading overlay’i kapatıp sonra sheet aç (Redmi/MIUI crash önlemi)
      setTimeout(async () => {
        try {
          setSharing(true);
          setShareStatus(t('share.capturing'));
          const uri = await prepareCapture();
          setShareStatus(t('share.system'));
          await nextFrame();
          // Overlay kapansın — Intent ile üst üste binmesin
          setSharing(false);
          setShareStatus('');
          await delay(400);

          const result = await sharePitchImage(uri);
          if (result === 'gallery_fallback') {
            await showDialog({
              title: t('share.fallbackTitle'),
              message: t('share.fallbackBody'),
              buttons: [{ text: t('common.ok') }],
            });
          }
        } catch (error) {
          setSharing(false);
          setShareStatus('');
          const msg = friendlyError(error, t('share.fail'));
          if (msg) {
            await showDialog({
              title: t('share.sharing'),
              message: msg,
              buttons: [{ text: t('common.ok') }],
            });
          }
        }
      }, 80);
    }
  }, [prepareCapture, runWithShareUi, showDialog, t]);

  const handleSharePress = useCallback(async () => {
    try {
      if (!activeTeam) {
        await showDialog({
          title: t('share.noTeamTitle'),
          message: t('share.noTeamBody'),
          buttons: [{ text: t('common.ok') }],
        });
        return;
      }

      const adChoice = await showDialog({
        title: t('share.adRequiredTitle'),
        message: t('share.adRequiredBody'),
        buttons: [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('share.adWatch') },
        ],
      });

      if (adChoice !== t('share.adWatch')) return;

      // Dialog kapandı — şimdi güvenli şekilde reklam / paylaşım
      setSharing(true);
      setShareStatus(t('share.adLoading'));

      let result = 'unavailable';
      try {
        result = await showRewardedForShare();
      } catch (e) {
        console.warn('[share] rewarded failed', e);
        result = 'unavailable';
      }

      setSharing(false);
      setShareStatus('');

      if (result === 'rewarded' || result === 'unavailable') {
        await delay(120);
        await openShareOptions();
        return;
      }

      await showDialog({
        title: t('share.adSkippedTitle'),
        message: t('share.adSkippedBody'),
        buttons: [{ text: t('common.ok') }],
      });
    } catch (e) {
      console.warn('[share] handleSharePress error', e);
      setSharing(false);
      setShareStatus('');
    }
  }, [activeTeam, openShareOptions, showDialog, t]);

  return {
    sharing,
    shareStatus,
    bootAds,
    handleSharePress,
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
