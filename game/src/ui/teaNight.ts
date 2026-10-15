// Niveau 5, la nuit : le héros a préparé un minuscule service à thé sur la table 2. La Crumb Crew prend le thé,
// puis tout le monde remarque que le héros est épuisé… il faut embaucher quelqu'un (vers le niveau 6).
import { P, sparkle } from '../art/cast.js';
import { HOLE } from './roomArt.js';
import { DRAW, sleep } from './dom';
import { talk, type Line } from './dialogue';
import type { Actor } from './actors';
import type { Room } from './room';
import { SPOTS } from './room';
import { CREW, type MouseWho } from '../logic/outfits';
import { PROFILES } from '../logic/profiles';
import { music } from '../audio/music';

const NS = 'http://www.w3.org/2000/svg';
const LANE = 516;
const OUT = { x: HOLE.x - 30, y: HOLE.y + 22 };
const PARTY = SPOTS[1];
const TOP = PARTY.cy + 18;
/** Place de chaque souris autour de la petite théière, sur la nappe. */
const SEAT: Record<MouseWho, { dx: number; dy: number }> = { captain: { dx: -52, dy: 0 }, bubbles: { dx: -30, dy: 14 }, nibbles: { dx: 32, dy: 14 }, dusty: { dx: 54, dy: 0 } };

export interface TeaNightCtx {
  room: Room; heroName: string; hero: 'm' | 'f'; heroVars: string; mokaName: string; mokaVars: string; varsOf: (w: MouseWho) => string;
}

