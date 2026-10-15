// Salon de thé (niveau 5) : une boîte de thé dans la théière (+ menthe ou cardamome), l'eau à la bonne température,
// on verse quand l'infusion est « juste comme il faut », on ajoute miel, pignons ou lait. Côté douceurs : couper une
// belle part de gâteau (couteau qui va et vient) et glacer les biscuits. Tout arrive sur le plateau, puis la sonnette.
import { P, sparkle } from '../art/cast.js';
import { L, TXT, ticketArt } from './stationArt.js';
import { music } from '../audio/music';
import { h, ui } from './dom';
import { recipeById } from '../logic/recipes';
import {
  TEAS, SWEETS, BASE_NAME, HERB_NAME, EXTRA_NAME, JUST_RIGHT, SLICE, cannotPour, cannotAddExtra, identify, steepResult, steepAfter, knifeAt, goodSlice, tempFor,
  type TeaBase, type Herb, type Extra, type Temp, type TrayItem, type SweetId
} from '../logic/tea';
import type { Room, Cust } from './room';
import { openHomeRecipe } from './recipeCard';

const NS = 'http://www.w3.org/2000/svg';
/** Plan de travail : on garde tout quand on retourne en salle (l'infusion se met en pause). */
export interface TeaBench { base: TeaBase | null; herb: Herb | null; steep: number | null; temp: Temp | null; tray: (TrayItem | null)[]; sel: number }
export const newTeaBench = (): TeaBench => ({ base: null, herb: null, steep: null, temp: null, tray: [null, null, null], sel: -1 });

const ink = (w = 1.8) => `stroke="${P.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const TEA_COL: Record<TeaBase, string> = { green: '#b8c96a', black: '#a0562e', chamomile: '#f2c46a' };
const TIN_COL: Record<TeaBase, [string, string]> = { green: ['#8fbf8a', '#6f957d'], black: ['#5a4a52', '#3e3238'], chamomile: ['#f2d27a', '#d9a94a'] };

/* ---------- dessins : tasse de thé et douceurs (centrés sur 0,0) ---------- */
function cupArt(base: TeaBase, herb: Herb | null, extras: Extra[]) {
  const col = extras.includes('milk') ? '#d9a878' : TEA_COL[base];
  return `<ellipse cx="0" cy="14" rx="38" ry="9" fill="#fffaf2" ${ink()}/>
    ${herb === 'mint' ? `<g transform="translate(26 8)"><ellipse rx="9" ry="4.5" fill="#7fc08a" ${ink(1.2)} transform="rotate(-25)"/><ellipse cx="8" cy="4" rx="7" ry="3.5" fill="#6fb07a" ${ink(1.2)} transform="rotate(15 8 4)"/></g>` : ''}
    ${herb === 'cardamom' ? `<g transform="translate(-28 10)">${[0, 9].map(d => `<ellipse cx="${d}" cy="0" rx="4.5" ry="3" fill="#9cc07a" ${ink(1)}/>`).join('')}</g>` : ''}
    ${extras.includes('honey') ? `<g transform="translate(30 6) rotate(-20)"><path d="M0 0 L0 -26" stroke="#a8743f" stroke-width="3" stroke-linecap="round"/><ellipse cx="0" cy="-28" rx="5" ry="6" fill="#f2b84a" ${ink(1)}/></g>` : ''}
    <path d="M-24 -14 L24 -14 Q22 12 0 12 Q-22 12 -24 -14Z" fill="#fffaf2" ${ink()}/>
    <path d="M24 -8 q12 0 10 10 q-2 6 -12 4" fill="none" ${ink(2)}/>
    <ellipse cx="0" cy="-14" rx="24" ry="5" fill="${col}" ${ink(1.4)}/>
    <path d="M-18 -2 q18 6 36 0" fill="none" stroke="#7fa8d8" stroke-width="2" opacity=".7"/>
    ${extras.includes('pine') ? [[-10, -15], [-2, -13], [7, -15], [13, -13], [2, -16]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.5" fill="#f6e3bd" stroke="#c9a46e" stroke-width=".7"/>`).join('') : ''}
    ${extras.includes('milk') ? `<path d="M-8 -15 q4 -3 8 0 q4 3 8 0" fill="none" stroke="#fffaf2" stroke-width="1.6" opacity=".8"/>` : ''}
    <g opacity=".7" style="animation:steam 2.2s infinite"><path d="M-6 -24 q-5 -8 0 -16 M6 -24 q-5 -8 0 -16" fill="none" stroke="#fffaf2" stroke-width="2.4" stroke-linecap="round"/></g>`;
}
function sweetArt(id: SweetId, extras: Extra[]) {
  const plate = `<ellipse cx="0" cy="12" rx="38" ry="9" fill="#fffaf2" ${ink()}/>`;
  if (id === 'cookies') {
    const iced = extras.includes('icing');
    return plate + [[-16, 4], [16, 4], [0, -4]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse rx="15" ry="7" fill="#e8b46a" ${ink(1.5)}/>
      ${iced ? `<ellipse cy="-1.5" rx="11" ry="4.5" fill="#f6a5bd"/>${[[-5, -2, '#7fa8d8'], [2, -3, '#fffaf2'], [5, 0, '#f2d27a'], [-2, 0, '#7fc08a']].map(([a, b, c]) => `<rect x="${a}" y="${b}" width="3" height="1.4" rx=".7" fill="${c}"/>`).join('')}` : `<circle cx="-4" cy="-1" r="1.2" fill="#c47a2c"/><circle cx="4" cy="1" r="1.2" fill="#c47a2c"/>`}</g>`).join('');
  }
  if (id === 'lemonCake') return plate + `<path d="M-26 10 L-26 -12 L22 -20 L22 6Z" fill="#f6dc7a" ${ink()}/><path d="M-26 -12 L22 -20 L28 -16 L-20 -8Z" fill="#fff6c0" ${ink(1.4)}/>
    <path d="M-24 -10 q6 6 10 0 q6 6 12 -2 q6 6 12 -2 q4 4 10 -2" fill="none" stroke="#fffaf2" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="-22" r="5" fill="#f6dc5a" ${ink(1.2)}/>`;
  return plate + `<path d="M-28 8 L-28 -10 L24 -16 L24 4Z" fill="#8a5234" ${ink()}/><path d="M-28 -10 L24 -16 L30 -12 L-22 -6Z" fill="#5a3424" ${ink(1.4)}/>
    <path d="M-28 -2 L24 -6" stroke="#c99a6e" stroke-width="3"/><path d="M-20 -6 q2 6 4 0 M0 -9 q2 7 4 0" fill="none" stroke="#5a3424" stroke-width="3" stroke-linecap="round"/>`;
}
function trayArt(it: TrayItem) { return it.kind === 'tea' ? cupArt(it.base, it.herb, it.extras) : sweetArt(it.id, it.extras); }
/** Une commande du salon de thé (fiche `id`) centrée en (x, y), telle qu'on la sert. */
export function teaItemArt(id: string, x: number, y: number, s = 1) {
  const t = TEAS.find(q => q.id === id), w = SWEETS.find(q => q.id === id);
  const art = t ? cupArt(t.base, t.herb, t.extras) : w ? sweetArt(w.id, w.extras) : '';
  return `<g transform="translate(${x} ${y}) scale(${s})">${art}</g>`;
}

