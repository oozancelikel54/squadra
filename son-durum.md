# Squadra — Yayın Öncesi Son Durum (A–Z)

**Tarih:** 24 Ağustos 2026  
**Ürün adı:** Squadra  
**Paket:** `com.ozancelikel.lineupbuilder`  
**Stack:** Expo 54 · RN 0.81 · JavaScript · AdMob · AsyncStorage  
**Karar:** Çekirdek ürün **oynanabilir**. Play Store / App Store **şimdi yayınlanmamalı** — önce yasal, mağaza ve birkaç ürün deliği kapanmalı.

---

## 1. Ürün özeti (şu an ne var)

Tek cihazlık halı saha / kadro uygulaması:

| Mekanik | Durum | Not |
|---------|--------|-----|
| Çoklu takım CRUD | Çalışıyor | Son takım silinemez |
| 5–11 kişi + diziliş | Çalışıyor | Boyut değişince fazla oyuncu yedeğe düşer, özel pozisyonlar sıfırlanır |
| Forma (preset, desen, özel renk) | Çalışıyor | Preset adları TR hardcoded |
| Oyuncu ekle / düzenle / sil | Çalışıyor | `rating` veride var, UI’da yok |
| Talimatlar (10 adet) | Çalışıyor | TR/EN i18n var |
| Saha sürükle-bırak | Çalışıyor | Kalıcı `customPositions` |
| Yedek şerit | Çalışıyor | |
| VS (rakip takım) | Kısmi | Sürükleme kalıcı değil; kapanınca sıfırlanır |
| TR / EN | Kısmi | Ana akış çevrili; bazı placeholder / preset TR |
| Tutorial | Çalışıyor | |
| Açık / koyu tema | Çalışıyor | Sistem temasıyla otomatik senkron yok |
| Kalıcılık | Çalışıyor | `@halisaha/squad/v1` |
| Galeriye kaydet | Çalışıyor | |
| Sistem paylaş | Riskli | MIUI/Redmi’de native crash geçmişi; fallback eklendi |
| Banner reklam | Native build’de | Expo Go’da yok |
| Ödüllü reklam (paylaş) | Native build’de | Yüklenemezse paylaşım yine açılıyor |
| Filigran `#Squadra` | Capture anında | `sharing=true` iken 4 köşe |

---

## 2. Mekanikler A–Z (nasıl çalışıyor)

### Takım
- Menü: seç / düzenle / sil / yeni takım.
- Oluştur: isim, TD, kişi sayısı, diziliş, isteğe örnek kadro.
- Aktif takım tüm sekmelerin kaynağı (`SquadContext` kısayolları).

### Saha
- Slot’a dokun: boşsa ata, doluysa talimat / değiştir / yedeğe al.
- Sürükle: yüzde konum `customPositions`.
- Diziliş veya kişi sayısı değişince özel konumlar **bilinçli sıfırlanır**.
- Paylaş FAB nabız animasyonlu.

### VS
- Başka kayıtlı takımı rakip seç.
- Rakip üst yarı, sen alt yarı (`vsLayout.js`).
- VS içi sürükleme **sadece bellek**; kaydedilmez.

### Forma
- Saha / kaleci ayrı.
- Desen: düz, şerit, halka, kuşak, omuz.
- Özel renk modalı + palet.

### Paylaşım akışı
1. Paylaş → ödüllü reklam onayı  
2. Reklam izlenir **veya** native yoksa atlanır  
3. Galeri / sistem paylaş seçimi  
4. Capture öncesi overlay + kısa bekleme (filigran boyansın)  
5. Android’de `content://` veya galeri URI; olmazsa galeriye kaydet fallback  

### Reklam
- `__DEV__` → Google test unit  
- Release → senin banner + rewarded ID  
- App ID Android/iOS **aynı** (iOS ayrı uygulama yoksa sorun)

---

## 3. Bug’lar ve çökme riskleri

### Kritik (yayın öncesi kapat)

