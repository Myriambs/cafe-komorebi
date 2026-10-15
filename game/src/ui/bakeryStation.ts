// Boulangerie (niveau 4) : choisir une fiche de la boîte de Grand-mère, mettre la pâte dans le bol, fouetter,
// façonner sur la planche, cuire (sortir le four dans la zone dorée), garnir, puis ranger dans la vitrine et servir.
import { P, sparkle } from '../art/cast.js';
import { L, TXT, ticketArt } from './stationArt.js';
import { music } from '../audio/music';
import { h, ui } from './dom';
import { recipeById } from '../logic/recipes';
import {
  PASTRIES, DOUGH, TOPPINGS, DOUGH_NAME, TOPPING_NAME, SHAPE_NAME, STIRS, GOLDEN, pastryById, cannotAddDough, doughReady, bakeResult, heatAfter,
  type Dough, type Topping, type Shape
} from '../logic/bakery';
import type { Room, Cust } from './room';
import { openHomeRecipe } from './recipeCard';

const NS = 'http://www.w3.org/2000/svg';
type Stage = 'empty' | 'mix' | 'dough' | 'shaped' | 'oven' | 'baked' | 'topped';
/** Plan de travail : on garde tout quand on retourne en salle (le four se met en pause). */
export interface BakeBench { card: string; bowl: Dough[]; stirs: number; stage: Stage; heat: number; display: (string | null)[]; sel: number; baked: number }
export const newBakeBench = (): BakeBench => ({ card: 'croissant', bowl: [], stirs: 0, stage: 'empty', heat: 0, display: [null, null, null], sel: -1, baked: 0 });

