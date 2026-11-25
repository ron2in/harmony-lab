/* =========================================================
   9.5. TAB: NOTES & BASICS (FOR BEGINNERS)
========================================================= */
const B_RECORD_KEY = 'harmony_basics_record_v1';
const bState = {
  mode: 'read',
  q: null,
  answered: false,
  streak: 0,
  best: (() => { try { return Number(localStorage.getItem(B_RECORD_KEY)) || 0; } catch { return 0; } })(),
  timerRunning: false,
  timerLeft: 60,
  timerScore: 0,
  timerInterval: null,
  advanceTimer: null,
  earQ: null,
  earAnswered: false,
  earStreak: 0,
  earOk: 0,
  earTotal: 0
};

const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];
const isWhiteMidi = m => WHITE_PCS.includes(((m % 12) + 12) % 12);

function renderBasicsNoteButtons() {
  const diff = document.getElementById('bDiffSel').value;
  const grid = document.getElementById('bNoteGrid');
  grid.innerHTML = '';
  const pcs = diff === 'accidental'
    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : WHITE_PCS;
  pcs.forEach(pc => {
    const btn = document.createElement('button');
    btn.className = 'note-btn';
    btn.dataset.pc = pc;
    btn.textContent = NOTE_RU[pc];
    btn.addEventListener('click', () => checkBasicsReadAnswer(pc, null, btn));
    grid.appendChild(btn);
  });
}

function generateBasicsReadQuestion() {
  if (bState.advanceTimer) { clearTimeout(bState.advanceTimer); bState.advanceTimer = null; }
  bState.answered = false;
  pianoUI.clearStatuses();
  document.getElementById('bFeedback').className = 'basics-feedback';
  document.getElementById('bFeedback').textContent = '';
  document.querySelectorAll('#bNoteGrid .note-btn').forEach(b => b.classList.remove('correct', 'wrong'));

  const clefPref = document.getElementById('bClefSel').value;
  const diff = document.getElementById('bDiffSel').value;
  const useTreble = clefPref === 'treble' || (clefPref === 'both' && Math.random() < 0.5);

  let minM, maxM;
  if (useTreble) {
    minM = diff === 'white' ? 64 : 60; // E4..F5 (in-staff) or C4..A5 (with ledger)
    maxM = diff === 'white' ? 77 : 81;
  } else {
    // Keep within C3 (48) .. B3 (59) / D4 (62) so every note is playable on C3–B5 piano
    minM = 48;
    maxM = diff === 'ledger' ? 62 : 59;
  }

  const pool = [];
  for (let m = minM; m <= maxM; m++) {
    if (diff !== 'accidental' && !isWhiteMidi(m)) continue;
    pool.push(m);
  }
  let midi = pool[Math.floor(Math.random() * pool.length)];
  if (bState.q && pool.length > 1 && midi === bState.q.midi) {
    midi = pool[(pool.indexOf(midi) + 1) % pool.length];
  }

  bState.q = { midi, pc: midi % 12 };
  renderGrandStaff(document.getElementById('bStaffSvg'), [{ midi, color: '#38bdf8' }]);
}

function checkBasicsReadAnswer(pc, exactMidi = null, btnEl = null) {
  if (!bState.q || bState.answered) return;
  const octMode = document.getElementById('bOctMode').checked;
  const fb = document.getElementById('bFeedback');

  const isCorrect = (exactMidi !== null && octMode)
    ? exactMidi === bState.q.midi
    : pc === bState.q.pc;

  if (isCorrect) {
    bState.answered = true;
    bState.streak++;
    document.getElementById('bStreak').textContent = bState.streak;
    if (btnEl) btnEl.classList.add('correct');
    else {
      const matchBtn = document.querySelector(`#bNoteGrid .note-btn[data-pc="${bState.q.pc}"]`);
      if (matchBtn) matchBtn.classList.add('correct');
    }
    pianoUI.clearStatuses();
    pianoUI.setKeyClass([bState.q.midi], 'check-ok');
    renderGrandStaff(document.getElementById('bStaffSvg'), [{ midi: bState.q.midi, color: '#22c55e' }]);
    audio.playNote(bState.q.midi, 0.65, 0, 0.8);
    fb.className = 'basics-feedback ok';
    fb.textContent = `Верно! Это ${midiToRu(bState.q.midi)}`;

    if (bState.timerRunning) {
      bState.timerScore++;
      document.getElementById('bTimerScore').textContent = bState.timerScore;
    }
    bState.advanceTimer = setTimeout(generateBasicsReadQuestion, 700);
  } else {
    bState.streak = 0;
    document.getElementById('bStreak').textContent = '0';
    if (btnEl) btnEl.classList.add('wrong');
    if (exactMidi !== null) {
      pianoUI.setKeyClass([exactMidi], 'check-err');
      setTimeout(() => pianoUI.clearStatuses(), 450);
    }
    fb.className = 'basics-feedback err';
    fb.textContent = (exactMidi !== null && octMode && pc === bState.q.pc)
      ? `Название верное (${NOTE_RU[pc]}), но нужна другая октава!`
      : `Неверно (${NOTE_RU[pc]}). Попробуйте ещё раз!`;
  }
}

