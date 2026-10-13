// Musique générée en direct (Web Audio) : aucun fichier, aucun droit d'auteur.
// 4 ambiances au choix + petits bruitages (sonnette, versement, caisse, moulin).
export type Style = 'lofi' | 'jazz' | 'piano' | 'bossa';
type Mood = 'day' | 'night';

export const STYLES: { id: Style; name: string; icon: string; desc: string }[] = [
  { id: 'lofi', name: 'Lo-fi café', icon: '☕', desc: 'Soft beats and warm keys' },
  { id: 'jazz', name: 'Jazz evening', icon: '🎷', desc: 'Walking bass and brushes' },
  { id: 'piano', name: 'Rainy piano', icon: '🌧', desc: 'Gentle piano and rain' },
  { id: 'bossa', name: 'Bossa morning', icon: '🌴', desc: 'Sunny guitar-like rhythm' }
];

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
const PROG: Record<Style, number[][]> = {
  lofi: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]],          // Fmaj7 Em7 Dm7 Cmaj7
  jazz: [[50, 53, 57, 60, 64], [43, 53, 59, 64], [48, 52, 55, 59, 62], [45, 55, 58, 61]],    // Dm9 G13 Cmaj9 A7
  piano: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]],           // C Am F G
  bossa: [[48, 52, 55, 59], [45, 52, 55, 60], [50, 53, 57, 60], [43, 53, 55, 59]]            // Cmaj7 Am7 Dm7 G7
};
const TEMPO: Record<Style, number> = { lofi: 78, jazz: 108, piano: 66, bossa: 116 };
const PENTA = [72, 74, 76, 79, 81, 84];

export class Music {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private lp!: BiquadFilterNode;
  private timer = 0;
  private next = 0;
  private step = 0;           // croches (8 par mesure)
  private noise!: AudioBuffer;
  private bed: AudioBufferSourceNode | null = null;
  private vol = 0.16;
  mood: Mood = 'day';
  style: Style = 'lofi';
  on = true;

  constructor() {
    try {
      this.on = localStorage.getItem('komorebi-music') !== 'off';
      const s = localStorage.getItem('komorebi-style') as Style | null; if (s && s in PROG) this.style = s;
      const v = Number(localStorage.getItem('komorebi-volume')); if (v > 0 && v <= 1) this.vol = v * 0.32;
    } catch { /* stockage indisponible */ }
  }
  get volume() { return this.vol / 0.32; }

  private init() {
    if (this.ctx) return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain(); this.master.gain.value = 0;
    this.lp = ctx.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 2200;
    this.lp.connect(this.master); this.master.connect(ctx.destination);
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  private save(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* rien */ } }

  /** À appeler après un clic du joueur (règle des navigateurs). */
  start() {
    if (!this.on) return;
    this.init();
    const ctx = this.ctx!;
    if (ctx.state === 'suspended') ctx.resume();
    if (this.timer) return;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setValueAtTime(this.master.gain.value, ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(this.vol, ctx.currentTime + 2);
    this.next = ctx.currentTime + 0.1; this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 50);
    this.startBed();
  }
  stop() {
    if (!this.ctx || !this.timer) return;
    clearInterval(this.timer); this.timer = 0;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setValueAtTime(this.master.gain.value, this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6);
    this.bed?.stop(this.ctx.currentTime + 0.7); this.bed = null;
  }
  toggle() {
    this.on = !this.on; this.save('komorebi-music', this.on ? 'on' : 'off');
    if (this.on) this.start(); else this.stop();
    return this.on;
  }
  setStyle(s: Style) {
    this.style = s; this.save('komorebi-style', s);
    if (this.timer) { this.stop(); setTimeout(() => { if (this.on) this.start(); }, 700); }
    else if (!this.on) { this.on = true; this.save('komorebi-music', 'on'); this.start(); }
  }
  setVolume(v: number) {
    this.vol = Math.max(0, Math.min(1, v)) * 0.32; this.save('komorebi-volume', String(v));
    if (this.ctx && this.timer) { this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.linearRampToValueAtTime(this.vol, this.ctx.currentTime + 0.2); }
  }
  setMood(m: Mood) {
    this.mood = m;
    if (this.ctx) this.lp.frequency.linearRampToValueAtTime(m === 'night' ? 1300 : 2200, this.ctx.currentTime + 1.5);
  }

  private get spe() { return 30 / (TEMPO[this.style] * (this.mood === 'night' ? 0.85 : 1)); } // secondes par croche

  private schedule() {
    const ctx = this.ctx!;
    while (this.next < ctx.currentTime + 0.2) {
      const swing = this.style === 'jazz' && this.step % 2 ? this.spe * 0.33 : 0;
      this.play(this.step, this.next + swing);
      this.next += this.spe; this.step++;
    }
  }

