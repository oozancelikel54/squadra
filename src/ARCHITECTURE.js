/**
 * Uygulama katmanları (okunabilir mimari)
 *
 * App.js              → kabuk: tema / i18n / dialog / tab host
 * src/ads             → AdMob (banner, rewarded, share flow)
 * src/screens         → sekme ekranları
 * src/components      → UI parçaları (Pitch, Jersey, modals…)
 * src/context         → Squad state
 * src/constants       → diziliş, talimat, marka, taktik görselleri
 * src/theme           → renk / stiller
 * src/i18n            → TR / EN
 * src/storage         → AsyncStorage
 * src/utils           → paylaşım, VS layout
 * plugins             → native prebuild düzeltmeleri (AAB uyumu + release imza)
 * credentials/        → upload keystore (gitignore — Play imzası)
 * scripts/export-android.js → lokal APK/AAB → Masaüstü
 * scripts/create-upload-keystore.js → Play upload key oluştur
 */
