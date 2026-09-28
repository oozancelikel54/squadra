const {
  createRunOncePlugin,
  withAndroidStyles,
  AndroidConfig,
} = require('@expo/config-plugins');

/**
 * MIUI / Android Force Dark — beyazı siyaha boyamasın.
 * Yalnızca tek AppTheme'e item ekle (ikinci style bloğu merge hatası verir).
 */
function withDisableForceDark(config) {
  return withAndroidStyles(config, (cfg) => {
    cfg.modResults = AndroidConfig.Styles.assignStylesValue(cfg.modResults, {
      add: true,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
      name: 'android:forceDarkAllowed',
      value: 'false',
    });
    return cfg;
  });
}

module.exports = createRunOncePlugin(
  withDisableForceDark,
  'lineupbuilder-disable-force-dark',
  '1.2.0'
);
