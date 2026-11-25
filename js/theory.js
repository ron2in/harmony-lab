/* =========================================================
   1. CHORD DATABASE (ALL TRIADS + ALL 8 SEVENTH CHORDS)
========================================================= */
const NOTE_RU_SHARP = ['До', 'До♯', 'Ре', 'Ре♯', 'Ми', 'Фа', 'Фа♯', 'Соль', 'Соль♯', 'Ля', 'Ля♯', 'Си'];
const NOTE_RU_FLAT  = ['До', 'Ре♭', 'Ре', 'Ми♭', 'Ми', 'Фа', 'Соль♭', 'Соль', 'Ля♭', 'Ля', 'Си♭', 'Си'];
let NOTE_RU = NOTE_RU_SHARP;
let currentAccidentalMode = 'sharp';
const NOTE_RU_GEN = ['До', 'До-диеза', 'Ре', 'Ми-бемоля', 'Ми', 'Фа', 'Соль-бемоля', 'Соль', 'Ля-бемоля', 'Ля', 'Си-бемоля', 'Си'];
const NOTE_LAT = ['C', 'C#/Db', 'D', 'Eb', 'E', 'F', 'F#/Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE_LAT_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_LAT_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const CHORD_DB = [
  // Triads (4)
  { id: 'maj', short: 'Б53', lat: '', name: 'Мажорное трезвучие', group: 'triads', rare: false, is7: false,
    intervals: [0, 4, 7], thirds: 'б3 + м3', invCodes: ['53', '6', '64'] },
  { id: 'min', short: 'М53', lat: 'm', name: 'Минорное трезвучие', group: 'triads', rare: false, is7: false,
    intervals: [0, 3, 7], thirds: 'м3 + б3', invCodes: ['53', '6', '64'] },
  { id: 'dim', short: 'Ум53', lat: 'dim', name: 'Уменьшённое трезвучие', group: 'triads', rare: true, is7: false,
    intervals: [0, 3, 6], thirds: 'м3 + м3', invCodes: ['53', '6', '64'] },
  { id: 'aug', short: 'Ув53', lat: 'aug', name: 'Увеличенное трезвучие', group: 'triads', rare: true, is7: false,
    intervals: [0, 4, 8], thirds: 'б3 + б3', invCodes: ['53', '6', '64'] },

  // 8 Seventh Chords
  { id: 'dom7', short: 'ММ7 (D7)', lat: '7', name: 'Малый мажорный (Доминантсепт)', group: 'sevenths', rare: false, is7: true,
    intervals: [0, 4, 7, 10], thirds: 'Б53 + м7 (б3+м3+м3)', invCodes: ['7', '65', '43', '2'] },
  { id: 'maj7', short: 'БМ7 (maj7)', lat: 'maj7', name: 'Большой мажорный септаккорд', group: 'sevenths', rare: false, is7: true,
    intervals: [0, 4, 7, 11], thirds: 'Б53 + б7 (б3+м3+б3)', invCodes: ['7', '65', '43', '2'] },
  { id: 'min7', short: 'Мм7 (m7)', lat: 'm7', name: 'Малый минорный септаккорд', group: 'sevenths', rare: false, is7: true,
    intervals: [0, 3, 7, 10], thirds: 'М53 + м7 (м3+б3+м3)', invCodes: ['7', '65', '43', '2'] },
  { id: 'mmaj7', short: 'Бм7 (mMaj7)', lat: 'mMaj7', name: 'Большой минорный септаккорд', group: 'sevenths', rare: true, is7: true,
    intervals: [0, 3, 7, 11], thirds: 'М53 + б7 (м3+б3+б3)', invCodes: ['7', '65', '43', '2'] },
  { id: 'm7b5', short: 'Мум7 (m7b5)', lat: 'm7b5', name: 'Малый уменьшённый (Полуум.)', group: 'sevenths', rare: true, is7: true,
    intervals: [0, 3, 6, 10], thirds: 'Ум53 + м7 (м3+м3+б3)', invCodes: ['7', '65', '43', '2'] },
  { id: 'dim7', short: 'Ум7 (dim7)', lat: 'dim7', name: 'Уменьшённый септаккорд', group: 'sevenths', rare: true, is7: true,
    intervals: [0, 3, 6, 9], thirds: 'Ум53 + ум7 (м3+м3+м3)', invCodes: ['7', '65', '43', '2'] },
  { id: 'augmaj7', short: 'БУв7 (augMaj7)', lat: 'augMaj7', name: 'Большой увеличенный септаккорд', group: 'sevenths', rare: true, is7: true,
    intervals: [0, 4, 8, 11], thirds: 'Ув53 + б7 (б3+б3+м3)', invCodes: ['7', '65', '43', '2'] },
  { id: 'aug7', short: 'МУв7 (aug7)', lat: 'aug7', name: 'Малый увеличенный септаккорд', group: 'sevenths', rare: true, is7: true,
    intervals: [0, 4, 8, 10], thirds: 'Ув53 + м7 (б3+б3+б2)', invCodes: ['7', '65', '43', '2'] }
];

