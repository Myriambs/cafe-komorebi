// Café en pixel art, vue comptoir : les clients font la queue devant le comptoir, on prépare les boissons dessus.
import { PixelView, W, H, rect, box, disc, bands, place, type Ctx } from './engine';
import { drawText, textWidth } from './font';
import { LOOKS, custBust, heroBust, mokaSit, mokaWalk, grandmaRead, dogSit, dogWalk, dogSleep, flipped, type Look, type HeroLook } from './sprites';
import { ui, h } from '../ui/dom';
import { recipeById, matches, cannotAdd, INGREDIENTS, type Recipe, type Ingredient } from '../logic/recipes';
import { tickPatience, outcome, payment, type Outcome } from '../logic/service';
import { music } from '../audio/music';

const INK = '#2b1f2a', CREAM = '#fffaf2';
type Who = 'hero' | 'moka' | 'grandma' | 'biscuit';
type PartyState = 'walking' | 'ready' | 'ordered' | 'served' | 'leaving';
export type DogState = 'none' | 'stray' | 'straysleep' | 'sleep' | 'idle' | 'patrol';

interface Walker { x: number; tx: number; speed: number; done?: () => void; face: 1 | -1 }
interface Mem extends Walker { look: Look; cup: boolean; blink: number }
export interface Cust { id: number; members: Mem[]; spot: number; state: PartyState; recipe?: Recipe; qty: number; servedCups: number; pay: number; patience: number }
export interface Stock { cups: number; espresso: number; milk: number; caramel: number }

export interface CafeOpts {
  hero: 'm' | 'f'; mode: 'day' | 'sunset' | 'night'; dog: DogState; day: number; goal: number; coins: number;
  recipes: string[]; maxSeated: number; parties?: number[]; customers: boolean;
  colors: { apron: string; moka: string; grandma: string; bandana: string };
  heroName: string; visitor?: HeroLook; caramel?: boolean;
}

// repères de la scène (en pixels de la toile 400×225)
const SPOTX = [130, 215, 300];
// les personnages sont dessinés en ×2 (comme sur la référence) ; le décor reste en ×1
const DOOR_X = 364, BASE = 133, CUST_BASE = 137, SILL_Y = 96, MOKA_HOME = 375, MOKA_SEAT = 117;
const SLOTX = [186, 222, 258];
const CHAT = ['HAHA!', '♪', 'SO COZY', 'REALLY?!', 'MMM...', '♥', 'LOOK!', 'SAME!', '★'];
const SHORT: Record<string, string> = { caramel: 'CARAMEL', cappuccino: 'CAPPUCCINO', americano: 'AMERICANO', espresso: 'ESPRESSO', latte: 'LATTE' };
const ITEM_NAMES: Record<string, string> = {
  espresso: 'ESPRESSO MACHINE', grind: 'GRINDER', water: 'HOT WATER', milk: 'MILK', foam: 'MILK FOAM', caramel: 'CARAMEL SYRUP',
  cup: 'TAKE A CUP', trash: 'EMPTY THE CUP', restock: 'SUPPLIES · 15 COINS', bell: 'SERVE (BELL)', juice: 'JUICE BAR · LEVEL 2',
  bakery: 'BAKERY · LEVEL 4', music: 'RADIO', lock: 'MORE SYRUPS SOON', 'card:grandma': 'GRANDMA', 'card:moka': 'MOKA', 'card:biscuit': 'BISCUIT', 'card:hero': 'YOUR CARD'
};

function liquid(cup: readonly Ingredient[]) {
  if (cup.includes('caramel')) return '#c98a4a';
  if (cup.includes('milk')) return '#c99a6e';
  if (cup.includes('water')) return '#7a4a30';
  return '#4a2a1c';
}

/** Texte entouré (lisible sur tous les fonds). */
function tOut(c: Ctx, s: string, x: number, y: number, col: string, ink = INK, align: 'left' | 'center' | 'right' = 'center') {
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) drawText(c, s, x + dx, y + dy, ink, align);
  drawText(c, s, x, y, col, align);
}
/** Petite bulle de parole avec pointe vers le bas. */
function bubble(c: Ctx, x: number, y: number, s: string, tail = 0) {
  const w = textWidth(s) + 8, bx = Math.round(x - w / 2);
  box(c, bx, y, w, 13, CREAM);
  rect(c, x + tail - 1, y + 12, 3, 1, CREAM); rect(c, x + tail - 2, y + 12, 1, 2, INK); rect(c, x + tail + 2, y + 12, 1, 2, INK);
  rect(c, x + tail - 1, y + 13, 3, 1, CREAM); rect(c, x + tail, y + 14, 1, 1, INK); rect(c, x + tail - 1, y + 14, 1, 1, INK); rect(c, x + tail + 1, y + 14, 1, 1, INK);
  drawText(c, s, x, y + 3, INK, 'center');
}
/** Icônes d'ingrédients 7×7. */
function chip(c: Ctx, ing: Ingredient, x: number, y: number) {
  if (ing === 'espresso') { disc(c, x + 3, y + 3, 3, INK); disc(c, x + 3, y + 3, 2, '#7a4a30'); rect(c, x + 3, y + 1, 1, 5, '#4a2a1c'); }
  else if (ing === 'water') { rect(c, x + 3, y, 1, 1, INK); rect(c, x + 2, y + 1, 3, 1, INK); disc(c, x + 3, y + 4, 2, INK); rect(c, x + 3, y + 2, 1, 1, '#8cc4ea'); disc(c, x + 3, y + 4, 1, '#8cc4ea'); }
  else if (ing === 'milk') { box(c, x + 1, y + 2, 5, 5, CREAM, INK, false); rect(c, x + 2, y, 3, 2, '#7fa8d8'); }
  else if (ing === 'foam') { disc(c, x + 2, y + 4, 2, INK); disc(c, x + 5, y + 4, 2, INK); disc(c, x + 3, y + 3, 2, INK); disc(c, x + 2, y + 4, 1, CREAM); disc(c, x + 5, y + 4, 1, CREAM); disc(c, x + 3, y + 3, 1, CREAM); }
  else { rect(c, x + 3, y, 1, 1, INK); rect(c, x + 2, y + 1, 3, 1, INK); disc(c, x + 3, y + 4, 2, INK); rect(c, x + 3, y + 2, 1, 1, '#e8b04a'); disc(c, x + 3, y + 4, 1, '#e8b04a'); }
}
/** Tasse 14×13 vue de face, remplie selon son contenu. */
function cupArt(c: Ctx, x: number, y: number, cup: readonly Ingredient[] | null, sel = false) {
  if (!cup) return;
  box(c, x, y + 2, 12, 11, sel ? '#fff4cc' : CREAM);
  rect(c, x + 11, y + 5, 3, 1, INK); rect(c, x + 13, y + 5, 1, 5, INK); rect(c, x + 11, y + 9, 3, 1, INK); rect(c, x + 11, y + 6, 2, 3, CREAM);
  if (cup.length) {
    const lvl = Math.min(3, cup.length), top = y + 11 - lvl * 3;
    rect(c, x + 1, top, 10, y + 12 - top, liquid(cup));
    if (cup.includes('foam')) { rect(c, x + 1, top, 10, 2, '#fff4e6'); rect(c, x + 5, top, 2, 1, '#e3c0a0'); }
    if (cup.includes('caramel')) rect(c, x + 2, top + 1, 8, 1, '#f3c24a');
    rect(c, x + 1, y + 3, 10, 1, '#e8dccb');
  } else rect(c, x + 1, y + 3, 10, 2, '#d8cbb8');
  rect(c, x - 1, y + 13, 16, 1, '#b48a5e');
}