| # | Sorun | Nerede | Etki |
|---|--------|--------|------|
| K1 | Sistem paylaşım sheet’i Xiaomi/MIUI’de native crash | `sharePitch.js`, Redmi Note 8 Pro | Uygulama kapanır; Play’de 1 yıldız |
| K2 | Gizlilik politikası yok | Kod + store | Play Data safety / App Store red |
| K3 | GDPR UMP / iOS ATT yok | Ads | EEA + iOS inceleme |
| K4 | Android izinler şişmiş (video, ses, eski storage) | `app.json` | Data safety yalan beyan riski |
| K5 | iOS `bundleIdentifier` yok | `app.json` | iOS build/submit yok |

### Yüksek

| # | Sorun | Nerede |
|---|--------|--------|
| Y1 | `persistNow()` o anki `state` kapanışını kaydeder; hemen ardından meta kaydı race olabilir | `SquadContext.js` |
| Y2 | Ödüllü reklam `unavailable` olunca paylaşım yine açılır — “reklam izle” vaadi yanıltıcı | `useShareFlow.js` |
| Y3 | Filigran sadece `sharing===true`; timing kaçarsa markasız PNG | `PitchScreen.js` |
| Y4 | iOS ve Android aynı AdMob App ID | `app.json`, `adIds.js` |
| Y5 | New Architecture açık + GMA — düşük cihazlarda native crash ihtimali | `newArchEnabled: true` |
| Y6 | Örnek oyuncu `rating` alanı UI’da yok; tutorial EN “ratings” diyor | `initialData.js` |

### Orta

| # | Sorun |
|---|--------|
| O1 | VS pozisyonları persist edilmiyor |
| O2 | Hızlı çift oyuncu eklemede id = timestamp + random (nadir çakışma) |
| O3 | Create ekranı placeholder’ları TR sabit (`Örn. Cumartesi FC`) |
| O4 | KIT_PATTERNS / KIT_PRESETS etiketleri TR |
| O5 | Tema `userInterfaceStyle: automatic` ama uygulama sadece manuel light/dark |
| O6 | Paket adı hâlâ `lineupbuilder`; storage `@halisaha` — rebrand yarım (fonksiyonel, kafa karıştırıcı) |
| O7 | Capture `react-native-view-shot` bazı New Arch Android’de flaky (bilinen) |

### Düşük

| # | Sorun |
|---|--------|
| D1 | `jerseyBronze` isimleri yeşil palet (dead naming) |
| D2 | `package.json` name `bos-rn-js` |
| D3 | Eski `durum.md` kısa; bu dosya asıl kaynak |
| D4 | Test yok (unit / E2E) |

---

## 4. Tasarım hataları ve UX borçları

### Marka
- Launcher adı Squadra, paket `lineupbuilder`, slug `bos-rn-js`.
- Splash açık gri (`#F8FAFC`), adaptive icon koyu yeşil (`#14532D`) — ilk 1 sn kopuk.
- 4 köşe `#Squadra` rozeti paylaşımda kalabalık; tek köşe veya alt şerit daha temiz.

### Arayüz
- Paylaş FAB sürekli pulse + orbit: saha üzerinde görsel gürültü.
- VS butonu header’ın sağına absolute binmiş; küçük ekranda çakışma.
- Dialog’lar temalı (iyi); bazı sheet’ler (talimat, rakip, atama) ayrı dilde/stilde.
- Forma ekranı uzun: preset + desen + çift palet — ilk açılış ağır.
- Oyuncu kartı “puan” göstermiyor ama veri modeli puanlı.
- Bottom nav 5 sekme; orta saha vurgusu var ama FAB ile çift CTA (Paylaş).

### Tutarlılık
- Eski “bronz forma” isimleri vs yeşil marka.
- Hardcoded yeşil chip’ler (TopBanners silindi, Pitch vs rozetleri hâlâ yarı şeffaf siyah).
- Tutorial 5 adım; VS ve reklam akışı anlatılmıyor.

### Erişilebilirlik
- Dinamik font / büyük yazı testi yok.
- Kontrast: koyu nav + lime etiket OK; açık temada muted gri sınırda.
- Paylaşım overlay’si TalkBack etiketsiz.

---

## 5. Optimizasyon ve performans

