/* Café Komorebi — palette et dessin des personnages (SVG) */
/* ---------- Palette (reprise du diorama) ---------- */
const P = {
  ink: '#3b2838', sage: '#93b89f', sageD: '#7fa48c', sageDD: '#6f957d', cream: '#f6e7cf', trim: '#fdf5e8', paper: '#fffaf2',
  peach: '#f4c6b2', coral: '#ee9c8c', coralD: '#d9886e', wood: '#b07b5f', brown: '#8a5a48', dark: '#5b4450',
  navy: '#56669a', shutter: '#a7c0dd', shutterD: '#8ea8c8', gold: '#dcb872', bronze: '#c08a4e', red: '#e86a5f',
  pink: '#f6b0b5', nose: '#f39aa6', catCream: '#f8eddd', catOrange: '#f2b27a', iron: '#4a5068', screen: '#3d3a4a', lamp: '#ffd28a',
  skin: '#fde3d0', fur: '#e3995b', furCream: '#fbebd5', grey: '#9aa3b8', greyL: '#c9cfdc', mouse: '#cfc1b8', mouseL: '#e8ddd5'
};
const O = `stroke="${P.ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
const limb = (d, c, w) => `<path d="${d}" fill="none" stroke="${P.ink}" stroke-width="${w + 5}" stroke-linecap="round"/><path d="${d}" fill="none" ${String(c).startsWith('var(') ? `style="stroke:${c}"` : `stroke="${c}"`} stroke-width="${w}" stroke-linecap="round"/>`;
const shadow = (rx = 44, cx = 100) => `<ellipse cx="${cx}" cy="247" rx="${rx}" ry="7" fill="${P.ink}" opacity=".14"/>`;
const sparkle = (x, y, s, c = '#fff6c8') => `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z" fill="${c}" stroke="${P.ink}" stroke-width="1.2"/>`;
const leaf = (x, y, s, c) => `<path d="M${x - s} ${y + s * .6} Q${x - s} ${y - s} ${x + s} ${y - s * .6} Q${x + s * .6} ${y + s} ${x - s} ${y + s * .6}Z" fill="${c}"/>`;
const gear = (cx, cy, r, c) => {
  let d = '';
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, R = i % 2 ? r : r * 1.32; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * R).toFixed(1) + ' ' + (cy + Math.sin(a) * R).toFixed(1); }
  return `<path d="${d}Z" fill="${c}" stroke="${P.ink}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r * .4}" fill="${P.ink}"/>`;
};
const eyes = (y, gap, iris, rx = 7.5, ry = 10) => [100 - gap, 100 + gap].map(x =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#4a3346"/><ellipse cx="${x}" cy="${y + ry * .35}" rx="${rx * .68}" ry="${ry * .45}" fill="${iris}"/>` +
  `<circle cx="${x + rx * .35}" cy="${y - ry * .35}" r="${rx * .4}" fill="#fff"/><circle cx="${x - rx * .3}" cy="${y + ry * .45}" r="${rx * .2}" fill="#fff"/>`).join('');