export class Cafe {
  view: PixelView;
  custs: Cust[] = [];
  served = 0;
  coins: number;
  spawning: boolean;
  stock: Stock = { cups: 20, espresso: 20, milk: 16, caramel: 8 };
  cups: (Ingredient[] | null)[] = [null, null, null];
  sel = -1;
  /** Tutoriel : flèche qui montre la prochaine étape. */
  guideOn = false;
  onServed?: (served: number) => void;
  onEmpty?: () => void;
  onArrive?: (c: Cust) => void;
  onOrder?: (c: Cust) => void;
  onFirstServe?: () => void;
  onCard?: (who: Who) => void;
  onMusic?: () => void;

  private nextId = 1;
  private cooldown = 1.5;
  private chatT = 2.3;
  private idleFor = 0;
  private mokaBusy = 0;
  private mokaQueue: Promise<void> = Promise.resolve();
  private moka = { x: MOKA_HOME, y: 0, floor: false, face: -1 as 1 | -1, tx: MOKA_HOME, speed: 0, done: undefined as undefined | (() => void), say: '', mood: 'idle' as 'idle' | 'sleep' | 'happy', hop: 0 };
  private dog: DogState;
  private dogIn: { x: number; tx: number; speed: number; face: 1 | -1; kind: 'tag' | 'bandana'; sit: boolean; done?: () => void } | null = null;
  private chats: { x: number; y: number; s: string; t: number }[] = [];
  private fxs: { x: number; y: number; s: string; col: string; t: number }[] = [];
  private flying: { cup: Ingredient[]; x0: number; y0: number; x1: number; y1: number; t: number; then: () => void }[] = [];
  private ground = false;
  private grinding = 0;
  private bellT = 0;
  private gmaT = 0;
  private tipEl: HTMLElement | null = null;
  private toastEl: HTMLElement | null = null;
  private toastTimer = 0;
  private stars: [number, number][] = Array.from({ length: 26 }, (_, i) => [96 + (i * 53) % 230, 20 + (i * 29) % 40]);

  constructor(public o: CafeOpts) {
    this.coins = o.coins;
    this.spawning = o.customers;
    this.dog = o.dog;
    this.view = new PixelView(ui(), (c, t, dt) => { this.update(dt); this.draw(c, t); }, '#1c1420');
    this.view.onClick = id => this.click(id);
  }

  /* ---------- API commune avec l'ancienne salle ---------- */
  setDog(state: DogState) { this.dog = state; }
  restyle(who: Who, color: string) {
    if (who === 'hero') this.o.colors.apron = color; else if (who === 'moka') this.o.colors.moka = color;
    else if (who === 'grandma') this.o.colors.grandma = color; else this.o.colors.bandana = color;
  }
  drawHud() { /* la toile se redessine à chaque image */ }
  cuddleMoka() { if (this.mokaBusy < 90) { this.moka.mood = 'happy'; this.mokaBusy = 2.4; this.fx(this.moka.x, 64, '♥', '#e8586a'); } }
  ordered() { return this.custs.filter(c => c.state === 'ordered'); }

  /** Bulle de Grand-mère (consignes), en texte net par-dessus la toile. */
  tip(text: string | null) {
    this.tipEl?.remove(); this.tipEl = null;
    if (!text) return;
    this.tipEl = h(`<div class="pxtip"><span class="who">GRANDMA</span>${text}</div>`);
    place(this.tipEl, 84, 0, 210);
    this.tipEl.style.top = ''; this.tipEl.style.bottom = `${3 / H * 100}%`;
    this.view.overlay.appendChild(this.tipEl);
  }
  toast(text: string, kind: 'good' | 'bad' | '' = '') {
    this.toastEl?.remove();
    this.toastEl = h(`<div class="pxtoast ${kind}">${text}</div>`);
    place(this.toastEl, W / 2, 104);
    this.view.overlay.appendChild(this.toastEl);
    clearTimeout(this.toastTimer); this.toastTimer = window.setTimeout(() => { this.toastEl?.remove(); this.toastEl = null; }, 2600);
  }
  fx(x: number, y: number, s: string, col = CREAM) { this.fxs.push({ x, y, s, col, t: 0 }); }

  /* ---------- déplacements ---------- */
  private walk(w: Walker, x: number, speed: number) {
    return new Promise<void>(r => { w.done?.(); w.tx = x; w.speed = speed; w.face = x < w.x ? -1 : 1; w.done = r; });
  }
  private step(w: Walker, dt: number) {
    if (w.x === w.tx) return;
    const d = w.tx - w.x, s = w.speed * dt;
    if (Math.abs(d) <= s) { w.x = w.tx; const f = w.done; w.done = undefined; f?.(); } else w.x += Math.sign(d) * s;
  }
  private wait(ms: number) { return new Promise<void>(r => setTimeout(r, ms)); }

  /* ---------- clients ---------- */
  private peopleBusy() { return this.custs.reduce((n, c) => n + (c.state === 'leaving' || c.state === 'served' ? 0 : c.members.length - c.servedCups), 0); }
  private memX(c: Cust, k: number) { return SPOTX[c.spot] + (k - (c.members.length - 1) / 2) * 21; }

  spawn(left: number) {
    const busy = new Set(this.custs.map(c => c.spot));
    const free = SPOTX.map((_, i) => i).filter(i => !busy.has(i));
    if (!free.length) return;
    const sizes = (this.o.parties ?? [1]).filter(n => n <= left);
    const size = sizes.length ? sizes[Math.floor(Math.random() * sizes.length)] : 1;
    const used = new Set(this.custs.flatMap(c => c.members.map(m => m.look)));
    const pool = LOOKS.filter(l => !used.has(l)).sort(() => Math.random() - 0.5);
    const members: Mem[] = Array.from({ length: size }, (_, k) => ({ look: pool[k % pool.length], x: DOOR_X + 6 + k * 15, tx: DOOR_X + 6 + k * 15, speed: 0, face: -1 as const, cup: false, blink: Math.random() * 3 }));
    const c: Cust = { id: this.nextId++, members, spot: free[Math.floor(Math.random() * free.length)], state: 'walking', qty: size, servedCups: 0, pay: 0, patience: 100 };
    this.custs.push(c);
    this.mokaQueue = this.mokaQueue.then(() => this.greet(c));
  }

  private async mokaGo(x: number, speed = 70) {
    const m = this.moka;
    if (!m.floor) { m.floor = true; m.hop = 1; await this.wait(260); }
    await this.walk(m as unknown as Walker, x, speed);
  }
  private async mokaHome() {
    const m = this.moka;
    await this.walk(m as unknown as Walker, MOKA_HOME, 70);
    m.hop = 1; await this.wait(130); m.floor = false; await this.wait(130); m.face = -1;
  }
  /** Moka accueille le groupe à la porte et le mène jusqu'au comptoir. */
  private async greet(c: Cust) {
    this.mokaBusy = 99; this.moka.mood = 'idle';
    await this.mokaGo(DOOR_X - 28);
    this.moka.face = 1;
    this.moka.say = c.members.length > 1 ? `HELLO! ${c.members.length} OF YOU? ♪` : 'HELLO! FOLLOW ME ♪';
    await this.wait(1600);
    this.moka.say = '';
    const target = SPOTX[c.spot];
    const cat = this.mokaGo(target - 30);
    await this.wait(250);
    await Promise.all([cat, ...c.members.map((m, k) => this.wait(k * 300).then(() => this.walk(m, this.memX(c, k), 46)))]);
    c.members.forEach(m => m.face = 1);
    c.state = 'ready';
    this.onArrive?.(c);
    this.moka.face = 1;
    this.moka.say = 'ENJOY ♪';
    await this.wait(1100);
    this.moka.say = '';
    await this.mokaHome();
    this.mokaBusy = 1;
  }

