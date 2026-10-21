import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const code=await readFile(new URL('../dist/sw.js',import.meta.url),'utf8');
function worker({online=true,cache=new Map()}={}){
  const handlers={},precached=[],deleted=[];
  const context={
    self:{location:{origin:'https://gaylingua.test'},clients:{async claim(){}},async skipWaiting(){},addEventListener(type,handler){handlers[type]=handler;}},
    caches:{async open(){return{async addAll(paths){precached.push(...paths);},async put(key,value){cache.set(typeof key==='string'?key:key.url,value);}};},async match(key){return cache.get(typeof key==='string'?key:key.url);},async keys(){return['gaylingua-v1','gaylingua-v3'];},async delete(key){deleted.push(key);}},
    async fetch(request){if(!online)throw new Error('Offline');return new Response('network asset',{status:200});},URL,Response,
  };
  vm.runInNewContext(code,context);
  async function request(path,options={}){let response;handlers.fetch({request:{url:'https://gaylingua.test'+path,method:'GET',mode:'cors',...options},respondWith(value){response=value;}});return await response;}
  return {handlers,request,precached,deleted};
}
test('offline installation precaches all dictionary modules and essential assets',async()=>{
  const w=worker();let completion;w.handlers.install({waitUntil(value){completion=value;}});await completion;
  for(const asset of ['/index.html','/app.js','/lingo.js','/wikipedia-words.js','/styles.css','/manifest.webmanifest'])assert.ok(w.precached.includes(asset));
});
test('offline requests return cached modules and navigation falls back to the app shell',async()=>{
  const cache=new Map([['https://gaylingua.test/wikipedia-words.js',new Response('dictionary')],['/index.html',new Response('app shell')]]);
  const w=worker({online:false,cache});
  assert.equal(await(await w.request('/wikipedia-words.js')).text(),'dictionary');
  assert.equal(await(await w.request('/new-path',{mode:'navigate'})).text(),'app shell');
  assert.equal((await w.request('/missing.js')).type,'error');
});
test('service worker leaves POST and external requests untouched',async()=>{
  const w=worker();
  assert.equal(await w.request('/submit',{method:'POST'}),undefined);
  assert.equal(await w.request('/external',{url:'https://example.org/other.js'}),undefined);
});
test('service worker returns successful online responses',async()=>{
  assert.equal(await(await worker().request('/wikipedia-words.js')).text(),'network asset');
});
