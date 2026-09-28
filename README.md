# Squadra

Halı saha için takım, forma ve saha yerleşimi uygulaması.

Squadra ile:

- Birden fazla takım oluşturup düzenleyebilirsin.
- 5–11 oyuncu için diziliş hazırlayabilirsin.
- Oyuncuları sahada sürükleyebilir ve yedekleri yönetebilirsin.
- Forma rengi, desen ve kaleci formasını özelleştirebilirsin.
- Takım görünümünü galeriye kaydedebilir veya paylaşabilirsin.
- Türkçe/İngilizce ve açık/koyu tema kullanabilirsin.

## Teknoloji

- Expo 54
- React Native 0.81
- JavaScript
- AsyncStorage
- Expo Media Library / Sharing
- Google Mobile Ads

## Kurulum

```bash
npm install
npx expo start
```

Android geliştirme:

```bash
npm run android
```

## Proje yapısı

- `src/context/` — takım ve uygulama durumu
- `src/screens/` — ana ekranlar
- `src/components/` — ortak arayüz bileşenleri
- `src/storage/` — yerel kayıt
- `plugins/` — Expo config plugin’leri

## GitHub ve gizlilik

Bağımlılık klasörleri, keystore’lar, credential dosyaları ve yerel build çıktıları depoya eklenmemelidir. `.gitignore` bunları dışarıda bırakır.

Yayın öncesinde gizlilik politikası, reklam izinleri/UMP, Android izinleri, paylaşım akışı ve mağaza görselleri tamamlanmalıdır.

## Lisans

Bu proje için henüz açık kaynak lisansı seçilmedi. Lisans eklenene kadar kod tüm hakları saklı kabul edilir.
