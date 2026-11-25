/* =========================================================
   6. TAB 2: FORMULA REFERENCE & STEP-BY-STEP INVERTER
========================================================= */
const fState = { chordId: 'dom7', rootPc: 0, invIdx: 0 };

function initFormulaTab() {
  const rootSel = document.getElementById('fRootSelect');
  NOTE_LAT.forEach((l, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${l} (${NOTE_RU[i]})`;
    rootSel.appendChild(opt);
  });
  rootSel.addEventListener('change', e => { fState.rootPc = Number(e.target.value); updateFormulaView(); });

  document.getElementById('fPlayChordBtn').addEventListener('click', () => audio.playChord(getFormulaNotes(), 1.05, 0));
  document.getElementById('fPlayArpBtn').addEventListener('click', () => audio.playChord(getFormulaNotes(), 1.05, 0.22));
  updateFormulaView();
}

function getFormulaNotes() {
  const ch = CHORD_DB.find(c => c.id === fState.chordId);
  return buildInversionNotes(60 + fState.rootPc, ch.intervals, fState.invIdx);
}

function updateFormulaView() {
  const tbody = document.getElementById('fTableBody');
  tbody.innerHTML = '';
  CHORD_DB.forEach(c => {
    const tr = document.createElement('tr');
    tr.className = 'clickable-row' + (c.id === fState.chordId ? ' selected-row' : '');
    tr.innerHTML = `
      <td><strong class="mono" style="color:var(--accent);">${c.short}</strong></td>
      <td>${c.name}</td>
      <td class="mono" style="color:var(--text-muted);">${c.intervals.join(', ')}</td>
      <td style="font-size:11.5px; color:var(--text-muted);">${c.thirds}</td>
    `;
    tr.addEventListener('click', () => {
      fState.chordId = c.id;
      fState.invIdx = 0;
      updateFormulaView();
      audio.playChord(getFormulaNotes(), 0.95, 0);
    });
    tbody.appendChild(tr);
  });

  const ch = CHORD_DB.find(c => c.id === fState.chordId);
  const fMode = getFormulaAccidentalMode();
  if (document.getElementById('sec-formulas').classList.contains('active')) {
    pianoUI.setAccidentalMode(fMode);
  }
  const latTbl = fMode === 'flat' ? NOTE_LAT_FLAT : NOTE_LAT_SHARP;
  document.getElementById('fSelTitle').textContent = `${latTbl[fState.rootPc]}${ch.lat} — ${ch.name}`;

  const pills = document.getElementById('fInvPills');
  pills.innerHTML = '';
  ch.invCodes.forEach((code, idx) => {
    const b = document.createElement('button');
    b.className = 'inv-pill' + (idx === fState.invIdx ? ' active' : '');
    b.textContent = idx === 0 ? `Основной (${code})` : code;
    b.addEventListener('click', () => {
      fState.invIdx = idx;
      updateFormulaView();
      audio.playChord(getFormulaNotes(), 0.95, 0);
    });
    pills.appendChild(b);
  });

  const notes = getFormulaNotes();
  const diffs = [];
  for (let i = 1; i < notes.length; i++) diffs.push(`${notes[i] - notes[i-1]} пт`);
  document.getElementById('fIntervalExplain').innerHTML = `
    <div><strong>Ноты:</strong> <span class="mono" style="color:var(--accent);">${notes.map(m => midiToRu(m, fMode)).join(' – ')}</span></div>
    <div style="margin-top:3px;"><strong>Интервалы снизу вверх:</strong> <span class="mono">${diffs.join(' + ')}</span> · Бас: <strong>${TONE_ROLES[fState.invIdx]}</strong></div>
  `;

  renderGrandStaff(document.getElementById('fStaffSvg'), notes.map(m => ({ midi: m, color: '#38bdf8' })), null, fMode);
}

initFormulaTab();

/* =========================================================
   7. TAB 3: EAR TRAINER
========================================================= */
const eState = { q: null, answered: false, streak: 0, ok: 0, total: 0 };

function playEarQuestion(q, slow = false) {
  if (!q) return;
  if (q.mode === 'harm_dict') {
    q.tonicChord.forEach(m => audio.playNote(m, 0.7, 0, 0.72));
    const stepSec = slow ? 1.45 : 0.95;
    q.chordSeq.forEach((ch, idx) => {
      ch.notes.forEach(m => audio.playNote(m, slow ? 1.25 : 0.8, 1.05 + idx * stepSec, 0.78));
    });
  } else if (q.mode === 'mel_dict') {
    q.tonicChord.forEach(m => audio.playNote(m, 0.65, 0, 0.7));
    audio.playNote(q.melody[0], 0.65, 0.85, 0.85);
    q.melody.forEach((m, idx) => {
      audio.playNote(m, 0.48, 1.85 + idx * 0.56, 0.85);
    });
  } else if (q.mode === 'degrees' && q.cadence) {
    q.cadence.forEach((ch, idx) => {
      ch.forEach(m => audio.playNote(m, 0.52, idx * 0.62, 0.68));
    });
    audio.playNote(q.notes[0], 1.15, q.cadence.length * 0.62 + 0.35, 0.85);
  } else if (q.isInterval) {
    const arp = q.dir === 'harm' ? 0 : 0.42;
    audio.playChord(q.notes, 0.95, arp);
  } else {
    audio.playChord(q.notes, 1.0, 0);
  }
}

const HARM_DICT_FUNCS = ['T', 'T6', 'S', 'S6', 'K64', 'D', 'D7', 'D43', 'VI'];
const HARM_DICT_PROGS = [
  ['T', 'S', 'D', 'T'],
  ['T', 'VI', 'S', 'D7'],
  ['T', 'T6', 'S', 'K64'],
  ['T', 'D43', 'T6', 'D'],
  ['T', 'S6', 'D', 'T'],
  ['T', 'D7', 'VI', 'S'],
  ['T', 'S', 'K64', 'D7']
];

function renderHarmDictUI(results = null) {
  const slotsEl = document.getElementById('eHarmSlots');
  slotsEl.innerHTML = '';
  const userSeq = eState.q ? eState.q.userSeq : [];
  for (let i = 0; i < 4; i++) {
    const s = document.createElement('div');
    const val = userSeq[i] || '';
    let cls = 'dict-slot' + (val ? ' filled' : '');
    if (results) cls += results[i] ? ' correct' : ' wrong';
    s.className = cls;
    s.textContent = val || `${i + 1}`;
    s.addEventListener('click', () => {
      if (eState.answered || !eState.q) return;
      eState.q.userSeq[i] = '';
      renderHarmDictUI();
    });
    slotsEl.appendChild(s);
  }
  const pal = document.getElementById('eHarmPalette');
  pal.innerHTML = '';
  HARM_DICT_FUNCS.forEach(fn => {
    const b = document.createElement('button');
    b.className = 'btn btn-sm';
    b.textContent = fn;
    b.addEventListener('click', () => {
      if (eState.answered || !eState.q) return;
      const emptyIdx = eState.q.userSeq.findIndex(x => !x);
      if (emptyIdx >= 0) {
        eState.q.userSeq[emptyIdx] = fn;
        renderHarmDictUI();
      }
    });
    pal.appendChild(b);
  });
}

function renderMelDictStaff(results = null) {
  const svg = document.getElementById('eMelStaffSvg');
  if (!eState.q || eState.q.mode !== 'mel_dict') return;
  const stepH = 5.5;
  const trebleBottomY = 92; // E4 (d=30)
  const lines = [0,1,2,3,4].map(i => trebleBottomY - i * 2 * stepH);
  let out = '';
  lines.forEach(y => out += `<line x1="16" y1="${y}" x2="344" y2="${y}" stroke="#384661" stroke-width="1.2"/>`);
  out += `<text x="20" y="${trebleBottomY - 4}" fill="#94a3b8" font-size="44" font-family="serif">𝄞</text>`;

  const userMel = eState.q.userMelody;
  const n = eState.q.melody.length;
  const startX = 82;
  const gap = Math.min(44, Math.floor(240 / Math.max(1, n)));

  for (let i = 0; i < n; i++) {
    const cx = startX + i * gap;
    if (i < userMel.length) {
      const m = userMel[i];
      const pc = ((m % 12) + 12) % 12;
      const oct = Math.floor(m / 12) - 1;
      const info = PC_SHARP[pc];
      const d = oct * 7 + info.step;
      const y = trebleBottomY - (d - 30) * stepH;
      let color = i === 0 ? '#38bdf8' : '#e2e8f0';
      if (results) color = results[i] ? '#22c55e' : '#ef4444';
      if (d <= 28) {
        for (let ld = 28; ld >= d; ld -= 2) {
          const ly = trebleBottomY - (ld - 30) * stepH;
          out += `<line x1="${cx - 10}" y1="${ly}" x2="${cx + 10}" y2="${ly}" stroke="#64748b" stroke-width="1.3"/>`;
        }
      }
      if (info.acc) out += `<text x="${cx - 14}" y="${y + 4}" fill="${color}" font-size="13" font-weight="700">${info.acc}</text>`;
      out += `<ellipse cx="${cx}" cy="${y}" rx="6.5" ry="4.5" transform="rotate(-16 ${cx} ${y})" fill="${color}"/>`;
    } else {
      out += `<circle cx="${cx}" cy="${trebleBottomY - 11}" r="3" fill="#334155"/>`;
    }
  }
  svg.innerHTML = out;
}

function handleEarMelNoteInput(midi) {
  if (!eState.q || eState.q.mode !== 'mel_dict' || eState.answered) return;
  if (eState.q.userMelody.length >= eState.q.melody.length) return;
  eState.q.userMelody.push(midi);
  renderMelDictStaff();
}

function nextEarQuestion() {
  eState.answered = false;
  const mode = document.getElementById('eFilterSelect').value;
  const isIntervalMode = mode === 'intervals_basic' || mode === 'intervals_all';
  const isHarmDict = mode === 'harm_dict';
  const isMelDict = mode === 'mel_dict';

  document.getElementById('eIntervalDirRow').style.display = isIntervalMode ? 'flex' : 'none';
  document.getElementById('eMelLenRow').style.display = isMelDict ? 'flex' : 'none';
  document.getElementById('eAnswersGrid').style.display = (isHarmDict || isMelDict) ? 'none' : 'grid';
  document.getElementById('eHarmDictBox').style.display = isHarmDict ? 'block' : 'none';
  document.getElementById('eMelDictBox').style.display = isMelDict ? 'block' : 'none';
  syncPianoMode();

  const fb = document.getElementById('eFeedback');
  fb.textContent = '';

  if (isHarmDict) {
    const prog = HARM_DICT_PROGS[Math.floor(Math.random() * HARM_DICT_PROGS.length)];
    const keyObj = { root: 0, mode: 'major', name: 'До мажор' };
    const tonicChord = [60, 64, 67];
    const chordSeq = prog.map(cid => {
      const spec = getChordSpec(cid, keyObj);
      const bassPc = spec.pcs[spec.bassDeg] !== undefined ? spec.pcs[spec.bassDeg] : spec.pcs[0];
      const bass = 48 + bassPc;
      const upper = spec.pcs.map(pc => {
        let n = 60 + pc;
        if (n <= bass + 4) n += 12;
        return n;
      });
      return { cid, notes: [bass, ...upper] };
    });
    eState.q = { mode: 'harm_dict', prog, tonicChord, chordSeq, userSeq: ['', '', '', ''], notes: tonicChord };
    document.getElementById('eResolveBtn').style.display = 'none';
    document.getElementById('ePrompt').textContent = 'Прозвучала настройка (До мажор) и цепочка из 4 аккордов. Соберите её по шагам:';
    renderHarmDictUI();
    playEarQuestion(eState.q, false);
    return;
  }

  if (isMelDict) {
    const len = Number(document.getElementById('eMelLenSelect').value) || 4;
    const scaleMidis = [60, 62, 64, 65, 67, 69, 71, 72]; // C4..C5
    const melody = [60]; // Reference start note C4
    let curIdx = 0;
    for (let i = 1; i < len; i++) {
      const step = [-2, -1, 1, 2][Math.floor(Math.random() * 4)];
      curIdx = Math.max(0, Math.min(scaleMidis.length - 1, curIdx + step));
      melody.push(scaleMidis[curIdx]);
    }
    eState.q = { mode: 'mel_dict', tonicChord: [60, 64, 67], melody, userMelody: [melody[0]], notes: melody };
    document.getElementById('eResolveBtn').style.display = 'none';
    document.getElementById('ePrompt').textContent = `Прозвучало трезвучие и мелодия из ${len} нот (1-я нота показана). Запишите остальные ноты с пианино:`;
    renderMelDictStaff();
    playEarQuestion(eState.q);
    return;
  }

  let options = [], pick, root, notes, resNotes = null, promptText = 'Какой аккорд / обращение прозвучало?';
  let extra = { mode };

  if (mode === 'triads') {
    const list = [
      { id:'maj0', t:'Б53', s:'Маж. основное', iv:[0,4,7], inv:0 },
      { id:'maj1', t:'Б6', s:'Маж. секстаккорд', iv:[0,4,7], inv:1 },
      { id:'maj2', t:'Б64', s:'Маж. квартсекст.', iv:[0,4,7], inv:2 },
      { id:'min0', t:'М53', s:'Мин. основное', iv:[0,3,7], inv:0 },
      { id:'min1', t:'М6', s:'Мин. секстаккорд', iv:[0,3,7], inv:1 },
      { id:'min2', t:'М64', s:'Мин. квартсекст.', iv:[0,3,7], inv:2 },
      { id:'dim0', t:'Ум53', s:'Уменьшённое', iv:[0,3,6], inv:0 },
      { id:'aug0', t:'Ув53', s:'Увеличенное', iv:[0,4,8], inv:0 }
    ];
    options = list;
    pick = list[Math.floor(Math.random() * list.length)];
    root = 53 + Math.floor(Math.random() * 10);
    notes = buildInversionNotes(root, pick.iv, pick.inv);
  } else if (mode === 'sevenths') {
    const list = CHORD_DB.filter(c => c.is7).map(c => ({ id: c.id, t: c.short.split(' ')[0], s: c.name, iv: c.intervals, inv: 0 }));
    options = list;
    pick = list[Math.floor(Math.random() * list.length)];
    root = 55 + Math.floor(Math.random() * 8);
    notes = buildInversionNotes(root, pick.iv, 0);
    if (pick.id === 'dom7') resNotes = [root + 5, root + 9, root + 12];
    if (pick.id === 'dim7') resNotes = [root + 1, root + 5, root + 8];
  } else if (mode === 'dom_inv') {
    const list = [
      { id:'D7', t:'D7', s:'Доминантсепт', iv:[0,4,7,10], inv:0, off:-5 },
      { id:'D65', t:'D65', s:'Квинтсекстаккорд', iv:[0,4,7,10], inv:1, off:-5 },
      { id:'D43', t:'D43', s:'Терцквартаккорд', iv:[0,4,7,10], inv:2, off:-5 },
      { id:'D2', t:'D2', s:'Секундаккорд', iv:[0,4,7,10], inv:3, off:-5 },
      { id:'vii7', t:'УмVII7', s:'Ум. вводный', iv:[0,3,6,9], inv:0, off:-1 },
      { id:'vii65', t:'УмVII65', s:'Ум. вводный 65', iv:[0,3,6,9], inv:1, off:-1 }
    ];
    options = list;
    pick = list[Math.floor(Math.random() * list.length)];
    const tonic = 60 + Math.floor(Math.random() * 5);
    notes = buildInversionNotes(tonic + pick.off, pick.iv, pick.inv);
    resNotes = pick.id === 'D2' ? buildInversionNotes(tonic, [0,4,7], 1) : [tonic, tonic + 4, tonic + 7];
  } else if (isIntervalMode) {
    const dir = document.getElementById('eIntervalDir').value;
    const ivList = mode === 'intervals_basic' ? INTERVALS_DB.filter(x => x.basic) : INTERVALS_DB;
    options = ivList.map(x => ({
      id: x.id,
      t: `${x.short} — ${x.semi} пт`,
      s: x.hint,
      semi: x.semi,
      name: x.name
    }));
    pick = options[Math.floor(Math.random() * options.length)];
    const base = 55 + Math.floor(Math.random() * 12);
    notes = pick.semi === 0 ? [base] : (dir === 'down' ? [base + pick.semi, base] : [base, base + pick.semi]);
    extra = { mode, isInterval: true, dir };
    promptText = `Какой интервал прозвучал? (${dir === 'up' ? 'вверх' : dir === 'down' ? 'вниз' : 'гармонически'})`;
  } else if (mode === 'degrees') {
    const isMinor = Math.random() < 0.4;
    const tonic = isMinor ? 57 : 60; // A3 (Ля минор) or C4 (До мажор)
    const scale = isMinor ? [0,2,3,5,7,8,10] : [0,2,4,5,7,9,11];
    const romans = ['I','II','III','IV','V','VI','VII'];
    const degHints = ['тоника (устой)', 'II ступень', 'медианта', 'субдоминанта', 'доминанта', 'VI ступень', 'вводный тон'];
    const keyLabel = isMinor ? 'Ля минор' : 'До мажор';
    const cadence = isMinor
      ? [[57,60,64], [62,65,69], [64,68,71], [57,60,64]]
      : [[60,64,67], [65,69,72], [67,71,74], [60,64,67]];
    options = romans.map((r, i) => ({
      id: 'deg_' + i,
      t: r,
      s: `${NOTE_RU[(tonic + scale[i]) % 12]} · ${degHints[i]}`,
      midi: tonic + scale[i]
    }));
    pick = options[Math.floor(Math.random() * options.length)];
    notes = [pick.midi];
    extra = { mode, cadence };
    promptText = `Прозвучала настройка (${keyLabel}: I–IV–V–I). Какая это ступень?`;
  }

  eState.q = { ansId: pick.id, ansText: `${pick.t} (${pick.s})`, notes, resNotes, ...extra };
  document.getElementById('eResolveBtn').style.display = resNotes ? 'inline-flex' : 'none';
  document.getElementById('ePrompt').textContent = promptText;

  const grid = document.getElementById('eAnswersGrid');
  grid.classList.toggle('many-cols', options.length >= 7);
  grid.innerHTML = '';
  options.forEach(o => {
    const b = document.createElement('button');
    b.className = 'answer-btn';
    b.dataset.id = o.id;
    b.innerHTML = `<span>${o.t}</span><span class="sub">${o.s}</span>`;
    b.addEventListener('click', () => {
      if (eState.answered) return;
      eState.answered = true;
      eState.total++;
      if (o.id === eState.q.ansId) {
        b.classList.add('correct');
        eState.ok++;
        eState.streak++;
        fb.innerHTML = `<span style="color:var(--success);">Верно! ${eState.q.ansText}</span>`;
      } else {
        b.classList.add('wrong');
        eState.streak = 0;
        grid.querySelectorAll('.answer-btn').forEach(x => { if (x.dataset.id === eState.q.ansId) x.classList.add('correct'); });
        fb.innerHTML = `<span style="color:var(--danger);">Ошибка. Ответ: ${eState.q.ansText}</span>`;
      }
      document.getElementById('eStreakVal').textContent = eState.streak;
      document.getElementById('eAccVal').textContent = Math.round((eState.ok / eState.total) * 100) + '%';
      eState.q.notes.forEach(m => pianoUI.flashHighlight(m, 1100));
    });
    grid.appendChild(b);
  });
  playEarQuestion(eState.q);
}

document.getElementById('eFilterSelect').addEventListener('change', () => {
  const mode = document.getElementById('eFilterSelect').value;
  document.getElementById('eIntervalDirRow').style.display = (mode === 'intervals_basic' || mode === 'intervals_all') ? 'flex' : 'none';
  document.getElementById('eMelLenRow').style.display = mode === 'mel_dict' ? 'flex' : 'none';
  if (mode === 'mel_dict' && document.body.classList.contains('is-mobile')) setPianoCollapsed(false);
  nextEarQuestion();
});
document.getElementById('eIntervalDir').addEventListener('change', () => {
  if (eState.q && eState.q.isInterval) nextEarQuestion();
});
document.getElementById('eMelLenSelect').addEventListener('change', () => {
  if (eState.q && eState.q.mode === 'mel_dict') nextEarQuestion();
});
document.getElementById('eHarmSlowBtn').addEventListener('click', () => {
  if (eState.q && eState.q.mode === 'harm_dict') playEarQuestion(eState.q, true);
});
document.getElementById('eHarmClearBtn').addEventListener('click', () => {
  if (!eState.q || eState.q.mode !== 'harm_dict' || eState.answered) return;
  eState.q.userSeq = ['', '', '', ''];
  renderHarmDictUI();
});
document.getElementById('eHarmCheckBtn').addEventListener('click', () => {
  if (!eState.q || eState.q.mode !== 'harm_dict' || eState.answered) return;
  const fb = document.getElementById('eFeedback');
  if (eState.q.userSeq.some(x => !x)) {
    fb.innerHTML = `<span style="color:var(--warn);">Заполните все 4 шага цепочки!</span>`;
    return;
  }
  eState.answered = true;
  eState.total++;
  const results = eState.q.prog.map((ans, i) => eState.q.userSeq[i] === ans);
  const ok = results.every(Boolean);
  if (ok) {
    eState.ok++;
    eState.streak++;
    fb.innerHTML = `<span style="color:var(--success);">Верно! Цепочка: ${eState.q.prog.join(' – ')}</span>`;
  } else {
    eState.streak = 0;
    fb.innerHTML = `<span style="color:var(--danger);">Есть ошибки. Правильно: ${eState.q.prog.join(' – ')}</span>`;
  }
  renderHarmDictUI(results);
  document.getElementById('eStreakVal').textContent = eState.streak;
  document.getElementById('eAccVal').textContent = Math.round((eState.ok / eState.total) * 100) + '%';
});
document.getElementById('eMelBackBtn').addEventListener('click', () => {
  if (!eState.q || eState.q.mode !== 'mel_dict' || eState.answered) return;
  if (eState.q.userMelody.length > 1) {
    eState.q.userMelody.pop();
    renderMelDictStaff();
  }
});
document.getElementById('eMelClearBtn').addEventListener('click', () => {
  if (!eState.q || eState.q.mode !== 'mel_dict' || eState.answered) return;
  eState.q.userMelody = [eState.q.melody[0]];
  renderMelDictStaff();
});
document.getElementById('eMelCheckBtn').addEventListener('click', () => {
  if (!eState.q || eState.q.mode !== 'mel_dict' || eState.answered) return;
  const fb = document.getElementById('eFeedback');
  if (eState.q.userMelody.length < eState.q.melody.length) {
    fb.innerHTML = `<span style="color:var(--warn);">Наберите все ${eState.q.melody.length} нот на клавиатуре пианино.</span>`;
    return;
  }
  eState.answered = true;
  eState.total++;
  const results = eState.q.melody.map((m, i) => eState.q.userMelody[i] === m);
  const ok = results.every(Boolean);
  if (ok) {
    eState.ok++;
    eState.streak++;
    fb.innerHTML = `<span style="color:var(--success);">Верно! Мелодия: ${eState.q.melody.map(midiToRu).join(' – ')}</span>`;
  } else {
    eState.streak = 0;
    fb.innerHTML = `<span style="color:var(--danger);">Есть ошибки. Правильно: ${eState.q.melody.map(midiToRu).join(' – ')}</span>`;
  }
  renderMelDictStaff(results);
  document.getElementById('eStreakVal').textContent = eState.streak;
  document.getElementById('eAccVal').textContent = Math.round((eState.ok / eState.total) * 100) + '%';
});
document.getElementById('eNextBtn').addEventListener('click', nextEarQuestion);
document.getElementById('eRepeatBtn').addEventListener('click', () => playEarQuestion(eState.q));
document.getElementById('eArpBtn').addEventListener('click', () => { if (eState.q) audio.playChord(eState.q.notes, 1.0, 0.22); });
document.getElementById('eResolveBtn').addEventListener('click', () => {
  if (!eState.q || !eState.q.resNotes) return;
  audio.playChord(eState.q.notes, 0.75, 0);
  setTimeout(() => audio.playChord(eState.q.resNotes, 1.05, 0), 820);
});
document.getElementById('eResetBtn').addEventListener('click', () => {
  eState.streak = 0; eState.ok = 0; eState.total = 0;
  document.getElementById('eStreakVal').textContent = '0';
  document.getElementById('eAccVal').textContent = '0%';
});

/* =========================================================
   8. TAB 4: HARMONIC SANDBOX (SMOOTH BASS CHECK)
========================================================= */
const SCALE_DEFS = {
  major: { steps:[0,2,4,5,7,9,11], q:['','m','m','','','m','dim'], triads:[[0,4,7],[0,3,7],[0,3,7],[0,4,7],[0,4,7],[0,3,7],[0,3,6]], romans:['I','ii','iii','IV','V','vi','vii°'], fns:['T','S','T','S','D','T','D'] },
  minor: { steps:[0,2,3,5,7,8,11], q:['m','dim','aug','m','','','dim'], triads:[[0,3,7],[0,3,6],[0,4,8],[0,3,7],[0,4,7],[0,4,7],[0,3,6]], romans:['i','ii°','III+','iv','V','VI','vii°'], fns:['T','S','T','S','D','T','D'] }
};

const sState = {
  rootPc: 0, mode: 'major', barsCount: 4,
  bars: [{deg:0,inv:0},{deg:4,inv:1},{deg:5,inv:0},{deg:3,inv:1},null,null,null,null],
  selectedBar: 0, bpm: 92, metro: true, playing: false, timer: null, tick: 0
};

function getSandboxChords() {
  const d = SCALE_DEFS[sState.mode];
  const latTbl = getSandboxAccidentalMode() === 'flat' ? NOTE_LAT_FLAT : NOTE_LAT_SHARP;
  return d.steps.map((st, idx) => {
    const pc = (sState.rootPc + st) % 12;
    return { idx, pc, roman: d.romans[idx], name: latTbl[pc] + d.q[idx], fn: d.fns[idx], iv: d.triads[idx] };
  });
}

function initSandbox() {
  const sel = document.getElementById('sKeyRoot');
  NOTE_LAT.forEach((l, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${l} (${NOTE_RU[i]})`;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', e => { sState.rootPc = Number(e.target.value); renderSandbox(); });
  document.getElementById('sKeyMode').addEventListener('change', e => { sState.mode = e.target.value; renderSandbox(); });
  document.getElementById('sBarsCount').addEventListener('change', e => { sState.barsCount = Number(e.target.value); renderSandboxBars(); });
  document.getElementById('sBpmSlider').addEventListener('input', e => {
    sState.bpm = Number(e.target.value);
    document.getElementById('sBpmVal').textContent = sState.bpm;
    if (sState.playing) { stopLoop(); startLoop(); }
  });
  document.getElementById('sMetroToggle').addEventListener('change', e => sState.metro = e.target.checked);
  document.getElementById('sClearBtn').addEventListener('click', () => { sState.bars.fill(null); renderSandboxBars(); });
  document.getElementById('sLoopBtn').addEventListener('click', () => sState.playing ? stopLoop() : startLoop());
  document.getElementById('sPresetSelect').addEventListener('change', e => {
    const v = e.target.value; if (!v) return;
    const map = {
      smooth: { n: 8, b: [{deg:0,inv:0},{deg:4,inv:1},{deg:5,inv:0},{deg:3,inv:1},{deg:0,inv:2},{deg:4,inv:0},{deg:0,inv:0},{deg:0,inv:0}] },
      classic: { n: 4, b: [{deg:0,inv:0},{deg:3,inv:2},{deg:4,inv:1},{deg:0,inv:0}] },
      jazz: { n: 4, b: [{deg:1,inv:0},{deg:4,inv:0},{deg:0,inv:0},{deg:5,inv:0}] }
    };
    const p = map[v];
    sState.barsCount = p.n;
    document.getElementById('sBarsCount').value = String(p.n);
    for (let i = 0; i < 8; i++) sState.bars[i] = p.b[i] ? { ...p.b[i] } : null;
    renderSandboxBars();
    e.target.value = '';
  });
  renderSandbox();
}

function renderSandbox() {
  if (document.getElementById('sec-sandbox').classList.contains('active')) {
    pianoUI.setAccidentalMode(getSandboxAccidentalMode());
  }
  const pal = document.getElementById('sDegreePalette');
  pal.innerHTML = '';
  getSandboxChords().forEach(ch => {
    const d = document.createElement('div');
    d.className = 'degree-card';
    d.innerHTML = `<span class="badge badge-${ch.fn}">${ch.fn}</span><strong class="mono">${ch.roman}</strong><span style="font-size:11px;color:var(--text-muted);">${ch.name}</span>`;
    d.addEventListener('click', () => {
      audio.playChord(buildInversionNotes(48 + ch.pc, ch.iv, 0), 0.85, 0);
      sState.bars[sState.selectedBar] = { deg: ch.idx, inv: 0 };
      sState.selectedBar = (sState.selectedBar + 1) % sState.barsCount;
      renderSandboxBars();
    });
    pal.appendChild(d);
  });
  renderSandboxBars();
}

function renderSandboxBars(activeIdx = -1) {
  const grid = document.getElementById('sBarsGrid');
  grid.innerHTML = '';
  const chords = getSandboxChords();
  let prevBass = null;

  for (let i = 0; i < sState.barsCount; i++) {
    const item = sState.bars[i];
    const ch = item ? chords[item.deg] : null;
    const slot = document.createElement('div');
    slot.className = 'bar-slot' + (ch ? ' filled' : '') + (i === sState.selectedBar ? ' selected' : '') + (i === activeIdx ? ' playing' : '');

    let inner = `<span class="bar-num">${i + 1}</span>`;
    if (ch) {
      const notes = buildInversionNotes(48 + ch.pc, ch.iv, item.inv);
      const bassMidi = notes[0];
      let bassTag = '';
      if (prevBass !== null) {
        const diff = Math.abs(bassMidi - prevBass);
        if (diff <= 2) bassTag = `<span class="bass-smooth-tag bass-ok">бас: плавно (${diff} пт)</span>`;
        else if (diff <= 4) bassTag = `<span class="bass-smooth-tag bass-ok">бас: терция (${diff} пт)</span>`;
        else bassTag = `<span class="bass-smooth-tag bass-jump">бас: скачок (${diff} пт)</span>`;
      }
      prevBass = bassMidi;

      const invCode = item.inv === 0 ? '53' : (item.inv === 1 ? '6' : '64');
      inner += `
        <button class="bar-clear" data-clr="${i}">✕</button>
        <span class="badge badge-${ch.fn}">${ch.fn}</span>
        <strong class="mono">${ch.roman}${item.inv > 0 ? invCode : ''} (${ch.name})</strong>
        <span style="font-size:11px; color:var(--text-muted);">Бас: ${midiToRuNoOct(bassMidi)}</span>
        <select class="bar-inv-sel" data-inv="${i}">
          <option value="0" ${item.inv===0?'selected':''}>5/3</option>
          <option value="1" ${item.inv===1?'selected':''}>6</option>
          <option value="2" ${item.inv===2?'selected':''}>6/4</option>
        </select>
        ${bassTag}
      `;
    } else {
      prevBass = null;
      inner += `<span style="font-size:11.5px; color:var(--text-dim);">Пусто</span>`;
    }
    slot.innerHTML = inner;

    slot.addEventListener('click', e => {
      if (e.target.closest('[data-inv]')) return;
      const clr = e.target.closest('[data-clr]');
      if (clr) { sState.bars[Number(clr.dataset.clr)] = null; renderSandboxBars(); return; }
      sState.selectedBar = i;
      if (ch) audio.playChord(buildInversionNotes(48 + ch.pc, ch.iv, item.inv), 0.75, 0);
      renderSandboxBars();
    });
    const invSel = slot.querySelector('[data-inv]');
    if (invSel) invSel.addEventListener('change', e => {
      sState.bars[i].inv = Number(e.target.value);
      audio.playChord(buildInversionNotes(48 + ch.pc, ch.iv, sState.bars[i].inv), 0.75, 0);
      renderSandboxBars();
    });
    grid.appendChild(slot);
  }
}

function startLoop() {
  sState.playing = true; sState.tick = 0;
  document.getElementById('sLoopBtn').textContent = '■ Остановить';
  const stepMs = (60 / sState.bpm) * 1000;
  const run = () => {
    if (!sState.playing) return;
    const barIdx = Math.floor(sState.tick / 4) % sState.barsCount;
    const beatIdx = sState.tick % 4;
    document.querySelectorAll('#sBeatDots .beat-dot').forEach((d, idx) => d.classList.toggle('active', idx === beatIdx));
    if (sState.metro) audio.playClick(beatIdx === 0);
    if (beatIdx === 0) {
      renderSandboxBars(barIdx);
      const item = sState.bars[barIdx];
      if (item) {
        const ch = getSandboxChords()[item.deg];
        audio.playChord(buildInversionNotes(48 + ch.pc, ch.iv, item.inv), (60 / sState.bpm) * 3.6, 0);
      }
    }
    sState.tick++;
  };
  run();
  sState.timer = setInterval(run, stepMs);
}

function stopLoop() {
  sState.playing = false;
  if (sState.timer) { clearInterval(sState.timer); sState.timer = null; }
  document.getElementById('sLoopBtn').textContent = '▶ Играть цикл';
  document.querySelectorAll('#sBeatDots .beat-dot').forEach(d => d.classList.remove('active'));
  renderSandboxBars(-1);
}

initSandbox();

/* =========================================================
   9.7. TAB 6: CIRCLE OF FIFTHS & KEY SIGNATURES
========================================================= */
const CIRCLE_KEYS = [
  { maj:'C',  majRu:'До мажор',      min:'Am',  minRu:'Ля минор',     sig:0,  majPc:0,  minPc:9 },
  { maj:'G',  majRu:'Соль мажор',    min:'Em',  minRu:'Ми минор',     sig:1,  majPc:7,  minPc:4 },
  { maj:'D',  majRu:'Ре мажор',      min:'Bm',  minRu:'Си минор',     sig:2,  majPc:2,  minPc:11 },
  { maj:'A',  majRu:'Ля мажор',      min:'F♯m', minRu:'Фа♯ минор',    sig:3,  majPc:9,  minPc:6 },
  { maj:'E',  majRu:'Ми мажор',      min:'C♯m', minRu:'До♯ минор',    sig:4,  majPc:4,  minPc:1 },
  { maj:'B',  majRu:'Си мажор',      min:'G♯m', minRu:'Соль♯ минор',  sig:5,  majPc:11, minPc:8 },
  { maj:'F♯', majRu:'Фа♯ мажор',     min:'D♯m', minRu:'Ре♯ минор',    sig:6,  majPc:6,  minPc:3 },
  { maj:'D♭', majRu:'Ре♭ мажор',     min:'B♭m', minRu:'Си♭ минор',    sig:-5, majPc:1,  minPc:10 },
  { maj:'A♭', majRu:'Ля♭ мажор',     min:'Fm',  minRu:'Фа минор',     sig:-4, majPc:8,  minPc:5 },
  { maj:'E♭', majRu:'Ми♭ мажор',     min:'Cm',  minRu:'До минор',     sig:-3, majPc:3,  minPc:0 },
  { maj:'B♭', majRu:'Си♭ мажор',     min:'Gm',  minRu:'Соль минор',   sig:-2, majPc:10, minPc:7 },
  { maj:'F',  majRu:'Фа мажор',      min:'Dm',  minRu:'Ре минор',     sig:-1, majPc:5,  minPc:2 }
];

const cState = { idx: 0, isMinor: false, quizSig: 0, quizAnswered: false };

function polarPoint(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function ringSectorPath(cx, cy, rIn, rOut, a1, a2) {
  const p1 = polarPoint(cx, cy, rOut, a1);
  const p2 = polarPoint(cx, cy, rOut, a2);
  const p3 = polarPoint(cx, cy, rIn, a2);
  const p4 = polarPoint(cx, cy, rIn, a1);
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${rOut} ${rOut} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)} A ${rIn} ${rIn} 0 0 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)} Z`;
}

function renderKeySigStaff(svgEl, sigCount, tonicNotes = null, mode = 'sharp') {
  const stepH = 5.5;
  const trebleBottomY = 80; // E4 (d=30)
  const lines = [0,1,2,3,4].map(i => trebleBottomY - i * 2 * stepH);
  let svg = '';
  lines.forEach(y => svg += `<line x1="20" y1="${y}" x2="340" y2="${y}" stroke="#384661" stroke-width="1.3"/>`);
  svg += `<text x="26" y="${trebleBottomY - 4}" fill="#94a3b8" font-size="44" font-family="serif">𝄞</text>`;

  const sharpSteps = [38, 35, 39, 36, 33, 37, 34]; // F5 C5 G5 D5 A4 E5 B4
  const flatSteps  = [34, 37, 33, 36, 32, 35, 31]; // B4 E5 A4 D5 G4 C5 F4
  const count = Math.abs(sigCount);
  const isSharp = sigCount >= 0;
  const arr = isSharp ? sharpSteps : flatSteps;
  const sym = isSharp ? '♯' : '♭';

  for (let i = 0; i < count; i++) {
    const d = arr[i];
    const y = trebleBottomY - (d - 30) * stepH;
    const x = 74 + i * 16;
    svg += `<text x="${x}" y="${y + 5}" fill="#fbbf24" font-size="18" font-weight="700">${sym}</text>`;
  }

  if (tonicNotes) {
    const tbl = mode === 'flat' ? PC_FLAT : PC_SHARP;
    tonicNotes.forEach((m, idx) => {
      const pc = ((m % 12) + 12) % 12;
      const oct = Math.floor(m / 12) - 1;
      const d = oct * 7 + tbl[pc].step;
      const y = trebleBottomY - (d - 30) * stepH;
      const cx = 240 + idx * 20;
      if (d <= 28) {
        for (let ld = 28; ld >= d; ld -= 2) {
          const ly = trebleBottomY - (ld - 30) * stepH;
          svg += `<line x1="${cx - 10}" y1="${ly}" x2="${cx + 10}" y2="${ly}" stroke="#64748b" stroke-width="1.3"/>`;
        }
      }
      svg += `<ellipse cx="${cx}" cy="${y}" rx="6.5" ry="4.5" transform="rotate(-18 ${cx} ${y})" fill="#38bdf8"/>`;
    });
  }
  svgEl.innerHTML = svg;
}

function getCircleTonicNotes() {
  const k = CIRCLE_KEYS[cState.idx];
  const pc = cState.isMinor ? k.minPc : k.majPc;
  const iv = cState.isMinor ? [0, 3, 7] : [0, 4, 7];
  return buildInversionNotes(60 + pc, iv, 0);
}

function renderCircleWheel() {
  const svg = document.getElementById('cWheelSvg');
  const cx = 210, cy = 210;
  const leftIdx = (cState.idx + 11) % 12;
  const rightIdx = (cState.idx + 1) % 12;
  let out = '';

  CIRCLE_KEYS.forEach((k, i) => {
    const a1 = i * 30 - 15;
    const a2 = i * 30 + 15;
    const mid = i * 30;

    const isSelMaj = (i === cState.idx && !cState.isMinor);
    const isSelMin = (i === cState.idx && cState.isMinor);
    const isNeighbor = (i === leftIdx || i === rightIdx);
    const isRel = (i === cState.idx || isNeighbor);

    const majFill = isSelMaj ? '#0284c7' : (isNeighbor && !cState.isMinor ? '#065f46' : (isRel ? '#312e81' : '#171e2b'));
    const minFill = isSelMin ? '#0284c7' : (isNeighbor && cState.isMinor ? '#065f46' : (isRel ? '#312e81' : '#111621'));

    out += `<path class="circle-sector" data-cidx="${i}" data-cmin="0" d="${ringSectorPath(cx, cy, 122, 192, a1, a2)}" fill="${majFill}" stroke="#273144" stroke-width="1.5"/>`;
    out += `<path class="circle-sector" data-cidx="${i}" data-cmin="1" d="${ringSectorPath(cx, cy, 62, 120, a1, a2)}" fill="${minFill}" stroke="#273144" stroke-width="1.5"/>`;

    const pMaj = polarPoint(cx, cy, 158, mid);
    const pMin = polarPoint(cx, cy, 92, mid);
    out += `<text x="${pMaj.x.toFixed(1)}" y="${(pMaj.y + 5).toFixed(1)}" text-anchor="middle" fill="#edf2f7" font-size="14" font-weight="700" pointer-events="none">${k.maj}</text>`;
    out += `<text x="${pMin.x.toFixed(1)}" y="${(pMin.y + 4).toFixed(1)}" text-anchor="middle" fill="#cbd5e1" font-size="11.5" font-weight="600" pointer-events="none">${k.min}</text>`;
  });

  const cur = CIRCLE_KEYS[cState.idx];
  const sigTxt = cur.sig === 0 ? '0 знаков' : (cur.sig > 0 ? `${cur.sig}♯` : `${Math.abs(cur.sig)}♭`);
  out += `<circle cx="${cx}" cy="${cy}" r="58" fill="#090c12" stroke="#384661" stroke-width="1.5"/>`;
  out += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#38bdf8" font-size="18" font-weight="800">${cState.isMinor ? cur.min : cur.maj}</text>`;
  out += `<text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="#94a3b8" font-size="12">${sigTxt}</text>`;

  svg.innerHTML = out;
  svg.querySelectorAll('[data-cidx]').forEach(el => {
    el.addEventListener('click', () => {
      selectCircleKey(Number(el.dataset.cidx), el.dataset.cmin === '1', true);
    });
  });
}

