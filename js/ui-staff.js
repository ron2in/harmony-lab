/* =========================================================
   3. CLICKABLE SVG GRAND STAFF (TREBLE + BASS CLEFS)
========================================================= */
const PC_SHARP = [
  {step:0,acc:''},{step:0,acc:'♯'},{step:1,acc:''},{step:1,acc:'♯'},
  {step:2,acc:''},{step:3,acc:''},{step:3,acc:'♯'},{step:4,acc:''},
  {step:4,acc:'♯'},{step:5,acc:''},{step:5,acc:'♯'},{step:6,acc:''}
];
const PC_FLAT = [
  {step:0,acc:''},{step:1,acc:'♭'},{step:1,acc:''},{step:2,acc:'♭'},
  {step:2,acc:''},{step:3,acc:''},{step:4,acc:'♭'},{step:4,acc:''},
  {step:5,acc:'♭'},{step:5,acc:''},{step:6,acc:'♭'},{step:6,acc:''}
];
const PC_DEFAULT = [
  {step:0,acc:''},{step:0,acc:'♯'},{step:1,acc:''},{step:2,acc:'♭'},
  {step:2,acc:''},{step:3,acc:''},{step:4,acc:'♭'},{step:4,acc:''},
  {step:5,acc:'♭'},{step:5,acc:''},{step:6,acc:'♭'},{step:6,acc:''}
];
const DIATONIC_TO_SEMI = [0, 2, 4, 5, 7, 9, 11];

function renderGrandStaff(svgEl, notesList, onStaffClick = null, mode = currentAccidentalMode) {
  const stepH = 5.5;
  const trebleBottomY = 92; // E4 (d=30)
  const bassTopY = 148;     // A3 (d=26)

  const trebleLines = [0,1,2,3,4].map(i => trebleBottomY - i * 2 * stepH);
  const bassLines = [0,1,2,3,4].map(i => bassTopY + i * 2 * stepH);

  let svg = '';
  svg += `<line x1="34" y1="${trebleLines[4]}" x2="34" y2="${bassLines[4]}" stroke="#64748b" stroke-width="2.5"/>`;
  trebleLines.forEach(y => svg += `<line x1="34" y1="${y}" x2="322" y2="${y}" stroke="#384661" stroke-width="1.2"/>`);
  bassLines.forEach(y => svg += `<line x1="34" y1="${y}" x2="322" y2="${y}" stroke="#384661" stroke-width="1.2"/>`);
  svg += `<text x="40" y="${trebleBottomY - 4}" fill="#94a3b8" font-size="44" font-family="serif" pointer-events="none">𝄞</text>`;
  svg += `<text x="40" y="${bassTopY + 33}" fill="#94a3b8" font-size="34" font-family="serif" pointer-events="none">𝄢</text>`;

  const sorted = [...notesList].sort((a, b) => a.midi - b.midi);
  const tbl = mode === 'flat' ? PC_FLAT : PC_SHARP;

  const parsed = sorted.map(n => {
    const pc = ((n.midi % 12) + 12) % 12;
    const oct = Math.floor(n.midi / 12) - 1;
    const info = tbl[pc];
    const d = oct * 7 + info.step;
    const isTreble = n.midi >= 60;
    const y = isTreble ? trebleBottomY - (d - 30) * stepH : bassTopY + (26 - d) * stepH;
    return { ...n, d, acc: info.acc, isTreble, y };
  });

  let prevD = null, prevShift = false;
  parsed.forEach(p => {
    let sx = 0;
    if (prevD !== null && Math.abs(p.d - prevD) <= 1 && !prevShift) { sx = 15; prevShift = true; }
    else prevShift = false;
    prevD = p.d;
    const cx = 175 + sx;
    const fill = p.color || '#38bdf8';

    if (p.isTreble) {
      for (let ld = 28; ld >= p.d; ld -= 2) {
        const ly = trebleBottomY - (ld - 30) * stepH;
        svg += `<line x1="${cx - 12}" y1="${ly}" x2="${cx + 12}" y2="${ly}" stroke="#64748b" stroke-width="1.3"/>`;
      }
      for (let ld = 40; ld <= p.d; ld += 2) {
        const ly = trebleBottomY - (ld - 30) * stepH;
        svg += `<line x1="${cx - 12}" y1="${ly}" x2="${cx + 12}" y2="${ly}" stroke="#64748b" stroke-width="1.3"/>`;
      }
    } else {
      for (let ld = 28; ld <= p.d; ld += 2) {
        const ly = bassTopY + (26 - ld) * stepH;
        svg += `<line x1="${cx - 12}" y1="${ly}" x2="${cx + 12}" y2="${ly}" stroke="#64748b" stroke-width="1.3"/>`;
      }
      for (let ld = 16; ld >= p.d; ld -= 2) {
        const ly = bassTopY + (26 - ld) * stepH;
        svg += `<line x1="${cx - 12}" y1="${ly}" x2="${cx + 12}" y2="${ly}" stroke="#64748b" stroke-width="1.3"/>`;
      }
    }

    if (p.acc) svg += `<text x="${cx - 21 - sx}" y="${p.y + 5}" fill="${fill}" font-size="16" font-weight="700" pointer-events="none">${p.acc}</text>`;
    svg += `<ellipse cx="${cx}" cy="${p.y}" rx="7.2" ry="5" transform="rotate(-18 ${cx} ${p.y})" fill="${fill}" />`;
  });

  svgEl.innerHTML = svg;

  if (onStaffClick && !svgEl.dataset.bound) {
    svgEl.dataset.bound = '1';
    svgEl.addEventListener('click', (e) => {
      const rect = svgEl.getBoundingClientRect();
      const y = ((e.clientY - rect.top) / rect.height) * 235;
      let d;
      if (y < 120) {
        d = Math.round(30 + (trebleBottomY - y) / stepH);
      } else {
        d = Math.round(26 - (y - bassTopY) / stepH);
      }
      const oct = Math.floor(d / 7);
      const step = ((d % 7) + 7) % 7;
      const midi = (oct + 1) * 12 + DIATONIC_TO_SEMI[step];
      if (midi >= 48 && midi <= 83) onStaffClick(midi);
    });
  }
}

