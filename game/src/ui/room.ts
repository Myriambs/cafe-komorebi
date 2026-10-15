// Salle du café pendant le service : groupes de clients (seuls, couples, trios), Moka, commandes, paiement
import { P, heart, grandma, biscuit, moka, customer, custLegs } from '../art/cast.js';
import { L, ch, shell, lamps, backWall, station as stationArt, counter, sofaBack, sofaFront, grandmaLap, recordPlayer, rug, chairBack, chairSeat, tableCloth, plant, mouseHole, HOLE } from './roomArt.js';
import { crumbMouse } from '../art/cast.js';
import type { Who } from '../logic/outfits';
import { DRAW, h, ui } from './dom';
import { Stage, type Actor } from './actors';
import { recipeById, type Recipe } from '../logic/recipes';
import { pickBooks, readingQuote, type Book } from '../logic/books';
import { pastryArt } from './bakeryStation';
import { teaItemArt } from './teaStation';
import type { DoorKind } from './roomArt.js';
import { tickPatience, hearts, outcome, payment, type Outcome } from '../logic/service';
import { music } from '../audio/music';

const NS = 'http://www.w3.org/2000/svg';
type PartyState = 'walking' | 'ready' | 'ordered' | 'served' | 'wantbook' | 'reading' | 'leaving';
/** `extra` : accessoire dessiné par-dessus (lunettes, bonnet…) pour les candidats du niveau 6. */
export interface Member { g: 'm' | 'f'; v: number; extra?: string }
/** Un groupe de clients assis au même coin fauteuils. `table` = numéro du coin. */
export interface Cust {
  id: number; members: Member[]; table: number; state: PartyState;
  recipe?: Recipe; qty: number; servedCups: number; pay: number; patience: number;
  /** Après le café, certains clients empruntent un livre ou un magazine et restent un moment. */
  want?: 'book' | 'magazine'; readT?: number;
  /** Le livre (ou magazine) de chaque personne du groupe. */
  books?: Book[];
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
/** Devant la porte secrète : là où Moka monte la garde. */
const DOOR_GUARD = { x: 1426, y: 420 };

export interface RoomOpts {
  hero: 'm' | 'f'; uniform: string; uniformVars?: string; mode: 'day' | 'sunset' | 'night';
  dog: 'none' | 'stray' | 'straysleep' | 'sleep' | 'idle' | 'patrol'; day: number; goal: number; coins: number;
  recipes: string[]; maxSeated: number; customers: boolean; parties?: number[];
  outfitVars?: { moka?: string; grandma?: string; biscuit?: string };
  /** Grand-mère assise sur le canapé (seulement au prologue) ; sinon ses conseils arrivent dans une bulle avec son visage. */
  grandma?: boolean | 'stand';
  /** Niveau 2 : le bar à jus est ouvert. */
  juiceOpen?: boolean;
  /** La porte secrète de la Crumb Crew (bas du mur de droite) : cachée jusqu'au niveau 3, puis entrouverte, ouverte, et enfin la petite porte peinte. */
  mouseHole?: DoorKind;
  /** Niveau 4 : la boulangerie est ouverte. */
  bakeryOpen?: boolean;
  /** Niveau 5 : le salon de thé est ouvert. */
  teaOpen?: boolean;
}

export class Room {
  el: HTMLElement;
  custs: Cust[] = [];
  served = 0;
  coins: number;
  spawning: boolean;
  private nextId = 1;
  private ordersSeen = new Set<string>();
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
  onBakery?: () => void;
  onTea?: () => void;
  /** Statistiques du niveau : boisson servie, livre prêté, pourboire. */
  onDrink?: (r: Recipe, o: Outcome) => void;
  onBook?: (c: Cust) => void;
  onTip?: (coins: number) => void;