  private play(st: number, t: number) {
    const bar = Math.floor(st / 8), e = st % 8, chord = PROG[this.style][bar % 4], beat = this.spe * 2, r = Math.random;
    const night = this.mood === 'night';
    switch (this.style) {
      case 'lofi':
        if (e === 0) { chord.forEach((n, i) => this.keys(midi(n), t + i * 0.012, beat * 3.6)); this.bass(midi(chord[0] - 12), t, beat * 1.8); }
        if (e === 4) this.bass(midi(chord[0] - (bar % 2 ? 5 : 12)), t, beat * 1.6);
        if (r() < (night ? .18 : .3)) this.lead(midi(PENTA[Math.floor(r() * PENTA.length)] - (night ? 12 : 0)), t);
        if (e === 0 || e === 4) this.kick(t);
        if (!night && (e === 2 || e === 6)) this.snare(t, .07);
        if (!night && e % 2) this.hat(t, .025);
        break;
      case 'jazz': {
        const walk = [0, 4, 7, 9];
        if (e % 2 === 0) this.bass(midi(chord[0] - 12 + walk[(e / 2) % 4] + (bar % 2 && e === 6 ? 1 : 0)), t, beat * 0.9, .14);
        if (e === 3 || e === 7) chord.slice(1).forEach((n, i) => this.keys(midi(n + 12), t + i * .01, beat * .9, .05));
        if (e % 2 === 0 || e === 5) this.hat(t, e % 2 ? .02 : .03, 6000);
        if (e === 2 || e === 6) this.snare(t, .035);
        if (r() < .22) this.lead(midi(PENTA[Math.floor(r() * PENTA.length)] - 12), t, .04, 'sine');
        break;
      }
      case 'piano': {
        const arp = [0, 1, 2, 3, 2, 1, 2, 3];
        this.keys(midi(chord[arp[e]] + 12), t, beat * 2.4, .05);
        if (e === 0) this.keys(midi(chord[0] - 12), t, beat * 4, .06);
        if (r() < .12) this.keys(midi(PENTA[Math.floor(r() * PENTA.length)]), t, beat * 2, .035);
        break;
      }
      case 'bossa': {
        if (e === 0 || e === 3) this.bass(midi(chord[0] - 12), t, beat * .9, .14);
        if (e === 4 || e === 7) this.bass(midi(chord[0] - 5), t, beat * .9, .12);
        if ([0, 3, 6].includes(e)) chord.forEach((n, i) => this.keys(midi(n), t + i * .008, beat * .7, .045));
        if ([0, 3, 6, 10 % 8].includes(e)) this.rim(t);
        this.hat(t, e % 2 ? .02 : .012, 9000);
        if (r() < .2) this.lead(midi(PENTA[Math.floor(r() * PENTA.length)]), t, .03);
        break;
      }
    }
  }