/* ---------- Les héros (garçon / fille) ---------- */
// Couleurs d'uniforme pilotées par CSS (variables) : espresso = brun foncé, noir = noir
const U = k => `style="fill:var(--${k})"`;
const catLogo = (x, y, s, c = P.gold) => `<path d="M${x - s} ${y - s * .2} L${x - s * .8} ${y - s * 1.2} L${x - s * .3} ${y - s * .7} L${x + s * .3} ${y - s * .7} L${x + s * .8} ${y - s * 1.2} L${x + s} ${y - s * .2} Q${x + s} ${y + s} ${x} ${y + s} Q${x - s} ${y + s} ${x - s} ${y - s * .2}Z" fill="${c}" stroke="${P.ink}" stroke-width="1.2"/>`;
function hero(g) {
  const F = g === 'f';
  const hair = F ? '#8a5242' : '#3f3548';
  const top = F ? '#a8705a' : '#aea2cc', topD = F ? '#946150' : '#9a8ebb';
  const jeans = F ? '#a3bcdc' : '#7686b2';
  const name = F ? 'HANA' : 'REN';
  const cup = '#f4f1ec';
  return `
  ${shadow(42)}
  <g class="burst">${[[40, 70], [160, 60], [30, 170], [170, 165], [100, 18], [60, 230], [145, 230]].map(([x, y], i) => sparkle(x, y, 9 + (i % 3) * 3)).join('')}
    <circle cx="100" cy="140" r="90" fill="none" stroke="#fff6c8" stroke-width="5" opacity=".7"/></g>
  <g class="bob" style="transform-origin:100px 245px">
    ${F ? `<path class="only o-city" d="M50 92 Q46 34 100 30 Q154 34 150 92 Q156 130 148 160 Q156 182 140 194 Q128 188 126 172 L74 172 Q72 188 60 194 Q44 182 52 160 Q44 130 50 92Z" fill="${hair}" ${O}/>` : ''}
    <!-- jambes : ville -->
    <g class="only o-city">${F
      ? `<g class="hlegL" style="transform-origin:93px 202px"><path d="M87 200 L78 236 L98 236 L99.5 206Z" fill="${jeans}" ${O}/><path d="M80 230 L97 230" stroke="#6d8fb8" stroke-width="2"/><ellipse cx="88" cy="239" rx="11" ry="4.5" fill="${P.paper}" ${O}/></g>
         <g class="hlegR" style="transform-origin:107px 202px"><path d="M113 200 L122 236 L102 236 L100.5 206Z" fill="${jeans}" ${O}/><path d="M103 230 L120 230" stroke="#6d8fb8" stroke-width="2"/><ellipse cx="112" cy="239" rx="11" ry="4.5" fill="${P.paper}" ${O}/></g>`
      : `<g class="hlegL" style="transform-origin:90px 202px">${limb('M90 202 L88 230', jeans, 15)}<ellipse cx="86" cy="236" rx="12" ry="6.5" fill="${P.paper}" ${O}/><path d="M77 236 L95 236" stroke="${P.coral}" stroke-width="2"/></g>
         <g class="hlegR" style="transform-origin:110px 202px">${limb('M110 202 L112 230', jeans, 15)}<ellipse cx="114" cy="236" rx="12" ry="6.5" fill="${P.paper}" ${O}/><path d="M105 236 L123 236" stroke="${P.coral}" stroke-width="2"/></g>`}</g>
    <!-- jambes : uniforme -->
    <g class="only o-uniform">
      <path d="M90 202 L88 230" fill="none" stroke="${P.ink}" stroke-width="20" stroke-linecap="round"/><path d="M90 202 L88 230" fill="none" style="stroke:var(--pants)" stroke-width="15" stroke-linecap="round"/>
      <path d="M110 202 L112 230" fill="none" stroke="${P.ink}" stroke-width="21" stroke-linecap="round"/><path d="M110 202 L112 230" fill="none" style="stroke:var(--pants)" stroke-width="15" stroke-linecap="round"/>
      <g class="pop d4" style="transform-origin:100px 236px"><ellipse cx="86" cy="236" rx="12" ry="6.5" fill="#2a2630" ${O}/><ellipse cx="114" cy="236" rx="12" ry="6.5" fill="#2a2630" ${O}/>
      <path d="M80 233 Q84 231 88 233 M108 233 Q112 231 116 233" stroke="#8a8aa0" stroke-width="1.5" fill="none"/></g></g>
    <rect x="93" y="120" width="14" height="14" fill="${P.skin}" ${O}/>
    <!-- tenue de ville -->
    <g class="only o-city">
      ${limb('M78 144 Q66 164 70 184', top, 14)}${limb('M122 144 Q134 164 130 184', top, 14)}
      <path d="M76 148 Q76 132 92 130 L108 130 Q124 132 124 148 L122 204 Q100 210 78 204 Z" fill="${top}" ${O}/>
      <path d="M113 133 Q124 136 123 150 L121 203 Q114 206 108 206 Q116 170 113 133Z" fill="${topD}" opacity=".7"/>
      ${F ? `<path d="M90 131 Q100 142 110 131" fill="${P.skin}" ${O}/>
             <path d="M94 136 L100 150 L106 136" fill="none" stroke="${P.ink}" stroke-width="1.5"/><rect x="96" y="148" width="8" height="8" rx="1.5" fill="${P.cream}" stroke="${P.ink}" stroke-width="1.8"/><rect x="98.5" y="150.5" width="3" height="3" fill="${P.ink}"/>
             <path d="M80 198 Q100 204 120 198" fill="none" stroke="${P.ink}" stroke-width="2"/>`
          : `<path d="M82 134 Q100 150 118 134 Q114 124 100 124 Q86 124 82 134Z" fill="${topD}" ${O}/>
             <path d="M95 140 L94 160 M105 140 L106 160" stroke="${P.paper}" stroke-width="2.2" stroke-linecap="round"/>
             <path d="M86 182 L114 182 L118 200 L82 200Z" fill="${topD}" ${O}/>
             <path d="M80 128 Q100 160 120 128" fill="none" stroke="${P.ink}" stroke-width="10" stroke-linecap="round"/><path d="M80 128 Q100 160 120 128" fill="none" stroke="#2e2a33" stroke-width="5" stroke-linecap="round"/>
             <circle cx="80" cy="131" r="9" fill="#2e2a33" ${O}/><circle cx="120" cy="131" r="9" fill="#2e2a33" ${O}/><circle cx="78" cy="128" r="2.5" fill="#6e6a80"/><circle cx="118" cy="128" r="2.5" fill="#6e6a80"/>`}
      <circle cx="70" cy="188" r="7" fill="${P.skin}" ${O}/><circle cx="130" cy="188" r="7" fill="${P.skin}" ${O}/>
    </g>
    <!-- uniforme -->
    <g class="only o-uniform">
      <path d="M78 144 Q66 164 70 186" fill="none" stroke="${P.ink}" stroke-width="19" stroke-linecap="round"/><path d="M78 144 Q66 164 70 186" fill="none" style="stroke:var(--shirt)" stroke-width="13" stroke-linecap="round"/>
      <path d="M122 144 Q134 164 130 186" fill="none" stroke="${P.ink}" stroke-width="19" stroke-linecap="round"/><path d="M122 144 Q134 164 130 186" fill="none" style="stroke:var(--shirt)" stroke-width="13" stroke-linecap="round"/>
      <path d="M76 148 Q76 132 92 130 L108 130 Q124 132 124 148 L122 204 Q100 210 78 204 Z" ${U('shirt')} ${O}/>
      <path d="M91 130 L100 141 L109 130" ${U('collar')} ${O}/>
      <g class="pop d1" style="transform-origin:100px 180px">
        <path d="M86 150 L92 131 M114 150 L108 131" stroke="${P.ink}" stroke-width="9" stroke-linecap="round"/><path d="M86 150 L92 131 M114 150 L108 131" style="stroke:var(--apron)" stroke-width="4" stroke-linecap="round"/>
        <path d="M82 150 L118 150 L121 220 Q100 226 79 220 Z" ${U('apron')} ${O}/>
        <path d="M110 151 L118 151 L121 219 Q114 222 108 222 Q114 190 110 151Z" ${U('apronD')}/>
        <path d="M85 154 L115 154 L117.5 216 Q100 221 82.5 216Z" fill="none" stroke="${P.gold}" stroke-width="1.3" stroke-dasharray="3 2.5" opacity=".9"/>
        <rect x="88" y="190" width="24" height="14" rx="3" ${U('apronD')} stroke="${P.gold}" stroke-width="1.5" stroke-dasharray="2.5 2"/>
        ${catLogo(100, 197, 4.2)}
      </g>
      <g class="pop d3" style="transform-origin:100px 166px">
        <rect x="84" y="160" width="32" height="12" rx="6" fill="#e3c06e" stroke="${P.ink}" stroke-width="2"/>
        <rect x="86.5" y="162.3" width="27" height="7.4" rx="3.7" fill="none" stroke="#a87c3a" stroke-width="1"/>
        <text class="brooch-name" x="100" y="168.6" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="6.2" letter-spacing=".6" fill="#5a3a2e">${name}</text>
        <path d="M87 163.5 L90 163.5" stroke="#fff4cc" stroke-width="1.4" stroke-linecap="round"/>
        <g style="animation:shine 3.2s infinite;transform-origin:115px 161px">${sparkle(115, 161, 7)}</g></g>
      <circle cx="70" cy="190" r="7" fill="${P.skin}" ${O}/><circle cx="130" cy="190" r="7" fill="${P.skin}" ${O}/>
      <g class="pop d2" style="transform-origin:70px 182px"><rect x="62" y="178" width="16" height="7" rx="2" fill="#2a2630"/><circle cx="70" cy="181.5" r="2.6" fill="${P.gold}"/></g>
    </g>
    <!-- tête -->
    <g style="animation:sway 7s ease-in-out infinite;transform-origin:100px 130px">
      ${F ? `<g class="only o-uniform"><path d="M134 70 Q172 78 168 128 Q164 160 148 172 Q156 140 148 112 Q144 90 130 84Z" fill="${hair}" ${O}/>
              <path d="M150 96 Q160 110 158 128" fill="none" stroke="#fff" stroke-width="2.5" opacity=".2" stroke-linecap="round"/>
              <ellipse cx="138" cy="80" rx="6" ry="8" fill="${P.gold}" stroke="${P.ink}" stroke-width="2"/></g>` : ''}
      <path d="M52 94 Q50 36 100 32 Q150 36 148 94 Q148 116 138 122 L62 122 Q52 116 52 94Z" fill="${hair}" ${O}/>
      <ellipse cx="58" cy="100" rx="7" ry="9" fill="${P.skin}" ${O}/><ellipse cx="142" cy="100" rx="7" ry="9" fill="${P.skin}" ${O}/>
      <ellipse cx="100" cy="96" rx="42" ry="38" fill="${P.skin}" ${O}/>
      <g class="blink" style="transform-origin:100px 103px">${F ? eyes(103, 16, '#8a5a48', 8, 10.5) : eyes(104, 16, '#5b4450', 6.5, 8)}</g>
      <g class="winkEye"><ellipse cx="116" cy="${F ? 103 : 104}" rx="10.5" ry="12.5" fill="${P.skin}"/><path d="M108 ${F ? 105 : 106} Q116 ${F ? 97 : 98} 124 ${F ? 105 : 106}" fill="none" stroke="${P.ink}" stroke-width="3" stroke-linecap="round"/></g>
      ${F ? `<path d="M74 96 Q82 90 92 94 M108 94 Q118 90 126 96" fill="none" stroke="${P.ink}" stroke-width="3" stroke-linecap="round"/>` : ''}
      <path d="${F ? 'M77 85 Q84 82 90 85 M110 85 Q116 82 123 85' : 'M75 88 Q84 84 92 88 M108 88 Q116 84 125 88'}" fill="none" stroke="${P.ink}" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="72" cy="115" rx="7" ry="4" fill="${P.pink}" opacity=".85"/><ellipse cx="128" cy="115" rx="7" ry="4" fill="${P.pink}" opacity=".85"/>
      ${F ? `<ellipse cx="100" cy="119" rx="3" ry="3.4" fill="#c66a72" stroke="${P.ink}" stroke-width="1.8"/>` : `<path d="M95 118 Q100 122 106 118" fill="none" stroke="${P.ink}" stroke-width="2.5" stroke-linecap="round"/>`}
      ${F
        ? `<path d="M56 100 Q48 40 100 38 Q152 40 144 100 Q142 74 120 60 Q112 76 100 62 Q90 78 80 60 Q60 72 56 100Z" fill="${hair}" ${O}/>
           <path class="only o-city" d="M56 94 Q46 128 56 156 Q62 160 66 152 Q60 136 64 112 Q62 100 60 94Z" fill="${hair}" ${O}/>
           <path class="only o-city" d="M144 94 Q154 128 144 156 Q138 160 134 152 Q140 136 136 112 Q138 100 140 94Z" fill="${hair}" ${O}/>
           <path class="only o-uniform" d="M56 96 Q50 116 58 132 Q64 128 64 116 Q62 104 60 96Z" fill="${hair}" ${O}/>
           <path d="M78 52 Q92 44 108 46" fill="none" stroke="#fff" stroke-width="3" opacity=".25" stroke-linecap="round"/>`
        : `<path d="M54 100 Q46 42 100 38 Q154 42 146 100 Q142 82 134 74 Q132 88 122 90 Q124 78 118 70 Q110 88 98 90 Q102 76 96 66 Q88 84 76 86 Q78 78 74 72 Q62 82 54 100Z" fill="${hair}" ${O}/>
           <path d="M96 66 Q92 84 86 100 Q96 90 102 74Z" fill="${hair}" ${O}/>
           <path d="M70 52 Q86 44 104 46" fill="none" stroke="#fff" stroke-width="3" opacity=".18" stroke-linecap="round"/>
           <path class="only o-city" d="M108 40 Q114 24 128 30 Q116 32 114 42" fill="${hair}" ${O}/>
           <circle cx="84" cy="104" r="12.5" fill="#fff" fill-opacity=".18" stroke="${P.ink}" stroke-width="2.6"/><circle cx="116" cy="104" r="12.5" fill="#fff" fill-opacity=".18" stroke="${P.ink}" stroke-width="2.6"/>
           <path d="M96.5 103 Q100 100 103.5 103 M71.5 102 L60 99 M128.5 102 L140 99" fill="none" stroke="${P.ink}" stroke-width="2.4" stroke-linecap="round"/>
           <path d="M77 98 L82 94" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`}
      ${F ? `<g class="only o-city">
           <path d="M52 98 Q50 26 100 24 Q150 26 148 98" fill="none" stroke="${P.ink}" stroke-width="12" stroke-linecap="round"/><path d="M52 98 Q50 26 100 24 Q150 26 148 98" fill="none" stroke="${cup}" stroke-width="6" stroke-linecap="round"/>
           <ellipse cx="52" cy="104" rx="11" ry="15" fill="${cup}" ${O}/><ellipse cx="148" cy="104" rx="11" ry="15" fill="${cup}" ${O}/>
           <ellipse cx="52" cy="104" rx="5" ry="9" fill="#b9b4ae"/><ellipse cx="148" cy="104" rx="5" ry="9" fill="#b9b4ae"/></g>` : ''}
      <g class="only o-uniform"><g class="pop d1" style="transform-origin:100px 60px">
        <path d="M54 78 Q56 34 100 32 Q144 34 146 78 Q100 68 54 78Z" ${U('cap')} ${O}/>
        <path d="M55 72 Q100 62 145 72 L145 76 Q100 66 55 76Z" fill="${P.gold}"/>
        <path d="M60 78 Q100 66 140 78 Q144 89 100 87 Q56 89 60 78Z" ${U('brim')} ${O}/>
        ${catLogo(100, 51, 6)}
      </g></g>
    </g>
  </g>`;
}

