// Niveau 4, fin : le héros laisse un panier de mini-croissants devant la petite porte de la Crumb Crew.
// La nuit, les souris le trouvent, se régalent… puis filent pétrir la pâte du lendemain à la boulangerie.
import { P, sparkle } from '../art/cast.js';
import { HOLE } from './roomArt.js';
import { DRAW, sleep } from './dom';
import { talk, type Line } from './dialogue';
import type { Actor } from './actors';
import type { Room } from './room';
import { pastryArt } from './bakeryStation';
import { CREW, type MouseWho } from '../logic/outfits';
import { PROFILES } from '../logic/profiles';
import { music } from '../audio/music';

const NS = 'http://www.w3.org/2000/svg';
const LANE = 516;
const OUT = { x: HOLE.x - 30, y: HOLE.y + 22 };
/** Le panier, devant le coussin de Moka, à droite (bien visible au-dessus de la boîte de dialogue). */
export const BASKET = { x: 1440, y: 590 };
const AROUND: Record<MouseWho, { x: number; y: number }> = { captain: { x: 1374, y: 582 }, bubbles: { x: 1394, y: 626 }, dusty: { x: 1490, y: 626 }, nibbles: { x: 1508, y: 582 } };
/** Devant la porte de la boulangerie (mur de gauche). */
const BAKERY = { x: 176, y: 548 };

/** Panier en osier : mini-croissants, un torchon à carreaux et un petit mot plié. */
export function basketArt(x: number, y: number, full = true) {
  const ink = `stroke="${P.ink}" stroke-width="1.8" stroke-linejoin="round"`;
  return `<g class="popin"><g transform="translate(${x} ${y}) scale(1.25) translate(${-x} ${-y})">
    <ellipse cx="${x}" cy="${y + 2}" rx="40" ry="8" fill="#000" opacity=".12"/>
    <path d="M${x - 30} ${y - 26} Q${x} ${y - 70} ${x + 30} ${y - 26}" fill="none" stroke="#a8743f" stroke-width="5" stroke-linecap="round"/>
    <path d="M${x - 30} ${y - 26} Q${x} ${y - 70} ${x + 30} ${y - 26}" fill="none" ${ink} stroke-width="1" opacity=".5"/>
    <path d="M${x - 26} ${y - 30} L${x + 26} ${y - 30} L${x + 14} ${y - 18} L${x - 14} ${y - 18}Z" fill="#e86a5f" ${ink}/>
    ${full ? `${pastryArt('croissant', x - 14, y - 30, .42)}${pastryArt('croissant', x + 12, y - 32, .42)}${pastryArt('croissant', x, y - 38, .42)}` : ''}
    <path d="M${x - 34} ${y - 28} L${x + 34} ${y - 28} L${x + 26} ${y} L${x - 26} ${y}Z" fill="#d7aa7c" ${ink}/>
    <path d="M${x - 31} ${y - 19} L${x + 31} ${y - 19} M${x - 28} ${y - 9} L${x + 28} ${y - 9}" stroke="#a8743f" stroke-width="2"/>
    ${[-20, -6, 8, 22].map(dx => `<path d="M${x + dx} ${y - 28} L${x + dx * .8} ${y}" stroke="#a8743f" stroke-width="1.6"/>`).join('')}
    <g transform="translate(${x + 22} ${y - 40}) rotate(12)"><rect x="-9" y="-6" width="18" height="13" rx="1.5" fill="#fffaf2" ${ink} stroke-width="1.2"/><path d="M-3 0 q3 -4 6 0 q-3 4 -6 0" fill="#e8586a"/></g>
  </g></g>`;
}

export interface BakeNightCtx {
  room: Room; mokaName: string; mokaVars: string; varsOf: (w: MouseWho) => string; heroName: string;
}

