import { Platform, Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { APP_HASHTAG } from '../constants/appBrand';

function ensureFileUri(uri) {
  if (!uri) return uri;
  if (uri.startsWith('file://') || uri.startsWith('content://')) return uri;
  return `file://${uri}`;
}

export function friendlyError(error, fallback) {
  const msg = String(error?.message || error || '');
  if (/cancel|dismiss|abort/i.test(msg)) return null;
  if (/permission|izin|denied/i.test(msg)) {
    return 'Galeri izni verilmedi. Ayarlardan izin verip tekrar dene.';
  }
  if (/not ready|hazır değil|null|undefined/i.test(msg)) {
    return 'Saha henüz hazır değil. Saha sekmesine geçip tekrar dene.';
  }
  return msg || fallback;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Saha ViewShot → güvenli PNG dosyası */
export async function capturePitchImage(viewRef, { retries = 2 } = {}) {
  if (!viewRef?.current) {
    throw new Error('Saha görünümü hazır değil. Önce Saha sekmesine geç.');
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const rawUri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const source = ensureFileUri(rawUri);
      if (!source) throw new Error('Görüntü oluşturulamadı.');

      const dest = `${FileSystem.cacheDirectory}squadra_${Date.now()}.png`;
      try {
        const info = await FileSystem.getInfoAsync(source);
        if (!info.exists) throw new Error('Geçici dosya bulunamadı.');
        await FileSystem.copyAsync({ from: source, to: dest });
        return dest;
      } catch {
        return source;
      }
    } catch (error) {
      lastError = error;
      await wait(220 * (attempt + 1));
    }
  }

  throw lastError || new Error('Kadro görüntüsü alınamadı.');
}

/**
 * Android (özellikle Xiaomi/MIUI) file:// cache URI ile Intent açınca
 * native crash verebiliyor. content:// veya galeri asset URI tercih edilir.
 */
async function toShareableUri(fileUri) {
  if (Platform.OS !== 'android') return fileUri;

  // 1) content:// (FileProvider)
  try {
    if (typeof FileSystem.getContentUriAsync === 'function') {
      const contentUri = await FileSystem.getContentUriAsync(fileUri);
      if (contentUri) return contentUri;
    }
  } catch (e) {
    console.warn('[share] getContentUriAsync', e?.message || e);
  }

  // 2) Galeriye yaz → MediaStore content URI
  try {
    const permission = await MediaLibrary.requestPermissionsAsync(true);
    if (permission.granted) {
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      if (asset?.uri) return asset.uri;
    }
  } catch (e) {
    console.warn('[share] media asset uri', e?.message || e);
  }

  return fileUri;
}

/**
 * Sistem paylaşım sheet’i.
 * @returns {'shared'|'gallery_fallback'|'cancelled'}
 *
 * Not: Redmi/MIUI’de sheet bazen native crash eder.
 * Overlay kapalıyken + content:// ile risk düşer; olmazsa galeri fallback.
 */
export async function sharePitchImage(uri) {
  const fileUri = ensureFileUri(uri);
  const shareUri = await toShareableUri(fileUri);

  // Önceki loading modal / activity bitsin (MIUI kritik)
  await wait(350);

  try {
    const available = await Sharing.isAvailableAsync();
    if (available) {
      await Sharing.shareAsync(shareUri, {
        mimeType: 'image/png',
        dialogTitle: `${APP_HASHTAG} kadro`,
        UTI: 'public.png',
      });
      return 'shared';
    }
  } catch (e) {
    const msg = String(e?.message || e || '');
    if (/cancel|dismiss|abort/i.test(msg)) return 'cancelled';
    console.warn('[share] shareAsync failed', msg);
  }

  // Fallback: RN Share (çoğu Android’de metin; yine dene)
  try {
    const result = await Share.share(
      Platform.OS === 'ios'
        ? { url: fileUri, message: APP_HASHTAG }
        : { message: `${APP_HASHTAG} kadro`, title: APP_HASHTAG },
      { dialogTitle: `${APP_HASHTAG} kadro` }
    );
    if (result.action === Share.dismissedAction) return 'cancelled';
    // Android image taşınamadıysa yine de gallery fallback yap
  } catch (e) {
    console.warn('[share] Share.share failed', e?.message || e);
  }

  // Son çare: galeriye kaydet — kullanıcı oradan paylaşır
  await savePitchImageToGallery(fileUri);
  return 'gallery_fallback';
}

export async function savePitchImageToGallery(uri) {
  const fileUri = ensureFileUri(uri);
  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) {
    throw new Error('Galeriye kaydetmek için izin gerekli.');
  }

  try {
    if (Platform.OS === 'android') {
      await MediaLibrary.createAssetAsync(fileUri);
    } else {
      await MediaLibrary.saveToLibraryAsync(fileUri);
    }
  } catch {
    try {
      await MediaLibrary.createAssetAsync(fileUri);
    } catch (inner) {
      throw new Error(
        friendlyError(inner, 'Galeriye kaydedilemedi.') || 'Galeriye kaydedilemedi.'
      );
    }
  }
}
