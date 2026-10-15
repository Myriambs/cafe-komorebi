// Niveau 3, la nuit : la Crumb Crew sort du mur, Moka avoue que ce sont ses amies secrètes,
// puis petit jeu de ménage — choisir une souris, puis la saleté qui correspond à son outil.
import { P, sparkle, biscuit } from '../art/cast.js';
import { HOLE } from './roomArt.js';
import { DRAW, sleep } from './dom';
import { talk, say, type Line } from './dialogue';
import type { Actor } from './actors';
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
const OUT = { x: HOLE.x - 30, y: HOLE.y + 22 };  // juste devant la porte secrète (bas du mur de droite)
const ASIDE = { x: 1400, y: 474 };                // Moka s'écarte pour laisser sortir ses amies
// Biscuit entre par la porte du café, voit le capitaine, puis se range à gauche de la Crumb Crew
/** Fin de nuit : la Crumb Crew se range devant le coussin de Moka, puis festin sur la table 2 (en haut à droite). */
const PARTY: Record<MouseWho, { x: number; y: number }> = { captain: { x: 1296, y: 566 }, bubbles: { x: 1352, y: 588 }, dusty: { x: 1408, y: 566 }, nibbles: { x: 1460, y: 588 } };
const FEAST = SPOTS[1];
/** Place de chaque souris sur le dessus de la table, autour du vase (décalage depuis le centre). */
const TABLE_SEAT: Record<MouseWho, { dx: number; dy: number }> = { captain: { dx: -50, dy: 0 }, bubbles: { dx: -28, dy: 14 }, nibbles: { dx: 30, dy: 14 }, dusty: { dx: 52, dy: 0 } };
const MOKA_BOWL = { x: 1300, y: 716 }, DOG_BOWL = { x: 1420, y: 722 };
const DOG_IN = { x: 1335, y: 380 }, DOG_SEE = { x: 1170, y: 392 }, DOG_SPOT = { x: 990, y: 462 };
/** Où la Crumb Crew se présente, en demi-cercle devant la porte. */
const SPOT: Record<MouseWho, { x: number; y: number }> = { captain: { x: 1296, y: 440 }, nibbles: { x: 1236, y: 478 }, dusty: { x: 1322, y: 500 }, bubbles: { x: 1176, y: 444 } };
const ICON: Record<MessKind, string> = { crumbs: '🥐', ring: '🧽', spill: '🧽', dust: '🪶', mud: '🧹', book: '📚' };
const TOOL: Record<MouseWho, string> = { captain: '🧹', dusty: '🪶', bubbles: '🧽', nibbles: '🥐' };
const JOB_TEXT: Record<MouseWho, string> = { captain: 'mud', dusty: 'dust', bubbles: 'spills', nibbles: 'crumbs' };

export interface CrewCtx {
  room: Room; hero: 'm' | 'f'; name: string; heroVars: string;
  mokaName: string; mokaVars: string;
  varsOf: (w: MouseWho) => string;
  /** Tables utilisées et tables où l'on a lu pendant la journée (pour le désordre). */
  used: number[]; read: number[]; juice: boolean;
  /** Biscuit rentre de sa ronde et retrouve ses vieux amis. */
  dogName: string; dogVars: string;
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
  extra.innerHTML = `<g id="mess"></g>`;
  const ui = document.createElementNS(NS, 'g'); ui.id = 'crewUi';
  svgRoot.appendChild(ui);
  // les souris marchent dans la même profondeur que les chaises et Moka : elles passent derrière, pas par-dessus
  const stage = room.stageRef, depth = room.$('depth');
  const GUARD = room.doorGuard;
  const fx = (x: number, y: number, t: string, col = '#6e5040') => room.fx(x, y, t, col);

  const H = (text: string): Line => ({ who: heroId, name: c.name, state: 'espresso', text, vars: c.heroVars });
  const M = (text: string, state = 'idle'): Line => ({ who: 'moka', name: c.mokaName, state, text, right: true, vars: c.mokaVars });
  const R = (w: MouseWho, text: string, state = 'idle'): Line => ({ who: w, name: PROFILES[w].defaultName, state, text, right: true, vars: c.varsOf(w) });
  const NARR = (text: string): Line => ({ who: 'narr', text });
  const B = (text: string, state = 'wag'): Line => ({ who: 'biscuit', name: c.dogName, state, text, right: true, vars: c.dogVars });

