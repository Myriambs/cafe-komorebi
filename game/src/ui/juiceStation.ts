// Bar à jus (niveau 2) : on met un fruit dans l'extracteur, on presse dans un verre, on ajoute glace, menthe, miel ou eau pétillante
import { P } from '../art/cast.js';
import { L, TXT, SLOTS, ticketArt } from './stationArt.js';
import { music } from '../audio/music';
import { h, ui } from './dom';
import { INGREDIENTS, FRUITS, matches, cannotAdd, type Ingredient } from '../logic/recipes';
import type { Room, Cust } from './room';
import type { Bench } from './station';

const NS = 'http://www.w3.org/2000/svg';
export interface JuiceStock { glasses: number; orange: number; apple: number; lemon: number; berry: number; mint: number; ice: number; honey: number; soda: number }
export interface JuiceBench extends Bench { fruit: Ingredient | null }
export const newJuiceBench = (): JuiceBench => ({ cups: [null, null, null], sel: -1, ground: false, fruit: null });

const JUICE: Record<string, string> = { orange: '#f5a83a', apple: '#b8d86a', lemon: '#f6e27a', berry: '#d9577a' };
const FRUIT_ART: Record<string, (x: number, y: number) => string> = {
  orange: (x, y) => `<circle cx="${x}" cy="${y}" r="15" fill="#f5a83a" ${L(1.6)}/><path d="M${x - 2} ${y - 15} q4 -6 9 -4" fill="none" stroke="#6f957d" stroke-width="3" stroke-linecap="round"/><circle cx="${x - 5}" cy="${y - 5}" r="3" fill="#ffd28a"/>`,
  apple: (x, y) => `<path d="M${x} ${y - 10} Q${x - 18} ${y - 18} ${x - 15} ${y + 2} Q${x - 12} ${y + 16} ${x} ${y + 13} Q${x + 12} ${y + 16} ${x + 15} ${y + 2} Q${x + 18} ${y - 18} ${x} ${y - 10}Z" fill="#a9cf5a" ${L(1.6)}/><path d="M${x} ${y - 10} l2 -8" ${L(2)}/><path d="M${x + 2} ${y - 14} q8 -6 12 0 q-8 4 -12 0" fill="#6f957d"/>`,
  lemon: (x, y) => `<ellipse cx="${x}" cy="${y}" rx="17" ry="12" fill="#f6dc5a" ${L(1.6)}/><path d="M${x - 17} ${y} l-5 -1 M${x + 17} ${y} l5 1" ${L(2)}/><circle cx="${x - 6}" cy="${y - 4}" r="2.6" fill="#fff6c0"/>`,
  berry: (x, y) => `${[[-8, 2], [6, 4], [-1, -7], [10, -6], [-10, -8]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="7" fill="${dx > 4 ? '#5d5a8f' : '#d9577a'}" ${L(1.3)}/>`).join('')}<path d="M${x - 1} ${y - 14} l3 -5" ${L(1.6)}/>`
};

function label(x: number, y: number, t: string) { return `<g><rect x="${x - t.length * 4.6 - 16}" y="${y - 15}" width="${t.length * 9.2 + 32}" height="28" rx="14" fill="#fffaf2" ${L(1.5)}/>${TXT(x, y + 5, t, 14)}</g>`; }
function badge(x: number, y: number, id: string) { return `<g><circle cx="${x}" cy="${y}" r="17" fill="${P.ink}"/><text id="jc-${id}" x="${x}" y="${y + 6}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="#fdf5e8">0</text></g>`; }