/* ---------- décor et objets ---------- */
const TIN_X: Record<TeaBase, number> = { green: 66, black: 168, chamomile: 280 };
const KETTLE = { x: 420 }, POT = { x: 610 };
const HERB_X: Record<Herb, number> = { mint: 760, cardamom: 860 };
const CAKE_X: Record<'lemonCake' | 'chocCake', number> = { lemonCake: 1010, chocCake: 1180 };
const JAR = { x: 1350 };
const EXTRA_X: Record<Extra, number> = { honey: 85, pine: 237, milk: 389, icing: 541 };
const TRAY_X = [900, 1040, 1180];

function label(x: number, y: number, t: string) { return `<g><rect x="${x - t.length * 4.6 - 16}" y="${y - 15}" width="${t.length * 9.2 + 32}" height="28" rx="14" fill="#fffaf2" ${L(1.5)}/>${TXT(x, y + 5, t, 14)}</g>`; }
function tinArt(b: TeaBase) {
  const x = TIN_X[b], [c, d] = TIN_COL[b];
  return `<rect x="${x - 34}" y="466" width="68" height="86" rx="6" fill="${c}" ${L(2)}/><rect x="${x - 37}" y="456" width="74" height="16" rx="5" fill="${d}" ${L(1.8)}/>
    <rect x="${x - 24}" y="488" width="48" height="40" rx="5" fill="#fffaf2" ${L(1.2)}/>
    ${b === 'chamomile' ? `<g transform="translate(${x} 508)">${[0, 72, 144, 216, 288].map(a => `<ellipse cy="-6" rx="3.4" ry="6" fill="#fffaf2" stroke="#d9a94a" stroke-width=".8" transform="rotate(${a})"/>`).join('')}<circle r="3.4" fill="#f2c46a"/></g>`
      : `<path d="M${x - 10} 516 Q${x - 10} 498 ${x + 8} 496 Q${x + 10} 514 ${x - 10} 516Z" fill="${b === 'green' ? '#7fb06e' : '#6e4a3e'}" ${L(1.2)}/><path d="M${x - 10} 516 L${x + 4} 502" stroke="#fffaf2" stroke-width="1.2"/>`}`;
}
const KETTLE_ART = `<path d="M${KETTLE.x - 44} 552 L${KETTLE.x - 40} 488 Q${KETTLE.x} 470 ${KETTLE.x + 40} 488 L${KETTLE.x + 44} 552Z" fill="#f2e6cf" ${L(2.5)}/>
  <path d="M${KETTLE.x + 40} 520 Q${KETTLE.x + 70} 516 ${KETTLE.x + 76} 470 L${KETTLE.x + 86} 462" fill="none" stroke="${P.ink}" stroke-width="8" stroke-linecap="round"/><path d="M${KETTLE.x + 40} 520 Q${KETTLE.x + 70} 516 ${KETTLE.x + 76} 470 L${KETTLE.x + 86} 462" fill="none" stroke="#f2e6cf" stroke-width="4" stroke-linecap="round"/>
  <path d="M${KETTLE.x - 30} 484 Q${KETTLE.x - 30} 440 ${KETTLE.x} 440 Q${KETTLE.x + 30} 440 ${KETTLE.x + 30} 484" fill="none" stroke="#e86a5f" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="${KETTLE.x}" cy="484" rx="20" ry="5" fill="#e86a5f" ${L(1.6)}/>
  <rect x="${KETTLE.x - 24}" y="506" width="48" height="24" rx="5" fill="#3b3640"/>
  <rect x="${KETTLE.x - 50}" y="548" width="100" height="10" rx="4" fill="#3b3640"/>`;
const POT_ART = `<ellipse cx="${POT.x}" cy="550" rx="52" ry="8" fill="#000" opacity=".1"/>
  <path d="M${POT.x - 56} 512 Q${POT.x - 56} 466 ${POT.x} 466 Q${POT.x + 56} 466 ${POT.x + 56} 512 Q${POT.x + 56} 552 ${POT.x} 552 Q${POT.x - 56} 552 ${POT.x - 56} 512Z" fill="#7fa8d8" ${L(2.5)}/>
  <path d="M${POT.x + 54} 500 Q${POT.x + 84} 496 ${POT.x + 92} 474" fill="none" stroke="${P.ink}" stroke-width="9" stroke-linecap="round"/><path d="M${POT.x + 54} 500 Q${POT.x + 84} 496 ${POT.x + 92} 474" fill="none" stroke="#7fa8d8" stroke-width="5" stroke-linecap="round"/>
  <path d="M${POT.x - 54} 492 q-26 4 -22 26 q4 14 22 10" fill="none" stroke="${P.ink}" stroke-width="7"/><path d="M${POT.x - 54} 492 q-26 4 -22 26 q4 14 22 10" fill="none" stroke="#a9c8e8" stroke-width="3"/>
  <ellipse cx="${POT.x}" cy="468" rx="32" ry="7" fill="#a9c8e8" ${L(2)}/><circle cx="${POT.x}" cy="458" r="7" fill="#fffaf2" ${L(1.6)}/>
  ${[[-30, 508], [-6, 524], [20, 506], [36, 528], [-36, 530]].map(([dx, y]) => `<g transform="translate(${POT.x + dx} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse cy="-3.5" rx="2" ry="3.5" fill="#fffaf2" transform="rotate(${a})"/>`).join('')}</g>`).join('')}`;
