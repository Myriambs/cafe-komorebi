// Niveau 3 : le ménage de nuit avec la Crumb Crew — où sont les saletés, et qui sait les nettoyer
import type { MouseWho } from './outfits';

export type MessKind = 'crumbs' | 'ring' | 'spill' | 'dust' | 'mud' | 'book';
export interface Mess { id: number; kind: MessKind; x: number; y: number; table?: number }

/** Chaque saleté a son spécialiste ; les livres, c'est le héros qui les range. */
export const JOB: Record<MessKind, MouseWho | 'hero'> = {
  crumbs: 'nibbles', ring: 'bubbles', spill: 'bubbles', dust: 'dusty', mud: 'captain', book: 'hero'
};
export const canClean = (who: MouseWho | 'hero', kind: MessKind) => JOB[kind] === who;

/**
 * Le désordre de la journée : miettes et traces de tasse sur chaque table utilisée, un livre oublié
 * là où on a lu, du jus collant devant le bar s'il a servi, de la boue près de la porte et des moutons de poussière.
 */
export function messFor(tables: { cx: number; cy: number }[], used: number[], read: number[], juice: boolean): Mess[] {
  const out: Mess[] = [];
  const add = (kind: MessKind, x: number, y: number, table?: number) => out.push({ id: out.length + 1, kind, x, y, table });
  for (const t of [...new Set(used)].filter(i => tables[i]).sort()) {
    add('crumbs', tables[t].cx - 38, tables[t].cy + 14, t);
    add('ring', tables[t].cx + 40, tables[t].cy + 8, t);
  }
  for (const t of [...new Set(read)].filter(i => tables[i]).sort()) add('book', tables[t].cx + 2, tables[t].cy + 40, t);
  if (juice) add('spill', 640, 528);
  add('mud', 1236, 436); add('mud', 1080, 474);
  add('dust', 872, 426); add('dust', 1398, 566);
  return out;
}