function scene() {
  const grid: string[] = [];
  for (let x = -500; x <= 2100; x += 56) grid.push(`<path d="M${x} -300 L${x} 560" stroke="#d3e8da" stroke-width="2"/>`);
  for (let y = -300; y <= 560; y += 56) grid.push(`<path d="M-500 ${y} L2100 ${y}" stroke="#d3e8da" stroke-width="2"/>`);
  const crate = (id: string, x: number, name: string) => `<g class="hit" data-act="fruit" data-f="${id}" id="j-${id}"><g class="lift">
      ${[[-30, 470], [0, 462], [30, 470], [-15, 452], [15, 452], [0, 440]].map(([dx, y]) => FRUIT_ART[id](x + dx, y)).join('')}
      <path d="M${x - 58} 480 L${x + 58} 480 L${x + 52} 552 L${x - 52} 552Z" fill="#c99b6e" ${L(2)}/><path d="M${x - 56} 500 L${x + 56} 500 M${x - 54} 526 L${x + 54} 526" stroke="#a8784e" stroke-width="3"/>
      ${label(x, 598, name)}</g>${badge(x + 52, 462, id)}</g>`;
  return `
  <rect x="-500" y="-300" width="2600" height="860" fill="#eaf5ee"/>${grid.join('')}
  <g transform="translate(270 22)"><rect width="170" height="44" rx="22" fill="#e8823a"/><text x="85" y="29" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="21" fill="#fffaf2">🍊 Juice bar</text></g>
  <rect x="-500" y="560" width="2600" height="210" fill="#e3c08a"/><path d="M-500 560 L2100 560" stroke="#b08850" stroke-width="3"/>
  <rect x="-500" y="770" width="2600" height="430" fill="#b3723a"/><path d="M-500 770 L2100 770" stroke="#8a5530" stroke-width="3"/>
  <!-- étagère : bocaux de fruits et plantes -->
  <rect x="1060" y="236" width="420" height="14" rx="4" fill="#a8743f" ${L(2)}/>
  ${[1100, 1180, 1260].map((x, i) => `<path d="M${x} 236 L${x} 180 Q${x} 168 ${x + 12} 168 L${x + 48} 168 Q${x + 60} 168 ${x + 60} 180 L${x + 60} 236Z" fill="#eef7fa" fill-opacity=".85" ${L(2)}/><path d="M${x + 4} 200 L${x + 56} 200 L${x + 56} 232 L${x + 4} 232Z" fill="${['#f5a83a', '#b8d86a', '#d9577a'][i]}" opacity=".8"/><rect x="${x + 6}" y="160" width="48" height="10" rx="3" fill="#c99a6e" ${L(1.4)}/>`).join('')}
  <path d="M1360 236 L1366 206 L1414 206 L1420 236Z" fill="#d9886e" ${L(2)}/>${[[1372, 196, -40], [1390, 186, 0], [1408, 196, 40], [1380, 178, -20], [1400, 178, 20]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="6" fill="#7fb06e" ${L(1.2)} transform="rotate(${a - 60} ${x} ${y})"/>`).join('')}
  <!-- caisses de fruits -->
  ${crate('orange', 110, 'Oranges')}${crate('apple', 245, 'Apples')}${crate('lemon', 380, 'Lemons')}${crate('berry', 515, 'Berries')}
  <!-- extracteur de jus à froid -->
  <g class="hit" data-act="press" id="j-press"><g class="lift" id="pressBody">
    <path d="M730 214 L870 214 L852 330 L748 330Z" fill="#eef7fa" fill-opacity=".85" ${L(2.5)}/>
    <g id="pressFruit"></g>
    <rect x="720" y="200" width="160" height="18" rx="8" fill="#dfe3e8" ${L(2)}/><rect x="782" y="186" width="36" height="16" rx="6" fill="#3b3640" ${L(1.6)}/>
    <path d="M736 330 L864 330 L876 520 L724 520Z" fill="#a9d8c8" ${L(2.5)}/><path d="M748 340 L748 510" stroke="#d3f0e6" stroke-width="6" stroke-linecap="round"/>
    <circle cx="800" cy="400" r="26" fill="#dfe3e8" ${L(2)}/><circle cx="800" cy="400" r="18" fill="#fffaf2" ${L(1.4)}/><path d="M800 400 L812 390" stroke="#e86a5f" stroke-width="3" stroke-linecap="round"/>
    <rect x="752" y="440" width="96" height="22" rx="6" fill="#3b3640"/><text x="800" y="456" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="12" fill="#9cf0b0">COLD PRESS</text>
    <path d="M790 520 L810 520 L806 540 L794 540Z" fill="#b8bec8" ${L(1.6)}/>
    <path d="M876 360 L920 330" stroke="${P.ink}" stroke-width="11" stroke-linecap="round"/><path d="M876 360 L920 330" stroke="#dfe3e8" stroke-width="6" stroke-linecap="round"/><circle cx="924" cy="327" r="9" fill="#e86a5f" ${L(1.6)}/>
    <rect x="712" y="540" width="176" height="18" rx="6" fill="#d7dce2" ${L(2)}/>
    ${label(800, 598, 'Press the fruit')}
  </g></g>
  <!-- ajouts : glace, menthe, miel, eau pétillante -->
  <g class="hit" data-act="ice" id="j-ice"><g class="lift">
    <path d="M960 470 L1060 470 L1050 552 L970 552Z" fill="#c8ced6" ${L(2)}/><rect x="954" y="462" width="112" height="14" rx="5" fill="#dfe3e8" ${L(1.8)}/>
    ${[[976, 448], [1000, 440], [1024, 446], [1046, 452], [990, 458], [1032, 460]].map(([x, y]) => `<rect x="${x - 10}" y="${y - 10}" width="20" height="18" rx="4" fill="#e8f6fc" ${L(1.4)}/>`).join('')}
    ${label(1010, 598, 'Ice')}</g>${badge(1068, 452, 'ice')}</g>
  <g class="hit" data-act="mint" id="j-mint"><g class="lift">
    <path d="M1100 500 L1180 500 L1172 552 L1108 552Z" fill="#d9886e" ${L(2)}/>
    ${[[1116, 470, -50], [1132, 456, -20], [1150, 450, 10], [1166, 462, 40], [1140, 476, -10], [1158, 480, 30]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="16" ry="8" fill="#7fc08a" ${L(1.4)} transform="rotate(${a} ${x} ${y})"/>`).join('')}
    ${label(1140, 598, 'Mint')}</g>${badge(1192, 470, 'mint')}</g>
  <g class="hit" data-act="honey" id="j-honey"><g class="lift">
    <path d="M1232 552 L1232 478 Q1232 466 1244 466 L1296 466 Q1308 466 1308 478 L1308 552Z" fill="#f2b84a" fill-opacity=".9" ${L(2)}/><rect x="1236" y="452" width="68" height="16" rx="5" fill="#c99a6e" ${L(1.6)}/>
    <rect x="1244" y="496" width="52" height="24" rx="5" fill="#fdf1dd" ${L(1.2)}/>${TXT(1270, 513, 'Honey', 12, 'middle', '#8a5a2a')}
    <path d="M1300 448 L1318 418" stroke="#a8784e" stroke-width="6" stroke-linecap="round"/><ellipse cx="1320" cy="414" rx="7" ry="9" fill="#a8784e" ${L(1.4)}/>
    ${label(1270, 598, 'Honey')}</g>${badge(1316, 466, 'honey')}</g>
  <g class="hit" data-act="soda" id="j-soda"><g class="lift">
    <path d="M1382 552 L1382 450 Q1382 430 1396 420 L1396 392 L1424 392 L1424 420 Q1438 430 1438 450 L1438 552Z" fill="#cfe9f2" fill-opacity=".9" ${L(2)}/><rect x="1394" y="380" width="32" height="14" rx="4" fill="#7fa8d8" ${L(1.6)}/>
    <rect x="1386" y="480" width="48" height="34" rx="4" fill="#fdf1dd" ${L(1.2)}/>${TXT(1410, 501, 'Fizz', 12, 'middle', '#3a6a8a')}
    ${[[1396, 530], [1418, 540], [1408, 460], [1426, 470]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".9"/>`).join('')}
    ${label(1410, 598, 'Sparkling')}</g>${badge(1446, 420, 'soda')}</g>
  <!-- devant : verres, poubelle, emplacements, cloche, réserve -->
  <g class="hit" data-act="glass" id="j-glass"><g class="lift">
    ${[0, 1, 2, 3].map(k => `<path d="M${84 + (k % 2) * 4} ${852 - k * 22} L${136 - (k % 2) * 4} ${852 - k * 22} L${132} ${840 - k * 22 + 34} L${88} ${840 - k * 22 + 34}Z" fill="#eef7fa" ${L(1.6)}/>`).join('')}
    ${label(110, 884, 'Take a glass')}</g>${badge(150, 700, 'glasses')}</g>
  <g class="hit" data-act="trash" id="j-trash"><g class="lift"><rect x="220" y="770" width="120" height="86" rx="10" fill="#6b5a52" ${L(2)}/><rect x="212" y="760" width="136" height="16" rx="6" fill="#5a4a44" ${L(1.8)}/>${label(280, 884, 'Throw away')}</g></g>
  ${SLOTS.map((x, i) => `<g class="hit" data-act="slot" data-i="${i}"><rect id="jslot-${i}" x="${x - 116}" y="796" width="232" height="56" rx="16" fill="${['#e3a283', '#c9a27e', '#a9c8b2'][i]}" ${L(2)}/></g><g id="jglass-${i}" pointer-events="none"></g>`).join('')}
  <g class="hit" data-act="bell" id="j-bell"><g class="lift"><ellipse cx="1300" cy="836" rx="64" ry="14" fill="#3b3640"/><path d="M1252 830 Q1252 772 1300 772 Q1348 772 1348 830Z" fill="#f2d27a" ${L(2)}/><rect x="1292" y="756" width="16" height="16" rx="4" fill="#e3c06e" ${L(1.6)}/>${label(1300, 884, 'Ring to serve')}</g></g>
  <g class="hit" data-act="restock" id="j-restock"><g class="lift"><path d="M1420 762 L1560 762 L1550 852 L1430 852Z" fill="#c99b6e" ${L(2)}/><path d="M1420 762 L1440 736 L1540 736 L1560 762Z" fill="#d7aa7c" ${L(2)}/>${TXT(1490, 812, 'Supplies', 16, 'middle', '#6e4632')}${label(1490, 884, 'Restock · 15c')}</g></g>`;
}

/** Verre de jus : couleur du fruit pressé, glaçons, menthe, miel, bulles. */
function glassArt(i: number, c: Ingredient[] | null) {
  if (!c) return '';
  const x = SLOTS[i], y = 760, has = (k: Ingredient) => c.includes(k);
  const fruit = c.find(k => FRUITS.includes(k));
  const liquid = fruit ? JUICE[fruit] : has('soda') ? '#dff2f8' : has('honey') ? '#f6d27a' : null;
  const lvl = Math.min(3, c.filter(k => k !== 'mint' && k !== 'ice').length), top = y + 34 - lvl * 26;
  let inside = '';
  if (liquid) inside += `<path d="M${x - 42 + (top - (y - 60)) * 0.1} ${top} L${x + 42 - (top - (y - 60)) * 0.1} ${top} L${x + 34} ${y + 40} L${x - 34} ${y + 40}Z" fill="${liquid}" opacity=".92"/>`;
  if (has('honey')) inside += `<path d="M${x - 24} ${y + 30} q12 -10 24 0 q12 10 24 0" fill="none" stroke="#e0a030" stroke-width="4" stroke-linecap="round"/>`;
  if (has('soda')) inside += [[-18, 20], [10, 6], [22, 26], [-6, -6], [4, 30], [-24, -10]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="3.4" fill="#fff" opacity=".85"/>`).join('');
  if (has('ice')) inside += [[-16, top - y + 4, -10], [10, top - y + 8, 12], [-2, top - y + 22, 4]].map(([dx, dy, a]) => `<rect x="${x + dx - 11}" y="${y + dy - 10}" width="22" height="20" rx="4" fill="#f2fbff" fill-opacity=".85" ${L(1.4)} transform="rotate(${a} ${x + dx} ${y + dy})"/>`).join('');
  if (has('mint')) inside += `<g transform="translate(${x + 26} ${y - 66})"><ellipse cx="0" cy="0" rx="14" ry="7" fill="#7fc08a" ${L(1.3)} transform="rotate(-30)"/><ellipse cx="12" cy="6" rx="12" ry="6" fill="#6fb07a" ${L(1.3)} transform="rotate(20 12 6)"/></g>`;
  const names = c.map(k => INGREDIENTS[k].name).join(' · ') || 'Empty glass';
  return `<g class="popin">
    <path d="M${x - 46} ${y - 62} L${x + 46} ${y - 62} L${x + 36} ${y + 44} Q${x} ${y + 52} ${x - 36} ${y + 44}Z" fill="#eef7fa" fill-opacity=".55" ${L(2.5)}/>
    ${inside}
    <path d="M${x - 46} ${y - 62} L${x + 46} ${y - 62} L${x + 36} ${y + 44} Q${x} ${y + 52} ${x - 36} ${y + 44}Z" fill="none" ${L(2.5)}/>
    <path d="M${x - 34} ${y - 50} L${x - 28} ${y + 30}" stroke="#ffffff" stroke-width="5" opacity=".7" stroke-linecap="round"/>
    ${fruit ? `<path d="M${x + 14} ${y - 92} L${x + 4} ${y - 30}" stroke="#e86a5f" stroke-width="5" stroke-linecap="round"/>` : ''}
    <g transform="translate(0 98)"><rect x="${x - 104}" y="${y - 2}" width="208" height="26" rx="13" fill="#fffaf2" fill-opacity=".95" ${L(1.5)}/>${TXT(x, y + 16, names, 12.5, 'middle', '#6e5040', 700)}</g>
  </g>`;
}