const HERB_ART: Record<Herb, string> = {
  mint: `<path d="M${HERB_X.mint - 26} 552 L${HERB_X.mint - 22} 512 L${HERB_X.mint + 22} 512 L${HERB_X.mint + 26} 552Z" fill="#eef7fa" fill-opacity=".9" ${L(2)}/>
    ${[[-14, 488, -40], [-2, 474, -10], [12, 480, 20], [20, 496, 45], [0, 498, 0], [-18, 504, -60]].map(([dx, y, a]) => `<path d="M${HERB_X.mint} 520 L${HERB_X.mint + dx * .6} ${y + 8}" stroke="#6f957d" stroke-width="2"/><ellipse cx="${HERB_X.mint + dx}" cy="${y}" rx="12" ry="6.5" fill="#7fc08a" ${L(1.3)} transform="rotate(${a} ${HERB_X.mint + dx} ${y})"/>`).join('')}`,
  cardamom: `<path d="M${HERB_X.cardamom - 28} 552 L${HERB_X.cardamom - 28} 500 Q${HERB_X.cardamom - 28} 490 ${HERB_X.cardamom - 18} 490 L${HERB_X.cardamom + 18} 490 Q${HERB_X.cardamom + 28} 490 ${HERB_X.cardamom + 28} 500 L${HERB_X.cardamom + 28} 552Z" fill="#eef7fa" fill-opacity=".9" ${L(2)}/>
    <rect x="${HERB_X.cardamom - 22}" y="480" width="44" height="12" rx="4" fill="#c99a6e" ${L(1.5)}/>
    ${[[-12, 536], [0, 540], [12, 534], [-6, 524], [8, 522], [-14, 512], [2, 510], [14, 514]].map(([dx, y]) => `<ellipse cx="${HERB_X.cardamom + dx}" cy="${y}" rx="6" ry="4" fill="#9cc07a" ${L(1)}/>`).join('')}`
};
function cakeArt(id: 'lemonCake' | 'chocCake') {
  const x = CAKE_X[id];
  const stand = `<ellipse cx="${x}" cy="510" rx="70" ry="12" fill="#fffaf2" ${L(2)}/><path d="M${x - 8} 520 L${x - 12} 548 L${x + 12} 548 L${x + 8} 520Z" fill="#fffaf2" ${L(1.8)}/><ellipse cx="${x}" cy="550" rx="30" ry="5" fill="#fffaf2" ${L(1.8)}/>`;
  const cake = id === 'lemonCake'
    ? `<path d="M${x - 56} 506 L${x - 56} 466 Q${x - 56} 452 ${x - 40} 452 L${x + 40} 452 Q${x + 56} 452 ${x + 56} 466 L${x + 56} 506Z" fill="#f6dc7a" ${L(2)}/>
       <path d="M${x - 56} 466 Q${x - 56} 452 ${x - 40} 452 L${x + 40} 452 Q${x + 56} 452 ${x + 56} 466 q-8 10 -14 0 q-8 12 -16 0 q-8 10 -16 0 q-8 12 -16 0 q-8 10 -16 0 q-8 12 -16 0 q-6 10 -12 0Z" fill="#fffaf2" ${L(1.4)}/>
       ${[-30, 0, 30].map(d => `<circle cx="${x + d}" cy="448" r="7" fill="#f6dc5a" ${L(1.2)}/><path d="M${x + d} 442 L${x + d} 454 M${x + d - 6} 448 L${x + d + 6} 448" stroke="#fff6c0" stroke-width="1.2"/>`).join('')}`
    : `<path d="M${x - 56} 506 L${x - 56} 462 Q${x} 448 ${x + 56} 462 L${x + 56} 506 Q${x} 516 ${x - 56} 506Z" fill="#8a5234" ${L(2)}/>
       <path d="M${x - 56} 462 Q${x} 448 ${x + 56} 462 L${x + 56} 472 q-6 12 -10 0 q-8 16 -14 0 q-10 10 -16 0 q-8 18 -14 0 q-10 10 -16 0 q-8 14 -14 0 q-8 10 -12 0Z" fill="#5a3424" ${L(1.4)}/>
       ${[-28, 0, 28].map(d => `<path d="M${x + d} 446 q-8 -8 0 -14 q8 6 0 14z" fill="#e8445a" ${L(1.1)}/>`).join('')}`;
  return stand + cake;
}
const JAR_ART = `<path d="M${JAR.x - 40} 552 L${JAR.x - 44} 486 Q${JAR.x - 44} 470 ${JAR.x - 30} 470 L${JAR.x + 30} 470 Q${JAR.x + 44} 470 ${JAR.x + 44} 486 L${JAR.x + 40} 552Z" fill="#eef7fa" fill-opacity=".8" ${L(2)}/>
  ${[[-22, 534], [6, 538], [24, 528], [-14, 514], [12, 510], [-24, 498], [20, 494], [-2, 494]].map(([dx, y]) => `<ellipse cx="${JAR.x + dx}" cy="${y}" rx="13" ry="6" fill="#e8b46a" ${L(1.2)}/>`).join('')}
  <rect x="${JAR.x - 36}" y="456" width="72" height="16" rx="6" fill="#f2a2b4" ${L(1.8)}/><circle cx="${JAR.x}" cy="452" r="7" fill="#f2a2b4" ${L(1.6)}/>`;