  constructor(public o: RoomOpts) {
    this.coins = o.coins;
    this.spawning = o.customers;
    const ov = o.outfitVars ?? {};
    this.el = h(`<div class="screen room" data-mode="${o.mode}"><svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet"><g class="art">
      ${shell(o.bakeryOpen)}${mouseHole(o.mouseHole ?? 'hidden')}${lamps()}${backWall()}${stationArt(o.juiceOpen)}
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
        return `<g data-y="${t.cy - 46}">${place(2)}</g><g data-y="${t.cy + 10}">${tableCloth(t.cx, t.cy + 18)}${place(0)}${place(1)}</g>`; }).join('')}</g>
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
      ${this.o.customers && this.o.juiceOpen ? `<g class="hit" data-act="juice"><g class="lift"><rect x="1064" y="808" width="250" height="64" rx="32" fill="#e8823a" stroke="${P.ink}" stroke-width="2.5"/><text x="1189" y="848" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="20" fill="#fffaf2">🍊 Juice bar${this.juiceOrders() ? ` (${this.juiceOrders()})` : ''}</text></g></g>` : ''}
      ${this.o.customers && this.o.bakeryOpen ? `<g class="hit" data-act="bakery"><g class="lift"><rect x="798" y="808" width="250" height="64" rx="32" fill="#c47a2c" stroke="${P.ink}" stroke-width="2.5"/><text x="923" y="848" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="20" fill="#fffaf2">🥐 Bakery${this.pastryOrders() ? ` (${this.pastryOrders()})` : ''}</text></g></g>` : ''}
      ${this.o.customers && this.o.teaOpen ? `<g class="hit" data-act="tea"><g class="lift"><rect x="532" y="808" width="250" height="64" rx="32" fill="#6f957d" stroke="${P.ink}" stroke-width="2.5"/><text x="657" y="848" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="20" fill="#fffaf2">🍵 Tea room${this.teaOrders() ? ` (${this.teaOrders()})` : ''}</text></g></g>` : ''}`;
  }
  private juiceOrders() { return this.ordered().filter(c => c.recipe?.kind === 'juice').length; }
  private coffeeOrders() { return this.ordered().filter(c => !c.recipe?.kind).length; }
  private teaOrders() { return this.ordered().filter(c => c.recipe?.kind === 'tea').length; }
  private pastryOrders() { return this.ordered().filter(c => c.recipe?.kind === 'pastry').length; }


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
    return `<svg class="nobubble" x="-75" y="-188" width="150" height="195" viewBox="0 0 200 260" data-state="${state}" overflow="visible">${customer(m.g, m.v)}${m.extra ?? ''}</svg>`;
  }
  /** Client assis : le corps s'enfonce dans le fauteuil, les jambes pliées passent devant le coussin. */
  private seat(spot: number, k: number, m: Member | null, state = 'sit') {
    const sk = this.seatOf(spot, k), slot = this.$(`seat-${spot}-${sk}`), legs = this.$(`legs-${spot}-${sk}`);
    if (!m) { slot.innerHTML = ''; legs.innerHTML = ''; return; }
    const p = this.seatPos(spot, k), w = 150 * p.s, hh = 195 * p.s, x = p.x - w / 2, y = p.y - 150 * p.s;
    slot.innerHTML = `<svg class="nobubble" x="${x}" y="${y}" width="${w}" height="${hh}" viewBox="0 0 200 260" data-state="${state}" overflow="visible">${customer(m.g, m.v)}${m.extra ?? ''}</svg>`;
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
    const p0 = this.seatPos(c.table, 0), W = 176, HH = 84;
    // coin du fond à droite : la bulle s'ouvre vers la gauche, pour ne pas cacher Moka sur son coussin
    const mirror = c.table === 1, tailAt = (w: number, hh: number) => mirror
      ? `H${x + w - 30} L${x + w - 26} ${y + hh + 16} L${x + w - 46} ${y + hh}`
      : `H${x + 46} L${x + 26} ${y + hh + 16} L${x + 30} ${y + hh}`;
    let x = mirror ? p0.x + 40 - W : p0.x - 40, y = p0.y - 124 * p0.s - 104;
    this.$('bub' + c.id)?.remove();
    if (c.state === 'walking' || c.state === 'leaving') return;
    const g = document.createElementNS(NS, 'g');
    g.id = 'bub' + c.id;
    const shape = `<path d="M${x + 14} ${y} H${x + W - 14} A14 14 0 0 1 ${x + W} ${y + 14} V${y + HH - 14} A14 14 0 0 1 ${x + W - 14} ${y + HH} ${tailAt(W, HH)} H${x + 14} A14 14 0 0 1 ${x} ${y + HH - 14} V${y + 14} A14 14 0 0 1 ${x + 14} ${y}Z" fill="#fff" stroke="${P.ink}" stroke-width="2.5"/>`;
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
      const icon = r.kind === 'tea' ? teaItemArt(r.id, x + 30, y + 34, .48)
        : r.kind === 'pastry' ? pastryArt(r.id, x + 30, y + 34, .45)
        : r.kind === 'juice'
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
      const q = readingQuote(c.books ?? [], 20 - (c.readT ?? 0)), RH = 96;
      // tables du devant : la bulle se met sur le côté (sinon elle cache les clients des tables du fond)
      const front = c.table >= 2, side = c.table % 2 ? 1 : -1, RW = front ? 290 : 330;
      const head = p0.y - 120 * p0.s;
      if (front) { x = side < 0 ? p0.x - 76 - RW : p0.x + 76; y = head - RH / 2 - 10; }
      else if (mirror) x = p0.x + 40 - RW;
      const tail = !front ? tailAt(RW, RH) : `H${x}`;
      const sideTail = !front ? '' : side < 0
        ? `<path d="M${x + RW - 1} ${y + 38} L${x + RW + 22} ${y + 56} L${x + RW - 1} ${y + 60}Z" fill="#fff" stroke="${P.ink}" stroke-width="2.5" stroke-linejoin="round"/><rect x="${x + RW - 4}" y="${y + 40}" width="5" height="18" fill="#fff"/>`
        : `<path d="M${x + 1} ${y + 38} L${x - 22} ${y + 56} L${x + 1} ${y + 60}Z" fill="#fff" stroke="${P.ink}" stroke-width="2.5" stroke-linejoin="round"/><rect x="${x - 1}" y="${y + 40}" width="5" height="18" fill="#fff"/>`;
      const rshape = `<path d="M${x + 14} ${y} H${x + RW - 14} A14 14 0 0 1 ${x + RW} ${y + 14} V${y + RH - 14} A14 14 0 0 1 ${x + RW - 14} ${y + RH} ${tail} H${x + 14} A14 14 0 0 1 ${x} ${y + RH - 14} V${y + 14} A14 14 0 0 1 ${x + 14} ${y}Z" fill="#fff" stroke="${P.ink}" stroke-width="2.5"/>${sideTail}`;
      if (!front) g.setAttribute('transform', `translate(0 ${HH - RH})`);
      g.innerHTML = `${rshape}<g transform="translate(${x + 34} ${y + 44}) scale(.62)">${coverIcon(q.book)}</g>
        <foreignObject x="${x + 62}" y="${y + 8}" width="${RW - 76}" height="58"><div xmlns="http://www.w3.org/1999/xhtml" style="font:800 14.5px/1.25 Nunito,sans-serif;color:#3b2838;display:flex;align-items:center;height:58px">“${q.text}”</div></foreignObject>
        <rect x="${x + 62}" y="${y + 72}" width="${RW - 90}" height="10" rx="5" fill="#f3e6d3" stroke="${P.ink}" stroke-width="1.5"/><rect x="${x + 63}" y="${y + 73}" width="${(RW - 92) * f}" height="8" rx="4" fill="#8fb39a"/>
        <circle cx="${x + RW - 6}" cy="${y + 4}" r="15" fill="${P.ink}"/><text x="${x + RW - 6}" y="${y + 10}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="#fdf5e8">${c.table + 1}</text>`;
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
    const groups = this.custs.filter(c => c.members.length > 1 && c.state !== 'walking' && c.state !== 'leaving' && c.state !== 'reading');
    if (!groups.length) return;
    const c = groups[Math.floor(Math.random() * groups.length)], k = Math.floor(Math.random() * c.members.length);
    const p = this.seatPos(c.table, k), txt = CHAT[Math.floor(Math.random() * CHAT.length)];
    const left = this.seatOf(c.table, k) === 0, x = p.x + (left ? -54 : 54), y = p.y - 150 * p.s, w = txt.length * 9 + 26;
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="popin"><rect x="${x - w / 2}" y="${y - 20}" width="${w}" height="32" rx="16" fill="#fffaf2" fill-opacity=".96" stroke="${P.ink}" stroke-width="2"/><circle cx="${x + (left ? 14 : -14)}" cy="${y + 18}" r="4" fill="#fffaf2" stroke="${P.ink}" stroke-width="1.6"/>
      <text x="${x}" y="${y + 2}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="${P.ink}">${txt}</text></g>`;
    this.$('chat').appendChild(g); setTimeout(() => g.remove(), 2100);
  }

