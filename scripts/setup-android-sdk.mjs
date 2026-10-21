import { JSDOM } from 'jsdom';
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdir, cp, writeFile } from 'node:fs/promises';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (!process.argv.includes('--accept-sdk-license')) {
  console.error('This setup downloads Google Android SDK tools and accepts the SDK license.');
  console.error('Review https://developer.android.com/studio and obtain authorization first.');
  console.error('Then run: node scripts/setup-android-sdk.mjs --accept-sdk-license');
  process.exit(1);
}
if (process.platform !== 'win32') throw new Error('This setup script is for Windows.');
const root = fileURLToPath(new URL('../', import.meta.url));
const sdk = path.join(root, '.android-sdk');
const downloads = path.join(root, 'artifacts', 'sdk-downloads');
const userHome = path.join(root, '.android-sdk-user');
const gradleHome = path.join(root, '.gradle');
const temp = path.join(gradleHome, 'tmp');
await Promise.all([sdk,downloads,userHome,temp].map(directory=>mkdir(directory,{recursive:true})));
const env = { ...process.env, ANDROID_HOME:sdk, ANDROID_SDK_ROOT:sdk, ANDROID_USER_HOME:userHome, GRADLE_USER_HOME:gradleHome, TEMP:temp, TMP:temp };

async function runPowerShell(command, extras = {}, input) {
  await new Promise((resolve,reject)=>{
    const child = spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',command],{cwd:root,env:{...env,...extras},stdio:[input?'pipe':'ignore','inherit','inherit']});
    child.on('error',reject);
    child.on('exit',code=>code===0?resolve():reject(new Error(`Setup command exited with ${code}`)));
    if(input){child.stdin.on('error',()=>{});child.stdin.end(input);}
  });
}
async function hashFile(file,algorithm){const hash=createHash(algorithm);for await(const chunk of createReadStream(file))hash.update(chunk);return hash.digest('hex');}
const sdkManager = path.join(sdk,'cmdline-tools','latest','bin','sdkmanager.bat');
if(!existsSync(sdkManager)){
  console.log('Reading the official Google SDK package index…');
  const indexResponse=await fetch('https://dl.google.com/android/repository/repository2-3.xml',{signal:AbortSignal.timeout(60000)});
  if(!indexResponse.ok)throw new Error(`SDK index HTTP ${indexResponse.status}`);
  const xml=await indexResponse.text();
  const doc=new JSDOM(xml,{contentType:'text/xml'}).window.document;
  const pkg=[...doc.querySelectorAll('remotePackage')].find(el=>el.getAttribute('path')==='cmdline-tools;latest');
  if(!pkg)throw new Error('Stable command-line tools not found in Google SDK index.');
  const archive=[...pkg.querySelectorAll('archive')].find(el=>el.querySelector('host-os')?.textContent==='windows');
  const complete=archive?.querySelector('complete');
  const relative=complete?.querySelector('url')?.textContent;
  const checksum=complete?.querySelector('checksum');
  const algorithm=checksum?.getAttribute('type')||'sha1';
  const expected=checksum?.textContent.trim();
  const bytes=Number(complete?.querySelector('size')?.textContent);
  if(!relative||!expected||!['sha1','sha256'].includes(algorithm))throw new Error('Missing official package checksum.');
  const url=new URL(relative,'https://dl.google.com/android/repository/');
  if(url.origin!=='https://dl.google.com')throw new Error('Unexpected package host.');
  const zip=path.join(downloads,path.basename(url.pathname));
  if(!existsSync(zip)||await hashFile(zip,algorithm)!==expected){
    console.log(`Downloading Android command-line tools (${Math.round(bytes/1048576)} MB) to D:…`);
    const response=await fetch(url,{signal:AbortSignal.timeout(600000)});
    if(!response.ok)throw new Error(`SDK download HTTP ${response.status}`);
    let received=0,reported=0;
    const progress=new Transform({transform(chunk,encoding,callback){received+=chunk.length;const percent=Math.floor(received/bytes*100/10)*10;if(percent>reported){reported=percent;console.log(`SDK tools download: ${Math.min(percent,100)}%`);}callback(null,chunk);}});
    await pipeline(Readable.fromWeb(response.body),progress,createWriteStream(zip));
    if(await hashFile(zip,algorithm)!==expected)throw new Error('SDK archive checksum mismatch.');
  }
  console.log('SDK archive checksum verified. Extracting on D:…');
  const extracted=path.join(downloads,'command-line-tools');
  await runPowerShell('Expand-Archive -LiteralPath $env:GAYLINGUA_SDK_ZIP -DestinationPath $env:GAYLINGUA_SDK_EXTRACT -Force',{GAYLINGUA_SDK_ZIP:zip,GAYLINGUA_SDK_EXTRACT:extracted});
  await cp(path.join(extracted,'cmdline-tools'),path.join(sdk,'cmdline-tools','latest'),{recursive:true});
  await writeFile(path.join(downloads,'sdk-package.json'),JSON.stringify({url:url.href,algorithm,checksum:expected,bytes},null,2));
}
console.log('Installing Android Platform 36, Build-Tools 36.0.0, and platform tools on D:…');
console.log('Accepting the Android SDK license with the user’s explicit authorization.');
const androidCli = path.join(sdk,'cmdline-tools','latest','bin','android.exe');
if(existsSync(androidCli)) {
  await new Promise((resolve,reject)=>{
    const child=spawn(androidCli,['--no-metrics',`--sdk=${sdk}`,'sdk','install','platforms/android-36','build-tools/36.0.0','platform-tools'],{cwd:root,env,stdio:['pipe','inherit','inherit']});
    child.on('error',reject);
    child.on('exit',code=>code===0?resolve():reject(new Error(`Android SDK install exited with ${code}`)));
    child.stdin.on('error',()=>{});
    child.stdin.end('y\ny\ny\n');
  });
} else {
  await runPowerShell('& $env:GAYLINGUA_SDK_MANAGER "--sdk_root=$env:GAYLINGUA_SDK_ROOT" "--install" "platforms;android-36" "build-tools;36.0.0" "platform-tools"; exit $LASTEXITCODE', {GAYLINGUA_SDK_MANAGER:sdkManager,GAYLINGUA_SDK_ROOT:sdk}, 'y\ny\ny\n');
}
if(!existsSync(path.join(sdk,'platforms','android-36','android.jar')))throw new Error('Platform 36 was not installed.');
if(!existsSync(path.join(sdk,'build-tools','36.0.0','apksigner.bat')))throw new Error('Build-Tools 36.0.0 were not installed.');
console.log(`Android SDK ready: ${sdk}`);
console.log(`Gradle cache: ${gradleHome}`);
console.log('Next: npm run android:apk');