const EXTRA_ART: Record<Extra, string> = {
  honey: `<path d="M${EXTRA_X.honey - 30} 856 L${EXTRA_X.honey - 30} 794 Q${EXTRA_X.honey - 30} 780 ${EXTRA_X.honey - 16} 780 L${EXTRA_X.honey + 16} 780 Q${EXTRA_X.honey + 30} 780 ${EXTRA_X.honey + 30} 794 L${EXTRA_X.honey + 30} 856Z" fill="#f2b84a" fill-opacity=".9" ${L(2)}/><rect x="${EXTRA_X.honey - 34}" y="768" width="68" height="14" rx="5" fill="#c99a6e" ${L(1.6)}/><path d="M${EXTRA_X.honey + 18} 768 L${EXTRA_X.honey + 34} 738" stroke="#a8743f" stroke-width="5" stroke-linecap="round"/>`,
  pine: `<ellipse cx="${EXTRA_X.pine}" cy="846" rx="44" ry="12" fill="#c99a6e" ${L(2)}/><ellipse cx="${EXTRA_X.pine}" cy="840" rx="38" ry="9" fill="#e3b77a"/>${[[-20, 838], [-8, 834], [4, 838], [16, 834], [26, 840], [-14, 844], [8, 844]].map(([dx, y]) => `<ellipse cx="${EXTRA_X.pine + dx}" cy="${y}" rx="5" ry="2.8" fill="#f6e3bd" stroke="#a8743f" stroke-width=".8"/>`).join('')}`,
  milk: `<path d="M${EXTRA_X.milk - 26} 856 L${EXTRA_X.milk - 26} 800 L${EXTRA_X.milk - 14} 778 L${EXTRA_X.milk + 14} 778 L${EXTRA_X.milk + 26} 800 L${EXTRA_X.milk + 26} 856Z" fill="#fffaf2" ${L(2)}/><path d="M${EXTRA_X.milk - 14} 778 L${EXTRA_X.milk - 18} 768 L${EXTRA_X.milk + 18} 768 L${EXTRA_X.milk + 14} 778" fill="#7fa8d8" ${L(1.6)}/><rect x="${EXTRA_X.milk - 18}" y="810" width="36" height="24" rx="4" fill="#cfe4f6" ${L(1)}/>`,
  icing: `<path d="M${EXTRA_X.icing - 26} 770 L${EXTRA_X.icing + 26} 770 L${EXTRA_X.icing + 4} 846 L${EXTRA_X.icing - 4} 846Z" fill="#f6a5bd" ${L(2)}/><path d="M${EXTRA_X.icing - 4} 846 L${EXTRA_X.icing} 858 L${EXTRA_X.icing + 4} 846" fill="#dfe3e8" ${L(1.6)}/><path d="M${EXTRA_X.icing - 26} 770 Q${EXTRA_X.icing} 756 ${EXTRA_X.icing + 26} 770" fill="#fffaf2" ${L(1.6)}/>`
};

/** Les notes de thé de Leila (et les douceurs de Grand-mère) : comment faire chaque commande. */
const NOTES: { id: string; how: string }[] = [
  { id: 'greenTea', how: 'Green tin · kettle 80°C · pour when just right' },
  { id: 'blackTea', how: 'Black tin · kettle 100°C · pour when just right' },
  { id: 'chamomile', how: 'Chamomile tin · 100°C · then honey' },
  { id: 'mintTea', how: 'Green tin + mint · 100°C · then pine nuts' },
  { id: 'karak', how: 'Black tin + cardamom · 100°C · then milk' },
  { id: 'cookies', how: 'Cookie jar · then pink icing' },
  { id: 'lemonCake', how: 'Tap the cake, then cut in the middle' },
  { id: 'chocCake', how: 'Tap the cake, then cut in the middle' }
];
function notesArt() {
  return `<rect x="14" y="80" width="456" height="364" rx="16" fill="#fffaf2" ${L(2)}/>
    <text x="30" y="108" font-family="Fraunces,serif" font-style="italic" font-weight="700" font-size="19" fill="#6e4a3e">Leila's tea notes ♡</text>
    ${NOTES.map((n, i) => {
      const y = 124 + i * 39;
      return `<path d="M26 ${y + 37} L458 ${y + 37}" stroke="#f0c9cf" stroke-width="1"/>
        <g transform="translate(46 ${y + 22}) scale(.42)">${teaItemArt(n.id, 0, 0)}</g>
        <text x="80" y="${y + 17}" font-family="Fraunces,serif" font-style="italic" font-weight="700" font-size="15" fill="#6e4a3e">${recipeById(n.id).name}${n.id === 'mintTea' ? ' (Tunisian)' : ''}</text>
        <text x="80" y="${y + 33}" font-family="Nunito,sans-serif" font-weight="700" font-size="11.5" fill="#8a5a4a">${n.how}</text>
        <g class="hit" data-act="howto" data-id="${n.id}"><g class="lift"><circle cx="440" cy="${y + 20}" r="14" fill="#fdf1dd" stroke="#6f957d" stroke-width="2"/><text x="440" y="${y + 25}" text-anchor="middle" font-size="14">📖</text></g></g>`;
    }).join('')}`;
}

