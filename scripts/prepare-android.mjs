import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'native-web');
await mkdir(output, { recursive: true });
// Only app assets are bundled. Hosting metadata and the web service worker stay out.
for (const filename of ['styles.css', 'app.js', 'lingo.js', 'wikipedia-words.js', 'icon.svg', 'icon-192.png', 'icon-512.png']) {
  await copyFile(path.join(root, 'dist', filename), path.join(output, filename));
}
const source = await readFile(path.join(root, 'dist', 'index.html'), 'utf8');
const html = source
  .replace('<link rel="manifest" href="/manifest.webmanifest">', '')
  .replace('width=device-width, initial-scale=1.0', 'width=device-width, initial-scale=1.0, viewport-fit=cover')
  .replace('</head>', '<link rel="stylesheet" href="/native.css"></head>');
await writeFile(path.join(output, 'index.html'), html);
await writeFile(path.join(output, 'native.css'), `
/* Capacitor injects safe-area variables for Android system bars. */
body { padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px)); }
.sidebar { padding-top: calc(32px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px))); }
#install-button { display: none !important; }
@media (max-width: 700px) {
  .mobile-nav { padding-bottom: calc(9px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))); }
  .page-footer { padding-bottom: calc(103px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))); }
  .toast { bottom: calc(91px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))); }
}
`);
// APK assets are already local, so a service-worker cache is unnecessary.
const appPath = path.join(output, 'app.js');
const app = await readFile(appPath, 'utf8');
await writeFile(appPath, app.replace("if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});", '/* Native build: all core assets are bundled in the APK. */'));
console.log('Prepared bundled Android assets in native-web/.');
