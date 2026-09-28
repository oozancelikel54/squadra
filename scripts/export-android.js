/**
 * Lokal Android export → Masaüstü
 *   node scripts/export-android.js apk
 *   node scripts/export-android.js aab
 *   node scripts/export-android.js both
 *
 * Gereksinim: JDK 17 + Android SDK
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const mode = (process.argv[2] || 'aab').toLowerCase();
const root = path.resolve(__dirname, '..');
const androidDir = path.join(root, 'android');
const desktop = path.join(os.homedir(), 'Desktop');
const stamp = new Date().toISOString().slice(0, 10);

function findJavaHome() {
  if (
    process.env.JAVA_HOME &&
    fs.existsSync(path.join(process.env.JAVA_HOME, 'bin', 'java.exe'))
  ) {
    return process.env.JAVA_HOME;
  }
  const adoptium = 'C:\\Program Files\\Eclipse Adoptium';
  if (fs.existsSync(adoptium)) {
    const hit = fs
      .readdirSync(adoptium)
      .find((n) => /^jdk-17/i.test(n));
    if (hit) return path.join(adoptium, hit);
  }
  return null;
}

const javaHome = findJavaHome();
const androidHome =
  process.env.ANDROID_HOME ||
  process.env.ANDROID_SDK_ROOT ||
  path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk');

/**
 * Windows 260 path limit: Cursor sandbox GRADLE_USER_HOME çok uzun.
 * Kısa gerçek yol kullan (SUBST ninja'da uzun yola çözülür).
 */
function resolveGradleHome() {
  if (process.env.GRADLE_USER_HOME) return process.env.GRADLE_USER_HOME;
  const short = 'C:\\g';
  if (fs.existsSync(path.join(short, 'wrapper')) || fs.existsSync(path.join(short, 'caches'))) {
    return short;
  }
  if (!fs.existsSync(short)) fs.mkdirSync(short, { recursive: true });
  return short;
}

const gradleHome = resolveGradleHome();

function fail(msg) {
  console.error(`\n[export] ${msg}`);
  process.exit(1);
}

function run(cmd, args, cwd) {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  if (!fs.existsSync(gradleHome)) {
    fs.mkdirSync(gradleHome, { recursive: true });
  }
  const env = {
    ...process.env,
    JAVA_HOME: javaHome,
    ANDROID_HOME: androidHome,
    ANDROID_SDK_ROOT: androidHome,
    GRADLE_USER_HOME: gradleHome,
    PATH: `${path.join(javaHome, 'bin')}${path.delimiter}${path.join(
      androidHome,
      'platform-tools'
    )}${path.delimiter}${process.env.PATH || ''}`,
  };
  const res = spawnSync(cmd, args, { cwd, env, stdio: 'inherit', shell: true });
  if (res.status !== 0) fail(`Başarısız: ${cmd} ${args.join(' ')}`);
}

if (!javaHome) {
  fail('JDK 17 yok. Kur: winget install EclipseAdoptium.Temurin.17.JDK');
}
if (!fs.existsSync(androidHome)) {
  fail(`Android SDK yok: ${androidHome}`);
}
if (!fs.existsSync(path.join(androidDir, 'gradlew.bat'))) {
  fail('android/ yok. Önce: npx expo prebuild --platform android');
}

console.log(`[export] JAVA_HOME=${javaHome}`);
console.log(`[export] GRADLE_USER_HOME=${gradleHome}`);
console.log(`[export] mode=${mode}`);

const keyProps = path.join(root, 'credentials', 'keystore.properties');
if ((mode === 'aab' || mode === 'both') && !fs.existsSync(keyProps)) {
  console.warn(
    '[export] UYARI: credentials/keystore.properties yok — AAB debug key ile imzalanır (Play kabul etmez).'
  );
  console.warn('[export] Önce: npm run keystore:create');
} else if (fs.existsSync(keyProps)) {
  console.log('[export] Release upload keystore kullanılacak');
}

const gradlew = path.join(androidDir, 'gradlew.bat');

if (mode === 'apk' || mode === 'both') {
  run(gradlew, ['assembleRelease'], androidDir);
  const src = path.join(
    androidDir,
    'app/build/outputs/apk/release/app-release.apk'
  );
  if (!fs.existsSync(src)) fail(`APK yok: ${src}`);
  const dest = path.join(desktop, `Squadra-${stamp}.apk`);
  fs.copyFileSync(src, dest);
  console.log(`[export] APK → ${dest}`);
}

if (mode === 'aab' || mode === 'both') {
  run(gradlew, ['bundleRelease'], androidDir);
  const src = path.join(
    androidDir,
    'app/build/outputs/bundle/release/app-release.aab'
  );
  if (!fs.existsSync(src)) fail(`AAB yok: ${src}`);
  const dest = path.join(desktop, `Squadra-${stamp}.aab`);
  fs.copyFileSync(src, dest);
  console.log(`[export] AAB → ${dest}`);
}

console.log('\n[export] Bitti.');
