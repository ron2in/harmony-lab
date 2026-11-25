/* =========================================================
   2. WEB AUDIO ENGINE (POLYPHONIC E-PIANO + ADSR)
========================================================= */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.volume = 0.72;
  }
  ensureContext() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume * 0.45;
      this.masterGain.connect(comp);
      comp.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  setVolume(v) {
    this.volume = v;
    if (this.masterGain && this.ctx) this.masterGain.gain.setTargetAtTime(v * 0.45, this.ctx.currentTime, 0.02);
  }
  playNote(midi, duration = 0.9, delay = 0, velocity = 0.8, timbre = 'epiano') {
    this.ensureContext();
    const now = this.ctx.currentTime + delay;
    const freq = midiToFreq(midi);
    const voiceGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';

    const oscs = [];
    let attack = 0.014;
    const peak = 0.45 * velocity;
    let sustain = peak * 0.42;

    if (timbre === 'strings') {
      attack = 0.08;
      sustain = peak * 0.72;
      filter.frequency.setValueAtTime(1850, now);
      const o1 = this.ctx.createOscillator();
      const o2 = this.ctx.createOscillator();
      o1.type = 'sawtooth'; o1.frequency.setValueAtTime(freq, now); o1.detune.setValueAtTime(-7, now);
      o2.type = 'sawtooth'; o2.frequency.setValueAtTime(freq, now); o2.detune.setValueAtTime(7, now);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.45, now);
      o1.connect(g); o2.connect(g); g.connect(filter);
      oscs.push(o1, o2);
    } else if (timbre === 'organ') {
      attack = 0.02;
      sustain = peak * 0.65;
      filter.frequency.setValueAtTime(3200, now);
      [[1, 0.55], [2, 0.25], [3, 0.14]].forEach(([mult, amp]) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq * mult, now);
        g.gain.setValueAtTime(amp, now);
        o.connect(g); g.connect(filter);
        oscs.push(o);
      });
    } else {
      filter.frequency.setValueAtTime(2600, now);
      filter.frequency.exponentialRampToValueAtTime(850, now + Math.max(0.25, duration || 1));
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc2Gain = this.ctx.createGain();
      osc1.type = 'triangle'; osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'sine'; osc2.frequency.setValueAtTime(freq * 2, now);
      osc2Gain.gain.setValueAtTime(0.2, now);
      osc2Gain.gain.exponentialRampToValueAtTime(0.02, now + 0.35);
      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      oscs.push(osc1, osc2);
    }

    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.linearRampToValueAtTime(peak, now + attack);
    if (timbre === 'organ' || timbre === 'strings') {
      voiceGain.gain.setValueAtTime(sustain, now + attack + 0.02);
    } else {
      voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.001, sustain), now + 0.18);
    }

    filter.connect(voiceGain);
    voiceGain.connect(this.masterGain);
    oscs.forEach(o => o.start(now));

    if (duration !== null) {
      const stopAt = now + duration;
      voiceGain.gain.setValueAtTime(Math.max(0.001, sustain), stopAt);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, stopAt + 0.25);
      oscs.forEach(o => o.stop(stopAt + 0.28));
      return null;
    }
    return () => {
      const rel = this.ctx.currentTime;
      voiceGain.gain.cancelScheduledValues(rel);
      voiceGain.gain.setValueAtTime(Math.max(0.001, voiceGain.gain.value), rel);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, rel + 0.28);
      oscs.forEach(o => o.stop(rel + 0.32));
    };
  }
  playClick(accent = false) {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(accent ? 1320 : 880, now);
    osc.frequency.exponentialRampToValueAtTime(accent ? 660 : 440, now + 0.04);
    gain.gain.setValueAtTime(accent ? 0.26 : 0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }
  playChord(notes, duration = 1.0, arpStep = 0, timbre = 'epiano') {
    notes.forEach((m, idx) => {
      const d = idx * arpStep;
      this.playNote(m, duration, d, 0.78, timbre);
      setTimeout(() => pianoUI.flashHighlight(m, (duration + 0.15) * 1000), d * 1000);
    });
  }
}

const audio = new AudioEngine();