function selectCircleKey(idx, isMinor, playSound = false) {
  cState.idx = idx;
  cState.isMinor = isMinor;
  const cur = CIRCLE_KEYS[idx];
  const left = CIRCLE_KEYS[(idx + 11) % 12];
  const right = CIRCLE_KEYS[(idx + 1) % 12];
  const accMode = cur.sig < 0 ? 'flat' : 'sharp';
  pianoUI.setAccidentalMode(accMode);

  document.getElementById('cSelTitle').textContent = isMinor ? `${cur.minRu} (${cur.min})` : `${cur.majRu} (${cur.maj})`;
  const sigLabel = cur.sig === 0 ? '0 знаков при ключе' : (cur.sig > 0 ? `${cur.sig} диез(а/ов)` : `${Math.abs(cur.sig)} бемоль(я/ей)`);
  const parLabel = isMinor ? `${cur.majRu} (${cur.maj})` : `${cur.minRu} (${cur.min})`;
  document.getElementById('cSelMeta').textContent = `${sigLabel} · Параллельная: ${parLabel}`;

  const related = [
    { label: `Паралл.: ${isMinor ? cur.maj : cur.min}`, idx, min: !isMinor },
    { label: `S: ${isMinor ? left.min : left.maj}`, idx: (idx + 11) % 12, min: isMinor },
    { label: `S паралл.: ${isMinor ? left.maj : left.min}`, idx: (idx + 11) % 12, min: !isMinor },
    { label: `D: ${isMinor ? right.min : right.maj}`, idx: (idx + 1) % 12, min: isMinor },
    { label: `D паралл.: ${isMinor ? right.maj : right.min}`, idx: (idx + 1) % 12, min: !isMinor },
    { label: `Одноим.: ${isMinor ? cur.maj : cur.min.replace('m', '') + 'm'}`, idx, min: isMinor }
  ];
  const pills = document.getElementById('cRelatedPills');
  pills.innerHTML = '';
  related.forEach((r, rIdx) => {
    const b = document.createElement('button');
    b.className = 'related-pill';
    b.textContent = r.label;
    if (rIdx < 5) b.addEventListener('click', () => selectCircleKey(r.idx, r.min, true));
    pills.appendChild(b);
  });

  const tonicNotes = getCircleTonicNotes();
  renderKeySigStaff(document.getElementById('cKeySigSvg'), cur.sig, tonicNotes, accMode);
  renderCircleWheel();
  if (playSound) audio.playChord(tonicNotes, 0.95, 0);
}

