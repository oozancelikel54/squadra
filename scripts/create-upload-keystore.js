/**
 * Play Store upload keystore oluşturur.
 *   node scripts/create-upload-keystore.js
 *
 * Şifreyi sen girersin; dosyalar credentials/ altına yazılır (gitignore).
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const root = path.resolve(__dirname, '..');
const credDir = path.join(root, 'credentials');
const keystorePath = path.join(credDir, 'squadra-upload.keystore');
const propsPath = path.join(credDir, 'keystore.properties');

function findKeytool() {
  const home = process.env.JAVA_HOME;
  if (home) {
    const p = path.join(home, 'bin', 'keytool.exe');
    if (fs.existsSync(p)) return p;
  }
  const adoptium = 'C:\\Program Files\\Eclipse Adoptium';
  if (fs.existsSync(adoptium)) {
    const hit = fs.readdirSync(adoptium).find((n) => /^jdk-17/i.test(n));
    if (hit) {
      const p = path.join(adoptium, hit, 'bin', 'keytool.exe');
      if (fs.existsSync(p)) return p;
    }
  }
  return 'keytool';
}

function ask(q, { silent = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    if (!silent) {
      rl.question(q, (a) => {
        rl.close();
        resolve(a.trim());
      });
      return;
    }
    process.stdout.write(q);
    const stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode?.(true);
    let buf = '';
    const onData = (ch) => {
      const s = ch.toString('utf8');
      if (s === '\r' || s === '\n') {
        stdin.setRawMode?.(false);
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        rl.close();
        resolve(buf);
        return;
      }
      if (s === '\u0003') process.exit(1);
      if (s === '\u007f' || s === '\b') {
        buf = buf.slice(0, -1);
        return;
      }
      buf += s;
      process.stdout.write('*');
    };
    stdin.on('data', onData);
  });
}

async function main() {
  if (!fs.existsSync(credDir)) fs.mkdirSync(credDir, { recursive: true });
  if (fs.existsSync(keystorePath)) {
    console.error('Zaten var:', keystorePath);
    console.error('Silmeden yenisi oluşturulmaz.');
    process.exit(1);
  }

  const keytool = findKeytool();
  console.log('Upload keystore oluşturulacak (Play Console için).');
  console.log('Şifreyi bir yere not et — kaybedersen güncelleme zorlaşır.\n');

  const pass1 = await ask('Store/Key şifresi: ', { silent: true });
  const pass2 = await ask('Tekrar: ', { silent: true });
  if (!pass1 || pass1.length < 6) {
    console.error('Şifre en az 6 karakter olmalı.');
    process.exit(1);
  }
  if (pass1 !== pass2) {
    console.error('Şifreler uyuşmuyor.');
    process.exit(1);
  }

  const alias = 'squadra';
  const res = spawnSync(
    keytool,
    [
      '-genkeypair',
      '-v',
      '-storetype',
      'PKCS12',
      '-keystore',
      keystorePath,
      '-alias',
      alias,
      '-keyalg',
      'RSA',
      '-keysize',
      '2048',
      '-validity',
      '10000',
      '-storepass',
      pass1,
      '-keypass',
      pass1,
      '-dname',
      'CN=Squadra, OU=Mobile, O=Ozancelikel, L=Istanbul, ST=Istanbul, C=TR',
    ],
    { stdio: 'inherit', shell: true }
  );
  if (res.status !== 0) process.exit(res.status || 1);

  const props = [
    `storePassword=${pass1}`,
    `keyPassword=${pass1}`,
    `keyAlias=${alias}`,
    `storeFile=../credentials/squadra-upload.keystore`,
    '',
  ].join('\n');
  fs.writeFileSync(propsPath, props, 'utf8');

  console.log('\nTamam:');
  console.log(' ', keystorePath);
  console.log(' ', propsPath);
  console.log('\nSonra: npm run export:aab');
  console.log('Play’e ilk yüklemede Google App Signing açıksa upload key olarak bu keystore kullanılır.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
