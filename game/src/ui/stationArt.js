// Station café — redessinée d'après interior/station.jpg : mur de carreaux crème, grande machine crème,
// moulin orange, étagères (caramel, matcha, fruits), mini-frigo menthe, sonnette de service.
import { P, heart, catLogo } from '../art/cast.js';
export const OPTS = { caramel: false, cardamom: false, chocolate: false };

const LN = '#7a5a4a';
const L = (w = 2) => `stroke="${LN}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const TXT = (x, y, t, s = 16, a = 'middle', c = P.ink, w = 800) => `<text x="${x}" y="${y}" text-anchor="${a}" font-family="Nunito,sans-serif" font-weight="${w}" font-size="${s}" fill="${c}">${t}</text>`;
const fmt = n => (Math.round(n * 100) / 100).toString();
const ING = { espresso: { name: 'Espresso' }, water: { name: 'Hot water' }, milk: { name: 'Milk' }, foam: { name: 'Foam' }, caramel: { name: 'Caramel' }, cardamom: { name: 'Cardamom' }, chocolate: { name: 'Chocolate' }, orange: { name: 'Orange' }, apple: { name: 'Apple' }, lemon: { name: 'Lemon' }, berry: { name: 'Berries' }, mint: { name: 'Mint' }, ice: { name: 'Ice' }, honey: { name: 'Honey' }, soda: { name: 'Sparkling water' } };
export const SLOTS = [520, 800, 1080];

const label = (x, y, t) => `<g class="lbl"><rect x="${x - t.length * 4.6 - 16}" y="${y - 15}" width="${t.length * 9.2 + 32}" height="28" rx="14" fill="#fffaf2" ${L(1.5)}/>${TXT(x, y + 5, t, 14)}</g>`;
const badge = (x, y, id) => `<g class="lbl"><circle cx="${x}" cy="${y}" r="17" fill="${P.ink}"/><text id="cnt-${id}" x="${x}" y="${y + 6}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="#fdf5e8">0</text></g>`;
const lock = (x, y) => `<g><circle cx="${x}" cy="${y}" r="13" fill="${P.ink}"/><rect x="${x - 6}" y="${y - 2}" width="12" height="9" rx="2" fill="#fdf5e8"/><path d="M${x - 4} ${y - 2} Q${x - 4} ${y - 10} ${x} ${y - 10} Q${x + 4} ${y - 10} ${x + 4} ${y - 2}" fill="none" stroke="#fdf5e8" stroke-width="2.2"/></g>`;
const soon = (x, y, t) => `<g class="lbl"><rect x="${x - t.length * 3.6 - 10}" y="${y - 12}" width="${t.length * 7.2 + 20}" height="22" rx="11" fill="#efe1c6" ${L(1.2)}/>${TXT(x, y + 4, t, 11.5, 'middle', '#8a6a5a', 700)}</g>`;

