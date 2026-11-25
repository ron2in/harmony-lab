/* =========================================================
   5. MAIN MODULE: CHORD BUILDING & INVERSION CHECKER
========================================================= */
const M_STATS_KEY = 'harmony_chord_lab_stats_v1';
let mStats = (() => {
  try {
    const raw = localStorage.getItem(M_STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const obj = { streak: 0, byType: {} };
  CHORD_DB.forEach(c => obj.byType[c.id] = { ok: 0, total: 0 });
  return obj;
})();

function saveMStats() { try { localStorage.setItem(M_STATS_KEY, JSON.stringify(mStats)); } catch {} }

function renderMStats() {
  document.getElementById('mStreakText').textContent = `Серия: ${mStats.streak}`;
  const strip = document.getElementById('mStatsStrip');
  strip.innerHTML = '';
  CHORD_DB.forEach(c => {
    const st = mStats.byType[c.id] || { ok: 0, total: 0 };
    const pct = st.total ? Math.round((st.ok / st.total) * 100) + '%' : '—';
    const div = document.createElement('div');
    div.className = 'stat-chip';
    div.innerHTML = `<span class="mono">${c.short.split(' ')[0]}</span><span class="mono" style="color:var(--accent);">${pct} <span style="color:var(--text-dim);">(${st.ok}/${st.total})</span></span>`;
    strip.appendChild(div);
  });
}

const mState = { task: null, userNotes: [], checked: false };

function generateMainTask() {
  mState.userNotes = [];
  mState.checked = false;
  document.getElementById('mFeedback').className = 'feedback-banner';

  const grp = document.getElementById('mFilterGroup').value;
  const mode = document.getElementById('mTaskMode').value;
  document.getElementById('mTaskMode').disabled = (grp === 'intervals' || grp === 'resolutions');

  if (grp === 'resolutions') {
    const keyRoot = Math.floor(Math.random() * 12);
    const isMinor = Math.random() < 0.45;
    const flatMajors = [5, 10, 3, 8, 1];
    const flatMinors = [2, 7, 0, 5, 10];
    const accMode = (isMinor ? flatMinors.includes(keyRoot) : flatMajors.includes(keyRoot)) ? 'flat' : 'sharp';
    pianoUI.setAccidentalMode(accMode);

    const T = (60 + keyRoot > 67) ? 48 + keyRoot : 60 + keyRoot;
    const t3 = isMinor ? 3 : 4;
    const domRoot = 60 + ((keyRoot + 7) % 12);
    const viiRoot = 60 + ((keyRoot + 11) % 12);
    const keyLabel = `${midiToRuNoOct(keyRoot, accMode)} ${isMinor ? 'миноре' : 'мажоре'}`;

    const resSpecs = [
      {
        code: 'D7',
        sourceNotes: buildInversionNotes(domRoot, [0, 4, 7, 10], 0),
        expectedNotes: [T, T + t3, T + 12],
        reqBassPc: keyRoot,
        allowedPcs: [keyRoot, (keyRoot + t3) % 12],
        ruleText: 'D7 → неполное T53 с утроенным основным тоном (без квинты)'
      },
      {
        code: 'D65',
        sourceNotes: buildInversionNotes(domRoot, [0, 4, 7, 10], 1),
        expectedNotes: [T, T + t3, T + 7],
        reqBassPc: keyRoot,
        allowedPcs: [keyRoot, (keyRoot + t3) % 12, (keyRoot + 7) % 12],
        ruleText: 'D65 → полное T53 с удвоенным основным тоном'
      },
      {
        code: 'D43',
        sourceNotes: buildInversionNotes(domRoot, [0, 4, 7, 10], 2),
        expectedNotes: [T, T + t3, T + 7],
        reqBassPc: keyRoot,
        allowedPcs: [keyRoot, (keyRoot + t3) % 12, (keyRoot + 7) % 12],
        ruleText: 'D43 → полное T53 с удвоенным основным тоном (поступенный бас II → I)'
      },
      {
        code: 'D2',
        sourceNotes: buildInversionNotes(domRoot, [0, 4, 7, 10], 3),
        expectedNotes: buildInversionNotes(T, [0, t3, 7], 1),
        reqBassPc: (keyRoot + t3) % 12,
        allowedPcs: [keyRoot, (keyRoot + t3) % 12, (keyRoot + 7) % 12],
        ruleText: 'D2 → T6 (септима в басу идёт на секунду вниз в терцию тоники)'
      },
      {
        code: 'УмVII7',
        sourceNotes: buildInversionNotes(viiRoot, [0, 3, 6, 9], 0),
        expectedNotes: [T, T + t3, T + 7],
        reqBassPc: keyRoot,
        allowedPcs: [keyRoot, (keyRoot + t3) % 12, (keyRoot + 7) % 12],
        ruleText: 'УмVII7 → T53 с удвоенной терцией (без параллельных квинт)'
      }
    ];

    const pick = resSpecs[Math.floor(Math.random() * resSpecs.length)];
    const title = `Разреши ${pick.code} в тональности ${keyLabel}`;
    const hint = `Исходный аккорд (${pick.sourceNotes.map(m => midiToRu(m, accMode)).join(' – ')}) показан серым. Наберите аккорд разрешения.`;

    mState.task = {
      isResolution: true,
      ...pick,
      chord: { id: 'res_' + pick.code, intervals: [] },
      rootPc: keyRoot, invIdx: 0, invCode: pick.code,
      title, hint, accidentalMode: accMode
    };
    document.getElementById('mTaskTitle').textContent = title;
    document.getElementById('mTaskHint').textContent = hint;
    renderMainUserState();
    audio.playChord(pick.sourceNotes, 0.95, 0);
    return;
  }

  if (grp === 'intervals') {
    const ivPool = INTERVALS_DB.filter(iv => iv.semi >= 1 && iv.semi <= 12);
    const iv = ivPool[Math.floor(Math.random() * ivPool.length)];
    const dir = Math.random() < 0.5 ? 'up' : 'down';
    const givenMidi = dir === 'up'
      ? 53 + Math.floor(Math.random() * 14)   // F3..F#4
      : 62 + Math.floor(Math.random() * 14);  // D4..D#5
    const givenPc = givenMidi % 12;
    const accMode = ([3, 8, 10].includes(givenPc) || ([1, 6].includes(givenPc) && Math.random() < 0.45)) ? 'flat' : 'sharp';
    pianoUI.setAccidentalMode(accMode);
    const targetMidi = dir === 'up' ? givenMidi + iv.semi : givenMidi - iv.semi;
    const expectedNotes = [Math.min(givenMidi, targetMidi), Math.max(givenMidi, targetMidi)];
    const dirLabel = dir === 'up' ? 'вверх' : 'вниз';
    const title = `Построй интервал ${iv.short} (${iv.name}) ${dirLabel} от ноты ${midiToRu(givenMidi, accMode)}`;
    const hint = `${iv.semi} полутонов · Ассоциация: ${iv.hint}. Нажмите обе ноты (опорную и целевую).`;

    mState.task = {
      isInterval: true, iv, dir, givenMidi, targetMidi, accidentalMode: accMode,
      chord: { id: 'interval_' + iv.id, intervals: [0, iv.semi] },
      rootPc: givenPc, invIdx: 0, invCode: iv.short,
      expectedNotes, title, hint
    };
    document.getElementById('mTaskTitle').textContent = title;
    document.getElementById('mTaskHint').textContent = hint;
    renderMainUserState();
    return;
  }

  let pool = CHORD_DB;
  if (grp === 'triads') pool = CHORD_DB.filter(c => c.group === 'triads');
  else if (grp === 'sevenths') pool = CHORD_DB.filter(c => c.group === 'sevenths');
  else if (grp === 'rare') pool = CHORD_DB.filter(c => c.rare);

  let chord, rootPc, invIdx, title, hint, accMode = 'sharp';

  if (mode === 'root') {
    chord = pool[Math.floor(Math.random() * pool.length)];
    rootPc = Math.floor(Math.random() * 12);
    const isMinOrDim = ['min', 'dim', 'min7', 'mmaj7', 'm7b5', 'dim7'].includes(chord.id);
    const useFlat = [3, 8, 10].includes(rootPc)
      || ([1, 6].includes(rootPc) && Math.random() < 0.45)
      || (rootPc === 5 && isMinOrDim);
    accMode = useFlat ? 'flat' : 'sharp';
    pianoUI.setAccidentalMode(accMode);
    invIdx = Math.floor(Math.random() * chord.invCodes.length);
    const invCode = chord.invCodes[invIdx];
    const shortLabel = chord.short.split(' ')[0].replace(/53|7/, '') + invCode;
    title = `Построй ${shortLabel} (${chord.name} — ${INV_NAMES[invCode]}) от ноты ${midiToRuNoOct(rootPc, accMode)}`;
    hint = `Состав: ${chord.intervals.length} звука · В басу должна быть ${TONE_ROLES[invIdx]}.`;
  } else {
    // Key mode: D7, II7, МвVII7, УмVII7 + inversions
    const keyRoot = Math.floor(Math.random() * 12);
    const isMinorKey = Math.random() < 0.45;
    const flatMajors = [5, 10, 3, 8, 1]; // F, Bb, Eb, Ab, Db
    const flatMinors = [2, 7, 0, 5, 10]; // Dm, Gm, Cm, Fm, Bbm
    const isFlatKey = isMinorKey ? flatMinors.includes(keyRoot) : flatMajors.includes(keyRoot);
    accMode = isFlatKey ? 'flat' : 'sharp';
    pianoUI.setAccidentalMode(accMode);
    const keyLabel = `${midiToRuNoOct(keyRoot, accMode)} ${isMinorKey ? 'миноре' : 'мажоре'}`;

    const degreeOptions = isMinorKey
      ? [
          { degName: 'D', chordId: 'dom7', offset: 7 },
          { degName: 'II', chordId: 'm7b5', offset: 2 },
          { degName: 'УмVII', chordId: 'dim7', offset: 11 }
        ]
      : [
          { degName: 'D', chordId: 'dom7', offset: 7 },
          { degName: 'II', chordId: 'min7', offset: 2 },
          { degName: 'МвVII', chordId: 'm7b5', offset: 11 }
        ];

    const pickDeg = degreeOptions[Math.floor(Math.random() * degreeOptions.length)];
    chord = CHORD_DB.find(c => c.id === pickDeg.chordId);
    rootPc = (keyRoot + pickDeg.offset) % 12;
    invIdx = Math.floor(Math.random() * 4);
    const invCode = chord.invCodes[invIdx];
    title = `Построй ${pickDeg.degName}${invCode} в тональности ${keyLabel}`;
    hint = `${chord.name} от ступени ${midiToRuNoOct(rootPc, accMode)} · В басу: ${TONE_ROLES[invIdx]}.`;
  }

  const expectedNotes = buildInversionNotes(60 + rootPc, chord.intervals, invIdx);
  mState.task = { chord, rootPc, invIdx, invCode: chord.invCodes[invIdx], expectedNotes, title, hint, accidentalMode: accMode };

  document.getElementById('mTaskTitle').textContent = title;
  document.getElementById('mTaskHint').textContent = hint;
  renderMainUserState();
}

function toggleTrainerNote(midi) {
  const idx = mState.userNotes.indexOf(midi);
  if (idx >= 0) mState.userNotes.splice(idx, 1);
  else mState.userNotes.push(midi);
  document.getElementById('mFeedback').className = 'feedback-banner';
  renderMainUserState();
}

function renderMainUserState() {
  const sorted = [...mState.userNotes].sort((a, b) => a - b);
  document.getElementById('mUserNotesText').textContent = sorted.length ? sorted.map(midiToRu).join(' – ') : '—';
  document.getElementById('mStaffBass').textContent = sorted.length ? `Бас: ${midiToRu(sorted[0])}` : '';
  pianoUI.clearStatuses();
  pianoUI.setKeyClass(sorted, 'selected-note');
  const staffNotes = [];
  if (mState.task && mState.task.isResolution && mState.task.sourceNotes) {
    mState.task.sourceNotes.forEach(m => staffNotes.push({ midi: m, color: '#64748b' }));
  }
  sorted.forEach(m => staffNotes.push({ midi: m, color: '#38bdf8' }));
  renderGrandStaff(document.getElementById('mStaffSvg'), staffNotes, (m) => {
    audio.playNote(m, 0.55, 0, 0.8);
    toggleTrainerNote(m);
  });
}

function checkMainTask() {
  const t = mState.task;
  if (!t) return;
  const usr = [...mState.userNotes].sort((a, b) => a - b);
  const fb = document.getElementById('mFeedback');

  if (!usr.length) {
    fb.className = 'feedback-banner info';
    fb.textContent = 'Наберите ноты на клавиатуре или нотном стане.';
    return;
  }

  if (t.isResolution) {
    const usrSet = new Set(usr.map(m => m % 12));
    const allowedSet = new Set(t.allowedPcs);
    const bassOk = (usr[0] % 12) === t.reqBassPc;
    const allAllowed = usr.every(m => allowedSet.has(m % 12));
    const allRequiredPresent = t.allowedPcs.every(pc => usrSet.has(pc));
    const ok = bassOk && allAllowed && allRequiredPresent;

    if (!mState.checked) {
      mState.checked = true;
      if (ok) mStats.streak++;
      else mStats.streak = 0;
      saveMStats();
      renderMStats();
    }
    pianoUI.clearStatuses();
    const staffObjs = t.sourceNotes.map(m => ({ midi: m, color: '#64748b' }));
    const greenMidis = [], redMidis = [], yellowMidis = [];
    usr.forEach(m => {
      if (allowedSet.has(m % 12)) {
        greenMidis.push(m);
        staffObjs.push({ midi: m, color: '#22c55e' });
      } else {
        redMidis.push(m);
        staffObjs.push({ midi: m, color: '#ef4444' });
      }
    });
    t.expectedNotes.forEach(em => {
      if (!usrSet.has(em % 12)) {
        yellowMidis.push(em);
        staffObjs.push({ midi: em, color: '#eab308' });
      }
    });
    pianoUI.setKeyClass(greenMidis, 'check-ok');
    pianoUI.setKeyClass(redMidis, 'check-err');
    pianoUI.setKeyClass(yellowMidis, 'check-warn');
    renderGrandStaff(document.getElementById('mStaffSvg'), staffObjs);

    audio.playChord(t.sourceNotes, 0.65, 0);
    setTimeout(() => audio.playChord(usr, 1.0, 0), 700);

    if (ok) {
      fb.className = 'feedback-banner ok';
      fb.innerHTML = `<strong>Верно!</strong> Правило выполнено: ${t.ruleText}.`;
    } else {
      fb.className = 'feedback-banner err';
      fb.innerHTML = `Ошибка разрешения. ${t.ruleText}. Эталон: <strong class="mono">${t.expectedNotes.map(midiToRu).join(' – ')}</strong>.`;
    }
    return;
  }

  if (t.isInterval) {
    const exp = t.expectedNotes;
    const exact = usr.length === 2 && usr[0] === exp[0] && usr[1] === exp[1];
    if (!mState.checked) {
      mState.checked = true;
      if (exact) mStats.streak++;
      else mStats.streak = 0;
      saveMStats();
      renderMStats();
    }
    pianoUI.clearStatuses();
    const staffObjs = [];
    const greenMidis = [], redMidis = [], yellowMidis = [];
    usr.forEach(m => {
      if (exp.includes(m)) {
        greenMidis.push(m);
        staffObjs.push({ midi: m, color: '#22c55e' });
      } else {
        redMidis.push(m);
        staffObjs.push({ midi: m, color: '#ef4444' });
      }
    });
    exp.forEach(em => {
      if (!usr.includes(em)) {
        yellowMidis.push(em);
        staffObjs.push({ midi: em, color: '#eab308' });
      }
    });
    pianoUI.setKeyClass(greenMidis, 'check-ok');
    pianoUI.setKeyClass(redMidis, 'check-err');
    pianoUI.setKeyClass(yellowMidis, 'check-warn');
    renderGrandStaff(document.getElementById('mStaffSvg'), staffObjs);
    audio.playChord(usr, 0.9, 0.25);

    if (exact) {
      fb.className = 'feedback-banner ok';
      fb.innerHTML = `<strong>Верно!</strong> Интервал <strong>${t.iv.short}</strong> (${t.iv.name}, ${t.iv.semi} пт) построен точно: <strong class="mono">${exp.map(midiToRu).join(' – ')}</strong>.`;
    } else if (usr.length === 2 && Math.abs(usr[1] - usr[0]) === t.iv.semi) {
      fb.className = 'feedback-banner warn';
      fb.innerHTML = `Величина интервала верная (${t.iv.semi} пт), но строить нужно ${t.dir === 'up' ? 'вверх' : 'вниз'} от ноты <strong>${midiToRu(t.givenMidi)}</strong>. Эталон: <strong class="mono">${exp.map(midiToRu).join(' – ')}</strong>.`;
    } else {
      fb.className = 'feedback-banner err';
      fb.innerHTML = `Есть ошибка. Правильный интервал ${t.iv.short} (${t.iv.semi} пт): <strong class="mono">${exp.map(midiToRu).join(' – ')}</strong>.`;
    }
    return;
  }

  const expPcs = t.expectedNotes.map(m => m % 12);
  const expSet = new Set(expPcs);
  const usrPcs = usr.map(m => m % 12);
  const usrUnique = Array.from(new Set(usrPcs));

  const samePitchSet = expSet.size === usrUnique.length && usrUnique.every(pc => expSet.has(pc)) && usr.length === t.expectedNotes.length;
  const expBassPc = t.expectedNotes[0] % 12;
  const usrBassPc = usr[0] % 12;

  // Exact order check: compare pitch classes bottom-to-top
  const sameOrder = samePitchSet && usrPcs.every((pc, i) => pc === expPcs[i]);

  // Update stats once per task
  if (!mState.checked) {
    mState.checked = true;
    if (!mStats.byType[t.chord.id]) mStats.byType[t.chord.id] = { ok: 0, total: 0 };
    mStats.byType[t.chord.id].total++;
    if (sameOrder) {
      mStats.byType[t.chord.id].ok++;
      mStats.streak++;
    } else {
      mStats.streak = 0;
    }
    saveMStats();
    renderMStats();
  }

  // Color coding: green (correct), red (extra/wrong), yellow (missing or wrong octave/position)
  pianoUI.clearStatuses();
  const staffObjs = [];
  const greenMidis = [], redMidis = [], yellowMidis = [];

  usr.forEach((m, idx) => {
    const pc = m % 12;
    if (!expSet.has(pc)) {
      redMidis.push(m);
      staffObjs.push({ midi: m, color: '#ef4444' });
    } else if (sameOrder || (idx < expPcs.length && pc === expPcs[idx])) {
      greenMidis.push(m);
      staffObjs.push({ midi: m, color: '#22c55e' });
    } else {
      yellowMidis.push(m);
      staffObjs.push({ midi: m, color: '#eab308' });
    }
  });

  // Also highlight missing notes in yellow on keyboard & staff
  const usrSet = new Set(usrPcs);
  t.expectedNotes.forEach(em => {
    if (!usrSet.has(em % 12)) {
      yellowMidis.push(em);
      staffObjs.push({ midi: em, color: '#eab308' });
    }
  });

  pianoUI.setKeyClass(greenMidis, 'check-ok');
  pianoUI.setKeyClass(redMidis, 'check-err');
  pianoUI.setKeyClass(yellowMidis, 'check-warn');
  renderGrandStaff(document.getElementById('mStaffSvg'), staffObjs);

  audio.playChord(usr, 1.0, 0);

  if (sameOrder) {
    fb.className = 'feedback-banner ok';
    fb.innerHTML = `<strong>Верно!</strong> Аккорд и обращение <strong>${t.invCode}</strong> собраны безошибочно (в басу — ${midiToRuNoOct(t.expectedNotes[0])}).`;
  } else if (samePitchSet && usrBassPc !== expBassPc) {
    const usrBassIdx = expPcs.indexOf(usrBassPc);
    // Find role of usrBassPc relative to rootPc
    const semiFromRoot = (usrBassPc - t.rootPc + 12) % 12;
    const roleIdx = t.chord.intervals.indexOf(semiFromRoot);
    const usrRole = roleIdx >= 0 ? TONE_ROLES[roleIdx] : 'другой тон';
    fb.className = 'feedback-banner warn';
    fb.innerHTML = `<strong>Состав нот верный, но это не обращение ${t.invCode}</strong> — в басу должна быть <strong>${TONE_ROLES[t.invIdx]}</strong> (нота <strong>${midiToRuNoOct(t.expectedNotes[0])}</strong>), а у тебя сейчас <strong>${usrRole}</strong> (нота <strong>${midiToRuNoOct(usr[0])}</strong>).`;
  } else if (samePitchSet) {
    fb.className = 'feedback-banner warn';
    fb.innerHTML = `Бас верный, но верхние голоса перепутаны по порядку. Эталон снизу вверх: <strong class="mono">${t.expectedNotes.map(midiToRu).join(' – ')}</strong>.`;
  } else {
    fb.className = 'feedback-banner err';
    fb.innerHTML = `Есть ошибки в составе аккорда. Правильные ноты снизу вверх: <strong class="mono">${t.expectedNotes.map(midiToRu).join(' – ')}</strong> (в басу — ${midiToRuNoOct(t.expectedNotes[0])}).`;
  }
}

document.getElementById('mNewTaskBtn').addEventListener('click', generateMainTask);
document.getElementById('mFilterGroup').addEventListener('change', generateMainTask);
document.getElementById('mTaskMode').addEventListener('change', generateMainTask);
document.getElementById('mCheckBtn').addEventListener('click', checkMainTask);
document.getElementById('mClearBtn').addEventListener('click', () => {
  mState.userNotes = [];
  document.getElementById('mFeedback').className = 'feedback-banner';
  renderMainUserState();
});
document.getElementById('mPlayUserBtn').addEventListener('click', () => {
  if (mState.userNotes.length) audio.playChord([...mState.userNotes].sort((a,b)=>a-b), 1.0, 0);
});
document.getElementById('mShowCorrectBtn').addEventListener('click', () => {
  if (!mState.task) return;
  mState.userNotes = [...mState.task.expectedNotes];
  renderMainUserState();
  pianoUI.clearStatuses();
  pianoUI.setKeyClass(mState.task.expectedNotes, 'check-ok');
  renderGrandStaff(document.getElementById('mStaffSvg'), mState.task.expectedNotes.map(m => ({ midi: m, color: '#22c55e' })));
  audio.playChord(mState.task.expectedNotes, 0.85, 0.22);
  setTimeout(() => audio.playChord(mState.task.expectedNotes, 1.1, 0), mState.task.expectedNotes.length * 240 + 350);
});
document.getElementById('mResetStatsBtn').addEventListener('click', () => {
  mStats = { streak: 0, byType: {} };
  CHORD_DB.forEach(c => mStats.byType[c.id] = { ok: 0, total: 0 });
  saveMStats();
  renderMStats();
});

renderMStats();
generateMainTask();
syncPianoMode();