/* =========================================================
   4. VIRTUAL 3-OCTAVE PIANO (C3=48 .. B5=83)
========================================================= */
const KBD_LOWER = { 'KeyZ':48,'KeyS':49,'KeyX':50,'KeyD':51,'KeyC':52,'KeyV':53,'KeyG':54,'KeyB':55,'KeyH':56,'KeyN':57,'KeyJ':58,'KeyM':59 };
const KBD_UPPER = { 'KeyQ':60,'Digit2':61,'KeyW':62,'Digit3':63,'KeyE':64,'KeyR':65,'Digit5':66,'KeyT':67,'Digit6':68,'KeyY':69,'Digit7':70,'KeyU':71 };

class PianoUI {
  constructor(el) {
    this.el = el;
    this.keyEls = new Map();
    this.heldVoices = new Map();
    this.highlightTimers = new Map();
    this.onNoteSelect = null;
    this.accidentalMode = 'sharp';
    this.render();
    this.bind();
  }
  setAccidentalMode(mode) {
    const next = mode === 'flat' ? 'flat' : 'sharp';
    this.accidentalMode = next;
    currentAccidentalMode = next;
    NOTE_RU = next === 'flat' ? NOTE_RU_FLAT : NOTE_RU_SHARP;
    this.keyEls.forEach((el, m) => {
      if (this.isBlack(m)) el.textContent = midiToRu(m, next);
    });
  }
  isBlack(m) { return [1,3,6,8,10].includes(m % 12); }
  render() {
    this.el.innerHTML = '';
    this.keyEls.clear();
    const whites = [];
    for (let m = 48; m <= 83; m++) if (!this.isBlack(m)) whites.push(m);
    whites.forEach(m => {
      const d = document.createElement('div');
      d.className = 'key-white';
      d.dataset.midi = m;
      d.textContent = midiToRu(m);
      this.el.appendChild(d);
      this.keyEls.set(m, d);
    });
    let wIdx = -1;
    for (let m = 48; m <= 83; m++) {
      if (!this.isBlack(m)) wIdx++;
      else {
        const d = document.createElement('div');
        d.className = 'key-black';
        d.dataset.midi = m;
        const wPct = (100 / whites.length) * 0.62;
        const lPct = ((wIdx + 1) * (100 / whites.length)) - (wPct / 2);
        d.style.width = `${wPct}%`;
        d.style.left = `${lPct}%`;
        d.textContent = midiToRu(m);
        this.el.appendChild(d);
        this.keyEls.set(m, d);
      }
    }
  }
  clearStatuses() {
    this.keyEls.forEach(el => el.classList.remove('selected-note', 'check-ok', 'check-err', 'check-warn'));
  }
  setKeyClass(list, cls) {
    list.forEach(m => { const el = this.keyEls.get(m); if (el) el.classList.add(cls); });
  }
  pressKey(m) {
    if (this.onNoteSelect) {
      audio.playNote(m, 0.55, 0, 0.8);
      this.onNoteSelect(m);
      navigator.vibrate?.(12);
      return;
    }
    if (this.heldVoices.has(m)) return;
    const el = this.keyEls.get(m);
    if (el) el.classList.add('active');
    this.heldVoices.set(m, audio.playNote(m, null, 0, 0.8));
    navigator.vibrate?.(12);
  }
  releaseKey(m) {
    const el = this.keyEls.get(m);
    if (el) el.classList.remove('active');
    const fn = this.heldVoices.get(m);
    if (fn) { fn(); this.heldVoices.delete(m); }
  }
  flashHighlight(m, ms = 900) {
    const el = this.keyEls.get(m);
    if (!el) return;
    el.classList.add('highlight');
    if (this.highlightTimers.has(m)) clearTimeout(this.highlightTimers.get(m));
    this.highlightTimers.set(m, setTimeout(() => { el.classList.remove('highlight'); this.highlightTimers.delete(m); }, ms));
  }
  bind() {
    let tapState = null; // { midi, x, y, moved }
    this.el.addEventListener('pointerdown', e => {
      const k = e.target.closest('[data-midi]');
      if (!k) return;
      const midi = Number(k.dataset.midi);
      tapState = { midi, x: e.clientX, y: e.clientY, moved: false };
      if (!this.onNoteSelect) {
        this.pressKey(midi);
      }
    });
    window.addEventListener('pointermove', e => {
      if (!tapState || tapState.moved) return;
      const dx = e.clientX - tapState.x;
      const dy = e.clientY - tapState.y;
      if (Math.hypot(dx, dy) > 10) {
        tapState.moved = true;
        this.releaseKey(tapState.midi);
      }
    }, { passive: true });
    const endTap = () => {
      if (tapState && !tapState.moved && this.onNoteSelect) {
        this.pressKey(tapState.midi);
      }
      tapState = null;
      Array.from(this.heldVoices.keys()).forEach(m => this.releaseKey(m));
    };
    window.addEventListener('pointerup', endTap);
    window.addEventListener('pointercancel', endTap);
    window.addEventListener('keydown', e => {
      if (e.repeat || ['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)) return;
      let m = KBD_LOWER[e.code];
      if (m === undefined && KBD_UPPER[e.code] !== undefined) m = KBD_UPPER[e.code] + (e.shiftKey ? 12 : 0);
      if (m !== undefined) this.pressKey(m);
    });
    window.addEventListener('keyup', e => {
      const u = KBD_UPPER[e.code];
      const m = KBD_LOWER[e.code] ?? u;
      if (m !== undefined) { this.releaseKey(m); if (u !== undefined) this.releaseKey(u + 12); }
    });
  }
}

const pianoUI = new PianoUI(document.getElementById('pianoKeyboard'));
let savedVolume = 0.72;
let isMuted = false;
document.getElementById('volumeSlider').addEventListener('input', e => {
  savedVolume = Number(e.target.value);
  isMuted = savedVolume === 0;
  document.getElementById('muteToggleBtn').textContent = isMuted ? '🔇' : '🔊';
  audio.setVolume(savedVolume);
});
document.getElementById('muteToggleBtn').addEventListener('click', () => {
  isMuted = !isMuted;
  audio.setVolume(isMuted ? 0 : (savedVolume || 0.72));
  document.getElementById('muteToggleBtn').textContent = isMuted ? '🔇' : '🔊';
});

function setPianoCollapsed(collapsed) {
  const dock = document.getElementById('pianoDock');
  dock.classList.toggle('collapsed', collapsed);
  document.getElementById('pianoToggleBtn').textContent = collapsed ? '🎹 Показать' : '🎹 Свернуть';
}

function getFormulaAccidentalMode() {
  const ch = CHORD_DB.find(c => c.id === fState.chordId);
  const isMinorChord = ch && ['min', 'dim', 'min7', 'mmaj7', 'm7b5', 'dim7'].includes(ch.id);
  const isFlat = [5, 10, 3, 8, 1, 6].includes(fState.rootPc) || (isMinorChord && [2, 7, 0, 5, 10].includes(fState.rootPc));
  return isFlat ? 'flat' : 'sharp';
}

function getSandboxAccidentalMode() {
  const isFlat = sState.mode === 'major'
    ? [5, 10, 3, 8, 1, 6].includes(sState.rootPc)
    : [2, 7, 0, 5, 10, 3, 8].includes(sState.rootPc);
  return isFlat ? 'flat' : 'sharp';
}

function syncPianoMode() {
  const isTrainer = document.getElementById('sec-trainer').classList.contains('active');
  const isBasics = document.getElementById('sec-basics').classList.contains('active');
  const isEar = document.getElementById('sec-ear').classList.contains('active');
  const isHarmonize = document.getElementById('sec-harmonize').classList.contains('active');
  const isFormulas = document.getElementById('sec-formulas').classList.contains('active');
  const isSandbox = document.getElementById('sec-sandbox').classList.contains('active');
  if (isTrainer) {
    document.getElementById('pianoModeBadge').textContent = 'Режим набора аккорда (клик по клавише добавляет/убирает ноту)';
    pianoUI.onNoteSelect = toggleTrainerNote;
    pianoUI.setAccidentalMode((typeof mState !== 'undefined' && mState.task && mState.task.accidentalMode) ? mState.task.accidentalMode : 'sharp');
  } else if (isBasics) {
    document.getElementById('pianoModeBadge').textContent = 'Режим ответа (нажмите услышанную или показанную ноту)';
    pianoUI.onNoteSelect = handleBasicsPianoInput;
    pianoUI.setAccidentalMode('sharp');
  } else if (isEar && document.getElementById('eFilterSelect').value === 'mel_dict') {
    document.getElementById('pianoModeBadge').textContent = 'Мелодический диктант (нажмите услышанную ноту на клавиатуре)';
    pianoUI.onNoteSelect = handleEarMelNoteInput;
    pianoUI.setAccidentalMode('sharp');
  } else if (isHarmonize) {
    const kbdActive = (typeof hState !== 'undefined' && hState.kbdStepIdx >= 0);
    document.getElementById('pianoModeBadge').textContent = kbdActive
      ? `Ввод 3 нот (Бас, Тенор, Альт) для такта ${hState.steps[hState.kbdStepIdx].bar}`
      : 'Режим свободной игры (нажмите «🎹 С клавиш» в шаге для ввода нот)';
    pianoUI.onNoteSelect = kbdActive ? handleHarmonizePianoInput : null;
    pianoUI.setAccidentalMode('sharp');
  } else {
    document.getElementById('pianoModeBadge').textContent = 'Режим свободной игры';
    pianoUI.onNoteSelect = null;
    pianoUI.clearStatuses();
    if (isFormulas && typeof fState !== 'undefined') pianoUI.setAccidentalMode(getFormulaAccidentalMode());
    else if (isSandbox && typeof sState !== 'undefined') pianoUI.setAccidentalMode(getSandboxAccidentalMode());
    else if (document.getElementById('sec-circle').classList.contains('active') && typeof cState !== 'undefined') {
      pianoUI.setAccidentalMode(CIRCLE_KEYS[cState.idx].sig < 0 ? 'flat' : 'sharp');
    } else pianoUI.setAccidentalMode('sharp');
  }
}

document.querySelectorAll('.nav-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('sec-' + tab).classList.add('active');
    syncPianoMode();
    if (document.body.classList.contains('is-mobile')) {
      if (tab === 'harmonize' || tab === 'formulas') setPianoCollapsed(true);
      else if (tab === 'trainer' || tab === 'basics' || (tab === 'ear' && document.getElementById('eFilterSelect').value === 'mel_dict')) setPianoCollapsed(false);
    }
  });
});