  takeOrder(c: Cust) {
    // on fait le tour du menu avant de répéter : chaque journée montre des recettes variées
    const all = [...new Set(this.o.recipes)];
    let ids = all.filter(id => !this.ordersSeen.has(id));
    if (!ids.length) { this.ordersSeen.clear(); ids = all; }
    const id = ids[Math.floor(Math.random() * ids.length)];
    this.ordersSeen.add(id);
    c.recipe = recipeById(id);
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
    c.state = 'reading'; c.readT = 20; c.books = pickBooks(c.want ?? 'book', c.members.length); this.onBook?.(c);
    music.sfx('pour');
    const t = SPOTS[c.table];
    this.fx(t.cx, t.cy - 300, c.want === 'book' ? 'Here is your book ♪' : 'Here is your magazine ♪', '#6e5040');
    c.members.forEach((_, k) => this.addBook(c, k));
    this.drawBubble(c);
  }
  /**
   * Le client lit : la couverture (titre, couleur) est tournée vers nous, les pages vers lui.
   * Une main tient le livre, l'autre boit une gorgée de café ou de jus ; pour tourner la page,
   * il repose sa tasse et prend le coin du livre à deux mains.
   */
  private addBook(c: Cust, k: number) {
    const slot = this.$(`seat-${c.table}-${this.seatOf(c.table, k)}`), p = this.seatPos(c.table, k);
    (slot.firstElementChild as SVGElement | null)?.setAttribute('data-state', 'sit');
    const b = c.books![k], s = p.s * 1.3, delay = (-(k * 2.3 + c.id * 1.1) % 9).toFixed(2);
    const x = p.x, y = p.y - 46 * p.s, skin = '#f1cfb4';
    const juice = c.recipe?.kind === 'juice';
    const cup = c.recipe?.kind === 'tea'
      ? teaItemArt(c.recipe.id, 32, 8, .26)
      : c.recipe?.kind === 'pastry'
      ? `<ellipse cx="32" cy="12" rx="11" ry="3" fill="#fffaf2" ${L(1.3)}/>${pastryArt(c.recipe.id, 32, 7, .24)}`
      : juice
      ? `<path d="M26 -4 L38 -4 L36 14 L28 14Z" fill="#eef7fa" ${L(1.5)}/><path d="M27 2 L37 2 L35.6 13 L28.4 13Z" fill="#f5a83a"/><path d="M34 -10 L32 2" stroke="#e86a5f" stroke-width="2" stroke-linecap="round"/>`
      : `<path d="M25 -1 L39 -1 L37 13 L27 13Z" fill="#fffaf2" ${L(1.5)}/><path d="M39 2 q5 1 2 7" fill="none" ${L(1.5)}/><ellipse cx="32" cy="0" rx="6.4" ry="1.6" fill="#a8743f"/>`;
    const hand = (hx: number, hy: number) => `<circle cx="${hx}" cy="${hy}" r="5.2" fill="${skin}" ${L(1.5)}/>`;
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'readBook popin');
    g.innerHTML = `<g transform="translate(${x} ${y}) scale(${s})" style="--rd:${delay}s">
        <ellipse cx="2" cy="4" rx="40" ry="30" fill="#fff3b0" opacity=".45"/>
        ${b.kind === 'book' ? bookCover(b) : magazineCover(b)}
        <path class="rdPage" d="M-6 -14 Q6 -27 22 -24 L22 -18 Q6 -21 -6 -12Z" fill="#fffdf6" ${L(1.1)}/>
        ${hand(b.kind === 'book' ? -6 : 0, 21)}
        <g class="rdCup">${cup}</g>
        <g class="rdHandB">${hand(31, 12)}</g></g>`;
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
    else if (a === 'bakery') { if (this.o.bakeryOpen) { if (this.o.customers) this.onBakery?.(); else this.toast('The bakery is warm and ready 🥐'); } else this.toast('The bakery opens in Level 4 🥐'); }
    else if (a === 'tea') { if (this.o.teaOpen && this.o.customers) this.onTea?.(); }
    else if (a === 'music') this.onMusic?.();
    else if (a === 'card') this.onCard?.(el.dataset.who as Who);
  }

