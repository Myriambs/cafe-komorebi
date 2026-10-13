import { describe, expect, it } from 'vitest';
import { matches, cannotAdd, recipeById } from './recipes';
import { tickPatience, outcome, payment, hearts } from './service';
import { dogJoins, planFor, LEVEL2_DAY, LEVEL3_DAY } from './level1';
import { messFor, canClean, JOB } from './crumbs';
import { validate, newSave, cleanName, cleanPetName } from './save';
import { OUTFITS, outfitOf } from './outfits';

describe('recipes', () => {
  it('matches regardless of order', () => {
    expect(matches(['milk', 'espresso', 'foam'], recipeById('cappuccino'))).toBe(true);
    expect(matches(['espresso', 'milk'], recipeById('cappuccino'))).toBe(false);
    expect(matches(['espresso', 'milk', 'caramel'], recipeById('latte'))).toBe(false);
  });
  it('knows the new drinks, and every day only offers existing recipes', () => {
    expect(matches(['water', 'cardamom', 'espresso'], recipeById('arabic'))).toBe(true);
    expect(matches(['espresso', 'water'], recipeById('arabic'))).toBe(false);
    expect(matches(['milk', 'chocolate'], recipeById('hotchoc'))).toBe(true);
    expect(matches(['espresso', 'milk', 'chocolate'], recipeById('mocha'))).toBe(true);
    for (const d of [1, 2, 3]) for (const id of planFor(d).recipes) expect(() => recipeById(id)).not.toThrow();
  });
  it('needs milk before foam and no duplicates', () => {
    expect(cannotAdd([], 'foam')).toMatch(/milk/);
    expect(cannotAdd(['espresso'], 'espresso')).toMatch(/already/);
    expect(cannotAdd(['espresso', 'milk'], 'foam')).toBeNull();
  });
});

describe('service', () => {
  it('patience never goes below zero', () => expect(tickPatience(3, 10)).toBe(0));
  it('maps patience to hearts and outcomes', () => {
    expect(hearts(100)).toBe(5); expect(hearts(0)).toBe(0);
    expect(outcome(90)).toBe('delighted'); expect(outcome(40)).toBe('happy'); expect(outcome(0)).toBe('content');
  });
  it('pays a tip for happy customers', () => {
    expect(payment(4, 'delighted')).toBe(6); expect(payment(4, 'content')).toBe(4);
  });
});

describe('level 1', () => {
  it('Biscuit joins on day 3 after 5 customers and two nights of food', () => {
    expect(dogJoins(3, 5, 2)).toBe(true);
    expect(dogJoins(3, 4, 2)).toBe(false);
    expect(dogJoins(2, 5, 2)).toBe(false);
    expect(dogJoins(3, 5, 1)).toBe(false);
  });
  it('clamps the day', () => expect(planFor(9).day).toBe(3));
});

describe('save', () => {
  it('rejects garbage and repairs bad values', () => {
    expect(validate(null)).toBeNull();
    expect(validate({ v: 2 })).toBeNull();
    const s = validate({ ...newSave('f', 'Mei', 'noir'), coins: -50, day: 99, nightsFed: 'x' })!;
    expect(s.coins).toBe(0); expect(s.day).toBe(3); expect(s.nightsFed).toBe(0); expect(s.name).toBe('Mei');
    expect(validate({ ...newSave('m', 'A', 'espresso'), coins: Infinity })!.coins).toBe(0);
  });
  it('cleans names', () => {
    expect(cleanName('<script>', 'm')).toBe('script');
    expect(cleanName('   ', 'f')).toBe('Hana');
  });
});

describe('outfits and names', () => {
  it('keeps valid outfits and names, repairs the rest', () => {
    const base = newSave('f', 'Mimi', 'matcha');
    expect(base.uniform).toBe('matcha');
    const s = validate({ ...base, uniform: 'tuxedo', names: { moka: '<b>Mochi</b>', biscuit: '', grandma: 'Chiyo' }, outfits: { moka: 'royal', grandma: 'nope', biscuit: 'sky' }, owned: ['moka:royal', 'evil', 'hero:sakura'] })!;
    expect(s.uniform).toBe('espresso');
    expect(s.names).toEqual({ moka: 'bMochib', biscuit: 'Biscuit', grandma: 'Chiyo' });
    expect(s.outfits).toEqual({ moka: 'royal', grandma: 'shutter', biscuit: 'sky', captain: 'red', dusty: 'cloud', bubbles: 'sky', nibbles: 'sunflower' });
    expect(s.owned).toEqual(['moka:royal', 'hero:sakura']);
  });
  it('falls back to the first outfit', () => {
    expect(outfitOf('moka', 'unknown').id).toBe('concierge');
    expect(OUTFITS.hero.filter(o => o.price === 0).length).toBe(2);
    expect(cleanPetName('   ', 'Moka')).toBe('Moka');
  });
});

describe('level 3 · the Crumb Crew', () => {
  const tables = [{ cx: 780, cy: 610 }, { cx: 1120, cy: 610 }, { cx: 730, cy: 805 }, { cx: 1110, cy: 810 }];
  it('levels 2 and 3 are short story days with real recipes', () => {
    expect(LEVEL2_DAY.goal).toBe(3); expect(LEVEL3_DAY.goal).toBe(3);
    for (const id of [...LEVEL2_DAY.recipes, ...LEVEL3_DAY.recipes]) expect(() => recipeById(id)).not.toThrow();
  });
  it('builds the mess from the tables used during the day', () => {
    const m = messFor(tables, [0, 2, 2], [2], true);
    expect(m.filter(x => x.kind === 'crumbs').map(x => x.table)).toEqual([0, 2]);
    expect(m.filter(x => x.kind === 'book')).toHaveLength(1);
    expect(m.some(x => x.kind === 'spill')).toBe(true);
    expect(new Set(m.map(x => x.id)).size).toBe(m.length);
    expect(messFor(tables, [], [], false).some(x => x.kind === 'spill')).toBe(false);
  });
  it('each mouse has a job, books are for the hero', () => {
    expect(canClean('bubbles', 'ring')).toBe(true); expect(canClean('captain', 'ring')).toBe(false);
    expect(JOB.book).toBe('hero');
    expect(new Set(Object.values(JOB))).toEqual(new Set(['nibbles', 'bubbles', 'dusty', 'captain', 'hero']));
  });
  it('saves level 3 and the crew outfits', () => {
    const base = newSave('f', 'Hana', 'espresso');
    const s = validate({ ...base, level: 3, outfits: { ...base.outfits, dusty: 'lavender', nibbles: 'nope' }, owned: ['dusty:lavender'] })!;
    expect(s.level).toBe(3); expect(s.outfits.dusty).toBe('lavender'); expect(s.outfits.nibbles).toBe('sunflower');
    expect(s.owned).toEqual(['dusty:lavender']);
    expect(OUTFITS.captain.length).toBeGreaterThan(1);
  });
});
