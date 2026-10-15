// Nuit : sortir la poubelle derrière le café et rencontrer le husky perdu.
// Plein écran ; le héros et le chien marchent vraiment (pas de glissement).
import { h, ui, DRAW, sleep } from './dom';
import { say, talk } from './dialogue';
import { Stage } from './actors';

const LN = '#5a4a5e';
const L = (w = 2) => `stroke="${LN}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const BOWL = { x: 1262, y: 690 };
const ARCH = { x: 1500, y: 646 };

// Arrière du café au crépuscule (réf. interior/backallay.png) : mur pêche, toit d'ardoise,
// ciel violet-rose, nuages, arbres ronds, buissons et fleurs. Pas de ruelle sombre.
const BUSH = (x: number, y: number, r: number, c = '#5f7f4c') =>
  `<circle cx="${x}" cy="${y - r}" r="${r}" fill="${c}" ${L(2.5)}/><path d="M${x - r * .55} ${y - r * 1.35} Q${x - r * .2} ${y - r * 1.75} ${x + r * .25} ${y - r * 1.55}" fill="none" stroke="#9cb874" stroke-width="${r * .14}" stroke-linecap="round" opacity=".7"/>`;
const TREE = (x: number, y: number, r: number, c = '#56763f') =>
  `<path d="M${x - 9} ${y} L${x - 6} ${y - r * 1.6} L${x + 6} ${y - r * 1.6} L${x + 9} ${y}Z" fill="#8a5a42" ${L(2)}/>` + BUSH(x, y - r * 1.25, r, c);
const CLOUD = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-170 40 Q-180 -10 -120 -14 Q-110 -70 -40 -60 Q0 -110 70 -70 Q140 -80 140 -20 Q200 -10 180 40Z" fill="#e9a891"/>
   <path d="M-170 30 Q-180 -20 -120 -24 Q-110 -80 -40 -70 Q0 -120 70 -80 Q140 -90 140 -30 Q200 -20 180 30Z" fill="#fbd3b4"/></g>`;