  /* ---------- Invités pilotés par une scène (niveau 6 : entretiens, premier jour) ---------- */
  /** Un invité entre par la porte et s'assoit à la place `k` du coin `spot`. */
  async guestIn(m: Member, spot = 0, k = 0) {
    const p = this.seatPos(spot, k);
    const a = this.stage.add(this.custSvg(m, 'walk'), DOOR.x, DOOR.y + 10);
    await this.stage.walk(a, [{ x: DOOR.x - 30, y: LANE }, { x: p.x, y: LANE }, { x: p.x, y: p.y - 12 }], 175);
    this.stage.remove(a); this.seat(spot, k, m);
  }
  /** L'invité se lève et repart par la porte. */
  async guestOut(m: Member, spot = 0, k = 0) {
    const p = this.seatPos(spot, k);
    this.seat(spot, k, null);
    const a = this.stage.add(this.custSvg(m, 'walk'), p.x, p.y - 12);
    await this.stage.walk(a, [{ x: p.x, y: LANE }, { x: DOOR.x - 30, y: LANE }, { x: DOOR.x, y: DOOR.y + 10 }], 175);
    a.el.style.transition = 'opacity .5s'; a.el.style.opacity = '0';
    await new Promise(r => setTimeout(r, 500)); this.stage.remove(a);
  }
  /** Change l'expression d'un invité assis ('sit', 'sitcoffee'…). */
  guestState(spot: number, k: number, state: string) { (this.$(`seat-${spot}-${this.seatOf(spot, k)}`).firstElementChild as SVGElement)?.setAttribute('data-state', state); }
  /** Un invité entre et reste debout à (x, y) — renvoie l'acteur. */
  async guestStand(m: Member, x: number, y: number) {
    const a = this.stage.add(this.custSvg(m, 'walk'), DOOR.x, DOOR.y + 10, { flipable: true });
    await this.stage.walk(a, [{ x: DOOR.x - 30, y: LANE }, { x, y }], 175);
    (a.inner.firstElementChild as SVGElement).setAttribute('data-state', 'idle');
    return a;
  }
  get seatAt() { return (spot: number, k: number) => this.seatPos(spot, k); }