const INV_NAMES = {
  '53': 'Основное положение (5/3)', '6': 'Секстаккорд (6)', '64': 'Квартсекстаккорд (6/4)',
  '7': 'Основное положение (7)', '65': 'Квинтсекстаккорд (6/5)', '43': 'Терцквартаккорд (4/3)', '2': 'Секундаккорд (2)'
};

const TONE_ROLES = ['основной тон (прима)', 'терция аккорда', 'квинта аккорда', 'септима аккорда'];

const INTERVALS_DB = [
  { id: 'ch1',  short: 'ч1',  name: 'Чистая прима',       semi: 0,  basic: true,  hint: 'одна и та же нота (унисон)' },
  { id: 'm2',   short: 'м2',  name: 'Малая секунда',      semi: 1,  basic: true,  hint: 'резкая, тема «Челюстей»' },
  { id: 'b2',   short: 'б2',  name: 'Большая секунда',    semi: 2,  basic: true,  hint: 'обычный шаг гаммы' },
  { id: 'm3',   short: 'м3',  name: 'Малая терция',       semi: 3,  basic: true,  hint: 'грустная, минорная' },
  { id: 'b3',   short: 'б3',  name: 'Большая терция',     semi: 4,  basic: true,  hint: 'светлая, мажорная' },
  { id: 'ch4',  short: 'ч4',  name: 'Чистая кварта',      semi: 5,  basic: true,  hint: 'торжественный гимн / марш' },
  { id: 'trit', short: 'тритон', name: 'Тритон (ув4/ум5)', semi: 6, basic: false, hint: 'острый, напряжённый' },
  { id: 'ch5',  short: 'ч5',  name: 'Чистая квинта',      semi: 7,  basic: true,  hint: 'пустая, «Звёздные войны»' },
  { id: 'm6',   short: 'м6',  name: 'Малая секста',       semi: 8,  basic: false, hint: 'лирическая, грустная' },
  { id: 'b6',   short: 'б6',  name: 'Большая секста',     semi: 9,  basic: false, hint: 'широкая, «В лесу родилась ёлочка»' },
  { id: 'm7',   short: 'м7',  name: 'Малая септима',      semi: 10, basic: false, hint: 'блюзовая, неустойчивая' },
  { id: 'b7',   short: 'б7',  name: 'Большая септима',    semi: 11, basic: false, hint: 'острая, джазовая' },
  { id: 'ch8',  short: 'ч8',  name: 'Чистая октава',      semi: 12, basic: true,  hint: 'та же нота на октаву выше' }
];

function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function midiToRu(m, mode = currentAccidentalMode) {
  const tbl = mode === 'flat' ? NOTE_RU_FLAT : NOTE_RU_SHARP;
  return tbl[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
}
function midiToRuNoOct(m, mode = currentAccidentalMode) {
  const tbl = mode === 'flat' ? NOTE_RU_FLAT : NOTE_RU_SHARP;
  return tbl[((m % 12) + 12) % 12];
}

function buildInversionNotes(rootMidi, intervals, invIdx) {
  const notes = intervals.map(iv => rootMidi + iv);
  for (let i = 0; i < invIdx; i++) notes[i] += 12;
  notes.sort((a, b) => a - b);
  while (notes[notes.length - 1] > 83) for (let i = 0; i < notes.length; i++) notes[i] -= 12;
  while (notes[0] < 48) for (let i = 0; i < notes.length; i++) notes[i] += 12;
  return notes;
}
