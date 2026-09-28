/**
 * Release AAB imzası — credentials/keystore.properties varsa kullanır.
 * Prebuild sonrası da kalır.
 */
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = 'Squadra release signing';

function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;

    if (!contents.includes(MARKER)) {
      contents = contents.replace(
        /android\s*\{/,
        `android {\n\n// ${MARKER}\ndef squadraKeystorePropertiesFile = rootProject.file("../credentials/keystore.properties")\ndef squadraKeystoreProperties = new Properties()\nif (squadraKeystorePropertiesFile.exists()) {\n    squadraKeystoreProperties.load(new FileInputStream(squadraKeystorePropertiesFile))\n}\n`
      );
    }

    // Ensure release signingConfig block exists inside signingConfigs
    if (!/signingConfigs\s*\{[\s\S]*?release\s*\{/.test(contents)) {
      contents = contents.replace(
        /(signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\n\s*\})(\s*\n\s*\})/,
        `$1
        release {
            if (squadraKeystorePropertiesFile.exists()) {
                keyAlias squadraKeystoreProperties['keyAlias']
                keyPassword squadraKeystoreProperties['keyPassword']
                storeFile rootProject.file(squadraKeystoreProperties['storeFile'])
                storePassword squadraKeystoreProperties['storePassword']
            }
        }$2`
      );
    }

    // Force release buildType to use upload keystore when present
    contents = contents.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
      `$1signingConfig squadraKeystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug`
    );

    // Never leave debug buildType on release key by mistake
    contents = contents.replace(
      /(buildTypes\s*\{\s*debug\s*\{[\s\S]*?)signingConfig\s+squadraKeystorePropertiesFile\.exists\(\)\s*\?\s*signingConfigs\.release\s*:\s*signingConfigs\.debug/,
      `$1signingConfig signingConfigs.debug`
    );

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = withReleaseSigning;