export async function bakeNight(c: BakeNightCtx) {
  const { room } = c;
  const stage = room.stageRef, depth = room.$('depth');
  const fx = (x: number, y: number, t: string, col = '#6e5040') => room.fx(x, y, t, col);
  const M = (text: string, state = 'idle'): Line => ({ who: 'moka', name: c.mokaName, state, text, right: true, vars: c.mokaVars });
  const R = (w: MouseWho, text: string, state = 'idle'): Line => ({ who: w, name: PROFILES[w].defaultName, state, text, right: true, vars: c.varsOf(w) });
  const NARR = (text: string): Line => ({ who: 'narr', text });

  // le panier dans la profondeur de la salle
  const at = (y: number, html: string) => { const g = document.createElementNS(NS, 'g'); g.dataset.y = String(y); g.innerHTML = html; depth.appendChild(g); return g; };
  const basket = at(BASKET.y, basketArt(BASKET.x, BASKET.y));
  room.el.querySelector('rect.mn.tint')?.setAttribute('opacity', '.55');
  // le héros est rentré chez lui : seule la Crumb Crew (et Moka) sont là
  (room.$('heroSvg') as SVGElement).style.display = 'none';

  const mice = {} as Record<MouseWho, Actor>;
  const mouseSvg = (w: MouseWho, state = 'idle') => `<svg x="-40" y="-101" width="80" height="104" viewBox="0 0 200 260" data-state="${state}" style="${c.varsOf(w)}" overflow="visible">${DRAW[w]()}</svg>`;
  const setState = (w: MouseWho, s: string) => (mice[w].inner.firstElementChild as SVGElement).setAttribute('data-state', s);
  const walk = async (w: MouseWho, pts: { x: number; y: number }[], speed = 240) => { setState(w, 'walk'); await stage.walk(mice[w], pts, speed); setState(w, 'idle'); };
  const addMouse = (w: MouseWho) => {
    const a = stage.add(mouseSvg(w, 'walk'), HOLE.x - 2, HOLE.y + 4, { flipable: true, base: 0.8 });
    a.el.style.opacity = '0'; a.el.style.transition = 'opacity .4s';
    requestAnimationFrame(() => { a.el.style.opacity = '1'; });
    mice[w] = a; return a;
  };
  const sayAt = (x: number, y: number, text: string) => {
    const g = document.createElementNS(NS, 'g'), w = text.length * 8.6 + 30;
    g.innerHTML = `<g class="popin"><rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="38" rx="19" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.2"/>
      <path d="M${x - 8} ${y + 15} L${x} ${y + 30} L${x + 7} ${y + 15}Z" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.2" stroke-linejoin="round"/><rect x="${x - 10}" y="${y + 11}" width="19" height="6" fill="#fffaf2"/>
      <text x="${x}" y="${y + 3}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="15" fill="${P.ink}">${text}</text></g>`;
    room.$('bubbles').appendChild(g); setTimeout(() => g.remove(), 2700);
  };

  await sleep(600);
  await talk([NARR('Late that night, when the café is dark and quiet…')]);
  music.sfx('squeak'); fx(HOLE.x - 60, HOLE.y - 70, 'squeak?');
  room.setHole('open');
  await sleep(400);
  addMouse('captain');
  await walk('captain', [OUT, AROUND.captain], 160);
  mice.captain.flip = 1;
  await talk([R('captain', 'Crew! Partner left something by our door… and it smells like BUTTER!')]);
  for (const [i, w] of (['nibbles', 'bubbles', 'dusty'] as MouseWho[]).entries()) {
    await sleep(i ? 120 : 0);
    addMouse(w);
    walk(w, [OUT, AROUND[w]], 300).then(() => { mice[w].flip = AROUND[w].x > BASKET.x ? -1 : 1; });
  }
  await sleep(1500);
  for (const w of CREW) setState(w, 'cheer');
  fx(BASKET.x, BASKET.y - 110, '♡ ♡ ♡', '#e8586a');
  await talk([
    R('nibbles', 'CROISSANTS!! Tiny ones! Just our size!!', 'cheer'),
    R('bubbles', 'And a little note! It says… "Thank you for fixing the oven. Your partner ♡"', 'cheer'),
    R('dusty', 'Still warm… and not one speck of dust on them. A-a… no. No sneeze. Phew.'),
    M("Hmph. Don't eat them all at once. You'll get crumbs on my cushion.")
  ]);

  // chacun prend un mini-croissant
  basket.innerHTML = basketArt(BASKET.x, BASKET.y, false);
  for (const w of CREW) setState(w, 'nibble');
  music.sfx('twinkle');
  await sleep(600);
  for (const [x, y, t] of [[AROUND.nibbles.x, 470, 'nom nom nom ♪'], [AROUND.captain.x - 60, 470, 'Best night ever, crew.'], [AROUND.dusty.x - 20, 510, 'So flaky ♡']] as [number, number, string][]) {
    sayAt(x, y, t); await sleep(2600);
  }

  // la Crumb Crew a un nouveau travail : pétrir la pâte du lendemain
  for (const w of CREW) setState(w, 'idle');
  await talk([
    R('captain', 'Partner bakes for the whole town now. Mornings will be busy…'),
    R('captain', "Crew! Tomorrow's dough won't knead itself. To the bakery!", 'cheer'),
    R('nibbles', 'Can I wear a tiny chef hat?!', 'cheer'),
    M(`…I'll keep an eye on them. Someone has to.`)
  ]);
  await Promise.all(CREW.map((w, i) => sleep(i * 220).then(() => walk(w, [{ x: mice[w].x, y: LANE + i * 6 }, { x: 330, y: LANE + i * 6 }, { x: BAKERY.x + i * 10, y: BAKERY.y }], 280)).then(() => { mice[w].el.style.opacity = '0'; })));
  room.setHole('door');
  // petits nuages de farine qui s'échappent de la porte de la boulangerie
  const flour = document.createElementNS(NS, 'g');
  flour.innerHTML = [0, 1, 2, 3, 4, 5].map(k => `<g style="animation:shine 1.8s ${(k * .25).toFixed(2)}s infinite;transform-origin:${110 + k * 14}px ${420 - (k % 3) * 40}px;transform-box:view-box">${sparkle(110 + k * 14, 420 - (k % 3) * 40, 8)}</g>`).join('');
  room.$('fx').appendChild(flour);
  fx(130, 300, 'knead, knead ♪', '#c47a2c');
  music.sfx('sweep');
  await sleep(1200);
  await talk([NARR(`And so, every night, tiny paws knead the dough for the morning… and every morning, ${c.heroName} leaves a basket of croissants just their size by the little door.`)]);
  flour.remove(); basket.remove();
  for (const w of CREW) stage.remove(mice[w]);
}
