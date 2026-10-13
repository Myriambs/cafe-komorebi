// Niveau 3, la nuit : la Crumb Crew sort du mur, Moka avoue que ce sont ses amies secrètes,
// puis petit jeu de ménage — choisir une souris, puis la saleté qui correspond à son outil.
import { P, sparkle } from '../art/cast.js';
import { HOLE } from './roomArt.js';
import { DRAW, sleep } from './dom';
import { talk, say, type Line } from './dialogue';
import { Stage, type Actor } from './actors';
import type { Room } from './room';
import { SPOTS } from './room';
import { messFor, canClean, JOB, type Mess, type MessKind } from '../logic/crumbs';
import { CREW, type MouseWho } from '../logic/outfits';
import { PROFILES } from '../logic/profiles';
import { music } from '../audio/music';

const NS = 'http://www.w3.org/2000/svg';
const LANE = 520;          // couloir devant le comptoir, derrière les tables
const AISLE = 950;         // allée entre les deux colonnes de tables
const CUSHION = { x: 1334, y: 502 };
const OUT = { x: 132, y: 462 };  // juste devant le trou de souris (bas de la porte de la boulangerie)
const ICON: Record<MessKind, string> = { crumbs: '🥐', ring: '🧽', spill: '🧽', dust: '🪶', mud: '🧹', book: '📚' };
const TOOL: Record<MouseWho, string> = { captain: '🧹', dusty: '🪶', bubbles: '🧽', nibbles: '🥐' };
const JOB_TEXT: Record<MouseWho, string> = { captain: 'mud', dusty: 'dust', bubbles: 'spills', nibbles: 'crumbs' };

export interface CrewCtx {
  room: Room; hero: 'm' | 'f'; name: string; heroVars: string;
  mokaName: string; mokaVars: string;
  varsOf: (w: MouseWho) => string;
  /** Tables utilisées et tables où l'on a lu pendant la journée (pour le désordre). */
  used: number[]; read: number[]; juice: boolean;
  openCard: (w: MouseWho) => Promise<void>;
}

/** Dessin d'une saleté, centré sur (x, y). */
function messArt(m: Mess) {
  const { x, y } = m, ink = `stroke="${P.ink}" stroke-linejoin="round"`;
  switch (m.kind) {
    case 'crumbs': return [[-12, 2, 4], [-3, -3, 3], [6, 3, 4.5], [14, -2, 3], [0, 6, 2.6], [-8, 8, 2.4]].map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#e3b77a" ${ink} stroke-width="1.2"/>`).join('')
      + `<path d="M${x - 2} ${y - 8} q6 -6 12 0 q-6 3 -12 0z" fill="#d9a05a" ${ink} stroke-width="1.2"/>`;
    case 'ring': return `<ellipse cx="${x}" cy="${y}" rx="15" ry="6" fill="none" stroke="#8a5a3c" stroke-width="3" opacity=".8"/><ellipse cx="${x + 9}" cy="${y + 4}" rx="11" ry="4.5" fill="none" stroke="#8a5a3c" stroke-width="2.2" opacity=".55"/><circle cx="${x - 14}" cy="${y + 6}" r="2.4" fill="#8a5a3c" opacity=".7"/>`;
    case 'spill': return `<path d="M${x - 34} ${y} q-4 -12 14 -12 q10 -8 24 -2 q18 -2 18 9 q8 10 -10 13 q-12 6 -26 2 q-22 2 -20 -10z" fill="#f5a83a" fill-opacity=".85" ${ink} stroke-width="1.6"/><ellipse cx="${x - 8}" cy="${y - 4}" rx="9" ry="2.6" fill="#fff" opacity=".6"/><circle cx="${x + 26}" cy="${y + 10}" r="3.5" fill="#f5a83a" ${ink} stroke-width="1.2"/>`;
    case 'dust': return [[-14, 2, 12], [4, -2, 15], [18, 4, 10]].map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#bdb6c6" ${ink} stroke-width="1.4"/>`).join('')
      + [[-14, 2, 10.5], [4, -2, 13.5], [18, 4, 8.5]].map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#cfc8d6"/>`).join('')
      + `<path d="M${x - 6} ${y - 6} l3 -4 M${x + 10} ${y - 12} l2 -5 M${x + 22} ${y - 2} l4 -3" stroke="${P.ink}" stroke-width="1.2" stroke-linecap="round"/>`;
    case 'mud': return [[-22, 4, -10], [-2, -4, -10], [18, 4, -10]].map(([dx, dy, a]) => `<g transform="rotate(${a} ${x + dx} ${y + dy})"><ellipse cx="${x + dx}" cy="${y + dy}" rx="9" ry="5" fill="#7a5a44" opacity=".85"/><ellipse cx="${x + dx + 12}" cy="${y + dy}" rx="5" ry="4" fill="#7a5a44" opacity=".85"/></g>`).join('');
    case 'book': return `<g transform="rotate(-8 ${x} ${y})"><rect x="${x - 18}" y="${y - 8}" width="36" height="16" rx="2" fill="#7fa8d8" ${ink} stroke-width="1.8"/><rect x="${x - 15}" y="${y - 5}" width="30" height="4" fill="#fffaf2"/><path d="M${x + 8} ${y - 8} L${x + 8} ${y + 8}" stroke="${P.ink}" stroke-width="1.2"/></g>`;
  }
}