/* =========================================================
   10. DEVICE DETECTION (PC vs MOBILE PHONE)
========================================================= */
const deviceState = { manual: null };

function isPhoneDevice() {
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent);
  const narrow = window.innerWidth <= 820;
  return uaMobile || (coarse && narrow) || narrow;
}

function applyDeviceMode(isMobile) {
  document.body.classList.toggle('is-mobile', isMobile);
  document.body.classList.toggle('is-desktop', !isMobile);
  const btn = document.getElementById('deviceModeBtn');
  btn.textContent = isMobile ? '📱 Телефон' : '💻 ПК';
  btn.classList.toggle('mobile-active', isMobile);

  if (isMobile) {
    // Center piano scroll on middle octave (C4)
    const wrap = document.getElementById('pianoScrollWrap');
    setTimeout(() => { wrap.scrollLeft = wrap.scrollWidth * 0.28; }, 50);
  }
}

function updateDeviceDetection() {
  if (deviceState.manual !== null) {
    applyDeviceMode(deviceState.manual === 'mobile');
  } else {
    applyDeviceMode(isPhoneDevice());
  }
}

document.getElementById('deviceModeBtn').addEventListener('click', () => {
  const currentlyMobile = document.body.classList.contains('is-mobile');
  deviceState.manual = currentlyMobile ? 'desktop' : 'mobile';
  updateDeviceDetection();
});

document.getElementById('pianoToggleBtn').addEventListener('click', () => {
  const dock = document.getElementById('pianoDock');
  const collapsed = dock.classList.toggle('collapsed');
  document.getElementById('pianoToggleBtn').textContent = collapsed ? '🎹 Показать' : '🎹 Свернуть';
});

document.querySelectorAll('[data-octscroll]').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrap = document.getElementById('pianoScrollWrap');
    wrap.scrollTo({ left: wrap.scrollWidth * Number(btn.dataset.octscroll), behavior: 'smooth' });
  });
});

window.addEventListener('resize', () => {
  if (deviceState.manual === null) updateDeviceDetection();
});
window.addEventListener('orientationchange', () => {
  if (deviceState.manual === null) setTimeout(updateDeviceDetection, 120);
});

updateDeviceDetection();
