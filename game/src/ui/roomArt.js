// Décor de la salle — inspiré de interior/cafeinterior2.jpg : grandes vitres sur la rue, porte en arc,
// parquet à chevrons, tapis blanc à franges, fauteuils verts avec plaids à carreaux, tables rondes et succulentes,
// suspensions noires, comptoir en terrazzo avec vitrine. Grand-mère lit sur un canapé près de la fenêtre.
import { P, leaf, heart, catLogo } from '../art/cast.js';

const LN = '#6e5040';
const L = (w = 2) => `stroke="${LN}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const GREEN = '#c2c873', GREEN_D = '#a3ab55', WOODF = '#c98d5c';

function ch(fn, state, x, y, w, modes, wide = false) {
  const vw = wide ? 260 : 200, h = w * 260 / vw;
  return `<svg class="${modes}" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${vw} 260" data-state="${state}" overflow="visible">${fn()}</svg>`;
}

/* ---------- Murs, sol à chevrons, grandes vitres, porte en arc ---------- */
function shell() {
  return `
  <defs>
    <pattern id="herring" width="72" height="36" patternUnits="userSpaceOnUse">
      <rect width="72" height="36" fill="${WOODF}"/>
      <path d="M0 18 L18 0 L36 18 L18 36Z M36 18 L54 0 L72 18 L54 36Z" fill="#d49a68"/>
      <path d="M0 18 L18 0 L36 18 L18 36Z M36 18 L54 0 L72 18 L54 36Z M18 0 L18 36 M54 0 L54 36" fill="none" stroke="#a46d45" stroke-width="1.4"/>
    </pattern>
    <clipPath id="floorClip"><path d="M180 330 L1420 330 L1600 600 L1600 900 L0 900 L0 600Z"/></clipPath>
    <clipPath id="winClip"><rect x="676" y="38" width="560" height="252" rx="4"/></clipPath>
    <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3f2"/><stop offset="1" stop-color="#fbeedb"/></linearGradient>
    <linearGradient id="skySun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5e4596"/><stop offset=".55" stop-color="#e0758e"/><stop offset="1" stop-color="#ffc98a"/></linearGradient>
    <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1440"/><stop offset="1" stop-color="#2c3f82"/></linearGradient>
    <radialGradient id="warm"><stop offset="0" stop-color="#ffd59a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb36b" stop-opacity="0"/></radialGradient>
    <radialGradient id="sunPatch"><stop offset="0" stop-color="#fff4c8" stop-opacity=".7"/><stop offset="1" stop-color="#fff4c8" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="180" y="0" width="1240" height="330" fill="#f3e6d3"/>
  <path d="M0 0 L180 0 L180 330 L0 600Z" fill="#ead6bd" ${L()}/>
  <path d="M1420 0 L1600 0 L1600 600 L1420 330Z" fill="#ead6bd" ${L()}/>
  <path d="M180 330 L1420 330 L1600 600 L1600 900 L0 900 L0 600Z" fill="url(#herring)"/>
  <path d="M180 330 L1420 330 L1600 600 L1600 900 L0 900 L0 600Z" fill="#7a4a2a" opacity=".08"/>
  <path d="M180 330 L1420 330" ${L(2.5)}/><path d="M180 0 L180 330 M1420 0 L1420 330" ${L(2)}/>
  <rect x="180" y="316" width="1240" height="14" fill="#e3cfb3"/>

  <!-- grandes vitres sur la rue -->
  <rect x="664" y="26" width="584" height="276" rx="6" fill="#6e4a3e" ${L(2)}/>
  <g clip-path="url(#winClip)">
    <rect class="md" x="676" y="38" width="560" height="252" fill="url(#skyDay)"/>
    <rect class="ms" x="676" y="38" width="560" height="252" fill="url(#skySun)"/>
    <rect class="mn" x="676" y="38" width="560" height="252" fill="url(#skyNight)"/>
    <g class="mn">${[[700, 60], [790, 50], [880, 76], [1010, 54], [1120, 90], [1200, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff6e0"/>`).join('')}<circle cx="1180" cy="80" r="13" fill="#fff8e0"/></g>
    <path d="M676 190 L716 190 L716 132 L756 106 L796 132 L796 190 L846 190 L846 150 L930 150 L930 190 L980 190 L980 120 L1020 96 L1060 120 L1060 190 L1110 190 L1110 140 L1236 140 L1236 290 L676 290Z" fill="#e9c9b9" ${L(1.5)}/>
    ${[[690, 156], [730, 150], [866, 164], [1000, 140], [1130, 160], [1180, 160]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="16" fill="#a7c0dd" ${L(1)}/>`).join('')}
    <g class="mn">${[[730, 150], [1000, 140]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="16" fill="#ffd28a"/>`).join('')}</g>
    <rect x="676" y="238" width="560" height="52" fill="#d9cfc6"/><path d="M676 238 L1236 238" ${L(1.5)}/>
    <g id="winDog"></g>
    <g opacity=".22">${[[700, 60, 22], [736, 50, 16], [714, 92, 18]].map(([x, y, s]) => leaf(x, y, s, '#4f7a5a')).join('')}</g>
  </g>
  ${[816, 956, 1096].map(x => `<rect x="${x - 5}" y="38" width="10" height="252" fill="#6e4a3e"/>`).join('')}
  <rect x="676" y="160" width="560" height="9" fill="#6e4a3e"/>
  <!-- enseigne lumineuse OPEN sur la vitre -->
  <g transform="translate(1100 70)"><path d="M10 26 q0 -18 18 -18 h4 q18 0 18 18 v4 h-40z" fill="none" stroke="#ffd28a" stroke-width="3.5"/><path d="M22 6 q-4 -8 2 -12 M32 6 q-4 -8 2 -12" fill="none" stroke="#ffd28a" stroke-width="2.5" stroke-linecap="round"/>
    <text x="30" y="52" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="17" fill="#ffd28a" transform="scale(-1 1) translate(-60 0)">OPEN</text></g>
  <rect x="656" y="296" width="600" height="14" rx="4" fill="#a8743f" ${L(2)}/>

  <!-- porte d'entrée en arc -->
  <path d="M1264 330 L1264 120 Q1264 52 1335 52 Q1406 52 1406 120 L1406 330Z" fill="#6e4a3e" ${L(2.5)}/>
  <path d="M1276 326 L1276 124 Q1276 66 1335 66 Q1394 66 1394 124 L1394 326Z" class="md" fill="#cfe6f2"/>
  <path d="M1276 326 L1276 124 Q1276 66 1335 66 Q1394 66 1394 124 L1394 326Z" class="ms" fill="#f2b48e"/>
  <path d="M1276 326 L1276 124 Q1276 66 1335 66 Q1394 66 1394 124 L1394 326Z" class="mn" fill="#34498c"/>
  <path d="M1335 66 L1335 326 M1276 200 L1394 200" stroke="#6e4a3e" stroke-width="7"/>
  <circle cx="1322" cy="252" r="4" fill="${P.gold}"/><circle cx="1348" cy="252" r="4" fill="${P.gold}"/>
  <path d="M1335 52 L1335 40" ${L(1.5)}/><path d="M1326 40 Q1335 24 1344 40Z" fill="${P.gold}" ${L(1.5)}/>
  <path d="M1270 336 L1400 336 L1416 356 L1254 356Z" fill="#9c6a48" ${L(1.5)}/>
  <g class="mn"><rect x="1300" y="140" width="70" height="26" rx="4" fill="#fdf1dd" ${L(1.5)}/><text class="artText" x="1335" y="158" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="15" fill="#c0666a">Closed</text></g>
  <g class="md ms"><rect x="1300" y="140" width="70" height="26" rx="4" fill="#fdf1dd" ${L(1.5)}/><text class="artText" x="1335" y="158" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="15" fill="#4f8a6a">Open</text></g>

  <path d="M1420 316 L1500 436 L1500 450 L1420 330Z" fill="#e3cfb3" ${L(1)}/>
  ${souvenirPhoto()}
  ${library()}

  <!-- porte de la boulangerie (bientôt) sur le mur de gauche -->
  <g class="hit" data-act="bakery"><g class="lift">
    <path d="M44 214 L150 160 L150 378 L44 540Z" fill="#a8743f" ${L(2.5)}/>
    <path d="M58 228 L138 186 L138 372 L58 512Z" fill="#c9915e" ${L(1.8)}/>
    <path d="M70 300 L126 270 L126 330 L70 368Z" fill="#fff4dc" ${L(1.5)} opacity=".9"/>
    <circle cx="128" cy="380" r="5" fill="${P.gold}" ${L(1.2)}/>
    <g transform="translate(98 150) skewY(-27)">
      <path d="M-58 -20 Q-58 -30 -48 -30 L48 -30 Q58 -30 58 -20 L58 20 Q58 30 48 30 L-48 30 Q-58 30 -58 20Z" fill="#6e4a3e" ${L(2)}/>
      <rect x="-50" y="-23" width="100" height="46" rx="6" fill="#fdf1dd" stroke="${P.gold}" stroke-width="2.5"/>
      <rect x="-45" y="-18" width="90" height="36" rx="4" fill="none" stroke="${P.gold}" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="0" y="8" text-anchor="middle" font-family="Fraunces,serif" font-weight="700" font-style="italic" font-size="21" fill="#6e4a3e">Bakery</text>
      <path d="M-62 0 q-8 -6 -2 -12 M62 0 q8 -6 2 -12" fill="none" stroke="${P.gold}" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    ${soonRibbon(98, 296, -27, 'COMING SOON', 100, 12)}
  </g></g>`;
}

/* ---------- Enseignes : planche suspendue à cadre doré, ruban « bientôt » ---------- */
function hangSign(x, label, w) {
  return `<path d="M${x - w / 2 + 16} 0 L${x - w / 2 + 16} 64 M${x + w / 2 - 16} 0 L${x + w / 2 - 16} 64" stroke="#8a6a50" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M${x - w / 2} 70 Q${x - w / 2} 62 ${x - w / 2 + 8} 62 L${x + w / 2 - 8} 62 Q${x + w / 2} 62 ${x + w / 2} 70 L${x + w / 2} 104 Q${x + w / 2} 112 ${x + w / 2 - 8} 112 L${x - w / 2 + 8} 112 Q${x - w / 2} 112 ${x - w / 2} 104Z" fill="#6e4a3e" ${L(2)}/>
    <rect x="${x - w / 2 + 6}" y="68" width="${w - 12}" height="38" rx="5" fill="#fdf1dd" stroke="${P.gold}" stroke-width="2.5"/>
    <circle cx="${x - w / 2 + 16}" cy="64" r="3.5" fill="${P.gold}" ${L(1)}/><circle cx="${x + w / 2 - 16}" cy="64" r="3.5" fill="${P.gold}" ${L(1)}/>
    <path d="M${x - w / 2 + 14} 87 l6 -5 l6 5 l-6 5z M${x + w / 2 - 26} 87 l6 -5 l6 5 l-6 5z" fill="${P.gold}"/>
    <text x="${x}" y="95" text-anchor="middle" font-family="Fraunces,serif" font-weight="700" font-style="italic" font-size="23" fill="#6e4a3e">${label}</text>`;
}
function soonRibbon(x, y, angle, label, w, fs = 16) {
  return `<g transform="translate(${x} ${y}) skewY(${angle})">
    <path d="M${-w / 2 - 22} -8 L${-w / 2 + 4} -8 L${-w / 2 + 4} 26 L${-w / 2 - 22} 26 L${-w / 2 - 12} 9Z M${w / 2 + 22} -8 L${w / 2 - 4} -8 L${w / 2 - 4} 26 L${w / 2 + 22} 26 L${w / 2 + 12} 9Z" fill="#c9524a" ${L(1.8)}/>
    <rect x="${-w / 2}" y="-14" width="${w}" height="34" rx="3" fill="#e86a5f" ${L(2)}/>
    <path d="M${-w / 2 + 6} -9 L${w / 2 - 6} -9 M${-w / 2 + 6} 15 L${w / 2 - 6} 15" stroke="#fdf1dd" stroke-width="1.4" stroke-dasharray="4 3" opacity=".8"/>
    <text x="0" y="8" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="${fs}" letter-spacing="1.2" fill="#fffaf2">${label}</text>
  </g>`;
}

/* ---------- Souvenir : photo sépia du café il y a 20 ans, à côté de la porte ---------- */
function souvenirPhoto() {
  const sep = '#d9c19a', sepD = '#a88a62', sepK = '#7a6248';
  return `<g transform="translate(1440 76) scale(.84) skewY(12)">
    <rect x="-6" y="-6" width="76" height="98" rx="4" fill="#b8893e" ${L(2)}/>
    <rect x="-1" y="-1" width="66" height="88" rx="2" fill="#e3c06e" ${L(1)}/>
    <rect x="4" y="4" width="56" height="64" fill="${sep}" stroke="${sepK}" stroke-width="1.2"/>
    <rect x="4" y="4" width="56" height="26" fill="#e6d2ae"/>
    <path d="M12 68 L12 30 L52 30 L52 68Z" fill="${sepD}" stroke="${sepK}" stroke-width="1"/>
    <path d="M9 32 L32 18 L55 32Z" fill="${sepK}"/>
    <path d="M12 38 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0" fill="none" stroke="#f2e6cc" stroke-width="2.4"/>
    <rect x="16" y="44" width="12" height="11" fill="#efe0c0" stroke="${sepK}" stroke-width="1"/><rect x="34" y="44" width="12" height="24" fill="#6a5440"/>
    <circle cx="24" cy="57" r="3.4" fill="#efe0c0"/><path d="M20 68 L21 61 Q24 59 27 61 L28 68Z" fill="#8a6a50"/>
    <path d="M38 68 q2 -6 6 -6 q4 0 4 6Z M45 62 l2 -3 l1 3" fill="#efe0c0" stroke="${sepK}" stroke-width=".8"/>
    <rect x="0" y="0" width="64" height="72" fill="#c9a27e" opacity=".12"/>
    <text x="32" y="81" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="8.5" fill="#6e4a3e">Komorebi · 2006</text>
  </g>`;
}

/* ---------- Bibliothèque en relief : livres et magazines à emprunter (mur de droite, derrière Moka) ---------- */
function library() {
  const x0 = 1490, x1 = 1594, D = [-18, 9];            // D : profondeur (le meuble avance vers nous)
  const top = x => 200 + (x - x0) * 0.16, bot = x => 330 + (x - 1420) * 1.5 - 6;
  const at = (x, f) => top(x) + (bot(x) - top(x)) * f;
  const P2 = (x, f, k = 0) => [x + D[0] * k, at(x, f) + D[1] * k];
  const poly = pts => `M${pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(' L')}Z`;
  const shelves = [0, .25, .5, .75, 1];
  const cols = ['#e86a5f', '#7fa8d8', '#f2c46a', '#8fb39a', '#c7a6e6', '#f2a2b4', '#a8743f', '#5d5a8f', '#e8a24a'];
  const wood = '#a8743f', woodL = '#c99063', woodD = '#7a4e36';
  let books = '', k = 0;
  for (let r = 0; r < 4; r++) {
    const fa = shelves[r] + 0.035, fb = shelves[r + 1] - 0.012;
    if (r === 3) { // magazines posés de face, un peu inclinés
      for (let x = x0 + 12; x < x1 - 30; x += 33) {
        const c = cols[(k++) % cols.length], h = 0.17;
        books += `<path d="${poly([P2(x, fb - h, .55), P2(x + 25, fb - h, .55), P2(x + 25, fb, .85), P2(x, fb, .85)])}" fill="${c}" ${L(1.4)}/>
          <path d="${poly([P2(x + 4, fb - h + .03, .58), P2(x + 21, fb - h + .03, .58), P2(x + 21, fb - h + .06, .62), P2(x + 4, fb - h + .06, .62)])}" fill="#fffaf2" opacity=".9"/>
          <path d="${poly([P2(x + 6, fb - .08, .7), P2(x + 19, fb - .08, .7), P2(x + 19, fb - .03, .78), P2(x + 6, fb - .03, .78)])}" fill="#fffaf2" opacity=".55"/>`;
      }
      continue;
    }
    for (let x = x0 + 8; x < x1 - 10;) {
      const w = 7 + ((k * 7) % 6), h = 0.6 + ((k * 13) % 32) / 100, c = cols[(k++) % cols.length];
      if (k % 10 === 5) { // petite pile de livres couchés
        for (let j = 0; j < 3; j++) { const f1 = fb - j * 0.045, f0 = f1 - 0.04, cc = cols[(k + j) % cols.length];
          books += `<path d="${poly([P2(x, f0, .25), P2(x + 26, f0, .25), P2(x + 26, f0, .85), P2(x, f0, .85)])}" fill="#f3e6cf" ${L(1)}/><path d="${poly([P2(x, f0, .85), P2(x + 26, f0, .85), P2(x + 26, f1, .85), P2(x, f1, .85)])}" fill="${cc}" ${L(1.2)}/>`; }
        x += 30; continue;
      }
      const ft = fb - (fb - fa) * h;
      // tranche du dessus (pages), puis dos coloré du livre
      books += `<path d="${poly([P2(x, ft, .3), P2(x + w, ft, .3), P2(x + w, ft, .85), P2(x, ft, .85)])}" fill="#f3e6cf" stroke="${LN}" stroke-width=".8"/>
        <path d="${poly([P2(x, ft, .85), P2(x + w, ft, .85), P2(x + w, fb, .85), P2(x, fb, .85)])}" fill="${c}" ${L(1.1)}/>
        <path d="${poly([P2(x + w - 2, ft, .85), P2(x + w, ft, .85), P2(x + w, fb, .85), P2(x + w - 2, fb, .85)])}" fill="#000" opacity=".12"/>
        <path d="M${P2(x + 1.5, ft + .06, .85).join(' ')} L${P2(x + w - 1.5, ft + .06, .85).join(' ')}" stroke="#fffaf2" stroke-width="1.2" opacity=".75"/>`;
      x += w + 1;
    }
  }
  const board = f => `<path d="${poly([P2(x0, f), P2(x1, f), P2(x1, f, 1), P2(x0, f, 1)])}" fill="${woodL}" ${L(1.2)}/>
    <path d="${poly([P2(x0, f, 1), P2(x1, f, 1), P2(x1, f + .03, 1), P2(x0, f + .03, 1)])}" fill="${wood}" ${L(1.2)}/>`;
  return `<g class="hit" data-act="library">
    <!-- fond du meuble et ombre intérieure -->
    <path d="${poly([P2(x0, 0), P2(x1, 0), P2(x1, 1), P2(x0, 1)])}" fill="#4a3026" ${L(2)}/>
    ${shelves.slice(0, 4).map(f => `<path d="${poly([P2(x0, f), P2(x1, f), P2(x1, f + .05), P2(x0, f + .05)])}" fill="#000" opacity=".18"/>`).join('')}
    ${books}
    ${shelves.slice(1).map(board).join('')}
    <!-- côté gauche (épaisseur), montants et corniche -->
    <path d="${poly([P2(x0, -.05), P2(x0, -.05, 1), P2(x0, 1.02, 1), P2(x0, 1.02)])}" fill="${woodD}" ${L(2)}/>
    <path d="${poly([P2(x0, -.05, 1), P2(x0 + 7, -.05, 1), P2(x0 + 7, 1.02, 1), P2(x0, 1.02, 1)])}" fill="${wood}" ${L(1.6)}/>
    <path d="${poly([P2(x1 - 5, -.05, 1), P2(x1 + 2, -.05, 1), P2(x1 + 2, 1.02, 1), P2(x1 - 5, 1.02, 1)])}" fill="${wood}" ${L(1.6)}/>
    <path d="${poly([P2(x0 - 4, -.06, 0), P2(x1 + 6, -.06, 0), P2(x1 + 6, -.06, 1.3), P2(x0 - 4, -.06, 1.3)])}" fill="${woodL}" ${L(1.6)}/>
    <path d="${poly([P2(x0 - 4, -.06, 1.3), P2(x1 + 6, -.06, 1.3), P2(x1 + 6, -.01, 1.3), P2(x0 - 4, -.01, 1.3)])}" fill="${wood}" ${L(1.6)}/>
    <!-- sur le dessus : petite plante et globe -->
    <path d="M1528 ${at(1528, -.06) - 2} l-8 -14 l18 0 l-4 14z" fill="#d9886e" ${L(1.4)}/>
    ${[[-10, -28, -30], [0, -34, 0], [8, -26, 30], [-4, -22, -60], [6, -20, 60]].map(([dx, dy, a]) => `<path d="M0 0 Q6 -4 12 0 Q6 4 0 0Z" transform="translate(${1529 + dx} ${at(1528, -.06) + dy}) rotate(${a - 90})" fill="#7fb06e" stroke="${LN}" stroke-width="1"/>`).join('')}
    <circle cx="1566" cy="${at(1566, -.06) - 16}" r="10" fill="#7fa8d8" ${L(1.4)}/><path d="M1558 ${at(1566, -.06) - 20} q8 4 16 -2 M1560 ${at(1566, -.06) - 12} q6 -3 12 1" fill="none" stroke="#8fb39a" stroke-width="3"/>
    <path d="M1566 ${at(1566, -.06) - 6} L1566 ${at(1566, -.06) - 1} M1559 ${at(1566, -.06) - 1} L1573 ${at(1566, -.06) - 1}" ${L(2)}/>
    <g transform="translate(${x0 + 40} ${at(x0 + 40, .02) + 4}) skewY(9)"><rect x="-30" y="-9" width="60" height="18" rx="4" fill="#fdf1dd" stroke="${P.gold}" stroke-width="2"/>
      <text x="0" y="4.5" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-weight="700" font-size="11" fill="#6e4a3e">Library</text></g>
  </g>`;
}

/* ---------- Suspensions noires ---------- */
function lamps() {
  return [740, 880, 1020, 1160].map(x => `<path d="M${x} 0 L${x} 66" ${L(1.4)}/><path d="M${x - 22} 92 L${x - 12} 66 L${x + 12} 66 L${x + 22} 92Z" fill="#3b3640" ${L(1.8)}/><ellipse cx="${x}" cy="94" rx="9" ry="4" fill="#ffe2a6"/>`).join('');
}

/* ---------- Comptoir du fond : station Café + station Jus (niveau 2) ---------- */
function backWall() {
  return `
  ${[110, 176].map(y => `<rect x="206" y="${y}" width="420" height="10" rx="2" fill="#a8743f" ${L(1.8)}/>`).join('')}
  ${[['#f2b5a8', 0], ['#a9c7e0', 1], ['#f6dc9a', 0], ['#b8d8b0', 1], ['#e8c3e0', 0]].map(([c, k], i) => `<rect x="${222 + i * 38}" y="${k ? 147 : 141}" width="26" height="${k ? 29 : 35}" rx="6" fill="${c}" ${L(1.5)}/><rect x="${224 + i * 38}" y="${k ? 141 : 135}" width="22" height="7" rx="2" fill="#efe3d2" ${L(1.2)}/>`).join('')}
  ${[0, 1, 2].map(i => `<path d="M${430 + i * 34} 176 l0 -24 q13 -2 24 0 l0 24z" fill="${['#fffaf2', '#f6c6d0', '#a9c7e0'][i]}" ${L(1.5)}/>`).join('')}
  ${[0, 1, 2].map(i => `<circle cx="${548 + i * 26}" cy="${96 - (i % 2) * 6}" r="11" fill="${['#e8586a', '#9cc96f', '#f5b13a'][i]}" ${L(1.5)}/>`).join('')}`;
}
function station(juiceOpen = false) {
  return `
  <g class="hit" data-act="station"><g class="lift">
    <rect x="190" y="240" width="250" height="16" rx="3" fill="#efe3d2" ${L(2)}/><rect x="196" y="256" width="238" height="74" fill="#a8743f" ${L(2)}/>
    ${espressoMachine()}
    ${hangSign(266, 'Café', 112)}
  </g></g>
  <g class="hit" data-act="juice"><g class="lift">
    <rect x="448" y="240" width="200" height="16" rx="3" fill="#efe3d2" ${L(2)}/><rect x="454" y="256" width="188" height="74" fill="#b3906a" ${L(2)}/>
    ${juiceBar()}
    ${hangSign(548, 'Juice', 120)}
    ${juiceOpen ? '' : soonRibbon(548, 150, -6, 'LEVEL 2 · SOON', 170)}
  </g></g>`;
}

/* ---------- Machine à espresso et moulin, dessinés d'après de vraies machines ---------- */
function espressoMachine() {
  const chrome = '#dfe3e8', chromeD = '#b8bec8', body = '#a9c8b2', bodyD = '#8fb39a';
  const group = gx => `<rect x="${gx - 9}" y="214" width="18" height="7" rx="2" fill="${chromeD}" ${L(1.4)}/>
    <path d="M${gx - 11} 221 L${gx + 11} 221 L${gx + 9} 227 L${gx - 9} 227Z" fill="#4a4752" ${L(1.4)}/><path d="M${gx + 9} 224 L${gx + 30} 228" stroke="#3b3640" stroke-width="5" stroke-linecap="round"/>
    <path d="M${gx - 7} 232 L${gx + 7} 232 L${gx + 6} 242 L${gx - 6} 242Z" fill="#fffaf2" ${L(1.2)}/>`;
  return `
    <!-- tasses qui chauffent sur le dessus -->
    ${[226, 242, 258, 300, 316].map((cx, i) => `<path d="M${cx - 6} 158 L${cx + 6} 158 L${cx + 5} 168 L${cx - 5} 168Z" fill="${i % 2 ? '#f2b5c0' : '#fffaf2'}" ${L(1.2)}/>`).join('')}
    <rect x="212" y="166" width="124" height="8" rx="3" fill="${chrome}" ${L(1.6)}/><path d="M218 166 L218 162 M330 166 L330 162 M218 162 L330 162" ${L(1.2)}/>
    <!-- corps -->
    <path d="M214 174 L334 174 L334 214 L214 214Z" fill="${body}" ${L(2)}/>
    <rect x="214" y="174" width="120" height="6" fill="${bodyD}"/>
    <rect x="226" y="184" width="96" height="22" rx="4" fill="${chrome}" ${L(1.5)}/>
    <circle cx="274" cy="195" r="9" fill="#fffaf2" ${L(1.5)}/><path d="M274 195 L279 190" stroke="#e86a5f" stroke-width="1.6" stroke-linecap="round"/><circle cx="274" cy="195" r="1.6" fill="${LN}"/>
    <circle cx="240" cy="195" r="4" fill="#e3c06e" ${L(1)}/><circle cx="308" cy="195" r="4" fill="#e3c06e" ${L(1)}/>
    ${catLogo(255, 196, 3.2)}
    ${group(246)}${group(298)}
    <!-- buse vapeur -->
    <path d="M334 186 L342 186 L342 232" fill="none" stroke="${LN}" stroke-width="4.5" stroke-linecap="round"/><path d="M334 186 L342 186 L342 232" fill="none" stroke="${chrome}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="336" cy="181" r="3.5" fill="#3b3640"/>
    <!-- grille d'égouttage -->
    <rect x="216" y="240" width="116" height="6" rx="2" fill="${chromeD}" ${L(1.4)}/>
    <!-- moulin conique -->
    <path d="M350 160 L382 160 L374 186 L358 186Z" fill="#e8f4f8" fill-opacity=".85" ${L(1.6)}/><path d="M354 170 L378 170 L374 184 L358 184Z" fill="#6e4632"/>
    ${[[360, 175], [366, 178], [372, 174], [363, 181], [369, 182]].map(([bx, by]) => `<ellipse cx="${bx}" cy="${by}" rx="2" ry="1.4" fill="#4a2a1c"/>`).join('')}
    <rect x="348" y="156" width="36" height="5" rx="2" fill="#3b3640" ${L(1.2)}/>
    <path d="M354 186 L378 186 L382 226 L350 226Z" fill="#e8896a" ${L(1.8)}/><rect x="358" y="194" width="16" height="9" rx="2" fill="#3b3640"/><text x="366" y="201.5" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="6" fill="#9cf0b0">10.9</text>
    <path d="M362 210 L370 210 L369 218 L363 218Z" fill="#3b3640"/>
    <rect x="346" y="226" width="40" height="16" rx="3" fill="#c96f50" ${L(1.6)}/>`;
}
/* ---------- Bar à jus : distributeur à deux cuves, presse-agrumes, corbeille de fruits ---------- */
function juiceBar() {
  const tank = (cx, col, colD) => `<path d="M${cx - 18} 176 L${cx + 18} 176 L${cx + 16} 224 L${cx - 16} 224Z" fill="#eef7fa" fill-opacity=".75" ${L(1.8)}/>
    <path d="M${cx - 16} 190 L${cx + 16} 190 L${cx + 15} 222 L${cx - 15} 222Z" fill="${col}"/><path d="M${cx - 16} 190 L${cx + 16} 190" stroke="${colD}" stroke-width="2"/>
    ${[[-6, 202], [5, 210], [-2, 216]].map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${dy}" r="2.4" fill="#fffaf2" opacity=".55"/>`).join('')}
    <path d="M${cx - 12} 182 L${cx - 10} 218" stroke="#ffffff" stroke-width="2.5" opacity=".7" stroke-linecap="round"/>
    <rect x="${cx - 20}" y="170" width="40" height="7" rx="3" fill="#dfe3e8" ${L(1.4)}/>
    <rect x="${cx - 4}" y="224" width="8" height="6" fill="#b8bec8" ${L(1.2)}/><path d="M${cx - 6} 230 L${cx + 6} 230 L${cx + 3} 236 L${cx - 3} 236Z" fill="#4a4752" ${L(1)}/>`;
  return `
    <rect x="462" y="226" width="98" height="16" rx="3" fill="#dfe3e8" ${L(1.6)}/>
    ${tank(487, '#f5a83a', '#e08a20')}${tank(535, '#a6cf6a', '#86b44a')}
    <!-- presse-agrumes à levier -->
    <rect x="570" y="232" width="34" height="10" rx="3" fill="#b8bec8" ${L(1.5)}/><path d="M582 232 L582 186" stroke="${LN}" stroke-width="5" stroke-linecap="round"/><path d="M582 232 L582 186" stroke="#dfe3e8" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M582 188 L606 178" stroke="${LN}" stroke-width="5" stroke-linecap="round"/><path d="M582 188 L606 178" stroke="#e86a5f" stroke-width="2.5" stroke-linecap="round"/><circle cx="607" cy="177" r="4" fill="#e86a5f" ${L(1.2)}/>
    <path d="M574 214 Q587 206 600 214 L598 222 L576 222Z" fill="#dfe3e8" ${L(1.4)}/><path d="M576 222 L598 222 L596 232 L578 232Z" fill="#fffaf2" fill-opacity=".8" ${L(1.2)}/>
    <!-- corbeille de fruits -->
    <path d="M610 242 L612 224 Q626 218 640 224 L642 242Z" fill="#c9a27e" ${L(1.6)}/><path d="M612 230 L640 230 M612 236 L641 236" stroke="#a8784e" stroke-width="1.2"/>
    ${[[618, 218, '#f5b13a'], [628, 214, '#9cc96f'], [637, 219, '#e8586a'], [623, 211, '#f5b13a']].map(([fx, fy, c]) => `<circle cx="${fx}" cy="${fy}" r="7" fill="${c}" ${L(1.2)}/><path d="M${fx} ${fy - 7} l2 -3" ${L(1.2)}/>`).join('')}`;
}

/* ---------- Comptoir de service en terrazzo ---------- */
function counter() {
  const dots = Array.from({ length: 70 }, (_, i) => `<ellipse cx="${190 + (i * 53) % 528}" cy="${381 + (i * 7) % 17}" rx="${3 + (i % 3)}" ry="2" fill="${['#c9b8a8', '#e3d3c3', '#b5c4b0', '#d7b8a0'][i % 4]}"/>`).join('');
  return `
  <path d="M184 378 L716 378 L730 400 L170 400Z" fill="#f1ebe2" ${L(2)}/>${dots}
  <rect x="176" y="400" width="548" height="86" fill="#a8743f" ${L(2)}/>
  ${[0, 1, 2, 3].map(i => `<rect x="${194 + i * 132}" y="414" width="112" height="58" rx="6" fill="#b98352" ${L(1.5)}/>`).join('')}
  <rect x="196" y="340" width="56" height="40" rx="6" fill="#efe9e2" ${L(1.8)}/><rect x="202" y="322" width="44" height="22" rx="3" fill="#3d3a4a" ${L(1.5)}/>
  <path d="M500 348 Q498 384 514 384 L534 384 Q550 384 548 348Z" fill="#fff" fill-opacity=".5" ${L(1.8)}/><circle cx="518" cy="378" r="5" fill="${P.gold}"/><circle cx="530" cy="380" r="4" fill="${P.gold}"/>
  <!-- cœur à pourboires : il palpite quand un client ravi laisse un petit quelque chose -->
  <g id="tipHeart" style="transform-origin:578px 346px"><path d="M572 378 L584 378 L582 368 L574 368Z" fill="#a8743f" ${L(1.5)}/>
    <path d="M578 370 C552 352 552 326 566 322 C574 320 578 328 578 332 C578 328 582 320 590 322 C604 326 604 352 578 370Z" fill="#f2a2b4" ${L(2)}/>
    <path d="M578 362 C562 350 562 334 570 331 C575 330 578 335 578 338 C578 335 581 330 586 331 C594 334 594 350 578 362Z" fill="#fde0e6"/>
    <text x="578" y="351" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="9" fill="#c0506a">TIPS</text></g>
  <rect x="602" y="326" width="110" height="54" rx="6" fill="#e9f3f6" fill-opacity=".7" ${L(2)}/>
  ${[[624, '#d7b48a'], [652, '#c9a27e'], [684, '#e3cfb3']].map(([x, c]) => `<path d="M${x - 10} 372 L${x + 10} 372 L${x + 8} 348 L${x - 8} 348Z" fill="${c}" ${L(1.2)}/>`).join('')}`;
}

/* ---------- Canapé près de la fenêtre (Grand-mère) et tourne-disque ---------- */
function sofaBack() {
  return `<path d="M700 362 Q696 300 740 298 L900 298 Q944 300 940 362Z" fill="${GREEN}" ${L(2.5)}/>
    <path d="M788 304 Q820 290 852 304 Q862 330 846 352 L794 352 Q778 330 788 304Z" fill="#f2b5c0" ${L(2)}/><path d="M800 312 Q820 322 840 312" fill="none" stroke="#e39aa8" stroke-width="2"/>
    <path d="M760 300 L812 300 L800 352 L748 352Z" fill="#9db7d8" ${L(1.5)}/>${[0, 1, 2].map(k => `<path d="M${764 + k * 14} 300 L${752 + k * 14} 352 M${756} ${314 + k * 14} L${806} ${314 + k * 14}" stroke="#7e9cc2" stroke-width="2"/>`).join('')}`;
}
function sofaFront() {
  return `<rect x="704" y="352" width="232" height="44" rx="16" fill="${GREEN}" ${L(2.5)}/>
    <rect x="690" y="326" width="40" height="74" rx="16" fill="${GREEN_D}" ${L(2.5)}/><rect x="910" y="326" width="40" height="74" rx="16" fill="${GREEN_D}" ${L(2.5)}/>
    <path d="M708 396 Q722 406 736 396 Q750 406 764 396 Q778 406 792 396 Q806 406 820 396 Q834 406 848 396 Q862 406 876 396 Q890 406 904 396 Q918 406 932 396" fill="#fdf5e8" ${L(1.5)}/>`;
}
/* genoux, jambes et chaussures de Grand-mère assise (dessinés devant le canapé) */
function grandmaLap(seated = true) {
  // Grand-mère assise normalement : jupe sur les genoux, jambes qui descendent, chaussons sur un petit pouf ; plaid posé sur l'accoudoir
  const plaid = `<path d="M686 330 Q712 318 734 330 L736 384 Q712 394 690 384Z" fill="#f6e7cf" ${L(2)}/>
    ${[0, 1, 2].map(i => `<path d="M${694 + i * 14} 326 L${694 + i * 14} 390" stroke="#e86a5f" stroke-width="3" opacity=".55"/>`).join('')}
    ${[0, 1, 2].map(i => `<path d="M688 ${342 + i * 16} Q712 ${336 + i * 16} 735 ${342 + i * 16}" fill="none" stroke="#e86a5f" stroke-width="3" opacity=".55"/>`).join('')}
    <path d="M692 386 l-1 7 M704 390 l0 7 M716 390 l0 7 M728 388 l1 7" ${L(1.6)}/>`;
  if (!seated) return plaid;
  return `<ellipse cx="820" cy="434" rx="42" ry="11" fill="#c98a6a" ${L(2)}/><path d="M778 434 L778 424 Q820 410 862 424 L862 434" fill="#e3a283" ${L(2)}/>
    <path d="M806 380 L804 420 M834 380 L836 420" stroke="${LN}" stroke-width="15" stroke-linecap="round"/><path d="M806 380 L804 420 M834 380 L836 420" stroke="#efe2d2" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="803" cy="422" rx="12" ry="6.5" fill="#f2b5c0" ${L(2)}/><ellipse cx="837" cy="422" rx="12" ry="6.5" fill="#f2b5c0" ${L(2)}/><circle cx="797" cy="419" r="2.6" fill="#fffaf2"/><circle cx="843" cy="419" r="2.6" fill="#fffaf2"/>
    <path d="M784 344 Q820 334 856 344 Q866 366 862 386 Q842 394 820 388 Q798 394 778 386 Q774 366 784 344Z" fill="#6f957d" ${L(2.5)}/>
    <path d="M820 350 L820 386 M800 360 Q802 374 798 386 M840 360 Q838 374 842 386" fill="none" stroke="#5b806a" stroke-width="2" opacity=".8"/>
    ${plaid}`;
}
function recordPlayer() {
  return `<g class="hit" data-act="music"><g class="lift">
    <rect x="962" y="344" width="64" height="62" rx="6" fill="#a8743f" ${L(2)}/><path d="M970 406 L970 420 M1018 406 L1018 420" ${L(3)}/>
    <rect x="956" y="324" width="76" height="24" rx="5" fill="#8a5a48" ${L(2)}/>
    <ellipse cx="988" cy="326" rx="26" ry="6" fill="#2e2a33" ${L(1.5)}/><ellipse cx="988" cy="326" rx="7" ry="2" fill="${P.coral}"/><path d="M1020 320 L1008 328" ${L(2)}/>
    ${[0, 1.1, 2.2].map(d => `<text x="1010" y="312" font-size="18" fill="${LN}" style="animation:note 3.3s ${d}s infinite">♪</text>`).join('')}
  </g></g>`;
}

/* ---------- Tapis blanc à franges ---------- */
function rug() {
  const fr = [];
  for (let i = 0; i <= 22; i++) { const t = i / 22; fr.push(`<path d="M${520 + (470 - 520) * t} ${510 + 340 * t} l-14 0" ${L(1.4)}/><path d="M${1290 + (1350 - 1290) * t} ${510 + 340 * t} l14 0" ${L(1.4)}/>`); }
  return `<path d="M520 510 L1290 510 L1350 850 L470 850Z" fill="#fbf6ee" ${L(2)}/>${fr.join('')}
    <path d="M548 530 L1264 530 L1318 830 L500 830Z" fill="none" stroke="#e7d9c6" stroke-width="3" stroke-dasharray="10 8"/>`;
}

/* ---------- Coin fauteuils : dossier, assise, table ronde ---------- */
function armBack(x, y, s = 1) {
  return `<path d="M${x - 50 * s} ${y + 6 * s} Q${x - 56 * s} ${y - 96 * s} ${x} ${y - 104 * s} Q${x + 56 * s} ${y - 96 * s} ${x + 50 * s} ${y + 6 * s}Z" fill="${GREEN}" ${L(2.5)}/>
    <path d="M${x - 30 * s} ${y - 100 * s} L${x + 14 * s} ${y - 104 * s} L${x + 22 * s} ${y - 60 * s} L${x - 26 * s} ${y - 58 * s}Z" fill="#9db7d8" ${L(1.5)}/>
    ${[0, 1, 2].map(k => `<path d="M${x - 16 * s + k * 12 * s} ${y - 102 * s} L${x - 12 * s + k * 12 * s} ${y - 59 * s}" stroke="#7e9cc2" stroke-width="2"/>`).join('')}`;
}
function armFront(x, y, s = 1) {
  return `<rect x="${x - 50 * s}" y="${y - 8 * s}" width="${100 * s}" height="${34 * s}" rx="${12 * s}" fill="${GREEN}" ${L(2.5)}/>
    <rect x="${x - 62 * s}" y="${y - 40 * s}" width="${26 * s}" height="${68 * s}" rx="${12 * s}" fill="${GREEN_D}" ${L(2.5)}/><rect x="${x + 36 * s}" y="${y - 40 * s}" width="${26 * s}" height="${68 * s}" rx="${12 * s}" fill="${GREEN_D}" ${L(2.5)}/>
    <path d="M${x - 50 * s} ${y + 26 * s} ${Array.from({ length: 5 }, (_, k) => `Q${x - 50 * s + (k + .5) * 20 * s} ${y + 36 * s} ${x - 50 * s + (k + 1) * 20 * s} ${y + 26 * s}`).join(' ')}" fill="#fdf5e8" ${L(1.4)}/>
    <path d="M${x - 44 * s} ${y + 30 * s} L${x - 46 * s} ${y + 46 * s} M${x + 44 * s} ${y + 30 * s} L${x + 46 * s} ${y + 46 * s}" ${L(3)}/>`;
}
function roundTable(x, y) {
  return `<path d="M${x - 6} ${y + 12} L${x - 6} ${y + 60} L${x + 6} ${y + 60} L${x + 6} ${y + 12}Z" fill="#8a5a48" ${L(1.5)}/><ellipse cx="${x}" cy="${y + 62}" rx="26" ry="7" fill="#8a5a48" ${L(1.5)}/>
    <ellipse cx="${x}" cy="${y + 10}" rx="56" ry="18" fill="#f1ebe2" ${L(2)}/>
    <path d="M${x - 12} ${y + 6} L${x + 12} ${y + 6} L${x + 9} ${y - 10} L${x - 9} ${y - 10}Z" fill="#fffaf2" ${L(1.5)}/>
    ${[-8, 0, 8].map((dx, i) => `<path d="M${x + dx} ${y - 10} q${-6 + i * 6} -14 ${dx / 2} -18 q6 8 ${-dx / 2} 18z" fill="#86b880" ${L(1.2)}/>`).join('')}`;
}


/* ---------- Chaises de café en bois tournées de ~40° + table ronde à nappe fleurie (d'après characters/customsit.jpg) ---------- */
const WOODC = '#e3c79a', WOODC_D = '#c9a877', MINT = '#a9d8c8', MINT_D = '#8cc4b2';
const dots = (pts, r = 2.6) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f2a2b4"/>`).join('');
const flower = (x, y, r = 3) => `<g>${[0, 72, 144, 216, 288].map(a => `<circle cx="${(x + Math.cos(a * Math.PI / 180) * r * .9).toFixed(1)}" cy="${(y + Math.sin(a * Math.PI / 180) * r * .9).toFixed(1)}" r="${r * .62}" fill="#f49ab0"/>`).join('')}<circle cx="${x}" cy="${y}" r="${r * .45}" fill="#fff6e0"/></g>`;
/** Dossier en arc (bois clair + coussin menthe fleuri), d'après characters/customsit.jpg.
 *  dir = -1 : chaise à gauche tournée vers la table ; +1 : à droite ; 0 : derrière la table, face à nous. */
