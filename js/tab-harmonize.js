/* =========================================================
   9. TAB 5: 4-PART MELODY HARMONIZATION TRAINER
========================================================= */
const H_LEVEL_PRESETS = {
  1: {
    name: 'Уровень 1 — Базовый (1–2 курс)',
    bars: 4, maxAccidentals: 2, spacing: 'tight',
    chkK64: true, chkPass64: false, chkD7Inv: false, chkDeceptive: false, chkDD: false, chkSusp: false,
    allowedChords: ['T', 'S', 'D', 'K64'],
    keys: [{ root: 0, mode: 'major', name: 'До мажор' }, { root: 7, mode: 'major', name: 'Соль мажор' }, { root: 5, mode: 'major', name: 'Фа мажор' }, { root: 9, mode: 'minor', name: 'Ля минор' }]
  },
  2: {
    name: 'Уровень 2 — Средний (2–3 курс)',
    bars: 4, maxAccidentals: 4, spacing: 'change',
    chkK64: true, chkPass64: true, chkD7Inv: true, chkDeceptive: false, chkDD: false, chkSusp: false,
    allowedChords: ['T', 'T6', 'T64', 'S', 'S6', 'S64', 'D', 'D6', 'D64', 'K64', 'D7', 'D65', 'D43', 'D2', 'II7', 'II65', 'VI'],
    keys: [{ root: 2, mode: 'major', name: 'Ре мажор' }, { root: 10, mode: 'major', name: 'Си-бемоль мажор' }, { root: 4, mode: 'minor', name: 'Ми минор' }, { root: 9, mode: 'major', name: 'Ля мажор' }]
  },
  3: {
    name: 'Уровень 3 — Продвинутый (3–4 курс)',
    bars: 8, maxAccidentals: 5, spacing: 'mixed',
    chkK64: true, chkPass64: true, chkD7Inv: true, chkDeceptive: true, chkDD: true, chkSusp: false,
    allowedChords: ['T', 'T6', 'T64', 'S', 'S6', 'S64', 'D', 'D6', 'D64', 'K64', 'D7', 'D65', 'D43', 'D2', 'II7', 'II65', 'VI', 'III', 'VII7', 'DD7', 'D->S', 'D->VI'],
    keys: [{ root: 0, mode: 'major', name: 'До мажор' }, { root: 7, mode: 'major', name: 'Соль мажор' }, { root: 2, mode: 'minor', name: 'Ре минор' }, { root: 4, mode: 'major', name: 'Ми мажор' }]
  },
  4: {
    name: 'Уровень 4 — Эксперт (Вуз)',
    bars: 8, maxAccidentals: 6, spacing: 'mixed',
    chkK64: true, chkPass64: true, chkD7Inv: true, chkDeceptive: true, chkDD: true, chkSusp: true,
    allowedChords: ['T', 'T6', 'T64', 'S', 'S6', 'S64', 'D', 'D6', 'D64', 'K64', 'D7', 'D65', 'D43', 'D2', 'II7', 'II65', 'VI', 'III', 'VII7', 'DD7', 'D->S', 'D->VI', 'N6', 'It+6', 'Fr+6', 'Ger+6'],
    keys: [{ root: 0, mode: 'minor', name: 'До минор' }, { root: 3, mode: 'major', name: 'Ми-бемоль мажор' }, { root: 9, mode: 'major', name: 'Ля мажор' }, { root: 6, mode: 'minor', name: 'Фа-диез минор' }]
  }
};

const H_CHORD_CATALOG = {
  'T':     { label: 'T (I 5/3)', iv: [0,4,7], minIv: [0,3,7], bassDeg: 0, rootOff: 0 },
  'T6':    { label: 'T6', iv: [0,4,7], minIv: [0,3,7], bassDeg: 1, rootOff: 0 },
  'T64':   { label: 'T64', iv: [0,4,7], minIv: [0,3,7], bassDeg: 2, rootOff: 0 },
  'S':     { label: 'S (IV 5/3)', iv: [0,4,7], minIv: [0,3,7], bassDeg: 0, rootOff: 5 },
  'S6':    { label: 'S6', iv: [0,4,7], minIv: [0,3,7], bassDeg: 1, rootOff: 5 },
  'S64':   { label: 'S64 (вспом.)', iv: [0,4,7], minIv: [0,3,7], bassDeg: 2, rootOff: 5 },
  'D':     { label: 'D (V 5/3)', iv: [0,4,7], minIv: [0,4,7], bassDeg: 0, rootOff: 7 },
  'D6':    { label: 'D6', iv: [0,4,7], minIv: [0,4,7], bassDeg: 1, rootOff: 7 },
  'D64':   { label: 'D64 (прох.)', iv: [0,4,7], minIv: [0,4,7], bassDeg: 2, rootOff: 7 },
  'K64':   { label: 'K64 (каданс)', iv: [0,4,7], minIv: [0,3,7], bassDeg: 2, rootOff: 0 },
  'D7':    { label: 'D7', iv: [0,4,7,10], minIv: [0,4,7,10], bassDeg: 0, rootOff: 7 },
  'D65':   { label: 'D65', iv: [0,4,7,10], minIv: [0,4,7,10], bassDeg: 1, rootOff: 7 },
  'D43':   { label: 'D43', iv: [0,4,7,10], minIv: [0,4,7,10], bassDeg: 2, rootOff: 7 },
  'D2':    { label: 'D2', iv: [0,4,7,10], minIv: [0,4,7,10], bassDeg: 3, rootOff: 7 },
  'II7':   { label: 'II7', iv: [0,3,7,10], minIv: [0,3,6,10], bassDeg: 0, rootOff: 2 },
  'II65':  { label: 'II65', iv: [0,3,7,10], minIv: [0,3,6,10], bassDeg: 1, rootOff: 2 },
  'VI':    { label: 'VI (прерв.)', iv: [0,3,7], minIv: [0,4,7], bassDeg: 0, rootOff: 9, minRootOff: 8 },
  'III':   { label: 'III', iv: [0,3,7], minIv: [0,4,7], bassDeg: 0, rootOff: 4, minRootOff: 3 },
  'VII7':  { label: 'УмVII7', iv: [0,3,6,9], minIv: [0,3,6,9], bassDeg: 0, rootOff: 11 },
  'DD7':   { label: 'DD7 (откл.)', iv: [0,4,7,10], minIv: [0,4,7,10], bassDeg: 0, rootOff: 2 },
  'D->S':  { label: 'D7 → S', iv: [0,4,7,10], minIv: [0,4,7,10], bassDeg: 0, rootOff: 0 },
  'D->VI': { label: 'D7 → VI', iv: [0,4,7,10], minIv: [0,4,7,10], bassDeg: 0, rootOff: 4 },
  'N6':    { label: 'N6 (неапол.)', iv: [0,4,7], minIv: [0,4,7], bassDeg: 1, rootOff: 1 },
  'It+6':  { label: 'It+6', iv: [0,4,10], minIv: [0,4,10], bassDeg: 0, rootOff: 8 },
  'Fr+6':  { label: 'Fr+6', iv: [0,4,6,10], minIv: [0,4,6,10], bassDeg: 0, rootOff: 8 },
  'Ger+6': { label: 'Ger+6', iv: [0,4,7,10], minIv: [0,4,7,10], bassDeg: 0, rootOff: 8 }
};

