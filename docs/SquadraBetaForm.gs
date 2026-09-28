/**
 * Squadra — Instagram beta tester formu
 *
 * Nasıl kullanılır:
 * 1. https://script.google.com → Yeni proje
 * 2. Bu dosyanın içeriğini yapıştır (Code.gs)
 * 3. Kaydet → Çalıştır → createSquadraBetaForm
 * 4. İlk seferde izinleri onayla (kendi Google hesabın)
 * 5. Çalıştır menüsünden tekrar createSquadraBetaForm
 * 6. View → Logs / Executions içinde form linkini gör
 *
 * Form sahibi = sen. Cevaplar Google Sheet’e de bağlanır.
 */

function createSquadraBetaForm() {
  const form = FormApp.create('Squadra — Android Beta Testi');

  form
    .setDescription(
      'Squadra halı saha / kadro uygulamasının kapalı Android testine katıl.\n\n' +
        '• Sadece Android\n' +
        '• Play test daveti için Gmail gerekli\n' +
        '• 1–2 dakikalık form\n\n' +
        'Kaydolduktan sonra test linkini e-posta veya Instagram üzerinden paylaşacağız.'
    )
    .setConfirmationMessage(
      'Teşekkürler! Kaydın alındı.\n' +
        'Play kapalı teste eklenince Gmail’ine / Instagram’dan haber vereceğiz.\n' +
        'Spam klasörünü de kontrol et.'
    )
    .setAllowResponseEdits(false)
    .setAcceptingResponses(true)
    .setCollectEmail(false) // Gmail’i soru olarak alıyoruz (Play listesi için net olsun)
    .setProgressBar(true)
    .setShowLinkToRespondAgain(false);

  // 1) Ad
  form
    .addTextItem()
    .setTitle('Adın (veya Instagram kullanıcı adın)')
    .setHelpText('İstersen sadece @kullaniciadi yazman yeterli.')
    .setRequired(true);

  // 2) Gmail — Play closed testing için kritik
  form
    .addTextItem()
    .setTitle('Gmail adresin')
    .setHelpText(
      'Play Store test daveti bu adrese gider. Mutlaka Google / Gmail hesabı olsun.'
    )
    .setRequired(true)
    .setValidation(
      FormApp.createTextValidation()
        .requireTextIsEmail()
        .setHelpText('Geçerli bir e-posta gir.')
        .build()
    );

  // 3) Android kontrol
  form
    .addMultipleChoiceItem()
    .setTitle('Android telefon kullanıyor musun?')
    .setChoiceValues(['Evet, Android', 'Hayır (iPhone / diğer)'])
    .setRequired(true);

  // 4) Cihaz
  form
    .addTextItem()
    .setTitle('Telefon modeli (opsiyonel)')
    .setHelpText('Örn: Samsung A54, Xiaomi Redmi Note 12…')
    .setRequired(false);

  // 5) Android sürümü
  form
    .addListItem()
    .setTitle('Android sürümü (yaklaşık)')
    .setChoiceValues([
      'Android 15',
      'Android 14',
      'Android 13',
      'Android 12 veya altı',
      'Bilmiyorum',
    ])
    .setRequired(false);

  // 6) Ne için kullanır
  form
    .addCheckboxItem()
    .setTitle('Uygulamayı daha çok ne için kullanırsın?')
    .setChoiceValues([
      'Halı saha kadrosu / diziliş',
      'Maç talimatı / taktik',
      'Forma tasarımı',
      'Arkadaşlarla paylaşım / VS',
      'Sadece denemek istiyorum',
    ])
    .setRequired(false);

  // 7) Kısa motivasyon
  form
    .addParagraphTextItem()
    .setTitle('Kısaca: neden teste katılmak istiyorsun? (opsiyonel)')
    .setRequired(false);

  // 8) KVKK / izin
  form
    .addCheckboxItem()
    .setTitle('Onay')
    .setChoiceValues([
      'Gmail adresimin Squadra Android kapalı testi için kullanılmasını kabul ediyorum. Veriler yalnızca test daveti için tutulacak.',
    ])
    .setRequired(true);

  // Cevapları Sheet’e bağla
  const sheet = SpreadsheetApp.create('Squadra Beta Tester Yanıtları');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  const editUrl = form.getEditUrl();
  const publishUrl = form.getPublishedUrl();
  const shortUrl = form.shortenFormUrl(publishUrl);

  Logger.log('======== SQUADRA BETA FORM ========');
  Logger.log('Instagram / bio linki (bunu paylaş):');
  Logger.log(shortUrl);
  Logger.log('');
  Logger.log('Tam yanıt linki:');
  Logger.log(publishUrl);
  Logger.log('');
  Logger.log('Formu düzenleme (sadece sen):');
  Logger.log(editUrl);
  Logger.log('');
  Logger.log('Yanıtlar Sheet:');
  Logger.log(sheet.getUrl());
  Logger.log('===================================');

  // Tarayıcıda da görmek için
  return {
    shareUrl: shortUrl,
    publishUrl: publishUrl,
    editUrl: editUrl,
    sheetUrl: sheet.getUrl(),
  };
}
