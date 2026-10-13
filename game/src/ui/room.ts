// Salle du café pendant le service : groupes de clients (seuls, couples, trios), Moka, commandes, paiement
import { P, heart, grandma, biscuit, moka, customer, custLegs } from '../art/cast.js';
import { L, ch, shell, lamps, backWall, station as stationArt, counter, sofaBack, sofaFront, grandmaLap, recordPlayer, rug, chairBack, chairSeat, tableCloth, plant, mouseHole, HOLE } from './roomArt.js';
import { crumbMouse } from '../art/cast.js';
import type { Who } from '../logic/outfits';
import { DRAW, h, ui } from './dom';
import { Stage, type Actor } from './actors';
import { recipeById, type Recipe } from '../logic/recipes';
import { tickPatience, hearts, outcome, payment, type Outcome } from '../logic/service';
import { music } from '../audio/music';

const NS = 'http://www.w3.org/2000/svg';
type PartyState = 'walking' | 'ready' | 'ordered' | 'served' | 'wantbook' | 'reading' | 'leaving';
export interface Member { g: 'm' | 'f'; v: number }
/** Un groupe de clients assis au même coin fauteuils. `table` = numéro du coin. */
export interface Cust {
  id: number; members: Member[]; table: number; state: PartyState;
  recipe?: Recipe; qty: number; servedCups: number; pay: number; patience: number;
  /** Après le café, certains clients empruntent un livre ou un magazine et restent un moment. */
  want?: 'book' | 'magazine'; readT?: number;
}

export const SPOTS = [{ cx: 780, cy: 610 }, { cx: 1120, cy: 610 }, { cx: 730, cy: 805 }, { cx: 1110, cy: 810 }];
// places : 0 = gauche (tournée vers la table), 1 = droite, 2 = derrière la table
const SEATS = [{ dx: -116, dy: 10, s: .92, dir: -1 }, { dx: 116, dy: 10, s: .92, dir: 1 }, { dx: 0, dy: -46, s: .92, dir: 0 }];
// les coins de gauche remplissent d'abord la chaise de gauche, ceux de droite la chaise de droite
const SEAT_ORDER = [[0, 1, 2], [1, 0, 2]];
const DOOR = { x: 1335, y: 368 };
const CUSHION = { x: 1334, y: 502 };
const LANE = 500; // couloir derrière les fauteuils
const scaleAt = (y: number) => 0.8 + (y - DOOR.y) / 900 * 0.45;
const CHAT = ['haha!', '♪', 'so cozy…', '☕?', '♡', 'really?!', 'mmm…', '✨', 'look!', 'same!'];
const READ = ['*sip*', 'mmm…', '♪', 'so cozy…', '*page turn*', '♡'];

export interface RoomOpts {
  hero: 'm' | 'f'; uniform: string; uniformVars?: string; mode: 'day' | 'sunset' | 'night';
  dog: 'none' | 'stray' | 'straysleep' | 'sleep' | 'idle' | 'patrol'; day: number; goal: number; coins: number;
  recipes: string[]; maxSeated: number; customers: boolean; parties?: number[];
  outfitVars?: { moka?: string; grandma?: string; biscuit?: string };
  /** Grand-mère assise sur le canapé (seulement au prologue) ; sinon ses conseils arrivent dans une bulle avec son visage. */
  grandma?: boolean | 'stand';
  /** Niveau 2 : le bar à jus est ouvert. */
  juiceOpen?: boolean;
  /** Niveau 3 : trou de souris dans le mur (« hole »), puis la petite porte de la Crumb Crew (« door »). */
  mouseHole?: 'hole' | 'door';
}

export class Room {
  el: HTMLElement;
  custs: Cust[] = [];
  served = 0;
  coins: number;
  spawning: boolean;
  private nextId = 1;
  private cooldown = 1.5;
  private timer: number;
  private chatTimer: number;
  private idleFor = 0;
  private mokaBusy = 0;
  private mokaQueue: Promise<void> = Promise.resolve();
  private stage!: Stage;
  private mokaA!: Actor;
  onStation?: () => void;
  onServed?: (served: number) => void;
  onEmpty?: () => void;
  onArrive?: (c: Cust) => void;
  onOrder?: (c: Cust) => void;
  onCard?: (who: Who) => void;
  onMusic?: () => void;
  onJuice?: () => void;
  /** Statistiques du niveau : boisson servie, livre prêté, pourboire. */
  onDrink?: (r: Recipe, o: Outcome) => void;
  onBook?: (c: Cust) => void;
  onTip?: (coins: number) => void;

