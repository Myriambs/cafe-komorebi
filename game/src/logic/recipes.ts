// Recettes et ingrédients — logique pure, sans affichage
export type Ingredient = 'espresso' | 'water' | 'milk' | 'foam' | 'caramel' | 'cardamom' | 'chocolate'
  | 'orange' | 'apple' | 'lemon' | 'berry' | 'mint' | 'ice' | 'honey' | 'soda'
  | 'flour' | 'butter' | 'sugar' | 'egg' | 'glaze' | 'pearl' | 'icing' | 'strawberry';
/** Fruits : il faut les presser dans l'extracteur avant qu'ils arrivent dans le verre. */
export const FRUITS: Ingredient[] = ['orange', 'apple', 'lemon', 'berry'];

export const INGREDIENTS: Record<Ingredient, { name: string }> = {
  espresso: { name: 'Espresso' },
  water: { name: 'Hot water' },
  milk: { name: 'Milk' },
  foam: { name: 'Foam' },
  caramel: { name: 'Caramel' },
  cardamom: { name: 'Cardamom' },
  chocolate: { name: 'Chocolate' },
  orange: { name: 'Orange' },
  apple: { name: 'Apple' },
  lemon: { name: 'Lemon' },
  berry: { name: 'Berries' },
  mint: { name: 'Mint' },
  ice: { name: 'Ice' },
  honey: { name: 'Honey' },
  soda: { name: 'Sparkling water' },
  flour: { name: 'Flour' },
  butter: { name: 'Butter' },
  sugar: { name: 'Sugar' },
  egg: { name: 'Eggs' },
  glaze: { name: 'Honey glaze' },
  pearl: { name: 'Crunchy sugar' },
  icing: { name: 'White icing' },
  strawberry: { name: 'Strawberries' }
};

export interface Recipe { id: string; name: string; price: number; need: Ingredient[]; kind?: 'juice' | 'pastry' | 'tea' }

export const RECIPES: Recipe[] = [
  { id: 'espresso', name: 'Espresso', price: 3, need: ['espresso'] },
  { id: 'americano', name: 'Americano', price: 3.5, need: ['espresso', 'water'] },
  { id: 'latte', name: 'Latte', price: 4.5, need: ['espresso', 'milk'] },
  { id: 'cappuccino', name: 'Cappuccino', price: 4, need: ['espresso', 'milk', 'foam'] },
  { id: 'caramel', name: 'Caramel latte', price: 5, need: ['espresso', 'milk', 'caramel'] },
  { id: 'arabic', name: 'Arabic coffee', price: 4, need: ['espresso', 'water', 'cardamom'] },
  { id: 'mocha', name: 'Mocha', price: 5, need: ['espresso', 'milk', 'chocolate'] },
  { id: 'hotchoc', name: 'Hot chocolate', price: 4, need: ['milk', 'chocolate'] },
  { id: 'cardamomLatte', name: 'Cardamom latte', price: 5.5, need: ['espresso', 'milk', 'cardamom'] },
  // bar à jus (niveau 2) — que des boissons sans alcool
  { id: 'orangeJuice', name: 'Orange juice', price: 4, need: ['orange', 'ice'], kind: 'juice' },
  { id: 'appleMint', name: 'Apple mint', price: 4.5, need: ['apple', 'mint', 'ice'], kind: 'juice' },
  { id: 'lemonade', name: 'Honey lemonade', price: 4.5, need: ['lemon', 'honey', 'soda'], kind: 'juice' },
  { id: 'berryFizz', name: 'Berry fizz', price: 5, need: ['berry', 'soda', 'ice'], kind: 'juice' },
  // boulangerie (niveau 4) — les fiches de Grand-mère (pâte + garniture ; la forme et la cuisson sont dans logic/bakery)
  { id: 'croissant', name: 'Croissant', price: 3.5, need: ['flour', 'butter', 'glaze'], kind: 'pastry' },
  { id: 'melonpan', name: 'Melon pan', price: 3.5, need: ['flour', 'sugar', 'egg', 'pearl'], kind: 'pastry' },
  { id: 'cinnamon', name: 'Cinnamon roll', price: 4, need: ['flour', 'butter', 'sugar', 'icing'], kind: 'pastry' },
  { id: 'shortcake', name: 'Shortcake', price: 5, need: ['flour', 'egg', 'sugar', 'strawberry'], kind: 'pastry' },
  // salon de thé (niveau 5) — thés et douceurs ; les étapes sont dans logic/tea
  { id: 'greenTea', name: 'Green tea', price: 3.5, need: [], kind: 'tea' },
  { id: 'blackTea', name: 'Black tea', price: 3, need: [], kind: 'tea' },
  { id: 'chamomile', name: 'Chamomile', price: 3.5, need: [], kind: 'tea' },
  { id: 'mintTea', name: 'Mint tea', price: 4, need: [], kind: 'tea' },
  { id: 'karak', name: 'Karak chai', price: 4.5, need: [], kind: 'tea' },
  { id: 'cookies', name: 'Butter cookies', price: 3, need: [], kind: 'tea' },
  { id: 'lemonCake', name: 'Lemon cake', price: 4.5, need: [], kind: 'tea' },
  { id: 'chocCake', name: 'Choco cake', price: 5, need: [], kind: 'tea' }
];

export const recipeById = (id: string): Recipe => {
  const r = RECIPES.find(x => x.id === id);
  if (!r) throw new Error(`Unknown recipe ${id}`);
  return r;
};

/** Une tasse correspond à une recette si elle contient exactement ses ingrédients (ordre libre). */
export function matches(cup: readonly Ingredient[], recipe: Recipe): boolean {
  return cup.length === recipe.need.length && recipe.need.every(i => cup.includes(i));
}

/** Pourquoi on ne peut pas ajouter cet ingrédient (null = autorisé). */
export function cannotAdd(cup: readonly Ingredient[], ing: Ingredient): string | null {
  if (cup.includes(ing)) return `${INGREDIENTS[ing].name} is already in this cup`;
  if (ing === 'foam' && !cup.includes('milk')) return 'Add milk before the foam';
  return null;
}
