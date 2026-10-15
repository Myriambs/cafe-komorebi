// Boulangerie (niveau 4) : les fiches de la boîte à recettes de Grand-mère, la pâte et la cuisson — logique pure
export type Dough = 'flour' | 'butter' | 'sugar' | 'egg';
export type Topping = 'glaze' | 'pearl' | 'icing' | 'strawberry';
export type Shape = 'fold' | 'dome' | 'swirl' | 'layer';
export interface Pastry { id: string; dough: Dough[]; shape: Shape; topping: Topping; /** secondes pour passer de cru à brûlé */ bake: number }

export const DOUGH: Dough[] = ['flour', 'butter', 'sugar', 'egg'];
export const TOPPINGS: Topping[] = ['glaze', 'pearl', 'icing', 'strawberry'];
export const DOUGH_NAME: Record<Dough, string> = { flour: 'Flour', butter: 'Butter', sugar: 'Sugar', egg: 'Eggs' };
export const TOPPING_NAME: Record<Topping, string> = { glaze: 'Honey glaze', pearl: 'Crunchy sugar', icing: 'White icing', strawberry: 'Strawberries' };
export const SHAPE_NAME: Record<Shape, string> = { fold: 'Roll & fold', dome: 'Roll into a ball', swirl: 'Roll & swirl', layer: 'Pour into the pan' };

export const PASTRIES: Pastry[] = [
  { id: 'croissant', dough: ['flour', 'butter'], shape: 'fold', topping: 'glaze', bake: 8 },
  { id: 'melonpan', dough: ['flour', 'sugar', 'egg'], shape: 'dome', topping: 'pearl', bake: 8 },
  { id: 'cinnamon', dough: ['flour', 'butter', 'sugar'], shape: 'swirl', topping: 'icing', bake: 9 },
  { id: 'shortcake', dough: ['flour', 'egg', 'sugar'], shape: 'layer', topping: 'strawberry', bake: 10 }
];
export const pastryById = (id: string): Pastry => {
  const p = PASTRIES.find(x => x.id === id);
  if (!p) throw new Error(`Unknown pastry ${id}`);
  return p;
};

/** Coups de fouet pour que la pâte soit lisse. */
export const STIRS = 3;
/** Zone dorée de la jauge du four (0 = cru, 1 = brûlé). */
export const GOLDEN = { from: 0.5, to: 0.8 };
export type Bake = 'pale' | 'golden' | 'burnt';
export const bakeResult = (heat: number): Bake => heat < GOLDEN.from ? 'pale' : heat <= GOLDEN.to ? 'golden' : 'burnt';
/** Chaleur après `seconds` de plus dans le four. */
export const heatAfter = (heat: number, seconds: number, p: Pastry): number => Math.min(1, heat + seconds / p.bake);

/** Pourquoi on ne peut pas mettre cet ingrédient dans le bol (null = autorisé). */
export function cannotAddDough(bowl: readonly Dough[], d: Dough, p: Pastry): string | null {
  if (bowl.includes(d)) return `${DOUGH_NAME[d]} is already in the bowl`;
  if (!p.dough.includes(d)) return `Grandma's card says: ${p.dough.map(k => DOUGH_NAME[k]).join(' + ')}`;
  return null;
}
export const doughReady = (bowl: readonly Dough[], p: Pastry): boolean => bowl.length === p.dough.length && p.dough.every(d => bowl.includes(d));