  constructor(public o: RoomOpts) {
    this.coins = o.coins;
    this.spawning = o.customers;
    const ov = o.outfitVars ?? {};
    this.el = h(`<div class="screen room" data-mode="${o.mode}"><svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet"><g class="art">
      ${shell()}${o.mouseHole ? mouseHole(o.mouseHole) : ''}${lamps()}${backWall()}${stationArt(o.juiceOpen)}
      <g transform="translate(820 400) scale(.88) translate(-820 -400)">${sofaBack()}
      ${o.grandma !== true && o.grandma !== undefined ? '' : `<g class="hit" data-act="card" data-who="grandma"><g transform="rotate(-5 820 380)"><svg id="grandmaSvg" x="745" y="200" width="150" height="195" viewBox="0 0 200 260" data-state="read" style="${ov.grandma ?? ''}" overflow="visible">${grandma()}</svg></g></g>`}
      ${sofaFront()}${o.grandma !== true && o.grandma !== undefined ? grandmaLap(false) : `<g class="hit" data-act="card" data-who="grandma">${grandmaLap()}</g>`}</g>${recordPlayer()}
      <g class="hit" data-act="card" data-who="hero"><svg id="heroSvg" x="392" y="232" width="150" height="195" viewBox="0 0 200 260" data-state="${o.uniform}" style="${o.uniformVars ?? ''}" overflow="visible">${DRAW[o.hero === 'f' ? 'heroF' : 'heroM']()}</svg></g>
      <g id="behind"></g>
      ${counter()}
      ${rug()}
      ${o.grandma === 'stand' ? `<g class="hit" data-act="card" data-who="grandma"><svg id="grandmaSvg" x="214" y="372" width="150" height="195" viewBox="0 0 200 260" data-state="tea" style="${ov.grandma ?? ''}" overflow="visible">${grandma()}</svg></g>` : ''}
      <g class="md ms">${[[1010, 470, 120, 34], [1120, 520, 90, 26], [880, 520, 70, 20]].map(([x, y, rx, ry], i) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#sunPatch)" style="animation:dapple ${5 + i}s ease-in-out infinite;transform-origin:${x}px ${y}px"/>`).join('')}</g>
      <ellipse cx="1330" cy="512" rx="62" ry="18" fill="#c99a78" ${L(2)}/><ellipse cx="1330" cy="502" rx="56" ry="16" fill="${P.coral}" ${L(2)}/>
      <g id="depth">${SPOTS.map((t, i) => { const place = (k: number) => { const s = SEATS[k], x = t.cx + s.dx, y = t.cy + s.dy; return `${chairBack(x, y, s.s, s.dir)}${chairSeat(x, y, s.s, s.dir)}<g id="seat-${i}-${k}"></g><g id="legs-${i}-${k}"></g>`; };
        return `<g data-y="${t.cy}">${place(2)}${tableCloth(t.cx, t.cy + 18)}${place(0)}${place(1)}</g>`; }).join('')}</g>
      <g id="extra"></g>
      ${plant(118, 892)}
      <rect class="ms tint" x="0" y="0" width="1600" height="900" fill="#f4bfa0"/>
      <rect class="mn tint" x="0" y="0" width="1600" height="900" fill="#5a6aa8"/>
      <g class="ms mn glow">${[740, 880, 1020, 1160].map(x => `<ellipse cx="${x}" cy="130" rx="120" ry="110" fill="url(#warm)"/>`).join('')}</g>
      </g><g id="chat"></g><g id="bubbles"></g><g id="hud"></g><g id="tip"></g><g id="fx"></g><g id="toast"></g>
    </svg></div>`);
    ui().appendChild(this.el);
    this.stage = new Stage(this.$('depth') as SVGGElement, y => scaleAt(y) / scaleAt(CUSHION.y));
    this.mokaA = this.stage.add(`<svg id="moka" x="-66" y="-166" width="132" height="172" viewBox="0 0 200 260" data-state="idle" style="${ov.moka ?? ''}" overflow="visible">${moka()}</svg>`, CUSHION.x, CUSHION.y, { flipable: true, cls: 'hit', act: 'card', poses: { side: 'walk', front: 'walkfront', back: 'walkback' } });
    this.mokaA.el.dataset.who = 'moka';
    this.setDog(o.dog);
    this.drawHud();
    this.el.querySelector('svg')!.addEventListener('click', e => this.click(e));
    this.timer = window.setInterval(() => this.tick(1), 1000);
    this.chatTimer = window.setInterval(() => this.chat(), 2300);
  }

  $(id: string) { return this.el.querySelector('#' + id) as SVGElement; }

  setDog(state: RoomOpts['dog']) {
    this.$('winDog').innerHTML = state === 'none' ? '' : `<g class="hit" data-act="card" data-who="biscuit">${ch(biscuit, state, state === 'patrol' ? 1020 : 1110, 196, 78, '')}</g>`;
    const svg = this.$('winDog').querySelector('svg'); if (svg && this.o.outfitVars?.biscuit) svg.setAttribute('style', this.o.outfitVars.biscuit);
  }
  setMoka(state: string) { this.$('moka').setAttribute('data-state', state); }
  /** Applique une nouvelle tenue sans recharger la salle (depuis la carte de personnage). */
  restyle(who: Who, vars: string, state?: string) {
    const el = who === 'hero' ? this.$('heroSvg') : who === 'moka' ? this.$('moka') : who === 'grandma' ? this.$('grandmaSvg') : this.$('winDog').querySelector('svg');
    el?.setAttribute('style', vars); if (state && el) el.setAttribute('data-state', state);
  }

  drawHud() {
    const pill = (x: number, w: number) => `<rect x="${x}" y="18" width="${w}" height="50" rx="25" fill="#fdf5e8" fill-opacity=".95" stroke="${P.ink}" stroke-width="2.5"/>`;
    const t = (x: number, s: string, a = 'start') => `<text x="${x}" y="50" text-anchor="${a}" font-family="Nunito,sans-serif" font-weight="800" font-size="18" fill="${P.ink}">${s}</text>`;
    const minutes = 8 * 60 + this.served * 35, clock = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    const timeLabel = this.o.mode === 'day' ? clock : this.o.mode === 'sunset' ? '17:45' : 'Closed';
    this.$('hud').innerHTML = `
      ${pill(18, 250)}<circle cx="48" cy="43" r="14" fill="${this.o.mode === 'night' ? '#fff3c4' : '#ffd27a'}" stroke="${P.ink}" stroke-width="2"/>${t(74, this.o.day ? `Day ${this.o.day} · ${timeLabel}` : `Arrival · ${timeLabel}`)}
      ${this.o.customers ? `${pill(282, 190)}${heart(312, 42, 1.2)}${t(334, `${this.served} / ${this.o.goal} happy`)}` : ''}
      ${pill(1400, 182)}<circle cx="1430" cy="43" r="14" fill="${P.gold}" stroke="${P.ink}" stroke-width="2"/><text x="1430" y="49" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="14" fill="#8a6a3c">c</text>${t(1456, (Math.round(this.coins * 100) / 100).toString())}
      ${this.o.customers ? `<g class="hit" data-act="station"><g class="lift"><rect x="1330" y="808" width="250" height="64" rx="32" fill="${P.ink}"/><text x="1455" y="848" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="20" fill="#fdf5e8">☕ Café station${this.coffeeOrders() ? ` (${this.coffeeOrders()})` : ''}</text></g></g>` : ''}
      ${this.o.customers && this.o.juiceOpen ? `<g class="hit" data-act="juice"><g class="lift"><rect x="1064" y="808" width="250" height="64" rx="32" fill="#e8823a" stroke="${P.ink}" stroke-width="2.5"/><text x="1189" y="848" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="20" fill="#fffaf2">🍊 Juice bar${this.juiceOrders() ? ` (${this.juiceOrders()})` : ''}</text></g></g>` : ''}`;
  }
  private juiceOrders() { return this.ordered().filter(c => c.recipe?.kind === 'juice').length; }
  private coffeeOrders() { return this.ordered().filter(c => c.recipe?.kind !== 'juice').length; }


  /** Bulle de Grand-mère (consigne du tutoriel), depuis son canapé. */
  tip(text: string | null) {
    if (text && this.o.grandma !== true && this.o.grandma !== undefined) {
      // Grand-mère n'est pas dans la salle : bulle de conseil avec son visage
      this.$('tip').innerHTML = `<g class="popin">
        <path d="M300 104 h440 a18 18 0 0 1 18 18 v100 a18 18 0 0 1 -18 18 h-440 a18 18 0 0 1 -18 -18 v-56 l-22 -10 l22 -6 v-28 a18 18 0 0 1 18 -18z" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.5"/>
        <g class="hit" data-act="card" data-who="grandma"><clipPath id="gmaFace"><circle cx="220" cy="160" r="50"/></clipPath>
          <circle cx="220" cy="160" r="52" fill="#f6e7cf" stroke="${P.ink}" stroke-width="3"/>
          <g clip-path="url(#gmaFace)"><svg x="160" y="102" width="120" height="120" viewBox="38 28 124 124" data-state="tea" style="${this.o.outfitVars?.grandma ?? ''}" overflow="visible">${grandma()}</svg></g>
          <circle cx="220" cy="160" r="50" fill="none" stroke="${P.ink}" stroke-width="3"/>
          <rect x="176" y="204" width="88" height="24" rx="12" fill="${P.ink}"/><text x="220" y="221" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="14" fill="#fdf5e8">Grandma</text></g>
        <foreignObject x="300" y="110" width="456" height="128"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 18px/1.35 Nunito,sans-serif;color:#3b2838;padding:6px 18px">${text}</div></foreignObject></g>`;
      return;
    }
    this.$('tip').innerHTML = text ? `<g class="popin"><path d="M262 104 h420 a18 18 0 0 1 18 18 v74 a18 18 0 0 1 -18 18 h-20 l64 40 l-96 -40 h-350 a18 18 0 0 1 -18 -18 v-74 a18 18 0 0 1 18 -18z" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.5"/>
      <foreignObject x="262" y="112" width="436" height="96"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 18px/1.35 Nunito,sans-serif;color:#3b2838;padding:6px 18px">${text}</div></foreignObject></g>` : '';
  }
  toast(text: string) {
    this.$('toast').innerHTML = `<g class="popin"><rect x="460" y="836" width="680" height="46" rx="23" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.5"/><text x="800" y="866" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="17" fill="${P.ink}">${text}</text></g>`;
    clearTimeout((this as any).tt); (this as any).tt = setTimeout(() => this.$('toast').innerHTML = '', 2600);
  }
  fx(x: number, y: number, text: string, color: string = P.ink) {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="fx" style="transform-box:fill-box"><text x="${x}" y="${y}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="24" fill="${color}" stroke="#fffaf2" stroke-width="5" paint-order="stroke">${text}</text></g>`;
    this.$('fx').appendChild(g); setTimeout(() => g.remove(), 1300);
  }

  ordered() { return this.custs.filter(c => c.state === 'ordered'); }
  private peopleBusy() { return this.custs.reduce((n, c) => n + (c.state === 'leaving' || c.state === 'served' || c.state === 'wantbook' || c.state === 'reading' ? 0 : c.members.length - c.servedCups), 0); }

  private tick(dt: number) {
    for (const c of this.custs) {
      if (c.state === 'ready' || c.state === 'ordered') { c.patience = tickPatience(c.patience, dt); this.updateHearts(c); }
      if (c.state === 'reading') { c.readT! -= dt; if (c.readT! <= 0) { c.readT = 0; this.leave(c); } else this.drawBubble(c); }
    }
    if (this.mokaBusy > 0) { if (this.mokaBusy < 90) this.mokaBusy -= dt; }
    else if (this.custs.length === 0) { this.idleFor += dt; this.setMoka(this.idleFor > 5 ? 'sleep' : 'idle'); }
    else { this.idleFor = 0; this.setMoka('idle'); }
    if (!this.spawning) return;
    this.cooldown -= dt;
    const seatedParties = this.custs.filter(c => c.state !== 'leaving').length;
    const left = this.o.goal - this.served - this.peopleBusy();
    if (this.cooldown <= 0 && left > 0 && seatedParties < this.o.maxSeated) { this.spawn(left); this.cooldown = 6; }
  }

  /** Position de la k-ième personne du groupe (selon l'ordre de remplissage du coin). */
  private seatOf(spot: number, k: number) { return SEAT_ORDER[spot % 2][k]; }
  private seatPos(spot: number, k: number) { const t = SPOTS[spot], s = SEATS[this.seatOf(spot, k)]; return { x: t.cx + s.dx, y: t.cy + s.dy, s: s.s }; }
  private custSvg(m: Member, state: string) {
    return `<svg class="nobubble" x="-75" y="-188" width="150" height="195" viewBox="0 0 200 260" data-state="${state}" overflow="visible">${customer(m.g, m.v)}</svg>`;
  }
  /** Client assis : le corps s'enfonce dans le fauteuil, les jambes pliées passent devant le coussin. */
  private seat(spot: number, k: number, m: Member | null, state = 'sit') {
    const sk = this.seatOf(spot, k), slot = this.$(`seat-${spot}-${sk}`), legs = this.$(`legs-${spot}-${sk}`);
    if (!m) { slot.innerHTML = ''; legs.innerHTML = ''; return; }
    const p = this.seatPos(spot, k), w = 150 * p.s, hh = 195 * p.s, x = p.x - w / 2, y = p.y - 150 * p.s;
    slot.innerHTML = `<svg class="nobubble" x="${x}" y="${y}" width="${w}" height="${hh}" viewBox="0 0 200 260" data-state="${state}" overflow="visible">${customer(m.g, m.v)}</svg>`;
    legs.innerHTML = `<svg x="${x}" y="${y}" width="${w}" height="${hh}" viewBox="0 0 200 260" overflow="visible">${custLegs(m.g, m.v)}</svg>`;
  }

  spawn(left: number) {
    const busy = new Set(this.custs.map(c => c.table));
    const free = SPOTS.map((_, i) => i).filter(i => !busy.has(i));
    if (!free.length) return;
    const sizes = (this.o.parties ?? [1]).filter(n => n <= left);
    const size = sizes.length ? sizes[Math.floor(Math.random() * sizes.length)] : 1;
    const members: Member[] = Array.from({ length: size }, () => ({ g: Math.random() < .5 ? 'f' : 'm', v: Math.floor(Math.random() * 4) }));
    const c: Cust = { id: this.nextId++, members, table: free[Math.floor(Math.random() * free.length)], state: 'walking', qty: size, servedCups: 0, pay: 0, patience: 100 };
    this.custs.push(c);
    this.mokaQueue = this.mokaQueue.then(() => this.guide(c));
  }

  private mokaSay(text: string | null) {
    this.$('mokaSay')?.remove();
    if (!text) return;
    const g = document.createElementNS(NS, 'g'); g.id = 'mokaSay';
    const x = this.mokaA.x, y = this.mokaA.y - 190, w = text.length * 9.6 + 34;
    g.innerHTML = `<g class="popin"><rect x="${x - w / 2}" y="${y - 30}" width="${w}" height="44" rx="22" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.5"/><path d="M${x - 10} ${y + 13} L${x} ${y + 30} L${x + 8} ${y + 13}Z" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.5" stroke-linejoin="round"/><rect x="${x - 12}" y="${y + 9}" width="22" height="6" fill="#fffaf2"/>
      <text x="${x}" y="${y - 1}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="17" fill="${P.ink}">${text}</text></g>`;
    this.$('bubbles').appendChild(g);
  }
  private async mokaWalk(x: number, y: number, via: { x: number; y: number }[] = []) {
    await this.stage.walk(this.mokaA, [...via, { x, y }], 230);
    this.mokaA.flip = 1; this.setMoka('idle');
  }

  /** Moka accueille le groupe, il la suit en file jusqu'aux fauteuils, puis elle rentre en passant derrière. */
  private async guide(c: Cust) {
    const t = SPOTS[c.table], wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    this.mokaBusy = 99;
    await this.mokaWalk(DOOR.x - 80, DOOR.y + 84);
    const actors = c.members.map((m, k) => this.stage.add(this.custSvg(m, 'wait'), DOOR.x + k * 26, DOOR.y + k * 6));
    this.mokaSay(c.members.length > 1 ? `Hello! Table for ${c.members.length}? Follow me ♪` : 'Hello! Please follow me ♪');
    await wait(1900);
    this.mokaSay(null);
    // Moka attend sur le côté extérieur du coin fauteuils (gauche pour les coins de gauche, droite sinon)
    const wx = c.table % 2 ? t.cx + 226 : t.cx - 226, wy = t.cy + 14; // à côté de la première chaise, côté extérieur
    const catDone = this.mokaWalk(wx, wy, [{ x: wx, y: LANE }]);
    await wait(550);
    const walks = actors.map((a, k) => {
      const p = this.seatPos(c.table, k);
      return wait(k * 450).then(() => {
        (a.inner.firstElementChild as SVGElement).setAttribute('data-state', 'walk');
        return this.stage.walk(a, [{ x: p.x, y: LANE }, { x: p.x, y: p.y - 12 }], 175);
      }).then(() => { this.stage.remove(a); this.seat(c.table, k, c.members[k]); });
    });
    await Promise.all([catDone, ...walks]);
    c.state = 'ready';
    this.drawBubble(c);
    this.onArrive?.(c);
    await wait(500);
    this.mokaSay('Enjoy your stay ♪');
    await wait(1300);
    this.mokaSay(null);
    await this.mokaWalk(CUSHION.x, CUSHION.y, [{ x: wx, y: LANE }, { x: CUSHION.x - 60, y: LANE }]);
    this.mokaBusy = 1;
  }

  private drawBubble(c: Cust) {
    const p0 = this.seatPos(c.table, 0), x = p0.x - 40, y = p0.y - 124 * p0.s - 104, W = 176, HH = 84;
    this.$('bub' + c.id)?.remove();
    if (c.state === 'walking' || c.state === 'leaving') return;
    const g = document.createElementNS(NS, 'g');
    g.id = 'bub' + c.id;
    const shape = `<path d="M${x + 14} ${y} H${x + W - 14} A14 14 0 0 1 ${x + W} ${y + 14} V${y + HH - 14} A14 14 0 0 1 ${x + W - 14} ${y + HH} H${x + 46} L${x + 26} ${y + HH + 16} L${x + 30} ${y + HH} H${x + 14} A14 14 0 0 1 ${x} ${y + HH - 14} V${y + 14} A14 14 0 0 1 ${x + 14} ${y}Z" fill="#fff" stroke="${P.ink}" stroke-width="2.5"/>`;
    const num = `<circle cx="${x + W - 6}" cy="${y + 4}" r="15" fill="${P.ink}"/><text x="${x + W - 6}" y="${y + 10}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="#fdf5e8">${c.table + 1}</text>`;
    const heartsRow = [0, 1, 2, 3, 4].map(k => `<g id="h${c.id}-${k}" opacity="${k < hearts(c.patience) ? 1 : .25}">${heart(x + 44 + k * 22, y + 62, .75)}</g>`).join('');
    const txt = (tx: number, s: string, size = 18, anchor = 'middle') => `<text x="${tx}" y="${y + 36}" text-anchor="${anchor}" font-family="Nunito,sans-serif" font-weight="800" font-size="${size}" fill="${P.ink}">${s}</text>`;
    if (c.state === 'ready') {
      g.setAttribute('class', 'hit');
      g.dataset.act = 'bubble'; g.dataset.id = String(c.id);
      g.innerHTML = `<g class="bounce">${shape}${txt(x + W / 2 - 10, 'Order')}<text x="${x + W / 2 + 36}" y="${y + 39}" text-anchor="middle" font-family="Fraunces,serif" font-weight="600" font-size="28" fill="${P.ink}">?</text>${heartsRow}${num}</g>`;
    } else if (c.state === 'ordered') {
      const r = c.recipe!, rem = c.qty - c.servedCups, name = (rem > 1 ? `${rem} × ` : '') + r.name;
      const JUICE: Record<string, string> = { orange: '#f5a83a', apple: '#b8d86a', lemon: '#f6e27a', berry: '#d9577a' };
      const fruit = r.need.find(k => k in JUICE);
      const icon = r.kind === 'juice'
        ? `<path d="M${x + 16} ${y + 14} h22 l-3 30 h-16z" fill="#eef7fa" stroke="${P.ink}" stroke-width="2"/><path d="M${x + 18} ${y + 22} h18 l-2 20 h-14z" fill="${JUICE[fruit ?? 'orange']}"/><path d="M${x + 33} ${y + 8} l-4 14" stroke="#e86a5f" stroke-width="2.5" stroke-linecap="round"/>`
        : `<path d="M${x + 16} ${y + 18} h24 l-3 22 h-18z" fill="${r.need.includes('chocolate') ? '#8a5234' : r.need.includes('milk') ? '#c99a6e' : '#5a3424'}" stroke="${P.ink}" stroke-width="2"/><path d="M${x + 40} ${y + 22} q7 2 2 11" fill="none" stroke="${P.ink}" stroke-width="2"/>`;
      g.innerHTML = `${shape}${icon}
        ${txt(x + 52, name, name.length > 12 ? 14 : 17, 'start')}${heartsRow}${num}`;
    } else if (c.state === 'wantbook') {
      g.setAttribute('class', 'hit');
      g.dataset.act = 'book'; g.dataset.id = String(c.id);
      const icon = c.want === 'book'
        ? `<path d="M${x + 18} ${y + 22} L${x + 32} ${y + 26} L${x + 46} ${y + 22} L${x + 46} ${y + 44} L${x + 32} ${y + 48} L${x + 18} ${y + 44}Z" fill="#7fa8d8" stroke="${P.ink}" stroke-width="2"/><path d="M${x + 32} ${y + 26} L${x + 32} ${y + 48}" stroke="${P.ink}" stroke-width="2"/>`
        : `<rect x="${x + 20}" y="${y + 18}" width="24" height="32" rx="2" fill="#f2a2b4" stroke="${P.ink}" stroke-width="2"/><rect x="${x + 24}" y="${y + 23}" width="16" height="5" fill="#fffaf2"/>`;
      g.innerHTML = `<g class="bounce">${shape}${icon}${txt(x + 112, c.want === 'book' ? 'A book,' : 'A magazine,', 15)}<text x="${x + 112}" y="${y + 58}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="${P.ink}">please? ♡</text>${num}</g>`;
    } else if (c.state === 'reading') {
      const f = Math.max(0, Math.min(1, 1 - (c.readT ?? 0) / 20));
      g.innerHTML = `${shape}<text x="${x + 30}" y="${y + 40}" text-anchor="middle" font-size="24">${c.want === 'book' ? '📖' : '📰'}</text>${txt(x + 108, 'Reading…', 16)}
        <rect x="${x + 56}" y="${y + 52}" width="104" height="10" rx="5" fill="#f3e6d3" stroke="${P.ink}" stroke-width="1.5"/><rect x="${x + 57}" y="${y + 53}" width="${102 * f}" height="8" rx="4" fill="#8fb39a"/>${num}`;
    } else {
      g.innerHTML = `<g class="popin">${shape}${heart(x + 40, y + 34, 1.4)}${txt(x + 104, 'Thanks!')}${num}</g>`;
    }
    this.$('bubbles').appendChild(g);
  }
  private updateHearts(c: Cust) {
    const n = hearts(c.patience);
    for (let k = 0; k < 5; k++) this.$(`h${c.id}-${k}`)?.setAttribute('opacity', k < n ? '1' : '.25');
  }

  /** Les groupes bavardent : petites bulles quelques secondes. */
  private chat() {
    const groups = this.custs.filter(c => (c.members.length > 1 || c.state === 'reading') && c.state !== 'walking' && c.state !== 'leaving');
    if (!groups.length) return;
    const c = groups[Math.floor(Math.random() * groups.length)], k = Math.floor(Math.random() * c.members.length);
    const p = this.seatPos(c.table, k), txt = c.state === 'reading' ? READ[Math.floor(Math.random() * READ.length)] : CHAT[Math.floor(Math.random() * CHAT.length)];
    const left = this.seatOf(c.table, k) === 0, x = p.x + (left ? -54 : 54), y = p.y - 150 * p.s, w = txt.length * 9 + 26;
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="popin"><rect x="${x - w / 2}" y="${y - 20}" width="${w}" height="32" rx="16" fill="#fffaf2" fill-opacity=".96" stroke="${P.ink}" stroke-width="2"/><circle cx="${x + (left ? 14 : -14)}" cy="${y + 18}" r="4" fill="#fffaf2" stroke="${P.ink}" stroke-width="1.6"/>
      <text x="${x}" y="${y + 2}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="${P.ink}">${txt}</text></g>`;
    this.$('chat').appendChild(g); setTimeout(() => g.remove(), 2100);
  }

  takeOrder(c: Cust) {
    const ids = this.o.recipes;
    c.recipe = recipeById(ids[Math.floor(Math.random() * ids.length)]);
    c.state = 'ordered';
    const t = SPOTS[c.table];
    this.fx(t.cx, t.cy - 320, 'Order taken!', '#6e5040');
    this.drawBubble(c); this.drawHud();
    this.onOrder?.(c);
  }

  /** Une tasse correcte arrive au groupe ; le groupe paie quand tout le monde est servi. */
  serve(id: number): { outcome: Outcome; pay: number; done: boolean } {
    const c = this.custs.find(x => x.id === id)!;
    const out = outcome(c.patience), pay = payment(c.recipe!.price, out);
    c.servedCups++; c.pay += pay; this.served++;
    this.onDrink?.(c.recipe!, out);
    const k = Math.min(c.servedCups - 1, c.members.length - 1);
    (this.$(`seat-${c.table}-${this.seatOf(c.table, k)}`).firstElementChild as SVGElement)?.setAttribute('data-state', 'sitcoffee');
    const done = c.servedCups >= c.qty;
    const t = SPOTS[c.table];
    if (done) {
      c.state = 'served';
      // un client sur trois environ demande ensuite un livre ou un magazine (jamais pendant le tutoriel)
      const books = this.o.day > 1 || this.served > 1;
      if (books && Math.random() < 0.4) setTimeout(() => this.askBook(c), 2200);
      else setTimeout(() => this.leave(c), 3200);
    }
    void t;
    this.drawBubble(c);
    this.drawHud();
    this.onServed?.(this.served);
    return { outcome: out, pay, done };
  }

  /** Le client demande un livre ou un magazine de la bibliothèque. */
  private askBook(c: Cust) {
    if (c.state !== 'served') return;
    c.state = 'wantbook'; c.want = Math.random() < 0.5 ? 'book' : 'magazine';
    this.drawBubble(c);
    // s'il n'est pas servi au bout d'un moment, il part simplement
    setTimeout(() => { if (c.state === 'wantbook') this.leave(c); }, 16000);
  }
  /** On apporte le livre : le groupe lit et sirote son café une vingtaine de secondes. */
  private giveBook(c: Cust) {
    if (c.state !== 'wantbook') return;
    c.state = 'reading'; c.readT = 20; this.onBook?.(c);
    music.sfx('pour');
    const t = SPOTS[c.table];
    this.fx(t.cx, t.cy - 300, c.want === 'book' ? 'Here is your book ♪' : 'Here is your magazine ♪', '#6e5040');
    c.members.forEach((_, k) => this.addBook(c, k));
    this.drawBubble(c);
  }
  /** Le client tient le livre à deux mains, tourne les pages et boit une gorgée de temps en temps. */
  private addBook(c: Cust, k: number) {
    const slot = this.$(`seat-${c.table}-${this.seatOf(c.table, k)}`), p = this.seatPos(c.table, k);
    (slot.firstElementChild as SVGElement | null)?.setAttribute('data-state', 'sit');
    const s = p.s * 1.35, delay = -(k * 1.7 + c.id * 0.9) % 7;
    const cols = ['#e86a5f', '#7fa8d8', '#8fb39a', '#c7a6e6', '#f2c46a'], col = cols[(c.id + k) % cols.length];
    const x = p.x, y = p.y - 46 * p.s;
    const glow = `<ellipse cx="0" cy="8" rx="40" ry="30" fill="#fff3b0" opacity=".55"/>`;
    const hands = `<circle cx="-25" cy="10" r="5.5" fill="#f1cfb4" ${L(1.6)}/><circle cx="25" cy="10" r="5.5" fill="#f1cfb4" ${L(1.6)}/>`;
    const cup = `<g class="sipCup" style="animation-delay:${delay}s"><path d="M24 -2 L38 -2 L36 12 L26 12Z" fill="#fffaf2" ${L(1.6)}/><path d="M38 1 q5 1 2 7" fill="none" ${L(1.6)}/><ellipse cx="31" cy="-1" rx="6" ry="1.6" fill="#a8743f"/></g>`;
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'readBook popin');
    g.innerHTML = c.want === 'book'
      ? `<g transform="translate(${x} ${y}) scale(${s})">${glow}
          <path d="M-24 -4 L0 2 L24 -4 L24 18 L0 24 L-24 18Z" fill="${col}" ${L(2)}/>
          <path d="M-21 -6 Q-10 -10 0 -2 L0 20 Q-10 12 -21 16Z" fill="#fffaf2" ${L(1.5)}/><path d="M21 -6 Q10 -10 0 -2 L0 20 Q10 12 21 16Z" fill="#fffaf2" ${L(1.5)}/>
          <path d="M-16 2 l10 2 M-16 7 l10 2 M6 4 l10 -2 M6 9 l10 -2" stroke="#c9b8a8" stroke-width="1.4"/>
          <path class="pageFlip" style="animation-delay:${delay}s" d="M0 -2 Q10 -10 21 -6 L21 16 Q10 12 0 20Z" fill="#fffdf6" ${L(1.2)}/>
          ${hands}${cup}</g>`
      : `<g transform="translate(${x} ${y}) scale(${s})">${glow}<g transform="rotate(-6)"><rect x="-17" y="-14" width="34" height="40" rx="2" fill="${col}" ${L(2)}/><rect x="-12" y="-9" width="24" height="7" rx="1" fill="#fffaf2"/><circle cx="0" cy="10" r="8" fill="#fffaf2" opacity=".8"/><path d="M-12 21 l24 0" stroke="#fffaf2" stroke-width="2"/>
          <path class="pageFlip" style="animation-delay:${delay}s" d="M0 -14 L17 -14 L17 26 L0 26Z" fill="#fdf1dd" ${L(1)}/></g>
          <circle cx="-19" cy="12" r="5.5" fill="#f1cfb4" ${L(1.6)}/><circle cx="19" cy="12" r="5.5" fill="#f1cfb4" ${L(1.6)}/>${cup}</g>`;
    slot.appendChild(g);
  }

  private async leave(c: Cust) {
    c.state = 'leaving';
    this.$('bub' + c.id)?.remove();
    // on paie en sortant : tiroir-caisse puis pièces qui tintent
    const t = SPOTS[c.table], bonus = c.readT !== undefined ? c.members.length : 0;
    this.coins += c.pay + bonus;
    music.sfx('cash'); setTimeout(() => music.sfx('coins'), 260);
    this.fx(t.cx, t.cy - 320, `+${Math.round((c.pay + bonus) * 100) / 100} coins${bonus ? ' ♡ cozy tip' : ''}`, '#8a6a3c');
    // client ravi (4 ou 5 cœurs) : parfois un pourboire dans le cœur du comptoir
    if (hearts(c.patience) >= 4 && Math.random() < 0.6) {
      const tip = 1 + Math.floor(Math.random() * 3);
      this.coins += tip; this.onTip?.(tip);
      setTimeout(() => {
        music.sfx('twinkle');
        const hb = this.$('tipHeart'); hb.classList.remove('tipPulse'); void (hb as any).getBBox(); hb.classList.add('tipPulse');
        this.fx(578, 300, `+${tip} tip ♡`, '#c0506a');
      }, 700);
    }
    this.drawHud();
    await Promise.all(c.members.map(async (m, k) => {
      await new Promise(r => setTimeout(r, k * 350));
      const p = this.seatPos(c.table, k);
      this.seat(c.table, k, null);
      const a = this.stage.add(this.custSvg(m, 'walk'), p.x, p.y - 12);
      await this.stage.walk(a, [{ x: p.x, y: LANE }, { x: DOOR.x - 30, y: LANE }, { x: DOOR.x, y: DOOR.y + 10 }], 175);
      a.el.style.transition = 'opacity .5s'; a.el.style.opacity = '0';
      await new Promise(r => setTimeout(r, 500));
      this.stage.remove(a);
    }));
    this.custs = this.custs.filter(x => x !== c);
    if (!this.custs.length && (!this.spawning || this.served >= this.o.goal)) this.onEmpty?.();
  }

  private click(e: Event) {
    const el = (e.target as Element).closest('[data-act]') as SVGElement | null;
    if (!el) return;
    const a = el.dataset.act;
    if (a === 'bubble') { const c = this.custs.find(x => x.id === +el.dataset.id!); if (c && c.state === 'ready') this.takeOrder(c); }
    else if (a === 'book') { const c = this.custs.find(x => x.id === +el.dataset.id!); if (c) this.giveBook(c); }
    else if (a === 'library') {
      const c = this.custs.find(x => x.state === 'wantbook');
      if (c) this.giveBook(c); else this.toast('The café library: customers sometimes borrow a book or a magazine ♡');
    }
    else if (a === 'station') { if (this.o.customers) this.onStation?.(); }
    else if (a === 'juice') { if (this.o.juiceOpen) { if (this.o.customers) this.onJuice?.(); } else this.toast('The juice bar opens in Level 2 🍊'); }
    else if (a === 'bakery') this.toast('The bakery opens in Level 4 🥐');
    else if (a === 'music') this.onMusic?.();
    else if (a === 'card') this.onCard?.(el.dataset.who as Who);
  }

  /* ---------- Moka pilotée par une scène (niveau 3) ---------- */
  get moka() { return this.mokaA; }
  get stageRef() { return this.stage; }
  /** Moka quitte sa routine (accueil, sieste) et marche où la scène le demande. */
  async walkMoka(x: number, y: number, via: { x: number; y: number }[] = []) { this.mokaBusy = 99; await this.mokaWalk(x, y, via); }
  sayMoka(text: string | null) { this.mokaSay(text); }
  /** Moka reprend sa routine sur son coussin. */
  releaseMoka() { this.mokaBusy = 1; }
  setHole(kind: 'hole' | 'door') { const g = this.$('mouseHole'); if (g) g.outerHTML = mouseHole(kind); }
  /** Une petite tête de souris sort du trou, couine, puis disparaît (indice pendant le service). */
  peekMouse() {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="popin"><svg x="${HOLE.x - 22}" y="${HOLE.y - 52}" width="48" height="48" viewBox="40 30 120 120" data-state="idle" overflow="visible">${crumbMouse('captain')}</svg></g>`;
    this.$('extra').appendChild(g);
    music.sfx('squeak');
    this.fx(HOLE.x + 60, HOLE.y - 80, 'squeak!', '#8a6a3c');
    setTimeout(() => g.remove(), 2600);
  }

  /** Câlin de Moka (bouton de sa carte). */
  cuddleMoka() { if (this.mokaBusy < 90) { this.setMoka('cuddle'); this.mokaBusy = 2.4; this.fx(this.mokaA.x, this.mokaA.y - 170, '♥', '#e8586a'); } }

  hide(v: boolean) { this.el.style.visibility = v ? 'hidden' : 'visible'; }
  destroy() { clearInterval(this.timer); clearInterval(this.chatTimer); this.stage.destroy(); this.el.remove(); }
}