/* ---------- Mur, comptoir, étagères, notes ---------- */
function decor() {
  const grid = [];
  for (let x = -500; x <= 2100; x += 56) grid.push(`<path d="M${x} -300 L${x} 560" stroke="#e4d2b2" stroke-width="2"/>`);
  for (let y = -300; y <= 560; y += 56) grid.push(`<path d="M-500 ${y} L2100 ${y}" stroke="#e4d2b2" stroke-width="2"/>`);
  return `
  <rect x="-500" y="-300" width="2600" height="860" fill="#f7ead2"/>${grid.join('')}
  <g class="lbl" transform="translate(270 22)"><rect width="150" height="44" rx="22" fill="#5a3a2e"/><text x="75" y="29" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="21" fill="#fdf1dd">☕ Café</text></g>
  <rect x="-500" y="560" width="2600" height="210" fill="#d9a35f"/>
  <path d="M-500 560 L2100 560" stroke="#a0683a" stroke-width="3"/><path d="M-500 566 L2100 566" stroke="#e9bd7f" stroke-width="3" opacity=".7"/>
  <rect x="-500" y="770" width="2600" height="430" fill="#b3723a"/><path d="M-500 770 L2100 770" stroke="#8a5530" stroke-width="3"/>
  <rect x="-500" y="790" width="2600" height="14" fill="#9c6232" opacity=".5"/>
  <!-- notes épinglées -->
  <g transform="rotate(-3 90 70)"><rect x="40" y="26" width="110" height="120" rx="6" fill="#d7a97a" ${L(2)}/><rect x="52" y="40" width="86" height="94" rx="3" fill="#fdf1dd"/>
    <g class="lbl">${TXT(95, 62, 'NOTES', 14, 'middle', '#6e5040')}</g>${[78, 94, 110].map(y => `<path d="M62 ${y} L128 ${y}" ${L(1.2)} opacity=".5"/>`).join('')}<circle cx="95" cy="32" r="5" fill="${P.coral}" ${L(1.2)}/></g>
  <!-- étagère gauche : matcha (bientôt) ; les bocaux de cardamome et de chocolat sont dans machines() -->
  <rect x="200" y="196" width="320" height="14" rx="4" fill="#a8743f" ${L(2)}/>
  <rect x="236" y="132" width="50" height="64" rx="8" fill="#5b5a62" ${L(2)}/><rect x="242" y="150" width="38" height="22" rx="3" fill="#c9d9a8"/><g class="lbl">${TXT(261, 166, 'MATCHA', 9, 'middle', '#4a5a3a')}</g>
  ${soon(261, 232, 'Matcha · soon')}
  `;
}

/* ---------- Bocal d'épices sur l'étagère de gauche ---------- */
function jar(id, x, name, glass, inside) {
  const on = OPTS[id];
  return `<g ${on ? `class="hit" data-act="${id}" id="m-${id}"` : 'class="off"'}><g class="lift">
    <path d="M${x - 32} 196 L${x - 32} 140 Q${x - 32} 128 ${x - 20} 128 L${x + 20} 128 Q${x + 32} 128 ${x + 32} 140 L${x + 32} 196Z" fill="${glass}" fill-opacity=".9" ${L(2)}/>
    <g transform="translate(${x} 168)">${inside}</g>
    <path d="M${x - 24} 134 L${x - 24} 186" stroke="#ffffff" stroke-width="4" opacity=".6" stroke-linecap="round"/>
    <rect x="${x - 28}" y="116" width="56" height="14" rx="4" fill="#c99a6e" ${L(1.8)}/><rect x="${x - 22}" y="110" width="44" height="8" rx="3" fill="#a8784e" ${L(1.4)}/>
    <rect x="${x - 26}" y="172" width="52" height="18" rx="4" fill="#fdf1dd" ${L(1.2)}/><g class="lbl">${TXT(x, 185, name, 10.5, 'middle', '#6e4a3e')}</g>
    ${on ? '' : lock(x, 150)}
  </g>${on ? badge(x + 34, 120, id) : ''}</g>`;
}

