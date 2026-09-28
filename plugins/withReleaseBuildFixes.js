/**
 * Release / AAB uyumu (config plugin — prebuild sonrası kalır)
 *
 * play-services-ads 25.4+ Kotlin 2.3 metadata getiriyor; Expo 54 Kotlin 2.1
 * ile kırılıyor. Paketin beklediği 25.0.0'a sabitliyoruz.
 */
const {
  withProjectBuildGradle,
  withGradleProperties,
} = require('expo/config-plugins');

const ADS_VERSION = '25.0.0';
const KOTLIN_VERSION = '2.1.20';
const MARKER = 'Squadra ads pin';

function withAdsResolution(config) {
  return withProjectBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;

    // Eski pin / force bloklarını temizle
    contents = contents.replace(
      /\n\/\/ Squadra ads pin[\s\S]*?\n(?=\n|apply plugin|$)/g,
      '\n'
    );
    contents = contents.replace(
      /\n\s*configurations\.all\s*\{\s*resolutionStrategy\s*\{[\s\S]*?play-services-ads[\s\S]*?\}\s*\}\s*/g,
      '\n'
    );

    if (!contents.includes(MARKER)) {
      contents += `
// ${MARKER} — AAB/Kotlin uyumu (25.4+ kullanma)
subprojects { sub ->
  sub.configurations.configureEach {
    resolutionStrategy {
      force "com.google.android.gms:play-services-ads:${ADS_VERSION}"
      force "com.google.android.gms:play-services-ads-lite:${ADS_VERSION}"
    }
  }
}
`;
    }

    cfg.modResults.contents = contents;
    return cfg;
  });
}

function withKotlinProp(config) {
  return withGradleProperties(config, (cfg) => {
    const key = 'android.kotlinVersion';
    const existing = cfg.modResults.find(
      (item) => item.type === 'property' && item.key === key
    );
    if (existing) {
      existing.value = KOTLIN_VERSION;
    } else {
      cfg.modResults.push({
        type: 'property',
        key,
        value: KOTLIN_VERSION,
      });
    }
    return cfg;
  });
}

module.exports = function withReleaseBuildFixes(config) {
  config = withKotlinProp(config);
  config = withAdsResolution(config);
  return config;
};
