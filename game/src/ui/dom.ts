// Petits outils d'interface partagés
import castCss from '../art/cast.css?raw';
import { hero, moka, biscuit, grandma, customer, pip, kettle, captain, dusty, bubbles, nibbles } from '../art/cast.js';

export const ui = () => document.getElementById('ui')!;
export const world = () => document.getElementById('world')!;
export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export function h(html: string): HTMLElement {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild as HTMLElement;
}

/** Ferme l'iris, exécute la bascule, puis rouvre. */
export async function wipe(swap: () => void | Promise<void>) {
  const w = document.getElementById('wipe')!;
  w.classList.add('closed');
  await sleep(600);
  await swap();
  await sleep(120);
  w.classList.remove('closed');
  await sleep(450);
}

export type MouseId = 'captain' | 'dusty' | 'bubbles' | 'nibbles';
export type CharId = 'heroM' | 'heroF' | 'moka' | 'biscuit' | 'grandma' | 'custF' | 'custM' | 'pip' | 'kettle' | MouseId;
// nom gravé sur la broche (remplace HANA / REN par le nom choisi)
let heroName = '';
export function setHeroName(n: string) { heroName = n; }
const esc = (t: string) => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
function withName(svg: string) {
  if (!heroName) return svg;
  const n = esc(heroName.toUpperCase());
  const fit = n.length > 5 ? ' textLength="27" lengthAdjust="spacingAndGlyphs"' : '';
  return svg.replace(/<text class="brooch-name"([^>]*)>[^<]*<\/text>/, `<text class="brooch-name"$1${fit}>${n}</text>`);
}
export const DRAW: Record<CharId, () => string> = {
  heroM: () => withName(hero('m')), heroF: () => withName(hero('f')), moka, biscuit, grandma,
  custF: () => customer('f'), custM: () => customer('m'), pip, kettle, captain, dusty, bubbles, nibbles
};

/** Variables CSS de l'uniforme noir, à poser sur le <svg> quand l'état n'est pas « noir ». */
export const NOIR_VARS = '--shirt:#4a4452;--collar:#3d3845;--apron:#36313d;--apronD:#2d2933;--cap:#36313d;--brim:#2d2933;--pants:#36313d;';

/** SVG d'un personnage, à insérer dans le DOM (les animations CSS fonctionnent). */
export function charSvg(id: CharId, state: string, attrs = '', viewBox = '0 0 200 260') {
  return `<svg viewBox="${viewBox}" data-state="${state}" ${attrs} overflow="visible">${DRAW[id]()}</svg>`;
}

/** SVG autonome (styles inclus) pour une image ou une texture 3D. */
export function charImage(id: CharId, state: string, style = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260" width="400" height="520" data-state="${state}" style="${style}"><style><![CDATA[${castCss}]]></style>${DRAW[id]()}</svg>`;
}

export function clear() { ui().innerHTML = ''; }