function alley() {
  const shingles: string[] = [];
  for (let y = 112; y < 206; y += 16) shingles.push(`<path d="M${-470 - (y - 112) * .3} ${y} L${1236 + (y - 112) * .28} ${y}" stroke="#4d4a68" stroke-width="1.5" opacity=".6"/>`);
  for (let y = 112, r = 0; y < 206; y += 16, r++) for (let x = -440 + (r % 2) * 22; x < 1240; x += 44) shingles.push(`<path d="M${x} ${y} L${x} ${y + 16}" stroke="#4d4a68" stroke-width="1" opacity=".35"/>`);
  const tiles: string[] = [];
  for (let x = -500; x < 2100; x += 64) tiles.push(`<path d="M${x} 640 L${x - 14} 700" stroke="#a68f8a" stroke-width="1.5"/>`);
  const flowers: string[] = [];
  for (let i = 0; i < 60; i++) {
    const x = -460 + (i * 137) % 2540, y = 726 + (i * 53) % 170, c = ['#f4a3b4', '#ffe08a', '#fdf5e8', '#f6b38a'][i % 4];
    flowers.push(`<path d="M${x} ${y} L${x} ${y - 20} M${x} ${y - 8} Q${x - 8} ${y - 14} ${x - 10} ${y - 8}" fill="none" stroke="#5e7a3e" stroke-width="2.5"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${x + 6 * Math.cos(a * Math.PI / 180)}" cy="${y - 22 + 6 * Math.sin(a * Math.PI / 180)}" r="4.5" fill="${c}"/>`).join('')}<circle cx="${x}" cy="${y - 22}" r="3" fill="#f3c55a"/>`);
  }
  const stars = [[120, 40], [300, 90], [520, 30], [760, 60], [980, 30], [1180, 80], [1480, 40], [-200, 60], [1800, 70], [-60, 100], [1640, 20], [420, 70]];
  return `<g class="art">
  <defs>
    <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3580"/><stop offset=".45" stop-color="#7a4f9a"/><stop offset=".8" stop-color="#c46f97"/><stop offset="1" stop-color="#ee9a8c"/></linearGradient>
    <linearGradient id="wallG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d68f7c"/><stop offset=".7" stop-color="#c98575"/><stop offset="1" stop-color="#b8796f"/></linearGradient>
    <radialGradient id="doorLight"><stop offset="0" stop-color="#ffd59a" stop-opacity=".8"/><stop offset="1" stop-color="#ffb36b" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="-500" y="-400" width="2600" height="1100" fill="url(#nsky)"/>
  ${stars.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#fff6e0" opacity=".85"/>`).join('')}
  ${CLOUD(1500, 330, 1.25)}${CLOUD(1720, 200, .9)}${CLOUD(-300, 230, .9)}
  <!-- au-delà du coin du café : le trottoir et la rue, au loin -->
  <rect x="1200" y="596" width="1000" height="44" fill="#5b5670" ${L(2)}/><path d="M1290 618 L1350 618 M1420 618 L1480 618 M1550 618 L1610 618 M1680 618 L1740 618" stroke="#efe3d0" stroke-width="5" opacity=".7"/>
  ${TREE(1330, 596, 56, '#4d6b3a')}${TREE(1590, 596, 64)}${BUSH(1460, 598, 34, '#4d6b3a')}
  <path d="M1720 596 L1720 470" stroke="#5a4a5e" stroke-width="6"/><circle cx="1720" cy="462" r="14" fill="#ffe2a6" ${L(2)}/><circle cx="1720" cy="462" r="50" fill="#ffd28a" opacity=".25"/>
  <!-- l'arrière du café : mur pêche, corniche, toit d'ardoise et cheminée -->
  <rect x="380" y="40" width="64" height="90" fill="#c4644a" ${L(2.5)}/><rect x="372" y="32" width="80" height="16" rx="3" fill="#d9775c" ${L(2.5)}/>
  <circle cx="424" cy="10" r="16" fill="#efe6f2" opacity=".6"/><circle cx="446" cy="-26" r="20" fill="#efe6f2" opacity=".45"/><circle cx="430" cy="-66" r="24" fill="#efe6f2" opacity=".3"/>
  <path d="M-530 206 L-470 112 L1236 112 L1262 206Z" fill="#6a6788" ${L(3)}/>${shingles.join('')}
  <path d="M1060 112 L1060 70 M1046 70 Q1060 52 1076 66 L1090 62" fill="none" ${L(3)}/><path d="M1048 70 L1072 70" ${L(3)}/>
  <rect x="-500" y="206" width="1730" height="434" fill="url(#wallG)" ${L(3)}/>
  <rect x="-500" y="206" width="1730" height="16" fill="#9e6a68" opacity=".45"/>
  <rect x="-510" y="398" width="1752" height="16" rx="3" fill="#e8b3a0" ${L(2.5)}/>
  <!-- fenêtre de l'étage, éclairée, avec jardinière -->
  <rect x="880" y="250" width="130" height="110" rx="6" fill="#ffd796" ${L(2.5)}/><path d="M945 250 L945 360 M880 305 L1010 305" stroke="#fdf5e8" stroke-width="6"/>
  <path d="M884 254 Q910 300 892 356 L884 356Z M1006 254 Q980 300 998 356 L1006 356Z" fill="#f2a7a0" opacity=".85"/>
  <rect x="870" y="360" width="150" height="22" rx="4" fill="#9c6a4c" ${L(2)}/>${[890, 920, 950, 980, 1006].map((x, i) => `<circle cx="${x}" cy="356" r="9" fill="${i % 2 ? '#f4a3b4' : '#6f9a54'}" ${L(1.5)}/>`).join('')}
  <!-- climatiseur -->
  <rect x="610" y="470" width="110" height="74" rx="6" fill="#f3ece6" ${L(2.5)}/><circle cx="650" cy="507" r="24" fill="#cfc6c4" ${L(2)}/><path d="M650 487 L650 527 M630 507 L670 507 M636 493 L664 521 M664 493 L636 521" stroke="#9d9291" stroke-width="2"/>
  <path d="M700 484 L712 484 M700 496 L712 496 M700 508 L712 508 M700 520 L712 520" ${L(1.5)}/>
  <!-- porte de service, ouverte sur la lumière chaude -->
  <ellipse cx="340" cy="660" rx="260" ry="70" fill="url(#doorLight)"/>
  <rect x="246" y="316" width="188" height="324" rx="8" fill="#7a5a48" ${L(2.5)}/><rect x="264" y="334" width="152" height="306" fill="#ffd59a"/>
  <path d="M264 334 L330 352 L330 640 L264 640Z" fill="#9c6a4c" ${L(2)}/><circle cx="318" cy="500" r="5" fill="#f3d98f" ${L(1.5)}/>
  <path d="M300 286 L380 286 L370 306 L310 306Z" fill="#3f6e5a" ${L(2)}/><circle cx="340" cy="316" r="9" fill="#ffe2a6" ${L(2)}/><circle cx="340" cy="320" r="70" fill="#ffd28a" opacity=".22"/>
  <rect x="270" y="640" width="140" height="14" rx="5" fill="#c86f5c" ${L(2)}/>
  <!-- trottoir pavé au pied du mur, puis l'herbe fleurie -->
  <rect x="-520" y="640" width="2640" height="60" fill="#c7aea6" ${L(2.5)}/>${tiles.join('')}
  <rect x="-500" y="700" width="2600" height="500" fill="#7d8c50"/><path d="M-500 700 L2100 700" ${L(2.5)}/>
  ${flowers.join('')}
  ${TREE(30, 650, 74)}${BUSH(150, 652, 40, '#6a8a52')}${BUSH(520, 648, 34, '#6a8a52')}
  ${BUSH(-40, 900, 70)}${BUSH(90, 910, 50, '#6a8a52')}${BUSH(1560, 905, 64)}${BUSH(1680, 915, 52, '#6a8a52')}
  <path d="M196 650 L218 520 L240 650Z" fill="#5f8a54" ${L(2.5)}/>
  <rect x="1270" y="568" width="120" height="80" rx="4" fill="#c99b6e" ${L(2)}/><path d="M1270 608 L1390 608" ${L(1.5)} opacity=".5"/><rect x="1296" y="512" width="90" height="58" rx="4" fill="#d7aa7c" ${L(2)}/>
  <g id="bins">
    <path d="M896 530 L1024 530 L1014 660 L906 660Z" fill="#8f97a6" ${L(2.5)}/><path d="M926 548 L930 642 M960 548 L960 642 M994 548 L990 642" ${L(1.5)} opacity=".45"/>
    <g id="lid" style="transform-origin:960px 530px;transition:transform .2s"><rect x="884" y="512" width="152" height="22" rx="8" fill="#a3abb9" ${L(2.5)}/><rect x="942" y="502" width="36" height="12" rx="4" fill="#7e8695" ${L(2)}/></g>
    <path d="M1060 560 L1170 560 L1162 660 L1068 660Z" fill="#7fae8c" ${L(2.5)}/><rect x="1052" y="544" width="126" height="20" rx="7" fill="#6f9e7c" ${L(2.5)}/>
    <path d="M1100 600 Q1115 588 1128 600 L1120 604 M1128 600 L1108 622 Q1100 614 1104 606" fill="none" stroke="#fdf5e8" stroke-width="3" stroke-linecap="round"/>
  </g>
  <!-- coin du café, avec gouttière -->
  <rect x="1214" y="206" width="16" height="434" fill="#a8695f" ${L(2)}/><rect x="1220" y="206" width="8" height="434" fill="#8f97a6" ${L(1.5)}/>
  <g id="bowl" opacity="0" style="transition:opacity .4s"><ellipse cx="${BOWL.x}" cy="${BOWL.y}" rx="40" ry="12" fill="#e86a5f" ${L(2)}/><ellipse cx="${BOWL.x}" cy="${BOWL.y - 6}" rx="30" ry="7" fill="#f3e1b5"/><circle cx="${BOWL.x - 10}" cy="${BOWL.y - 8}" r="5" fill="#fffaf2"/><circle cx="${BOWL.x + 8}" cy="${BOWL.y - 10}" r="5" fill="#fffaf2"/></g>
  <g id="bag" class="hit"><g class="bounce"><path d="M410 600 Q396 640 412 652 L470 652 Q486 640 472 600 Q456 588 441 590 Q426 588 410 600Z" fill="#4a4752" ${L(2.5)}/><path d="M432 590 L441 576 L450 590" fill="none" ${L(2.5)}/></g></g>
  <g id="actors"></g>
  <!-- buisson devant le coin : le chien arrive de derrière et peut s'y cacher pour épier -->
  <g id="archEdge">${BUSH(1478, 668, 44)}${BUSH(1540, 672, 32, '#6a8a52')}</g>
  <rect x="-500" y="-400" width="2600" height="1600" fill="#8a78c8" class="tint" opacity=".14"/></g>
  <g id="fx"></g>`;
}

export async function nightScene(o: { hero: 'm' | 'f'; night: 1 | 2; name: string; dogName?: string }) {
  const heroId = o.hero === 'f' ? 'heroF' : 'heroM';
  const dogName = o.dogName ?? 'Biscuit';
  const el = h(`<div class="screen" style="background:#7d8c50"><svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style="overflow:visible;background:transparent">${alley()}</svg>
    <div class="banner">Night ${o.night} · Closing time</div></div>`);
  ui().appendChild(el);
  const $ = (id: string) => el.querySelector('#' + id) as SVGElement & HTMLElement;
  const stage = new Stage($('actors') as unknown as SVGGElement, () => 1);
  const fx = (x: number, y: number, t: string, c = '#fdf5e8') => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = `<g class="fx" style="transform-box:fill-box"><text x="${x}" y="${y}" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="30" fill="${c}">${t}</text></g>`;
    $('fx').appendChild(g); setTimeout(() => g.remove(), 1300);
  };

  // le héros (avec le sac porté, caché au début)
  const heroA = stage.add(`<svg x="-75" y="-192" width="150" height="195" viewBox="0 0 200 260" data-state="city" overflow="visible">${DRAW[heroId]()}</svg>
    <g class="carried" style="display:none"><path d="M44 -66 Q36 -36 46 -28 L82 -28 Q92 -36 84 -66 Q74 -74 64 -72 Q54 -74 44 -66Z" fill="#4a4752" ${L(2.5)}/><path d="M58 -72 L64 -82 L70 -72" fill="none" ${L(2.5)}/></g>`, 345, 652);
  const heroSvg = heroA.inner.querySelector('svg') as SVGElement;
  const carried = heroA.inner.querySelector('.carried') as SVGElement;
  const hint = h(`<div class="hint">Last chore of the day: click the trash bag to take it out.</div>`);
  el.appendChild(hint);
  await new Promise<void>(r => $('bag').addEventListener('click', () => r(), { once: true }));
  hint.remove();
  $('bag').style.display = 'none';
  carried.style.display = '';
  heroSvg.dataset.state = 'citywalk';
  await stage.walk(heroA, [{ x: 820, y: 652 }], 170);
  heroSvg.dataset.state = 'city';
  carried.style.display = 'none';
  $('lid').style.transform = 'rotate(-12deg)'; fx(960, 480, 'thud'); await sleep(250); $('lid').style.transform = '';
  await sleep(600);
  $('bins').classList.add('shake'); fx(1360, 460, '*rustle*'); await sleep(800); $('bins').classList.remove('shake');

  // le chien sort du passage en marchant
  const dogA = stage.add(`<svg x="-70" y="-171" width="140" height="182" viewBox="0 0 200 260" data-state="walk" overflow="visible">${DRAW.biscuit()}</svg>`, ARCH.x, ARCH.y, { flipable: true });
  const dogSvg = dogA.inner.querySelector('svg') as SVGElement;
  const dogWalk = async (x: number, y: number, speed: number, then: string) => {
    dogSvg.dataset.state = 'walk';
    await stage.walk(dogA, [{ x, y }], speed);
    dogA.flip = 1; dogSvg.dataset.state = then;
  };
  await dogWalk(1350, 664, 140, 'stray');
  await sleep(300);

  const H = (text: string) => ({ who: heroId, name: o.name, state: 'city', text } as const);
  const B = (text: string, state = 'stray') => ({ who: 'biscuit', name: '???', state, text, right: true } as const);
  const feed = async () => {
    await say(H('(He looks so hungry…)'), ['Share my sandwich', "Share Grandma's onigiri"]);
    $('bowl').style.opacity = '1';
    await sleep(400);
    // il s'approche de profil, plonge la tête dans la gamelle en remuant la queue, puis s'assoit tout content
    await dogWalk(BOWL.x + 42, BOWL.y + 2, 110, 'eatdown');
    dogA.flip = 1;
    fx(BOWL.x, BOWL.y - 70, 'nom nom');
    await sleep(1300);
    fx(BOWL.x + 20, BOWL.y - 100, 'wouf wouf');
    await sleep(1300);
    dogSvg.dataset.state = 'eat';
    fx(BOWL.x - 40, BOWL.y - 170, '♥', '#f6b0b5');
    await sleep(900);
  };

  if (o.night === 1) {
    await talk([H('Oh! Hello there… are you lost?'), B("…Grrr. Don't come any closer."), H("(I can hear him. He's shivering… and he smells like rain.)")]);
    await feed();
    await talk([B('…It\'s good.', 'eat'), B("Don't tell anyone I ate from a human's hand.", 'eat')]);
    // il retourne vers le passage en trottinant, puis reste à épier le héros
    await dogWalk(ARCH.x - 34, ARCH.y - 4, 230, 'stray');
    await sleep(500);
    await talk([H('Goodnight, little one. See you tomorrow?'), { who: 'narr', text: 'From behind the bushes, two blue eyes keep watching you.' }]);
  } else {
    await talk([H('You came back! I saved you something.'), B("I wasn't waiting for you. I was… guarding the bins.")]);
    await feed();
    await talk([B("You really can understand me, can't you?", 'eat'), H('Since I was little. Do you have a name?'), B('Nobody ever gave me one.', 'eat')]);
    await say(H('Then how about…'), [dogName]);
    dogSvg.dataset.state = 'named';
    fx(BOWL.x + 30, 450, `${dogName}!`, '#f3d98f');
    for (let i = 0; i < 3; i++) { fx(BOWL.x + 10 + i * 30, 500 - i * 20, '♥', '#f6b0b5'); await sleep(250); }
    await talk([H('And this is for you. I made a little tag with your name on it.')]);
    await talk([{ ...B(`${dogName}… I like it.`, 'named'), name: dogName }, { who: 'narr', text: 'He follows you to the back door and curls up there, one ear still listening.' }]);
    await dogWalk(500, 664, 130, 'straysleep');
    await sleep(1200);
  }
  stage.destroy();
  el.remove();
}

/* ---------- Fin du niveau 2 : Biscuit sort la poubelle, on remercie l'équipe avec des friandises ---------- */
export async function closingScene(o: { hero: 'm' | 'f'; name: string; dogName: string; mokaName: string; dogVars?: string; mokaVars?: string }) {
  const heroId = o.hero === 'f' ? 'heroF' : 'heroM';
  const el = h(`<div class="screen" style="background:#7d8c50"><svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style="overflow:visible;background:transparent">${alley()}</svg>
    <div class="banner">Level 2 · Closing time</div></div>`);
  ui().appendChild(el);
  const $ = (id: string) => el.querySelector('#' + id) as SVGElement & HTMLElement;
  $('bag').style.display = 'none';
  const stage = new Stage($('actors') as unknown as SVGGElement, () => 1);
  const fx = (x: number, y: number, t: string, c = '#fdf5e8', size = 30) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = `<g class="fx" style="transform-box:fill-box"><text x="${x}" y="${y}" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="${size}" fill="${c}">${t}</text></g>`;
    $('fx').appendChild(g); setTimeout(() => g.remove(), 1300);
  };
  const heroA = stage.add(`<svg x="-75" y="-192" width="150" height="195" viewBox="0 0 200 260" data-state="city" overflow="visible">${DRAW[heroId]()}</svg>`, 330, 652);
  void heroA;
  // Biscuit sort par la porte de service, le sac poubelle dans la gueule
  const dogA = stage.add(`<svg x="-70" y="-171" width="140" height="182" viewBox="0 0 200 260" data-state="walk" style="${o.dogVars ?? ''}" overflow="visible">${DRAW.biscuit()}</svg>
    <g class="carried"><path d="M40 -92 Q30 -60 42 -52 L74 -52 Q84 -60 74 -92 Q64 -100 57 -98 Q50 -100 40 -92Z" fill="#4a4752" stroke="${LN}" stroke-width="2.5"/><path d="M52 -98 L57 -108 L62 -98" fill="none" stroke="${LN}" stroke-width="2.5"/></g>`, 420, 664, { flipable: true });
  const dogSvg = dogA.inner.querySelector('svg') as SVGElement, carried = dogA.inner.querySelector('.carried') as SVGElement;
  const B = (text: string, state = 'idle') => ({ who: 'biscuit', name: o.dogName, state, text, right: true, vars: o.dogVars } as const);
  const M = (text: string, state = 'idle') => ({ who: 'moka', name: o.mokaName, state, text, right: true, vars: o.mokaVars } as const);
  const H = (text: string) => ({ who: heroId, name: o.name, state: 'city', text } as const);
  await sleep(600);
  await talk([B('Leave the trash to me! I am very good with bins.', 'named')]);
  dogSvg.dataset.state = 'walk';
  await stage.walk(dogA, [{ x: 900, y: 664 }], 150);
  carried.style.display = 'none';
  $('lid').style.transform = 'rotate(-12deg)'; fx(960, 480, 'thud'); await sleep(250); $('lid').style.transform = '';
  await sleep(400);
  await stage.walk(dogA, [{ x: 560, y: 664 }], 170);
  dogA.flip = -1; dogSvg.dataset.state = 'idle';
  await talk([
    H('Phew… between my studies and the café, I am exhausted.'),
    H('Look at this mess… I really need someone to help me clean up at night.')
  ]);
  // Moka sort à son tour
  const mokaA = stage.add(`<svg x="-66" y="-166" width="132" height="172" viewBox="0 0 200 260" data-state="walk" style="${o.mokaVars ?? ''}" overflow="visible">${DRAW.moka()}</svg>`, 330, 660, { flipable: true });
  const mokaSvg = mokaA.inner.querySelector('svg') as SVGElement;
  await stage.walk(mokaA, [{ x: 450, y: 676 }], 140);
  mokaSvg.dataset.state = 'idle';
  await talk([
    H(`We did a nice job today, like always. Thank you for the help, ${o.mokaName} and ${o.dogName}!`),
    M('Hmph. Concierges expect a reward.'),
    B('Did someone say… treats?!')
  ]);
  // friandises : un petit poisson pour Moka, un os pour Biscuit
  fx(450, 470, '🐟', '#fff', 44); fx(560, 470, '🦴', '#fff', 44);
  await sleep(500);
  mokaSvg.dataset.state = 'cuddle'; dogSvg.dataset.state = 'eat';
  for (let i = 0; i < 3; i++) { fx(440 + i * 50, 440 - i * 16, '♥', '#f6b0b5'); await sleep(260); }
  await sleep(600);
  await talk([
    M('…Acceptable.', 'cuddle'), B('Best. Job. Ever.', 'eat'),
    { who: 'narr', text: 'Under the floorboards, tiny paws scurry. Someone heard that the café needs a cleaning crew…' }
  ]);
  stage.destroy();
  el.remove();
}