  private env(g: GainNode, t: number, peak: number, attack: number, len: number) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0008, t + len);
  }
  private keys(f: number, t: number, len: number, vol = 0.07) {
    const ctx = this.ctx!, g = ctx.createGain();
    for (const [type, mul, v] of [['sine', 1, 1], ['triangle', 2.001, .18], ['sine', 0.998, .6]] as const) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f * mul;
      const og = ctx.createGain(); og.gain.value = v; o.connect(og).connect(g);
      o.start(t); o.stop(t + len + 0.1);
    }
    this.env(g, t, vol, 0.02, len);
    g.connect(this.lp);
  }
  private bass(f: number, t: number, len: number, vol = .16) {
    const ctx = this.ctx!, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(this.lp);
    this.env(g, t, vol, 0.03, len); o.start(t); o.stop(t + len + 0.1);
  }
  private lead(f: number, t: number, vol = 0.035, type: OscillatorType = 'triangle') {
    const ctx = this.ctx!, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f; o.connect(g); g.connect(this.lp);
    this.env(g, t, vol, 0.015, 0.7); o.start(t); o.stop(t + 0.8);
  }
  private kick(t: number) {
    const ctx = this.ctx!, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    o.connect(g); g.connect(this.master); this.env(g, t, 0.28, 0.005, 0.3); o.start(t); o.stop(t + 0.32);
  }
  private noiseHit(t: number, vol: number, freq: number, q: number, len: number, type: BiquadFilterType, dest?: AudioNode) {
    const ctx = this.ctx!, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noise; f.type = type; f.frequency.value = freq; f.Q.value = q;
    s.connect(f).connect(g).connect(dest ?? this.master); this.env(g, t, vol, 0.003, len);
    s.start(t, Math.random()); s.stop(t + len + 0.05);
  }
  private snare(t: number, vol: number) { this.noiseHit(t, vol, 1800, 0.8, 0.22, 'bandpass'); }
  private hat(t: number, vol: number, f = 8000) { this.noiseHit(t, vol, f, 0.7, 0.05, 'highpass'); }
  private rim(t: number) { this.noiseHit(t, .06, 2600, 6, .05, 'bandpass'); }
  // fond sonore continu : craquements de vinyle, ou pluie pour le piano
  private startBed() {
    const ctx = this.ctx!, len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    const rain = this.style === 'piano';
    for (let i = 0; i < len; i++) d[i] = rain ? (Math.random() * 2 - 1) * 0.05 : Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.6 : (Math.random() * 2 - 1) * 0.004;
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
    const g = ctx.createGain(); g.gain.value = rain ? 0.5 : 0.25;
    const f = ctx.createBiquadFilter(); f.type = rain ? 'bandpass' : 'allpass'; f.frequency.value = 1500;
    s.connect(f).connect(g).connect(this.master); s.start();
    this.bed = s;
  }

  /** Petits bruitages (indépendants du bouton musique). */
  sfx(kind: 'bell' | 'pour' | 'cash' | 'grind' | 'coins' | 'transform' | 'twinkle' | 'squeak' | 'sweep') {
    this.init();
    const ctx = this.ctx!; if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime, out = ctx.destination;
    const tone = (f: number, v: number, at: number, len: number, type: OscillatorType = 'sine') => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; o.connect(g).connect(out);
      g.gain.setValueAtTime(v, at); g.gain.exponentialRampToValueAtTime(0.0005, at + len); o.start(at); o.stop(at + len + .05);
    };
    if (kind === 'bell') { tone(1318.5, .12, t, 1.4); tone(2637, .05, t, 1.2); tone(3951, .02, t, .8); }
    if (kind === 'cash') {
      // « cha-ching » : tiroir-caisse (bruit) puis deux clochettes
      this.noiseHit(t, .12, 3000, 1.2, .12, 'bandpass', out);
      tone(2093, .1, t + .1, .5, 'triangle'); tone(2637, .09, t + .2, .7, 'triangle'); tone(3136, .05, t + .2, .6);
    }
    if (kind === 'transform') {
      // transformation façon anime : souffle scintillant qui monte, arpège d'étoiles, accord lumineux
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = this.noise; s.loop = true; f.type = 'bandpass'; f.Q.value = 6;
      f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(7000, t + 1.4);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.14, t + .5); g.gain.linearRampToValueAtTime(0, t + 1.6);
      s.connect(f).connect(g).connect(out); s.start(t); s.stop(t + 1.7);
      const notes = [523.3, 659.3, 784, 1046.5, 1318.5, 1568, 2093, 2637, 3136];
      notes.forEach((n, i) => { tone(n, .07, t + .1 + i * .11, .5, 'triangle'); tone(n * 2, .025, t + .1 + i * .11, .35); });
      for (const n of [1046.5, 1318.5, 1568, 2093]) { tone(n, .06, t + 1.15, 1.6); tone(n * 1.005, .04, t + 1.15, 1.6, 'triangle'); }
      for (let i = 0; i < 10; i++) tone(3000 + Math.random() * 3000, .02, t + 1.1 + Math.random() * .9, .15);
    }
    if (kind === 'twinkle') {
      for (const [n, d] of [[2093, 0], [2637, .06], [3136, .12], [4186, .18]] as const) { tone(n, .06, t + d, .9, 'triangle'); tone(n * 2, .02, t + d, .5); }
    }
    if (kind === 'coins') {
      // pièces qui tombent dans la main : petits tintements métalliques en cascade
      for (let i = 0; i < 6; i++) {
        const at = t + i * 0.07 + Math.random() * 0.03, f = 2600 + Math.random() * 1600;
        tone(f, .05, at, .18, 'triangle'); tone(f * 1.5, .025, at, .12); this.noiseHit(at, .03, 6000, 4, .03, 'highpass', out);
      }
    }
    if (kind === 'squeak') {
      // couinement de souris : deux petits glissandos aigus
      for (const d of [0, .16]) {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
        o.frequency.setValueAtTime(2400, t + d); o.frequency.exponentialRampToValueAtTime(3600, t + d + .07); o.frequency.exponentialRampToValueAtTime(2800, t + d + .11);
        g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(.06, t + d + .02); g.gain.exponentialRampToValueAtTime(.0005, t + d + .13);
        o.connect(g).connect(out); o.start(t + d); o.stop(t + d + .15);
      }
    }
    if (kind === 'sweep') for (let i = 0; i < 3; i++) this.noiseHit(t + i * .22, .04, 2500, 1, .16, 'bandpass', out);
    if (kind === 'pour') this.noiseHit(t, .05, 900, 1.5, .45, 'bandpass', out);
    if (kind === 'grind') {
      // moulin : grondement qui vibre ~1,2 s
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      s.buffer = this.noise; s.loop = true; f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 2.5;
      lfo.frequency.value = 38; lg.gain.value = 140; lfo.connect(lg).connect(f.frequency);
      s.connect(f).connect(g).connect(out);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.2, t + .08); g.gain.setValueAtTime(.2, t + 1.05); g.gain.linearRampToValueAtTime(0, t + 1.25);
      s.start(t); lfo.start(t); s.stop(t + 1.3); lfo.stop(t + 1.3);
    }
  }
}

export const music = new Music();