function chairBack(x, y, s = 1, dir = 0) {
  // toutes les chaises ont la même forme et la même taille
  const t = `translate(${x} ${y}) scale(${s})`; void dir;
  return `<g transform="${t}">
    <path d="M-34 2 L-34 -84 Q-34 -122 0 -122 Q34 -122 34 -84 L34 2" fill="none" stroke="${LN}" stroke-width="13" stroke-linecap="round"/>
    <path d="M-34 2 L-34 -84 Q-34 -122 0 -122 Q34 -122 34 -84 L34 2" fill="none" stroke="${WOODC}" stroke-width="8" stroke-linecap="round"/>
    <path d="M-26 -8 L-26 -82 Q-26 -112 0 -112 Q26 -112 26 -82 L26 -8Z" fill="${MINT}" ${L(1.8)}/>
    ${[[-12, -92], [10, -96], [-2, -74], [14, -62], [-14, -52], [4, -40], [-10, -24], [14, -22]].map(([fx, fy]) => flower(fx, fy, 3.4)).join('')}
  </g>`;
}
/** Assise ronde et pieds cambrés (derrière les jambes du client). */
function chairSeat(x, y, s = 1, dir = 0) {
  const r = 0;
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
    ${[[-30, 8, -36, 52], [30, 8, 36, 52], [-14, 12, -12, 48], [14, 12, 12, 48]].map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1} Q${(x1 + x2) / 2 + (x1 < 0 ? -6 : 6)} ${(y1 + y2) / 2} ${x2} ${y2}" fill="none" stroke="${LN}" stroke-width="7" stroke-linecap="round"/><path d="M${x1} ${y1} Q${(x1 + x2) / 2 + (x1 < 0 ? -6 : 6)} ${(y1 + y2) / 2} ${x2} ${y2}" fill="none" stroke="${WOODC}" stroke-width="3.5" stroke-linecap="round"/>`).join('')}
    <ellipse cx="0" cy="8" rx="42" ry="13" fill="${WOODC}" ${L(2.2)}/>
    <ellipse cx="0" cy="2" rx="40" ry="13" fill="${MINT}" ${L(2)}/>
    ${[[-18, 1], [4, -2], [22, 3], [-4, 7]].map(([fx, fy]) => flower(fx, fy, 2.8)).join('')}
  </g>`;
}
/** Table ronde, longue nappe fleurie, théière et tasses. */
function tableCloth(x, y) {
  const hem = Array.from({ length: 8 }, (_, i) => `Q${x - 74 + i * 18.5 + 9} ${y + 92} ${x - 74 + (i + 1) * 18.5} ${y + 84}`).join(' ');
  return `<path d="M${x - 72} ${y} Q${x - 78} ${y + 52} ${x - 74} ${y + 84} ${hem} Q${x + 78} ${y + 52} ${x + 72} ${y}Z" fill="#fdf5e8" ${L(2)}/>
    ${[-56, -30, -4, 22, 48].map((dx, i) => `<g transform="translate(${x + dx} ${y + 78 - (i % 2) * 4})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${Math.cos(a * Math.PI / 180) * 4}" cy="${Math.sin(a * Math.PI / 180) * 4}" rx="3.6" ry="3.6" fill="#f2a2b4"/>`).join('')}<circle r="2.4" fill="#f6d27a"/></g>`).join('')}
    <ellipse cx="${x}" cy="${y}" rx="72" ry="22" fill="#fffaf2" ${L(2)}/>
    <ellipse cx="${x}" cy="${y + 2}" rx="30" ry="8" fill="#f6dfe4" opacity=".7"/>
    ${[[-16, -40, -12], [-4, -50, -3], [10, -44, 8], [20, -36, 16], [-22, -30, -20], [2, -38, 2]].map(([dx, dy]) => `<path d="M${x} ${y - 16} Q${x + dx * 0.4} ${y + dy / 2} ${x + dx} ${y + dy}" fill="none" stroke="#6f957d" stroke-width="2"/>`).join('')}
    ${[[-12, -26, 14], [12, -28, -14]].map(([dx, dy, a]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="7" ry="3" fill="#86b880" ${L(1)} transform="rotate(${a} ${x + dx} ${y + dy})"/>`).join('')}
    ${[[-16, -40, '#f2a2b4'], [-4, -50, '#fffaf2'], [10, -44, '#f6d27a'], [20, -36, '#f2a2b4'], [-22, -30, '#c7a6e6'], [2, -38, '#e86a5f']].map(([dx, dy, c]) => `<g transform="translate(${x + dx} ${y + dy})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 3.6).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 3.6).toFixed(1)}" r="3" fill="${c}" stroke="${LN}" stroke-width=".8"/>`).join('')}<circle r="2" fill="#f6b84a"/></g>`).join('')}
    <path d="M${x - 9} ${y - 18} Q${x - 13} ${y - 2} ${x - 7} ${y + 4} L${x + 7} ${y + 4} Q${x + 13} ${y - 2} ${x + 9} ${y - 18}Z" fill="#cfe6f2" fill-opacity=".85" ${L(1.6)}/>
    <path d="M${x - 6} ${y - 8} Q${x} ${y - 5} ${x + 6} ${y - 8}" fill="none" stroke="#9cc4dc" stroke-width="1.5"/>`;
}