  /* ---------- Le héros sort de derrière le comptoir (niveau 6) ---------- */
  private heroA: Actor | null = null;
  /** Bout du comptoir, côté salle : là où le héros entre et sort. */
  static readonly COUNTER_END = { x: 960, y: 500 };
  /** Le héros quitte le comptoir et marche jusqu'à (x, y). `tray` : ce qu'il porte (svg dans le repère 200 × 260). */
  async heroWalk(x: number, y: number, via: { x: number; y: number }[] = [], tray = '') {
    if (!this.heroA) {
      (this.$('heroSvg') as SVGElement).style.display = 'none';
      const e = Room.COUNTER_END;
      this.heroA = this.stage.add(`<svg x="-75" y="-188" width="150" height="195" viewBox="0 0 200 260" data-state="${this.o.uniform}" style="${this.o.uniformVars ?? ''}" overflow="visible">${DRAW[this.o.hero === 'f' ? 'heroF' : 'heroM']()}<g class="heroTray"></g></svg>`, e.x, e.y, { flipable: true });
    }
    this.heroCarry(tray);
    await this.stage.walk(this.heroA, [...via, { x, y }], 190);
  }
  heroCarry(tray: string) { const g = this.heroA?.el.querySelector('.heroTray'); if (g) g.innerHTML = tray; }
  heroFace(dir: 1 | -1) { if (this.heroA) { this.heroA.flip = dir; this.heroA.el.setAttribute('transform', this.heroA.el.getAttribute('transform')!.replace(/scale\((-?[\d.]+) /, (_, k) => `scale(${Math.abs(+k) * dir} `)); } }
  /** Le héros retourne derrière le comptoir. */
  async heroHome() {
    if (!this.heroA) return;
    const e = Room.COUNTER_END;
    await this.stage.walk(this.heroA, [{ x: this.heroA.x, y: LANE }, e], 190);
    this.stage.remove(this.heroA); this.heroA = null;
    (this.$('heroSvg') as SVGElement).style.display = '';
  }

  /* ---------- Moka pilotée par une scène (niveau 3) ---------- */
  get moka() { return this.mokaA; }
  get stageRef() { return this.stage; }
  /** Moka quitte sa routine (accueil, sieste) et marche où la scène le demande. */
  async walkMoka(x: number, y: number, via: { x: number; y: number }[] = []) { this.mokaBusy = 99; await this.mokaWalk(x, y, via); }
  sayMoka(text: string | null) { this.mokaSay(text); }
  /** Moka reprend sa routine sur son coussin. */
  releaseMoka() { this.mokaBusy = 1; }
  setHole(kind: DoorKind) { const g = this.$('mouseHole'); if (g) g.outerHTML = mouseHole(kind); }
  /** Une scène qui fait bouger Moka passe après ses accueils en cours (jamais deux marches à la fois). */
  withMoka(fn: () => Promise<void>) { const run = this.mokaQueue.then(fn); this.mokaQueue = run.catch(() => undefined); return run; }
  get doorGuard() { return DOOR_GUARD; }
  /** Fin du niveau 2 : la porte secrète s'entrouvre, deux petits yeux brillent… puis elle se referme. */
  async doorPeek() {
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    this.setHole('ajar'); music.sfx('squeak');
    await wait(2600);
    this.setHole('hidden');
    await wait(400);
  }
  /** Niveau 3 : une souris pousse la porte, voit du monde, prend peur et rentre en courant. */
  async mouseDash(after: DoorKind = 'hidden') {
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    this.setHole('open');
    const a = this.stage.add(`<svg x="-40" y="-101" width="80" height="104" viewBox="0 0 200 260" data-state="walk" overflow="visible">${crumbMouse('captain')}</svg>`, HOLE.x - 4, HOLE.y + 4, { flipable: true, base: 0.8 });
    await this.stage.walk(a, [{ x: HOLE.x - 34, y: HOLE.y + 30 }], 90);
    (a.inner.firstElementChild as SVGElement).setAttribute('data-state', 'idle');
    music.sfx('squeak');
    this.fx(HOLE.x - 40, HOLE.y - 70, '!!', '#c0506a');
    await wait(700);
    (a.inner.firstElementChild as SVGElement).setAttribute('data-state', 'walk');
    await this.stage.walk(a, [{ x: HOLE.x - 4, y: HOLE.y + 4 }], 320);
    this.stage.remove(a);
    this.setHole('ajar');
    await wait(300);
    this.setHole(after);
  }

  /** Câlin de Moka (bouton de sa carte). */
  cuddleMoka() { if (this.mokaBusy < 90) { this.setMoka('cuddle'); this.mokaBusy = 2.4; this.fx(this.mokaA.x, this.mokaA.y - 170, '♥', '#e8586a'); } }

  hide(v: boolean) { this.el.style.visibility = v ? 'hidden' : 'visible'; }
  destroy() { clearInterval(this.timer); clearInterval(this.chatTimer); this.stage.destroy(); this.el.remove(); }
}

/* ---------- Couvertures des livres et magazines (tournées vers le joueur) ---------- */
/** Petit dessin de couverture centré sur (0, 0), environ 14 unités de large. */
function iconArt(b: Book, c = b.ink) {
  const st = `stroke="${c}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (b.icon) {
    case 'moon': return `<path d="M3 -6 A6.5 6.5 0 1 0 3 6 A5 5 0 1 1 3 -6Z" fill="${c}"/><circle cx="6" cy="-4" r="1" fill="${c}"/><circle cx="7.5" cy="2" r=".8" fill="${c}"/>`;
    case 'glass': return `<circle cx="-1.5" cy="-1.5" r="4.6" ${st}/><path d="M2 2 L6.5 6.5" ${st} stroke-width="2.4"/>`;
    case 'paw': return `<ellipse cx="0" cy="2.4" rx="3.6" ry="3" fill="${c}"/>${[[-4.6, -2.4], [-1.6, -4.8], [1.6, -4.8], [4.6, -2.4]].map(([a, d]) => `<circle cx="${a}" cy="${d}" r="1.6" fill="${c}"/>`).join('')}`;
    case 'heart': return `<path d="M0 5.5 C-7 0 -5 -6 0 -2.6 C5 -6 7 0 0 5.5Z" fill="${c}"/>`;
    case 'leaf': return `<path d="M-6 5 Q-6 -6 6 -6 Q6 5 -6 5Z" fill="${c}"/><path d="M-6 5 L3 -3" stroke="${b.color}" stroke-width="1"/>`;
    case 'star': return `<path d="M0 -6.5 L1.8 -2 L6.5 -2 L2.7 1 L4.1 5.8 L0 3 L-4.1 5.8 L-2.7 1 L-6.5 -2 L-1.8 -2Z" fill="${c}"/>`;
    case 'drop': return `<path d="M0 -6.5 Q5 0 5 2.5 A5 5 0 0 1 -5 2.5 Q-5 0 0 -6.5Z" fill="${c}"/>`;
    case 'bun': return `<path d="M-6.5 3 Q-6.5 -5 0 -5 Q6.5 -5 6.5 3Z" fill="${c}"/><path d="M-3 -1 q1.5 -2 3 0 q1.5 -2 3 0" stroke="${b.color}" stroke-width="1" fill="none"/><rect x="-7" y="3" width="14" height="2.4" rx="1" fill="${c}"/>`;
    case 'cup': return `<path d="M-5 -2 L5 -2 L4 5 L-4 5Z" fill="${c}"/><path d="M5 -.5 q3 .5 1 4" ${st} stroke-width="1.2"/><path d="M-2 -4.5 q-1 -2 0 -3.5 M1.5 -4.5 q-1 -2 0 -3.5" ${st} stroke-width="1"/>`;
    case 'plant': return `<path d="M-3.5 1 L3.5 1 L2.6 6 L-2.6 6Z" fill="${c}"/><path d="M0 1 Q-1 -4 -5 -5 Q-4 -1 0 1 Q1 -5 5 -6 Q4 -1 0 1" fill="${c}"/>`;
    case 'flower': return `${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 3.4).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 3.4 - 1).toFixed(1)}" r="2.4" fill="${c}"/>`).join('')}<circle cx="0" cy="-1" r="1.6" fill="#f3c55a"/><path d="M0 2 L0 7" ${st} stroke-width="1.2"/>`;
    case 'scarf': return `<path d="M-6 -4 Q0 -1 6 -4 L6 -1 Q0 2 -6 -1Z M2 0 L4 7 L1 7 L0 1Z" fill="${c}"/>`;
    case 'atom': return `<ellipse rx="7" ry="2.6" ${st} stroke-width="1.2"/><ellipse rx="7" ry="2.6" ${st} stroke-width="1.2" transform="rotate(60)"/><ellipse rx="7" ry="2.6" ${st} stroke-width="1.2" transform="rotate(-60)"/><circle r="1.6" fill="${c}"/>`;
  }
}
/** Mini couverture pour la bulle du lecteur. */
function coverIcon(b: Book) {
  return `<rect x="-20" y="-26" width="40" height="52" rx="4" fill="${b.color}" ${L(2)}/><rect x="-20" y="-26" width="7" height="52" rx="3" fill="#000" opacity=".15"/>
    <g transform="translate(3 -6) scale(1.3)">${iconArt(b)}</g>
    <text x="3" y="16" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="7.5" fill="${b.ink}">${b.genre.toUpperCase()}</text>`;
}
/**
 * Livre ouvert vu de l'extérieur : à gauche le dos (4e de couverture), à droite la couverture avec
 * son titre ; les pages (crème) dépassent à peine en haut, tournées vers le lecteur.
 */