function toggleBasicsTimer() {
  const btn = document.getElementById('bTimerBtn');
  const disp = document.getElementById('bTimerDisplay');
  const scoreBox = document.getElementById('bTimerScoreBox');
  const recBox = document.getElementById('bRecordBox');

  if (bState.timerRunning) {
    clearInterval(bState.timerInterval);
    bState.timerRunning = false;
    btn.textContent = '⏱ Старт таймера (1 мин)';
    return;
  }

  bState.timerRunning = true;
  bState.timerLeft = 60;
  bState.timerScore = 0;
  disp.style.display = 'block';
  scoreBox.style.display = 'block';
  recBox.style.display = 'block';
  document.getElementById('bRecordVal').textContent = bState.best;
  document.getElementById('bTimerScore').textContent = '0';
  disp.textContent = '1:00';
  btn.textContent = '■ Стоп таймера';
  generateBasicsReadQuestion();

  bState.timerInterval = setInterval(() => {
    bState.timerLeft--;
    const s = bState.timerLeft;
    disp.textContent = `0:${s < 10 ? '0' : ''}${s}`;
    if (bState.timerLeft <= 0) {
      clearInterval(bState.timerInterval);
      bState.timerRunning = false;
      btn.textContent = '⏱ Старт таймера (1 мин)';
      if (bState.timerScore > bState.best) {
        bState.best = bState.timerScore;
        try { localStorage.setItem(B_RECORD_KEY, String(bState.best)); } catch {}
        document.getElementById('bRecordVal').textContent = bState.best;
      }
      const fb = document.getElementById('bFeedback');
      fb.className = 'basics-feedback ok';
      fb.textContent = `Время вышло! Результат: ${bState.timerScore} нот за минуту (рекорд: ${bState.best}).`;
    }
  }, 1000);
}

// Mode 2: Ear note from reference C4
function renderBasicsEarButtons() {
  const grid = document.getElementById('bEarNoteGrid');
  grid.innerHTML = '';
  NOTE_RU.forEach((name, pc) => {
    const btn = document.createElement('button');
    btn.className = 'note-btn';
    btn.dataset.pc = pc;
    btn.textContent = name;
    btn.addEventListener('click', () => checkBasicsEarAnswer(pc, btn));
    grid.appendChild(btn);
  });
}

function playBasicsEarSequence(q) {
  if (!q) return;
  audio.playNote(60, 0.65, 0, 0.8); // Reference C4
  pianoUI.flashHighlight(60, 750);
  setTimeout(() => {
    audio.playNote(q.midi, 0.85, 0, 0.85);
  }, 850);
}

function nextBasicsEarQuestion() {
  bState.earAnswered = false;
  pianoUI.clearStatuses();
  document.querySelectorAll('#bEarNoteGrid .note-btn').forEach(b => b.classList.remove('correct', 'wrong'));
  const fb = document.getElementById('bEarFeedback');
  fb.className = 'basics-feedback';
  fb.textContent = 'Слушайте: сначала звучит эталон До4, затем целевая нота...';

  const targetMidi = 60 + Math.floor(Math.random() * 12); // C4..B4 (1 octave)
  bState.earQ = { midi: targetMidi, pc: targetMidi % 12 };
  playBasicsEarSequence(bState.earQ);
}

function checkBasicsEarAnswer(pc, btnEl = null) {
  if (!bState.earQ || bState.earAnswered) return;
  bState.earAnswered = true;
  bState.earTotal++;
  const fb = document.getElementById('bEarFeedback');

  if (pc === bState.earQ.pc) {
    bState.earOk++;
    bState.earStreak++;
    if (btnEl) btnEl.classList.add('correct');
    else {
      const mb = document.querySelector(`#bEarNoteGrid .note-btn[data-pc="${pc}"]`);
      if (mb) mb.classList.add('correct');
    }
    pianoUI.setKeyClass([bState.earQ.midi], 'check-ok');
    fb.className = 'basics-feedback ok';
    fb.textContent = `Верно! Это ${midiToRu(bState.earQ.midi)}`;
    setTimeout(nextBasicsEarQuestion, 900);
  } else {
    bState.earStreak = 0;
    if (btnEl) btnEl.classList.add('wrong');
    const cb = document.querySelector(`#bEarNoteGrid .note-btn[data-pc="${bState.earQ.pc}"]`);
    if (cb) cb.classList.add('correct');
    pianoUI.setKeyClass([bState.earQ.midi], 'check-ok');
    fb.className = 'basics-feedback err';
    fb.textContent = `Ошибка. Вы нажали ${NOTE_RU[pc]}, а звучала ${midiToRu(bState.earQ.midi)}`;
  }
  document.getElementById('bEarStreak').textContent = bState.earStreak;
  document.getElementById('bEarAcc').textContent = Math.round((bState.earOk / bState.earTotal) * 100) + '%';
}

function handleBasicsPianoInput(midi) {
  if (bState.mode === 'read') {
    checkBasicsReadAnswer(midi % 12, midi, null);
  } else {
    checkBasicsEarAnswer(midi % 12, null);
  }
}

document.querySelectorAll('.basics-subtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.basics-subtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    bState.mode = btn.dataset.bmode;
    document.getElementById('bPanelRead').classList.toggle('active', bState.mode === 'read');
    document.getElementById('bPanelEar').classList.toggle('active', bState.mode === 'ear');
    pianoUI.clearStatuses();
  });
});

document.getElementById('bClefSel').addEventListener('change', generateBasicsReadQuestion);
document.getElementById('bDiffSel').addEventListener('change', () => {
  renderBasicsNoteButtons();
  generateBasicsReadQuestion();
});
document.getElementById('bNewNoteBtn').addEventListener('click', generateBasicsReadQuestion);
document.getElementById('bTimerBtn').addEventListener('click', toggleBasicsTimer);
document.getElementById('bEarPlayBtn').addEventListener('click', nextBasicsEarQuestion);
document.getElementById('bEarRepeatBtn').addEventListener('click', () => playBasicsEarSequence(bState.earQ));

renderBasicsNoteButtons();
renderBasicsEarButtons();
generateBasicsReadQuestion();