/* ---------- Appareils cliquables ---------- */
function machines() {
  return `
  <!-- moulin à café : on moud les grains avant chaque espresso -->
  <g class="hit" data-act="grind" id="m-grind"><g class="lift" id="grinderBody">
    <path d="M90 150 Q90 140 104 140 L226 140 Q240 140 240 150 L236 168 L94 168Z" fill="#7d6a62" ${L(2)}/>
    <path d="M98 168 L232 168 L218 290 L112 290Z" fill="#fff" fill-opacity=".55" ${L(2)}/>
    ${Array.from({ length: 22 }, (_, i) => `<ellipse cx="${122 + (i * 37) % 92}" cy="${236 + (i * 13) % 46}" rx="9" ry="6" fill="#5a3424" transform="rotate(${i * 31} ${122 + (i * 37) % 92} ${236 + (i * 13) % 46})"/>`).join('')}
    <rect x="96" y="290" width="138" height="200" rx="18" fill="#e8896a" ${L(2.5)}/>
    <rect x="128" y="312" width="74" height="30" rx="6" fill="#4a3a3a" ${L(1.5)}/><g class="lbl">${TXT(165, 334, '10.9', 17, 'middle', '#f7ead2')}</g>
    <circle cx="165" cy="372" r="15" fill="#c96a52" ${L(2)}/><path d="M126 410 L204 410 L196 470 L134 470Z" fill="#c96a52" opacity=".6"/>
    <rect x="84" y="488" width="162" height="76" rx="12" fill="#d77a5e" ${L(2.5)}/>
    ${label(165, 598, 'Grind beans')}
  </g>${badge(78, 166, 'espresso')}</g>
  <!-- bouilloire col de cygne : eau chaude -->
  <g class="hit" data-act="water" id="m-water"><g class="lift">
    <path d="M296 560 Q284 470 340 456 Q396 446 410 500 Q420 544 400 560Z" fill="#cfd6dc" ${L(2.5)}/>
    <path d="M318 456 L320 438 Q352 426 384 438 L386 456" fill="#3d3a4a" ${L(2)}/>
    <path d="M300 520 Q262 516 262 470 Q262 430 236 420" fill="none" stroke="${LN}" stroke-width="12" stroke-linecap="round"/><path d="M300 520 Q262 516 262 470 Q262 430 236 420" fill="none" stroke="#cfd6dc" stroke-width="7" stroke-linecap="round"/>
    <path d="M404 480 Q440 486 432 528 Q426 552 404 554" fill="none" stroke="${LN}" stroke-width="11" stroke-linecap="round"/><path d="M404 480 Q440 486 432 528 Q426 552 404 554" fill="none" stroke="#3d3a4a" stroke-width="6" stroke-linecap="round"/>
    <circle cx="352" cy="512" r="18" fill="#fff" ${L(1.5)}/><path d="M352 498 Q364 512 359 520 Q354 528 348 525 Q340 520 345 509Z" fill="#e8705f"/>
    ${label(348, 598, 'Hot water')}
  </g></g>
  <!-- grande machine à espresso vert sauge (rétro) -->
  <g class="hit" data-act="espresso" id="m-espresso"><g class="lift">
    ${[640, 720].map(x => `<path d="M${x} 270 L${x - 2} 222 Q${x + 34} 206 ${x + 70} 222 L${x + 68} 270Z" fill="#fffaf2" ${L(2)}/><path d="M${x + 68} 236 q20 2 14 22 q-4 10 -14 10" fill="none" ${L(2)}/>`).join('')}
    <!-- rail chauffe-tasses chromé -->
    <path d="M572 270 L572 248 M1028 270 L1028 248 M572 248 L1028 248" fill="none" stroke="${LN}" stroke-width="7" stroke-linecap="round"/><path d="M572 270 L572 248 M1028 270 L1028 248 M572 248 L1028 248" fill="none" stroke="#e6eaee" stroke-width="3.5" stroke-linecap="round"/>
    <!-- corps supérieur laqué -->
    <path d="M560 300 Q560 270 596 270 L1004 270 Q1040 270 1040 300 L1040 440 L560 440Z" fill="#a9c8b2" ${L(2.5)}/>
    <path d="M572 296 Q574 282 596 282 L1004 282 Q1026 282 1028 296" fill="none" stroke="#d3e6d8" stroke-width="5" stroke-linecap="round" opacity=".9"/>
    <path d="M1010 290 L1010 436 L1040 436 L1040 300 Q1040 280 1020 274Z" fill="#8fb39a" opacity=".7"/>
    <rect x="600" y="296" width="400" height="104" rx="18" fill="#e3e7ec" ${L(2)}/><rect x="610" y="304" width="380" height="88" rx="14" fill="#f3f5f7" ${L(1)}/>
    <!-- corps inférieur, grille d'égouttage, pieds -->
    <rect x="590" y="440" width="420" height="140" rx="12" fill="#a9c8b2" ${L(2.5)}/><path d="M600 450 L600 570" stroke="#d3e6d8" stroke-width="4" stroke-linecap="round" opacity=".8"/>
    <rect x="652" y="520" width="296" height="12" rx="4" fill="#e3e7ec" ${L(1.5)}/>
    <rect x="636" y="548" width="328" height="30" rx="6" fill="#d7dce2" ${L(2)}/>${Array.from({ length: 13 }, (_, i) => `<path d="M${654 + i * 24} 554 L${654 + i * 24} 572" stroke="#9aa1ab" stroke-width="3" stroke-linecap="round"/>`).join('')}
    <rect x="604" y="578" width="40" height="10" rx="4" fill="#3b3640" ${L(1.2)}/><rect x="956" y="578" width="40" height="10" rx="4" fill="#3b3640" ${L(1.2)}/>
    ${catLogo(800, 498, 9)}
    <!-- manomètre central -->
    <circle cx="800" cy="346" r="38" fill="#c9ced6" ${L(2)}/><circle cx="800" cy="346" r="31" fill="#fffaf2" ${L(1.5)}/>
    ${Array.from({ length: 11 }, (_, i) => { const a = (-220 + i * 26) * Math.PI / 180; return `<path d="M${800 + Math.cos(a) * 24} ${346 + Math.sin(a) * 24} L${800 + Math.cos(a) * 28} ${346 + Math.sin(a) * 28}" stroke="${LN}" stroke-width="${i % 5 ? 1.2 : 2.2}"/>`; }).join('')}
    <path d="M${800 + Math.cos(-0.3) * 26} ${346 + Math.sin(-0.3) * 26} A26 26 0 0 1 ${800 + Math.cos(0.75) * 26} ${346 + Math.sin(0.75) * 26}" fill="none" stroke="#e86a5f" stroke-width="3"/>
    <path d="M800 346 L818 330" stroke="#e86a5f" stroke-width="3" stroke-linecap="round"/><circle cx="800" cy="346" r="4" fill="${LN}"/>
    <!-- cadrans et interrupteurs -->
    ${[680, 920].map(x => `<circle cx="${x}" cy="338" r="20" fill="#c9ced6" ${L(1.8)}/><circle cx="${x}" cy="338" r="15" fill="#fffaf2" ${L(1.2)}/><path d="M${x} 338 L${x - 8} 329" stroke="${LN}" stroke-width="2" stroke-linecap="round"/>`).join('')}
    ${[650, 710, 890, 950].map((x, i) => `<rect x="${x - 7}" y="368" width="14" height="16" rx="3" fill="#3b3640" ${L(1.2)}/><circle cx="${x}" cy="${i % 2 ? 372 : 380}" r="4" fill="${i % 2 ? '#e86a5f' : '#9cf0b0'}"/>`).join('')}
    <rect x="752" y="386" width="96" height="16" rx="8" fill="#e3c06e" ${L(1.5)}/>
    <text x="800" y="398" text-anchor="middle" font-family="Fraunces,serif" font-weight="700" font-size="11" letter-spacing="2" fill="#6e4a3e">KOMOREBI</text>
    <!-- bandeau chromé et groupe d'infusion -->
    <rect x="566" y="420" width="468" height="20" rx="6" fill="#e3e7ec" ${L(2)}/><path d="M574 426 L1026 426" stroke="#ffffff" stroke-width="3" opacity=".9"/>
    <path d="M766 440 L834 440 L826 404 L774 404Z" fill="#c9ced6" ${L(2)}/>
    <g id="ground" style="display:none"><g transform="translate(838 492)"><rect x="-6" y="-14" width="132" height="26" rx="13" fill="#fffaf2" ${L(1.5)}/>${TXT(60, 4, 'Ground coffee ✓', 13, 'middle', '#5a3424')}</g></g>
    <path d="M770 440 L830 440 L824 458 L776 458Z" fill="#9aa1ab" ${L(2)}/><g class="groundIn" style="display:none"><ellipse cx="800" cy="449" rx="22" ry="5" fill="#5a3424"/></g><path d="M786 458 L790 470 M814 458 L810 470" ${L(2.5)}/>
    <path d="M826 450 L900 462" stroke="${LN}" stroke-width="14" stroke-linecap="round"/><path d="M826 450 L900 462" stroke="#3b3640" stroke-width="9" stroke-linecap="round"/><path d="M864 454 L896 459" stroke="#6a5a62" stroke-width="2.5" stroke-linecap="round"/>
    <!-- buse vapeur (gauche) et robinet d'eau (droite) -->
    <circle cx="620" cy="452" r="10" fill="#c9ced6" ${L(1.8)}/><path d="M620 452 L612 520 Q608 546 628 552" fill="none" stroke="${LN}" stroke-width="9" stroke-linecap="round"/><path d="M620 452 L612 520 Q608 546 628 552" fill="none" stroke="#e3e7ec" stroke-width="5" stroke-linecap="round"/>
    <circle cx="980" cy="452" r="10" fill="#c9ced6" ${L(1.8)}/><path d="M980 452 L984 506" stroke="${LN}" stroke-width="9" stroke-linecap="round"/><path d="M980 452 L984 506" stroke="#e3e7ec" stroke-width="5" stroke-linecap="round"/>
    ${label(800, 622, 'Espresso')}
  </g></g>
  <!-- pichet à mousse de lait -->
  <g class="hit" data-act="foam" id="m-foam"><g class="lift">
    <path d="M1060 480 L1140 480 L1150 600 L1052 600Z" fill="#dfe4ea" ${L(2.5)}/><path d="M1060 480 L1048 468 L1078 474Z" fill="#dfe4ea" ${L(1.5)}/>
    <path d="M1140 494 Q1176 500 1170 540 Q1166 568 1146 572" fill="none" stroke="${LN}" stroke-width="10" stroke-linecap="round"/><path d="M1140 494 Q1176 500 1170 540 Q1166 568 1146 572" fill="none" stroke="#c4cad2" stroke-width="5" stroke-linecap="round"/>
    <path d="M1070 478 Q1072 452 1092 456 Q1100 438 1118 450 Q1136 446 1134 468 Q1140 478 1130 482 L1072 482Z" fill="#fff" ${L(1.8)}/>
    ${label(1100, 630, 'Foam')}
  </g></g>
  <!-- bocaux : cardamome (café arabe) et chocolat (moka, chocolat chaud) -->
  ${jar('cardamom', 340, 'Cardamom', '#e8f0d8', `${[[-12, -8], [0, -14], [12, -6], [-6, 4], [8, 6], [-14, 10], [2, 14], [14, 14]].map(([dx, dy], i) => `<ellipse cx="${dx}" cy="${dy}" rx="6" ry="3.6" fill="${i % 2 ? '#9cbf6a' : '#86ad58'}" stroke="#5f7d3e" stroke-width="1" transform="rotate(${i * 40} ${dx} ${dy})"/>`).join('')}`)}
  ${jar('chocolate', 440, 'Chocolate', '#f2e2d2', `${[[-12, -10], [4, -12], [-4, 0], [12, 2], [-12, 10], [6, 12]].map(([dx, dy]) => `<rect x="${dx - 6}" y="${dy - 5}" width="12" height="10" rx="2" fill="#6a3a24" stroke="#4a2414" stroke-width="1"/><path d="M${dx - 3} ${dy - 5} L${dx - 3} ${dy + 5} M${dx + 2} ${dy - 5} L${dx + 2} ${dy + 5}" stroke="#8a5234" stroke-width="1"/>`).join('')}`)}
  <!-- étagère droite : caramel + fruits (jus bientôt) -->
  <rect x="1100" y="236" width="360" height="14" rx="4" fill="#a8743f" ${L(2)}/>
  <g ${OPTS.caramel ? 'class="hit" data-act="caramel" id="m-caramel"' : 'class="off"'}><g class="lift">
    <path d="M1120 236 L1120 168 Q1120 156 1132 156 L1188 156 Q1200 156 1200 168 L1200 236Z" fill="#e7a74f" fill-opacity=".9" ${L(2)}/>
    <path d="M1116 156 Q1160 134 1204 156 L1196 146 Q1160 128 1124 146Z" fill="#d9b48a" ${L(1.8)}/><path d="M1124 150 L1196 150" stroke="#b57a3a" stroke-width="3"/>
    <rect x="1132" y="184" width="56" height="26" rx="5" fill="#fdf1dd" ${L(1.2)}/><g class="lbl">${TXT(1160, 202, 'Caramel', 11.5, 'middle', '#7a4e30')}</g>
    ${OPTS.caramel ? '' : lock(1160, 222)}
  </g>${OPTS.caramel ? badge(1204, 150, 'caramel') : ''}</g>
  <g class="off"><path d="M1226 236 L1236 196 L1316 196 L1326 236Z" fill="#c9a27e" ${L(2)}/>${[1246, 1268, 1290, 1308].map((x, i) => `<circle cx="${x}" cy="${190 - (i % 2) * 6}" r="11" fill="#e8586a" ${L(1.5)}/>`).join('')}
    <path d="M1338 236 L1348 196 L1428 196 L1438 236Z" fill="#c9a27e" ${L(2)}/>${[1358, 1380, 1402, 1420].map((x, i) => `<circle cx="${x}" cy="${190 - (i % 2) * 6}" r="11" fill="#9cc96f" ${L(1.5)}/>`).join('')}</g>
  ${soon(1330, 272, 'Fruit juices · coming soon')}
  <!-- mini-frigo menthe, porte ouverte : lait (et jus bientôt) -->
  <rect x="1200" y="320" width="230" height="250" rx="26" fill="#bfded2" ${L(2.5)}/>
  <rect x="1218" y="338" width="194" height="214" rx="16" fill="#eef6f2" ${L(2)}/>
  <rect x="1300" y="342" width="60" height="18" rx="5" fill="#9cc7b6" ${L(1.5)}/>
  <path d="M1226 470 L1404 470" ${L(2)}/><path d="M1226 476 L1404 476" ${L(1)} opacity=".4"/>
  <path d="M1430 334 Q1500 344 1508 360 L1508 560 Q1490 574 1430 566" fill="#d4ebe2" fill-opacity=".85" ${L(2.5)}/>
  <g class="off"><path d="M1240 470 L1240 400 Q1240 384 1256 380 L1256 366 L1276 366 L1276 380 Q1292 384 1292 400 L1292 470Z" fill="#f5b13a" ${L(2)}/><circle cx="1266" cy="430" r="11" fill="#f7d06a" ${L(1.2)}/></g>
  <g class="hit" data-act="milk" id="m-milk"><g class="lift">
    <path d="M1316 470 L1316 404 L1336 380 L1380 380 L1380 470Z" fill="#fffaf2" ${L(2)}/><path d="M1316 404 L1380 404" ${L(1.5)}/>
    <path d="M1336 380 L1346 368 L1380 368 L1380 380" fill="#e9eef3" ${L(1.5)}/><g class="lbl">${TXT(1348, 438, 'MILK', 14, 'middle', '#5b7a9a')}</g>
    <circle cx="1332" cy="456" r="6" fill="#f2d6d8"/><circle cx="1362" cy="452" r="5" fill="#f2d6d8"/>
  </g>${badge(1392, 378, 'milk')}</g>
  ${label(1315, 606, 'Milk')}`;
}