  // ---------- le désordre de la journée ----------
  const mess = messFor(SPOTS, c.used.length ? c.used : [0, 1], c.read, c.juice);
  const total = mess.length;
  const left = new Map(mess.map(m => [m.id, m]));
  // la saleté est dessinée dans la profondeur (sur l'assise d'une chaise, ou par terre) ; l'icône flotte au-dessus
  for (const m of mess) {
    const g = document.createElementNS(NS, 'g');
    g.id = `mess-${m.id}`; g.setAttribute('class', 'hit'); g.dataset.mess = String(m.id);
    g.dataset.y = String(m.on === 'seat' ? m.chairY! + 0.5 : m.y - 30);
    g.style.display = 'none';
    g.innerHTML = messArt(m);
    depth.appendChild(g);
  }
  room.$('mess').innerHTML = mess.map(m => `<g id="messi-${m.id}" class="hit" data-mess="${m.id}">
      <g class="bounce"><circle cx="${m.x}" cy="${m.y - 34}" r="15" fill="#fffaf2" stroke="${P.ink}" stroke-width="2"/><text x="${m.x}" y="${m.y - 28}" text-anchor="middle" font-size="16">${ICON[m.kind]}</text></g></g>`).join('');
  (room.$('mess') as SVGGElement).style.display = 'none';
  const showMess = () => { (room.$('mess') as SVGGElement).style.display = ''; mess.forEach(m => { (room.$(`mess-${m.id}`) as SVGGElement).style.display = ''; }); };

