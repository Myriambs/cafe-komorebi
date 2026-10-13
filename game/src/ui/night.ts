// Nuit : sortir la poubelle derrière le café et rencontrer le husky perdu.
// Plein écran ; le héros et le chien marchent vraiment (pas de glissement).
import { h, ui, DRAW, sleep } from './dom';
import { say, talk } from './dialogue';
import { Stage } from './actors';

const LN = '#5a4a5e';
const L = (w = 2) => `stroke="${LN}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const BOWL = { x: 1262, y: 690 };
const ARCH = { x: 1500, y: 646 };

function alley() {
  const bricks: string[] = [];
  for (let y = 150; y < 640; y += 26) for (let x = ((y - 150) / 26) % 2 ? -560 : -520; x < 2140; x += 80) bricks.push(`<rect x="${x}" y="${y}" width="78" height="24" rx="3" fill="#a27d76" ${L(1)} opacity=".55"/>`);
  const stones: string[] = [];
  for (let i = 0; i < 70; i++) stones.push(`<ellipse cx="${-480 + (i * 131) % 2560}" cy="${668 + (i * 47) % 500}" rx="${26 + (i % 3) * 8}" ry="9" fill="#6b6882" ${L(1)} opacity=".6"/>`);
  return `<g class="art">
  <defs>
    <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1440"/><stop offset="1" stop-color="#2c3f82"/></linearGradient>
    <radialGradient id="doorLight"><stop offset="0" stop-color="#ffd59a" stop-opacity=".85"/><stop offset="1" stop-color="#ffb36b" stop-opacity="0"/></radialGradient>
    <linearGradient id="archDark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1c1a28"/><stop offset="1" stop-color="#2e2a40"/></linearGradient>
  </defs>
  <rect x="-500" y="-400" width="2600" height="560" fill="url(#nsky)"/>
  ${[[120, 40], [300, 90], [520, 30], [760, 70], [980, 40], [1180, 100], [1480, 50], [640, 120], [880, 130], [-200, 60], [1800, 80], [-60, 110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#fff6e0"/>`).join('')}
  <circle cx="1360" cy="78" r="34" fill="#fff8e0"/><circle cx="1360" cy="78" r="70" fill="#c8d7ff" opacity=".12"/>
  <rect x="-500" y="140" width="2600" height="500" fill="#8f6a64"/>${bricks.join('')}
  <path d="M-500 132 L2100 132 L2100 156 L-500 156Z" fill="#62769f" ${L(2)}/>
  <rect x="560" y="250" width="150" height="120" rx="8" fill="#ffd28a" ${L(2.5)}/><path d="M635 250 L635 370 M560 310 L710 310" stroke="#fdf5e8" stroke-width="6"/>
  <ellipse cx="340" cy="660" rx="240" ry="70" fill="url(#doorLight)"/>
  <rect x="250" y="320" width="180" height="320" rx="6" fill="#fdf5e8" ${L(2.5)}/><rect x="264" y="334" width="152" height="306" fill="#ffd59a"/>
  <path d="M264 334 L330 352 L330 640 L264 640Z" fill="#8a5a48" ${L(2)}/>
  <circle cx="340" cy="296" r="14" fill="#ffe2a6" ${L(2)}/><circle cx="340" cy="296" r="60" fill="#ffd28a" opacity=".25"/>
  <!-- passage vers l'arrière de la ruelle -->
  <path d="M1440 640 L1440 430 Q1500 380 1560 430 L1560 640Z" fill="url(#archDark)" ${L(2.5)}/>
  <path d="M1462 640 L1478 470 L1522 470 L1538 640Z" fill="#3b3650" opacity=".7"/>
  <text class="artText" x="1500" y="420" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="13" fill="#d9cfc6" opacity=".7">back alley</text>
  <rect x="-500" y="640" width="2600" height="560" fill="#5d5a72"/>${stones.join('')}
  <path d="M-500 640 L2100 640" ${L(2.5)}/>
  <rect x="1270" y="560" width="130" height="90" rx="4" fill="#c99b6e" ${L(2)}/><rect x="1300" y="500" width="100" height="62" rx="4" fill="#d7aa7c" ${L(2)}/>
  <g id="bins">
    <path d="M880 520 L1040 520 L1028 660 L892 660Z" fill="#7d9a8a" ${L(2.5)}/><path d="M912 540 L916 640 M960 540 L960 640 M1008 540 L1004 640" ${L(1.5)} opacity=".5"/>
    <g id="lid" style="transform-origin:960px 520px;transition:transform .2s"><rect x="868" y="500" width="184" height="24" rx="8" fill="#6b8778" ${L(2.5)}/><rect x="940" y="490" width="40" height="12" rx="4" fill="#5a7466" ${L(2)}/></g>
    <path d="M1060 540 L1190 540 L1180 660 L1070 660Z" fill="#88a596" ${L(2.5)}/><rect x="1050" y="522" width="150" height="22" rx="8" fill="#759282" ${L(2.5)}/>
  </g>
  <g id="bowl" opacity="0" style="transition:opacity .4s"><ellipse cx="${BOWL.x}" cy="${BOWL.y}" rx="40" ry="12" fill="#e86a5f" ${L(2)}/><ellipse cx="${BOWL.x}" cy="${BOWL.y - 6}" rx="30" ry="7" fill="#f3e1b5"/><circle cx="${BOWL.x - 10}" cy="${BOWL.y - 8}" r="5" fill="#fffaf2"/><circle cx="${BOWL.x + 8}" cy="${BOWL.y - 10}" r="5" fill="#fffaf2"/></g>
  <g id="bag" class="hit"><g class="bounce"><path d="M410 600 Q396 640 412 652 L470 652 Q486 640 472 600 Q456 588 441 590 Q426 588 410 600Z" fill="#4a4752" ${L(2.5)}/><path d="M432 590 L441 576 L450 590" fill="none" ${L(2.5)}/></g></g>
  <g id="actors"></g>
  <!-- bord du passage, devant le chien : il peut se cacher derrière pour épier -->
  <g id="archEdge" style="display:none"><path d="M1424 640 L1424 432 Q1432 418 1446 414 L1452 640Z" fill="#8f6a64" ${L(2)}/>
  <path d="M1428 470 L1450 470 M1428 520 L1450 520 M1428 570 L1450 570" ${L(1)} opacity=".5"/></g>
  <rect x="-500" y="-400" width="2600" height="1600" fill="#3a4a8a" class="tint" opacity=".35"/></g>
  <text x="1500" y="420" text-anchor="middle" font-family="Pixelify Sans, monospace" font-weight="700" font-size="14" fill="#d9cfc6">back alley</text>
  <g id="fx"></g>`;
}

export async function nightScene(o: { hero: 'm' | 'f'; night: 1 | 2; name: string; dogName?: string }) {
  const heroId = o.hero === 'f' ? 'heroF' : 'heroM';
  const dogName = o.dogName ?? 'Biscuit';
  const el = h(`<div class="screen" style="background:#5d5a72"><svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style="overflow:visible;background:transparent">${alley()}</svg>
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
    $('archEdge').style.display = '';
    await sleep(500);
    await talk([H('Goodnight, little one. See you tomorrow?'), { who: 'narr', text: 'From the dark of the back alley, two blue eyes keep watching you.' }]);
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
  const el = h(`<div class="screen" style="background:#5d5a72"><svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style="overflow:visible;background:transparent">${alley()}</svg>
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