/* ---------- dessins des viennoiseries (centrées sur 0,0, ~64 px de large) ---------- */
type Look = 'raw' | 'golden' | 'burnt';
const CRUST: Record<Look, [string, string]> = { raw: ['#f6e3bd', '#e3c896'], golden: ['#e8a24a', '#c47a2c'], burnt: ['#5e4034', '#3e2a22'] };
const SHAPE_OF: Record<string, Shape> = Object.fromEntries(PASTRIES.map(p => [p.id, p.shape]));
const ink = (w = 1.8) => `stroke="${P.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
function shapeArt(shape: Shape, look: Look, topped: boolean) {
  const [c, d] = CRUST[look];
  switch (shape) {
    case 'fold': return `<path d="M-32 8 Q-36 -4 -24 -8 Q-14 -22 0 -22 Q14 -22 24 -8 Q36 -4 32 8 Q22 4 14 10 Q0 4 -14 10 Q-22 4 -32 8Z" fill="${c}" ${ink()}/>
      <path d="M-14 -18 Q-8 -6 -14 8 M0 -22 Q4 -8 0 6 M14 -18 Q8 -6 14 8" fill="none" stroke="${d}" stroke-width="2.4" stroke-linecap="round"/>
      ${topped ? `<path d="M-22 -9 Q-10 -20 6 -19" fill="none" stroke="#fff3c4" stroke-width="3.5" stroke-linecap="round" opacity=".85"/><circle cx="16" cy="-14" r="2" fill="#fff3c4"/>` : ''}`;
    case 'dome': return `<path d="M-28 8 Q-30 -24 0 -24 Q30 -24 28 8Z" fill="${c}" ${ink()}/>
      <path d="M-18 -16 L8 8 M-4 -23 L22 2 M-26 -2 L-16 8 M18 -18 L-6 8 M4 -23 L-20 4 M25 -6 L14 8" stroke="${d}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M-30 8 L30 8" ${ink(2)}/>
      ${topped ? [[-16, -10], [-4, -18], [10, -14], [18, -2], [-20, 2], [2, -4], [-10, 0], [12, 4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fffaf2" stroke="#d9c7a8" stroke-width=".6"/>`).join('') : ''}`;
    case 'swirl': return `<g transform="scale(1 .82)"><circle r="25" fill="${c}" ${ink()}/>
      <path d="M0 0 m-3 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0 a19 19 0 0 1 9 -16" fill="none" stroke="${d}" stroke-width="2.6" stroke-linecap="round"/>
      ${topped ? `<path d="M-20 -6 L-12 6 L-4 -8 L4 8 L12 -6 L20 4" fill="none" stroke="#fffaf2" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}</g>`;
    case 'layer': return `<path d="M-28 -12 Q-28 -18 -22 -18 L22 -18 Q28 -18 28 -12 L28 10 L-28 10Z" fill="${c}" ${ink()}/>
      <path d="M-28 -3 L28 -3" stroke="${look === 'raw' ? '#fff6dc' : '#fffaf2'}" stroke-width="5"/><path d="M-28 10 L28 10" ${ink(2)}/>
      ${topped ? `<path d="M-28 -16 Q-21 -24 -14 -18 Q-7 -25 0 -18 Q7 -25 14 -18 Q21 -24 28 -16 L28 -12 L-28 -12Z" fill="#fffaf2" ${ink(1.4)}/>
        ${[-14, 0, 14].map(x => `<path d="M${x} -16 Q${x - 7} -24 ${x - 4} -30 Q${x} -34 ${x + 4} -30 Q${x + 7} -24 ${x} -16Z" fill="#e8445a" ${ink(1.3)}/><path d="M${x - 4} -30 L${x} -27 L${x + 4} -30" fill="none" stroke="#6fae6a" stroke-width="2.2" stroke-linecap="round"/>`).join('')}` : ''}`;
  }
}
/** Une viennoiserie (fiche `id`) centrée en (x, y). */
export function pastryArt(id: string, x: number, y: number, s = 1, look: Look = 'golden', topped = true) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${shapeArt(SHAPE_OF[id] ?? 'fold', look, topped)}</g>`;
}

/* ---------- ingrédients ---------- */
const DOUGH_ART: Record<Dough, (x: number) => string> = {
  flour: x => `<path d="M${x - 40} 552 L${x - 46} 470 Q${x - 40} 440 ${x - 24} 446 L${x + 24} 446 Q${x + 40} 440 ${x + 46} 470 L${x + 40} 552Z" fill="#f3ead8" ${L(2)}/>
    <path d="M${x - 24} 446 Q${x} 432 ${x + 24} 446" fill="none" ${L(2)}/><ellipse cx="${x}" cy="446" rx="22" ry="5" fill="#fffaf2"/>
    <rect x="${x - 26}" y="486" width="52" height="30" rx="4" fill="#fdf1dd" ${L(1.2)}/>${TXT(x, 506, 'FLOUR', 11, 'middle', '#8a6a3c', 900)}`,
  butter: x => `<rect x="${x - 44}" y="526" width="88" height="26" rx="6" fill="#dfe3e8" ${L(2)}/><path d="M${x - 30} 526 L${x - 30} 496 L${x + 30} 496 L${x + 30} 526Z" fill="#fbe7a0" ${L(2)}/>
    <path d="M${x - 30} 496 L${x - 22} 488 L${x + 38} 488 L${x + 30} 496Z" fill="#fff2bd" ${L(1.6)}/><path d="M${x + 30} 526 L${x + 38} 518 L${x + 38} 488" fill="#e8d07a" ${L(1.6)}/>`,
  sugar: x => `<path d="M${x - 34} 552 L${x - 34} 476 Q${x - 34} 462 ${x - 20} 462 L${x + 20} 462 Q${x + 34} 462 ${x + 34} 476 L${x + 34} 552Z" fill="#eef7fa" fill-opacity=".9" ${L(2)}/>
    <path d="M${x - 30} 492 L${x + 30} 492 L${x + 30} 548 L${x - 30} 548Z" fill="#fffaf2"/>${[[-14, 506], [8, 516], [-4, 530], [16, 534], [-18, 538]].map(([dx, y]) => `<rect x="${x + dx}" y="${y}" width="7" height="7" rx="1.5" fill="#f0e8dc" stroke="#d6cbbb" stroke-width=".8"/>`).join('')}
    <rect x="${x - 26}" y="450" width="52" height="14" rx="4" fill="#e8a2b4" ${L(1.6)}/>`,
  egg: x => `<path d="M${x - 48} 552 L${x - 44} 520 L${x + 44} 520 L${x + 48} 552Z" fill="#c9a27e" ${L(2)}/>
    ${[-26, 0, 26].map(dx => `<ellipse cx="${x + dx}" cy="508" rx="12" ry="16" fill="#fff6e6" ${L(1.6)}/>`).join('')}
    <path d="M${x - 44} 520 L${x + 44} 520" ${L(2)}/>`
};
const TOP_ART: Record<Topping, (x: number) => string> = {
  glaze: x => `<path d="M${x - 30} 856 L${x - 30} 794 Q${x - 30} 780 ${x - 16} 780 L${x + 16} 780 Q${x + 30} 780 ${x + 30} 794 L${x + 30} 856Z" fill="#f2b84a" fill-opacity=".9" ${L(2)}/>
    <rect x="${x - 34}" y="768" width="68" height="14" rx="5" fill="#c99a6e" ${L(1.6)}/><path d="M${x + 18} 768 L${x + 34} 738" stroke="#a8743f" stroke-width="5" stroke-linecap="round"/>`,
  pearl: x => `<path d="M${x - 28} 856 L${x - 28} 790 Q${x - 28} 778 ${x - 16} 778 L${x + 16} 778 Q${x + 28} 778 ${x + 28} 790 L${x + 28} 856Z" fill="#eef7fa" fill-opacity=".9" ${L(2)}/>
    ${[[-14, 800], [6, 806], [-4, 822], [14, 828], [-16, 838], [4, 842]].map(([dx, y]) => `<circle cx="${x + dx}" cy="${y}" r="4" fill="#fffaf2" stroke="#cfc4b4" stroke-width="1"/>`).join('')}
    <rect x="${x - 22}" y="766" width="44" height="14" rx="4" fill="#7fa8d8" ${L(1.6)}/>`,
  icing: x => `<path d="M${x - 26} 770 L${x + 26} 770 L${x + 4} 846 L${x - 4} 846Z" fill="#fffaf2" ${L(2)}/><path d="M${x - 4} 846 L${x} 858 L${x + 4} 846" fill="#dfe3e8" ${L(1.6)}/>
    <path d="M${x - 26} 770 Q${x} 756 ${x + 26} 770" fill="#f2a2b4" ${L(1.6)}/><path d="M${x - 14} 790 l10 6 l10 -6" fill="none" stroke="#f2a2b4" stroke-width="2.4" stroke-linecap="round"/>`,
  strawberry: x => `<path d="M${x - 40} 856 L${x - 36} 822 L${x + 36} 822 L${x + 40} 856Z" fill="#fffaf2" ${L(2)}/>
    ${[[-20, 810], [0, 804], [20, 810], [-10, 790], [10, 792]].map(([dx, y]) => `<path d="M${x + dx} ${y + 14} Q${x + dx - 11} ${y + 2} ${x + dx - 7} ${y - 8} Q${x + dx} ${y - 13} ${x + dx + 7} ${y - 8} Q${x + dx + 11} ${y + 2} ${x + dx} ${y + 14}Z" fill="#e8445a" ${L(1.4)}/><path d="M${x + dx - 6} ${y - 8} L${x + dx} ${y - 4} L${x + dx + 6} ${y - 8}" fill="none" stroke="#6fae6a" stroke-width="3" stroke-linecap="round"/>`).join('')}`
};
const DOUGH_X: Record<Dough, number> = { flour: 100, butter: 230, sugar: 360, egg: 490 };
const TOP_X: Record<Topping, number> = { glaze: 85, pearl: 237, icing: 389, strawberry: 541 };
const BOWL = { x: 680, y: 552 }, BOARD = { x: 920, y: 552 }, OVEN = { x: 1300, y: 552 };
const CASE_X = [900, 1040, 1180];

function label(x: number, y: number, t: string) { return `<g><rect x="${x - t.length * 4.6 - 16}" y="${y - 15}" width="${t.length * 9.2 + 32}" height="28" rx="14" fill="#fffaf2" ${L(1.5)}/>${TXT(x, y + 5, t, 14)}</g>`; }

/** La fiche d'une recette, écrite à la main par Grand-mère. */
function cardArt(id: string, i: number, on: boolean) {
  const p = pastryById(id), r = recipeById(id);
  const x = 20 + (i % 2) * 262, y = 86 + Math.floor(i / 2) * 164;
  return `<g class="hit" data-act="card" data-id="${id}"><g class="lift">
    <rect x="${x}" y="${y}" width="250" height="152" rx="10" fill="${on ? '#fff4d6' : '#fffaf2'}" stroke="${on ? '#e8823a' : P.ink}" stroke-width="${on ? 4 : 2}"/>
    ${[0, 1, 2, 3].map(k => `<path d="M${x + 12} ${y + 64 + k * 22} L${x + 238} ${y + 64 + k * 22}" stroke="#f0c9cf" stroke-width="1"/>`).join('')}
    <path d="M${x + 36} ${y} L${x + 36} ${y + 152}" stroke="#f2a2b4" stroke-width="1.2" opacity=".7"/>
    ${pastryArt(id, x + 208, y + 36, .62)}
    <text x="${x + 46}" y="${y + 34}" font-family="Fraunces,serif" font-style="italic" font-weight="700" font-size="21" fill="#6e4a3e">${r.name}</text>
    <text x="${x + 46}" y="${y + 60}" font-family="Fraunces,serif" font-style="italic" font-size="14" fill="#8a5a4a">1. ${p.dough.map(k => DOUGH_NAME[k]).join(' + ')}</text>
    <text x="${x + 46}" y="${y + 82}" font-family="Fraunces,serif" font-style="italic" font-size="14" fill="#8a5a4a">2. Stir · ${SHAPE_NAME[p.shape]}</text>
    <text x="${x + 46}" y="${y + 104}" font-family="Fraunces,serif" font-style="italic" font-size="14" fill="#8a5a4a">3. Bake until golden</text>
    <text x="${x + 46}" y="${y + 126}" font-family="Fraunces,serif" font-style="italic" font-size="14" fill="#8a5a4a">4. ${TOPPING_NAME[p.topping]} on top</text>
    <text x="${x + 18}" y="${y + 144}" font-family="Fraunces,serif" font-size="11" fill="#c0666a">♡</text>
  </g></g>
  <g class="hit" data-act="howto" data-id="${id}"><g class="lift"><circle cx="${x + 226}" cy="${y + 128}" r="16" fill="#fdf1dd" stroke="#c47a2c" stroke-width="2.2"/><text x="${x + 226}" y="${y + 134}" text-anchor="middle" font-size="16">📖</text></g></g>`;
}

function scene() {
  const tiles: string[] = [];
  for (let y = -300; y < 560; y += 40) for (let x = -500 + ((y / 40) % 2 ? 40 : 0); x < 2100; x += 80) tiles.push(`<rect x="${x}" y="${y}" width="78" height="38" rx="3" fill="#f7eadb" stroke="#ead6bd" stroke-width="2"/>`);
  return `
  <rect x="-500" y="-300" width="2600" height="860" fill="#efdcc6"/>${tiles.join('')}
  <g transform="translate(270 22)"><rect width="190" height="44" rx="22" fill="#c47a2c"/><text x="95" y="29" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="21" fill="#fffaf2">🥐 Bakery</text></g>
  <!-- étagère : bocaux, pain, petit pot de fleurs -->
  <rect x="1060" y="150" width="400" height="12" rx="4" fill="#a8743f" ${L(2)}/>
  ${[1080, 1150].map((x, i) => `<path d="M${x} 150 L${x} 106 Q${x} 96 ${x + 10} 96 L${x + 46} 96 Q${x + 56} 96 ${x + 56} 106 L${x + 56} 150Z" fill="#eef7fa" fill-opacity=".85" ${L(2)}/><rect x="${x + 4}" y="118" width="48" height="30" fill="${['#f3ead8', '#c97d2e'][i]}" opacity=".9"/>`).join('')}
  <path d="M1236 150 Q1236 120 1270 118 Q1320 116 1330 140 L1330 150Z" fill="#e8a24a" ${L(2)}/><path d="M1256 126 l10 18 M1280 120 l8 22 M1304 124 l6 18" stroke="#c47a2c" stroke-width="3" stroke-linecap="round"/>
  <path d="M1370 150 L1376 124 L1416 124 L1422 150Z" fill="#d9886e" ${L(2)}/>${[[1384, 114], [1398, 106], [1410, 116]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#f2a2b4" ${L(1.2)}/>`).join('')}
  <rect x="-500" y="560" width="2600" height="210" fill="#e3c08a"/><path d="M-500 560 L2100 560" stroke="#b08850" stroke-width="3"/>
  <rect x="-500" y="770" width="2600" height="430" fill="#9c6a48"/><path d="M-500 770 L2100 770" stroke="#7a4e36" stroke-width="3"/>
  <!-- boîte à recettes de Grand-mère -->
  <g id="cards"></g>
  <!-- pâte : farine, beurre, sucre, œufs -->
  ${DOUGH.map(d => `<g class="hit" data-act="dough" data-k="${d}" id="b-${d}"><g class="lift">${DOUGH_ART[d](DOUGH_X[d])}${label(DOUGH_X[d], 598, DOUGH_NAME[d])}</g></g>`).join('')}
  <!-- le bol -->
  <g class="hit" data-act="bowl" id="b-bowl"><g class="lift"><g id="bowlBody">
    <path d="M${BOWL.x - 74} 478 Q${BOWL.x - 70} 552 ${BOWL.x} 552 Q${BOWL.x + 70} 552 ${BOWL.x + 74} 478Z" fill="#a9d8c8" ${L(2.5)}/>
    <ellipse cx="${BOWL.x}" cy="478" rx="74" ry="16" fill="#cfeee2" ${L(2.5)}/><g id="bowlIn"></g>
    <path d="M${BOWL.x - 56} 498 Q${BOWL.x - 50} 530 ${BOWL.x - 30} 540" fill="none" stroke="#d3f0e6" stroke-width="5" stroke-linecap="round"/>
    <g id="whisk"><path d="M${BOWL.x + 40} 470 L${BOWL.x + 70} 404" stroke="#a8743f" stroke-width="7" stroke-linecap="round"/><path d="M${BOWL.x + 40} 470 q-14 -6 -6 -24 q14 0 6 24 M${BOWL.x + 40} 470 q-4 -16 10 -24" fill="none" stroke="#b8bec8" stroke-width="2.4"/></g>
  </g><g id="bowlLbl">${label(BOWL.x, 598, 'Mix · tap to stir')}</g></g></g>
  <!-- la planche à pâtisserie et le rouleau -->
  <g class="hit" data-act="board" id="b-board"><g class="lift">
    <path d="M${BOARD.x - 96} 520 L${BOARD.x + 96} 520 L${BOARD.x + 110} 552 L${BOARD.x - 110} 552Z" fill="#d7aa7c" ${L(2)}/>
    <ellipse cx="${BOARD.x - 40}" cy="530" rx="22" ry="4" fill="#fffaf2" opacity=".7"/>
    <g transform="rotate(-8 ${BOARD.x + 50} 500)"><rect x="${BOARD.x + 6}" y="492" width="88" height="16" rx="8" fill="#e3b77a" ${L(1.8)}/><rect x="${BOARD.x - 10}" y="497" width="18" height="6" rx="3" fill="#a8743f"/><rect x="${BOARD.x + 92}" y="497" width="18" height="6" rx="3" fill="#a8743f"/></g>
    <g id="boardIn"></g>
  <g id="boardLbl">${label(BOARD.x, 598, 'Shape')}</g></g></g>
  <!-- le four -->
  <g class="hit" data-act="oven" id="b-oven"><g class="lift">
    <path d="M${OVEN.x - 140} 552 L${OVEN.x - 140} 250 Q${OVEN.x - 140} 222 ${OVEN.x - 112} 222 L${OVEN.x + 112} 222 Q${OVEN.x + 140} 222 ${OVEN.x + 140} 250 L${OVEN.x + 140} 552Z" fill="#f2e6cf" ${L(2.5)}/>
    <rect x="${OVEN.x - 140}" y="222" width="280" height="60" rx="24" fill="#e86a5f" ${L(2.5)}/><rect x="${OVEN.x - 140}" y="262" width="280" height="20" fill="#e86a5f"/>
    ${[-90, -40, 40, 90].map(dx => `<circle cx="${OVEN.x + dx}" cy="252" r="13" fill="#fffaf2" ${L(1.8)}/><path d="M${OVEN.x + dx} 252 L${OVEN.x + dx + 6} 244" ${L(2)}/>`).join('')}
    <rect x="${OVEN.x - 22}" y="240" width="44" height="24" rx="5" fill="#3b3640"/><text id="ovenTemp" x="${OVEN.x}" y="257" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="12" fill="#9cf0b0">180°</text>
    <path d="M${OVEN.x - 112} 300 L${OVEN.x + 112} 300 L${OVEN.x + 112} 500 L${OVEN.x - 112} 500Z" fill="#c9915e" ${L(2.5)}/>
    <rect id="ovenWin" x="${OVEN.x - 92}" y="330" width="184" height="134" rx="14" fill="#4a3430" ${L(2)}/>
    <rect id="ovenGlow" x="${OVEN.x - 92}" y="330" width="184" height="134" rx="14" fill="#ffb05a" opacity="0"/>
    <path d="M${OVEN.x - 84} 442 L${OVEN.x + 84} 442" stroke="#8a8a92" stroke-width="3"/>
    <g id="ovenIn"></g>
    <path d="M${OVEN.x - 80} 340 L${OVEN.x - 50} 340" stroke="#fff" stroke-width="4" opacity=".35" stroke-linecap="round"/>
    <rect x="${OVEN.x - 70}" y="310" width="140" height="10" rx="5" fill="#dfe3e8" ${L(1.6)}/>
    <rect x="${OVEN.x - 124}" y="516" width="248" height="22" rx="6" fill="#d7c4a6" ${L(1.6)}/>
    <g id="ovenNote"></g>
  <g id="ovenLbl">${label(OVEN.x, 598, 'Oven')}</g></g></g>
  <!-- jauge de cuisson -->
  <g id="gauge" opacity=".35">
    <rect x="${OVEN.x - 130}" y="176" width="260" height="26" rx="13" fill="#f6e3bd" ${L(2)}/>
    <rect x="${OVEN.x - 130 + 260 * GOLDEN.from}" y="176" width="${260 * (GOLDEN.to - GOLDEN.from)}" height="26" fill="#f2b84a"/>
    <path d="M${OVEN.x - 130 + 260 * GOLDEN.to} 176 L${OVEN.x + 117} 176 Q${OVEN.x + 130} 176 ${OVEN.x + 130} 189 Q${OVEN.x + 130} 202 ${OVEN.x + 117} 202 L${OVEN.x - 130 + 260 * GOLDEN.to} 202Z" fill="#6b4a3a"/>
    <rect x="${OVEN.x - 130}" y="176" width="260" height="26" rx="13" fill="none" ${L(2)}/>
    ${TXT(OVEN.x - 130 + 260 * GOLDEN.from / 2, 194, 'pale', 12, 'middle', '#8a6a3c')}${TXT(OVEN.x - 130 + 260 * (GOLDEN.from + GOLDEN.to) / 2, 194, 'golden ✨', 12, 'middle', '#6e4a1e')}${TXT(OVEN.x - 130 + 260 * (GOLDEN.to + 1) / 2, 194, 'burnt', 12, 'middle', '#fdf1dd')}
    <g id="needle"><path d="M0 168 L0 210" stroke="${P.ink}" stroke-width="4" stroke-linecap="round"/><path d="M-7 164 L7 164 L0 174Z" fill="${P.ink}"/></g>
  </g>
  <!-- garnitures -->
  ${TOPPINGS.map(t => `<g class="hit" data-act="top" data-k="${t}" id="b-${t}"><g class="lift">${TOP_ART[t](TOP_X[t])}${label(TOP_X[t], 884, TOPPING_NAME[t])}</g></g>`).join('')}
  <g class="hit" data-act="trash" id="b-trash"><g class="lift"><rect x="652" y="776" width="96" height="80" rx="10" fill="#6b5a52" ${L(2)}/><rect x="644" y="766" width="112" height="16" rx="6" fill="#5a4a44" ${L(1.8)}/>${label(700, 884, 'Throw away')}</g></g>
  <!-- la vitrine -->
  <path d="M${CASE_X[0] - 90} 856 L${CASE_X[0] - 90} 712 Q${CASE_X[0] - 90} 690 ${CASE_X[0] - 68} 690 L${CASE_X[2] + 68} 690 Q${CASE_X[2] + 90} 690 ${CASE_X[2] + 90} 712 L${CASE_X[2] + 90} 856Z" fill="#eef7fa" fill-opacity=".55" ${L(2.5)}/>
  <rect x="${CASE_X[0] - 96}" y="846" width="${CASE_X[2] - CASE_X[0] + 192}" height="20" rx="6" fill="#a8743f" ${L(2)}/>
  ${CASE_X.map((x, i) => `<g class="hit" data-act="case" data-i="${i}"><ellipse id="case-${i}" cx="${x}" cy="826" rx="56" ry="14" fill="#fffaf2" ${L(2)}/></g><g id="caseIn-${i}" pointer-events="none"></g>`).join('')}
  <path d="M${CASE_X[0] - 70} 708 L${CASE_X[0] - 60} 836" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>
  ${TXT(CASE_X[1], 712, 'Display case', 14, 'middle', '#6e5040')}
  <g class="hit" data-act="bell" id="b-bell"><g class="lift"><ellipse cx="1420" cy="836" rx="64" ry="14" fill="#3b3640"/><path d="M1372 830 Q1372 772 1420 772 Q1468 772 1468 830Z" fill="#f2d27a" ${L(2)}/><rect x="1412" y="756" width="16" height="16" rx="4" fill="#e3c06e" ${L(1.6)}/>${label(1420, 884, 'Ring to serve')}</g></g>`;
}

export class BakeryStation {
  el: HTMLElement;
  private timer: number;
  private raf = 0;
  private last = 0;
  private stirring = false;
  private dinged = false;
  onClose?: () => void;
  onFirstServe?: () => void;
  onBaked?: (id: string) => void;

  /** `story` : la cuisine pour la scène d'ouverture, sans commandes ni bouton retour. */
  constructor(private room: Room | null, private bench: BakeBench, hint?: string, private story = false) {
    this.el = h(`<div class="screen" style="background:#9c6a48"><svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style="overflow:visible;background:transparent">
      <g class="art">${scene()}</g>
      ${story ? '' : `<g class="hit" data-act="close"><g class="lift"><rect x="18" y="18" width="230" height="50" rx="25" fill="#fdf5e8" stroke="${P.ink}" stroke-width="2.5"/>${TXT(133, 50, '← Back to the room', 17)}</g></g>
      <rect x="1238" y="18" width="344" height="50" rx="25" fill="#fdf5e8" stroke="${P.ink}" stroke-width="2.5"/><text id="bcoins" x="1410" y="50" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="18" fill="${P.ink}"></text>`}
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
  private get pastry() { return pastryById(this.bench.card); }
  private orders(): Cust[] { return this.room ? this.room.ordered().filter(c => c.recipe?.kind === 'pastry') : []; }

  /* ---------- dessin ---------- */
  private draw() {
    const b = this.bench, p = this.pastry;
    this.$('cards').innerHTML = `<rect x="10" y="78" width="534" height="342" rx="16" fill="#c9915e" fill-opacity=".35"/>${PASTRIES.map((q, i) => cardArt(q.id, i, q.id === b.card)).join('')}
      ${TXT(277, 438, "Grandma's recipe tin ♡ tap a card · 📖 real recipe", 14, 'middle', '#6e4a3e')}`;
    // le bol : petits tas d'ingrédients, puis une boule de pâte lisse
    const pile: Record<Dough, string> = {
      flour: `<ellipse cx="${BOWL.x - 30}" cy="476" rx="22" ry="8" fill="#fffaf2" ${L(1.2)}/>`,
      butter: `<rect x="${BOWL.x - 6}" y="466" width="22" height="14" rx="3" fill="#fbe7a0" ${L(1.2)}/>`,
      sugar: `<ellipse cx="${BOWL.x + 30}" cy="478" rx="16" ry="6" fill="#f0e8dc" ${L(1.2)}/>`,
      egg: `<ellipse cx="${BOWL.x + 8}" cy="482" rx="13" ry="7" fill="#fffaf2" ${L(1.2)}/><circle cx="${BOWL.x + 8}" cy="481" r="5" fill="#f6c23a"/>`
    };
    this.$('bowlIn').innerHTML = b.stage === 'mix' ? `<g class="popin">${b.bowl.map(k => pile[k]).join('')}${b.stirs ? `<ellipse cx="${BOWL.x}" cy="478" rx="${30 + b.stirs * 10}" ry="9" fill="#f6e3bd" opacity="${0.4 + b.stirs * 0.15}"/>` : ''}</g>`
      : b.stage === 'dough' ? `<g class="popin"><ellipse cx="${BOWL.x}" cy="470" rx="38" ry="18" fill="#f6e3bd" ${L(1.8)}/><path d="M${BOWL.x - 16} 462 q10 -6 22 -2" fill="none" stroke="#fffaf2" stroke-width="3" stroke-linecap="round"/></g>` : '';
    const bowlLbl = b.stage === 'mix' && doughReady(b.bowl, p) ? `Stir! (${b.stirs}/${STIRS})` : b.stage === 'dough' ? 'Dough ready ✓' : 'Mix · tap to stir';
    this.$('bowlLbl').innerHTML = label(BOWL.x, 598, bowlLbl);
    // la planche : forme crue, puis viennoiserie dorée qui attend sa garniture
    this.$('boardIn').innerHTML = b.stage === 'shaped' ? `<g class="popin">${pastryArt(b.card, BOARD.x - 46, 506, 1, 'raw', false)}</g>`
      : b.stage === 'baked' ? `<g class="popin">${pastryArt(b.card, BOARD.x - 46, 506, 1, 'golden', false)}<g style="animation:steam 2s infinite">${[-20, 0, 20].map(dx => `<path d="M${BOARD.x - 46 + dx} 470 q-6 -10 0 -20 q6 -10 0 -20" fill="none" stroke="#fffaf2" stroke-width="3" stroke-linecap="round" opacity=".7"/>`).join('')}</g></g>`
      : b.stage === 'topped' ? `<g class="popin">${pastryArt(b.card, BOARD.x - 46, 506, 1, 'golden', true)}</g>` : '';
    const boardLbl = b.stage === 'dough' ? SHAPE_NAME[p.shape] : b.stage === 'shaped' ? 'Into the oven →' : b.stage === 'baked' ? `Add ${TOPPING_NAME[p.topping].toLowerCase()}` : 'Shape';
    this.$('boardLbl').innerHTML = label(BOARD.x, 598, boardLbl);
    this.drawOven();
    CASE_X.forEach((x, i) => {
      const id = b.display[i];
      this.$('caseIn-' + i).innerHTML = id ? `<g class="popin">${pastryArt(id, x, 812, 1)}</g>` : '';
      this.$('case-' + i).setAttribute('stroke-width', i === b.sel ? '4' : '2');
      this.$('case-' + i).setAttribute('stroke', i === b.sel ? '#e8823a' : '#7a5a4a');
    });
    this.render();
  }
  private drawOven() {
    const b = this.bench, on = b.stage === 'oven';
    const look: Look = bakeResult(b.heat) === 'burnt' ? 'burnt' : b.heat > 0.25 ? 'golden' : 'raw';
    this.$('ovenIn').innerHTML = on ? pastryArt(b.card, OVEN.x, 426, 1.1, b.heat < GOLDEN.from && b.heat < 0.25 ? 'raw' : look, false) : '';
    this.$('ovenGlow').setAttribute('opacity', on ? String(0.35 + 0.25 * Math.sin(performance.now() / 300) ** 2) : '0');
    this.$('gauge').setAttribute('opacity', on ? '1' : '.35');
    this.$('needle').setAttribute('transform', `translate(${OVEN.x - 130 + 260 * (on ? b.heat : 0)} 0)`);
    const lbl = on ? (bakeResult(b.heat) === 'golden' ? 'Take it out now! ✨' : 'Baking… wait for golden') : 'Oven';
    const cur = this.$('ovenLbl'); if (cur.dataset.t !== lbl) { cur.innerHTML = label(OVEN.x, 598, lbl); cur.dataset.t = lbl; }
  }
  private renderTickets() {
    if (this.story) { this.$('tickets').innerHTML = ''; return; }
    this.$('tickets').innerHTML = this.orders().slice(0, 3).map((c, i) => { const rem = c.qty - c.servedCups; return ticketArt({ id: c.id, recipe: { name: (rem > 1 ? `${rem} × ` : '') + c.recipe!.name, price: c.recipe!.price, need: [] }, who: [`Table ${c.table + 1}`, String(c.table + 1), ''], patience: c.patience }, i); }).join('')
      || TXT(840, 130, 'No pastry orders: take orders in the room', 20, 'middle', '#8a6a5a', 700);
  }
  render() {
    if (this.room && !this.story) this.$('bcoins').textContent = `Coins ${Math.round(this.room.coins * 100) / 100} · ${this.room.served} / ${this.room.o.goal} happy`;
    this.renderTickets();
  }
  private fx(x: number, y: number, text: string, color = '#6e5040') {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="fx" style="transform-box:fill-box">${TXT(x, y, text, 22, 'middle', color)}</g>`;
    this.$('fx').appendChild(g); setTimeout(() => g.remove(), 1300);
  }
  toast(text: string, good: boolean) {
    this.$('toast').innerHTML = `<g class="popin"><rect x="560" y="300" width="560" height="46" rx="23" fill="${good ? '#eaf4ec' : '#fbe9e4'}" stroke="${P.ink}" stroke-width="2.5"/>${TXT(840, 330, text, 15)}</g>`;
    clearTimeout((this as any).tt); (this as any).tt = setTimeout(() => this.$('toast').innerHTML = '', 2600);
  }
  showHint(text: string | null) {
    this.$('hintBox').innerHTML = text ? `<g class="popin"><rect x="560" y="200" width="560" height="92" rx="18" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.5"/>
      <foreignObject x="570" y="206" width="540" height="80"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 15px/1.35 Nunito,sans-serif;color:#3b2838;padding:6px 10px"><b>Grandma:</b> ${text}</div></foreignObject></g>` : '';
  }
  /** Dessin libre par-dessus la cuisine (scène d'ouverture : le petit mot de la Crumb Crew). */
  extra(html: string) { this.$('extraArt').innerHTML = html; }

  /* ---------- le four tourne ---------- */
  private loop(t: number) {
    const dt = Math.min(0.1, (t - (this.last || t)) / 1000); this.last = t;
    const b = this.bench;
    if (b.stage === 'oven') {
      b.heat = heatAfter(b.heat, dt, this.pastry);
      if (!this.dinged && bakeResult(b.heat) === 'golden') { this.dinged = true; music.sfx('twinkle'); this.fx(OVEN.x, 300, 'ding! ✨', '#c47a2c'); }
      if (b.heat >= 1) this.burn();
      this.drawOven();
    }
    this.raf = requestAnimationFrame(this.loop);
  }
  private burn() {
    const b = this.bench;
    b.stage = 'empty'; b.heat = 0; b.bowl = []; b.stirs = 0; this.dinged = false;
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = [0, 1, 2, 3, 4].map(k => `<circle cx="${OVEN.x - 60 + k * 30}" cy="${330 - (k % 2) * 20}" r="${22 + (k % 3) * 6}" fill="#7a6a66" opacity=".7" style="animation:smoke 1.6s ${k * 0.12}s ease-out forwards;transform-box:fill-box;transform-origin:center"/>`).join('');
    this.$('fx').appendChild(g); setTimeout(() => g.remove(), 2200);
    this.toast('Oh no, burnt! (Moka, from the room: "Hmph. I smell smoke.") Try again!', false);
    this.draw();
  }

  /* ---------- clics ---------- */
  private click(e: Event) {
    const el = (e.target as Element).closest('[data-act]') as SVGElement | null;
    if (!el) return;
    if (el.dataset.act === 'howto') return openHomeRecipe(el.dataset.id!);
    if (this.story) return;
    const a = el.dataset.act!, b = this.bench, p = this.pastry;
    if (a === 'close') return this.close();
    if (a === 'card') {
      const id = el.dataset.id!;
      if (id !== b.card && b.stage !== 'empty' && b.stage !== 'topped') return this.toast('Finish this pastry first, or throw it away', false);
      b.card = id; this.fx(277, 470, `${recipeById(id).name} card`);
    } else if (a === 'dough') {
      const d = el.dataset.k as Dough;
      if (b.stage !== 'empty' && b.stage !== 'mix') return this.toast(b.stage === 'dough' ? 'The dough is ready: tap the board to shape it' : 'Finish the pastry on the board first', false);
      const why = cannotAddDough(b.bowl, d, p); if (why) return this.toast(why, false);
      b.bowl.push(d); b.stage = 'mix'; music.sfx('pour'); this.fx(BOWL.x, 420, `+ ${DOUGH_NAME[d]}`);
      if (doughReady(b.bowl, p)) this.toast('Everything is in! Tap the bowl to stir', true);
    } else if (a === 'bowl') {
      if (b.stage !== 'mix') return this.toast(b.stage === 'empty' ? `Put the ingredients from the card in the bowl first` : 'The dough is ready: tap the board', false);
      if (!doughReady(b.bowl, p)) return this.toast(`Still missing: ${p.dough.filter(k => !b.bowl.includes(k)).map(k => DOUGH_NAME[k]).join(' + ')}`, false);
      if (this.stirring) return;
      this.stirring = true; music.sfx('grind');
      const w = this.$('whisk'); w.classList.add('stir');
      setTimeout(() => {
        w.classList.remove('stir'); this.stirring = false;
        b.stirs++; if (b.stirs >= STIRS) { b.stage = 'dough'; this.fx(BOWL.x, 420, 'Smooth dough ♡', '#c47a2c'); }
        this.draw();
      }, 520);
    } else if (a === 'board') {
      if (b.stage === 'dough') {
        b.stage = 'shaped'; b.bowl = []; b.stirs = 0; music.sfx('sweep'); this.fx(BOARD.x, 440, SHAPE_NAME[p.shape] + '!');
        const r = this.$('boardIn'); r.classList.add('shake'); setTimeout(() => r.classList.remove('shake'), 500);
      } else if (b.stage === 'shaped') return this.toast('Now tap the oven to bake it', false);
      else if (b.stage === 'baked') return this.toast(`Add the ${TOPPING_NAME[p.topping].toLowerCase()} (bottom left)`, false);
      else return this.toast('Make the dough in the bowl first', false);
    } else if (a === 'oven') {
      if (b.stage === 'shaped') { b.stage = 'oven'; b.heat = 0; this.dinged = false; music.sfx('pour'); this.fx(OVEN.x, 300, 'Into the oven!'); }
      else if (b.stage === 'oven') {
        const res = bakeResult(b.heat);
        if (res === 'pale') return this.toast('Still pale… wait until the needle is in the golden zone', false);
        if (res === 'burnt') return this.burn();
        b.stage = 'baked'; b.heat = 0; music.sfx('bell'); this.fx(OVEN.x, 300, 'Golden! ✨', '#c47a2c');
      } else return this.toast(b.stage === 'baked' ? 'Already baked: add the topping' : 'Shape a pastry on the board first', false);
    } else if (a === 'top') {
      const t = el.dataset.k as Topping;
      if (b.stage !== 'baked') return this.toast('Toppings go on a freshly baked pastry', false);
      if (t !== p.topping) return this.toast(`Grandma's card says: ${TOPPING_NAME[p.topping]} on top`, false);
      b.stage = 'topped'; music.sfx('twinkle'); b.baked++; this.onBaked?.(b.card);
      const i = b.display.indexOf(null);
      if (i < 0) { this.toast('The display case is full: serve or throw away a pastry', false); }
      else {
        setTimeout(() => {
          if (b.stage !== 'topped') return;
          b.display[i] = b.card; b.stage = 'empty'; b.sel = i;
          this.fx(CASE_X[i], 760, 'In the display case ♡', '#c47a2c'); this.draw();
        }, 700);
      }
    } else if (a === 'case') {
      const i = +el.dataset.i!;
      if (b.display[i]) b.sel = i;
      else if (b.stage === 'topped') { b.display[i] = b.card; b.stage = 'empty'; b.sel = i; }
    } else if (a === 'trash') {
      if (b.sel >= 0 && b.display[b.sel] && (b.stage === 'empty')) { b.display[b.sel] = null; b.sel = b.display.findIndex(x => x); }
      else if (b.stage !== 'empty') { b.stage = 'empty'; b.bowl = []; b.stirs = 0; b.heat = 0; }
      else return;
      this.toast('Thrown away', true);
    } else if (a === 'bell') {
      music.sfx('bell');
      const fits = (i: number) => !!b.display[i] && this.orders().some(o => o.recipe!.id === b.display[i]);
      if (!fits(b.sel)) { const k = b.display.findIndex((_, i) => fits(i)); if (k >= 0) b.sel = k; }
      const id = b.display[b.sel];
      if (!id) return this.toast('Bake a pastry and put it in the display case first', false);
      const o = this.orders().find(x => x.recipe!.id === id);
      if (!o) return this.toast(`No customer ordered a ${recipeById(id).name}: check the tickets`, false);
      this.serveTo(o, b.sel);
    } else if (a === 'serve') {
      const o = this.orders().find(x => x.id === +el.dataset.id!);
      const i = o ? b.display.findIndex(x => x === o.recipe!.id) : -1;
      if (!o) return;
      if (i < 0) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 700); return this.toast(`Bake a ${o.recipe!.name} first: tap its card`, false); }
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
    const g = this.$('caseIn-' + i) as SVGGElement;
    g.style.animation = 'cupFly .8s ease-in forwards';
    b.display[i] = null;
    setTimeout(() => { g.style.animation = ''; this.draw(); }, 820);
    b.sel = b.display.findIndex(x => x);
    this.onFirstServe?.();
    if (!this.orders().length && b.stage === 'empty') setTimeout(() => this.close(), 1100);
  }

  close() { clearInterval(this.timer); cancelAnimationFrame(this.raf); this.el.remove(); this.onClose?.(); }
}