  takeOrder(c: Cust) {
    c.recipe = recipeById(this.o.recipes[Math.floor(Math.random() * this.o.recipes.length)]);
    c.state = 'ordered';
    this.fx(SPOTX[c.spot], 40, 'ORDER TAKEN!');
    this.onOrder?.(c);
  }

  serve(id: number): { outcome: Outcome; pay: number; done: boolean } {
    const c = this.custs.find(x => x.id === id)!;
    const out = outcome(c.patience), pay = payment(c.recipe!.price, out);
    c.servedCups++; c.pay += pay; this.served++;
    const done = c.servedCups >= c.qty;
    if (done) {
      c.state = 'served';
      this.coins = Math.round((this.coins + c.pay) * 100) / 100;
      music.sfx('cash');
      this.fx(SPOTX[c.spot], 40, `+${Math.round(c.pay * 100) / 100} COINS`, '#f3d98f');
      setTimeout(() => this.leave(c), 3200);
    }
    this.onServed?.(this.served);
    return { outcome: out, pay, done };
  }

  private async leave(c: Cust) {
    c.state = 'leaving';
    await Promise.all(c.members.map((m, k) => this.wait(k * 300).then(() => this.walk(m, DOOR_X + 4, 50))));
    await this.wait(250);
    this.custs = this.custs.filter(x => x !== c);
    if (!this.custs.length && (!this.spawning || this.served >= this.o.goal)) this.onEmpty?.();
  }

  /** Jour 3 : Biscuit entre par la porte et s'assoit devant le comptoir. */
  async dogEnters() {
    this.dog = 'none';
    this.dogIn = { x: DOOR_X + 8, tx: DOOR_X + 8, speed: 0, face: -1, kind: 'tag', sit: false };
    music.sfx('bell'); this.bellT = 0.6;
    await this.walk(this.dogIn as unknown as Walker, 212, 40);
    this.dogIn.sit = true;
  }
  dogBandana() { if (this.dogIn) { this.dogIn.kind = 'bandana'; for (let i = 0; i < 3; i++) this.fx(204 + i * 8, 96 - i * 6, '♥', '#f6b0b5'); } }

  /* ---------- préparation des boissons ---------- */
  private takeCup(): number {
    const i = this.cups.indexOf(null);
    if (i < 0) { this.toast('All three cup spots are full', 'bad'); return -1; }
    if (this.stock.cups <= 0) { this.toast('Out of cups: open the supplies crate', 'bad'); return -1; }
    this.stock.cups--; this.cups[i] = []; this.sel = i;
    return i;
  }
  private add(ing: Ingredient) {
    if (this.sel < 0 || !this.cups[this.sel]) { if (this.takeCup() < 0) return; }
    const cup = this.cups[this.sel]!;
    const why = cannotAdd(cup, ing); if (why) return this.toast(why, 'bad');
    if (ing === 'espresso') {
      if (!this.ground) return this.toast('Grind the beans first: tap the orange grinder', 'bad');
      this.ground = false;
    }
    if ((ing === 'milk' || ing === 'foam') && this.stock.milk <= 0) return this.toast('Out of milk: open the supplies crate', 'bad');
    if (ing === 'caramel' && this.stock.caramel <= 0) return this.toast('Out of caramel: open the supplies crate', 'bad');
    cup.push(ing);
    if (ing === 'milk' || ing === 'foam') this.stock.milk--;
    if (ing === 'caramel') this.stock.caramel--;
    music.sfx('pour');
    this.fx(SLOTX[this.sel] + 6, 150, '+ ' + INGREDIENTS[ing].name);
  }
  private ring() {
    music.sfx('bell'); this.bellT = 0.5;
    const cup = this.sel >= 0 ? this.cups[this.sel] : null;
    if (!cup || !cup.length) return this.toast('Fill a cup, then ring the bell', 'bad');
    const o = this.ordered().find(x => matches(cup, x.recipe!));
    if (!o) return this.toast('Nobody ordered this drink: look at the order panels', 'bad');
    this.serveTo(o);
  }
  private serveTo(o: Cust) {
    const i = this.sel, cup = this.cups[i]!;
    const k = Math.min(o.servedCups, o.members.length - 1), m = o.members[k];
    const { outcome: out, done } = this.serve(o.id);
    this.cups[i] = null;
    this.sel = this.cups.findIndex(x => x);
    this.flying.push({ cup, x0: SLOTX[i], y0: 160, x1: m.x + 2, y1: 122, t: 0, then: () => { m.cup = true; } });
    this.toast(!done ? `One ${o.recipe!.name} served, ${o.qty - o.servedCups} more for this table` : out === 'delighted' ? `Delighted! They loved the ${o.recipe!.name}` : 'Served! Your customers are happy', 'good');
    this.onFirstServe?.();
  }

  private click(id: string) {
    if (id.startsWith('card:')) return this.onCard?.(id.slice(5) as Who);
    if (id.startsWith('cust:')) {
      const c = this.custs.find(x => x.id === +id.slice(5)); if (!c) return;
      if (c.state === 'ready') return this.takeOrder(c);
      if (c.state === 'ordered') {
        const cup = this.sel >= 0 ? this.cups[this.sel] : null;
        if (!cup || !cup.length) return this.toast(`Make a ${c.recipe!.name}, then tap this order or ring the bell`, '');
        if (!matches(cup, c.recipe!)) return this.toast(`Not quite: a ${c.recipe!.name} is ${c.recipe!.need.map(k => INGREDIENTS[k].name).join(' + ')}`, 'bad');
        return this.serveTo(c);
      }
      return;
    }
    if (id.startsWith('slot:')) {
      const i = +id.slice(5);
      if (this.cups[i]) this.sel = i;
      else if (this.o.customers) { if (this.stock.cups <= 0) return this.toast('Out of cups: open the supplies crate', 'bad'); this.stock.cups--; this.cups[i] = []; this.sel = i; }
      return;
    }
    switch (id) {
      case 'music': return this.onMusic?.();
      case 'juice': return this.toast('The juice bar opens in Level 2 🍊');
      case 'bakery': return this.toast('The bakery opens in Level 4 🥐');
      case 'lock': return this.toast('Vanilla and hazelnut syrups come with new recipe books');
    }
    if (!this.o.customers) return;
    switch (id) {
      case 'cup': this.takeCup(); break;
      case 'grind':
        if (this.ground) return this.toast('Ground coffee is ready: tap the espresso machine', 'good');
        if (this.grinding > 0) return;
        if (this.stock.espresso <= 0) return this.toast('Out of beans: open the supplies crate', 'bad');
        this.stock.espresso--; music.sfx('grind'); this.grinding = 1.1;
        break;
      case 'espresso': case 'water': case 'milk': case 'foam': return this.add(id);
      case 'caramel': if (!this.o.caramel) return this.toast('Caramel syrup unlocks on day 3'); return this.add('caramel');
      case 'trash': if (this.sel >= 0 && this.cups[this.sel]) { this.cups[this.sel] = null; this.sel = this.cups.findIndex(x => x); this.stock.cups++; } break;
      case 'restock':
        if (this.coins < 15) return this.toast('Not enough coins', 'bad');
        music.sfx('cash'); this.coins = Math.round((this.coins - 15) * 100) / 100;
        for (const k in this.stock) (this.stock as any)[k] += 5;
        this.toast('Stock refilled: +5 of everything', 'good'); break;
      case 'bell': return this.ring();
    }
  }