export async function crewNight(c: CrewCtx): Promise<{ cleaned: number }> {
  const { room } = c;
  const heroId = c.hero === 'f' ? 'heroF' : 'heroM';
  const svgRoot = room.el.querySelector('svg')!;
  const extra = room.$('extra');
  extra.innerHTML = `<g id="mess"></g><g id="crew"></g>`;
  const ui = document.createElementNS(NS, 'g'); ui.id = 'crewUi';
  svgRoot.appendChild(ui);
  const stage = new Stage(room.$('crew') as SVGGElement, y => 0.82 + (y - 560) / 900 * 0.5);
  const fx = (x: number, y: number, t: string, col = '#6e5040') => room.fx(x, y, t, col);

  const H = (text: string): Line => ({ who: heroId, name: c.name, state: 'espresso', text, vars: c.heroVars });
  const M = (text: string, state = 'idle'): Line => ({ who: 'moka', name: c.mokaName, state, text, right: true, vars: c.mokaVars });
  const R = (w: MouseWho, text: string, state = 'idle'): Line => ({ who: w, name: PROFILES[w].defaultName, state, text, right: true, vars: c.varsOf(w) });
  const NARR = (text: string): Line => ({ who: 'narr', text });

  // ---------- le désordre de la journée ----------
  const mess = messFor(SPOTS, c.used.length ? c.used : [0, 1], c.read, c.juice);
  const total = mess.length;
  const left = new Map(mess.map(m => [m.id, m]));
  room.$('mess').innerHTML = mess.map(m => `<g id="mess-${m.id}" class="hit" data-mess="${m.id}">${messArt(m)}
      <g class="bounce"><circle cx="${m.x}" cy="${m.y - 34}" r="15" fill="#fffaf2" stroke="${P.ink}" stroke-width="2"/><text x="${m.x}" y="${m.y - 28}" text-anchor="middle" font-size="16">${ICON[m.kind]}</text></g></g>`).join('');
  (room.$('mess') as SVGGElement).style.display = 'none';

  // ---------- les souris ----------
  const mice = {} as Record<MouseWho, Actor>;
  const busy = new Set<MouseWho>();
  const mouseSvg = (w: MouseWho, state = 'idle') => `<svg x="-40" y="-101" width="80" height="104" viewBox="0 0 200 260" data-state="${state}" style="${c.varsOf(w)}" overflow="visible">${DRAW[w]()}</svg>`;
  const setState = (w: MouseWho, s: string) => (mice[w].inner.firstElementChild as SVGElement).setAttribute('data-state', s);
  const addMouse = (w: MouseWho) => {
    const a = stage.add(mouseSvg(w, 'walk'), HOLE.x + 2, HOLE.y + 6, { flipable: true, cls: 'hit' });
    a.el.dataset.mouse = w; a.el.style.opacity = '0'; a.el.style.transition = 'opacity .4s';
    requestAnimationFrame(() => { a.el.style.opacity = '1'; });
    mice[w] = a; return a;
  };
  const walk = async (w: MouseWho, pts: { x: number; y: number }[], speed = 240) => {
    setState(w, 'walk'); await stage.walk(mice[w], pts, speed); setState(w, 'idle');
  };

  // ---------- 1. le héros regarde le désordre ----------
  room.tip(null);
  // les lampes restent allumées pour le ménage : nuit plus douce
  room.el.querySelector('rect.mn.tint')?.setAttribute('opacity', '.5');
  await sleep(500);
  (room.$('mess') as SVGGElement).style.display = '';
  await talk([
    H('The last customer is gone… Now look at this mess.'),
    H('Coffee rings, crumbs, muddy footprints… and I have class at nine tomorrow.')
  ]);

  // ---------- 2. ça couine dans le mur ----------
  music.sfx('squeak'); fx(HOLE.x + 70, HOLE.y - 70, 'squeak!');
  await sleep(700);
  addMouse('captain');
  await walk('captain', [{ x: OUT.x + 26, y: OUT.y + 14 }], 120);
  await sleep(300);
  await talk([H('…Did that wall just squeak?')]);
  // Moka saute de son coussin et se plante devant le trou
  setState('captain', 'idle');
  const mokaRun = room.walkMoka(150, 520, [{ x: CUSHION.x - 80, y: LANE }, { x: 260, y: LANE + 10 }]);
  await sleep(300);
  await walk('captain', [{ x: HOLE.x + 2, y: HOLE.y + 6 }], 260);
  mice.captain.el.style.opacity = '0';
  await mokaRun;
  await talk([
    M('Hmph. There is nothing here. Just an old wall. Go to bed.'),
    H(`${c.mokaName}… your tail is swishing. You only do that when you're hiding something.`),
    M('…', 'idle'),
    M("Fine. But you didn't hear it from me. Come out, everyone. It's safe.")
  ]);

  // ---------- 3. la Crumb Crew se présente ----------
  mice.captain.el.style.opacity = '1';
  const SPOT: Record<MouseWho, { x: number; y: number }> = { captain: { x: 262, y: 536 }, nibbles: { x: 206, y: 578 }, dusty: { x: 336, y: 556 }, bubbles: { x: 410, y: 536 } };
  await walk('captain', [OUT, SPOT.captain]);
  await talk([
    R('captain', 'Captain Crumb, leader of the Crumb Crew, at your service!'),
    R('captain', "We've lived behind the bakery wall since your grandmother's time. We keep the café tidy at night… quietly."),
    H('So YOU cleaned the counter last night!')
  ]);
  addMouse('nibbles'); await walk('nibbles', [OUT, SPOT.nibbles], 300);
  fx(SPOT.nibbles.x - 30, SPOT.nibbles.y - 100, '♥', '#e8586a');
  await talk([
    R('nibbles', `${c.mokaName}!! ${c.mokaName} is our best friend in the whole world!`, 'cheer'),
    M('We are NOT friends. It is a… business arrangement.'),
    R('captain', 'She brings us fish crackers. We keep her cushion free of crumbs. For six years.'),
    M('…Hmph. Someone has to look after them.')
  ]);
  addMouse('dusty'); await walk('dusty', [OUT, SPOT.dusty]);
  await talk([R('dusty', 'Hello… nice to meet y— a-a-ACHOO! Sorry. So much dust in here.')]);
  fx(SPOT.dusty.x, SPOT.dusty.y - 90, 'ACHOO!');
  addMouse('bubbles'); await walk('bubbles', [OUT, SPOT.bubbles]);
  await talk([
    R('bubbles', 'Oooh, coffee rings AND sticky juice? What a lovely mess! ♪'),
    R('captain', 'We heard you need help at night. Here is our offer: we clean every night, and you leave us the pastry crumbs.')
  ]);
  await say(R('captain', 'Do we have a deal, partner?'), ['Deal! ♡', 'Paw-shake deal!']);
  music.sfx('twinkle');
  for (const w of CREW) setState(w, 'cheer');
  for (let i = 0; i < 4; i++) { fx(200 + i * 70, 520 - (i % 2) * 20, '♥', '#e8586a'); await sleep(160); }
  await sleep(900);
  for (const w of CREW) setState(w, 'idle');
  await talk([M('Hmph. Try not to trip over them.')]);
  // Moka retourne faire la sieste (elle surveille d'un œil)
  room.walkMoka(CUSHION.x, CUSHION.y, [{ x: 260, y: LANE + 10 }, { x: CUSHION.x - 80, y: LANE }]).then(() => room.releaseMoka());

  // ---------- 4. le ménage ----------
  let selected: MouseWho | null = 'captain';
  let resolveDone!: () => void;
  const allDone = new Promise<void>(r => { resolveDone = r; });
  const drawUi = () => {
    const card = (w: MouseWho, i: number) => {
      const x = 20 + i * 150, y = 776, on = selected === w, b = busy.has(w);
      return `<g class="hit" data-pick="${w}" opacity="${b ? .6 : 1}"><g class="lift" id="pick-${w}" style="transform-box:fill-box;transform-origin:center">
        <rect x="${x}" y="${y}" width="140" height="108" rx="20" fill="${on ? '#fff3c4' : '#fffaf2'}" stroke="${on ? P.gold : P.ink}" stroke-width="${on ? 4.5 : 2.5}"/>
        <circle cx="${x + 38}" cy="${y + 44}" r="30" fill="#f6e7cf" stroke="${P.ink}" stroke-width="2"/>
        <svg x="${x + 8}" y="${y + 14}" width="60" height="60" viewBox="40 22 120 120" data-state="idle" style="${c.varsOf(w)}" overflow="hidden">${DRAW[w]()}</svg>
        <circle cx="${x + 112}" cy="${y + 34}" r="20" fill="#fff" stroke="${P.ink}" stroke-width="2"/><text x="${x + 112}" y="${y + 41}" text-anchor="middle" font-size="20">${TOOL[w]}</text>
        <text x="${x + 70}" y="${y + 94}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="${P.ink}">${b ? 'busy…' : PROFILES[w].defaultName}</text></g></g>
        <g class="hit" data-info="${w}"><circle cx="${x + 130}" cy="${y + 8}" r="13" fill="${P.ink}"/><text x="${x + 130}" y="${y + 13.5}" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-weight="700" font-size="15" fill="#fdf5e8">i</text></g>`;
    };
    const done = total - left.size;
    ui.innerHTML = `${CREW.map(card).join('')}
      <rect x="600" y="18" width="400" height="50" rx="25" fill="#fdf5e8" fill-opacity=".95" stroke="${P.ink}" stroke-width="2.5"/>
      <rect x="760" y="34" width="210" height="18" rx="9" fill="#f3e6d3" stroke="${P.ink}" stroke-width="1.5"/>
      <rect x="761.5" y="35.5" width="${207 * done / total}" height="15" rx="7.5" fill="#f2c46a"/>
      <text x="626" y="50" font-family="Nunito,sans-serif" font-weight="800" font-size="18" fill="${P.ink}">✨ ${done} / ${total} clean</text>`;
  };
  const hint = (t: string) => { room.$('tip').innerHTML = `<g class="popin"><rect x="640" y="788" width="920" height="86" rx="24" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.5"/>
    <foreignObject x="660" y="796" width="880" height="72"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 17px/1.35 Nunito,sans-serif;color:#3b2838;padding:4px 6px">${t}</div></foreignObject></g>`; };
  drawUi();
  hint('Tap a <b>mouse</b> (bottom left), then tap a mess with <b>their tool</b>: 🧹 mud · 🪶 dust · 🧽 spills · 🥐 crumbs. The 📚 books are your job: tap them to put them back on the shelf.');

  const wiggle = (w: MouseWho) => { const g = room.$(`pick-${w}`); g?.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: 420, iterations: 2 }); };
  const routeTo = (from: Actor, x: number, y: number) => {
    const pts: { x: number; y: number }[] = [];
    if (from.y > LANE + 40) pts.push({ x: AISLE, y: from.y }, { x: AISLE, y: LANE });
    else pts.push({ x: from.x, y: LANE });
    // vers les tables du devant : par l'allée centrale ; devant le comptoir (x < 480) : tout droit
    if (y > LANE + 40 && x > 480) pts.push({ x: AISLE, y: LANE }, { x: AISLE, y }, { x, y });
    else pts.push({ x, y: LANE }, { x, y });
    return pts;
  };
  const finishMess = (m: Mess) => {
    left.delete(m.id);
    room.$(`mess-${m.id}`)?.remove();
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="popin">${sparkle(m.x - 14, m.y - 10, 9)}${sparkle(m.x + 16, m.y - 18, 7)}${sparkle(m.x, m.y + 6, 6)}</g>`;
    room.$('fx').appendChild(g); setTimeout(() => g.remove(), 1200);
    music.sfx('twinkle');
    drawUi();
    if (!left.size) resolveDone();
  };
  const send = async (w: MouseWho, m: Mess) => {
    busy.add(w); drawUi();
    const claimed = room.$(`mess-${m.id}`); if (claimed) claimed.setAttribute('data-claimed', '1');
    await walk(w, routeTo(mice[w], m.x - 30, m.y + 8), 260);
    mice[w].flip = 1;
    setState(w, 'clean');
    music.sfx(w === 'bubbles' ? 'pour' : 'sweep');
    if (w === 'dusty' && Math.random() < .6) setTimeout(() => fx(m.x - 30, m.y - 80, 'a-choo!'), 700);
    await sleep(1800);
    setState(w, 'idle');
    finishMess(m);
    // la poussière près du coussin : Moka ouvre un œil… et pousse sa queue pour laisser passer Dusty
    if (m.kind === 'dust' && Math.hypot(m.x - CUSHION.x, m.y - CUSHION.y) < 140) {
      room.sayMoka('…mind my tail, little one ♡');
      setTimeout(() => room.sayMoka(null), 2200);
    }
    busy.delete(w); drawUi();
  };

  const onClick = (e: Event) => {
    const t = e.target as Element;
    const info = t.closest('[data-info]') as SVGElement | null;
    if (info) { const w = info.dataset.info as MouseWho; c.openCard(w).then(() => { const s = mice[w].inner.firstElementChild as SVGElement; s.setAttribute('style', c.varsOf(w)); drawUi(); }); return; }
    const pick = (t.closest('[data-pick]') ?? t.closest('[data-mouse]')) as SVGElement | null;
    if (pick) { const w = (pick.dataset.pick ?? pick.dataset.mouse) as MouseWho; selected = w; music.sfx('squeak'); drawUi(); return; }
    const me = t.closest('[data-mess]') as SVGElement | null;
    if (!me || me.dataset.claimed) return;
    const m = left.get(+me.dataset.mess!); if (!m) return;
    if (m.kind === 'book') {
      // le héros range le livre : il s'envole vers la bibliothèque
      me.dataset.claimed = '1';
      me.querySelector('.bounce')?.remove();
      (me as unknown as SVGGElement).style.transition = 'transform .8s ease-in, opacity .8s';
      (me as unknown as SVGGElement).style.transform = `translate(${1500 - m.x}px, ${380 - m.y}px) scale(.5)`;
      (me as unknown as SVGGElement).style.opacity = '0';
      fx(m.x, m.y - 40, 'Back on the shelf ♪');
      setTimeout(() => finishMess(m), 800);
      return;
    }
    if (!selected) { fx(m.x, m.y - 50, 'Pick a mouse first ♪'); return; }
    if (busy.has(selected)) { fx(m.x, m.y - 50, `${PROFILES[selected].defaultName} is busy…`); return; }
    if (!canClean(selected, m.kind)) {
      const a = mice[selected], right = JOB[m.kind] as MouseWho;
      fx(a.x, a.y - 90, `Not my tool! I do ${JOB_TEXT[selected]}.`);
      music.sfx('squeak'); wiggle(right);
      return;
    }
    send(selected, m);
  };
  svgRoot.addEventListener('click', onClick);
  await allDone;
  svgRoot.removeEventListener('click', onClick);
  while (busy.size) await sleep(200);
  room.$('tip').innerHTML = '';
  ui.innerHTML = '';

  // ---------- 5. tout brille ----------
  const sp = document.createElementNS(NS, 'g');
  sp.innerHTML = Array.from({ length: 14 }, (_, i) => `<g style="animation:shine 1.6s ${(i * .13).toFixed(2)}s infinite;transform-origin:${200 + (i * 97) % 1200}px ${380 + (i * 53) % 420}px;transform-box:view-box">${sparkle(200 + (i * 97) % 1200, 380 + (i * 53) % 420, 10)}</g>`).join('');
  room.$('fx').appendChild(sp);
  music.sfx('transform');
  const PARTY = SPOT;
  await Promise.all(CREW.map(w => walk(w, [...routeTo(mice[w], PARTY[w].x, PARTY[w].y)], 280)));
  for (const w of CREW) { mice[w].flip = 1; setState(w, 'cheer'); }
  await talk([
    R('bubbles', 'Sparkling! Every table shines like the moon ♪', 'cheer'),
    R('captain', 'The Crumb Crew never leaves a crumb behind!', 'cheer')
  ]);
  // Moka glisse discrètement des biscuits au poisson à ses amies
  room.sayMoka(null);
  await room.walkMoka(486, 552, [{ x: CUSHION.x - 80, y: LANE }, { x: 486, y: LANE }]);
  fx(SPOT.dusty.x, SPOT.dusty.y - 120, '🐟 🐟 🐟', '#fff');
  await sleep(700);
  await talk([
    R('nibbles', `Fish crackers! Thank you, ${c.mokaName}!`, 'cheer'),
    H(`${c.mokaName}… I saw that.`),
    M('You saw nothing.', 'idle'),
    H('Thank you, Crumb Crew. I left a plate of pastry crumbs by your door ♡'),
    R('captain', 'Same time tomorrow night, partner!', 'cheer')
  ]);
  room.walkMoka(CUSHION.x, CUSHION.y, [{ x: 486, y: LANE }, { x: CUSHION.x - 80, y: LANE }]).then(() => room.releaseMoka());
  // retour à la maison : le trou devient une petite porte
  await Promise.all(CREW.map((w, i) => sleep(i * 200).then(() => walk(w, [OUT, { x: HOLE.x + 2, y: HOLE.y + 6 }], 260)).then(() => { mice[w].el.style.opacity = '0'; })));
  room.setHole('door');
  fx(HOLE.x + 80, HOLE.y - 80, '♡ Crumb Crew ♡', '#c0506a');
  music.sfx('twinkle');
  await sleep(900);
  await talk([NARR(`From that night on, the Crumb Crew kept Café Komorebi sparkling, and ${c.mokaName} kept their secret… mostly.`)]);
  sp.remove();
  stage.destroy();
  ui.remove();
  return { cleaned: total };
}