/* ---------- Devant du comptoir : tasses, emplacements, poubelle, sonnette, réserve ---------- */
function front() {
  return `
  <g class="hit" data-act="cup" id="m-cup"><g class="lift">
    ${[0, 1, 2, 3, 4].map(i => `<path d="M60 ${800 - i * 20} L160 ${800 - i * 20} L152 ${852 - i * 20} L68 ${852 - i * 20}Z" fill="#fffaf2" ${L(2)}/>`).join('')}
    ${label(110, 884, 'Take a cup')}
  </g>${badge(170, 700, 'cups')}</g>
  <g class="hit" data-act="trash" id="m-trash"><g class="lift">
    <rect x="212" y="762" width="132" height="92" rx="12" fill="#6e5a52" ${L(2.5)}/><rect x="222" y="752" width="112" height="18" rx="6" fill="#8a7268" ${L(2)}/>
    <path d="M240 772 L316 772" stroke="#4a3a3a" stroke-width="5" stroke-linecap="round"/>
    ${label(278, 884, 'Throw away')}
  </g></g>
  ${SLOTS.map((x, i) => `<g class="hit" data-act="slot" data-i="${i}">
    <rect id="slot-${i}" x="${x - 118}" y="796" width="236" height="56" rx="16" fill="${['#e8a07e', '#c9a27e', '#a9c4ae'][i]}" fill-opacity=".9" stroke="${LN}" stroke-width="2.5"/>
    <path d="M${x - 96} 812 L${x + 96} 812 M${x - 96} 824 L${x + 96} 824 M${x - 96} 836 L${x + 96} 836" ${L(1.2)} opacity=".35"/>
    <g id="cup-${i}"></g></g>`).join('')}
  <g class="hit" data-act="bell" id="m-bell"><g class="lift">
    <ellipse cx="1300" cy="836" rx="64" ry="16" fill="#4a3a3a" ${L(2)}/>
    <path d="M1252 830 Q1252 772 1300 770 Q1348 772 1348 830Z" fill="#f3d98f" ${L(2.5)}/><path d="M1270 790 Q1286 778 1300 778" fill="none" stroke="#fff6cf" stroke-width="4" stroke-linecap="round"/>
    <rect x="1292" y="756" width="16" height="16" rx="5" fill="#d9b860" ${L(2)}/>
    ${label(1300, 884, 'Ring to serve')}
  </g></g>
  <g class="hit" data-act="restock"><g class="lift">
    <path d="M1420 760 L1560 760 L1550 852 L1430 852Z" fill="#c99b6e" ${L(2.5)}/><path d="M1420 760 L1440 736 L1540 736 L1560 760" fill="#d7aa7c" ${L(2)}/>
    <g class="lbl">${TXT(1490, 810, 'Supplies', 15, 'middle', '#5a3a2e')}</g>
    ${label(1490, 884, 'Restock · 15c')}
  </g></g>`;
}

