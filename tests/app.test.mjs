import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';
import * as lingo from '../dist/lingo.js';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const app = (await readFile(new URL('../dist/app.js', import.meta.url), 'utf8'))
  .replace(/^import .* from '\.\/lingo.js';/, 'const { words, phrases, translate, dailyWord, shuffled, distinctWords, meaningsOverlap, wikipediaSource, wikipediaRows } = window.__lingo;');

function boot(t, { route = 'translate', saved, stats, clipboard, speech, denyStorage = false } = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, { url: `http://localhost/#${route}`, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
  const { window } = dom;
  window.__lingo = lingo;
  window.scrollTo = () => {};
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  if (saved !== undefined) window.localStorage.setItem('gaylingua-saved', typeof saved === 'string' ? saved : JSON.stringify(saved));
  if (stats !== undefined) window.localStorage.setItem('gaylingua-stats', typeof stats === 'string' ? stats : JSON.stringify(stats));
  if (clipboard) Object.defineProperty(window.navigator, 'clipboard', { value: clipboard });
  if (speech) { window.speechSynthesis = speech; window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } }; }
  if (denyStorage) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } });
  t.after(() => { window.close(); assert.deepEqual(errors, [], 'No uncaught DOM errors'); });
  window.eval(app);
  const $ = selector => window.document.querySelector(selector);
  const $$ = selector => [...window.document.querySelectorAll(selector)];
  const click = async selector => { const el = $(selector); assert.ok(el, selector); el.click(); await new Promise(resolve => setImmediate(resolve)); };
  const input = (selector, value) => { $(selector).value = value; $(selector).dispatchEvent(new window.Event('input', { bubbles: true })); };
  const navigate = route => { window.history.replaceState({}, '', `/#${route}`); window.dispatchEvent(new window.HashChangeEvent('hashchange')); };
  const state = key => JSON.parse(window.localStorage.getItem('gaylingua-' + key));
  return { window, $, $$, click, input, navigate, state };
}

test('all routes render, navigation state updates, and unknown routes fall back', t => {
  const a = boot(t);
  for (const route of ['translate', 'dictionary', 'play', 'saved', 'unknown']) {
    a.navigate(route);
    assert.ok(a.$('main h1'));
    assert.equal(a.$$('[aria-current="page"]').length, 2);
    assert.ok(a.$(`[data-page="${route === 'unknown' ? 'translate' : route}"][aria-current="page"]`));
  }
});

test('blank input is rejected and translation controls begin disabled', async t => {
  const a = boot(t);
  assert.equal(a.$('#copy-result').disabled, true);
  assert.equal(a.$('#save-result').disabled, true);
  a.input('#source-text', '   ');
  await a.click('#translate-button');
  assert.match(a.$('#toast').textContent, /something to translate/);
  assert.equal(a.window.document.activeElement.id, 'source-text');
  assert.equal(a.$('#source-text').maxLength, 500);
});

test('phrase examples translate, explain words, and editing clears obsolete output', async t => {
  const a = boot(t);
  await a.click('[data-example="You are beautiful"]');
  assert.match(a.$('.translated-text').textContent, /Bongga/);
  assert.equal(a.$('.result-tag').textContent, 'PHRASE TRANSLATION');
  assert.ok(a.$$('.translation-breakdown button').length >= 3);
  a.input('#source-text', 'New text');
  assert.equal(a.$('.translated-text'), null);
  assert.equal(a.$('#copy-result').disabled, true);
  await a.click('#clear-input');
  assert.equal(a.$('#source-text').value, '');
  assert.equal(a.$('#character-count').textContent.trim(), '0 / 500');
});

