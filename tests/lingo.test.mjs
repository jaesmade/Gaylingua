import test from 'node:test';
import assert from 'node:assert/strict';
import { words, curatedWords, phrases, translate, dailyWord, shuffled, wikipediaRows, meaningsOverlap, distinctWords } from '../dist/lingo.js';

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
  const unmatched=translate('The telescope points at Saturn.');
  assert.equal(unmatched.kind,'unmatched');
  assert.equal(unmatched.text,'The telescope points at Saturn.');
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
    assert.ok(word.meaning&&word.filipino&&word.note&&word.category);
    assert.ok(word.example || word.sourceRecords.length);
    assert.ok(word.aliases.some(alias=>translate(alias).matches.some(w=>w.id===word.id)),word.id);
  }
});

test('every Wikipedia row and listed variant is present and searchable',()=>{
  assert.equal(wikipediaRows.length,83);
  assert.equal(words.length,104);
  assert.equal(curatedWords.length,30);
  assert.equal(new Set(words.flatMap(w=>w.sourceRecords.map(r=>r.rowId))).size,83);
  for(const row of wikipediaRows){
    const word=words.find(w=>w.sourceRecords.some(r=>r.rowId===row.rowId));
    assert.ok(word,row.label);
    for(const variant of row.variants) assert.ok(translate(variant).matches.some(match=>match.id===word.id),variant);
  }
});

test('new vocabulary translates English meanings and unaccented source variants',()=>{
  assert.ok(translate('jeepney').matches.some(w=>w.word==='Egyptian Airlines'));
  assert.ok(translate('expensive').matches.some(w=>w.word==='Mahalia Jackson'));
  assert.ok(translate('Gorabels').matches.some(w=>w.id==='gora'));
  assert.ok(translate('Konyo').matches.some(w=>w.word==='Coño'));
});

test('English pronoun substitutions are case insensitive and keep negations',()=>{
  assert.equal(translate('i am very tired').text,'aketch am very Pagoda');
  assert.equal(translate('ME feels tired').text,'aketch feels Pagoda');
  assert.ok(translate('I am not hungry').matches.some(word=>word.word==='Ilij'),'Negation is retained as the imported no/not expression');
});

test('games do not pair identical or directly overlapping meanings',()=>{
  assert.equal(meaningsOverlap({meaning:'Cheap / inexpensive'},{meaning:'cheap'}),true);
  for(let i=0;i<100;i++){
    const selected=distinctWords(words,5);
    assert.equal(selected.length,5);
    for(let a=0;a<selected.length;a++)for(let b=a+1;b<selected.length;b++)assert.equal(meaningsOverlap(selected[a],selected[b]),false);
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
