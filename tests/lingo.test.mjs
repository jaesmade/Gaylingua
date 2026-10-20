import test from 'node:test';
import assert from 'node:assert/strict';
import { words, phrases, translate, dailyWord, shuffled } from '../dist/lingo.js';

test('all curated English and Filipino phrases resolve without case or punctuation sensitivity', () => {
  for (const phrase of phrases) for (const input of phrase.inputs) {
    const result=translate('  '+input.toUpperCase()+'!  ');
    assert.equal(result.kind,'phrase',input);
    assert.equal(result.text,phrase.output,input);
    assert.ok(result.matches.length);
    assert.ok(result.matches.every(Boolean));
  }
});
test('empty and unsupported input do not invent translations', () => {
  assert.equal(translate('  ').kind,'empty');
  const unmatched=translate('The telescope points at Jupiter.');
  assert.equal(unmatched.kind,'unmatched');
  assert.equal(unmatched.text,'The telescope points at Jupiter.');
  assert.deepEqual(unmatched.matches,[]);
});
test('word boundaries preserve longer words and Unicode words',()=>{
  assert.equal(translate('foodie wanton nanayá').kind,'unmatched');
  assert.equal(translate('scaredy').text,'scaredy');
});
test('longer aliases win and replacements are not translated twice',()=>{
  const result=translate('My best friend is tired and hungry.');
  assert.equal(result.text,'My Beshie is Pagoda and Tom Jones.');
  assert.deepEqual(result.matches.map(w=>w.id),['beshie','pagoda','tom-jones']);
});
test('Filipino word substitutions preserve unmatched language',()=>{
  const result=translate('Si nanay ay pagod at gutom.','filipino');
  assert.equal(result.text,'Si Mudra ay Pagoda at Tom Jones.');
  assert.equal(result.kind,'words');
});
test('a repeated word produces one explanatory entry',()=>{
  assert.equal(translate('tired tired tired').matches.length,1);
});
test('every dictionary entry has a unique ID, meaningful details, and a working alias',()=>{
  assert.equal(new Set(words.map(w=>w.id)).size,words.length);
  for(const word of words){
    assert.ok(word.meaning&&word.filipino&&word.note&&word.example&&word.category);
    assert.ok(word.aliases.some(alias=>translate(alias).matches.some(w=>w.id===word.id)),word.id);
  }
});
test('daily word is stable through a local calendar day',()=>{
  assert.equal(dailyWord(new Date(2026,9,21,0)).id,dailyWord(new Date(2026,9,21,23,59)).id);
  assert.ok(words.includes(dailyWord()));
});
test('game shuffling preserves every item and does not mutate the source',()=>{
  const input=['a','b','c','d'];
  const out=shuffled(input);
  assert.deepEqual(input,['a','b','c','d']);
  assert.deepEqual([...out].sort(),input);
  assert.notEqual(out,input);
});
