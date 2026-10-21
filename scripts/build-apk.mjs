import { existsSync } from 'node:fs';
import { mkdir, copyFile, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const android = path.join(root, 'android');
const localProperties = path.join(android, 'local.properties');
const standardSdk = process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk');
let configuredSdk;
if (existsSync(localProperties)) {
  configuredSdk = (await readFile(localProperties, 'utf8')).match(/^sdk\.dir=(.+)$/m)?.[1].trim().replace(/\\:/g, ':').replace(/\\\\/g, '\\');
}
const sdk = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, configuredSdk, path.join(root, '.android-sdk'), standardSdk]
  .find(candidate => candidate && existsSync(path.join(candidate, 'platforms', 'android-36', 'android.jar')));
if (!sdk) {
  console.error('Android SDK Platform 36 was not found.');
  console.error('Install Android SDK Platform 36 and Android SDK Build-Tools using Android Studio > SDK Manager.');
  console.error('Accept Google’s SDK license yourself during setup, then run npm run android:apk again.');
  console.error('SDK setup: https://developer.android.com/studio');
  process.exit(1);
}
const gradleHome = path.join(root, '.gradle');
const androidUserHome = path.join(root, '.android-sdk-user');
const temp = path.join(gradleHome, 'tmp');
await Promise.all([mkdir(gradleHome,{recursive:true}),mkdir(androidUserHome,{recursive:true}),mkdir(temp,{recursive:true})]);
const env = { ...process.env, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk, ANDROID_USER_HOME: androidUserHome, GRADLE_USER_HOME: gradleHome, TEMP: temp, TMP: temp };
function run(command, args, cwd = root, options = {}) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit', ...options });
  if (result.error) console.error(result.error.message);
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
run(process.execPath, [path.join(root, 'scripts', 'prepare-android.mjs')]);
run(process.execPath, [path.join(root, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor'), 'sync', 'android']);
if (process.platform === 'win32') {
  run(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'gradlew.bat', '--no-daemon', 'assembleDebug'], android);
} else {
  run('sh', ['./gradlew', '--no-daemon', 'assembleDebug'], android);
}
const artifacts = path.join(root, 'artifacts');
await mkdir(artifacts, { recursive: true });
const target = path.join(artifacts, 'gaylingua-debug.apk');
await copyFile(path.join(android, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'), target);
console.log(`\nInstallable test APK: ${target}`);
console.log('This is a debug-signed APK for device testing. Store releases need your own signing key.');