/* ---------- Grande plante ---------- */
function plant(x, y) {
  // petit olivier en pot : tronc tordu, branches, grappes de feuilles pointues
  const lf = (lx, ly, a, c) => `<path d="M0 0 Q7 -5 16 0 Q7 5 0 0Z" transform="translate(${lx} ${ly}) rotate(${a})" fill="${c}" stroke="${LN}" stroke-width="1"/>`;
  const branches = [[0, -70, -6, -150, -48, -196], [0, -70, 8, -140, 46, -186], [-3, -120, -30, -150, -62, -146], [4, -118, 30, -132, 58, -128], [-2, -150, 2, -190, -4, -226]];
  let leaves = '', k = 0;
  for (const [, , cx, cy, ex, ey] of branches) for (let i = 0; i < 9; i++) {
    const t = 0.35 + i * 0.08, bx = x + cx + (ex - cx) * t, by = y + cy + (ey - cy) * t, side = i % 2 ? 1 : -1;
    leaves += lf(bx, by, (Math.atan2(ey - cy, ex - cx) * 180 / Math.PI) + side * 55 + ((k * 17) % 20), ['#7fb06e', '#6e9e62', '#94c07f'][k++ % 3]);
  }
  for (const [, , , , ex, ey] of branches) for (let i = 0; i < 5; i++) leaves += lf(x + ex, y + ey, i * 72 + k * 9, ['#7fb06e', '#94c07f', '#6e9e62'][(k++) % 3]);
  return `<path d="M${x - 38} ${y} L${x - 30} ${y - 64} L${x + 30} ${y - 64} L${x + 38} ${y}Z" fill="#d9886e" ${L(2)}/><rect x="${x - 40}" y="${y - 74}" width="80" height="14" rx="4" fill="#e3a283" ${L(2)}/>
    <ellipse cx="${x}" cy="${y - 74}" rx="34" ry="5" fill="#6e4a3e"/>
    ${branches.map(([sx, sy, cx, cy, ex, ey]) => `<path d="M${x + sx} ${y + sy} Q${x + cx} ${y + cy} ${x + ex} ${y + ey}" fill="none" stroke="${LN}" stroke-width="${sy === -70 ? 9 : 6}" stroke-linecap="round"/><path d="M${x + sx} ${y + sy} Q${x + cx} ${y + cy} ${x + ex} ${y + ey}" fill="none" stroke="#9c7356" stroke-width="${sy === -70 ? 5 : 3}" stroke-linecap="round"/>`).join('')}
    <path d="M${x} ${y - 72} Q${x - 6} ${y - 100} ${x - 2} ${y - 122}" fill="none" stroke="${LN}" stroke-width="12" stroke-linecap="round"/><path d="M${x} ${y - 72} Q${x - 6} ${y - 100} ${x - 2} ${y - 122}" fill="none" stroke="#9c7356" stroke-width="7" stroke-linecap="round"/>
    ${leaves}`;
}