  /** Prochaine étape conseillée (tutoriel du jour 1). */
  private nextStep(): string | null {
    const o = this.custs.find(c => c.state === 'ready'); if (o) return 'cust:' + o.id;
    const c = this.ordered()[0]; if (!c) return null;
    const cup = this.sel >= 0 ? this.cups[this.sel] : null;
    if (cup && matches(cup, c.recipe!)) return 'bell';
    const need = c.recipe!.need.find(k => !cup?.includes(k));
    if (!need) return 'trash';
    if (need === 'espresso' && !this.ground) return 'grind';
    return need;
  }

  /* ---------- boucle ---------- */
  private update(dt: number) {
    for (const c of this.custs) {
      for (const m of c.members) { this.step(m, dt); m.blink -= dt; if (m.blink < -0.15) m.blink = 2 + Math.random() * 3; }
      if (c.state === 'ready' || c.state === 'ordered') c.patience = tickPatience(c.patience, dt);
    }
    const m = this.moka;
    this.step(m as unknown as Walker, dt);
    if (m.hop > 0) m.hop = Math.max(0, m.hop - dt * 4);
    if (this.dogIn) this.step(this.dogIn as unknown as Walker, dt);
    if (this.mokaBusy > 0) { if (this.mokaBusy < 90) { this.mokaBusy -= dt; if (this.mokaBusy <= 0) m.mood = 'idle'; } }
    else if (!this.custs.length) { this.idleFor += dt; m.mood = this.idleFor > 6 ? 'sleep' : 'idle'; }
    else { this.idleFor = 0; m.mood = 'idle'; }
    if (this.grinding > 0) { this.grinding -= dt; if (this.grinding <= 0) { this.ground = true; this.fx(90, 108, 'GROUND!'); } }
    this.bellT = Math.max(0, this.bellT - dt);
    this.gmaT += dt;
    this.fxs = this.fxs.filter(f => (f.t += dt) < 1.3);
    this.chats = this.chats.filter(f => (f.t += dt) < 2);
    for (const f of this.flying) { f.t += dt * 2; if (f.t >= 1) f.then(); }
    this.flying = this.flying.filter(f => f.t < 1);
    this.chatT -= dt;
    if (this.chatT <= 0) {
      this.chatT = 2.3;
      const groups = this.custs.filter(c => c.members.length > 1 && (c.state === 'ready' || c.state === 'ordered' || c.state === 'served'));
      if (groups.length) { const c = groups[Math.floor(Math.random() * groups.length)], k = Math.floor(Math.random() * c.members.length); this.chats.push({ x: c.members[k].x, y: 64, s: CHAT[Math.floor(Math.random() * CHAT.length)], t: 0 }); }
    }
    if (!this.spawning) return;
    this.cooldown -= dt;
    const parties = this.custs.filter(c => c.state !== 'leaving').length;
    const left = this.o.goal - this.served - this.peopleBusy();
    if (this.cooldown <= 0 && left > 0 && parties < this.o.maxSeated) { this.spawn(left); this.cooldown = 6; }
  }

  private draw(c: Ctx, t: number) {
    const v = this.view;
    this.room(c, t);
    this.outside(c, t);
    this.windowFrame(c);
    this.leftCorner(c, t);
    this.door(c);
    const big = (img: HTMLCanvasElement, x: number, y: number) => c.drawImage(img, Math.round(x), Math.round(y), img.width * 2, img.height * 2);
    const mk = this.moka;
    // invitée du prologue (le héros en tenue de ville)
    if (this.o.visitor) { const s = heroBust(this.o.visitor); big(s, 215 - s.width, CUST_BASE - s.height * 2); v.hit('card:hero', 215 - s.width, CUST_BASE - s.height * 2, s.width * 2, s.height * 2); }
    // clients
    for (const cu of this.custs) cu.members.forEach(m => {
      const moving = m.x !== m.tx;
      const mood = cu.state === 'served' && m.cup ? 'happy' : m.blink < 0 ? 'blink' : cu.patience < 40 && cu.state !== 'served' ? 'wait' : 'idle';
      let s = custBust(m.look, mood);
      if (m.face < 0 && moving) s = flipped(s);
      const bob = moving ? Math.round(Math.abs(Math.sin(t * 9 + m.x)) * 2) : 0;
      const x = Math.round(m.x - s.width), y = CUST_BASE - s.height * 2 - bob;
      if (m.x > DOOR_X - 20) { c.save(); c.beginPath(); c.rect(0, 0, 384, H); c.clip(); big(s, x, y); c.restore(); } else big(s, x, y);
      if (m.cup) cupArt(c, x + 28, y + 40, ['espresso', 'milk']);
      if (cu.state === 'ready' || cu.state === 'ordered') v.hit('cust:' + cu.id, x + 6, y, s.width * 2 - 12, s.height * 2);
    });
    // Moka et Biscuit au sol (devant les clients)
    if (mk.floor) {
      const moving = mk.x !== mk.tx;
      let s = mokaWalk(this.o.colors.moka, moving ? Math.floor(t * 8) : 0);
      if (mk.face < 0) s = flipped(s);
      const y = BASE - s.height * 2 + 2 - Math.round(Math.sin(mk.hop * Math.PI) * 12);
      big(s, mk.x - s.width, y);
      v.hit('card:moka', mk.x - s.width, y, s.width * 2, s.height * 2);
    }
    if (this.dogIn) {
      const d = this.dogIn, moving = d.x !== d.tx;
      let s = d.sit && !moving ? dogSit(d.kind, 'happy', this.o.colors.bandana) : dogWalk(Math.floor(t * 8), d.kind, this.o.colors.bandana);
      if (!d.sit && d.face < 0) s = flipped(s);
      big(s, d.x - s.width, CUST_BASE - 4 - s.height * 2);
      v.hit('card:biscuit', d.x - s.width, CUST_BASE - 4 - s.height * 2, s.width * 2, s.height * 2);
    }
    this.counter(c, t);
    // Moka assise sur le bar à jus, près de la porte
    if (!mk.floor) {
      const s = mokaSit(this.o.colors.moka, mk.mood);
      const y = MOKA_SEAT - s.height * 2 + 2 - Math.round(Math.sin(mk.hop * Math.PI) * 8);
      big(s, mk.x - s.width, y);
      v.hit('card:moka', mk.x - s.width, y, s.width * 2, s.height * 2);
      if (mk.mood === 'sleep') tOut(c, 'Z', mk.x + 16, y - 2 - Math.round((t * 3) % 3), CREAM);
    }
    // panneaux de commande
    for (const cu of this.custs) this.panel(c, cu, t);
    if (mk.say) bubble(c, Math.max(50, Math.min(W - 50, mk.x)), mk.floor ? 78 : 56, mk.say);
    for (const ch of this.chats) bubble(c, ch.x, ch.y - Math.min(2, Math.floor(ch.t * 6)), ch.s, 0);
    for (const f of this.flying) {
      const e = f.t * (2 - f.t);
      cupArt(c, Math.round(f.x0 + (f.x1 - f.x0) * e), Math.round(f.y0 + (f.y1 - f.y0) * e - Math.sin(f.t * Math.PI) * 26), f.cup);
    }
    for (const f of this.fxs) tOut(c, f.s, f.x, f.y - f.t * 14, f.col);
    this.hud(c);
    // flèche du tutoriel et nom de l'objet survolé
    if (this.guideOn) {
      const id = this.nextStep(), hh = id && v.hits.find(x => x.id === id);
      if (hh) { const ax = Math.round(hh.x + hh.w / 2), ay = Math.round(hh.y - 9 + Math.abs(Math.sin(t * 5)) * 3); this.arrow(c, ax, ay); }
    }
    if (v.hover && ITEM_NAMES[v.hover]) {
      const label = v.hover === 'card:moka' ? 'MOKA' : ITEM_NAMES[v.hover], w = textWidth(label) + 6;
      const x = Math.max(2, Math.min(W - w - 2, Math.round(v.mouse.x - w / 2))), y = Math.max(16, Math.round(v.mouse.y - 16));
      box(c, x, y, w, 11, INK, INK); drawText(c, label, x + 3, y + 2, '#fdf5e8');
    }
  }