const QUIZ_KEY_SIGS = [
  ...CIRCLE_KEYS.map(k => ({ sig: k.sig, label: `${k.maj} / ${k.min}` })),
  { sig: 7,  label: 'C♯ / A♯m' },
  { sig: -7, label: 'C♭ / A♭m' },
  { sig: -6, label: 'G♭ / E♭m' }
];

function nextCircleQuiz() {
  cState.quizAnswered = false;
  const sigs = [-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7];
  const pickSig = sigs[Math.floor(Math.random() * sigs.length)];
  cState.quizSig = pickSig;
  renderKeySigStaff(document.getElementById('cQuizSvg'), pickSig, null, pickSig < 0 ? 'flat' : 'sharp');
  document.getElementById('cQuizFeedback').textContent = '';

  const grid = document.getElementById('cQuizGrid');
  grid.innerHTML = '';
  const sortedOpts = [...QUIZ_KEY_SIGS].sort((a, b) => a.sig - b.sig);
  sortedOpts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'quiz-key-btn';
    b.dataset.sig = o.sig;
    b.textContent = o.label;
    b.addEventListener('click', () => {
      if (cState.quizAnswered) return;
      cState.quizAnswered = true;
      const fb = document.getElementById('cQuizFeedback');
      const rightMatch = (o.sig === cState.quizSig) || (Math.abs(o.sig) === 6 && Math.abs(cState.quizSig) === 6 && o.sig === cState.quizSig);
      if (rightMatch) {
        b.classList.add('correct');
        fb.innerHTML = `<span style="color:var(--success); font-weight:700;">Верно! ${o.label}</span>`;
      } else {
        b.classList.add('wrong');
        const corr = grid.querySelector(`[data-sig="${cState.quizSig}"]`);
        if (corr) corr.classList.add('correct');
        const corrObj = QUIZ_KEY_SIGS.find(x => x.sig === cState.quizSig);
        fb.innerHTML = `<span style="color:var(--danger); font-weight:700;">Неверно. Ответ: ${corrObj ? corrObj.label : ''}</span>`;
      }
    });
    grid.appendChild(b);
  });
}

document.getElementById('cPlayTonicBtn').addEventListener('click', () => audio.playChord(getCircleTonicNotes(), 1.0, 0));
document.getElementById('cQuizNewBtn').addEventListener('click', nextCircleQuiz);
selectCircleKey(0, false, false);
nextCircleQuiz();