/* ---------- Moka (chat gris et blanc, toujours un peu agacé) ---------- */
const heart = (x, y, s = 1) => `<path d="M${x} ${y + 5 * s} C${x - 9 * s} ${y - 2 * s} ${x - 5 * s} ${y - 9 * s} ${x} ${y - 4 * s} C${x + 5 * s} ${y - 9 * s} ${x + 9 * s} ${y - 2 * s} ${x} ${y + 5 * s}Z" fill="${P.pink}" stroke="${P.ink}" stroke-width="1.5"/>`;
const zzz = (x, y, c) => `<text class="zz" x="${x}" y="${y}" font-family="Fraunces,serif" font-size="20" font-style="italic" fill="${c}">z</text>
  <text class="zz b" x="${x + 6}" y="${y - 6}" font-family="Fraunces,serif" font-size="15" font-style="italic" fill="${c}">z</text>
  <text class="zz c" x="${x - 4}" y="${y - 4}" font-family="Fraunces,serif" font-size="12" font-style="italic" fill="${c}">z</text>`;
function moka() {
  const g = '#a6abb7', w = '#f7f5f2', coat = '#5d5a8f', coatD = '#4c4a7c', gold = '#e3c06e';
  const annoyed = [82, 118].map(x => `<ellipse cx="${x}" cy="136" rx="8" ry="8" fill="#e8c65e" stroke="${P.ink}" stroke-width="2"/><ellipse cx="${x}" cy="137.5" rx="3" ry="5.5" fill="${P.ink}"/><circle cx="${x + 2.6}" cy="137" r="1.8" fill="#fff"/>
    <path d="M${x - 9} 135.5 Q${x} 127 ${x + 9} 135.5 L${x + 9} 126 L${x - 9} 126Z" fill="${g}"/><path d="M${x - 9} 135.5 Q${x} 132 ${x + 9} 135.5" fill="none" stroke="${P.ink}" stroke-width="2.4" stroke-linecap="round"/>`).join('');
  // casquette de concierge (visière + patte dorée)
  const cap = (cx, cy, s = 1) => `<g class="costume mcap" style="transform-origin:${cx}px ${cy + 14 * s}px">
    <path d="M${cx - 30 * s} ${cy + 8 * s} Q${cx - 32 * s} ${cy - 16 * s} ${cx} ${cy - 18 * s} Q${cx + 32 * s} ${cy - 16 * s} ${cx + 30 * s} ${cy + 8 * s}Z" style="fill:var(--mcoat,${coat})" ${O}/>
    <path d="M${cx - 31 * s} ${cy + 4 * s} Q${cx} ${cy - 2 * s} ${cx + 31 * s} ${cy + 4 * s} L${cx + 31 * s} ${cy + 9 * s} Q${cx} ${cy + 3 * s} ${cx - 31 * s} ${cy + 9 * s}Z" fill="${gold}"/>
    <path d="M${cx - 26 * s} ${cy + 9 * s} Q${cx} ${cy + 3 * s} ${cx + 26 * s} ${cy + 9 * s} Q${cx + 22 * s} ${cy + 19 * s} ${cx} ${cy + 17 * s} Q${cx - 22 * s} ${cy + 19 * s} ${cx - 26 * s} ${cy + 9 * s}Z" fill="#2e2a40" ${O}/>
    <circle cx="${cx}" cy="${cy - 6 * s}" r="${7 * s}" fill="${gold}" stroke="${P.ink}" stroke-width="1.5"/>
    ${[-1, 0, 1].map(k => `<circle cx="${cx + k * 3 * s}" cy="${cy - 10 * s}" r="${1.3 * s}" fill="#a87c3a"/>`).join('')}<circle cx="${cx}" cy="${cy - 5 * s}" r="${2.2 * s}" fill="#a87c3a"/></g>`;
  return `
  ${shadow(40)}
  <g class="only o-cuddle">${[[56, 112, 0], [150, 120, .7], [62, 160, 1.4]].map(([x, y, d]) => `<g style="animation:mote 2.2s ${d}s infinite;transform-origin:${x}px ${y}px">${heart(x, y)}</g>`).join('')}</g>
  ${zzz(140, 96, P.navy)}
  <g class="bob" style="transform-origin:100px 245px">
  <g class="mseat">
    <g class="mtail" style="transform-origin:126px 232px">${limb('M126 232 Q162 230 162 200 Q162 178 150 172', g, 12)}<circle cx="150" cy="171" r="7" fill="${w}" stroke="${P.ink}" stroke-width="2.4"/></g>
    <path d="M68 242 Q60 196 84 174 L116 174 Q140 196 132 242 Z" fill="${g}" ${O}/>
    <path d="M86 182 Q100 238 114 182 Q100 190 86 182Z" fill="${w}"/>
    <!-- veste de concierge -->
    <g class="costume">
      <path d="M72 238 Q66 198 86 178 L114 178 Q134 198 128 238 Q100 244 72 238Z" style="fill:var(--mcoat,${coat})" ${O}/>
      <path d="M114 180 Q132 200 127 237 Q120 240 112 240 Q120 206 114 180Z" style="fill:var(--mcoatD,${coatD})" opacity=".8"/>
      <path d="M86 178 L100 200 L114 178" fill="${w}" ${O}/>
      ${[[92, 210], [108, 210], [92, 224], [108, 224]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${gold}" stroke="${P.ink}" stroke-width="1.3"/>`).join('')}
      <path d="M74 232 Q100 238 126 232" fill="none" stroke="${gold}" stroke-width="2"/>
    </g>
    <ellipse class="pawL" cx="88" cy="240" rx="11" ry="7" fill="${w}" ${O}/>
    <g class="only o-rest pawR"><ellipse cx="112" cy="240" rx="11" ry="7" fill="${w}" ${O}/></g>
    <g class="only o-guide"><g style="animation:wave .6s ease-in-out infinite alternate;transform-origin:114px 212px">
      ${limb('M114 214 Q130 206 140 190', g, 12)}<circle cx="142" cy="188" r="8" fill="${w}" ${O}/><circle cx="141" cy="186" r="2.5" fill="${P.pink}"/></g>${sparkle(164, 176, 7)}${sparkle(170, 196, 5)}</g>
    <g class="mhead" style="transform-origin:100px 172px"><g style="animation:sway 6s ease-in-out infinite;transform-origin:100px 172px">
      <path d="M62 128 L60 86 L94 106Z" fill="${g}" ${O}/><path d="M67 120 L66 96 L84 109Z" fill="${P.pink}"/>
      <g style="animation:twitch 4s infinite;transform-origin:120px 110px"><path d="M138 128 L140 86 L106 106Z" fill="${g}" ${O}/><path d="M133 120 L134 96 L116 109Z" fill="${P.pink}"/></g>
      <ellipse cx="100" cy="134" rx="46" ry="38" fill="${g}" ${O}/>
      <path d="M95 98 Q100 96 105 98 L108 132 L92 132Z" fill="${w}"/>
      <path d="M66 148 Q72 132 90 133 Q100 138 110 133 Q128 132 134 148 Q131 170 100 171 Q69 170 66 148Z" fill="${w}"/>
      <path d="M70 108 L78 112 M70 114 L77 116 M130 108 L122 112 M130 114 L123 116" stroke="#8c91a0" stroke-width="2.4" stroke-linecap="round"/>
      <g class="only o-awake"><g class="blink" style="transform-origin:100px 136px">${annoyed}</g>
        <path d="M74 122 L89 126 M126 122 L111 126" stroke="${P.ink}" stroke-width="2.5" stroke-linecap="round"/></g>
      <g class="only o-sleep"><path d="M75 137 Q82 142 89 137 M111 137 Q118 142 125 137" fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/>
        <g style="animation:snot 2.6s ease-in-out infinite;transform-origin:108px 152px"><circle cx="113" cy="150" r="7" fill="#dff0fb" fill-opacity=".8" stroke="${P.ink}" stroke-width="1.5"/><circle cx="111" cy="148" r="1.8" fill="#fff"/></g></g>
      <g class="only o-cuddle"><path d="M75 139 Q82 132 89 139 M111 139 Q118 132 125 139" fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M74 124 L89 128 M126 124 L111 128" stroke="${P.ink}" stroke-width="2.5" stroke-linecap="round"/></g>
      <path d="M95 148 L105 148 L100 154Z" fill="${P.nose}" stroke="${P.ink}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M100 154 Q96 158 92 157 M100 154 Q104 158 108 157" fill="none" stroke="${P.ink}" stroke-width="2" stroke-linecap="round"/>
      <path d="M70 146 L50 141 M70 151 L50 154 M130 146 L150 141 M130 151 L150 154" stroke="${P.ink}" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="72" cy="153" rx="6.5" ry="3.8" fill="${P.pink}" opacity=".85"/><ellipse cx="128" cy="153" rx="6.5" ry="3.8" fill="${P.pink}" opacity=".85"/>
      <g class="only o-cuddle"><ellipse cx="72" cy="153" rx="9" ry="5" fill="${P.coral}" opacity=".6"/><ellipse cx="128" cy="153" rx="9" ry="5" fill="${P.coral}" opacity=".6"/>
        <text x="22" y="122" font-family="Fraunces,serif" font-style="italic" font-size="13" fill="${P.ink}">hmph</text></g>
      ${cap(100, 98)}
    </g></g>
    <g class="only o-cuddle"><g style="animation:pet .9s ease-in-out infinite;transform-origin:150px 80px">
      ${limb('M198 40 Q170 70 136 92', P.navy, 18)}<ellipse cx="124" cy="100" rx="16" ry="11" fill="#fbe0cc" ${O} transform="rotate(-25 124 100)"/>
      <path d="M112 106 Q116 112 124 112" fill="none" stroke="${P.ink}" stroke-width="1.6"/></g></g>
  </g>
  <!-- marche (vue de profil, tournée vers la droite) -->
  <g class="mwalk">
    <g class="wtail" style="transform-origin:52px 192px">${limb('M52 192 Q30 180 32 150 Q34 132 46 128', g, 11)}<circle cx="46" cy="127" r="6.5" fill="${w}" stroke="${P.ink}" stroke-width="2.2"/></g>
    ${[[64, 'legB'], [124, 'legA']].map(([x, c]) => `<g class="${c}" style="transform-origin:${x}px 204px">${limb(`M${x} 204 L${x} 236`, '#959aa7', 12)}<ellipse cx="${x + 3}" cy="240" rx="9" ry="5.5" fill="${w}" ${O}/></g>`).join('')}
    <ellipse cx="95" cy="196" rx="52" ry="30" fill="${g}" ${O}/>
    <path d="M118 176 Q150 186 144 214 Q130 222 112 220 Q120 200 118 176Z" fill="${w}"/>
    <g class="costume"><path d="M92 168 Q130 164 146 192 Q146 214 128 222 L96 224 Q84 196 92 168Z" style="fill:var(--mcoat,${coat})" ${O}/>
      ${[[118, 190], [118, 206], [132, 192], [132, 207]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${gold}" stroke="${P.ink}" stroke-width="1.2"/>`).join('')}
      <path d="M96 222 Q112 226 128 222" fill="none" stroke="${gold}" stroke-width="2"/></g>
    ${[[80, 'legA'], [140, 'legB']].map(([x, c]) => `<g class="${c}" style="transform-origin:${x}px 206px">${limb(`M${x} 206 L${x} 238`, g, 13)}<ellipse cx="${x + 3}" cy="241" rx="9.5" ry="5.5" fill="${w}" ${O}/></g>`).join('')}
    <g class="whead" style="transform-origin:140px 180px">
      <path d="M118 140 L114 108 L138 124Z" fill="${g}" ${O}/><path d="M121 134 L119 116 L132 126Z" fill="${P.pink}"/>
      <path d="M160 136 L170 106 L146 120Z" fill="${g}" ${O}/><path d="M158 131 L165 113 L150 122Z" fill="${P.pink}"/>
      <ellipse cx="142" cy="152" rx="36" ry="31" fill="${g}" ${O}/>
      <path d="M128 166 Q134 152 150 154 Q166 154 172 164 Q168 182 148 183 Q130 182 128 166Z" fill="${w}"/>
      <g class="blink" style="transform-origin:150px 150px">${[[136, 150], [160, 150]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6.5" ry="7" fill="#e8c65e" stroke="${P.ink}" stroke-width="1.8"/><ellipse cx="${x + 1}" cy="${y + 1}" rx="2.5" ry="4.8" fill="${P.ink}"/><path d="M${x - 7} ${y} Q${x} ${y - 9} ${x + 7} ${y} L${x + 7} ${y - 9} L${x - 7} ${y - 9}Z" fill="${g}"/><path d="M${x - 7} ${y} Q${x} ${y - 3} ${x + 7} ${y}" fill="none" stroke="${P.ink}" stroke-width="2" stroke-linecap="round"/>`).join('')}</g>
      <path d="M164 163 L172 163 L168 168Z" fill="${P.nose}" stroke="${P.ink}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M168 168 Q165 172 161 171" fill="none" stroke="${P.ink}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M150 166 L132 162 M150 170 L133 172" stroke="${P.ink}" stroke-width="1.3" stroke-linecap="round"/>
      <ellipse cx="128" cy="164" rx="5.5" ry="3.2" fill="${P.pink}" opacity=".85"/>
      ${cap(144, 122, 0.82)}
    </g>
  </g>
  <!-- marche de dos (elle s'éloigne) -->
  <g class="mback">
    <g class="mtail" style="transform-origin:100px 214px;animation:sway .8s ease-in-out infinite">${limb('M100 214 Q96 176 108 150 Q116 134 110 120', g, 12)}<circle cx="110" cy="119" r="7" fill="${w}" stroke="${P.ink}" stroke-width="2.4"/></g>
    ${[[86, 'legA'], [114, 'legB']].map(([x, c]) => `<g class="${c}" style="transform-origin:${x}px 222px"><ellipse cx="${x}" cy="240" rx="11" ry="7" fill="${w}" ${O}/></g>`).join('')}
    <path d="M68 242 Q60 196 84 174 L116 174 Q140 196 132 242 Z" fill="${g}" ${O}/>
    <g class="costume"><path d="M70 238 Q64 198 86 178 L114 178 Q136 198 130 238 Q100 244 70 238Z" style="fill:var(--mcoat,${coat})" ${O}/>
      <path d="M100 182 L100 236" stroke="${P.ink}" stroke-width="2" opacity=".5"/><path d="M74 214 Q100 222 126 214" fill="none" stroke="${gold}" stroke-width="3"/>
      <circle cx="90" cy="216" r="3" fill="${gold}" stroke="${P.ink}" stroke-width="1.2"/><circle cx="110" cy="216" r="3" fill="${gold}" stroke="${P.ink}" stroke-width="1.2"/></g>
    <g style="animation:bob .5s ease-in-out infinite;transform-origin:100px 170px">
      <path d="M62 128 L60 86 L94 106Z" fill="${g}" ${O}/><path d="M138 128 L140 86 L106 106Z" fill="${g}" ${O}/>
      <ellipse cx="100" cy="134" rx="46" ry="38" fill="${g}" ${O}/>
      <path d="M70 116 Q100 104 130 116" fill="none" stroke="#8c91a0" stroke-width="3" stroke-linecap="round"/><path d="M76 132 Q100 122 124 132" fill="none" stroke="#8c91a0" stroke-width="3" stroke-linecap="round"/>
      <g class="costume"><path d="M70 106 Q70 78 100 76 Q130 78 130 106 Q100 98 70 106Z" style="fill:var(--mcoat,${coat})" ${O}/><path d="M70 100 Q100 92 130 100 L130 106 Q100 98 70 106Z" fill="${gold}"/></g>
    </g>
  </g>
  </g>`;
}

/* ---------- Biscuit (husky noir et blanc, chien perdu) ---------- */
function biscuit() {
  const d = '#57545f', w = '#f7f5f2', eye = '#8cc4ea';
  const eyeSet = (sad) => [84, 116].map(x => `<ellipse cx="${x}" cy="128" rx="${sad ? 7 : 6}" ry="${sad ? 8 : 7}" fill="${eye}" stroke="${P.ink}" stroke-width="2"/><ellipse cx="${x}" cy="129" rx="3" ry="4" fill="${P.ink}"/><circle cx="${x + 2.2}" cy="125.5" r="2.2" fill="#fff"/>${sad ? `<circle cx="${x - 2.5}" cy="132" r="1.3" fill="#fff"/>` : ''}`).join('');
  // médaille au nom de Biscuit
  const tag = (y) => `<rect x="84" y="${y}" width="32" height="12" rx="6" fill="#e3c06e" stroke="${P.ink}" stroke-width="1.8"/>
    <text x="100" y="${y + 8.6}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="5.6" letter-spacing=".3" fill="#5a3a2e">BISCUIT</text>`;
  return `
  ${shadow(42)}
  ${zzz(140, 96, P.navy)}
  <g class="bob" style="transform-origin:100px 245px"><g class="dseat">
    <g class="only o-tailup"><g class="tailw" style="transform-origin:128px 214px">${limb('M128 214 Q162 208 158 182 Q153 158 132 168 Q143 175 140 188', d, 16)}
      <path d="M140 186 Q146 176 140 170" fill="none" stroke="${w}" stroke-width="5" stroke-linecap="round"/></g></g>
    <g class="only o-taildown">${limb('M126 236 Q150 242 162 228', d, 14)}<path d="M152 236 Q160 234 163 228" fill="none" stroke="${w}" stroke-width="5" stroke-linecap="round"/></g>
    <path d="M66 244 Q58 196 84 174 L116 174 Q142 196 134 244Z" fill="${d}" ${O}/>
    <path d="M82 180 Q100 238 118 180 Q100 192 82 180Z" fill="${w}"/>
    <path d="M78 196 l-5 3 l5 1 l-4 4 l6 -1 M122 196 l5 3 l-5 1 l4 4 l-6 -1" fill="none" stroke="${P.ink}" stroke-width="1.6" stroke-linejoin="round"/>
    ${limb('M88 206 L88 236', w, 14)}${limb('M112 206 L112 236', w, 14)}
    <ellipse cx="88" cy="240" rx="10" ry="6" fill="${w}" ${O}/><ellipse cx="112" cy="240" rx="10" ry="6" fill="${w}" ${O}/>
    <g class="only o-dirt"><ellipse cx="74" cy="226" rx="7" ry="4" fill="#8a6f5a" opacity=".35"/><ellipse cx="121" cy="212" rx="5" ry="3" fill="#8a6f5a" opacity=".3"/></g>
    <g class="only o-bandana"><path d="M78 178 Q100 192 122 178 L100 214Z" style="fill:var(--bandana,#e86a5f)" ${O}/>${tag(186)}</g>
    <g class="only o-rope">
      <path d="M80 180 Q100 194 120 180" fill="none" stroke="${P.ink}" stroke-width="9" stroke-linecap="round"/><path d="M80 180 Q100 194 120 180" fill="none" stroke="#b59a74" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="4 2"/>
      <circle cx="100" cy="189" r="5" fill="#b59a74" stroke="${P.ink}" stroke-width="2"/></g>
    <g class="only o-fray"><path d="M98 194 L95 204 M102 194 L104 205" stroke="#b59a74" stroke-width="2.4" stroke-linecap="round"/></g>
    <g class="only o-tag">${tag(193)}</g>
    <g style="animation:sway 6s ease-in-out infinite;transform-origin:100px 170px">
      <g class="ear-l" style="transform-origin:80px 108px"><path d="M62 124 L66 78 L96 104Z" fill="${d}" ${O}/><path d="M69 116 L71 89 L88 104Z" fill="#f2d6d8"/></g>
      <g class="ear-r" style="transform-origin:120px 108px"><path d="M138 124 L134 78 L104 104Z" fill="${d}" ${O}/><path d="M131 116 L129 89 L112 104Z" fill="#f2d6d8"/></g>
      <ellipse cx="100" cy="130" rx="45" ry="37" fill="${d}" ${O}/>
      <path d="M58 138 Q60 118 76 116 Q88 118 92 108 L100 96 L108 108 Q112 118 124 116 Q140 118 142 138 Q140 165 100 168 Q60 165 58 138Z" fill="${w}"/>
      <path d="M58 140 l-7 -2 l5 -3 l-6 -4 l8 -1 M142 140 l7 -2 l-5 -3 l6 -4 l-8 -1" fill="${w}" stroke="${P.ink}" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="83" cy="111" r="3.2" fill="${w}"/><circle cx="117" cy="111" r="3.2" fill="${w}"/>
      <g class="only o-happy"><g class="blink" style="transform-origin:100px 128px">${eyeSet(false)}</g></g>
      <g class="only o-sad"><g class="blink" style="transform-origin:100px 128px">${eyeSet(true)}</g>
        <path d="M75 116 L90 111 M125 116 L110 111" stroke="${P.ink}" stroke-width="2.4" stroke-linecap="round"/></g>
      <g class="only o-sleep"><path d="M78 129 Q84 133 90 129 M110 129 Q116 133 122 129" fill="none" stroke="${P.ink}" stroke-width="2.5" stroke-linecap="round"/></g>
      <ellipse cx="100" cy="143" rx="6.5" ry="4.5" fill="${P.ink}"/>
      <g class="only o-frown"><path d="M93 152 Q100 148 107 152" fill="none" stroke="${P.ink}" stroke-width="2" stroke-linecap="round"/></g>
      <g class="only o-smile"><path d="M100 147 Q95 153 90 150 M100 147 Q105 153 110 150" fill="none" stroke="${P.ink}" stroke-width="2" stroke-linecap="round"/></g>
      <g class="only o-tongue"><path d="M96 151 Q100 163 104 151Z" fill="${P.nose}" stroke="${P.ink}" stroke-width="1.5"/></g>
      <ellipse cx="73" cy="146" rx="6" ry="3.5" fill="${P.pink}" opacity=".8"/><ellipse cx="127" cy="146" rx="6" ry="3.5" fill="${P.pink}" opacity=".8"/>
      <g class="only o-leaf">${leaf(118, 98, 6, P.catOrange)}<path d="M112 102 L106 106" stroke="${P.ink}" stroke-width="1.4"/></g>
      <g class="only o-patrol"><path d="M68 102 Q70 80 100 78 Q130 80 132 102 Q100 94 68 102Z" fill="${P.navy}" ${O}/>
        <path d="M66 102 Q100 92 134 102 Q136 110 100 106 Q64 110 66 102Z" fill="#46557f" ${O}/>
        <path d="M95 84 L105 84 L105 91 Q100 95 95 91Z" fill="${P.gold}" stroke="${P.ink}" stroke-width="1.5"/></g>
    </g></g>
    <!-- marche de profil (tournée vers la droite) -->
    <g class="dwalk">
      <g class="wtail" style="transform-origin:46px 180px">${limb('M46 182 Q20 170 26 142 Q32 122 50 132 Q40 140 44 152', d, 13)}<path d="M28 146 Q30 132 44 134" fill="none" stroke="${w}" stroke-width="4" stroke-linecap="round"/></g>
      ${[[60, 'legB'], [122, 'legA']].map(([x, c]) => `<g class="${c}" style="transform-origin:${x}px 204px">${limb(`M${x} 204 L${x} 236`, '#e8e6e2', 12)}<ellipse cx="${x + 3}" cy="240" rx="9" ry="5.5" fill="${w}" ${O}/></g>`).join('')}
      <ellipse cx="92" cy="192" rx="58" ry="31" fill="${d}" ${O}/>
      <path d="M60 206 Q92 226 132 204 Q120 218 92 222 Q70 220 60 206Z" fill="${w}"/>
      ${[[76, 'legA'], [138, 'legB']].map(([x, c]) => `<g class="${c}" style="transform-origin:${x}px 206px">${limb(`M${x} 206 L${x} 238`, w, 13)}<ellipse cx="${x + 3}" cy="241" rx="9.5" ry="5.5" fill="${w}" ${O}/></g>`).join('')}
      <path d="M124 170 Q144 182 140 200" fill="none" stroke="${P.ink}" stroke-width="8" stroke-linecap="round"/><path d="M124 170 Q144 182 140 200" fill="none" stroke="#b59a74" stroke-width="4" stroke-linecap="round" stroke-dasharray="4 2"/>
      <g class="whead" style="transform-origin:150px 176px">
        <path d="M130 132 L128 96 L152 116Z" fill="${d}" ${O}/><path d="M134 126 L133 106 L146 118Z" fill="#f2d6d8"/>
        <path d="M166 128 L176 94 L154 112Z" fill="${d}" ${O}/><path d="M164 123 L171 104 L157 115Z" fill="#f2d6d8"/>
        <ellipse cx="150" cy="148" rx="36" ry="31" fill="${d}" ${O}/>
        <path d="M128 156 Q132 136 148 140 L152 128 L158 140 Q172 138 182 152 Q180 176 154 178 Q130 176 128 156Z" fill="${w}"/>
        <g class="blink" style="transform-origin:156px 148px">${[[144, 148], [166, 148]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5.5" ry="6.5" fill="#8cc4ea" stroke="${P.ink}" stroke-width="1.8"/><ellipse cx="${x + 1}" cy="${y + 1}" rx="2.5" ry="3.5" fill="${P.ink}"/><circle cx="${x + 2.4}" cy="${y - 2}" r="1.6" fill="#fff"/>`).join('')}</g>
        <ellipse cx="180" cy="160" rx="6" ry="4.5" fill="${P.ink}"/>
        <path d="M180 165 Q176 170 170 168" fill="none" stroke="${P.ink}" stroke-width="1.8" stroke-linecap="round"/>
        <ellipse cx="138" cy="164" rx="5.5" ry="3.2" fill="${P.pink}" opacity=".85"/>
      </g>
    </g>
  </g>`;
}

/* ---------- Grand-mère ---------- */
function grandma() {
  const hair = '#e6e0e8';
  return `
  ${shadow(40)}
  ${[[60, 150, 0], [146, 132, 1.3], [70, 96, 2.4], [138, 190, 3.1]].map(([x, y, d]) => `<g style="animation:mote 3.8s ${d}s infinite;transform-origin:${x}px ${y}px">${sparkle(x, y, 4, '#fff1c6')}</g>`).join('')}
  <g class="bob slowb" style="transform-origin:100px 245px;animation-duration:4s">
    <g class="gstand">    <path d="M74 188 L126 188 L134 236 Q100 243 66 236Z" fill="${P.sageDD}" ${O}/>
    <path d="M112 190 L126 189 L133 235 Q124 238 116 238Z" fill="#5d8069" opacity=".7"/>
    <ellipse cx="88" cy="240" rx="11" ry="6" fill="${P.brown}" ${O}/><ellipse cx="112" cy="240" rx="11" ry="6" fill="${P.brown}" ${O}/></g>
    <path d="M76 158 Q78 142 92 140 L108 140 Q122 142 124 158 L127 194 L73 194Z" style="fill:var(--gcard,#a7c0dd)" ${O}/>
    <path d="M112 142 Q123 146 124 158 L126 193 L116 193 Q118 166 112 142Z" style="fill:var(--gcardD,#8ea8c8)" opacity=".8"/>
    <path d="M92 140 L100 162 L108 140Z" fill="${P.cream}" ${O}/>
    <circle cx="100" cy="172" r="2.6" fill="${P.paper}" stroke="${P.ink}" stroke-width="1.5"/><circle cx="100" cy="184" r="2.6" fill="${P.paper}" stroke="${P.ink}" stroke-width="1.5"/>
    ${gear(114, 158, 5, P.gold)}
    <g class="only o-read"><g transform="translate(0 -22)">
      ${limb('M80 150 Q72 176 90 184', 'var(--gcard,#a7c0dd)', 12)}${limb('M120 150 Q128 176 110 184', 'var(--gcard,#a7c0dd)', 12)}
      <path d="M70 172 Q85 166 100 174 Q115 166 130 172 L128 196 Q114 190 100 198 Q86 190 72 196Z" fill="#e86a5f" ${O}/>
      <path d="M74 174 Q87 169 100 176 L100 194 Q87 187 76 192Z" fill="#fffaf2" stroke="${P.ink}" stroke-width="1.5"/><path d="M126 174 Q113 169 100 176 L100 194 Q113 187 124 192Z" fill="#fffaf2" stroke="${P.ink}" stroke-width="1.5"/>
      <path d="M80 180 L95 183 M80 186 L94 189 M106 183 L120 180 M106 189 L120 186" stroke="#c9b8a8" stroke-width="1.4"/>
      <circle cx="88" cy="190" r="6" fill="${P.skin}" ${O}/><circle cx="112" cy="190" r="6" fill="${P.skin}" ${O}/>
      ${[0, 1.2, 2.4].map(d => `<text class="znote" x="${130 + d * 4}" y="112" font-size="20" fill="#7a5a8a" style="animation:zz 3.6s ${d}s infinite">♪</text>`).join('')}
    </g></g>
    <g class="only o-tea">
      ${limb('M80 150 Q74 172 90 184', 'var(--gcard,#a7c0dd)', 12)}${limb('M120 150 Q126 172 110 184', 'var(--gcard,#a7c0dd)', 12)}
      <ellipse cx="100" cy="190" rx="16" ry="4" fill="${P.paper}" ${O}/>
      <path d="M90 176 L110 176 L107 189 L93 189Z" fill="${P.paper}" ${O}/><path d="M110 179 Q116 180 110 186" fill="none" stroke="${P.ink}" stroke-width="2.5"/>
      <circle cx="90" cy="184" r="6" fill="${P.skin}" ${O}/><circle cx="110" cy="184" r="6" fill="${P.skin}" ${O}/>
      <g style="animation:rise 2.6s infinite;transform-origin:100px 170px"><circle cx="100" cy="168" r="4" fill="#fff" opacity=".8"/></g>
    </g>
    <g class="only o-tinker">
      ${limb('M80 150 Q74 172 86 186', 'var(--gcard,#a7c0dd)', 12)}<circle cx="86" cy="188" r="6" fill="${P.skin}" ${O}/>
      <g style="animation:tool .7s ease-in-out infinite;transform-origin:122px 152px">
        ${limb('M122 152 Q140 140 146 120', 'var(--gcard,#a7c0dd)', 12)}
        <path d="M146 120 L160 92" stroke="${P.ink}" stroke-width="9" stroke-linecap="round"/><path d="M146 120 L160 92" stroke="#b9bcc4" stroke-width="4" stroke-linecap="round"/>
        <path d="M154 90 Q160 78 170 86 L164 92 Z" fill="#b9bcc4" ${O}/>
        <circle cx="146" cy="121" r="6.5" fill="${P.skin}" ${O}/></g>
      ${sparkle(170, 70, 7)}${sparkle(150, 64, 4)}${gear(36, 200, 7, P.gold)}
    </g>
    <g style="animation:sway 8s ease-in-out infinite;transform-origin:100px 140px">
      <circle cx="100" cy="62" r="16" fill="${hair}" ${O}/>
      <path d="M82 54 L120 70" stroke="${P.ink}" stroke-width="9" stroke-linecap="round"/><path d="M82 54 L120 70" stroke="${P.wood}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="82" cy="54" r="3.4" fill="${P.coral}" stroke="${P.ink}" stroke-width="1.5"/>
      <ellipse cx="100" cy="106" rx="38" ry="34" fill="${P.skin}" ${O}/>
      <path d="M62 106 Q56 66 100 64 Q144 66 138 106 Q133 88 118 82 Q104 92 86 84 Q68 88 62 106Z" fill="${hair}" ${O}/>
      <path d="M78 76 Q92 70 106 72" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>
      <path d="M79 110 Q85 105 91 110 M109 110 Q115 105 121 110" fill="none" stroke="${P.ink}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M71 106 L67 104 M71 111 L67 112 M129 106 L133 104 M129 111 L133 112" stroke="${P.ink}" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="85" cy="109" r="11" fill="#fff" fill-opacity=".25" stroke="${P.ink}" stroke-width="2.5"/><circle cx="115" cy="109" r="11" fill="#fff" fill-opacity=".25" stroke="${P.ink}" stroke-width="2.5"/>
      <path d="M96 108 Q100 105 104 108" fill="none" stroke="${P.ink}" stroke-width="2.5"/>
      <path d="M80 104 L86 100" stroke="#fff" stroke-width="2.5" stroke-linecap="round" style="animation:glowp 3s infinite"/>
      <ellipse cx="76" cy="122" rx="6" ry="3.5" fill="${P.pink}" opacity=".85"/><ellipse cx="124" cy="122" rx="6" ry="3.5" fill="${P.pink}" opacity=".85"/>
      <path d="M94 126 Q100 131 106 126" fill="none" stroke="${P.ink}" stroke-width="2.5" stroke-linecap="round"/><g class="only o-read"><ellipse cx="100" cy="128" rx="3.6" ry="4.2" fill="#b85e66" stroke="${P.ink}" stroke-width="1.6"/></g>
    </g>
  </g>`;
}

/* ---------- Pip ---------- */
function pip() {
  return `
  ${shadow(32)}
  <g class="pipbody" style="transform-origin:100px 245px">
    <g class="only o-idle">${limb('M90 206 L88 226', P.nose, 4)}${limb('M110 206 L112 226', P.nose, 4)}</g>
    <path d="M128 186 L162 200 L156 212 L124 200Z" fill="#3b3a4a" ${O}/>
    <g class="wing-l" style="transform-origin:62px 150px"><path d="M64 146 Q30 160 40 196 Q58 190 72 172Z" fill="#7d869c" ${O}/></g>
    <g class="wing-r" style="transform-origin:138px 150px"><path d="M136 146 Q170 160 160 196 Q142 190 128 172Z" fill="#7d869c" ${O}/></g>
    <circle cx="100" cy="160" r="46" fill="${P.grey}" ${O}/>
    <path d="M66 182 Q100 214 134 182 Q100 196 66 182Z" fill="${P.greyL}"/>
    <path d="M56 152 Q58 112 100 112 Q142 112 144 152 Q130 136 100 138 Q70 136 56 152Z" fill="#3b3a4a" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="76" cy="160" rx="15" ry="12" fill="#fff"/><ellipse cx="124" cy="160" rx="15" ry="12" fill="#fff"/>
    <g class="blink" style="transform-origin:100px 148px">
      ${[80, 120].map(x => `<circle cx="${x}" cy="148" r="6" fill="${P.ink}" stroke="${P.nose}" stroke-width="3"/><circle cx="${x + 2}" cy="146" r="1.8" fill="#fff"/>`).join('')}</g>
    <path d="M88 156 Q100 144 112 156 Q100 174 88 156Z" fill="${P.nose}" ${O}/>
    <ellipse cx="70" cy="172" rx="5" ry="3" fill="${P.pink}" opacity=".9"/><ellipse cx="130" cy="172" rx="5" ry="3" fill="${P.pink}" opacity=".9"/>
    <path d="M78 196 Q100 206 122 196" fill="none" stroke="${P.ink}" stroke-width="9" stroke-linecap="round"/><path d="M78 196 Q100 206 122 196" fill="none" stroke="${P.sageD}" stroke-width="4" stroke-linecap="round"/>
    <g class="only o-fly">
      <rect x="84" y="212" width="32" height="26" rx="4" fill="${P.paper}" ${O}/>
      <path d="M90 222 L110 222 M90 229 L104 229" stroke="${P.sageD}" stroke-width="2.5" stroke-linecap="round"/>
      ${limb('M92 206 L94 214', P.nose, 3)}${limb('M108 206 L106 214', P.nose, 3)}
    </g>
  </g>`;
}

/* ---------- Kettle ---------- */
function kettle() {
  return `
  ${shadow(40)}
  ${[0, .9, 1.8].map(d => `<g style="animation:rise 2.7s ${d}s infinite;transform-origin:170px 146px"><circle cx="170" cy="144" r="6" fill="#fff" stroke="${P.ink}" stroke-width="1.5" opacity=".9"/></g>`).join('')}
  <g class="bob" style="transform-origin:100px 245px">
    <g style="animation:spin 1.6s linear infinite;transform-origin:100px 230px"><circle cx="100" cy="230" r="13" fill="#3b3a4a" ${O}/><path d="M100 219 L100 241 M89 230 L111 230" stroke="#6e6a80" stroke-width="2.5"/><circle cx="100" cy="230" r="4" fill="${P.gold}" stroke="${P.ink}" stroke-width="1.5"/></g>
    <g class="only o-idle">${limb('M66 186 Q50 196 54 212', P.iron, 5)}${limb('M134 186 Q150 196 146 212', P.iron, 5)}
      <circle cx="54" cy="214" r="6" fill="${P.gold}" ${O}/><circle cx="146" cy="214" r="6" fill="${P.gold}" ${O}/></g>
    <path d="M132 176 Q156 170 160 146 L172 150 Q168 184 136 198Z" fill="${P.cream}" ${O}/>
    <path d="M64 216 Q54 150 100 140 Q146 150 136 216 Q100 226 64 216Z" fill="${P.cream}" ${O}/>
    <path d="M118 146 Q140 156 136 214 Q128 218 120 219 Q130 180 118 146Z" fill="#ead6b8" opacity=".8"/>
    <path d="M59 182 Q100 194 141 182 L140 196 Q100 208 60 196Z" fill="${P.sageD}" ${O}/>
    ${[70, 86, 114, 130].map(x => `<circle cx="${x}" cy="${x === 70 || x === 130 ? 189 : 193}" r="2" fill="${P.gold}"/>`).join('')}
    <path d="M74 148 Q100 100 126 148" fill="none" stroke="${P.ink}" stroke-width="11" stroke-linecap="round"/><path d="M74 148 Q100 100 126 148" fill="none" stroke="${P.wood}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="100" cy="143" rx="23" ry="6.5" fill="${P.cream}" ${O}/>
    <circle cx="100" cy="134" r="6.5" fill="${P.lamp}" ${O}/><circle cx="100" cy="134" r="11" fill="${P.lamp}" opacity=".35" style="animation:glowp 2s infinite"/>
    <rect x="75" y="152" width="50" height="27" rx="11" fill="${P.screen}" ${O}/>
    <g class="blink" style="transform-origin:100px 165px"><path d="M84 168 Q89 159 94 168 M106 168 Q111 159 116 168" fill="none" stroke="${P.lamp}" stroke-width="3.5" stroke-linecap="round"/></g>
    <path d="M78 156 L84 154" stroke="#fff" stroke-width="2" opacity=".4" stroke-linecap="round"/>
    <g class="only o-serve">
      ${limb('M66 186 Q50 196 54 212', P.iron, 5)}<circle cx="54" cy="214" r="6" fill="${P.gold}" ${O}/>
      ${limb('M134 186 Q154 176 160 160', P.iron, 5)}
      <ellipse cx="166" cy="156" rx="24" ry="5" fill="#b9bcc4" ${O}/>
      <path d="M156 152 L172 152 L170 138 L158 138Z" fill="${P.paper}" ${O}/><path d="M172 142 Q178 144 171 149" fill="none" stroke="${P.ink}" stroke-width="2"/>
      <path d="M176 152 Q182 140 188 152Z" fill="${P.pink}" ${O}/><circle cx="182" cy="143" r="2.6" fill="${P.red}"/>
    </g>
  </g>`;
}

/* ---------- Les souris (Crumb Crew) ---------- */
const puff = (x, y, k, d, r = 6.5) => `<g style="animation:${k} 1.3s ${d}s ease-out infinite;transform-origin:${x}px ${y}px"><circle cx="${x}" cy="${y}" r="${r}" fill="#d9ccbc" stroke="#a8998a" stroke-width="1.4"/></g>`;
function mouse(x, kind) {
  const cap = { broom: P.sage, tissue: P.coral, bag: P.cream }[kind];
  const prop = {
    broom: `<g class="tool" style="transform-origin:${x + 16}px 214px"><path d="M${x + 16} 214 L${x + 34} 168" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/><path d="M${x + 16} 214 L${x + 34} 168" stroke="${P.wood}" stroke-width="3" stroke-linecap="round"/>
      <path d="M${x + 6} 236 L${x + 12} 212 L${x + 22} 216 L${x + 26} 240Z" fill="${P.gold}" ${O}/></g>`,
    tissue: `<g class="tool2" style="transform-origin:${x - 22}px 222px"><path d="M${x - 34} 214 Q${x - 22} 206 ${x - 10} 214 L${x - 12} 230 Q${x - 22} 236 ${x - 32} 230Z" fill="#fff" ${O}/></g>`,
    bag: `<path d="M${x + 14} 204 Q${x + 34} 196 ${x + 36} 222 Q${x + 26} 236 ${x + 12} 226Z" fill="${P.wood}" ${O}/><circle cx="${x + 26}" cy="204" r="3" fill="${P.gold}"/>`
  }[kind];
  // poussière soulevée pendant le ménage
  const dust = {
    broom: puff(x + 18, 238, 'dustL', 0) + puff(x + 22, 240, 'dustR', .35, 4) + puff(x + 14, 236, 'dustL', .7, 6) + puff(x + 26, 238, 'dustR', 1, 3.5),
    tissue: puff(x - 30, 226, 'dustL', .1, 4) + puff(x - 16, 230, 'dustR', .6, 3.5) + puff(x - 24, 222, 'dustL', .9, 3),
    bag: `<g style="animation:shine 1.6s infinite;transform-origin:${x - 28}px 210px">${sparkle(x - 28, 210, 6)}</g><g style="animation:shine 1.6s .8s infinite;transform-origin:${x + 40}px 196px">${sparkle(x + 40, 196, 5)}</g>`
  }[kind];
  return `<g class="mouse" style="animation:bob ${2 + (x % 3) * .3}s ease-in-out infinite;transform-origin:${x}px 245px">
    <path d="M${x + 14} 236 Q${x + 40} 240 ${x + 38} 214" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/><path d="M${x + 14} 236 Q${x + 40} 240 ${x + 38} 214" fill="none" stroke="${P.pink}" stroke-width="3" stroke-linecap="round"/>
    <path d="M${x - 20} 240 Q${x - 24} 200 ${x} 196 Q${x + 24} 200 ${x + 20} 240Z" fill="${P.mouse}" ${O}/>
    <path d="M${x - 10} 238 Q${x} 210 ${x + 10} 238Z" fill="${P.mouseL}"/>
    <ellipse cx="${x - 9}" cy="241" rx="7" ry="3.5" fill="${P.pink}" stroke="${P.ink}" stroke-width="2"/><ellipse cx="${x + 9}" cy="241" rx="7" ry="3.5" fill="${P.pink}" stroke="${P.ink}" stroke-width="2"/>
    ${prop}
    <circle cx="${x - 18}" cy="160" r="12" fill="${P.mouse}" ${O}/><circle cx="${x - 18}" cy="160" r="7" fill="${P.pink}"/>
    <circle cx="${x + 18}" cy="160" r="12" fill="${P.mouse}" ${O}/><circle cx="${x + 18}" cy="160" r="7" fill="${P.pink}"/>
    <circle cx="${x}" cy="180" r="21" fill="${P.mouse}" ${O}/>
    <g class="blink" style="transform-origin:${x}px 178px"><circle cx="${x - 7}" cy="178" r="3.2" fill="${P.ink}"/><circle cx="${x + 7}" cy="178" r="3.2" fill="${P.ink}"/><circle cx="${x - 6}" cy="176.8" r="1" fill="#fff"/><circle cx="${x + 8}" cy="176.8" r="1" fill="#fff"/></g>
    <circle cx="${x}" cy="187" r="3.2" fill="${P.nose}" stroke="${P.ink}" stroke-width="1.5"/>
    <path d="M${x - 8} 188 L${x - 22} 185 M${x - 8} 191 L${x - 22} 193 M${x + 8} 188 L${x + 22} 185 M${x + 8} 191 L${x + 22} 193" stroke="${P.ink}" stroke-width="1.2" stroke-linecap="round"/>
    <ellipse cx="${x - 12}" cy="189" rx="3.5" ry="2" fill="${P.pink}"/><ellipse cx="${x + 12}" cy="189" rx="3.5" ry="2" fill="${P.pink}"/>
    <path d="M${x - 17} 168 Q${x} 150 ${x + 17} 168 Q${x} 163 ${x - 17} 168Z" fill="${cap}" ${O}/>
    <path d="M${x - 2} 165 Q${x + 14} 162 ${x + 24} 168" fill="none" stroke="${P.ink}" stroke-width="5" stroke-linecap="round"/><path d="M${x - 2} 165 Q${x + 14} 162 ${x + 24} 168" fill="none" stroke="${cap}" stroke-width="2" stroke-linecap="round"/>
  </g>
  <g class="only o-clean">${dust}</g>`;
}
function mice() {
  return `${shadow(30, 70)}${shadow(30, 140)}${shadow(30, 205)}${mouse(70, 'tissue')}${mouse(140, 'broom')}${mouse(208, 'bag')}`;
}

/* ---------- Clients (employés de bureau qui passent prendre un café) ---------- */
const takeaway = (x, y) => `<path d="M${x - 7} ${y} L${x + 7} ${y} L${x + 5.5} ${y + 18} L${x - 5.5} ${y + 18}Z" fill="${P.paper}" ${O}/>
  <path d="M${x - 6.4} ${y + 5} L${x + 6.4} ${y + 5} L${x + 5.8} ${y + 12} L${x - 5.8} ${y + 12}Z" fill="#6b4a3c"/>${catLogo(x, y + 8.5, 2.4)}
  <rect x="${x - 8.5}" y="${y - 4}" width="17" height="5" rx="2" fill="${P.paper}" stroke="${P.ink}" stroke-width="2"/>`;
const CUST_PAL = {
  m: [['#ecc4a0', '#5b4450', '#7682a2', '#67729a', '#4f5873'], ['#fde3d0', '#8a5242', '#8fb39a', '#7aa186', '#5b4450'], ['#c99a78', '#2b2433', '#e3a07e', '#cf8c6a', '#3b2f33'], ['#f3d2b8', '#c9a27e', '#9c8ac0', '#8877ad', '#4f5873']],
  f: [['#fbe0cc', '#3e3446', '#dcbc94', '#c9a77e', '#5b4450'], ['#e8bf98', '#2b2433', '#a7c0dd', '#8ea8c8', '#4f5873'], ['#fde3d0', '#c97a44', '#ee9c8c', '#d9886e', '#5b4450'], ['#c99a78', '#5b4450', '#c7a6e6', '#b08fd0', '#3b2f33']]
};
function custLegs(g, v = 0) {
  const M = g === 'm';
  const [, , coat, , pants] = CUST_PAL[M ? 'm' : 'f'][v % 4];
  const shoe = M ? P.brown : '#8a4f4a';
  return `<g>
    ${[[84, 99], [101, 116]].map(([a, b]) => `<rect x="${a}" y="194" width="${b - a}" height="30" rx="7" fill="${pants}" ${O}/>`).join('')}
    ${M ? '' : `<path d="M76 192 L124 192 L127 214 Q100 220 73 214Z" fill="${coat}" ${O}/>`}
    ${[[86, 97], [103, 114]].map(([a, b]) => `<rect x="${a}" y="222" width="${b - a}" height="30" rx="5" fill="${pants}" ${O}/>`).join('')}
    <ellipse cx="91" cy="256" rx="10" ry="5.5" fill="${shoe}" ${O}/><ellipse cx="109" cy="256" rx="10" ry="5.5" fill="${shoe}" ${O}/>
  </g>`;
}
function customer(g, v = 0) {
  const M = g === 'm';
  const [skin, hair, coat, coatD, pants] = CUST_PAL[M ? 'm' : 'f'][v % 4];
  const leg = (cls, hx, fx) => `<g class="${cls}" style="transform-origin:${hx}px 198px">${M ? limb(`M${hx} 200 L${fx} 230`, pants, 14) : limb(`M${hx} 206 L${fx} 232`, pants, 9)}
    <ellipse cx="${fx + (fx < 100 ? -2 : 2)}" cy="236" rx="11" ry="6" fill="${M ? P.brown : '#8a4f4a'}" ${O}/></g>`;
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="${skin}" ${O}/>`;
  return `
  ${shadow(40)}
  <g class="only o-wait"><g style="animation:bob 1.6s ease-in-out infinite">
    <path d="M136 30 h44 a10 10 0 0 1 10 10 v26 a10 10 0 0 1 -10 10 h-24 l-10 10 l-1 -10 h-9 a10 10 0 0 1 -10 -10 v-26 a10 10 0 0 1 10 -10z" fill="#fff" ${O}/>
    <path d="M148 46 h20 l-2.5 16 h-15z" fill="${P.cream}" ${O}/><path d="M168 50 q6 1 2 7" fill="none" stroke="${P.ink}" stroke-width="2"/>
    ${heart(158, 52, .5)}<text x="183" y="62" font-family="Nunito,sans-serif" font-weight="800" font-size="9" fill="${P.ink}" text-anchor="end">×1</text>
  </g></g>
  <g class="bob" style="transform-origin:100px 245px">
    ${leg('legL', 92, 88)}${leg('legR', 108, 112)}
    <rect x="93" y="120" width="14" height="14" fill="${skin}" ${O}/>
    ${M ? `<path d="M76 148 Q76 132 92 130 L108 130 Q124 132 124 148 L122 206 Q100 212 78 206 Z" fill="${coat}" ${O}/>
           <path d="M113 133 Q124 136 123 150 L121 205 Q114 208 108 208 Q116 172 113 133Z" fill="${coatD}" opacity=".8"/>
           <path d="M91 130 L100 158 L109 130Z" fill="#fff" ${O}/>
           <path d="M98 135 L102 135 L104 155 L100 161 L96 155Z" fill="${P.coralD}" stroke="${P.ink}" stroke-width="1.8" stroke-linejoin="round"/>
           <path d="M91 130 L96 150 L100 158 M109 130 L104 150 L100 158" fill="none" stroke="${P.ink}" stroke-width="2"/>
           <circle cx="100" cy="176" r="2.4" fill="${P.ink}"/><circle cx="100" cy="190" r="2.4" fill="${P.ink}"/>`
        : `<path d="M74 148 Q74 132 92 130 L108 130 Q126 132 126 148 L131 216 Q100 223 69 216 Z" fill="${coat}" ${O}/>
           <path d="M114 133 Q126 136 125 150 L129 215 Q120 219 112 219 Q118 176 114 133Z" fill="${coatD}" opacity=".8"/>
           <path d="M100 150 L100 218" stroke="${P.ink}" stroke-width="2"/>
           <path d="M73 180 L127 180 L127.5 189 L72.5 189Z" fill="${coatD}" stroke="${P.ink}" stroke-width="2.2"/><rect x="95" y="179" width="10" height="11" rx="2" fill="none" stroke="${P.gold}" stroke-width="2.2"/>
           <circle cx="93" cy="160" r="2.2" fill="${P.ink}"/><circle cx="107" cy="160" r="2.2" fill="${P.ink}"/>
           <path d="M85 131 Q100 145 115 131 Q112 123 100 123 Q88 123 85 131Z" fill="${P.sage}" ${O}/><path d="M106 137 L113 162 L102 160Z" fill="${P.sage}" ${O}/>
           <path d="M80 136 L88 160" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/><path d="M80 136 L88 160" stroke="${P.cream}" stroke-width="2.5" stroke-linecap="round"/>`}
    <!-- bras : marche -->
    <g class="only o-walk">
      <g class="armL" style="transform-origin:80px 146px">${limb('M80 146 Q72 166 74 188', coat, 13)}${hand(74, 191)}
        ${M ? '' : `<rect x="62" y="186" width="24" height="22" rx="4" fill="${P.cream}" ${O}/>${leaf(74, 196, 4, P.sageD)}`}</g>
      <g class="armR" style="transform-origin:120px 146px">${limb('M120 146 Q128 166 126 188', coat, 13)}${hand(126, 191)}
        ${M ? `<rect x="114" y="194" width="30" height="21" rx="4" fill="${P.brown}" ${O}/><path d="M122 194 Q129 186 136 194" fill="none" ${O}/>` : ''}</g>
    </g>
    <!-- bras : attente -->
    <g class="only o-wait">
      ${M ? `${limb('M80 146 Q72 172 96 172', coat, 13)}${hand(98, 170)}<rect x="90" y="166" width="10" height="6" rx="2" fill="${P.ink}"/><circle cx="95" cy="169" r="2" fill="${P.gold}"/>
             ${limb('M120 146 Q130 168 128 188', coat, 13)}${hand(128, 191)}<rect x="116" y="194" width="30" height="21" rx="4" fill="${P.brown}" ${O}/><path d="M124 194 Q131 186 138 194" fill="none" ${O}/>`
          : `${limb('M80 146 Q72 166 74 188', coat, 13)}${hand(74, 191)}<rect x="62" y="186" width="24" height="22" rx="4" fill="${P.cream}" ${O}/>${leaf(74, 196, 4, P.sageD)}
             ${limb('M120 146 Q134 166 114 164', coat, 13)}<rect x="104" y="146" width="13" height="20" rx="3" fill="#3d3a4a" ${O}/><rect x="106.5" y="149" width="8" height="12" rx="1" fill="${P.shutter}"/>${hand(112, 166)}`}
    </g>
    <!-- bras : café à emporter -->
    <g class="only o-coffee">
      <g style="animation:wave .5s ease-in-out infinite alternate;transform-origin:80px 146px">${limb('M80 146 Q64 132 66 112', coat, 13)}${hand(66, 108)}</g>
      ${limb('M120 146 Q136 170 118 170', coat, 13)}${takeaway(114, 146)}${hand(118, 170)}
      ${[0, .9].map(dl => `<g style="animation:rise 2.4s ${dl}s infinite;transform-origin:114px 138px"><circle cx="114" cy="136" r="4" fill="#fff" stroke="${P.ink}" stroke-width="1.2" opacity=".85"/></g>`).join('')}
      ${M ? `<rect x="114" y="194" width="30" height="21" rx="4" fill="${P.brown}" ${O}/>` : ''}
    </g>
    <!-- tête -->
    <g style="animation:sway 7s ease-in-out infinite;transform-origin:100px 130px">
      ${M ? `<path d="M58 92 Q56 46 100 42 Q144 46 142 92 Q142 106 134 110 L66 110 Q58 106 58 92Z" fill="${hair}" ${O}/>`
          : `<path d="M54 96 Q50 42 100 38 Q150 42 146 96 Q150 122 140 134 L60 134 Q50 122 54 96Z" fill="${hair}" ${O}/>`}
      <ellipse cx="60" cy="100" rx="7" ry="9" fill="${skin}" ${O}/><ellipse cx="140" cy="100" rx="7" ry="9" fill="${skin}" ${O}/>
      <ellipse cx="100" cy="97" rx="40" ry="37" fill="${skin}" ${O}/>
      <g class="only o-tired">${[84, 116].map(x => `<ellipse cx="${x}" cy="104" rx="6" ry="6.5" fill="#4a3346"/><circle cx="${x + 2}" cy="102" r="1.8" fill="#fff"/>
        <path d="M${x - 7} 101 Q${x} 98 ${x + 7} 101 L${x + 7} 96 L${x - 7} 96Z" fill="${skin}"/><path d="M${x - 7} 101 Q${x} 98.5 ${x + 7} 101" fill="none" stroke="${P.ink}" stroke-width="2.2" stroke-linecap="round"/>`).join('')}</g>
      <g class="only o-happy"><path d="M78 105 Q84 98 90 105 M110 105 Q116 98 122 105" fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/></g>
      ${M ? '' : `<path d="M77 99 L74 96 M123 99 L126 96" stroke="${P.ink}" stroke-width="2" stroke-linecap="round"/>`}
      <ellipse cx="73" cy="115" rx="6.5" ry="3.8" fill="${P.pink}" opacity=".8"/><ellipse cx="127" cy="115" rx="6.5" ry="3.8" fill="${P.pink}" opacity=".8"/>
      <g class="only o-walk"><path d="M95 118 Q100 121 105 118" fill="none" stroke="${P.ink}" stroke-width="2.4" stroke-linecap="round"/></g>
      <g class="only o-wait"><ellipse cx="100" cy="119" rx="3.2" ry="4" fill="#b85e66" stroke="${P.ink}" stroke-width="1.8"/></g>
      <g class="only o-coffee"><path d="M93 116 Q100 124 107 116Z" fill="#b85e66" stroke="${P.ink}" stroke-width="2" stroke-linejoin="round"/></g>
      ${M ? `<path d="M60 96 Q56 52 100 48 Q144 52 140 92 Q134 74 114 68 Q94 78 72 72 Q64 82 60 96Z" fill="${hair}" ${O}/>
             <path d="M76 88 L91 86 M109 86 L124 88" stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/>
             <path d="M74 58 Q88 52 104 54" fill="none" stroke="#fff" stroke-width="3" opacity=".2" stroke-linecap="round"/>`
          : `<path d="M58 92 Q54 46 100 44 Q146 46 142 92 Q140 74 132 70 L128 82 Q118 70 108 72 L104 84 Q98 70 88 72 L84 82 Q74 70 66 74 Q60 82 58 92Z" fill="${hair}" ${O}/>
             <rect x="122" y="66" width="14" height="6" rx="3" fill="${P.gold}" stroke="${P.ink}" stroke-width="1.8" transform="rotate(-20 129 69)"/>
             <path d="M70 56 Q86 48 104 50" fill="none" stroke="#fff" stroke-width="3" opacity=".2" stroke-linecap="round"/>`}
    </g>
  </g>`;
}