  private arrow(c: Ctx, x: number, y: number) {
    for (let i = 0; i < 5; i++) rect(c, x - 4 + i, y + i, 9 - i * 2, 1, i === 4 ? INK : '#f3c24a');
    rect(c, x - 5, y - 1, 11, 1, INK); for (let i = 0; i < 5; i++) { rect(c, x - 5 + i, y + i, 1, 1, INK); rect(c, x + 5 - i, y + i, 1, 1, INK); }
    rect(c, x - 2, y - 6, 5, 5, '#f3c24a'); rect(c, x - 3, y - 7, 7, 1, INK); rect(c, x - 3, y - 6, 1, 5, INK); rect(c, x + 3, y - 6, 1, 5, INK);
  }

  /* ---------- décor ---------- */
  private room(c: Ctx, t: number) {
    rect(c, 0, 0, W, H, '#f1e2c8');
    for (let x = 0; x < W; x += 10) rect(c, x, 4, 4, 92, '#ead6b6');
    rect(c, 0, 0, W, 4, '#6e4632'); rect(c, 0, 4, W, 1, '#8a5a40');
    // lambris
    rect(c, 0, 96, W, 22, '#a8704a'); rect(c, 0, 96, W, 2, '#c08a5e'); rect(c, 0, 117, W, 1, '#7a4e36');
    for (let x = 4; x < W; x += 24) { rect(c, x, 101, 18, 12, '#9c6642'); rect(c, x, 101, 18, 1, '#7a4e36'); rect(c, x, 101, 1, 12, '#7a4e36'); }
    rect(c, 0, 118, W, 15, '#c9925e'); for (let x = 0; x < W; x += 26) rect(c, x, 118, 1, 15, '#a8704a'); rect(c, 0, 125, W, 1, '#b8814f');
    // lampes suspendues
    for (const x of [130, 210, 290]) {
      rect(c, x, 0, 1, 7, INK);
      rect(c, x - 6, 7, 13, 1, INK); rect(c, x - 7, 8, 15, 4, '#e8b04a'); rect(c, x - 7, 8, 15, 1, INK); rect(c, x - 8, 12, 17, 1, INK);
      rect(c, x - 2, 13, 5, 2, '#fff1b8');
      if (this.o.mode !== 'day') { c.globalAlpha = 0.18 + Math.sin(t * 2 + x) * 0.02; disc(c, x, 18, 14, '#ffd98a'); c.globalAlpha = 1; }
    }
  }
  private outside(c: Ctx, t: number) {
    const mode = this.o.mode, x0 = 95, y0 = 19, w = 232, hh = 74;
    c.save(); c.beginPath(); c.rect(x0, y0, w, hh); c.clip();
    const sky = mode === 'day' ? ['#9fd3f0', '#ade0f3', '#bfe7f4', '#d3eef3'] : mode === 'sunset' ? ['#9a7fb0', '#c98a9e', '#ec9c88', '#f6b884', '#fbd29a'] : ['#18204a', '#1f2a5e', '#283670', '#324284'];
    bands(c, x0, y0, w, 60, sky);
    if (mode === 'night') { for (const [sx, sy] of this.stars) if ((Math.floor(t * 2 + sx) % 7) !== 0) rect(c, sx, sy, 1, 1, '#fff6d8'); disc(c, 290, 32, 6, '#fff6d8'); disc(c, 292, 30, 5, sky[0]); }
    else if (mode === 'sunset') { disc(c, 250, 62, 11, '#ffe2a0'); disc(c, 250, 62, 8, '#fff1c4'); }
    else disc(c, 300, 32, 7, '#fff6c8');
    if (mode !== 'night') for (let i = 0; i < 3; i++) {
      const cx = x0 + ((i * 97 + t * 4) % (w + 60)) - 30, cy = y0 + 10 + i * 9, cc = mode === 'day' ? '#ffffff' : '#ffd9c0';
      rect(c, cx, cy, 22, 4, cc); rect(c, cx + 4, cy - 3, 12, 3, cc); rect(c, cx + 8, cy - 5, 6, 2, cc);
    }
    // colline de Komorebi-chō et maisons
    const hill = mode === 'day' ? '#9cc59a' : mode === 'sunset' ? '#9a7f96' : '#2c3456';
    const hill2 = mode === 'day' ? '#86b487' : mode === 'sunset' ? '#86708a' : '#262d4c';
    for (let x = x0; x < x0 + w; x++) { const y = 56 + Math.round(Math.sin((x - x0) / 30) * 5 + Math.sin((x - x0) / 11) * 2); rect(c, x, y, 1, 30, hill); }
    for (let x = x0; x < x0 + w; x++) { const y = 66 + Math.round(Math.sin((x - x0) / 22 + 2) * 3); rect(c, x, y, 1, 30, hill2); }
    const wall = mode === 'night' ? '#4a5278' : mode === 'sunset' ? '#e8c0a8' : '#f4dcc0';
    const lit = mode === 'day' ? '#8fb8d8' : '#ffd28a';
    const houses: [number, number, number, string][] = [[100, 66, 22, '#c46a5a'], [126, 70, 18, '#6f7fa8'], [150, 64, 26, '#7fa48c'], [196, 68, 20, '#c46a5a'], [222, 62, 24, '#e8a24a'], [262, 67, 22, '#6f7fa8'], [292, 64, 30, '#c46a5a']];
    for (const [hx, hy, hw, roof] of houses) {
      box(c, hx, hy, hw, 30, wall, INK, false);
      for (let k = 0; k < 5; k++) rect(c, hx - 2 + k, hy - 5 + k, hw + 4 - k * 2, 1, k === 0 ? INK : mode === 'night' ? '#3a4266' : roof);
      rect(c, hx - 3, hy - 1, hw + 6, 1, INK);
      rect(c, hx + 4, hy + 6, 4, 4, lit); rect(c, hx + hw - 8, hy + 6, 4, 4, lit);
    }
    // arbre doré (l'automne de Komorebi-chō)
    rect(c, 182, 64, 3, 22, '#6e4632'); for (const [dx, dy, r] of [[183, 56, 9], [176, 62, 6], [190, 61, 7]] as const) disc(c, dx, dy, r, mode === 'night' ? '#6a5a40' : '#e8a24a');
    for (const [dx, dy] of [[180, 52], [188, 57], [177, 60]]) rect(c, dx, dy, 2, 2, mode === 'night' ? '#7d6a48' : '#f6c75a');
    // trottoir
    rect(c, x0, 84, w, 9, mode === 'night' ? '#4a4866' : '#cbbca8'); rect(c, x0, 84, w, 1, mode === 'night' ? '#3a3856' : '#a89880');
    // Biscuit dehors, derrière la vitre
    if (this.dog === 'stray' || this.dog === 'idle' || this.dog === 'patrol') { const s = dogSit('rope', this.dog === 'stray' ? 'sad' : 'idle', this.o.colors.bandana); c.drawImage(s, 236, 92 - s.height); this.view.hit('card:biscuit', 236, 92 - s.height, s.width, s.height); }
    else if (this.dog === 'straysleep' || this.dog === 'sleep') { const s = dogSleep('tag', this.o.colors.bandana); c.drawImage(s, 236, 92 - s.height); this.view.hit('card:biscuit', 236, 92 - s.height, s.width, s.height); drawText(c, 'Z', 262, 74 - Math.round((t * 3) % 3), '#fdf5e8'); }
    // reflets sur la vitre
    c.globalAlpha = 0.25; for (let k = 0; k < 10; k++) rect(c, x0 + 14 + k, y0 + 50 - k * 2, 2, 2, '#ffffff'); c.globalAlpha = 1;
    c.restore();
  }
  private windowFrame(c: Ctx) {
    const wood = '#7a4e36', light = '#9a6644';
    rect(c, 92, 16, 238, 3, wood); rect(c, 92, 93, 238, 3, wood); rect(c, 92, 16, 3, 80, wood); rect(c, 327, 16, 3, 80, wood);
    for (const x of [171, 249]) rect(c, x, 19, 3, 74, wood);
    rect(c, 95, 33, 232, 2, wood);
    rect(c, 92, 16, 238, 1, light); rect(c, 91, 15, 240, 1, INK); rect(c, 91, 15, 1, 82, INK); rect(c, 330, 15, 1, 82, INK);
    // rebord
    rect(c, 86, SILL_Y, 250, 5, '#c08a5e'); rect(c, 86, SILL_Y, 250, 1, '#e0aa78'); rect(c, 86, SILL_Y + 5, 250, 1, INK); rect(c, 85, SILL_Y, 1, 6, INK); rect(c, 336, SILL_Y, 1, 6, INK);
    // plantes en pot sur le rebord
    for (const [px, col] of [[104, '#e86a5f'], [236, '#7fa8d8']] as const) {
      box(c, px, SILL_Y - 8, 10, 8, col); rect(c, px + 1, SILL_Y - 8, 8, 1, INK);
      for (const [dx, dy] of [[2, -13], [5, -15], [7, -12], [4, -11], [1, -10], [8, -10]]) rect(c, px + dx, SILL_Y + dy, 2, 3, '#6f957d');
      rect(c, px + 4, SILL_Y - 12, 2, 4, '#55806a');
    }
  }
  private door(c: Ctx) {
    const x = 344, open = this.custs.some(cu => cu.members.some(m => m.x > DOOR_X - 8)) || (this.dogIn && this.dogIn.x > DOOR_X - 8);
    rect(c, x - 3, 24, 46, 94, '#6e4632'); rect(c, x - 3, 24, 46, 1, INK); rect(c, x - 4, 24, 1, 94, INK); rect(c, x + 43, 24, 1, 94, INK);
    if (open) { rect(c, x, 27, 40, 91, this.o.mode === 'night' ? '#2c3456' : this.o.mode === 'sunset' ? '#f6b884' : '#bfe7f4'); rect(c, x, 100, 40, 18, this.o.mode === 'night' ? '#4a4866' : '#cbbca8'); rect(c, x + 34, 27, 6, 91, '#8a5a40'); rect(c, x + 33, 27, 1, 91, INK); }
    else {
      rect(c, x, 27, 40, 91, '#8a5a40'); box(c, x + 5, 31, 30, 38, this.o.mode === 'night' ? '#3a4a8c' : this.o.mode === 'sunset' ? '#f6c098' : '#bfe7f4');
      rect(c, x + 19, 32, 2, 36, '#8a5a40'); box(c, x + 5, 76, 30, 34, '#9c6642'); rect(c, x + 33, 72, 3, 3, '#e3c06e');
      box(c, x + 8, 54, 24, 10, CREAM); drawText(c, this.o.mode === 'night' ? 'BYE' : 'OPEN', x + 20, 56, this.o.mode === 'night' ? '#8a5a40' : '#6f957d', 'center');
    }
    const ring = this.bellT > 0 ? Math.round(Math.sin(this.bellT * 40) * 1) : 0;
    rect(c, x + 20, 19, 1, 4, INK); disc(c, x + 20 + ring, 24, 2, '#e3c06e');
  }
  private leftCorner(c: Ctx, t: number) {
    const v = this.view;
    // porte de la boulangerie (bientôt)
    rect(c, 4, 34, 32, 84, '#6e4632'); box(c, 6, 36, 28, 82, '#a8704a'); rect(c, 7, 37, 26, 3, '#9c6642');
    box(c, 10, 44, 20, 26, '#9c6642'); box(c, 10, 76, 20, 34, '#9c6642'); disc(c, 29, 74, 1, '#e3c06e');
    box(c, 7, 56, 26, 11, CREAM); drawText(c, 'SOON', 20, 58, '#c46a5a', 'center');
    // croissant
    rect(c, 13, 47, 14, 5, '#e8a24a'); rect(c, 11, 49, 2, 4, '#e8a24a'); rect(c, 27, 49, 2, 4, '#e8a24a'); rect(c, 17, 47, 1, 5, '#c97a3a'); rect(c, 22, 47, 1, 5, '#c97a3a');
    v.hit('bakery', 4, 34, 32, 84);
    // étagère avec le tourne-disque
    rect(c, 38, 44, 50, 3, '#7a4e36'); rect(c, 38, 47, 50, 1, INK);
    box(c, 42, 34, 22, 10, '#c46a5a'); disc(c, 51, 37, 3, INK); rect(c, 51, 37, 1, 1, '#e86a5f'); rect(c, 58, 35, 1, 5, '#d8d4dc'); rect(c, 56, 35, 3, 1, '#d8d4dc');
    if (Math.floor(t * 2) % 2) drawText(c, '♪', 64, 22, '#7a4e36'); else drawText(c, '♪', 68, 26, '#7a4e36');
    v.hit('music', 40, 22, 30, 24);
    for (const [bx, col] of [[70, '#7fa8d8'], [74, '#f2c46a'], [78, '#9c8ac0']] as const) box(c, bx, 33, 4, 11, col, INK, false);
    // fauteuil et Grand-mère
    const arm = '#6f957d', armD = '#5b806a';
    box(c, 36, 60, 56, 46, arm); rect(c, 37, 61, 54, 3, '#85ab92'); rect(c, 37, 64, 54, 1, '#5b806a');
    const g = grandmaRead(this.o.colors.grandma, Math.floor(this.gmaT / 3) % 2);
    c.drawImage(g, 38, 58, g.width * 2, g.height * 2);
    box(c, 32, 92, 12, 26, armD); box(c, 84, 92, 12, 26, armD); rect(c, 33, 93, 10, 2, '#6f957d'); rect(c, 85, 93, 10, 2, '#6f957d');
    box(c, 42, 106, 44, 12, arm); rect(c, 43, 107, 42, 2, '#85ab92');
    v.hit('card:grandma', 34, 58, 60, 60);
  }