/** Le petit mot de la Crumb Crew épinglé sur la porte du four, avec des empreintes de pattes dans la farine. */
export function crewNote() {
  return `<g class="popin">
    ${[[790, 548], [818, 540], [846, 550], [1050, 548], [1078, 540], [1106, 550], [1136, 542]].map(([x, y], k) => `<g transform="translate(${x} ${y}) rotate(${k % 2 ? 20 : -15})" opacity=".55">${[[0, 0, 4], [-5, -6, 2], [0, -8, 2], [5, -6, 2]].map(([dx, dy, r]) => `<circle cx="${dx}" cy="${dy}" r="${r}" fill="#fffaf2"/>`).join('')}</g>`).join('')}
    <g transform="translate(1340 352) rotate(6)"><rect x="-40" y="-26" width="80" height="54" rx="3" fill="#fffaf2" ${L(1.6)}/>
      <circle cx="0" cy="-24" r="4" fill="#e86a5f" ${L(1)}/>
      <text x="0" y="-6" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="9" fill="#6e4a3e">The oven works now!</text>
      <text x="0" y="7" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="9" fill="#6e4a3e">Thank you for the feast</text>
      <text x="16" y="21" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-weight="700" font-size="9" fill="#c0506a">— C.C. 🥐</text></g>
    <g transform="translate(1466 552) rotate(-70)"><path d="M0 0 L0 -40" stroke="#a8743f" stroke-width="3" stroke-linecap="round"/><path d="M-7 0 L7 0 L9 12 L-9 12Z" fill="#e3c06e" ${L(1.2)}/></g>
    ${sparkle(1300, 330, 9)}${sparkle(1392, 380, 7)}
  </g>`;
}