| Sorun | Etki | Öneri |
|--------|------|--------|
| `SquadProvider` tüm state + aksiyonları tek value | Her kadro dokunuşunda Shirt/Players/Menu rerender | Context böl (team / kit / ui) |
| Saha her zaman mount (`AnimatedTabHost`) | Capture için doğru; arka planda 11 jerse + pan | Tab gizliyken `pointerEvents` + animasyon durdur |
| `useThemedStyles(createStyles)` — `createStyles` inline ise her render yeni fn | StyleSheet yeniden üretim | `createStyles` modül seviyesinde |
| ShareFab sonsuz 2 loop | GPU | Paylaş görünür değilken durdur |
| Shirt: çok JerseyNode + palet | İlk açılış jank | `InteractionManager` zaten var; liste virtualize |
| Persist her değişimde (debounce var mı kontrol: effect her hydrate sonrası save) | Disk I/O | 400–800ms debounce kit/drag için |
| New Arch + view-shot + ads | Düşük RAM (Note 8 Pro 6GB ama MIUI ağır) | Crashlytics ile izle; gerekirse old arch denemesi |
| Banner her frame layout | Navbar zıplaması | Sabit yükseklik rezervi |

Hedef cihaz (senin test): **Redmi Note 8 Pro / MIUI** — paylaşım ve ads native katmanı en kırılgan yer.

---

## 6. Mağaza / yasal / yayın checklist

Play Console ve (ileride) App Store için:

### Zorunlu (yoksa red veya politika ihlali)

- [ ] Gizlilik politikası URL (HTTPS, herkese açık)
- [ ] Ayarlar içinden gizlilik linki
- [ ] Play **Data safety**: reklamlar, fotoğraf (galeri kaydı), yerel depolama
- [ ] AdMob **UMP** (GDPR mesajı) — EEA
- [ ] Gereksiz izinleri sil: `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`, mümkünse eski `WRITE_EXTERNAL_STORAGE`
- [ ] Sadece `READ_MEDIA_IMAGES` / photo picker + media-library plugin metinleri
- [ ] Store ikon 512, feature graphic 1024×500, telefon screenshot (en az 2, öneri 4–8)
- [ ] İçerik derecelendirmesi (IARC) — reklamlı uygulama
- [ ] Reklam beyanı: “Uygulama reklam içerir”
- [ ] Destek e-posta / web
- [ ] Production AdMob uygulaması paket adı ile **birebir** `com.ozancelikel.lineupbuilder`
- [ ] Store’da test reklamı **kapalı** (`__DEV__` zaten ayırıyor; release APK ile doğrula)

### iOS (şimdilik ertelemek mantıklı)

- [ ] `ios.bundleIdentifier`
- [ ] Ayrı AdMob iOS App ID + unit
- [ ] ATT (`NSUserTrackingUsageDescription`)
- [ ] Privacy Manifest
- [ ] App Store screenshot seti

### Teknik yayın

- [ ] `eas.json` production profili (AAB, Play)
- [ ] `version` + `android.versionCode` (EAS autoIncrement varsa doğrula)
- [ ] İkon / splash dosyalarının gerçekten `assets/` altında olduğunu yerelde doğrula
- [ ] Release APK’da banner + rewarded **gerçek** unit
- [ ] Crash aracı (en azından Play vitals; tercih Sentry)
- [ ] `package.json` / slug isim tutarlılığı (opsiyonel, mağazayı etkilemez)

### Politika tuzakları

- Ödüllü reklamı “izlemeden paylaşamazsın” deyip reklam yoksa atlamak **yanıltıcı** olabilir → copy’yi düzelt veya reklam zorunlu tut (timeout’ta kibar hata).
- Çocuklara yönelik gibi duran “halı saha” + ads → COPPA/Designed for Families’e **girme**.
- Kullanıcı isimleri UGC: Data safety’de “user-generated” gerekmez (yerel), yine de ToS kısa metin iyi olur.

---

## 7. Yapılabilecekler (öncelik sırası)

### P0 — Yayın kapısı (1–3 gün)

1. Privacy policy sayfası + in-app link  
2. `app.json` izinlerini sadeleştir  
3. Paylaşım: MIUI’de varsayılan yolu **Galeriye kaydet**, “Uygulamaya gönder” ikinci ve try/catch + fallback (zaten var, copy’yi netleştir)  
4. Ödüllü reklam yoksa kullanıcıya dürüst mesaj  
5. Play listing metinleri TR (ve istersen EN)  
6. Release APK ile 3 cihaz testi: saha, forma, paylaş, reklam, tema, dil  