const hState = {
  level: 1,
  taskType: 'melody', // 'melody' | 'bass'
  key: { root: 0, mode: 'major', name: 'До мажор' },
  steps: [], // [{ bar, beat, soprano, bass, figuredBass, chordId, spacing, voices:[S,A,T,B], isSusp, hint }]
  playingIdx: -1,
  kbdStepIdx: -1,
  kbdBuffer: []
};

function getFiguredBassLabel(chordId, keyObj) {
  const figMap = {
    'T': '5/3', 'S': '5/3', 'D': '5/3', 'VI': '5/3', 'III': '5/3',
    'T6': '6', 'S6': '6', 'D6': '6', 'N6': '6',
    'T64': '6/4', 'S64': '6/4', 'D64': '6/4', 'K64': '6/4',
    'D7': '7', 'II7': '7', 'VII7': '7', 'DD7': '7', 'D->S': '7', 'D->VI': '7',
    'D65': '6/5', 'II65': '6/5',
    'D43': '4/3', 'D2': '2'
  };
  let fig = figMap[chordId] || '5/3';
  if (keyObj.mode === 'minor' && ['D', 'D6', 'D64'].includes(chordId)) {
    fig += ' (♯)';
  }
  return fig;
}

function autoVoiceFromBass(bassMidi, chordId, spacing, keyObj) {
  const spec = getChordSpec(chordId, keyObj);
  const tones = [];
  for (let m = Math.max(48, bassMidi + 3); m <= 79; m++) {
    if (spec.pcs.includes(m % 12)) tones.push(m);
  }
  if (tones.length < 3) return [72, 67, 64, bassMidi];
  let tenor, alto, soprano;
  if (spacing === 'tight') {
    tenor = tones.find(m => m >= 53) || tones[0];
    const tIdx = tones.indexOf(tenor);
    alto = tones[Math.min(tones.length - 1, tIdx + 1)];
    soprano = tones[Math.min(tones.length - 1, tIdx + 2)];
  } else {
    tenor = tones.find(m => m >= 52) || tones[0];
    const tIdx = tones.indexOf(tenor);
    alto = tones[Math.min(tones.length - 1, tIdx + 2)];
    soprano = tones[Math.min(tones.length - 1, tIdx + 4)];
  }
  return [soprano, alto, tenor, bassMidi];
}

function getChordSpec(chordId, keyObj) {
  const def = H_CHORD_CATALOG[chordId] || H_CHORD_CATALOG['T'];
  const isMin = keyObj.mode === 'minor';
  const off = (isMin && def.minRootOff !== undefined) ? def.minRootOff : def.rootOff;
  const rootPc = (keyObj.root + off) % 12;
  const iv = isMin ? def.minIv : def.iv;
  return { ...def, rootPc, iv, pcs: iv.map(x => (rootPc + x) % 12) };
}

function autoVoiceStep(soprano, chordId, spacing, keyObj) {
  const spec = getChordSpec(chordId, keyObj);
  const bassPc = spec.pcs[spec.bassDeg] !== undefined ? spec.pcs[spec.bassDeg] : spec.pcs[0];
  // Place bass in C3..E4 (45..57)
  let bass = 48 + bassPc;
  if (bass > 55) bass -= 12;
  if (bass < 43) bass += 12;

  const sPc = soprano % 12;
  // Pick alto & tenor below soprano according to spacing
  const allTones = [];
  for (let m = 48; m < soprano; m++) {
    if (spec.pcs.includes(m % 12)) allTones.push(m);
  }

  let alto = soprano - 4;
  let tenor = soprano - 9;

  if (allTones.length >= 2) {
    if (spacing === 'tight') {
      // Closest chord tones below soprano
      const belowS = allTones.filter(m => m < soprano && soprano - m <= 6);
      alto = belowS.length ? belowS[belowS.length - 1] : allTones[allTones.length - 1];
      const belowA = allTones.filter(m => m < alto && alto - m <= 6);
      tenor = belowA.length ? belowA[belowA.length - 1] : Math.max(48, alto - 4);
    } else {
      // Wide or mixed: skip a chord tone
      const belowS = allTones.filter(m => soprano - m >= 5 && soprano - m <= 10);
      alto = belowS.length ? belowS[belowS.length - 1] : Math.max(52, soprano - 6);
      const belowA = allTones.filter(m => alto - m >= 5 && alto - m <= 10);
      tenor = belowA.length ? belowA[belowA.length - 1] : Math.max(48, alto - 6);
    }
  }
  if (tenor <= bass) bass -= 12;
  if (bass < 40) bass += 12;
  return [soprano, alto, tenor, bass];
}

function applyLevelPreset(lvl) {
  hState.level = lvl;
  const p = H_LEVEL_PRESETS[lvl];
  document.querySelectorAll('#hLevelGrid .level-card').forEach(c => c.classList.toggle('active', Number(c.dataset.lvl) === lvl));
  document.getElementById('hSpacingRule').value = p.spacing;
  document.getElementById('chkK64').checked = p.chkK64;
  document.getElementById('chkPass64').checked = p.chkPass64;
  document.getElementById('chkD7Inv').checked = p.chkD7Inv;
  document.getElementById('chkDeceptive').checked = p.chkDeceptive;
  document.getElementById('chkDD').checked = p.chkDD;
  document.getElementById('chkSusp').checked = p.chkSusp;
  generateHarmonizeTask();
}