function scene() {
  return `
  <defs><pattern id="teaTiles" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#dbe8d8"/><rect x="2" y="2" width="44" height="44" rx="10" fill="#e6efe4" stroke="#d3e2d0" stroke-width="2"/></pattern></defs>
  <rect x="-500" y="-300" width="2600" height="860" fill="url(#teaTiles)"/>
  <g transform="translate(270 22)"><rect width="190" height="44" rx="22" fill="#6f957d"/><text x="95" y="29" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="21" fill="#fffaf2">🍵 Tea room</text></g>
  <!-- étagère : théières et tasses, une petite plante -->
  <rect x="1180" y="150" width="400" height="12" rx="4" fill="#a8743f" ${L(2)}/>
  ${[1220, 1300].map((x, i) => `<path d="M${x - 24} 150 Q${x - 26} 118 ${x} 116 Q${x + 26} 118 ${x + 24} 150Z" fill="${['#f2a2b4', '#f2d27a'][i]}" ${L(1.8)}/><circle cx="${x}" cy="112" r="5" fill="#fffaf2" ${L(1.4)}/>`).join('')}
  ${[1380, 1430].map(x => `<path d="M${x - 16} 132 L${x + 16} 132 Q${x + 14} 150 ${x} 150 Q${x - 14} 150 ${x - 16} 132Z" fill="#fffaf2" ${L(1.6)}/>`).join('')}
  <path d="M1500 150 L1506 124 L1546 124 L1552 150Z" fill="#d9886e" ${L(2)}/>${[[1512, 112, -40], [1526, 102, 0], [1540, 112, 40]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="#7fb06e" ${L(1.2)} transform="rotate(${a - 60} ${x} ${y})"/>`).join('')}
  <rect x="-500" y="560" width="2600" height="210" fill="#e3c08a"/><path d="M-500 560 L2100 560" stroke="#b08850" stroke-width="3"/>
  <rect x="-500" y="770" width="2600" height="430" fill="#8a6a50"/><path d="M-500 770 L2100 770" stroke="#6e4a3e" stroke-width="3"/>
  ${notesArt()}
  <!-- boîtes de thé -->
  ${(Object.keys(TIN_X) as TeaBase[]).map(b => `<g class="hit" data-act="tin" data-k="${b}" id="t-${b}"><g class="lift">${tinArt(b)}${label(TIN_X[b], 598, b === 'chamomile' ? 'Chamomile' : b === 'green' ? 'Green' : 'Black')}</g></g>`).join('')}
  <!-- bouilloire et ses deux températures -->
  <g class="hit" data-act="kettle" id="t-kettle"><g class="lift">${KETTLE_ART}<text id="kettleTemp" x="${KETTLE.x}" y="523" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="13" fill="#9cf0b0">--</text><g id="kettleSteam"></g></g></g>
  <g class="hit" data-act="temp" data-t="80" id="t-80">${label(KETTLE.x - 38, 598, '80°C')}</g>
  <g class="hit" data-act="temp" data-t="100" id="t-100">${label(KETTLE.x + 42, 598, '100°C')}</g>
  <!-- théière -->
  <g class="hit" data-act="pot" id="t-pot"><g class="lift"><g id="potBody">${POT_ART}</g><g id="potIn"></g><g id="potLbl">${label(POT.x, 598, 'Teapot')}</g></g></g>
  <g id="steepGauge" opacity="0">
    <rect x="${POT.x - 110}" y="340" width="220" height="24" rx="12" fill="#eef4d8" ${L(2)}/>
    <rect x="${POT.x - 110 + 220 * JUST_RIGHT.from}" y="340" width="${220 * (JUST_RIGHT.to - JUST_RIGHT.from)}" height="24" fill="#9cc07a"/>
    <path d="M${POT.x - 110 + 220 * JUST_RIGHT.to} 340 L${POT.x + 98} 340 Q${POT.x + 110} 340 ${POT.x + 110} 352 Q${POT.x + 110} 364 ${POT.x + 98} 364 L${POT.x - 110 + 220 * JUST_RIGHT.to} 364Z" fill="#7a4e36"/>
    <rect x="${POT.x - 110}" y="340" width="220" height="24" rx="12" fill="none" ${L(2)}/>
    ${TXT(POT.x - 110 + 220 * JUST_RIGHT.from / 2, 357, 'weak', 11, 'middle', '#8a6a3c')}${TXT(POT.x - 110 + 220 * (JUST_RIGHT.from + JUST_RIGHT.to) / 2, 357, 'just right', 11, 'middle', '#3e5a2e')}${TXT(POT.x - 110 + 220 * (JUST_RIGHT.to + 1) / 2, 357, 'bitter', 11, 'middle', '#fdf1dd')}
    <g id="steepNeedle"><path d="M0 332 L0 372" stroke="${P.ink}" stroke-width="4" stroke-linecap="round"/><path d="M-7 328 L7 328 L0 338Z" fill="${P.ink}"/></g>
  </g>
  <!-- herbes -->
  ${(Object.keys(HERB_X) as Herb[]).map(k => `<g class="hit" data-act="herb" data-k="${k}" id="t-${k}"><g class="lift">${HERB_ART[k]}${label(HERB_X[k], 598, k === 'mint' ? 'Mint' : 'Cardamom')}</g></g>`).join('')}
  <!-- gâteaux et biscuits -->
  ${(Object.keys(CAKE_X) as ('lemonCake' | 'chocCake')[]).map(k => `<g class="hit" data-act="cake" data-k="${k}" id="t-${k}"><g class="lift">${cakeArt(k)}${label(CAKE_X[k], 598, recipeById(k).name)}</g></g>`).join('')}
  <g id="knife" opacity="0">
    <g id="knifeZone"></g>
    <g id="knifeBlade"><path d="M0 380 L0 462" stroke="#dfe3e8" stroke-width="6" stroke-linecap="round"/><path d="M0 380 L0 462" stroke="${P.ink}" stroke-width="1.2" opacity=".5"/><rect x="-5" y="352" width="10" height="30" rx="4" fill="#a8743f" ${L(1.6)}/></g>
  </g>
  <g class="hit" data-act="jar" id="t-jar"><g class="lift">${JAR_ART}${label(JAR.x, 598, 'Cookie jar')}</g></g>
  <!-- ajouts -->
  ${(Object.keys(EXTRA_X) as Extra[]).map(k => `<g class="hit" data-act="extra" data-k="${k}" id="t-${k}"><g class="lift">${EXTRA_ART[k]}${label(EXTRA_X[k], 884, EXTRA_NAME[k])}</g></g>`).join('')}
  <g class="hit" data-act="trash" id="t-trash"><g class="lift"><rect x="652" y="776" width="96" height="80" rx="10" fill="#6b5a52" ${L(2)}/><rect x="644" y="766" width="112" height="16" rx="6" fill="#5a4a44" ${L(1.8)}/>${label(700, 884, 'Throw away')}</g></g>
  <!-- le plateau de service -->
  <rect x="${TRAY_X[0] - 90}" y="786" width="${TRAY_X[2] - TRAY_X[0] + 180}" height="76" rx="18" fill="#c99a6e" ${L(2.5)}/><rect x="${TRAY_X[0] - 80}" y="794" width="${TRAY_X[2] - TRAY_X[0] + 160}" height="60" rx="14" fill="#e3b77a"/>
  ${TXT(TRAY_X[1], 884, 'Serving tray', 14, 'middle', '#fdf1dd')}
  ${TRAY_X.map((x, i) => `<g class="hit" data-act="tray" data-i="${i}"><ellipse id="tray-${i}" cx="${x}" cy="828" rx="58" ry="22" fill="#000" fill-opacity=".04" stroke="#a8743f" stroke-width="2" stroke-dasharray="6 5"/></g><g id="trayIn-${i}" pointer-events="none"></g>`).join('')}
  <g class="hit" data-act="bell" id="t-bell"><g class="lift"><ellipse cx="1420" cy="836" rx="64" ry="14" fill="#3b3640"/><path d="M1372 830 Q1372 772 1420 772 Q1468 772 1468 830Z" fill="#f2d27a" ${L(2)}/><rect x="1412" y="756" width="16" height="16" rx="4" fill="#e3c06e" ${L(1.6)}/>${label(1420, 884, 'Ring to serve')}</g></g>`;
}

export class TeaStation {
  el: HTMLElement;
  private timer: number;
  private raf = 0;
  private last = 0;
  private heating = false;
  private chimed = false;
  private cutting: { cake: 'lemonCake' | 'chocCake'; t: number } | null = null;
  onClose?: () => void;
  onFirstServe?: () => void;

  /** `story` : le salon pour la scène d'ouverture (on peut lire les notes, rien d'autre). */
  constructor(private room: Room | null, private bench: TeaBench, hint?: string, private story = false) {
    this.el = h(`<div class="screen" style="background:#8a6a50"><svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style="overflow:visible;background:transparent">
      <g class="art">${scene()}</g>
      ${story ? '' : `<g class="hit" data-act="close"><g class="lift"><rect x="18" y="18" width="230" height="50" rx="25" fill="#fdf5e8" stroke="${P.ink}" stroke-width="2.5"/>${TXT(133, 50, '← Back to the room', 17)}</g></g>
      <rect x="1238" y="18" width="344" height="50" rx="25" fill="#fdf5e8" stroke="${P.ink}" stroke-width="2.5"/><text id="tcoins" x="1410" y="50" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="18" fill="${P.ink}"></text>`}
      <g id="tickets"></g><g id="extraArt"></g><g id="fx"></g><g id="hintBox"></g><g id="toast"></g>
    </svg></div>`);
    ui().appendChild(this.el);
    this.el.querySelector('svg')!.addEventListener('click', e => this.click(e));
    this.draw();
    if (hint) this.showHint(hint);
    this.timer = window.setInterval(() => this.renderTickets(), 1000);
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }
  $(id: string) { return this.el.querySelector('#' + id) as SVGElement; }
  private orders(): Cust[] { return this.room ? this.room.ordered().filter(c => c.recipe?.kind === 'tea') : []; }

  /* ---------- dessin ---------- */
  private draw() {
    const b = this.bench;
    this.$('kettleTemp').textContent = this.heating ? '…' : b.temp ? `${b.temp}°C` : '--';
    this.$('kettleSteam').innerHTML = b.temp && !this.heating ? `<g style="animation:steam 2s infinite">${[0, 12].map(d => `<path d="M${KETTLE.x + 88 + d} 452 q-6 -10 0 -20 q6 -10 0 -20" fill="none" stroke="#fffaf2" stroke-width="3" stroke-linecap="round" opacity=".8"/>`).join('')}</g>` : '';
    for (const t of [80, 100]) { const r = this.$('t-' + t).querySelector('rect')!; r.setAttribute('fill', b.temp === t ? '#ffe2b0' : '#fffaf2'); r.setAttribute('stroke-width', b.temp === t ? '3' : '1.5'); }
    // ce qu'il y a dans la théière : petites étiquettes au-dessus
    const chips = [b.base ? BASE_NAME[b.base] : '', b.herb ? HERB_NAME[b.herb] : '', b.steep !== null ? 'Hot water' : ''].filter(Boolean);
    this.$('potIn').innerHTML = chips.length ? `<g class="popin">${chips.map((c, i) => { const w = c.length * 7.6 + 22, y = 446 - i * 26; return `<rect x="${POT.x - w / 2}" y="${y - 16}" width="${w}" height="22" rx="11" fill="${i === 0 && b.base ? TIN_COL[b.base][0] : '#fffaf2'}" ${L(1.2)}/>${TXT(POT.x, y, c, 12, 'middle', i === 0 && b.base === 'black' ? '#fdf1dd' : P.ink)}`; }).reverse().join('')}</g>` : '';
    if (b.steep !== null) this.$('potIn').innerHTML += `<g style="animation:steam 1.8s infinite">${[-14, 14].map(d => `<path d="M${POT.x + 92 + d * .3} 466 q-5 -8 0 -16 q5 -8 0 -16" fill="none" stroke="#fffaf2" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`).join('')}</g>`;
    this.drawSteep();
    TRAY_X.forEach((x, i) => {
      const it = b.tray[i];
      this.$('trayIn-' + i).innerHTML = it ? `<g class="popin"><g transform="translate(${x} 818)">${trayArt(it)}</g></g>` : '';
      this.$('tray-' + i).setAttribute('stroke', i === b.sel && it ? '#e8823a' : '#a8743f');
      this.$('tray-' + i).setAttribute('stroke-width', i === b.sel && it ? '4' : '2');
    });
    this.render();
  }
  private drawSteep() {
    const b = this.bench, on = b.steep !== null;
    this.$('steepGauge').setAttribute('opacity', on ? '1' : '0');
    this.$('steepNeedle').setAttribute('transform', `translate(${POT.x - 110 + 220 * (b.steep ?? 0)} 0)`);
    const lbl = on ? (steepResult(b.steep!) === 'right' ? 'Pour now! ✨' : 'Steeping…') : b.base ? 'Add hot water' : 'Teapot';
    const cur = this.$('potLbl'); if (cur.dataset.t !== lbl) { cur.innerHTML = label(POT.x, 598, lbl); cur.dataset.t = lbl; }
  }
  private drawKnife() {
    const k = this.$('knife');
    if (!this.cutting) { k.setAttribute('opacity', '0'); return; }
    const x0 = CAKE_X[this.cutting.cake] - 56, w = 112, pos = knifeAt(this.cutting.t);
    k.setAttribute('opacity', '1');
    this.$('knifeZone').innerHTML = `<rect x="${x0 + w * SLICE.from}" y="440" width="${w * (SLICE.to - SLICE.from)}" height="70" rx="6" fill="#fffaf2" opacity=".45" stroke="#e8823a" stroke-width="2" stroke-dasharray="5 4"/>`;
    this.$('knifeBlade').setAttribute('transform', `translate(${x0 + w * pos} 0)`);
  }
  private renderTickets() {
    if (this.story) { this.$('tickets').innerHTML = ''; return; }
    this.$('tickets').innerHTML = this.orders().slice(0, 3).map((c, i) => { const rem = c.qty - c.servedCups; return ticketArt({ id: c.id, recipe: { name: (rem > 1 ? `${rem} × ` : '') + c.recipe!.name, price: c.recipe!.price, need: [] }, who: [`Table ${c.table + 1}`, String(c.table + 1), ''], patience: c.patience }, i); }).join('')
      || TXT(840, 130, 'No tea orders: take orders in the room', 20, 'middle', '#5a6a50', 700);
  }
  render() {
    if (this.room && !this.story) this.$('tcoins').textContent = `Coins ${Math.round(this.room.coins * 100) / 100} · ${this.room.served} / ${this.room.o.goal} happy`;
    this.renderTickets();
  }
  private fx(x: number, y: number, text: string, color = '#5a4a40') {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="fx" style="transform-box:fill-box">${TXT(x, y, text, 22, 'middle', color)}</g>`;
    this.$('fx').appendChild(g); setTimeout(() => g.remove(), 1300);
  }
  toast(text: string, good: boolean) {
    this.$('toast').innerHTML = `<g class="popin"><rect x="540" y="300" width="600" height="46" rx="23" fill="${good ? '#eaf4ec' : '#fbe9e4'}" stroke="${P.ink}" stroke-width="2.5"/>${TXT(840, 330, text, 15)}</g>`;
    clearTimeout((this as any).tt); (this as any).tt = setTimeout(() => this.$('toast').innerHTML = '', 2600);
  }
  showHint(text: string | null) {
    this.$('hintBox').innerHTML = text ? `<g class="popin"><rect x="540" y="200" width="600" height="92" rx="18" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.5"/>
      <foreignObject x="550" y="206" width="580" height="80"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 15px/1.35 Nunito,sans-serif;color:#3b2838;padding:6px 10px"><b>Grandma:</b> ${text}</div></foreignObject></g>` : '';
  }
  extra(html: string) { this.$('extraArt').innerHTML = html; }

  /* ---------- l'infusion et le couteau bougent ---------- */
  private loop(t: number) {
    const dt = Math.min(0.1, (t - (this.last || t)) / 1000); this.last = t;
    const b = this.bench;
    if (b.steep !== null && b.base) {
      b.steep = steepAfter(b.steep, dt, b.base);
      if (!this.chimed && steepResult(b.steep) === 'right') { this.chimed = true; music.sfx('twinkle'); this.fx(POT.x, 316, 'just right ✨', '#3e5a2e'); }
      if (b.steep >= 1) this.bitter();
      this.drawSteep();
    }
    if (this.cutting) { this.cutting.t += dt; this.drawKnife(); }
    this.raf = requestAnimationFrame(this.loop);
  }
  private emptyPot() { const b = this.bench; b.base = null; b.herb = null; b.steep = null; this.chimed = false; }
  private bitter() {
    this.emptyPot();
    this.toast('Oh no, it steeped too long and turned bitter. Poured away: try again!', false);
    this.draw();
  }
  private put(it: TrayItem): boolean {
    const b = this.bench, i = b.tray.indexOf(null);
    if (i < 0) { this.toast('The tray is full: serve or throw something away', false); return false; }
    b.tray[i] = it; b.sel = i; return true;
  }

  /* ---------- clics ---------- */
  private click(e: Event) {
    const el = (e.target as Element).closest('[data-act]') as SVGElement | null;
    if (!el) return;
    const a = el.dataset.act!, b = this.bench;
    if (a === 'howto') return openHomeRecipe(el.dataset.id!);
    if (this.story) return;
    if (a === 'close') return this.close();
    if (a === 'tin') {
      const k = el.dataset.k as TeaBase;
      if (b.steep !== null) return this.toast('The tea is steeping: pour it first', false);
      if (b.base) return this.toast(`There is already ${BASE_NAME[b.base].toLowerCase()} in the pot`, false);
      b.base = k; music.sfx('pour'); this.fx(POT.x, 380, `+ ${BASE_NAME[k]}`);
    } else if (a === 'herb') {
      const k = el.dataset.k as Herb;
      if (b.steep !== null) return this.toast('Add herbs before the water', false);
      if (!b.base) return this.toast('Put tea leaves in the pot first (tap a tin)', false);
      if (b.herb) return this.toast(`${HERB_NAME[b.herb]} is already in the pot`, false);
      b.herb = k; music.sfx('pour'); this.fx(POT.x, 380, `+ ${HERB_NAME[k]}`);
    } else if (a === 'temp') {
      if (this.heating) return;
      const t = +el.dataset.t! as Temp;
      this.heating = true; music.sfx('grind'); this.draw();
      setTimeout(() => { this.heating = false; b.temp = t; this.fx(KETTLE.x, 420, `${t}°C`, '#c0506a'); this.draw(); }, 1000);
      return;
    } else if (a === 'kettle') {
      if (this.heating) return this.toast('The kettle is heating…', false);
      if (!b.temp) return this.toast('Choose 80°C or 100°C under the kettle first', false);
      if (!b.base) return this.toast('Put tea leaves in the pot first (tap a tin)', false);
      if (b.steep !== null) return this.toast('The pot is already full of hot water', false);
      const why = cannotPour(b.base, b.herb, b.temp); if (why) return this.toast(why, false);
      b.steep = 0; this.chimed = false; music.sfx('pour'); this.fx(POT.x, 380, 'Steeping…');
    } else if (a === 'pot') {
      if (b.steep === null) return this.toast(b.base ? `Pour hot water from the kettle (${tempFor(b.base, b.herb)}°C)` : 'Tap a tea tin to put leaves in the pot', false);
      const r = steepResult(b.steep);
      if (r === 'weak') return this.toast('Still weak… wait until the needle is in "just right"', false);
      if (r === 'bitter') return this.bitter();
      if (!this.put({ kind: 'tea', base: b.base!, herb: b.herb, extras: [] })) return;
      music.sfx('pour'); this.fx(TRAY_X[b.sel], 760, 'A perfect cup ♡', '#3e5a2e');
      this.emptyPot();
    } else if (a === 'cake') {
      const k = el.dataset.k as 'lemonCake' | 'chocCake';
      if (this.cutting?.cake === k) {
        const pos = knifeAt(this.cutting.t);
        if (!goodSlice(pos)) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 600); return this.toast('A crooked slice! Wait for the knife to reach the middle', false); }
        if (!this.put({ kind: 'sweet', id: k, extras: [] })) return;
        this.cutting = null; this.drawKnife(); music.sfx('sweep'); this.fx(CAKE_X[k], 420, 'A lovely slice ♡', '#c47a2c');
      } else {
        if (b.tray.indexOf(null) < 0) return this.toast('The tray is full: serve or throw something away', false);
        this.cutting = { cake: k, t: 0 }; this.drawKnife(); this.toast('Tap the cake again when the knife is in the middle', true);
      }
    } else if (a === 'jar') {
      if (!this.put({ kind: 'sweet', id: 'cookies', extras: [] })) return;
      music.sfx('pour'); this.toast('Now add the pink icing (bottom left)', true);
    } else if (a === 'extra') {
      const k = el.dataset.k as Extra, it = b.tray[b.sel];
      if (!it) return this.toast('Choose something on the tray first', false);
      const why = cannotAddExtra(it, k); if (why) return this.toast(why, false);
      it.extras.push(k); music.sfx('pour'); this.fx(TRAY_X[b.sel], 760, `+ ${EXTRA_NAME[k]}`);
    } else if (a === 'tray') {
      const i = +el.dataset.i!; if (b.tray[i]) b.sel = i;
    } else if (a === 'trash') {
      if (b.sel >= 0 && b.tray[b.sel]) { b.tray[b.sel] = null; b.sel = b.tray.findIndex(x => x); }
      else if (b.base) this.emptyPot();
      else return;
      this.toast('Thrown away', true);
    } else if (a === 'bell') {
      music.sfx('bell');
      const fits = (i: number) => { const it = b.tray[i]; const id = it && identify(it); return !!id && this.orders().some(o => o.recipe!.id === id); };
      if (!fits(b.sel)) { const k = b.tray.findIndex((_, i) => fits(i)); if (k >= 0) b.sel = k; }
      const it = b.tray[b.sel];
      if (!it) return this.toast('Put a tea or a sweet on the tray first', false);
      const id = identify(it);
      if (!id) return this.toast(it.kind === 'tea' ? 'Not quite: check the extras in Leila\'s notes' : 'The cookies need their pink icing', false);
      const o = this.orders().find(x => x.recipe!.id === id);
      if (!o) return this.toast(`No customer ordered a ${recipeById(id).name}: check the tickets`, false);
      this.serveTo(o, b.sel);
    } else if (a === 'serve') {
      const o = this.orders().find(x => x.id === +el.dataset.id!);
      if (!o) return;
      const i = b.tray.findIndex(it => it && identify(it) === o.recipe!.id);
      if (i < 0) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 700); return this.toast(`Make a ${o.recipe!.name} first: see Leila's notes`, false); }
      this.serveTo(o, i);
    }
    this.draw();
  }

  private serveTo(o: Cust, i: number) {
    if (!this.room) return;
    const b = this.bench;
    const { outcome, pay, done } = this.room.serve(o.id);
    this.fx(840, 380, `+${pay} coins`, '#8a6a3c');
    this.toast(!done ? `One ${o.recipe!.name} served, ${o.qty - o.servedCups} more for table ${o.table + 1}` : outcome === 'delighted' ? `Delighted! They loved the ${o.recipe!.name}` : 'Served! Your customers are happy', true);
    const g = this.$('trayIn-' + i) as SVGGElement;
    g.style.animation = 'cupFly .8s ease-in forwards';
    b.tray[i] = null;
    setTimeout(() => { g.style.animation = ''; this.draw(); }, 820);
    b.sel = b.tray.findIndex(x => x);
    this.onFirstServe?.();
    if (!this.orders().length && b.steep === null && !this.cutting) setTimeout(() => this.close(), 1100);
  }

  close() { clearInterval(this.timer); cancelAnimationFrame(this.raf); this.el.remove(); this.onClose?.(); }
}

/** Le coffret de thé de Leila (scène d'ouverture) : petite lettre posée sur le comptoir. */
export function leilaLetter() {
  return `<g class="popin"><g transform="translate(1380 300) rotate(-4)">
    <rect x="-150" y="-70" width="300" height="150" rx="6" fill="#fffaf2" ${L(2)}/>
    <path d="M-150 -70 L0 10 L150 -70" fill="none" stroke="#f0c9cf" stroke-width="2"/>
    <text x="0" y="-30" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-weight="700" font-size="16" fill="#6e4a3e">Dear old friend,</text>
    <text x="0" y="-6" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="13" fill="#8a5a4a">Here are my tea notes, as promised.</text>
    <text x="0" y="14" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="13" fill="#8a5a4a">Tea is patience in a cup ♡</text>
    <text x="70" y="50" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-weight="700" font-size="14" fill="#c0506a">Leila, Tunis</text>
    ${sparkle(-130, -80, 8)}</g></g>`;
}