export class JuiceStation {
  el: HTMLElement;
  private flying = new Set<number>();
  private pressing = false;
  private timer: number;
  onClose?: () => void;
  onFirstServe?: () => void;
  get cups() { return this.bench.cups; }
  get sel() { return this.bench.sel; }
  set sel(v: number) { this.bench.sel = v; }

  constructor(private room: Room, public stock: JuiceStock, private bench: JuiceBench, hint?: string) {
    this.el = h(`<div class="screen" style="background:#b3723a"><svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style="overflow:visible;background:transparent">
      <g class="art">${scene()}</g>
      <g class="hit" data-act="close"><g class="lift"><rect x="18" y="18" width="230" height="50" rx="25" fill="#fdf5e8" stroke="${P.ink}" stroke-width="2.5"/>${TXT(133, 50, '← Back to the room', 17)}</g></g>
      <rect x="1238" y="18" width="344" height="50" rx="25" fill="#fdf5e8" stroke="${P.ink}" stroke-width="2.5"/><text id="jcoins" x="1410" y="50" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="18" fill="${P.ink}"></text>
      <g id="tickets"></g><g id="fx"></g><g id="toast"></g><g id="hintBox"></g>
    </svg></div>`);
    ui().appendChild(this.el);
    this.el.querySelector('svg')!.addEventListener('click', e => this.click(e));
    this.cups.forEach((_, i) => this.drawGlass(i));
    this.drawPress();
    this.render();
    if (hint) this.showHint(hint);
    this.timer = window.setInterval(() => this.renderTickets(), 1000);
  }
  $(id: string) { return this.el.querySelector('#' + id) as SVGElement; }
  private orders() { return this.room.ordered().filter(c => c.recipe?.kind === 'juice'); }
  private renderTickets() {
    this.$('tickets').innerHTML = this.orders().slice(0, 3).map((c, i) => { const rem = c.qty - c.servedCups; return ticketArt({ id: c.id, recipe: { ...c.recipe!, name: (rem > 1 ? `${rem} × ` : '') + c.recipe!.name }, who: [`Table ${c.table + 1}`, String(c.table + 1), ''], patience: c.patience }, i); }).join('')
      || TXT(800, 170, 'No juice orders: take orders in the room', 20, 'middle', '#8a6a5a', 700);
  }
  render() {
    this.$('jcoins').textContent = `Coins ${Math.round(this.room.coins * 100) / 100} · ${this.room.served} / ${this.room.o.goal} happy`;
    for (const k of Object.keys(this.stock) as (keyof JuiceStock)[]) {
      const t = this.$('jc-' + k); if (t) t.textContent = String(this.stock[k]);
      this.$(k === 'glasses' ? 'j-glass' : 'j-' + k)?.classList.toggle('off', this.stock[k] <= 0);
    }
    this.cups.forEach((_, i) => this.$('jslot-' + i).classList.toggle('sel', i === this.sel));
    this.renderTickets();
  }
  private drawGlass(i: number) { this.$('jglass-' + i).innerHTML = glassArt(i, this.cups[i]); }
  private drawPress() {
    const f = this.bench.fruit;
    this.$('pressFruit').innerHTML = f ? `<g class="popin">${FRUIT_ART[f](785, 300)}${FRUIT_ART[f](812, 296)}${FRUIT_ART[f](798, 276)}</g>` : '';
  }
  private fx(x: number, y: number, text: string, color = '#6e5040') {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="fx" style="transform-box:fill-box">${TXT(x, y, text, 22, 'middle', color)}</g>`;
    this.$('fx').appendChild(g); setTimeout(() => g.remove(), 1300);
  }
  toast(text: string, good: boolean) {
    this.$('toast').innerHTML = `<g class="popin"><rect x="440" y="206" width="720" height="46" rx="23" fill="${good ? '#eaf4ec' : '#fbe9e4'}" stroke="${P.ink}" stroke-width="2.5"/>${TXT(800, 236, text, 16)}</g>`;
    clearTimeout((this as any).tt); (this as any).tt = setTimeout(() => this.$('toast').innerHTML = '', 2600);
  }
  showHint(text: string | null) {
    this.$('hintBox').innerHTML = text ? `<g class="popin"><rect x="1080" y="640" width="500" height="96" rx="18" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.5"/>
      <foreignObject x="1090" y="646" width="480" height="84"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 16px/1.35 Nunito,sans-serif;color:#3b2838;padding:6px 10px"><b>Grandma:</b> ${text}</div></foreignObject></g>` : '';
  }
  private takeGlass(): number {
    const i = this.cups.indexOf(null);
    if (i < 0) { this.toast('All three spots are full', false); return -1; }
    if (this.stock.glasses <= 0) { this.toast('Out of glasses: click Supplies', false); return -1; }
    this.stock.glasses--; this.cups[i] = []; this.sel = i; this.drawGlass(i);
    return i;
  }
  private add(ing: Ingredient) {
    if (this.sel < 0 || !this.cups[this.sel]) { if (this.takeGlass() < 0) return false; }
    const c = this.cups[this.sel]!;
    const why = cannotAdd(c, ing); if (why) { this.toast(why, false); return false; }
    c.push(ing); this.drawGlass(this.sel);
    this.fx(SLOTS[this.sel], 680, '+ ' + INGREDIENTS[ing].name); music.sfx('pour');
    return true;
  }

