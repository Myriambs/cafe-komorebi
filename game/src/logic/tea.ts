// Salon de thé (niveau 5) : thés de la boîte de Leila, eau à la bonne température, infusion, douceurs — logique pure
export type TeaBase = 'green' | 'black' | 'chamomile';
export type Herb = 'mint' | 'cardamom';
export type Extra = 'honey' | 'pine' | 'milk' | 'icing';
export type Temp = 80 | 100;

export const BASE_NAME: Record<TeaBase, string> = { green: 'Green tea', black: 'Black tea', chamomile: 'Chamomile' };
export const HERB_NAME: Record<Herb, string> = { mint: 'Fresh mint', cardamom: 'Cardamom' };
export const EXTRA_NAME: Record<Extra, string> = { honey: 'Honey', pine: 'Pine nuts', milk: 'Milk', icing: 'Pink icing' };

export interface Tea { id: string; base: TeaBase; herb: Herb | null; extras: Extra[] }
export const TEAS: Tea[] = [
  { id: 'greenTea', base: 'green', herb: null, extras: [] },
  { id: 'blackTea', base: 'black', herb: null, extras: [] },
  { id: 'chamomile', base: 'chamomile', herb: null, extras: ['honey'] },
  { id: 'mintTea', base: 'green', herb: 'mint', extras: ['pine'] },
  { id: 'karak', base: 'black', herb: 'cardamom', extras: ['milk'] }
];
export type SweetId = 'cookies' | 'lemonCake' | 'chocCake';
export interface Sweet { id: SweetId; extras: Extra[] }
export const SWEETS: Sweet[] = [
  { id: 'cookies', extras: ['icing'] },
  { id: 'lemonCake', extras: [] },
  { id: 'chocCake', extras: [] }
];
export const teaById = (id: string) => TEAS.find(t => t.id === id);

/** Le thé vert brûle à 100 °C… sauf le thé à la menthe tunisien, qui se fait à l'eau bouillante. */
export const tempFor = (base: TeaBase, herb: Herb | null): Temp => base === 'green' && herb !== 'mint' ? 80 : 100;
/** Secondes avant que le thé devienne amer. */
export const STEEP: Record<TeaBase, number> = { green: 7, black: 9, chamomile: 10 };
/** « Juste comme il faut » sur la jauge d'infusion (0 = de l'eau chaude, 1 = amer). */
export const JUST_RIGHT = { from: 0.45, to: 0.78 };
export type Steep = 'weak' | 'right' | 'bitter';
export const steepResult = (s: number): Steep => s < JUST_RIGHT.from ? 'weak' : s <= JUST_RIGHT.to ? 'right' : 'bitter';
export const steepAfter = (s: number, seconds: number, base: TeaBase) => Math.min(1, s + seconds / STEEP[base]);

/** Couteau à gâteau : position (0..1) qui va et vient ; zone d'une belle part. */
export const SLICE = { from: 0.4, to: 0.6, period: 2.4 };
export const knifeAt = (t: number) => { const u = (t / SLICE.period) % 1; return u < 0.5 ? u * 2 : 2 - u * 2; };
export const goodSlice = (x: number) => x >= SLICE.from && x <= SLICE.to;

/** Ce qui est posé sur le plateau. */
export type TrayItem = { kind: 'tea'; base: TeaBase; herb: Herb | null; extras: Extra[] } | { kind: 'sweet'; id: SweetId; extras: Extra[] };

/** Pourquoi on ne peut pas verser l'eau (null = autorisé). */
export function cannotPour(base: TeaBase, herb: Herb | null, temp: Temp): string | null {
  const need = tempFor(base, herb);
  if (temp === need) return null;
  if (need === 80) return 'Boiling water makes green tea bitter: use 80°C';
  return herb === 'mint' ? 'Tunisian mint tea needs boiling water: use 100°C' : `${BASE_NAME[base]} needs boiling water: use 100°C`;
}
export function cannotAddExtra(it: TrayItem, e: Extra): string | null {
  if (it.extras.includes(e)) return `${EXTRA_NAME[e]} is already on it`;
  if (e === 'icing') return it.kind === 'sweet' && it.id === 'cookies' ? null : 'Icing is for the cookies';
  if (it.kind === 'sweet') return `${EXTRA_NAME[e]} goes in the tea, not on sweets`;
  return null;
}
const same = (a: readonly Extra[], b: readonly Extra[]) => a.length === b.length && a.every(x => b.includes(x));
/** Quelle commande ce plateau peut servir (null = aucune recette). */
export function identify(it: TrayItem): string | null {
  if (it.kind === 'sweet') { const s = SWEETS.find(x => x.id === it.id)!; return same(s.extras, it.extras) ? s.id : null; }
  return TEAS.find(t => t.base === it.base && t.herb === it.herb && same(t.extras, it.extras))?.id ?? null;
}
