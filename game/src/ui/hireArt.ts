// Niveau 6 : dessins — accessoires des candidats (sur le dessin de client) et la chambre du héros le soir
import { P, customer, sparkle, moka } from '../art/cast.js';
import { DRAW } from './dom';
import type { Candidate } from '../logic/hiring';

const ink = (w = 2.2) => `stroke="${P.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
/** Couleur des cheveux de chaque dessin de client (mêmes palettes que cast.js). */
const HAIR = { f: ['#3e3446', '#2b2433', '#c97a44', '#5b4450'], m: ['#5b4450', '#8a5242', '#2b2433', '#c9a27e'] };

/** L'accessoire qui rend chaque candidat reconnaissable, dans le repère 200 × 260 du dessin. */
export function candidateExtra(c: Candidate) {
  const hair = HAIR[c.g][c.v % 4];
  switch (c.look) {
    case 'glasses': return `<g><circle cx="84" cy="103" r="11" fill="#fff" fill-opacity=".18" ${ink()}/><circle cx="116" cy="103" r="11" fill="#fff" fill-opacity=".18" ${ink()}/>
      <path d="M95 102 Q100 99 105 102 M73 100 L62 96 M127 100 L138 96" fill="none" ${ink()}/></g>`;
    case 'beanie': return `<g><path d="M58 82 Q56 30 100 28 Q144 30 142 82Z" fill="#e8823a" ${ink()}/><rect x="54" y="72" width="92" height="16" rx="7" fill="#c96a2a" ${ink()}/>
      <path d="M70 76 L70 84 M82 75 L82 85 M94 75 L94 85 M106 75 L106 85 M118 75 L118 85 M130 76 L130 84" stroke="#e8a26a" stroke-width="2"/><circle cx="100" cy="26" r="9" fill="#fffaf2" ${ink(2)}/></g>`;
    case 'bun': return `<g><circle cx="100" cy="34" r="17" fill="${hair}" ${ink()}/><path d="M86 46 Q100 54 114 46" fill="none" stroke="#f2a2b4" stroke-width="6" stroke-linecap="round"/><path d="M90 26 Q98 22 106 26" fill="none" stroke="#fff" stroke-width="2.4" opacity=".3"/></g>`;
    case 'mustache': return `<g><path d="M86 114 Q93 108 100 113 Q107 108 114 114 Q107 119 100 115 Q93 119 86 114Z" fill="${hair}" ${ink(1.6)}/>
      <path d="M72 88 L90 85 M110 85 L128 88" stroke="${hair}" stroke-width="5" stroke-linecap="round"/></g>`;
    case 'headband': return `<g><path d="M58 76 Q100 50 142 76" fill="none" stroke="${P.ink}" stroke-width="11" stroke-linecap="round"/><path d="M58 76 Q100 50 142 76" fill="none" stroke="#e86a5f" stroke-width="7" stroke-linecap="round"/>
      ${[70, 86, 100, 114, 130].map((x, i) => `<circle cx="${x}" cy="${[70, 63, 61, 63, 70][i]}" r="1.8" fill="#fffaf2"/>`).join('')}
      <path d="M136 72 q12 -10 16 2 q-10 6 -16 -2z M136 72 q4 14 -8 12 q0 -10 8 -12z" fill="#e86a5f" ${ink(1.6)}/></g>`;
    case 'earring': return `<g><circle cx="60" cy="113" r="3.2" fill="${P.gold}" ${ink(1.4)}/><path d="M84 112 q2 2 4 0 M112 112 q2 2 4 0" stroke="${P.ink}" stroke-width="1.4" fill="none"/>
      <path d="M118 52 q10 -10 18 -4 q-6 2 -8 8z" fill="${hair}" ${ink(1.6)}/></g>`;
  }
}
/** Le candidat en entier (svg autonome). */
export function candidateSvg(c: Candidate, state = 'idle', viewBox = '0 0 200 260', attrs = '') {
  return `<svg viewBox="${viewBox}" data-state="${state}" ${attrs} overflow="visible">${customer(c.g, c.v)}${candidateExtra(c)}</svg>`;
}
/** Portrait (tête et épaules) pour la boîte de dialogue et les cartes. */
export const candidatePortrait = (c: Candidate, state = 'idle') => candidateSvg(c, state, '35 20 130 130');
/** Le tablier du café avec le badge à son nom (premier jour). */
export const apron = (name: string) => `<g><path d="M86 136 L80 126 M114 136 L120 126" stroke="#5a3a2e" stroke-width="3" stroke-linecap="round"/>
  <path d="M86 138 L114 138 L116 170 L84 170Z" fill="#8a5a3e" stroke="${P.ink}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M78 168 L122 168 L126 214 Q100 221 74 214Z" fill="#8a5a3e" stroke="${P.ink}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M80 176 L120 176" stroke="#6e4a3e" stroke-width="2"/><rect x="90" y="186" width="20" height="14" rx="2" fill="#6e4a3e" stroke="${P.ink}" stroke-width="1.4"/>
  <rect x="89" y="145" width="22" height="9" rx="2" fill="${P.gold}" stroke="${P.ink}" stroke-width="1.2"/><text x="100" y="152" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="5.5" fill="#6e4a3e">${name.toUpperCase()}</text></g>`;
/** Le candidat pour la salle (accessoire, et le tablier une fois embauché). `svg` : le dessin complet. */
export const member = (c: Candidate, withApron = false) => {
  const extra = candidateExtra(c) + (withApron ? apron(c.name) : '');
  return { g: c.g, v: c.v, extra, svg: `${customer(c.g, c.v)}${extra}` };
};

/** La chambre du héros, le soir : lit, Moka endormie, bureau et ordinateur portable, fenêtre au coucher du soleil. */
export function bedroom(hero: 'm' | 'f', heroVars: string) {
  return `<svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d82c8"/><stop offset=".55" stop-color="#f2a7a0"/><stop offset="1" stop-color="#ffd59a"/></linearGradient>
      <radialGradient id="lampGlow"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".8"/><stop offset="1" stop-color="#ffe6a8" stop-opacity="0"/></radialGradient>
      <pattern id="wallDots" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#f6e6d6"/><circle cx="20" cy="20" r="2" fill="#efd6c2"/></pattern>
    </defs>
    <rect x="-400" y="-200" width="2400" height="860" fill="url(#wallDots)"/>
    <rect x="-400" y="640" width="2400" height="500" fill="#c99a6e"/>${[0, 1, 2, 3, 4, 5].map(k => `<path d="M-400 ${680 + k * 46} L2000 ${680 + k * 46}" stroke="#b5875c" stroke-width="2"/>`).join('')}
    <path d="M-400 640 L2000 640" stroke="#a8743f" stroke-width="4"/>
    <!-- guirlande lumineuse -->
    <path d="M120 70 Q500 140 880 70 Q1200 130 1520 70" fill="none" stroke="#6e5040" stroke-width="2"/>
    ${[180, 300, 420, 540, 660, 780, 980, 1100, 1220, 1340, 1460].map((x, i) => `<circle cx="${x}" cy="${i < 6 ? 70 + Math.sin((x - 120) / 760 * Math.PI) * 52 : 70 + Math.sin((x - 880) / 640 * Math.PI) * 44}" r="8" fill="${['#ffd27a', '#f6a5bd', '#9cd0e8'][i % 3]}" style="animation:shine 2.4s ${i * .2}s infinite;transform-box:fill-box;transform-origin:center"/>`).join('')}
    <!-- fenêtre au coucher du soleil -->
    <rect x="930" y="150" width="380" height="330" rx="14" fill="url(#dusk)" ${ink(4)}/>
    <circle cx="1180" cy="380" r="46" fill="#ffd27a" opacity=".9"/>
    <path d="M930 420 L980 420 L980 380 L1030 380 L1030 400 L1080 400 L1080 360 L1130 360 L1130 410 L1200 410 L1200 390 L1250 390 L1250 370 L1310 370 L1310 480 L930 480Z" fill="#6e5a8c" opacity=".85"/>
    ${[[1000, 395], [1050, 410], [1100, 375], [1225, 400]].map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="10" fill="#ffe6a8"/>`).join('')}
    <path d="M1120 150 L1120 480 M930 315 L1310 315" stroke="${P.ink}" stroke-width="5"/>
    <path d="M900 130 Q960 300 920 500 L880 500 L880 130Z" fill="#f2a2b4" ${ink()}/><path d="M1340 130 Q1280 300 1320 500 L1360 500 L1360 130Z" fill="#f2a2b4" ${ink()}/>
    <rect x="870" y="122" width="500" height="14" rx="7" fill="#a8743f" ${ink()}/>
    ${sparkle(980, 190, 9, '#fffaf2')}${sparkle(1260, 210, 7, '#fffaf2')}
    <!-- tableau de liège : photos du café, de Grand-mère, de Moka -->
    <rect x="520" y="170" width="300" height="210" rx="8" fill="#d9a46e" ${ink(3)}/>
    ${([[540, 190, -6, '#9cd0e8'], [640, 200, 4, '#f6a5bd'], [730, 186, -3, '#c5e0a8'], [560, 290, 5, '#ffd27a'], [680, 290, -5, '#c7a6e6']] as [number, number, number, string][]).map(([x, y, a, c]) => `<g transform="rotate(${a} ${x + 40} ${y + 35})"><rect x="${x}" y="${y}" width="80" height="70" fill="#fffaf2" ${ink(1.6)}/><rect x="${x + 6}" y="${y + 6}" width="68" height="46" fill="${c}"/><circle cx="${x + 40}" cy="${y - 2}" r="4" fill="#e86a5f"/></g>`).join('')}
    <!-- le lit, et Moka qui dort dessus -->
    <rect x="60" y="440" width="40" height="300" rx="10" fill="#a8743f" ${ink(3)}/>
    <path d="M90 560 L520 560 L520 700 L90 700Z" fill="#fffaf2" ${ink(3)}/>
    <path d="M90 560 Q300 520 520 560 L520 640 Q300 680 90 640Z" fill="#f2a2b4" ${ink(3)}/>
    ${[[160, 600], [260, 590], [360, 600], [460, 590], [210, 630], [410, 630]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fffaf2" opacity=".8"/>`).join('')}
    <path d="M110 500 Q110 470 150 470 L250 470 Q280 470 280 500 L280 540 Q200 556 110 540Z" fill="#fffaf2" ${ink(3)}/>
    <rect x="96" y="700" width="20" height="40" fill="#a8743f" ${ink(2)}/><rect x="496" y="700" width="20" height="40" fill="#a8743f" ${ink(2)}/>
    <svg x="300" y="430" width="180" height="234" viewBox="0 0 200 260" data-state="sleep" overflow="visible">${moka()}</svg>
    <!-- bureau, lampe, mug, ordinateur portable -->
    <ellipse cx="1360" cy="470" rx="220" ry="160" fill="url(#lampGlow)"/>
    <rect x="1040" y="580" width="480" height="22" rx="6" fill="#c99a6e" ${ink(3)}/>
    <rect x="1060" y="600" width="22" height="160" fill="#a8743f" ${ink(2)}/><rect x="1478" y="600" width="22" height="160" fill="#a8743f" ${ink(2)}/>
    <rect x="1380" y="600" width="110" height="80" rx="6" fill="#d7aa7c" ${ink(2)}/><circle cx="1435" cy="640" r="5" fill="${P.gold}"/>
    <g class="hit" data-act="laptop" id="laptop"><g class="lift">
      <path d="M1180 580 L1200 470 L1370 470 L1350 580Z" fill="#dfe3e8" ${ink(3)}/>
      <path d="M1192 570 L1208 482 L1360 482 L1344 570Z" fill="#cfe9f6" id="laptopScreen"/>
      <rect x="1220" y="500" width="100" height="12" rx="4" fill="#fffaf2"/><rect x="1220" y="520" width="80" height="8" rx="4" fill="#fffaf2" opacity=".8"/><rect x="1220" y="536" width="90" height="8" rx="4" fill="#fffaf2" opacity=".8"/>
      <path d="M1160 580 L1380 580 L1392 592 L1148 592Z" fill="#b8bec8" ${ink(2.4)}/>
      <g class="bounce"><circle cx="1275" cy="440" r="18" fill="#e86a5f" ${ink(2)}/><text x="1275" y="447" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="20" fill="#fffaf2">!</text></g>
    </g></g>
    <path d="M1440 580 L1450 520 L1500 520 L1510 580Z" fill="#7fa8d8" ${ink(2.4)}/><path d="M1460 520 Q1475 470 1500 470 L1500 520" fill="none" ${ink(2.4)}/>
    <path d="M1480 470 L1430 400 M1430 400 L1400 430 L1460 430Z" fill="#f2d27a" ${ink(2.4)}/>
    <path d="M1100 580 L1100 548 Q1100 540 1108 540 L1132 540 Q1140 540 1140 548 L1140 580Z" fill="#fffaf2" ${ink(2)}/><path d="M1140 552 q12 2 8 16" fill="none" ${ink(2)}/>
    <g style="animation:steam 2.2s infinite"><path d="M1112 532 q-5 -9 0 -18 M1126 532 q-5 -9 0 -18" fill="none" stroke="#fffaf2" stroke-width="3" stroke-linecap="round"/></g>
    <!-- plante et livres -->
    <path d="M1540 760 L1550 690 L1610 690 L1620 760Z" fill="#d9886e" ${ink(2.4)}/>${[[1560, 650, -40], [1580, 630, 0], [1600, 650, 40], [1570, 670, -70], [1595, 672, 70]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="10" fill="#7fb06e" ${ink(1.6)} transform="rotate(${a - 60} ${x} ${y})"/>`).join('')}
    <svg x="760" y="420" width="240" height="312" viewBox="0 0 200 260" data-state="city" style="${heroVars}" overflow="visible">${DRAW[hero === 'f' ? 'heroF' : 'heroM']()}</svg>
  </svg>`;
}