### P1 — Ürün cilası (1 hafta)

7. VS pozisyonlarını kaydet veya “oturumluk” olduğunu UI’da yaz  
8. Oyuncu puanı (rating) UI — ya ekle ya veriden/tutorial’dan çıkar  
9. Filigranı tek şerit / tek köşe  
10. FAB animasyonunu sadeleştir  
11. i18n: Create placeholders, kit isimleri  
12. persistNow race düzelt  
13. Settings’te “Sistem teması” seçeneği  

### P2 — Rekabet (sonraki sürüm)

14. Oyuncu foto / avatar  
15. Undo  
16. Kadro şablonu kopyala  
17. Story boyutu (9:16) export  
18. Taktik okları  
19. Cloud / link paylaşımı  
20. TypeScript + birkaç unit test  
21. React Navigation (derin link, geri tuşu)  
22. Auto-balance (eski planda vardı, yapılmadı)  
23. Slot ↔ slot swap  
24. Crashlytics / analytics  

### P3 — İsteğe bağlı

25. Paket adını `com.…squadra` yapmak (AdMob + Play uygulamasını **yeni** açmak gerekir — **yapma** şu an)  
26. iOS ilk sürüm  
27. Widget  

---

## 8. Yayın öncesi test planı

Her build’de işaretle:

- [ ] İlk açılış tutorial, Geç / Başla  
- [ ] Takım oluştur (5 ve 11), silme kısıtı  
- [ ] Forma preset + özel renk + kaleci  
- [ ] Oyuncu ekle, numara, kaleci, sil  
- [ ] Sahada ata, sürükle, yedeğe al, talimat  
- [ ] VS aç/kapa, rakip değişince reset  
- [ ] Tema light/dark, dil TR/EN (Create placeholder’lara bak)  
- [ ] Ayarlar kaydet, konum sıfırla, tüm veri sıfırla  
- [ ] Galeriye kaydet (izin reddet / kabul)  
- [ ] Paylaş (Redmi’de özellikle) — çökme yok  
- [ ] Banner görünür (release)  
- [ ] Ödüllü: izle / kapat / yüklenemez  
- [ ] Uygulamayı öldürüp aç — kadro duruyor  
- [ ] Airplane mode: crash yok, reklam unavailable dürüst  

---

## 9. Dürüst skor kartı

| Alan | /10 | Yorum |
|------|-----|--------|
| Çekirdek kadro/saha | 8 | Asıl iş çalışıyor |
| Forma | 7.5 | Zengin, biraz ağır |
| VS | 5 | Demo seviyesi |
| Paylaşım | 5 | MIUI riski |
| Reklam | 6 | Kod hazır, politika/UMP eksik |
| Tasarım tutarlılığı | 6.5 | Tema iyi, marka dağınık |
| i18n | 6 | İskelet var, kenarlar TR |
| Performans | 6 | Düşük cihazda risk |
| Mağaza hazırlığı | 3 | Privacy, izin, listing |
| Kod kalitesi | 6.5 | Temizlendi, test yok |

**Toplam ürün:** yayınlanabilir bir **MVP’ye yakın**.  
**Toplam mağaza:** **hazır değil.**

Önerilen sıra: P0 → preview APK iç test (sen + 2–3 kişi) → Play **internal testing** → açık test → production.

---

## 10. Dosya haritası (hızlı)

| Katman | Dosya |
|--------|--------|
| Giriş | `App.js` |
| State | `src/context/SquadContext.js` |
| Storage | `src/storage/squadStorage.js` |
| Tema | `src/theme/*` |
| Dialog | `src/components/AppDialog.js` |
| Saha | `src/components/Pitch.js` |
| Paylaş | `src/utils/sharePitch.js`, `src/ads/useShareFlow.js` |
| Ads | `src/ads/adIds.js`, `adsRuntime.js`, `AdBanner.js`, `rewardedShare.js` |
| i18n | `src/i18n/*` |
| Store config | `app.json`, `eas.json` |

Kısa özet için eski `durum.md` duruyor; **yayın kararları bu dosyaya göre** alınsın.
