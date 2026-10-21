import { JSDOM } from 'jsdom';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const sourceUrl = 'https://en.wikipedia.org/wiki/Swardspeak';
const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Wikipedia returned ${response.status}; existing data was preserved.`);
const document = new JSDOM(await response.text()).window.document;
const clean = element => {
  const copy = element.cloneNode(true);
  copy.querySelectorAll('sup.reference, .mw-editsection, style, script').forEach(el => el.remove());
  return copy.textContent.replace(/\s+/g, ' ').trim();
};
const tables = [...document.querySelectorAll('table')].filter(table => {
  const headings = [...table.querySelectorAll('th')].map(clean);
  return headings.length === 3 && headings[0] === 'Swardspeak';
});
if (tables.length !== 8) throw new Error('Wikipedia table structure changed; review the importer before replacing data.');
const fold = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[’]/g, "'").trim();
const unique = values => [...new Set(values.map(value => value.trim()).filter(Boolean))];
const overrides = {
  'Jowa': { meaning: 'Spouse / romantic partner', aliases: ['asawa', 'spouse'] },
  'Gora': { meaning: 'Go to a place', aliases: ['go'] },
  'Jotis': { aliases: ['a very small amount', 'small amount', 'jutay'] },
  'Kalurkey': { meaning: 'Maddening / crazy', aliases: ['kaloka'] },
  'Walley': { meaning: 'Nothing / none', aliases: ['wala'] },
  'Career': { meaning: 'Take seriously', aliases: ['take seriously', 'karirin', 'kinareer'] },
  'Kapé': { aliases: ['be realistic', 'realistic'] },
  'G.I. Joe': { meaning: 'Foreign lover, especially American' },
  'Mag-Sharon': { meaning: 'Take home leftovers from parties', aliases: ['take home leftovers', 'leftovers'] },
  'Dramá': { meaning: 'Melodrama / exaggeration', aliases: ['melodrama', 'exaggeration', 'dramatic'] },
  'Carry': { meaning: 'Manageable / carry oneself well', aliases: ['manageable'] },
  'Puñeta': { meaning: 'General profanity', aliases: ['profanity'] },
  'Coño': { meaning: 'Affluent socialite / high society', aliases: ['socialite'] },
  'Watashi': { meaning: 'I / me', aliases: [] },
};
const sensitive = new Set(['Jomba', 'Shunga', 'Jubis', 'Taroosh', 'Nota', 'Pocahontas', 'Hammer', 'Boyband', 'Badinger Z', 'Puñeta', 'Thundercats', 'X-Men', 'G.I. Joe']);
const rows = tables.flatMap((table, tableIndex) => [...table.rows].flatMap((row, rowIndex) => {
  const cells = [...row.cells];
  if (cells.length !== 3 || !cells.every(cell => cell.tagName === 'TD')) return [];
  const label = clean(cells[0]);
  const base = label.split(' (')[0].trim();
  const variants = unique([
    ...base.split(/\s*[/,]\s*/),
    ...(label.match(/variant diminutive:\s*([^)]*)/)?.[1] || '').split('/'),
    ...(label.match(/also spelt\s+([^)]*)/)?.[1] || '').split('/'),
  ]);
  const canonical = variants[0];
  let original = clean(cells[1]);
  // Vocabulary is imported; song lyrics embedded in this derivation are omitted.
  if (canonical === 'Mag-Sharon') original = original.split('. Derived')[0] + '.';
  const parenthetical = label.includes(' (') ? label.slice(label.indexOf(' (') + 2, -1).trim() : '';
  const baseOriginal = original.split(' (')[0].trim();
  const gloss = original.match(/\(([^()]*)\)/)?.[1];
  const originalIsSimple = baseOriginal.length < 40 && !/[.;]|\b(?:derived|description|pun|available|corruption|acronym)\b/i.test(baseOriginal);
  const defaultMeaning = parenthetical && !/^(?:variant |also )/.test(parenthetical) ? parenthetical : (gloss || original);
  const override = overrides[canonical] || {};
  const meaning = override.meaning || defaultMeaning.replace(/^to /i, '').replace(/^['"]|['"]$/g, '');
  // Do not mistake etymologies, celebrity names, or long explanatory prose for translation input.
  const aliases = unique([
    ...variants.flatMap(value => [value.toLowerCase(), fold(value)]),
    ...(originalIsSimple ? baseOriginal.split(/\s*[/,]\s*/).flatMap(value => [value.toLowerCase(), fold(value)]) : []),
    ...(override.aliases || []),
    ...meaning.split(/[,/]/).map(value => value.trim()).filter(value => value.length >= 3 && value.length <= 35 && !/[()\[\]"']/.test(value)),
  ]);
  // English "I"/"me" are pronouns handled by the translator, not global replacements.
  const safeAliases = aliases.filter(value => !['i', 'me', 'to sharon'].includes(value.toLowerCase()));
  const category = sensitive.has(canonical) ? 'Context matters' : tableIndex === 6 ? 'Pop culture' : 'Wikipedia';
  return [{
    rowId: `table-${tableIndex + 1}-row-${rowIndex}`,
    table: tableIndex + 1,
    label,
    word: canonical,
    variants,
    meaning,
    original,
    origin: clean(cells[2]),
    aliases: safeAliases,
    category,
    usageNote: sensitive.has(canonical) ? 'Source-listed expression that can be vulgar, insulting, or stereotyped. Meaning and acceptability depend on context.' : '',
  }];
}));
if (rows.length < 80 || rows.some(row => !row.word || !row.meaning || !row.aliases.length)) throw new Error('Vocabulary extraction is incomplete; existing data was preserved.');
const permalink = new URL(document.querySelector('#t-permalink a')?.getAttribute('href') || sourceUrl, sourceUrl).href;
const source = {
  title: 'Swardspeak', authors: 'Wikipedia contributors', url: sourceUrl, permalink,
  revision: new URL(permalink).searchParams.get('oldid'), importedAt: new Date().toISOString(),
  license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  scope: 'All vocabulary rows in the eight Conventions tables. Parallel nursery-rhyme examples are not word-to-meaning dictionary entries and are not imported.',
  modifications: 'HTML and citation markers removed; variants split; concise display meanings and lookup aliases derived; existing entries merged; the lyric excerpt in the Mag-Sharon derivation omitted. Source labels, source words/concepts, and origins retained.',
  tableCount: tables.length, rowCount: rows.length,
};
const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(path.join(root, 'data'), { recursive: true });
await writeFile(path.join(root, 'data', 'wikipedia-swardspeak.json'), JSON.stringify({ source, rows }, null, 2) + '\n');
await writeFile(path.join(root, 'dist', 'wikipedia-words.js'), '// Adapted from Wikipedia contributors, Swardspeak. CC BY-SA 4.0. See source metadata and ATTRIBUTION.md.\nexport const wikipediaSource = ' + JSON.stringify(source, null, 2) + ';\nexport const wikipediaRows = ' + JSON.stringify(rows, null, 2) + ';\n');
console.log(`Imported ${rows.length} vocabulary rows from ${tables.length} tables; revision ${source.revision}.`);