/* ---------- Une tasse posée sur son emplacement ---------- */
function cupArt(i, c) {
  if (!c) return '';
  const x = SLOTS[i], y = 760, has = k => c.includes(k);
  let liquid = '';
  if (has('espresso') || has('water') || has('milk')) {
    // sans café, chaque ingrédient garde sa vraie couleur : eau claire, lait blanc ; le café colore le tout
    const coffee = has('espresso');
    const col = coffee
      ? (has('milk') ? (has('chocolate') ? '#9a6444' : has('caramel') ? '#c98f5c' : has('cardamom') ? '#d2ac7e' : '#c99a6e') : has('water') ? (has('cardamom') ? '#b07a3c' : '#6b4028') : '#4a2a1c')
      : has('milk') ? (has('chocolate') ? '#8a5234' : '#fbf6ee') : '#d4ebf5';
    liquid = `<ellipse cx="${x}" cy="${y - 30}" rx="58" ry="16" fill="${col}"/>`;
    if (!coffee && !has('milk')) liquid += `<ellipse cx="${x}" cy="${y - 30}" rx="58" ry="16" fill="none" stroke="#a9d3e6" stroke-width="2.5"/><path d="M${x - 30} ${y - 33} q12 -5 24 0 M${x + 8} ${y - 27} q10 -4 20 0" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`;
    if (coffee && !has('milk')) liquid += `<ellipse cx="${x}" cy="${y - 30}" rx="52" ry="13" fill="none" stroke="#a0673e" stroke-width="4" opacity=".8"/>`;
    if (has('foam')) liquid += `<ellipse cx="${x}" cy="${y - 30}" rx="54" ry="14" fill="#fdf8f0"/>${coffee ? `<path d="M${x} ${y - 22} C${x - 20} ${y - 32} ${x - 10} ${y - 44} ${x} ${y - 34} C${x + 10} ${y - 44} ${x + 20} ${y - 32} ${x} ${y - 22}Z" fill="#c99a6e"/>` : ''}`;
    else if (has('milk') && coffee) liquid += `<path d="M${x} ${y - 23} C${x - 16} ${y - 32} ${x - 9} ${y - 40} ${x} ${y - 33} C${x + 9} ${y - 40} ${x + 16} ${y - 32} ${x} ${y - 23}Z" fill="#f4e6d2"/>`;
    if (has('cardamom')) liquid += [[-30, -32], [-8, -26], [16, -34], [34, -28]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="4" ry="2.4" fill="#86ad58" stroke="#5f7d3e" stroke-width="1"/>`).join('');
    if (has('chocolate')) liquid += [[-24, -30], [-4, -36], [20, -28], [6, -24]].map(([dx, dy]) => `<rect x="${x + dx - 3}" y="${y + dy - 2}" width="6" height="4" rx="1" fill="#4a2414"/>`).join('');
    if (has('caramel')) liquid += `<path d="M${x - 42} ${y - 33} l10 6 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 6" fill="none" stroke="#d99a3c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else if (c.length) liquid = `<ellipse cx="${x}" cy="${y - 30}" rx="44" ry="12" fill="${has('chocolate') ? '#6a3a24' : has('caramel') ? '#d99a3c' : has('cardamom') ? '#a9c27a' : '#fff'}"/>`;
  const steam = c.length ? [0, .8].map(d => `<g style="animation:rise 2.4s ${d}s infinite;transform-origin:${x}px ${y - 54}px"><circle cx="${x - 8 + d * 18}" cy="${y - 54}" r="7" fill="#fff" opacity=".85"/></g>`).join('') : '';
  const chips = c.map(k => ING[k].name).join(' · ') || 'Empty cup';
  return `<g class="popin">
    <ellipse cx="${x}" cy="${y + 52}" rx="84" ry="18" fill="#fffaf2" ${L(2)}/>
    <path d="M${x + 62} ${y - 14} Q${x + 98} ${y - 10} ${x + 90} ${y + 16} Q${x + 84} ${y + 32} ${x + 56} ${y + 24}" fill="none" stroke="${LN}" stroke-width="13" stroke-linecap="round"/><path d="M${x + 62} ${y - 14} Q${x + 98} ${y - 10} ${x + 90} ${y + 16} Q${x + 84} ${y + 32} ${x + 56} ${y + 24}" fill="none" stroke="#fffaf2" stroke-width="8" stroke-linecap="round"/>
    <path d="M${x - 68} ${y - 30} Q${x - 66} ${y + 40} ${x} ${y + 44} Q${x + 66} ${y + 40} ${x + 68} ${y - 30}Z" fill="#fffaf2" ${L(2.5)}/>
    <ellipse cx="${x}" cy="${y - 30}" rx="68" ry="19" fill="#f1e7da" ${L(2.5)}/>
    ${liquid}${steam}${catLogo(x, y + 10, 7)}
    <g class="lbl" transform="translate(0 98)"><rect x="${x - 104}" y="${y - 2}" width="208" height="26" rx="13" fill="#fffaf2" fill-opacity=".95" ${L(1.5)}/>${TXT(x, y + 16, chips, 12.5, 'middle', '#6e5040', 700)}</g>
  </g>`;
}

/* ---------- Ticket de commande épinglé ---------- */
function ticketArt(o, i) {
  const x = 590 + i * 180, p = Math.max(0, o.patience), hearts = Math.ceil(p / 20);
  return `<g class="hit" data-act="serve" data-id="${o.id}" id="t-${o.id}"><g class="lift">
    <path d="M${x + 80} 40 L${x + 80} 52" ${L(2)}/><circle cx="${x + 80}" cy="50" r="5" fill="${P.coral}" ${L(1.5)}/>
    <path d="M${x} 58 L${x + 160} 58 L${x + 160} 186 ${Array.from({ length: 8 }, (_, k) => `l-10 7 l-10 -7`).join(' ')} Z" fill="#fffaf2" ${L(2)}/>
    <circle cx="${x + 26}" cy="${88}" r="17" fill="#fdf1dd" ${L(1.8)}/>${TXT(x + 26, 95, o.who[1], 17)}
    ${TXT(x + 50, 84, o.recipe.name, o.recipe.name.length > 10 ? 13 : 15, 'start')}
    ${TXT(x + 50, 101, fmt(o.recipe.price) + ' coins', 11.5, 'start', '#8a6a5a', 700)}
    <text x="${x + 12}" y="${132}" font-family="Nunito,sans-serif" font-weight="700" font-size="10.5" fill="#6e5040">${o.recipe.need.map(k => ING[k].name).join(' + ')}</text>
    ${[0, 1, 2, 3, 4].map(k => `<g id="h-${o.id}-${k}" opacity="${k < hearts ? 1 : .25}">${heart(x + 28 + k * 26, 160, .85)}</g>`).join('')}
  </g></g>`;
}

export { L, TXT, ING, decor, machines, front, cupArt, ticketArt };
