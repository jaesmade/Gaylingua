import { wikipediaSource, wikipediaRows } from './wikipedia-words.js';
export { wikipediaSource, wikipediaRows };
// Curated learning vocabulary. Meanings and usage vary by speaker and community.
export const curatedWords = [
  {id:'bongga',word:'Bongga',meaning:'Fabulous / impressive',filipino:'Maganda / kahanga-hanga',category:'Expressions',emoji:'✨',example:'Bongga ng outfit mo, beshie!',note:'An enthusiastic compliment for something impressive or fabulous.',aliases:['fabulous','impressive','amazing','awesome','kahanga-hanga','bongga']},
  {id:'charot',word:'Charot',meaning:'Just kidding',filipino:'Biro lang',category:'Expressions',emoji:'🤭',example:'Ako na ang next superstar. Charot!',note:'Softens a joke or playful exaggeration. Context and tone still matter.',aliases:['just kidding','only joking','joke lang','biro lang','charot']},
  {id:'beshie',word:'Beshie',meaning:'Best friend / close friend',filipino:'Matalik na kaibigan',category:'People',emoji:'💞',example:'Beshie, may chika ako!',note:'An affectionate way to address a close friend.',aliases:['best friend','close friend','friend','kaibigan','beshie']},
  {id:'chika',word:'Chika',meaning:'Gossip / conversation',filipino:'Kuwento / usapan',category:'Everyday',emoji:'💬',example:'Ano ang latest chika?',note:'A chat, a story, or the latest gossip, depending on context.',aliases:['gossip','conversation','story','kuwento','kwento','usapan','chismis','chika']},
  {id:'jowa',word:'Jowa',meaning:'Romantic partner',filipino:'Kasintahan',category:'People',emoji:'💘',example:'Kasama ko ang jowa ko.',note:'A gender-neutral, informal word for a romantic partner.',aliases:['romantic partner','boyfriend','girlfriend','partner','kasintahan','nobyo','nobya','jowa']},
  {id:'lafang',word:'Lafang',meaning:'Eat / eating',filipino:'Kain',category:'Everyday',emoji:'🍜',example:'Tara, lafang na!',note:'A playful word for eating, especially with friends.',aliases:['eating','eat','food','kumain','kakain','kain','pagkain','lafang']},
  {id:'gora',word:'Gora',meaning:'Go / let’s go',filipino:'Tara / sige',category:'Everyday',emoji:'🛼',example:'Gora na tayo, beshie!',note:'Signals enthusiasm to go somewhere or try something.',aliases:["let's go",'lets go','let’s go','go ahead','tara na','tara','sige','gora']},
  {id:'pagoda',word:'Pagoda',meaning:'Tired / exhausted',filipino:'Pagod',category:'Feelings',emoji:'🫠',example:'Pagoda na ako after work.',note:'A playful extension of the Filipino word pagod.',aliases:['exhausted','tired','pagod na','pagod','pagoda']},
  {id:'keri',word:'Keri',meaning:'Manageable / can do',filipino:'Kaya / ayos lang',category:'Expressions',emoji:'👌',example:'Keri lang, beshie. Kaya natin ’to!',note:'From “carry”; expresses that something is manageable or okay.',aliases:['manageable','can do','it is okay',"it's okay",'okay','kaya','ayos lang','keri']},
  {id:'shokot',word:'Shokot',meaning:'Scared',filipino:'Takot',category:'Feelings',emoji:'🫣',example:'Shokot ako sa horror movies!',note:'A playful expression of fear or nervousness.',aliases:['scared','afraid','natatakot','takot','shokot']},
  {id:'awra',word:'Awra',meaning:'Show off your look',filipino:'Porma / pagpapaganda',category:'Expressions',emoji:'💅',example:'Awra muna bago umalis!',note:'Often used when posing, dressing up, or showing confidence.',aliases:['show off your look','dress up','posing','porma','awra']},
  {id:'pakak',word:'Pakak',meaning:'Fierce / striking',filipino:'Lutang / kapansin-pansin',category:'Expressions',emoji:'⚡',example:'Pakak ang look mo today!',note:'A lively compliment for an impactful look or performance.',aliases:['fierce','striking','pakak']},
  {id:'waley',word:'Waley',meaning:'None / nothing',filipino:'Wala',category:'Everyday',emoji:'🫥',example:'Waley na akong budget.',note:'Can refer to absence, or a joke that did not land.',aliases:['nothing','none','wala','waley']},
  {id:'sinetch',word:'Sinetch',meaning:'Who',filipino:'Sino',category:'Everyday',emoji:'👀',example:'Sinetch ang kasama mo?',note:'A playful way to ask who someone is.',aliases:['who','sino','sinetch']},
  {id:'mudra',word:'Mudra',meaning:'Mother',filipino:'Nanay / ina',category:'People',emoji:'🌷',example:'Kasama ko si mudra sa mall.',note:'An affectionate informal term for mother.',aliases:['mother','mom','mum','nanay','ina','mudra']},
  {id:'pudra',word:'Pudra',meaning:'Father',filipino:'Tatay / ama',category:'People',emoji:'🧢',example:'Si pudra ang nagluto today.',note:'An informal counterpart to mudra.',aliases:['father','dad','tatay','ama','pudra']},
  {id:'borlog',word:'Borlog',meaning:'Sleep / asleep',filipino:'Tulog',category:'Everyday',emoji:'💤',example:'Borlog na ako, beshie. Good night!',note:'Used casually for sleep or going to bed.',aliases:['sleeping','asleep','sleep','matulog','tulog','borlog']},
  {id:'tom-jones',word:'Tom Jones',meaning:'Hungry',filipino:'Gutom',category:'Feelings',emoji:'🍔',example:'Tom Jones na ako. Lafang na tayo!',note:'Celebrity-name wordplay associated with gutom.',aliases:['hungry','gutom','tom jones']},
  {id:'shala',word:'Shala',meaning:'Fancy / classy',filipino:'Sosyal',category:'Expressions',emoji:'🥂',example:'Ang shala naman ng place!',note:'A playful take on sosyal, for something fancy.',aliases:['fancy','classy','sosyal','shala']},
  {id:'hanash',word:'Hanash',meaning:'Commentary / fuss',filipino:'Sinasabi / reklamo',category:'Expressions',emoji:'🎤',example:'Ang dami mong hanash, beshie!',note:'Can mean commentary, talk, or fuss; may sound teasing or dismissive.',aliases:['commentary','fuss','reklamo','hanash']},
  {id:'bet',word:'Bet',meaning:'Like / want',filipino:'Gusto',category:'Feelings',emoji:'💖',example:'Bet ko ang outfit mo!',note:'Expresses liking or wanting something.',aliases:['like','want','gusto','bet']},
  {id:'baboosh',word:'Baboosh',meaning:'Goodbye',filipino:'Paalam',category:'Everyday',emoji:'👋',example:'Baboosh, beshie! See you bukas.',note:'A cheerful, informal farewell.',aliases:['goodbye','bye','paalam','baboosh']},
  {id:'aketch',word:'Aketch',meaning:'I / me',filipino:'Ako',category:'People',emoji:'🪞',example:'Aketch na ang bahala!',note:'One of several playful variants of ako.',aliases:['ako','aketch']},
  {id:'kalerki',word:'Kalerki',meaning:'Overwhelming / unbelievable',filipino:'Nakakaloka',category:'Feelings',emoji:'🤯',example:'Kalerki ang traffic today!',note:'An expressive reaction to something surprising or overwhelming.',aliases:['overwhelming','unbelievable','nakakaloka','kalerki']},
  {id:'krayola',word:'Krayola',meaning:'Cry / crying',filipino:'Iyak',category:'Feelings',emoji:'🥲',example:'Krayola ako sa ending ng movie.',note:'Wordplay on “cry,” used for crying or feeling emotional.',aliases:['crying','cry','umiiyak','iyak','krayola']},
  {id:'kabog',word:'Kabog',meaning:'Outstanding / outshining',filipino:'Angat / panalo',category:'Expressions',emoji:'🌟',example:'Kabog ang performance mo!',note:'Praise for something that stands out or surpasses expectations.',aliases:['outstanding','outshining','angat','panalo','kabog']},
  {id:'warla',word:'Warla',meaning:'Fight / argument',filipino:'Away',category:'Everyday',emoji:'🗯️',example:'Walang warla, good vibes lang!',note:'A playful term for a conflict or argument.',aliases:['argument','fight','away','warla']},
  {id:'murayta',word:'Murayta',meaning:'Cheap / inexpensive',filipino:'Mura',category:'Everyday',emoji:'🛍️',example:'Murayta pero bongga!',note:'Used for something inexpensive, often a bargain.',aliases:['inexpensive','cheap','mura','murayta']},
  {id:'junakis',word:'Junakis',meaning:'Child / children',filipino:'Anak',category:'People',emoji:'🧸',example:'Kasama ni mudra ang junakis.',note:'An affectionate, playful form of anak.',aliases:['children','child','anak','junakis']},
  {id:'ganern',word:'Ganern',meaning:'Like that',filipino:'Ganoon / ganyan',category:'Expressions',emoji:'🫰',example:'Pak, ganern! Ang bongga!',note:'An expressive variant of ganoon or ganyan.',aliases:['like that','ganoon','ganun','ganyan','ganern']},
];
const folded = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[’]/g, "'").trim();
export const words = curatedWords.map(word => ({ ...word, aliases: [...word.aliases], sourceRecords: [] }));
for (const row of wikipediaRows) {
  const existing = words.find(word => [word.word, ...word.aliases].some(alias => row.variants.some(variant => folded(alias) === folded(variant))));
  if (existing) {
    existing.aliases = [...new Set([...existing.aliases, ...row.aliases].map(alias => alias.toLowerCase()))];
    existing.sourceRecords.push(row);
  } else {
    words.push({
      id: 'wiki-' + folded(row.word).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      word: row.word, meaning: row.meaning, filipino: row.original, original: row.original,
      category: row.category, emoji: row.table === 7 ? '🎬' : '📖', example: null,
      note: row.usageNote || 'Imported from Wikipedia. This is a source-listed meaning, not a claim that the expression is current or universal.',
      aliases: row.aliases.map(alias => alias.toLowerCase()), sourceRecords: [row],
    });
  }
}
export function meaningsOverlap(a, b) {
  const parts = word => word.meaning.split(/[,/]/).map(part => folded(part).replace(/^to /, '').replace(/[.!]$/g, ''));
  return parts(a).some(part => parts(b).includes(part));
}
export function distinctWords(pool, count) {
  const selected = [];
  for (const word of shuffled(pool)) {
    if (!selected.some(other => other.id === word.id || meaningsOverlap(other, word))) selected.push(word);
    if (selected.length === count) break;
  }
  return selected;
}
export const phrases = [
  {inputs:['hello','hi','kumusta','kamusta','hello friend','hi friend','kumusta ka','how are you','how are you?'],output:'Hello, beshie! Kumusta ang awra?',ids:['beshie','awra']},
  {inputs:["let's eat",'lets eat','let’s eat','tara kain','tara kain na','kain na tayo','let us eat'],output:'Gora na, lafang tayo, beshie!',ids:['gora','lafang','beshie']},
  {inputs:['i am tired',"i'm tired",'im tired','pagod na ako','pagod ako'],output:'Pagoda na ang aketch, beshie!',ids:['pagoda','aketch','beshie']},
  {inputs:['you are beautiful',"you're beautiful",'ang ganda mo','ganda mo','you look amazing','you look beautiful'],output:'Bongga ng awra mo, beshie! Pakak!',ids:['bongga','awra','beshie','pakak']},
  {inputs:['what is the gossip',"what's the gossip",'ano ang chismis','anong chika','tell me the gossip','what is the story'],output:'Beshie, ano ang latest chika?',ids:['beshie','chika']},
  {inputs:['i am hungry',"i'm hungry",'im hungry','gutom na ako','gutom ako'],output:'Tom Jones na ang aketch! Lafang na!',ids:['tom-jones','aketch','lafang']},
  {inputs:['i like your outfit','gusto ko ang damit mo','ang ganda ng outfit mo','i love your outfit'],output:'Bet ko ang awra mo, beshie. Bongga!',ids:['bet','awra','beshie','bongga']},
  {inputs:['just kidding','joke lang','biro lang'],output:'Charot lang, beshie!',ids:['charot','beshie']},
  {inputs:['goodbye','bye','paalam'],output:'Baboosh, beshie! Till the next chika!',ids:['baboosh','beshie','chika']},
  {inputs:['i can do this','kaya ko ito','kaya ko to','kaya ko ’to'],output:'Keri ’to ng aketch!',ids:['keri','aketch']},
  {inputs:['i am scared',"i'm scared",'takot ako','natatakot ako'],output:'Shokot ang aketch, beshie!',ids:['shokot','aketch','beshie']},
  {inputs:["let's go",'lets go','let’s go','tara na','tara'],output:'Gora na, beshie!',ids:['gora','beshie']}
];
const normalize = text => text.toLowerCase().replace(/[’]/g,"'").replace(/[!?.,]+$/g,'').replace(/\s+/g,' ').trim();
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const aliasMap = words.flatMap(word => word.aliases.map(alias => ({alias, word}))).sort((a,b) => b.alias.length-a.alias.length);
export function translate(input, language = 'auto') {
  const cleaned = input.trim();
  if (!cleaned) return {text:'',matches:[],kind:'empty'};
  const phrase = phrases.find(item => item.inputs.some(value => normalize(value) === normalize(cleaned)));
  if (phrase) return {text:phrase.output,matches:phrase.ids.map(id=>words.find(w=>w.id===id)),kind:'phrase'};
  const matches = [];
  // One pass over the original text prevents replacement text being re-translated.
  const pattern = new RegExp('(?<![\\p{L}\\p{N}_])(' + aliasMap.map(x=>escapeRegex(x.alias)).join('|') + ')(?![\\p{L}\\p{N}_])','giu');
  let output = cleaned.replace(pattern, token => {
    const entry = aliasMap.find(item=>item.alias.toLowerCase()===token.toLowerCase());
    if (!entry) return token;
    if (!matches.some(w=>w.id===entry.word.id)) matches.push(entry.word);
    return entry.word.word;
  });
  // English pronouns are only changed for an English or automatic source.
  if (language !== 'filipino' && matches.length && /\b(?:i|me)\b/i.test(output)) {
    output = output.replace(/\b(?:i|me)\b/gi,'aketch');
    if(!matches.some(w=>w.id==='aketch')) matches.push(words.find(w=>w.id==='aketch'));
  }
  return {text:output,matches,kind:matches.length?'words':'unmatched'};
}
export function dailyWord(date = new Date()) {
  const day = [date.getFullYear(), date.getMonth()+1,date.getDate()].join('-');
  let hash=0; for(const char of day) hash=(hash*31+char.charCodeAt(0))>>>0;
  return words[hash%words.length];
}
export function shuffled(items) { return items.map(value=>({value,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(x=>x.value); }