/** Le service à thé de poupée : théière, quatre dés à coudre en guise de tasses, biscuits roses. */
function tinyTeaSet(x: number, y: number) {
  const ink = `stroke="${P.ink}" stroke-linejoin="round"`;
  return `<g class="popin">
    <ellipse cx="${x}" cy="${y + 12}" rx="26" ry="7" fill="#fffaf2" ${ink} stroke-width="1.5"/>
    <path d="M${x - 10} ${y + 8} Q${x - 12} ${y - 4} ${x} ${y - 5} Q${x + 12} ${y - 4} ${x + 10} ${y + 8}Z" fill="#7fa8d8" ${ink} stroke-width="1.4"/>
    <path d="M${x + 10} ${y + 2} q6 -1 7 -6" fill="none" ${ink} stroke-width="2"/><circle cx="${x}" cy="${y - 7}" r="2" fill="#fffaf2" ${ink} stroke-width="1"/>
    ${[[-18, 12], [18, 12], [-7, 16], [8, 16]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="3.6" ry="2.2" fill="#e8b46a" ${ink} stroke-width=".8"/><ellipse cx="${x + dx}" cy="${y + dy - .6}" rx="2.6" ry="1.3" fill="#f6a5bd"/>`).join('')}
    ${sparkle(x - 30, y - 14, 6)}${sparkle(x + 30, y - 20, 5)}
  </g>`;
}

export async function teaNight(c: TeaNightCtx) {
  const { room } = c;
  const stage = room.stageRef, depth = room.$('depth');
  const fx = (x: number, y: number, t: string, col = '#6e5040') => room.fx(x, y, t, col);
  const heroId = c.hero === 'f' ? 'heroF' : 'heroM';
  const H = (text: string): Line => ({ who: heroId, name: c.heroName, state: 'espresso', text, vars: c.heroVars });
  const M = (text: string, state = 'idle'): Line => ({ who: 'moka', name: c.mokaName, state, text, right: true, vars: c.mokaVars });
  const R = (w: MouseWho, text: string, state = 'idle'): Line => ({ who: w, name: PROFILES[w].defaultName, state, text, right: true, vars: c.varsOf(w) });
  const NARR = (text: string): Line => ({ who: 'narr', text });

  const at = (y: number, html: string) => { const g = document.createElementNS(NS, 'g'); g.dataset.y = String(y); g.innerHTML = html; depth.appendChild(g); return g; };
  room.el.querySelector('rect.mn.tint')?.setAttribute('opacity', '.5');
  const set = at(PARTY.cy + 10.2, tinyTeaSet(PARTY.cx, TOP));

  const mice = {} as Record<MouseWho, Actor>;
  const mouseSvg = (w: MouseWho, state = 'idle') => `<svg x="-40" y="-101" width="80" height="104" viewBox="0 0 200 260" data-state="${state}" style="${c.varsOf(w)}" overflow="visible">${DRAW[w]()}</svg>`;
  const setState = (w: MouseWho, s: string) => (mice[w].inner.firstElementChild as SVGElement).setAttribute('data-state', s);
  const walk = async (w: MouseWho, pts: { x: number; y: number }[], speed = 260) => { setState(w, 'walk'); await stage.walk(mice[w], pts, speed); setState(w, 'idle'); };
  const sayAt = (x: number, y: number, text: string) => {
    const g = document.createElementNS(NS, 'g'), w = text.length * 8.6 + 30;
    g.innerHTML = `<g class="popin"><rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="38" rx="19" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.2"/>
      <path d="M${x - 8} ${y + 15} L${x} ${y + 30} L${x + 7} ${y + 15}Z" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.2" stroke-linejoin="round"/><rect x="${x - 10}" y="${y + 11}" width="19" height="6" fill="#fffaf2"/>
      <text x="${x}" y="${y + 3}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="${P.ink}">${text}</text></g>`;
    room.$('bubbles').appendChild(g); setTimeout(() => g.remove(), 2700);
  };

  await sleep(600);
  await talk([
    H("Closed! I left a tiny tea set on table 2… let's see if anyone comes."),
    M('Hmph. You know they will. They smelled the cookies an hour ago.')
  ]);
  room.setHole('open');
  music.sfx('squeak'); fx(HOLE.x - 60, HOLE.y - 70, 'squeak!');
  await sleep(400);
  // les quatre souris sortent l'une après l'autre et grimpent sur la table
  const onTable: SVGGElement[] = [];
  await Promise.all(CREW.map(async (w, i) => {
    await sleep(i * 350);
    const a = stage.add(mouseSvg(w, 'walk'), HOLE.x - 2, HOLE.y + 4, { flipable: true, base: 0.8 });
    a.el.style.transition = 'opacity .4s'; mice[w] = a;
    await walk(w, [OUT, { x: OUT.x - 60, y: LANE }, { x: PARTY.cx + 70, y: LANE + 10 }, { x: PARTY.cx + 70, y: PARTY.cy + 70 }], 300);
    a.el.style.opacity = '0';
    const s = SEAT[w];
    onTable.push(at(PARTY.cy + 10.5 + s.dy / 100, `<g transform="translate(${PARTY.cx + s.dx} ${TOP + s.dy}) scale(.78)">${mouseSvg(w, 'cheer')}</g>`));
    music.sfx('squeak');
  }));
  fx(PARTY.cx, TOP - 100, '♡ tea party ♡', '#c0506a');
  await talk([
    R('captain', 'A TEA PARTY! Partner, you shouldn\'t have!', 'cheer'),
    R('nibbles', 'Pink cookies!! And cups my size!', 'cheer'),
    R('bubbles', "I'll wash every tiny cup after, I promise ♪", 'cheer')
  ]);
  // une gorgée, une bouchée
  const swap = () => onTable.forEach((g, i) => { const sv = g.querySelector('svg[data-state]'); const cur = sv?.getAttribute('data-state'); sv?.setAttribute('data-state', cur === 'sip' ? 'nibble' : cur === 'nibble' ? 'sip' : i % 2 ? 'sip' : 'nibble'); });
  swap();
  const tick = setInterval(swap, 3000);
  await sleep(800);
  for (const [x, y, t] of [[PARTY.cx - 40, TOP - 110, 'Chamomile… so calming…'], [PARTY.cx + 40, TOP - 110, 'A-a-… no sneeze! Phew ♪'], [PARTY.cx, TOP - 110, 'nom nom nom ♡']] as [number, number, string][]) { sayAt(x, y, t); await sleep(2700); }
  clearInterval(tick);
  onTable.forEach(g => g.querySelector('svg[data-state]')?.setAttribute('data-state', 'idle'));

  // le héros bâille… tout le monde s'inquiète
  await talk([
    H('*yaaawn*… Sorry. Coffee, juice, bakery, and now tea… and my thesis is due next month.'),
    R('captain', 'Partner, the Crew can clean at night. But in the daytime, you need a helper with BIG hands.'),
    M('A human helper. Someone who can carry more than one cup at a time.'),
    H('Hiring someone… but they must never find out about you all!'),
    R('nibbles', "We'll be sooo quiet. Quiet as a crumb!", 'cheer'),
    R('dusty', 'Unless I sneeze.')
  ]);
  // retour à la maison
  onTable.forEach(g => g.remove()); set.remove();
  for (const w of CREW) { mice[w].x = PARTY.cx + 70; mice[w].y = PARTY.cy + 70; mice[w].el.style.opacity = '1'; }
  await Promise.all(CREW.map((w, i) => sleep(i * 200).then(() => walk(w, [{ x: PARTY.cx + 70 + i * 16, y: LANE }, OUT, { x: HOLE.x - 2, y: HOLE.y + 4 }], 280)).then(() => { mice[w].el.style.opacity = '0'; })));
  room.setHole('door');
  music.sfx('twinkle');
  await sleep(600);
  await talk([NARR('The next morning, a little sign appeared in the café window: "HELP WANTED ♡ Kind hands, warm heart."')]);
  for (const w of CREW) stage.remove(mice[w]);
}