function generateHarmonizeTask() {
  const preset = H_LEVEL_PRESETS[hState.level];
  const key = preset.keys[Math.floor(Math.random() * preset.keys.length)];
  hState.key = key;
  const isMin = key.mode === 'minor';
  const base = 60 + key.root; // C4..B4
  const sc = isMin ? [0,2,3,5,7,8,11,12] : [0,2,4,5,7,9,11,12];

  const needK64 = document.getElementById('chkK64').checked;
  const needPass64 = document.getElementById('chkPass64').checked;
  const needD7Inv = document.getElementById('chkD7Inv').checked;
  const needDec = document.getElementById('chkDeceptive').checked;
  const needDD = document.getElementById('chkDD').checked;
  const needSusp = document.getElementById('chkSusp').checked;
  const spacingRule = document.getElementById('hSpacingRule').value;
  const initSpacing = spacingRule === 'wide' ? 'wide' : 'tight';

  const allowed = preset.allowedChords;
  const domCadChord = allowed.includes('D7') ? 'D7' : 'D';

  // Build adaptive melody (8 steps = 4 bars x 2 chords, or 16 steps for 8 bars)
  // Avoid consecutive root-in-soprano on root-position chords to prevent parallel S-B octaves
  const totalBars = preset.bars;
  const melVariant = Math.random() < 0.5 ? 'A' : 'B';
  let plan = melVariant === 'A'
    ? [
        { deg: 2, hint: 'T', susp: false }, // III (E)
        { deg: 3, hint: 'S', susp: false }, // IV (F)
        { deg: 1, hint: 'D', susp: false }, // II (D)
        { deg: 2, hint: 'T', susp: false }, // III (E)
        { deg: needK64 ? 4 : 5, hint: needK64 ? 'K64' : 'S', susp: false }, // V or VI
        { deg: domCadChord === 'D7' ? 6 : 1, hint: domCadChord, susp: false }, // VII or II
        { deg: 0, hint: 'T', susp: false }, // I (C)
        { deg: 0, hint: 'T', susp: false }
      ]
    : [
        { deg: 4, hint: 'T', susp: false }, // V (G)
        { deg: 5, hint: 'S', susp: false }, // VI (A)
        { deg: 4, hint: 'D', susp: false }, // V (G)
        { deg: 2, hint: 'T', susp: false }, // III (E)
        { deg: needK64 ? 4 : 3, hint: needK64 ? 'K64' : 'S', susp: false }, // V or IV
        { deg: domCadChord === 'D7' ? 3 : 1, hint: domCadChord, susp: false }, // IV or II
        { deg: 2, hint: 'T', susp: false }, // III (E)
        { deg: 0, hint: 'T', susp: false }  // I (C)
      ];

  if (needPass64) {
    // Bar 1-2: contrary motion T(V) -> D43(IV) -> T6(III)
    plan[0] = { deg: 4, hint: 'T', susp: false };
    plan[1] = { deg: 3, hint: 'D43', susp: false };
    plan[2] = { deg: 2, hint: 'T6', susp: false };
  }
  if (needD7Inv && !needPass64) {
    plan[0] = { deg: 4, hint: 'T', susp: false };
    plan[1] = { deg: 4, hint: 'D2', susp: false };
    plan[2] = { deg: 0, hint: 'T6', susp: false };
  }
  if (totalBars === 8) {
    const extra = [
      { deg: 2, hint: 'T', susp: false },
      { deg: needDD ? 'sharp4' : 5, hint: needDD ? 'DD7' : 'S', susp: false },
      { deg: 4, hint: 'D', susp: false },
      { deg: needDec ? 2 : 2, hint: needDec ? 'VI' : 'T', susp: false },
      { deg: 3, hint: 'S6', susp: false },
      { deg: 1, hint: 'D', susp: needSusp },
      { deg: 2, hint: 'T', susp: false },
      { deg: 0, hint: 'T', susp: false }
    ];
    plan = [...plan.slice(0, 4), ...extra, ...plan.slice(4)];
    if (needDec && plan.length >= 12) {
      plan[6] = { deg: 6, hint: domCadChord, susp: false };
      plan[7] = { deg: 0, hint: 'VI', susp: false };
    }
  } else if (needDec) {
    plan[2] = { deg: 6, hint: domCadChord, susp: false };
    plan[3] = { deg: 0, hint: 'VI', susp: false };
  } else if (needDD) {
    plan[3] = { deg: 'sharp4', hint: 'DD7', susp: false };
  }

  if (needSusp && plan.length >= 5) {
    plan[4].susp = true;
  }

  const workMode = document.getElementById('hWorkMode').value;
  hState.kbdStepIdx = -1;
  hState.kbdBuffer = [];

  hState.steps = plan.map((item, idx) => {
    const semi = item.deg === 'sharp4' ? 6 : sc[item.deg];
    let sop = base + semi;
    if (sop > 79) sop -= 12;
    if (sop < 62) sop += 12;

    const refChord = (H_CHORD_CATALOG[item.hint] && allowed.includes(item.hint)) ? item.hint : 'T';
    const refVoices = autoVoiceStep(sop, refChord, initSpacing, key);
    const bassMidi = refVoices[3];
    const figuredBass = getFiguredBassLabel(refChord, key);

    if (hState.taskType === 'bass') {
      if (workMode === 'draft') {
        return {
          bar: Math.floor(idx / 2) + 1,
          beat: (idx % 2) === 0 ? 'сильная' : 'слабая',
          soprano: sop,
          bass: bassMidi,
          figuredBass,
          chordId: refChord,
          spacing: initSpacing,
          voices: autoVoiceFromBass(bassMidi, refChord, initSpacing, key),
          isSusp: item.susp,
          hint: refChord
        };
      }
      return {
        bar: Math.floor(idx / 2) + 1,
        beat: (idx % 2) === 0 ? 'сильная' : 'слабая',
        soprano: sop,
        bass: bassMidi,
        figuredBass,
        chordId: '',
        spacing: initSpacing,
        voices: [null, null, null, bassMidi],
        isSusp: item.susp,
        hint: refChord
      };
    }

    if (workMode === 'draft') {
      return {
        bar: Math.floor(idx / 2) + 1,
        beat: (idx % 2) === 0 ? 'сильная' : 'слабая',
        soprano: sop,
        bass: bassMidi,
        figuredBass,
        chordId: refChord,
        spacing: initSpacing,
        voices: refVoices,
        isSusp: item.susp,
        hint: refChord
      };
    }
    return {
      bar: Math.floor(idx / 2) + 1,
      beat: (idx % 2) === 0 ? 'сильная' : 'слабая',
      soprano: sop,
      bass: bassMidi,
      figuredBass,
      chordId: '',
      spacing: initSpacing,
      voices: [sop, null, null, null],
      isSusp: item.susp,
      hint: refChord
    };
  });

  if (workMode === 'draft') {
    hState.steps.forEach((s, idx) => {
      s.spacing = (spacingRule === 'change' && idx >= Math.floor(hState.steps.length / 2)) ? 'wide' : initSpacing;
    });
    solveReferenceVoicing(hState.steps, key);
  }

  document.getElementById('hPlayMelodyBtn').textContent = hState.taskType === 'bass' ? '▶ Только бас' : '▶ Только мелодия';
  document.getElementById('hTaskMeta').innerHTML = `
    <strong>Режим:</strong> ${hState.taskType === 'bass' ? 'Цифрованный бас' : 'Мелодия (Сопрано)'}<br/>
    <strong>Тональность:</strong> ${key.name} · <strong>Тактов:</strong> ${totalBars}<br/>
    <strong>Уровень:</strong> ${preset.name}<br/>
    <span style="color:var(--text-dim);">Доступно аккордов: ${preset.allowedChords.length}</span>
  `;

  syncPianoMode();
  renderHarmonizeUI();
  if (workMode === 'draft' && document.getElementById('hStrictness').value === 'soft') {
    checkHarmonization();
  } else if (workMode === 'scratch') {
    document.getElementById('hCheckReport').innerHTML = hState.taskType === 'bass'
      ? `<div class="report-row info">Режим «Цифрованный бас»: Бас зафиксирован, достройте верхние голоса (T, A, S) по цифровке под нотами.</div>`
      : `<div class="report-row info">Режим «С нуля»: выберите функции аккордов и задайте Альт, Тенор и Бас кнопками ▲/▼ или «🎹 С клавиш».</div>`;
  } else if (workMode === 'semi') {
    document.getElementById('hCheckReport').innerHTML = `<div class="report-row info">Режим «Выбор функций»: выберите аккорд в каждом шаге — голоса построятся автоматически.</div>`;
  } else {
    document.getElementById('hCheckReport').innerHTML = `<div class="report-row info">Экзаменационный режим: расставьте аккорды и нажмите «Сдать работу (Проверить)».</div>`;
  }
}