  private counter(c: Ctx, t: number) {
    const v = this.view;
    // plan de travail
    rect(c, 0, 133, W, 52, '#d9b48a');
    for (let y = 141; y < 185; y += 11) rect(c, 0, y, W, 1, '#c9a074');
    for (let x = 20; x < W; x += 47) rect(c, x, 133, 1, 52, '#cfa87c');
    rect(c, 0, 128, W, 6, '#5a3a2a'); rect(c, 0, 128, W, 1, '#7a5440'); rect(c, 0, 134, W, 1, INK);
    rect(c, 0, 185, W, 3, '#5a3a2a'); rect(c, 0, 188, W, 1, INK);
    // sous le comptoir
    rect(c, 0, 189, W, 36, '#4d3226');
    rect(c, 0, 189, W, 8, '#3d271e');
    for (const x of [0, 110, 296, 399]) rect(c, x, 189, 1, 36, '#2b1a14');
    rect(c, 110, 210, 186, 2, '#6e4632');
    // compteurs de stock
    const cnt = (n: number, x: number, y = 190, low = 3) => { const s = String(n), w = textWidth(s) + 4; box(c, Math.round(x - w / 2), y - 2, w, 11, n <= low ? '#b0503e' : '#3d271e'); drawText(c, s, x, y, '#fdf5e8', 'center'); };

    // machine à espresso rétro (vert sauge)
    const shake = this.grinding > 0 ? Math.round(Math.sin(t * 60)) : 0;
    box(c, 6, 108, 70, 70, '#8fb39a'); rect(c, 7, 109, 68, 4, '#a9c8b2'); rect(c, 7, 170, 68, 7, '#7a9e86');
    box(c, 4, 104, 74, 6, '#d8d4dc'); rect(c, 5, 105, 72, 1, '#f0eef2');
    disc(c, 41, 124, 8, INK); disc(c, 41, 124, 7, '#f6f2ea'); rect(c, 41, 119, 1, 5, '#e86a5f'); rect(c, 41, 124, 4, 1, INK); disc(c, 41, 124, 1, INK);
    drawText(c, 'KOMOREBI', 41, 136, '#55806a', 'center');
    box(c, 30, 146, 22, 7, '#d8d4dc');
    box(c, 33, 153, 16, 5, this.ground ? '#5a3424' : '#a8a4ac'); rect(c, 49, 154, 12, 2, INK); rect(c, 60, 153, 3, 4, '#2e2a33');
    if (this.ground) for (let k = 0; k < 3; k++) rect(c, 36 + k * 4, 152, 2, 1, '#7a4a30');
    box(c, 10, 160, 8, 8, '#e86a5f'); box(c, 64, 160, 8, 8, '#e86a5f');
    rect(c, 22, 170, 38, 2, '#5a6a60');
    v.hit('espresso', 4, 98, 74, 80);
    // moulin
    const gx = 80 + shake;
    box(c, gx + 3, 108, 16, 20, '#e8f4f8'); rect(c, gx + 4, 114 + (20 - Math.min(20, this.stock.espresso)) / 4, 14, 13 - (20 - Math.min(20, this.stock.espresso)) / 4, '#6e4632');
    for (let k = 0; k < 4; k++) rect(c, gx + 6 + k * 3, 118 + (k % 2) * 3, 1, 1, '#4a2a1c');
    rect(c, gx + 2, 106, 18, 3, '#2e2a33');
    box(c, gx + 1, 127, 20, 40, '#e08a4a'); rect(c, gx + 2, 128, 18, 3, '#f2a66a'); disc(c, gx + 11, 138, 3, '#2e2a33'); rect(c, gx + 9, 150, 5, 6, '#2e2a33');
    box(c, gx, 166, 22, 12, '#b86a38');
    if (this.grinding > 0) for (let k = 0; k < 3; k++) rect(c, gx + 10 + ((k * 3 + Math.floor(t * 20)) % 5) - 2, 157 + ((k * 2 + Math.floor(t * 20)) % 6), 1, 1, '#5a3424');
    v.hit('grind', 80, 104, 22, 74); cnt(this.stock.espresso, 91, 140);
    // bouilloire
    box(c, 106, 158, 18, 20, '#b8c0cc'); rect(c, 107, 159, 16, 3, '#d8dee6'); rect(c, 112, 154, 6, 4, '#2e2a33');
    rect(c, 124, 162, 2, 2, INK); rect(c, 126, 158, 2, 5, INK); rect(c, 128, 155, 2, 4, INK); rect(c, 125, 162, 1, 1, '#b8c0cc');
    if (Math.floor(t * 2) % 2) { rect(c, 130, 151, 1, 2, '#ffffff'); rect(c, 131, 148, 1, 2, '#ffffff'); }
    v.hit('water', 104, 148, 28, 30);
    // lait
    box(c, 134, 146, 14, 32, CREAM); rect(c, 135, 147, 12, 4, '#7fa8d8'); rect(c, 136, 144, 10, 3, '#5a7fb0');
    drawText(c, 'M', 141, 158, '#5a7fb0', 'center');
    if (this.stock.milk <= 0) { c.globalAlpha = 0.5; rect(c, 134, 146, 14, 32, '#4d3226'); c.globalAlpha = 1; }
    v.hit('milk', 132, 142, 18, 36); cnt(this.stock.milk, 141, 166);
    // pichet à mousse
    box(c, 152, 160, 16, 18, '#c8ced8'); rect(c, 153, 158, 14, 4, CREAM); disc(c, 156, 158, 2, CREAM); disc(c, 163, 158, 2, CREAM);
    rect(c, 168, 164, 3, 1, INK); rect(c, 170, 164, 1, 8, INK); rect(c, 168, 171, 3, 1, INK);
    v.hit('foam', 150, 152, 22, 26);
    // emplacements des tasses
    SLOTX.forEach((x, i) => {
      const cup = this.cups[i], sel = i === this.sel && !!cup;
      rect(c, x - 3, 176, 22, 2, '#b48a5e');
      if (sel) { rect(c, x - 4, 157, 24, 1, '#f3c24a'); rect(c, x - 4, 178, 24, 1, '#f3c24a'); rect(c, x - 4, 157, 1, 22, '#f3c24a'); rect(c, x + 19, 157, 1, 22, '#f3c24a'); }
      if (cup) { cupArt(c, x, 162, cup, sel); if (cup.length && Math.floor(t * 3 + i) % 3 === 0) rect(c, x + 5, 157 - Math.floor(t * 6) % 3, 1, 2, '#ffffff'); }
      else { c.globalAlpha = 0.35; rect(c, x + 1, 166, 10, 10, '#b48a5e'); c.globalAlpha = 1; }
      v.hit('slot:' + i, x - 4, 156, 24, 24);
    });
    // sirops
    const syrup = (x: number, col: string, locked: boolean, id: string) => {
      box(c, x, 150, 12, 28, locked ? '#a8a4ac' : col); rect(c, x + 1, 151, 10, 3, locked ? '#c8c4cc' : '#ffffff55'); rect(c, x + 4, 140, 4, 10, '#2e2a33'); rect(c, x + 2, 138, 8, 2, '#2e2a33'); rect(c, x + 8, 136, 4, 2, '#2e2a33');
      box(c, x + 1, 160, 10, 9, CREAM);
      if (locked) { rect(c, x + 4, 162, 4, 4, '#8a8690'); rect(c, x + 5, 161, 2, 1, '#8a8690'); } else drawText(c, 'C', x + 6, 161, '#b86a38', 'center');
      v.hit(id, x - 1, 134, 14, 44);
    };
    syrup(290, '#c98a4a', !this.o.caramel, 'caramel'); syrup(306, '#f3e6c8', true, 'lock'); syrup(322, '#a8704a', true, 'lock');
    if (this.o.caramel) cnt(this.stock.caramel, 296, 152);
    // cloche de service
    const by = this.bellT > 0 ? 1 : 0;
    rect(c, 340, 176, 16, 2, '#2e2a33'); disc(c, 348, 172 + by, 6, INK); disc(c, 348, 172 + by, 5, '#e3c06e'); rect(c, 342, 173 + by, 13, 4, '#e3c06e'); rect(c, 341, 176, 15, 1, INK);
    rect(c, 347, 164 + by, 2, 2, INK); rect(c, 345, 168 + by, 2, 2, '#fff1b8');
    v.hit('bell', 338, 160, 20, 18);
    // bar à jus (niveau 2)
    box(c, 362, 116, 34, 62, '#d8d4dc'); box(c, 366, 120, 26, 30, '#e8f4f8'); rect(c, 367, 132, 24, 17, '#f2a24a'); rect(c, 367, 132, 24, 1, '#f6c27a');
    rect(c, 376, 150, 6, 8, '#2e2a33'); box(c, 364, 162, 30, 12, '#a8a4ac'); drawText(c, 'LV2', 379, 165, CREAM, 'center');
    c.globalAlpha = 0.35; rect(c, 362, 116, 34, 62, '#4d3226'); c.globalAlpha = 1;
    v.hit('juice', 360, 114, 38, 64);
    // pile de tasses, poubelle, réserve
    for (let k = 0; k < Math.min(5, Math.ceil(this.stock.cups / 4)); k++) { box(c, 10, 214 - k * 4, 14, 6, CREAM); rect(c, 11, 215 - k * 4, 12, 1, '#e8dccb'); }
    for (let k = 0; k < Math.min(5, Math.ceil(this.stock.cups / 4) - 1); k++) { box(c, 26, 214 - k * 4, 14, 6, CREAM); }
    v.hit('cup', 6, 194, 38, 30); cnt(this.stock.cups, 25);
    box(c, 50, 199, 24, 24, '#7d9a8a'); box(c, 48, 196, 28, 5, '#6b8778'); rect(c, 58, 194, 8, 2, '#5a7466');
    for (const x of [56, 62, 68]) rect(c, x, 204, 1, 15, '#6b8778');
    v.hit('trash', 46, 192, 32, 32);
    for (let k = 0; k < 3; k++) { box(c, 120 + k * 16, 198, 12, 12, ['#e8b04a', '#c99a6e', '#9cc59a'][k]); rect(c, 121 + k * 16, 198, 10, 2, INK); }
    for (let k = 0; k < 5; k++) { box(c, 190 + k * 18, 200, 14, 10, CREAM); rect(c, 191 + k * 18, 204, 12, 1, '#e3c0a0'); }
    box(c, 306, 198, 50, 25, '#c99b6e'); rect(c, 307, 199, 48, 2, '#d7aa7c'); rect(c, 306, 210, 50, 1, '#a8784e');
    drawText(c, 'SUPPLY', 331, 202, '#6e4632', 'center'); drawText(c, '15C', 331, 213, '#6e4632', 'center');
    v.hit('restock', 304, 194, 54, 30);
    box(c, 362, 200, 32, 23, '#e8dccb'); rect(c, 366, 196, 24, 5, '#a8704a'); drawText(c, 'BEANS', 378, 207, '#6e4632', 'center');
  }