  // ---------- les souris ----------
  const mice = {} as Record<MouseWho, Actor>;
  const busy = new Set<MouseWho>();
  /** Souris perchée sur une chaise : le point par terre où elle redescend avant de repartir. */
  const perch = new Map<MouseWho, { x: number; y: number }>();
  const mouseSvg = (w: MouseWho, state = 'idle') => `<svg x="-40" y="-101" width="80" height="104" viewBox="0 0 200 260" data-state="${state}" style="${c.varsOf(w)}" overflow="visible">${DRAW[w]()}</svg>`;
  const setState = (w: MouseWho, s: string) => (mice[w].inner.firstElementChild as SVGElement).setAttribute('data-state', s);
  const addMouse = (w: MouseWho) => {
    const a = stage.add(mouseSvg(w, 'walk'), HOLE.x - 2, HOLE.y + 4, { flipable: true, cls: 'hit', base: 0.8 });
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
  showMess();
  await talk([
    H('The last customer is gone… Now look at this mess.'),
    H('Coffee rings, crumbs, muddy footprints… and I have class at nine tomorrow.')
  ]);

  // ---------- 2. ça couine dans le mur ----------
  music.sfx('squeak'); fx(HOLE.x - 60, HOLE.y - 70, 'squeak!');
  await sleep(500);
  room.setHole('open');
  await sleep(300);
  addMouse('captain');
  await walk('captain', [{ x: OUT.x - 40, y: OUT.y + 30 }], 120);
  await sleep(300);
  await talk([H("…The little door again! I knew I wasn't dreaming.")]);
  // Moka saute de son coussin et se plante devant la porte ; le capitaine rentre en courant
  setState('captain', 'idle');
  const mokaRun = room.walkMoka(GUARD.x, GUARD.y, [{ x: GUARD.x - 60, y: GUARD.y + 50 }]);
  await sleep(300);
  await walk('captain', [{ x: HOLE.x - 2, y: HOLE.y + 4 }], 260);
  mice.captain.el.style.opacity = '0';
  room.setHole('ajar');
  await mokaRun;
  room.setMoka('snub');
  await talk([
    M('Hmph. There is nothing here. Just an old wall. Go to bed.', 'snub'),
    H(`${c.mokaName}… your tail is swishing. You only do that when you're hiding something.`),
    M('…', 'idle'),
    M("Fine. But you didn't hear it from me. Come out, everyone. It's safe.")
  ]);

  // ---------- 3. la Crumb Crew se présente ----------
  // Moka s'écarte, la porte s'ouvre en grand
  room.setMoka('idle');
  await room.walkMoka(ASIDE.x, ASIDE.y);
  room.setHole('open');
  mice.captain.el.style.opacity = '1';
  await walk('captain', [OUT, SPOT.captain]);

  // Biscuit rentre de sa ronde… et sursaute en tombant nez à nez avec le capitaine (à chaque fois !)
  room.setDog('none');
  const dog = stage.add(`<svg x="-70" y="-171" width="140" height="182" viewBox="0 0 200 260" data-state="walk" style="${c.dogVars}" overflow="visible">${biscuit()}</svg>`, DOG_IN.x, DOG_IN.y, { flipable: true, base: 0.8 });
  const dogState = (st: string) => (dog.inner.firstElementChild as SVGElement).setAttribute('data-state', st);
  music.sfx('bell');
  await stage.walk(dog, [{ x: DOG_SEE.x, y: DOG_SEE.y }], 200);
  dog.flip = 1; dogState('idle');
  // le sursaut : un bond en l'air, « !! »
  music.sfx('squeak');
  fx(DOG_SEE.x, DOG_SEE.y - 170, '!!', '#c0506a');
  dog.inner.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-46px) rotate(-6deg)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], { duration: 650, easing: 'ease-out' });
  await sleep(700);
  await talk([B('WOUF?! …Oh! Hello, Captain Crumb! You always surprise me!', 'idle')]);
  dogState('wag');
  fx(DOG_SEE.x + 40, DOG_SEE.y - 150, '♥', '#e8586a');
  await talk([
    R('captain', `Evening, ${c.dogName}! Good patrol tonight?`),
    M(`Hmph. Hello, ${c.dogName}.`),
    B(`Hello, ${c.mokaName}! ♡`),
    H(`Wait… ${c.dogName}, you know them too?!`),
    B('Every night! I still jump every single time, though.'),
    R('captain', 'And hello to YOU, partner! Captain Crumb, leader of the Crumb Crew, at your service!'),
    R('captain', "We've lived behind this wall since your grandmother's time. We keep the café tidy at night… quietly."),
    R('captain', "Sorry I startled you earlier. So many customers today… we thought everyone had gone home!"),
    H('So that tiny door has been there all along…')
  ]);
  // il s'écarte pour laisser la place aux autres souris, la queue qui remue
  dogState('walk');
  await stage.walk(dog, [DOG_SPOT], 200);
  dog.flip = 1; dogState('wag');
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
  for (let i = 0; i < 4; i++) { fx(1170 + i * 55, 410 - (i % 2) * 20, '♥', '#e8586a'); await sleep(160); }
  await sleep(900);
  for (const w of CREW) setState(w, 'idle');
  await talk([M('Hmph. Try not to trip over them.')]);
  // Moka retourne faire la sieste (elle surveille d'un œil)
  room.walkMoka(CUSHION.x, CUSHION.y).then(() => room.releaseMoka());

  // ---------- 4. le ménage ----------
  let selected: MouseWho | null = 'captain';
  let resolveDone!: () => void;
  const allDone = new Promise<void>(r => { resolveDone = r; });
  const drawUi = () => {
    const card = (w: MouseWho, i: number) => {
      const x = 14 + i * 136, y = 776, on = selected === w, b = busy.has(w);
      return `<g class="hit" data-pick="${w}" opacity="${b ? .6 : 1}"><g class="lift" id="pick-${w}" style="transform-box:fill-box;transform-origin:center">
        <rect x="${x}" y="${y}" width="128" height="108" rx="20" fill="${on ? '#fff3c4' : '#fffaf2'}" stroke="${on ? P.gold : P.ink}" stroke-width="${on ? 4.5 : 2.5}"/>
        <circle cx="${x + 38}" cy="${y + 44}" r="30" fill="#f6e7cf" stroke="${P.ink}" stroke-width="2"/>
        <svg x="${x + 8}" y="${y + 14}" width="60" height="60" viewBox="40 22 120 120" data-state="idle" style="${c.varsOf(w)}" overflow="hidden">${DRAW[w]()}</svg>
        <circle cx="${x + 104}" cy="${y + 34}" r="18" fill="#fff" stroke="${P.ink}" stroke-width="2"/><text x="${x + 104}" y="${y + 41}" text-anchor="middle" font-size="20">${TOOL[w]}</text>
        <text x="${x + 64}" y="${y + 94}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="14" fill="${P.ink}">${b ? 'busy…' : PROFILES[w].defaultName}</text></g></g>
        <g class="hit" data-info="${w}"><circle cx="${x + 120}" cy="${y + 8}" r="13" fill="${P.ink}"/><text x="${x + 120}" y="${y + 13.5}" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-weight="700" font-size="15" fill="#fdf5e8">i</text></g>`;
    };
    const done = total - left.size;
    ui.innerHTML = `${CREW.map(card).join('')}
      <rect x="600" y="18" width="400" height="50" rx="25" fill="#fdf5e8" fill-opacity=".95" stroke="${P.ink}" stroke-width="2.5"/>
      <rect x="760" y="34" width="210" height="18" rx="9" fill="#f3e6d3" stroke="${P.ink}" stroke-width="1.5"/>
      <rect x="761.5" y="35.5" width="${207 * done / total}" height="15" rx="7.5" fill="#f2c46a"/>
      <text x="626" y="50" font-family="Nunito,sans-serif" font-weight="800" font-size="18" fill="${P.ink}">✨ ${done} / ${total} clean</text>`;
  };
  // la consigne en haut de l'écran : le bas reste libre pour voir la saleté sous les chaises du devant
  const hint = (t: string) => { room.$('tip').innerHTML = `<g class="popin"><rect x="340" y="80" width="920" height="86" rx="24" fill="#fffaf2" fill-opacity=".96" stroke="${P.ink}" stroke-width="2.5"/>
    <foreignObject x="360" y="88" width="880" height="72"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 17px/1.35 Nunito,sans-serif;color:#3b2838;padding:4px 6px">${t}</div></foreignObject></g>`; };
  drawUi();
  hint('Tap a <b>mouse</b> (bottom left), then tap a mess with <b>their tool</b>: 🧹 mud · 🪶 dust · 🧽 spills · 🥐 crumbs. The 📚 books are your job: tap them to put them back on the shelf.');

  const wiggle = (w: MouseWho) => { const g = room.$(`pick-${w}`); g?.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: 420, iterations: 2 }); };
  const routeTo = (from: Actor, x: number, y: number, w?: MouseWho) => {
    const pts: { x: number; y: number }[] = [];
    const down = w && perch.get(w);
    if (down) { pts.push(down); perch.delete(w!); from = { ...from, x: down.x, y: down.y } as Actor; }
    if (from.y > LANE + 40) pts.push({ x: AISLE, y: from.y }, { x: AISLE, y: LANE });
    else pts.push({ x: from.x, y: LANE });
    // vers les tables du devant : par l'allée centrale ; devant le comptoir (x < 480) : tout droit
    if (y > LANE + 40 && x > 480) pts.push({ x: AISLE, y: LANE }, { x: AISLE, y }, { x, y });
    else pts.push({ x, y: LANE }, { x, y });
    return pts;
  };
  const finishMess = (m: Mess) => {
    left.delete(m.id);
    room.$(`mess-${m.id}`)?.remove(); room.$(`messi-${m.id}`)?.remove();
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="popin">${sparkle(m.x - 14, m.y - 10, 9)}${sparkle(m.x + 16, m.y - 18, 7)}${sparkle(m.x, m.y + 6, 6)}</g>`;
    room.$('fx').appendChild(g); setTimeout(() => g.remove(), 1200);
    music.sfx('twinkle');
    drawUi();
    if (!left.size) resolveDone();
  };
  const send = async (w: MouseWho, m: Mess) => {
    busy.add(w); drawUi();
    for (const id of [`mess-${m.id}`, `messi-${m.id}`]) room.$(id)?.setAttribute('data-claimed', '1');
    if (m.on === 'seat') {
      // sur une chaise : on s'approche par terre, puis petit bond sur l'assise
      const floor = { x: m.x - 46, y: m.chairY! + 56 };
      await walk(w, routeTo(mice[w], floor.x, floor.y, w), 260);
      await walk(w, [{ x: m.x - 16, y: m.y + 4 }], 140);
      perch.set(w, floor);
    } else await walk(w, routeTo(mice[w], m.x - 30, m.y + 8, w), 260);
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
      room.$(`messi-${m.id}`)?.remove();
      const art = room.$(`mess-${m.id}`) as unknown as SVGGElement;
      art.dataset.claimed = '1';
      art.style.transition = 'transform .8s ease-in, opacity .8s';
      art.style.transform = `translate(${1540 - m.x}px, ${380 - m.y}px) scale(.5)`;
      art.style.opacity = '0';
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
  // la Crumb Crew se rassemble DEVANT le coussin de Moka (pas derrière elle)
  await Promise.all(CREW.map(w => walk(w, [...routeTo(mice[w], PARTY[w].x, PARTY[w].y, w)], 280)));
  for (const w of CREW) { mice[w].flip = 1; setState(w, 'cheer'); }
  dogState('wag');
  await talk([
    R('bubbles', 'Sparkling! Every table shines like the moon ♪', 'cheer'),
    R('captain', 'The Crumb Crew never leaves a crumb behind!', 'cheer'),
    H('You all worked so hard… I kept something for you to eat ♡')
  ]);

  // ---------- 6. le petit festin ----------
  // sur la table la plus proche : une assiette de miettes de pâtisserie ; par terre, les gamelles de Moka et Biscuit
  const at = (y: number, html: string, cls = 'popin') => {
    const g = document.createElementNS(NS, 'g'); g.dataset.y = String(y); g.innerHTML = `<g class="${cls}">${html}</g>`;
    depth.appendChild(g); return g;
  };
  const top = FEAST.cy + 18;
  const food = at(FEAST.cy + 10.2, `<ellipse cx="${FEAST.cx}" cy="${top + 12}" rx="22" ry="6.5" fill="#fffaf2" stroke="${P.ink}" stroke-width="1.6"/>
    ${[[-10, 9, '#e3b77a'], [0, 7, '#e8a24a'], [10, 9, '#f2c46a'], [-4, 13, '#d9a05a'], [6, 13, '#e3b77a']].map(([dx, dy, f]) => `<circle cx="${FEAST.cx + +dx}" cy="${top + +dy}" r="3.6" fill="${f}" stroke="${P.ink}" stroke-width="1"/>`).join('')}
    <path d="M${FEAST.cx + 30} ${top + 2} l8 0 l-1 10 l-6 0z" fill="#eef7fa" stroke="${P.ink}" stroke-width="1.2"/><path d="M${FEAST.cx + 30.6} ${top + 6} l6.8 0 l-.7 5.4 l-5.4 0z" fill="#f5a83a"/>
    ${sparkle(FEAST.cx - 30, top - 10, 7)}${sparkle(FEAST.cx + 26, top - 18, 6)}`);
  const bowl = (x: number, y: number, col: string, treat: string) => at(y, `<ellipse cx="${x}" cy="${y}" rx="30" ry="9" fill="${col}" stroke="${P.ink}" stroke-width="2"/><ellipse cx="${x}" cy="${y - 4}" rx="22" ry="5.5" fill="#f3e1b5"/>${treat}`);
  const mokaBowl = bowl(MOKA_BOWL.x, MOKA_BOWL.y, '#7fa8d8', [-9, 0, 9].map(dx => `<path d="M${MOKA_BOWL.x + dx - 5} ${MOKA_BOWL.y - 6} q5 -4 10 0 l3 -3 l0 6 l-3 -3 q-5 4 -10 0z" fill="#f2a24a" stroke="${P.ink}" stroke-width=".8"/>`).join(''));
  const dogBowl = bowl(DOG_BOWL.x, DOG_BOWL.y, '#e86a5f', [-8, 6].map(dx => `<path d="M${DOG_BOWL.x + dx - 6} ${DOG_BOWL.y - 4} l6 -9 l6 9z" fill="#fffaf2" stroke="${P.ink}" stroke-width="1"/><rect x="${DOG_BOWL.x + dx - 4}" y="${DOG_BOWL.y - 6}" width="8" height="3" fill="#3b2838"/>`).join(''));
  music.sfx('twinkle');
  await sleep(500);
  await talk([R('nibbles', 'Pastry crumbs! And tiny glasses of juice! Thank you!!', 'cheer')]);

  // les souris trottent jusqu'à la table et grimpent dessus ; Moka et Biscuit vont à leurs gamelles
  const onTable: SVGGElement[] = [];
  const climb = async (w: MouseWho, i: number) => {
    await sleep(i * 220);
    await walk(w, [...routeTo(mice[w], FEAST.cx + 70, FEAST.cy + 70, w)], 300);
    mice[w].el.style.opacity = '0';
    const p = TABLE_SEAT[w];
    onTable.push(at(FEAST.cy + 10.5 + p.dy / 100, `<g transform="translate(${FEAST.cx + p.dx} ${top + p.dy}) scale(.78)">${mouseSvg(w, i % 2 ? 'sip' : 'nibble')}</g>`));
    music.sfx('squeak');
  };
  const mokaGo = room.walkMoka(MOKA_BOWL.x, MOKA_BOWL.y - 12, [{ x: MOKA_BOWL.x, y: CUSHION.y + 50 }]).then(() => room.setMoka('munch'));
  dogState('walk');
  const dogGo = stage.walk(dog, [{ x: dog.x, y: LANE }, { x: DOG_BOWL.x + 90, y: LANE }, { x: DOG_BOWL.x + 90, y: DOG_BOWL.y - 2 }, { x: DOG_BOWL.x + 42, y: DOG_BOWL.y - 2 }], 200)
    .then(() => { dogState('eatdown'); });
  await Promise.all([...CREW.map(climb), mokaGo, dogGo]);
  fx(FEAST.cx, top - 90, 'nom nom ♪');
  // à tour de rôle : une bouchée, une gorgée
  const swap = setInterval(() => onTable.forEach(g => { const sv = g.querySelector('svg[data-state]'); sv?.setAttribute('data-state', sv.getAttribute('data-state') === 'sip' ? 'nibble' : 'sip'); }), 3200);
  // pendant qu'ils mangent, de petites bulles (pas de boîte de dialogue : on veut les voir manger)
  const sayAt = (x: number, y: number, text: string) => {
    const g = document.createElementNS(NS, 'g'), w = text.length * 8.6 + 30;
    g.innerHTML = `<g class="popin"><rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="38" rx="19" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.2"/>
      <path d="M${x - 8} ${y + 15} L${x} ${y + 30} L${x + 7} ${y + 15}Z" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.2" stroke-linejoin="round"/><rect x="${x - 10}" y="${y + 11}" width="19" height="6" fill="#fffaf2"/>
      <text x="${x}" y="${y + 3}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="${P.ink}">${text}</text></g>`;
    room.$('bubbles').appendChild(g); setTimeout(() => g.remove(), 2700);
  };
  await sleep(1500);
  const lines: [number, number, string][] = [
    [FEAST.cx - 40, top - 110, 'Mmm… a juice with no dust in it ♪'],
    [DOG_BOWL.x + 50, DOG_BOWL.y - 140, 'Wouf! Onigiri crumbs! Best night ever!'],
    [MOKA_BOWL.x - 20, MOKA_BOWL.y - 180, 'Hmph… these fish crackers are acceptable.'],
    [FEAST.cx + 30, top - 110, 'Tiny glasses are the best ♡ nom nom'],
    [FEAST.cx - 50, top - 110, 'Save some crumbs for tomorrow, crew!']
  ];
  for (const [x, y, t] of lines) { sayAt(x, y, t); await sleep(3000); }
  await talk([H('Tiny hands, tiny glasses… I could watch them all night ♡')]);
  await talk([R('captain', 'Thank you for the feast, partner. Same time tomorrow night!', 'cheer')]);
  clearInterval(swap);
  // fin du repas : on redescend de la table
  onTable.forEach(g => g.remove()); food.remove();
  for (const w of CREW) { mice[w].el.style.opacity = '1'; mice[w].x = FEAST.cx + 70; mice[w].y = FEAST.cy + 70; }
  room.setMoka('idle');
  room.walkMoka(CUSHION.x, CUSHION.y, [{ x: MOKA_BOWL.x, y: CUSHION.y + 50 }]).then(() => { room.releaseMoka(); mokaBowl.remove(); });
  dogState('wag'); setTimeout(() => dogBowl.remove(), 2500);
  // retour à la maison : le trou devient une petite porte
  await Promise.all(CREW.map((w, i) => sleep(i * 200).then(() => walk(w, [{ x: FEAST.cx + 70 + i * 18, y: LANE }, OUT, { x: HOLE.x - 2, y: HOLE.y + 4 }], 260)).then(() => { mice[w].el.style.opacity = '0'; })));
  // la porte secrète devient la petite porte peinte de la Crumb Crew
  room.setHole('door');
  fx(HOLE.x - 90, HOLE.y - 80, '♡ Crumb Crew ♡', '#c0506a');
  music.sfx('twinkle');
  await sleep(900);
  await talk([NARR(`From that night on, the Crumb Crew kept Café Komorebi sparkling, and ${c.mokaName} kept their secret… mostly.`)]);
  sp.remove();
  for (const w of CREW) stage.remove(mice[w]);
  stage.remove(dog); room.setDog('patrol');
  ui.remove();
  return { cleaned: total };
}