function renderHarmonizeScore(errStepSet = new Set()) {
  const svg = document.getElementById('hScoreSvg');
  const stepH = 5;
  const trebleBottomY = 82; // E4 (d=30)
  const bassTopY = 136;     // A3 (d=26)
  const trebleLines = [0,1,2,3,4].map(i => trebleBottomY - i * 2 * stepH);
  const bassLines = [0,1,2,3,4].map(i => bassTopY + i * 2 * stepH);

  const n = hState.steps.length;
  const startX = 68;
  const colW = Math.min(46, Math.floor(670 / Math.max(1, n)));
  const endX = startX + n * colW + 14;

  let out = '';
  out += `<line x1="24" y1="${trebleLines[4]}" x2="24" y2="${bassLines[4]}" stroke="#64748b" stroke-width="2.5"/>`;
  trebleLines.forEach(y => out += `<line x1="24" y1="${y}" x2="${endX}" y2="${y}" stroke="#334155" stroke-width="1"/>`);
  bassLines.forEach(y => out += `<line x1="24" y1="${y}" x2="${endX}" y2="${y}" stroke="#334155" stroke-width="1"/>`);
  out += `<text x="28" y="${trebleBottomY - 3}" fill="#94a3b8" font-size="38" font-family="serif">𝄞</text>`;
  out += `<text x="28" y="${bassTopY + 30}" fill="#94a3b8" font-size="30" font-family="serif">𝄢</text>`;

  const flatMajors = [5, 10, 3, 8, 1];
  const flatMinors = [2, 7, 0, 5, 10];
  const isFlatKey = hState.key.mode === 'minor' ? flatMinors.includes(hState.key.root) : flatMajors.includes(hState.key.root);
  const tbl = isFlatKey ? PC_FLAT : PC_SHARP;

  hState.steps.forEach((st, idx) => {
    const cx = startX + idx * colW + colW / 2;
    if (idx > 0 && idx % 2 === 0) {
      const bx = startX + idx * colW;
      out += `<line x1="${bx}" y1="${trebleLines[4]}" x2="${bx}" y2="${bassLines[4]}" stroke="#475569" stroke-width="1.2"/>`;
    }
    const isErr = errStepSet.has(idx);
    const isPlay = idx === hState.playingIdx;
    if (isPlay) {
      out += `<rect x="${cx - 14}" y="26" width="28" height="162" rx="4" fill="rgba(56,189,248,0.14)"/>`;
    }

    // Draw voices that are set (S, A on treble; T, B on bass) with ledger lines
    st.voices.forEach((midi, vIdx) => {
      if (midi === null || midi === undefined) return;
      const pc = ((midi % 12) + 12) % 12;
      const oct = Math.floor(midi / 12) - 1;
      const info = tbl[pc];
      const d = oct * 7 + info.step;
      const isTreble = vIdx < 2;
      const y = isTreble ? trebleBottomY - (d - 30) * stepH : bassTopY + (26 - d) * stepH;
      const color = isErr ? '#f87171' : ((hState.taskType === 'bass' ? vIdx === 3 : vIdx === 0) ? '#38bdf8' : '#e2e8f0');

      if (isTreble) {
        for (let ld = 28; ld >= d; ld -= 2) {
          const ly = trebleBottomY - (ld - 30) * stepH;
          out += `<line x1="${cx - 10}" y1="${ly}" x2="${cx + 10}" y2="${ly}" stroke="#64748b" stroke-width="1.2"/>`;
        }
        for (let ld = 40; ld <= d; ld += 2) {
          const ly = trebleBottomY - (ld - 30) * stepH;
          out += `<line x1="${cx - 10}" y1="${ly}" x2="${cx + 10}" y2="${ly}" stroke="#64748b" stroke-width="1.2"/>`;
        }
      } else {
        for (let ld = 28; ld <= d; ld += 2) {
          const ly = bassTopY + (26 - ld) * stepH;
          out += `<line x1="${cx - 10}" y1="${ly}" x2="${cx + 10}" y2="${ly}" stroke="#64748b" stroke-width="1.2"/>`;
        }
        for (let ld = 16; ld >= d; ld -= 2) {
          const ly = bassTopY + (26 - ld) * stepH;
          out += `<line x1="${cx - 10}" y1="${ly}" x2="${cx + 10}" y2="${ly}" stroke="#64748b" stroke-width="1.2"/>`;
        }
      }

      if (info.acc) out += `<text x="${cx - 14}" y="${y + 4}" fill="${color}" font-size="12" font-weight="700">${info.acc}</text>`;
      out += `<ellipse cx="${cx}" cy="${y}" rx="5.5" ry="3.9" transform="rotate(-16 ${cx} ${y})" fill="${color}"/>`;
    });

    const bottomLabel = hState.taskType === 'bass' ? (st.figuredBass || '5/3') : (st.chordId || '—');
    out += `<text x="${cx}" y="206" text-anchor="middle" fill="${isErr ? '#f87171' : (hState.taskType === 'bass' ? '#fbbf24' : '#94a3b8')}" font-size="10" font-family="monospace">${bottomLabel}</text>`;
  });

  svg.innerHTML = out;
}

function handleHarmonizePianoInput(midi) {
  if (hState.kbdStepIdx < 0 || !hState.steps[hState.kbdStepIdx]) return;
  hState.kbdBuffer.push(midi);
  if (hState.kbdBuffer.length < 3) {
    syncPianoMode();
    renderHarmonizeUI();
    return;
  }
  const sorted = [...hState.kbdBuffer].sort((a, b) => a - b);
  const step = hState.steps[hState.kbdStepIdx];
  if (hState.taskType === 'bass') {
    // [Tenor, Alto, Soprano]
    step.voices[2] = sorted[0];
    step.voices[1] = sorted[1];
    step.voices[0] = sorted[2];
  } else {
    // [Bass, Tenor, Alto]
    step.voices[3] = sorted[0];
    step.voices[2] = sorted[1];
    step.voices[1] = sorted[2];
  }
  hState.kbdStepIdx = -1;
  hState.kbdBuffer = [];
  syncPianoMode();
  playHarmonizeStep(step.voices, 0.78);
  onHarmonizeEdited();
}