/* textes du décor, redessinés nets au-dessus du calque pixel */
function roomLabels() {
  const T = (x, y, t, s, c, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${s}" fill="${c}" ${extra}>${t}</text>`;
  return `<g class="roomLabels" pointer-events="none" font-family="Pixelify Sans, monospace" font-weight="700">
    ${T(266, 95, 'Café', 20, P.ink)}${T(548, 95, 'Juice', 20, P.ink)}
    <g transform="rotate(-12 548 150)">${T(548, 155, 'LEVEL 2 · SOON', 13, '#fffaf2')}</g>
    <g transform="rotate(-27 98 182)">${T(98, 187, 'Bakery', 17, P.ink)}</g>
    <g transform="rotate(-40 97 360)">${T(97, 365, 'COMING SOON', 13, '#fffaf2')}</g>
    <g class="md ms">${T(1335, 158, 'Open', 15, '#4f8a6a')}</g><g class="mn">${T(1335, 158, 'Closed', 15, '#c0666a')}</g>
  </g>`;
}

/* ---------- La porte secrète de la Crumb Crew ---------- */
// Petite porte dans le bas du mur de droite, entre le coin et la bibliothèque, à côté du coussin de Moka.
// Elle est là depuis le début mais se fond dans la plinthe : on ne la remarque qu'au niveau 3.
// Le repère suit la pente du mur de droite (skewY) : la base de la porte est posée sur le sol.
const HOLE = { x: 1450, y: 375 };
const WALL = '#ead6bd';
function mouseHole(kind = 'hidden') {
  const arch = (w, hh) => `M${-w} 0 L${-w} ${-hh + w} Q${-w} ${-hh} 0 ${-hh} Q${w} ${-hh} ${w} ${-hh + w} L${w} 0Z`;
  const W = 15, H = 40;
  // le panneau de la porte, peint comme le mur (rainures discrètes, minuscule bouton)
  const panel = (op = 1) => `<path d="${arch(W, H)}" fill="${WALL}" stroke="#dcc5a6" stroke-width="1.2" opacity="${op}"/>
    <path d="M${-W} -10 L${W} -10" stroke="#e3cfb3" stroke-width="7"/><path d="M${-W} -13.5 L${W} -13.5" stroke="#d6bf9f" stroke-width=".8"/>
    <circle cx="${W - 5}" cy="-20" r="1.3" fill="#d6bf9f"/>`;
  const dark = `<path d="${arch(W, H)}" fill="#2a1f26"/><ellipse cx="0" cy="-4" rx="${W - 3}" ry="6" fill="#ffd28a" opacity=".35"/>`;
  const eyes = `<g class="blinkEyes"><circle cx="-11" cy="-16" r="1.9" fill="#ffe9a8"/><circle cx="-6.6" cy="-16.6" r="1.9" fill="#ffe9a8"/></g>`;
  let inner;
  if (kind === 'ajar') {
    // entrouverte : un mince croissant d'ombre, de la lumière chaude… et deux petits yeux
    // + un filet de lumière chaude qui s'étale sur le parquet
    inner = `<path d="M${-W} 0 L${-W + 8} 0 L${-W - 26} 14 L${-W - 40} 14Z" fill="#ffd28a" opacity=".28"/>${dark}${eyes}<g transform="translate(${W} 0) scale(.6 1) translate(${-W} 0)">${panel()}</g>`;
  } else if (kind === 'open') {
    inner = `${dark}<g transform="translate(${W} 0) scale(.22 1) translate(${-W} 0)"><path d="${arch(W, H)}" fill="#d9c2a2" ${L(1.2)}/></g>`;
  } else if (kind === 'door') {
    inner = `<path d="${arch(W + 3, H + 4)}" fill="#7a4e36" ${L(2)}/><path d="${arch(W, H)}" fill="#e8a24a" ${L(1.4)}/>
       <path d="M-5 -2 L-5 -26 M5 -2 L5 -26" stroke="#a8743f" stroke-width="1.4"/>
       <circle cx="0" cy="-23" r="5" fill="#ffd28a" ${L(1.2)}/><path d="M0 -28 L0 -18 M-5 -23 L5 -23" stroke="#a8743f" stroke-width="1"/>
       <circle cx="8" cy="-11" r="1.8" fill="${P.gold}"/>
       <rect x="-11" y="-55" width="22" height="9" rx="2" fill="#fdf1dd" ${L(1)}/><text x="0" y="-48.5" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="5" fill="#6e4a3e">CRUMB CREW</text>
       <ellipse cx="0" cy="1" rx="14" ry="2.4" fill="#e86a5f" ${L(1)}/>`;
  } else inner = panel();
  return `<g id="mouseHole" transform="translate(${HOLE.x} ${HOLE.y}) skewY(56.3)">${inner}</g>`;
}

export { HOLE, mouseHole, roomLabels, LN, L, ch, shell, lamps, backWall, station, counter, sofaBack, sofaFront, grandmaLap, recordPlayer, rug, armBack, armFront, roundTable, chairBack, chairSeat, tableCloth, plant };
