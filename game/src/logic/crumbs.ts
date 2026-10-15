// Niveau 3 : le ménage de nuit avec la Crumb Crew — où sont les saletés, et qui sait les nettoyer
import type { MouseWho } from './outfits';

export type MessKind = 'crumbs' | 'ring' | 'spill' | 'dust' | 'mud' | 'book';
export interface Mess {
  id: number; kind: MessKind; x: number; y: number; table?: number;
  /** Sur l'assise d'une chaise ou par terre ; chairY = pied de la chaise (pour l'ordre de dessin). */
  on?: 'seat' | 'floor'; chairY?: number;
}

/** Chaque saleté a son spécialiste ; les livres, c'est le héros qui les range. */
export const JOB: Record<MessKind, MouseWho | 'hero'> = {
  crumbs: 'nibbles', ring: 'bubbles', spill: 'bubbles', dust: 'dusty', mud: 'captain', book: 'hero'
};
export const canClean = (who: MouseWho | 'hero', kind: MessKind) => JOB[kind] === who;

/** Chaises de côté autour d'une table (mêmes décalages que la salle) : x, y du pied de chaise, échelle. */
export const SIDE_CHAIRS = [{ dx: -116, dy: 10 }, { dx: 116, dy: 10 }];
const CHAIR_S = 0.92;

/**
 * Le désordre de la journée. Autour de chaque table utilisée : des miettes et une goutte de café,
 * un livre oublié là où on a lu. Chaque saleté tombe au hasard soit SUR l'assise d'une chaise,
 * soit PAR TERRE à côté de la chaise (une fois l'un, une fois l'autre).
 * Plus : du jus collant devant le bar, de la boue près de la porte, des moutons de poussière.
 */
export function messFor(tables: { cx: number; cy: number }[], used: number[], read: number[], juice: boolean, rnd: () => number = Math.random): Mess[] {
  const out: Mess[] = [];
  const add = (kind: MessKind, x: number, y: number, table?: number, extra: Partial<Mess> = {}) => out.push({ id: out.length + 1, kind, x, y, table, ...extra });
  let onSeat = rnd() < 0.5;
  // chaque nouvelle saleté alterne chaise / sol, en partant d'un côté tiré au hasard
  const nearChair = (kind: MessKind, t: number, side: number) => {
    const c = SIDE_CHAIRS[side], x = tables[t].cx + c.dx, y = tables[t].cy + c.dy;
    if (onSeat) add(kind, x + (rnd() - 0.5) * 20, y + 2 * CHAIR_S, t, { on: 'seat', chairY: y });
    // par terre à côté de la chaise ; pour les tables du devant, plus près (sinon caché sous les cartes en bas)
    else if (y > 760) add(kind, x + (side ? 1 : -1) * (10 + rnd() * 12), y + 32, t, { on: 'floor' });
    else add(kind, x + (side ? 1 : -1) * (28 + rnd() * 26), y + 70, t, { on: 'floor' });
    onSeat = !onSeat;
  };
  for (const t of [...new Set(used)].filter(i => tables[i]).sort()) {
    const side = rnd() < 0.5 ? 0 : 1;
    nearChair('crumbs', t, side);
    nearChair('ring', t, 1 - side);
  }
  for (const t of [...new Set(read)].filter(i => tables[i]).sort()) nearChair('book', t, rnd() < 0.5 ? 0 : 1);
  if (juice) add('spill', 640, 528, undefined, { on: 'floor' });
  add('mud', 1236, 436, undefined, { on: 'floor' }); add('mud', 1080, 474, undefined, { on: 'floor' });
  add('dust', 872, 426, undefined, { on: 'floor' });
  // un mouton de poussière sous (ou sur) une chaise d'une table libre
  const free = tables.map((_, i) => i).filter(i => !used.includes(i));
  if (free.length) nearChair('dust', free[Math.floor(rnd() * free.length)], rnd() < 0.5 ? 0 : 1);
  else add('dust', 1398, 566, undefined, { on: 'floor' });
  return out;
}
