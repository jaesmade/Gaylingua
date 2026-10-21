import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import { createPreviewServer } from '../server.mjs';

let server, origin;
before(async () => { server=createPreviewServer().listen(0,'127.0.0.1'); await once(server,'listening'); origin=`http://127.0.0.1:${server.address().port}`; });
after(async () => { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); });

test('home page and every module, icon, manifest, and service worker are served',async()=>{
  for(const asset of ['/','/app.js','/lingo.js','/wikipedia-words.js','/styles.css','/manifest.webmanifest','/sw.js','/icon.svg','/icon-192.png','/icon-512.png']){
    const response=await fetch(origin+asset);
    assert.equal(response.status,200,asset);
    assert.ok((await response.arrayBuffer()).byteLength>0,asset);
  }
});
test('PWA icons and executable modules have correct content types',async()=>{
  assert.equal((await fetch(origin+'/icon-192.png')).headers.get('content-type'),'image/png');
  assert.equal((await fetch(origin+'/wikipedia-words.js')).headers.get('content-type'),'application/javascript');
  assert.equal((await fetch(origin+'/manifest.webmanifest')).headers.get('content-type'),'application/manifest+json');
});
test('unknown files return 404 and source files are not exposed',async()=>{
  for(const asset of ['/missing.js','/package.json','/.git/config','/../README.md'])assert.equal((await fetch(origin+asset)).status,404,asset);
});
function rawRequest(path){return new Promise((resolve,reject)=>{const request=http.get(origin+path,response=>{response.resume();resolve(response.statusCode);});request.on('error',reject);});}
test('encoded directory traversal cannot escape the asset directory',async()=>{
  assert.equal(await rawRequest('/%2e%2e%2fpackage.json'),403);
  assert.equal(await rawRequest('/%2e%2e%5cpackage.json'),403);
});
test('malformed URL encoding returns 400 without terminating the server',async()=>{
  assert.equal(await rawRequest('/%E0%A4%A'),400);
  assert.equal((await fetch(origin)).status,200);
});