  private panel(c: Ctx, cu: Cust, t: number) {
    if (cu.state === 'walking' || cu.state === 'leaving') return;
    const cx = SPOTX[cu.spot], w = 62, hh = 42, x = cx - 34, y = 18;
    const bounce = cu.state === 'ready' ? Math.round(Math.abs(Math.sin(t * 4)) * 2) : 0, yy = y - bounce;
    const hover = this.view.isHover('cust:' + cu.id);
    box(c, x, yy, w, hh, hover ? '#ecebf0' : '#d8d4dc'); rect(c, x + 1, yy + 1, w - 2, 2, '#ecebf0');
    rect(c, cx - 4, yy + hh, 7, 1, '#d8d4dc'); rect(c, cx - 3, yy + hh + 1, 5, 1, '#d8d4dc'); rect(c, cx - 2, yy + hh + 2, 3, 1, '#d8d4dc');
    for (let k = 0; k < 4; k++) { rect(c, cx - 5 + k, yy + hh - 1 + k, 1, 1, INK); rect(c, cx + 3 - k, yy + hh - 1 + k, 1, 1, INK); }
    // jauge de patience verticale (comme sur la référence)
    if (cu.state !== 'served') {
      const ph = Math.round((hh - 2) * cu.patience / 100), col = cu.patience > 60 ? '#f3c84a' : cu.patience > 20 ? '#f29a4a' : '#e86a5f';
      box(c, x + w + 1, yy, 6, hh, '#5a4a5e'); rect(c, x + w + 2, yy + hh - 1 - ph, 4, ph, col);
    }
    if (cu.state === 'ready') {
      drawText(c, '?', cx - 1, yy + 6, INK, 'center', 2);
      drawText(c, 'ORDER', cx - 1, yy + 26, '#6e4632', 'center');
    } else if (cu.state === 'ordered') {
      const r = cu.recipe!, rem = cu.qty - cu.servedCups;
      cupArt(c, x + 5, yy + 4, r.need);
      if (r.need.includes('foam')) rect(c, x + 6, yy + 6, 10, 2, '#fff4e6');
      drawText(c, rem > 1 ? `×${rem}` : `${r.price}C`, x + 24, yy + 7, rem > 1 ? '#b0503e' : '#6e4632');
      r.need.forEach((ing, k) => chip(c, ing, x + 24 + k * 9, yy + 17));
      drawText(c, SHORT[r.id] ?? r.name, cx - 3, yy + 31, INK, 'center');
    } else {
      drawText(c, '♥', cx - 1, yy + 8, '#e86a5f', 'center', 2);
      drawText(c, 'THANKS!', cx - 3, yy + 28, INK, 'center');
    }
    this.view.hit('cust:' + cu.id, x, yy, w + 7, hh + 3);
  }