test('keyboard shortcut translates and unsupported text cannot be saved', async t => {
  const a = boot(t);
  a.input('#source-text', 'I am hungry');
  a.$('#source-text').dispatchEvent(new a.window.KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
  assert.match(a.$('.translated-text').textContent, /Tom Jones/);
  a.input('#source-text', 'The telescope points at Saturn.');
  await a.click('#translate-button');
  assert.equal(a.$('.result-tag').textContent, 'NO MATCH YET');
  assert.equal(a.$('#save-result').disabled, true);
});

test('translation save state toggles visually, accessibly, and in storage', async t => {
  const a = boot(t);
  await a.click('[data-example="I am tired"]');
  await a.click('#save-result');
  assert.equal(a.$('#save-result').getAttribute('aria-pressed'), 'true');
  assert.equal(a.$('#save-result').classList.contains('saved'), true);
  assert.equal(a.state('saved').length, 1);
  a.navigate('dictionary'); a.navigate('translate');
  assert.equal(a.$('#save-result').getAttribute('aria-pressed'), 'true');
  await a.click('#save-result');
  assert.equal(a.state('saved').length, 0);
  assert.equal(a.$('#save-result').getAttribute('aria-pressed'), 'false');
});

test('saved words disappear immediately when removed from the collection', async t => {
  const a = boot(t, { route: 'dictionary' });
  await a.click('[data-save="bongga"]');
  a.navigate('saved');
  assert.equal(a.$$('.word-card').length, 1);
  await a.click('[data-save="bongga"]');
  assert.equal(a.$$('.word-card').length, 0);
  assert.ok(a.$('.empty-state'));
});

test('saved translations can be filtered, reopened, and removed', async t => {
  const a = boot(t);
  await a.click('[data-example="I am tired"]');
  await a.click('#save-result');
  a.navigate('saved');
  await a.click('[data-collection="word"]');
  assert.equal(a.$$('.word-card').length, 0);
  await a.click('[data-collection="phrase"]');
  assert.equal(a.$$('.word-card').length, 1);
  await a.click('[data-use]');
  a.navigate('translate');
  assert.match(a.$('.translated-text').textContent, /Pagoda/);
  a.navigate('saved');
  await a.click('[data-remove]');
  assert.equal(a.state('saved').length, 0);
});

test('dictionary search supports meanings, source variants, and surrounding spaces', t => {
  const a = boot(t, { route: 'dictionary' });
  assert.equal(a.$$('.word-card').length, lingo.words.length);
  a.input('#dictionary-search', '  tired  ');
  assert.ok(a.$$('.word-card').length >= 1);
  a.input('#dictionary-search', 'Jowabels');
  assert.match(a.$('#dictionary-grid').textContent, /Jowa/);
  a.input('#dictionary-search', 'nyormville');
  assert.match(a.$('#dictionary-grid').textContent, /Nyormville/);
});

test('category filters and empty-search reset work', async t => {
  const a = boot(t, { route: 'dictionary' });
  await a.click('[data-category="People"]');
  assert.ok(a.$$('.word-card').every(card => card.querySelector('.category-label').textContent === 'People'));
  a.input('#dictionary-search', 'zzzzzzzzzz');
  assert.ok(a.$('#reset-search'));
  await a.click('#reset-search');
  assert.equal(a.$$('.word-card').length, lingo.words.length);
  await a.click('[data-category="From Wikipedia"]');
  assert.equal(a.$$('.word-card').length, lingo.words.filter(w => w.sourceRecords.length).length);
});

test('imported word details retain source variants, concepts, origin, and license', async t => {
  const a = boot(t, { route: 'dictionary' });
  await a.click('[data-detail="wiki-shupatembang"]');
  assert.equal(a.$('#info-dialog').open, true);
  assert.match(a.$('#dialog-content').textContent, /Shupated, Jupiter/);
  assert.match(a.$('#dialog-content').textContent, /Kapatíd/);
  assert.match(a.$('#dialog-content').textContent, /CC BY-SA 4.0/);
  assert.equal(a.$('.source-record a').href, lingo.wikipediaSource.permalink);
  await a.click('.dialog-close');
  assert.equal(a.$('#info-dialog').open, false);
});

test('original words can be saved from their detail dialog', async t => {
  const a = boot(t, { route: 'dictionary' });
  await a.click('[data-detail="bongga"]');
  await a.click('#dialog-content [data-save]');
  assert.match(a.$('#dialog-content [data-save]').textContent, /Saved/);
  assert.equal(a.$('#dialog-content [data-save]').getAttribute('aria-pressed'), 'true');
});

test('source modal exposes complete import scope and attribution', async t => {
  const a = boot(t, { route: 'dictionary' });
  await a.click('#sources-button');
  assert.match(a.$('#dialog-content').textContent, /83 vocabulary rows/);
  assert.match(a.$('#dialog-content').textContent, /104 dictionary entries/);
  assert.match(a.$('#dialog-content').textContent, /Wikipedia contributors/);
  assert.match(a.$('#dialog-content').textContent, /CC BY-SA 4.0/);
});

test('dialogs have an accessible title and About does not duplicate library control IDs', async t => {
  const a = boot(t, { route: 'dictionary' });
  await a.click('#about-button');
  assert.equal(a.$('#info-dialog').getAttribute('aria-labelledby'), 'dialog-title');
  assert.ok(a.$('#dialog-title'));
  const ids = a.$$('[id]').map(el => el.id);
  assert.equal(ids.length, new Set(ids).size);
  await a.click('#about-sources-button');
  assert.match(a.$('#dialog-content').textContent, /83 vocabulary rows/);
});

test('a perfect quiz awards 50 XP once and persists the best score', async t => {
  const a = boot(t, { route: 'play' });
  await a.click('[data-game="quiz"]');
  for (let i = 0; i < 5; i++) {
    const word = lingo.words.find(w => w.word === a.$('.quiz-question h2').textContent);
    assert.equal(a.$$('.quiz-options button').length, 4);
    await a.click(`[data-answer="${word.id}"]`);
    assert.equal(a.state('stats').xp, (i + 1) * 10);
    assert.ok(a.$$('.quiz-options button').every(btn => btn.disabled));
    await a.click(`[data-answer="${word.id}"]`);
    assert.equal(a.state('stats').xp, (i + 1) * 10);
    await a.click('#next-question');
  }
  assert.match(a.$('.game-complete').textContent, /5 out of 5/);
  assert.deepEqual(a.state('stats'), { xp: 50, rounds: 1, best: 5 });
  const ids = a.$$('[id]').map(el => el.id);
  assert.equal(ids.length, new Set(ids).size, 'No duplicate IDs on the results screen');
  await a.click('#explore-games');
  assert.ok(a.$('.stats-row'));
});

test('incorrect quiz answers reveal correction without awarding points', async t => {
  const a = boot(t, { route: 'play' });
  await a.click('[data-game="quiz"]');
  for (let i = 0; i < 5; i++) {
    const word = lingo.words.find(w => w.word === a.$('.quiz-question h2').textContent);
    const wrong = a.$$('.quiz-options button').find(btn => btn.dataset.answer !== word.id);
    await a.click(`[data-answer="${wrong.dataset.answer}"]`);
    assert.ok(a.$('.quiz-options .correct'));
    assert.ok(a.$('.answer-feedback.wrong'));
    await a.click('#next-question');
  }
  assert.deepEqual(a.state('stats'), { xp: 0, rounds: 1, best: 0 });
  await a.click('[data-game="quiz"]');
  assert.ok(a.$('.quiz-question'));
});

test('matching rejects premature and wrong choices, then awards 40 XP once', async t => {
  const a = boot(t, { route: 'play' });
  await a.click('[data-game="match"]');
  const pairs = a.$$('[data-match-word]').map(el => el.dataset.matchWord);
  await a.click('[data-match-meaning]');
  assert.match(a.$('#toast').textContent, /Pick a word/);
  await a.click(`[data-match-word="${pairs[0]}"]`);
  await a.click(`[data-match-meaning="${pairs[1]}"]`);
  assert.ok(a.$('.match-tile.incorrect'));
  for (const id of pairs) {
    await a.click(`[data-match-word="${id}"]`);
    await a.click(`[data-match-meaning="${id}"]`);
    if (id !== pairs.at(-1)) assert.equal(a.$(`[data-match-word="${id}"]`).disabled, true);
  }
  assert.match(a.$('.game-complete').textContent, /4 attempts|5 attempts/);
  assert.deepEqual(a.state('stats'), { xp: 40, rounds: 1, best: 0 });
});

test('profile starts a quiz and closes its modal', async t => {
  const a = boot(t, { stats: { xp: 80, rounds: 2, best: 4 } });
  await a.click('#profile-button');
  assert.match(a.$('#dialog-content').textContent, /80 XP/);
  await a.click('#profile-play');
  a.navigate('play');
  assert.equal(a.$('#info-dialog').open, false);
  assert.ok(a.$('.quiz-question'));
});

test('corrupted JSON and invalid storage shapes do not break navigation', t => {
  for (const saved of ['{bad', '[null,17,{}, {"id":"bogus","type":"word"}]']) {
    const a = boot(t, { saved, stats: '{"xp":"oops","rounds":-1,"best":99}' });
    a.navigate('saved'); a.navigate('dictionary'); a.navigate('play');
    assert.ok(a.$('main h1'));
    assert.doesNotMatch(a.$('main').textContent, /NaN|undefined|oops/);
    assert.match(a.$('.xp-badge').textContent, /0 XP/);
  }
});

test('blocked local storage allows use and displays an honest persistence notice', async t => {
  const a = boot(t, { denyStorage: true, route: 'dictionary' });
  await a.click('[data-save="bongga"]');
  assert.match(a.$('#toast').textContent, /Storage is unavailable/);
  a.navigate('saved');
  assert.equal(a.$$('.word-card').length, 1);
});

test('saved state restores after a fresh application instance', async t => {
  const a = boot(t, { route: 'dictionary' });
  await a.click('[data-save="bongga"]');
  const b = boot(t, { route: 'saved', saved: a.state('saved'), stats: { xp: 50, rounds: 1, best: 5 } });
  assert.equal(b.$$('.word-card').length, 1);
  assert.match(b.$('.word-title').textContent, /Bongga/);
  b.navigate('play');
  assert.match(b.$('.xp-badge').textContent, /50 XP/);
});

test('user markup is escaped in translations and saved collections', async t => {
  const a = boot(t);
  const payload = '<img src=x onerror="alert(1)"> hungry';
  a.input('#source-text', payload);
  await a.click('#translate-button');
  assert.equal(a.$('#translation-result img'), null);
  assert.match(a.$('.translated-text').textContent, /<img/);
  await a.click('#save-result');
  a.navigate('saved');
  assert.equal(a.$('.word-card img'), null);
  assert.match(a.$('.word-card h3').textContent, /<img/);
});

test('clipboard success and rejection are handled', async t => {
  let copied;
  const a = boot(t, { clipboard: { async writeText(text) { copied = text; } } });
  await a.click('[data-example="I am tired"]');
  await a.click('#copy-result');
  assert.match(copied, /Pagoda/);
  assert.match(a.$('#toast').textContent, /Copied/);
  const b = boot(t, { clipboard: { async writeText() { throw new Error('Denied'); } } });
  await b.click('[data-example="I am tired"]');
  await b.click('#copy-result');
  assert.match(b.$('#toast').textContent, /Copy unavailable/);
});

test('speech availability and error fallback are handled', async t => {
  const a = boot(t);
  await a.click('[data-example="I am tired"]');
  await a.click('#speak-result');
  assert.match(a.$('#toast').textContent, /isn’t supported/);
  let spoken;
  const b = boot(t, { speech: { cancel() {}, speak(utterance) { spoken = utterance; } } });
  await b.click('[data-example="I am tired"]');
  await b.click('#speak-result');
  assert.equal(spoken.lang, 'fil-PH');
  assert.match(spoken.text, /Pagoda/);
  spoken.onerror();
  assert.match(b.$('#toast').textContent, /unavailable on this device/);
});