  private click(e: Event) {
    const el = (e.target as Element).closest('[data-act]') as SVGElement | null;
    if (!el) return;
    const a = el.dataset.act!;
    if (el.classList.contains('off')) return this.toast('Out of stock: click Supplies to restock', false);
    if (a === 'close') return this.close();
    if (a === 'glass') this.takeGlass();
    else if (a === 'slot') { const i = +el.dataset.i!; if (this.cups[i]) this.sel = i; }
    else if (a === 'fruit') {
      const f = el.dataset.f as Ingredient;
      if (this.bench.fruit) return this.toast(`The press already has ${INGREDIENTS[this.bench.fruit].name.toLowerCase()} in it: press it first`, false);
      if ((this.stock as any)[f] <= 0) return this.toast('Out of this fruit: click Supplies', false);
      (this.stock as any)[f]--; this.bench.fruit = f; this.drawPress(); music.sfx('pour');
      this.fx(800, 170, `${INGREDIENTS[f].name} in the press`);
    } else if (a === 'press') {
      if (this.pressing) return;
      if (!this.bench.fruit) return this.toast('Put a fruit in the press first (tap a crate)', false);
      if (this.sel < 0 || !this.cups[this.sel]) { if (this.takeGlass() < 0) return; }
      const why = cannotAdd(this.cups[this.sel]!, this.bench.fruit); if (why) return this.toast(why, false);
      this.pressing = true; music.sfx('grind');
      const body = this.$('pressBody'); body.classList.add('shake');
      const f = this.bench.fruit, i = this.sel;
      setTimeout(() => {
        body.classList.remove('shake'); this.pressing = false;
        this.bench.fruit = null; this.drawPress();
        const c = this.cups[i]; if (!c) return;
        c.push(f); this.drawGlass(i); music.sfx('pour'); this.fx(SLOTS[i], 680, `+ ${INGREDIENTS[f].name} juice`, '#c06a20');
        this.render();
      }, 1100);
    } else if (a === 'ice' || a === 'mint' || a === 'honey' || a === 'soda') {
      if (this.add(a)) (this.stock as any)[a]--;
    } else if (a === 'trash') {
      if (this.sel < 0 || !this.cups[this.sel]) return;
      this.cups[this.sel] = null; this.drawGlass(this.sel); this.sel = this.cups.findIndex(c => c);
    } else if (a === 'restock') {
      if (this.room.coins < 15) return this.toast('Not enough coins', false);
      music.sfx('cash'); this.room.coins -= 15; this.room.drawHud();
      for (const k in this.stock) (this.stock as any)[k] += 5;
      this.toast('Stock refilled: +5 of everything', true);
    } else if (a === 'bell') {
      music.sfx('bell');
      const ready = (k: number) => { const c = this.cups[k]; return !!c && c.length > 0 && !this.flying.has(k); };
      const fits = (k: number) => ready(k) && this.orders().some(x => matches(this.cups[k]!, x.recipe!));
      if (!fits(this.sel)) { const k = this.cups.findIndex((_, k) => fits(k)); if (k >= 0) this.sel = k; }
      const c = this.cups[this.sel];
      if (!ready(this.sel) || !c) return this.toast('Fill a glass, then ring the bell', false);
      const o = this.orders().find(x => matches(c, x.recipe!));
      if (!o) return this.toast('No customer ordered this juice: check the tickets', false);
      this.serveTo(o);
    } else if (a === 'serve') {
      const o = this.room.custs.find(x => x.id === +el.dataset.id!) as Cust, c = this.cups[this.sel];
      if (!c || !c.length) return this.toast('Select a filled glass, then click the ticket', false);
      if (!matches(c, o.recipe!)) {
        el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 700);
        return this.toast(`Not quite: ${o.recipe!.name} is ${o.recipe!.need.map(k => INGREDIENTS[k].name).join(' + ')}`, false);
      }
      this.serveTo(o);
    }
    this.render();
  }

  private serveTo(o: Cust) {
    const { outcome, pay, done } = this.room.serve(o.id);
    this.fx(800, 300, `+${pay} coins`, '#8a6a3c');
    this.toast(!done ? `One ${o.recipe!.name} served, ${o.qty - o.servedCups} more for table ${o.table + 1}` : outcome === 'delighted' ? `Delighted! They loved the ${o.recipe!.name}` : 'Served! Your customers are happy', true);
    const i = this.sel, g = this.$('jglass-' + i) as SVGGElement;
    g.style.animation = 'cupFly .8s ease-in forwards';
    this.flying.add(i);
    setTimeout(() => { g.style.animation = ''; this.cups[i] = null; this.flying.delete(i); this.drawGlass(i); this.render(); }, 820);
    this.sel = this.cups.findIndex((x, k) => x && x.length && !this.flying.has(k));
    this.onFirstServe?.();
    if (!this.orders().length) setTimeout(() => this.close(), 1100);
    this.render();
  }

  close() { clearInterval(this.timer); this.el.remove(); this.onClose?.(); }
}