function bookCover(b: Book) {
  const [l1, l2 = ''] = b.title.split('|');
  return `<path d="M-25 -17 Q-16 -19 -6 -14 Q8 -24 27 -21 L27 -15 L-25 -13Z" fill="#fffaf0" ${L(1.1)}/>
    <path d="M-24 -14 L-6 -11 L-6 23 L-24 19Z" fill="${b.color}" ${L(1.8)}/><path d="M-24 -14 L-6 -11 L-6 23 L-24 19Z" fill="#000" opacity=".16"/>
    <path d="M-20 -6 l10 1.6 M-20 -2 l10 1.6 M-20 2 l7 1.2" stroke="${b.ink}" stroke-width="1" opacity=".55"/>
    <path d="M-6 -11 L27 -18 L27 18 L-6 23Z" fill="${b.color}" ${L(1.8)}/>
    <path d="M-6 -11 L-6 23" stroke="#000" stroke-width="2.4" opacity=".18"/>
    <g transform="translate(10.5 0) skewY(-12)">
      <rect x="-14" y="-15.5" width="28" height="6" rx="1.5" fill="${b.ink}" opacity=".92"/>
      <text x="0" y="-11" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="4.4" letter-spacing=".3" fill="${b.color}">${b.genre.toUpperCase()}</text>
      <text x="0" y="-2.5" text-anchor="middle" font-family="Fraunces,serif" font-weight="700" font-style="italic" font-size="6.4" fill="${b.ink}">${l1}</text>
      <text x="0" y="4.4" text-anchor="middle" font-family="Fraunces,serif" font-weight="700" font-style="italic" font-size="6.6" fill="${b.ink}">${l2}</text>
      <g transform="translate(0 12) scale(.55)">${iconArt(b)}</g>
    </g>`;
}
/** Magazine plié en deux : la couverture (gros titre, photo ronde) tournée vers nous. */
function magazineCover(b: Book) {
  return `<g transform="rotate(-4)"><rect x="-16" y="-20" width="34" height="42" rx="2" fill="#fffaf0" ${L(1.1)}/>
    <rect x="-17" y="-21" width="34" height="42" rx="2" fill="${b.color}" ${L(1.8)}/>
    <text x="0" y="-11.5" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="${b.title.length > 6 ? 6 : 7.6}" letter-spacing=".4" fill="${b.ink}">${b.title}</text>
    <circle cx="0" cy="3" r="8.5" fill="#fffaf2" opacity=".9"/><g transform="translate(0 3) scale(.8)">${iconArt(b, b.color)}</g>
    <rect x="-13" y="13" width="26" height="6" rx="1.5" fill="${b.ink}" opacity=".92"/><text x="0" y="17.5" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="4.2" letter-spacing=".3" fill="${b.color}">${b.genre.toUpperCase()}</text></g>`;
}