function renderHarmonizeUI(errStepSet = new Set()) {
  const grid = document.getElementById('hStepsGrid');
  grid.innerHTML = '';
  const allowed = H_LEVEL_PRESETS[hState.level].allowedChords;
  const spacingRule = document.getElementById('hSpacingRule').value;
  const workMode = document.getElementById('hWorkMode').value;

  hState.steps.forEach((st, idx) => {
    const isKbdActive = hState.kbdStepIdx === idx;
    const card = document.createElement('div');
    card.className = 'step-card'
      + (errStepSet.has(idx) ? ' step-err' : '')
      + (idx === hState.playingIdx ? ' step-playing' : '')
      + (isKbdActive ? ' step-kbd-active' : '');

    const chordOpts = `<option value="" ${st.chordId === '' ? 'selected' : ''}>— Аккорд —</option>`
      + allowed.map(cid =>
          `<option value="${cid}" ${st.chordId === cid ? 'selected' : ''}>${H_CHORD_CATALOG[cid].label}</option>`
        ).join('');

    const fmtV = m => (m === null || m === undefined) ? '—' : midiToRu(m);
    const isBassMode = hState.taskType === 'bass';

    const voicesHtml = isBassMode
      ? `
        <div class="voice-ctrl">
          <span>S: <strong class="mono">${fmtV(st.voices[0])}</strong></span>
          <div class="voice-btns">
            <button class="v-btn" data-vshift="${idx}:0:1">▲</button>
            <button class="v-btn" data-vshift="${idx}:0:-1">▼</button>
          </div>
        </div>
        <div class="voice-ctrl">
          <span>A: <strong class="mono">${fmtV(st.voices[1])}</strong></span>
          <div class="voice-btns">
            <button class="v-btn" data-vshift="${idx}:1:1">▲</button>
            <button class="v-btn" data-vshift="${idx}:1:-1">▼</button>
          </div>
        </div>
        <div class="voice-ctrl">
          <span>T: <strong class="mono">${fmtV(st.voices[2])}</strong></span>
          <div class="voice-btns">
            <button class="v-btn" data-vshift="${idx}:2:1">▲</button>
            <button class="v-btn" data-vshift="${idx}:2:-1">▼</button>
          </div>
        </div>
      `
      : `
        <div class="voice-ctrl">
          <span>A: <strong class="mono">${fmtV(st.voices[1])}</strong></span>
          <div class="voice-btns">
            <button class="v-btn" data-vshift="${idx}:1:1">▲</button>
            <button class="v-btn" data-vshift="${idx}:1:-1">▼</button>
          </div>
        </div>
        <div class="voice-ctrl">
          <span>T: <strong class="mono">${fmtV(st.voices[2])}</strong></span>
          <div class="voice-btns">
            <button class="v-btn" data-vshift="${idx}:2:1">▲</button>
            <button class="v-btn" data-vshift="${idx}:2:-1">▼</button>
          </div>
        </div>
        <div class="voice-ctrl">
          <span>B: <strong class="mono">${fmtV(st.voices[3])}</strong></span>
          <div class="voice-btns">
            <button class="v-btn" data-vshift="${idx}:3:1">▲</button>
            <button class="v-btn" data-vshift="${idx}:3:-1">▼</button>
          </div>
        </div>
      `;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; gap:4px;">
        <span class="mono" style="color:var(--text-dim);">Т.${st.bar} (${st.beat})</span>
        ${isBassMode
          ? `<span style="display:flex; align-items:center; gap:4px;"><strong class="mono" style="color:var(--accent);">B: ${midiToRu(st.bass)}</strong><span class="fb-badge">${st.figuredBass}</span></span>`
          : `<strong class="mono" style="color:var(--accent);">S: ${midiToRu(st.soprano)}</strong>`
        }
      </div>
      ${st.isSusp ? `<span class="badge badge-S" style="align-self:flex-start;">Задержание</span>` : ''}
      <select class="daw-select" data-hchord="${idx}" style="width:100%; padding:3px 6px;">${chordOpts}</select>
      <select class="daw-select" data-hspace="${idx}" style="width:100%; padding:3px 6px; font-size:11px;">
        <option value="tight" ${st.spacing==='tight'?'selected':''}>Тесное</option>
        <option value="wide" ${st.spacing==='wide'?'selected':''}>Широкое</option>
      </select>
      ${voicesHtml}
      <button class="btn btn-sm ${isKbdActive ? 'btn-primary' : 'btn-ghost'}" data-hkbd="${idx}" style="width:100%; margin-top:2px; font-size:11px;">
        ${isKbdActive ? `🎹 Ноты (${hState.kbdBuffer.length}/3)` : '🎹 С клавиш'}
      </button>
    `;

    card.querySelector(`[data-hchord="${idx}"]`).addEventListener('change', e => {
      st.chordId = e.target.value;
      if (st.chordId && (workMode === 'semi' || workMode === 'draft')) {
        st.voices = isBassMode
          ? autoVoiceFromBass(st.bass, st.chordId, st.spacing, hState.key)
          : autoVoiceStep(st.soprano, st.chordId, st.spacing, hState.key);
      }
      playHarmonizeStep(st.voices, 0.75);
      onHarmonizeEdited();
    });

    const spSel = card.querySelector(`[data-hspace="${idx}"]`);
    if (spacingRule === 'tight' || spacingRule === 'wide') spSel.disabled = true;
    spSel.addEventListener('change', e => {
      st.spacing = e.target.value;
      if (st.chordId && (workMode === 'semi' || workMode === 'draft')) {
        st.voices = isBassMode
          ? autoVoiceFromBass(st.bass, st.chordId, st.spacing, hState.key)
          : autoVoiceStep(st.soprano, st.chordId, st.spacing, hState.key);
      }
      playHarmonizeStep(st.voices, 0.75);
      onHarmonizeEdited();
    });

    card.querySelectorAll('[data-vshift]').forEach(vb => {
      vb.addEventListener('click', () => {
        const [sIdx, vIdx, dir] = vb.dataset.vshift.split(':').map(Number);
        const stepObj = hState.steps[sIdx];
        const defaults = isBassMode
          ? { 0: 72, 1: 65, 2: Math.max(52, stepObj.bass + 7) }
          : { 1: Math.min(65, stepObj.soprano - 3), 2: 60, 3: 48 };
        if (stepObj.voices[vIdx] === null) {
          stepObj.voices[vIdx] = defaults[vIdx];
        } else if (stepObj.chordId) {
          const spec = getChordSpec(stepObj.chordId, hState.key);
          let m = stepObj.voices[vIdx] + dir;
          while (m >= 36 && m <= 81 && !spec.pcs.includes(m % 12)) m += dir;
          if (spec.pcs.includes(m % 12)) stepObj.voices[vIdx] = m;
        } else {
          const nextM = stepObj.voices[vIdx] + dir;
          if (nextM >= 36 && nextM <= 81) stepObj.voices[vIdx] = nextM;
        }
        playHarmonizeStep(stepObj.voices, 0.7);
        onHarmonizeEdited();
      });
    });

    card.querySelector(`[data-hkbd="${idx}"]`).addEventListener('click', () => {
      if (hState.kbdStepIdx === idx) {
        hState.kbdStepIdx = -1;
        hState.kbdBuffer = [];
      } else {
        hState.kbdStepIdx = idx;
        hState.kbdBuffer = [];
        if (document.body.classList.contains('is-mobile')) setPianoCollapsed(false);
      }
      syncPianoMode();
      renderHarmonizeUI(errStepSet);
    });

    grid.appendChild(card);
  });

  renderHarmonizeScore(errStepSet);
}

function onHarmonizeEdited() {
  if (document.getElementById('hStrictness').value === 'soft') {
    checkHarmonization();
  } else {
    renderHarmonizeUI();
  }
}

function checkHarmonization() {
  const steps = hState.steps;
  const reports = [];
  const errSteps = new Set();

  // 1. Voice leading: completeness, parallel 5ths/8ves, crossings, melody/figured-bass fit
  const incompleteBars = [];
  const isBassMode = hState.taskType === 'bass';
  for (let i = 0; i < steps.length; i++) {
    const cur = steps[i];
    const v = cur.voices; // [S, A, T, B]
    const missingVoices = (v[0] === null || v[1] === null || v[2] === null || v[3] === null);

    if (!cur.chordId || missingVoices) {
      errSteps.add(i);
      incompleteBars.push(`Т.${cur.bar} (${cur.beat})`);
      continue;
    }

    const spec = getChordSpec(cur.chordId, hState.key);
    const isIncompleteTAfterD7 = (i > 0 && steps[i - 1].chordId === 'D7' && cur.chordId === 'T');

    if (isBassMode) {
      const refSpec = getChordSpec(cur.hint, hState.key);
      const badTopVoices = [0, 1, 2].filter(vi => !refSpec.pcs.includes(v[vi] % 12));
      if (badTopVoices.length) {
        errSteps.add(i);
        reports.push({ ok: false, msg: `Такт ${cur.bar} (${cur.beat}): верхние голоса не соответствуют цифровке ${cur.figuredBass} от баса ${midiToRuNoOct(v[3])}.` });
      }
      if (i > 0 && steps[i - 1].voices[0] !== null && Math.abs(v[0] - steps[i - 1].voices[0]) > 7) {
        reports.push({ ok: false, msg: `Такт ${cur.bar}: слишком большой скачок в Сопрано (> квинты), старайтесь вести мелодию плавнее.` });
      }
    } else if (!cur.isSusp && !spec.pcs.includes(v[0] % 12)) {
      errSteps.add(i);
      reports.push({ ok: false, msg: `Такт ${cur.bar} (${cur.beat}): нота мелодии ${midiToRuNoOct(v[0])} не входит в аккорд ${cur.chordId}.` });
    } else if (!cur.isSusp) {
      const allowedPcs = isIncompleteTAfterD7 ? [spec.pcs[0], spec.pcs[1]] : spec.pcs;
      const badLower = [1, 2, 3].filter(vi => !spec.pcs.includes(v[vi] % 12));
      if (badLower.length) {
        errSteps.add(i);
        reports.push({ ok: false, msg: `Такт ${cur.bar} (${cur.beat}): в голосах A/T/B есть неаккордовый звук для ${cur.chordId}.` });
      } else if (!isIncompleteTAfterD7 && !allowedPcs.includes(v[1] % 12)) {
        // full chord tones valid
      }
    }

    if (v[0] < v[1] || v[1] < v[2] || v[2] < v[3]) {
      errSteps.add(i);
      reports.push({ ok: false, msg: `Такт ${cur.bar} (${cur.beat}): перекрещивание голосов (S ≥ A ≥ T ≥ B нарушено).` });
    }

    if (i > 0) {
      const prev = steps[i - 1].voices;
      if (prev[0] !== null && prev[1] !== null && prev[2] !== null && prev[3] !== null) {
        const pairs = [[0,1,'S–A'],[0,2,'S–T'],[0,3,'S–B'],[1,2,'A–T'],[1,3,'A–B'],[2,3,'T–B']];
        pairs.forEach(([a, b, label]) => {
          const iv1 = (prev[a] - prev[b]) % 12;
          const iv2 = (v[a] - v[b]) % 12;
          if (prev[a] !== v[a] && prev[b] !== v[b]) {
            if (iv1 === 7 && iv2 === 7) {
              errSteps.add(i);
              reports.push({ ok: false, msg: `Такт ${cur.bar}: параллельные квинты в голосах ${label}.` });
            }
            if (iv1 === 0 && iv2 === 0) {
              errSteps.add(i);
              reports.push({ ok: false, msg: `Такт ${cur.bar}: параллельные октавы в голосах ${label}.` });
            }
          }
        });
      }
    }
  }

  if (incompleteBars.length) {
    reports.unshift({ ok: false, msg: `Не выбрана функция или не достроены голоса в шагах: ${incompleteBars.join(', ')}.` });
  }

  // 2. Spacing rule check
  const spacingRule = document.getElementById('hSpacingRule').value;
  const spacings = steps.map(s => s.spacing);
  if (spacingRule === 'tight' && spacings.some(s => s !== 'tight')) {
    reports.push({ ok: false, msg: 'Условие расположения: требуется только тесное расположение во всех тактах.' });
  } else if (spacingRule === 'wide' && spacings.some(s => s !== 'wide')) {
    reports.push({ ok: false, msg: 'Условие расположения: требуется только широкое расположение во всех тактах.' });
  } else if (spacingRule === 'change') {
    const hasBoth = spacings.includes('tight') && spacings.includes('wide');
    if (hasBoth) reports.push({ ok: true, msg: 'Условие выполнено: применена смена расположения (тесное ↔ широкое).' });
    else reports.push({ ok: false, msg: 'Условие не выполнено: задача решена в одном расположении, хотя требовалась смена на широкое/тесное.' });
  }

  // 3. Required turns & cadences
  if (document.getElementById('chkK64').checked) {
    const kIdx = steps.findIndex(s => s.chordId === 'K64' && s.beat === 'сильная');
    if (kIdx >= 0) reports.push({ ok: true, msg: `Условие выполнено: K64 применён на сильной доле в ${steps[kIdx].bar}-м такте.` });
    else reports.push({ ok: false, msg: 'Условие не выполнено: требуется K64 на сильной доле в каденции.' });
  }
  if (document.getElementById('chkPass64').checked) {
    const pIdx = steps.findIndex(s => ['T64','S64','D64','D43'].includes(s.chordId));
    if (pIdx >= 0) reports.push({ ok: true, msg: `Условие выполнено: проходящий/вспомогательный оборот в ${steps[pIdx].bar}-м такте.` });
    else reports.push({ ok: false, msg: 'Условие не выполнено: используйте проходящий или вспомогательный 6/4 (или D43).' });
  }
  if (document.getElementById('chkD7Inv').checked) {
    const dInvs = new Set(steps.filter(s => ['D7','D65','D43','D2'].includes(s.chordId)).map(s => s.chordId));
    if (dInvs.size >= 2) reports.push({ ok: true, msg: `Условие выполнено: использованы обращения доминанты (${Array.from(dInvs).join(', ')}).` });
    else reports.push({ ok: false, msg: 'Условие не выполнено: включите D7 и минимум два разных обращения (например, D43 и D7).' });
  }
  if (document.getElementById('chkDeceptive').checked) {
    const dec = steps.some((s, i) => i > 0 && ['D','D7'].includes(steps[i-1].chordId) && s.chordId === 'VI');
    if (dec) reports.push({ ok: true, msg: 'Условие выполнено: присутствует прерванный оборот (D/D7 → VI).' });
    else reports.push({ ok: false, msg: 'Условие не выполнено: сделайте прерванный оборот (D или D7 → VI).' });
  }
  if (document.getElementById('chkDD').checked) {
    const dd = steps.some(s => ['DD7','D->S','D->VI'].includes(s.chordId));
    if (dd) reports.push({ ok: true, msg: 'Условие выполнено: применено отклонение через побочную доминанту.' });
    else reports.push({ ok: false, msg: 'Условие не выполнено: включите побочную доминанту (DD7, D7→S или D7→VI).' });
  }

  if (reports.every(r => r.ok) && errSteps.size === 0) {
    reports.unshift({ ok: true, msg: 'Голосоведение чистое: параллельных квинт, октав и перекрещиваний не обнаружено!' });
  }

  renderHarmonizeUI(errSteps);
  const repEl = document.getElementById('hCheckReport');
  repEl.innerHTML = reports.map(r => `<div class="report-row ${r.ok ? 'ok' : 'err'}">${r.ok ? '✓' : '✕'} ${r.msg}</div>`).join('');
}

const hMixer = {
  mute: [false, false, false, false],
  solo: [false, false, false, false],
  timbre: 'epiano'
};

function getActiveHarmonizeNotes(voices) {
  const hasSolo = hMixer.solo.some(Boolean);
  const out = [];
  for (let i = 0; i < 4; i++) {
    const m = voices[i];
    if (m === null || m === undefined) continue;
    if (hasSolo) {
      if (hMixer.solo[i] && !hMixer.mute[i]) out.push(m);
    } else {
      if (!hMixer.mute[i]) out.push(m);
    }
  }
  return out;
}

function playHarmonizeStep(voices, duration = 0.72) {
  const notes = getActiveHarmonizeNotes(voices);
  if (notes.length) audio.playChord(notes, duration, 0, hMixer.timbre);
}

function playHarmonizeSequence(givenOnly = false) {
  hState.steps.forEach((st, idx) => {
    setTimeout(() => {
      hState.playingIdx = idx;
      renderHarmonizeUI();
      if (givenOnly) {
        const gNote = hState.taskType === 'bass' ? st.bass : st.soprano;
        audio.playChord([gNote], 0.72, 0, hMixer.timbre);
      } else {
        playHarmonizeStep(st.voices, 0.72);
      }
      if (idx === hState.steps.length - 1) {
        setTimeout(() => { hState.playingIdx = -1; renderHarmonizeUI(); }, 760);
      }
    }, idx * 780);
  });
}

document.getElementById('hMixerChannels').addEventListener('click', e => {
  const btn = e.target.closest('[data-hmx]');
  if (!btn) return;
  const [vStr, kind] = btn.dataset.hmx.split(':');
  const vIdx = Number(vStr);
  if (kind === 'm') {
    hMixer.mute[vIdx] = !hMixer.mute[vIdx];
    btn.classList.toggle('m-on', hMixer.mute[vIdx]);
  } else {
    hMixer.solo[vIdx] = !hMixer.solo[vIdx];
    btn.classList.toggle('s-on', hMixer.solo[vIdx]);
  }
});
document.getElementById('hTimbreSelect').addEventListener('change', e => {
  hMixer.timbre = e.target.value;
});

document.querySelectorAll('#hTaskTypeToggle .seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#hTaskTypeToggle .seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    hState.taskType = btn.dataset.htype;
    generateHarmonizeTask();
  });
});
document.querySelectorAll('#hLevelGrid .level-card').forEach(btn => {
  btn.addEventListener('click', () => applyLevelPreset(Number(btn.dataset.lvl)));
});
document.getElementById('hWorkMode').addEventListener('change', generateHarmonizeTask);
document.getElementById('hGenBtn').addEventListener('click', generateHarmonizeTask);
document.getElementById('hCheckBtn').addEventListener('click', checkHarmonization);
document.getElementById('hPlayMelodyBtn').addEventListener('click', () => playHarmonizeSequence(true));
document.getElementById('hPlayAllBtn').addEventListener('click', () => playHarmonizeSequence(false));
function hasParallelFifthOrOctave(prev, cur) {
  if (!prev || prev.some(x => x === null || x === undefined)) return false;
  const pairs = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
  for (const [a, b] of pairs) {
    if (prev[a] !== cur[a] && prev[b] !== cur[b]) {
      const iv1 = ((prev[a] - prev[b]) % 12 + 12) % 12;
      const iv2 = ((cur[a] - cur[b]) % 12 + 12) % 12;
      if ((iv1 === 7 && iv2 === 7) || (iv1 === 0 && iv2 === 0)) return true;
    }
  }
  return false;
}

function solveStepVoices(prevVoices, fixedNote, isBassMode, chordId, spacing, keyObj, prevChordId = '') {
  const spec = getChordSpec(chordId, keyObj);
  const bassPc = spec.pcs[spec.bassDeg] !== undefined ? spec.pcs[spec.bassDeg] : spec.pcs[0];
  const isIncompleteT = (!isBassMode && prevChordId === 'D7' && chordId === 'T');
  const allowedUpperPcs = isIncompleteT ? [spec.pcs[0], spec.pcs[1]] : spec.pcs;

  const septPc = (keyObj.root + 5) % 12;
  const leadPc = (keyObj.root + 11) % 12;
  const isPrevDom7 = ['D7', 'D65', 'D43', 'D2'].includes(prevChordId);
  const isDomToTonic = ['D', 'D6', 'D7', 'D65', 'D43', 'D2'].includes(prevChordId) && ['T', 'T6', 'VI'].includes(chordId);

  const collectCandidates = (strictSpacing) => {
    const out = [];
    if (!isBassMode) {
      const s = fixedNote;
      const basses = [];
      for (let b = 40; b <= Math.min(57, s - 6); b++) {
        if (b % 12 === bassPc) basses.push(b);
      }
      const altos = [];
      for (let a = Math.max(53, s - 12); a <= Math.min(72, s - 1); a++) {
        if (!allowedUpperPcs.includes(a % 12)) continue;
        const gapSA = s - a;
        if (strictSpacing && spacing === 'tight' && gapSA > 6) continue;
        if (strictSpacing && spacing === 'wide' && (gapSA < 5 || gapSA > 12)) continue;
        altos.push(a);
      }
      for (const a of altos) {
        for (let t = Math.max(48, a - 12); t <= Math.min(64, a - 1); t++) {
          if (!allowedUpperPcs.includes(t % 12)) continue;
          const gapAT = a - t;
          if (strictSpacing && spacing === 'tight' && gapAT > 6) continue;
          if (strictSpacing && spacing === 'wide' && (gapAT < 5 || gapAT > 12)) continue;
          for (const b of basses) {
            if (t <= b) continue;
            const v = [s, a, t, b];
            if (!hasParallelFifthOrOctave(prevVoices, v)) out.push(v);
          }
        }
      }
    } else {
      const b = fixedNote;
      for (let t = Math.max(b + 1, 48); t <= 64; t++) {
        if (!spec.pcs.includes(t % 12)) continue;
        for (let a = t + 1; a <= Math.min(72, t + 12); a++) {
          if (!spec.pcs.includes(a % 12)) continue;
          const gapAT = a - t;
          if (strictSpacing && spacing === 'tight' && gapAT > 6) continue;
          if (strictSpacing && spacing === 'wide' && (gapAT < 5 || gapAT > 12)) continue;
          for (let s = a + 1; s <= Math.min(79, a + 12); s++) {
            if (!spec.pcs.includes(s % 12)) continue;
            const gapSA = s - a;
            if (strictSpacing && spacing === 'tight' && gapSA > 6) continue;
            if (strictSpacing && spacing === 'wide' && (gapSA < 5 || gapSA > 12)) continue;
            const v = [s, a, t, b];
            if (!hasParallelFifthOrOctave(prevVoices, v)) out.push(v);
          }
        }
      }
    }
    return out;
  };

  let rawCandidates = collectCandidates(true);
  if (!rawCandidates.length) rawCandidates = collectCandidates(false);

  const isDomChord = ['D', 'D6', 'D64', 'D7', 'D65', 'D43', 'D2'].includes(chordId);

  let candidates = rawCandidates.filter(v => {
    if (isDomChord && v.filter(m => (m % 12) === leadPc).length > 1) return false;
    if (!prevVoices || prevVoices.some(x => x === null)) return true;
    if (isPrevDom7) {
      for (let vi = 1; vi <= 3; vi++) {
        if (prevVoices[vi] % 12 === septPc) {
          const diff = prevVoices[vi] - v[vi];
          if (diff < 1 || diff > 2) return false;
        }
      }
    }
    if (isDomToTonic) {
      for (const vi of [0, 3]) {
        if (prevVoices[vi] % 12 === leadPc && (v[vi] - prevVoices[vi] !== 1) && v[vi] !== prevVoices[vi]) {
          return false;
        }
      }
    }
    return true;
  });

  if (!candidates.length) candidates = rawCandidates;

  if (!candidates.length) {
    return isBassMode
      ? autoVoiceFromBass(fixedNote, chordId, spacing, keyObj)
      : autoVoiceStep(fixedNote, chordId, spacing, keyObj);
  }

  candidates.sort((v1, v2) => {
    const score = (v) => {
      let sc = 0;
      if (prevVoices && !prevVoices.some(x => x === null)) {
        sc += Math.abs(v[1] - prevVoices[1]) + Math.abs(v[2] - prevVoices[2]);
        sc += Math.abs(v[0] - prevVoices[0]) * 1.2 + Math.abs(v[3] - prevVoices[3]) * 0.6;
      } else {
        sc += Math.abs(v[3] - 48) * 0.4;
      }
      const uniquePcs = new Set(v.map(m => m % 12)).size;
      sc -= uniquePcs * 5;
      const rootCount = v.filter(m => (m % 12) === spec.rootPc).length;
      if (rootCount >= 2) sc -= 3;
      if (isBassMode && (v[0] % 12) !== (v[3] % 12)) sc -= 6;
      return sc;
    };
    return score(v1) - score(v2);
  });

  return candidates[0];
}

function solveReferenceVoicing(steps, keyObj) {
  let prevVoices = null;
  let prevChordId = '';
  const isBassMode = hState.taskType === 'bass';
  const allowed = H_LEVEL_PRESETS[hState.level].allowedChords;
  const invMap = { 'T': 'T6', 'S': 'S6', 'D': 'D6' };

  steps.forEach(s => {
    if (!isBassMode && prevVoices && invMap[s.chordId] && allowed.includes(invMap[s.chordId])) {
      const spec = getChordSpec(s.chordId, keyObj);
      const bassPc = spec.pcs[spec.bassDeg] !== undefined ? spec.pcs[spec.bassDeg] : spec.pcs[0];
      if ((prevVoices[0] % 12) === (prevVoices[3] % 12) && (s.soprano % 12) === bassPc) {
        s.chordId = invMap[s.chordId];
      }
    }
    const fixedNote = isBassMode ? s.bass : s.soprano;
    s.voices = solveStepVoices(prevVoices, fixedNote, isBassMode, s.chordId, s.spacing, keyObj, prevChordId);
    prevVoices = s.voices;
    prevChordId = s.chordId;
  });
}

function showReferenceSolution() {
  const rule = document.getElementById('hSpacingRule').value;
  const baseSpacing = rule === 'wide' ? 'wide' : 'tight';
  hState.kbdStepIdx = -1;
  hState.kbdBuffer = [];

  let changed = false;
  hState.steps.forEach((s, idx) => {
    s.chordId = H_CHORD_CATALOG[s.hint] ? s.hint : 'T';
    if (rule === 'change') {
      if (!changed && idx > 0 && (Math.abs(s.soprano - hState.steps[idx - 1].soprano) >= 4 || idx >= Math.floor(hState.steps.length / 2))) {
        changed = true;
      }
      s.spacing = changed ? 'wide' : 'tight';
    } else {
      s.spacing = baseSpacing;
    }
  });

  solveReferenceVoicing(hState.steps, hState.key);
  syncPianoMode();
  checkHarmonization();
  playHarmonizeSequence(false);
}

document.getElementById('hShowRefBtn').addEventListener('click', showReferenceSolution);
document.getElementById('hSpacingRule').addEventListener('change', () => {
  const rule = document.getElementById('hSpacingRule').value;
  if (rule === 'tight' || rule === 'wide') {
    hState.steps.forEach(s => {
      s.spacing = rule;
      if (s.chordId && s.voices[1] !== null) {
        s.voices = hState.taskType === 'bass'
          ? autoVoiceFromBass(s.bass, s.chordId, rule, hState.key)
          : autoVoiceStep(s.soprano, s.chordId, rule, hState.key);
      }
    });
  }
  onHarmonizeEdited();
});
document.getElementById('hStrictness').addEventListener('change', onHarmonizeEdited);

applyLevelPreset(1);