  private hud(c: Ctx) {
    const pill = (x: number, w: number) => box(c, x, 2, w, 12, '#fdf5e8');
    const minutes = 8 * 60 + this.served * 35, clock = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    const time = this.o.mode === 'day' ? clock : this.o.mode === 'sunset' ? '17:45' : 'CLOSED';
    const label = this.o.day ? `DAY ${this.o.day} · ${time}` : `ARRIVAL · ${time}`;
    const w1 = textWidth(label) + 16;
    pill(2, w1); disc(c, 8, 8, 3, this.o.mode === 'night' ? '#fff3c4' : '#f6b84a'); drawText(c, label, 13, 5, INK);
    let x = w1 + 5;
    if (this.o.customers) { const s = `${this.served}/${this.o.goal} HAPPY`, w = textWidth(s) + 16; pill(x, w); drawText(c, '♥', x + 4, 5, '#e86a5f'); drawText(c, s, x + 12, 5, INK); x += w + 3; }
    const nm = `★ ${this.o.heroName.toUpperCase()}`, wn = textWidth(nm) + 8;
    pill(x, wn); drawText(c, nm, x + 4, 5, this.view.isHover('card:hero') ? '#b0503e' : INK); this.view.hit('card:hero', x, 2, wn, 12);
    const coins = String(Math.round(this.coins * 100) / 100), wc = textWidth(coins) + 17, cx = W - wc - 46;
    pill(cx, wc); disc(c, cx + 7, 8, 3, '#e3c06e'); rect(c, cx + 7, 7, 1, 3, '#b0884a'); drawText(c, coins, cx + 13, 5, INK);
  }

  destroy() { clearTimeout(this.toastTimer); this.view.destroy(); }
}
