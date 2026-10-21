import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=relative=>readFile(new URL('../'+relative,import.meta.url),'utf8');

test('source snapshot has all rows and each source row is represented once',async()=>{
  const snapshot=JSON.parse(await read('data/wikipedia-swardspeak.json'));
  assert.equal(snapshot.source.tableCount,8);
  assert.equal(snapshot.rows.length,83);
  assert.equal(snapshot.source.rowCount,83);
  assert.equal(new Set(snapshot.rows.map(row=>row.rowId)).size,83);
  assert.ok(snapshot.rows.some(row=>row.word==='Puñeta'));
  assert.ok(snapshot.rows.some(row=>row.word==='Nota'));
  assert.ok(snapshot.rows.some(row=>row.word==='Mag-Sharon'));
  assert.match(await read('ATTRIBUTION.md'),/CC BY-SA 4.0/);
});
test('PWA manifest icons exist, match PNG dimensions, and fit within the start scope',async()=>{
  const manifest=JSON.parse(await read('dist/manifest.webmanifest'));
  assert.equal(manifest.display,'standalone');
  assert.equal(manifest.start_url,'/');
  for(const icon of manifest.icons){
    const png=await readFile(new URL('../dist'+icon.src,import.meta.url));
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`,icon.sizes);
  }
});
test('native staging bundles the full dictionary without hosting metadata or a service worker',async()=>{
  const result=spawnSync(process.execPath,['scripts/prepare-android.mjs'],{cwd:root,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const config=JSON.parse(await read('capacitor.config.json'));
  assert.equal(config.appId,'app.gaylingua.mobile');
  assert.equal(config.webDir,'native-web');
  assert.equal(config.server,undefined,'Native app must load bundled assets, not the private hosted site');
  const files=await readdir(new URL('../native-web/',import.meta.url));
  assert.ok(files.includes('wikipedia-words.js'));
  assert.ok(!files.includes('.openai'));
  assert.ok(!files.includes('sw.js'));
  assert.doesNotMatch(await read('native-web/app.js'),/serviceWorker\.register/);
  assert.doesNotMatch(await read('native-web/index.html'),/manifest\.webmanifest/);
  assert.match(await read('native-web/index.html'),/viewport-fit=cover/);
  assert.match(await read('native-web/native.css'),/safe-area-inset-top/);
  assert.match(await read('native-web/native.css'),/safe-area-inset-bottom/);
});
