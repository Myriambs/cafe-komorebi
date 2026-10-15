import { describe, expect, it } from 'vitest';
import { matches, cannotAdd, recipeById } from './recipes';
import { tickPatience, outcome, payment, hearts } from './service';
import { dogJoins, planFor, LEVEL2_DAY, LEVEL3_DAY, LEVEL4_DAY, LEVEL5_DAY } from './level1';
import { TEAS, SWEETS, tempFor, cannotPour, cannotAddExtra, identify, steepResult, steepAfter, knifeAt, goodSlice, JUST_RIGHT } from './tea';
import { HOME_RECIPES } from './homeRecipes';
import { PASTRIES, pastryById, cannotAddDough, doughReady, bakeResult, heatAfter, GOLDEN } from './bakery';
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
    expect(LEVEL2_DAY.goal).toBe(3); expect(LEVEL3_DAY.goal).toBe(4);
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
  it('puts table mess on a chair seat or on the floor, alternating', () => {
    for (const r of [0.1, 0.9]) {
      const m = messFor(tables, [0, 1], [1], false, () => r).filter(x => x.table !== undefined);
      expect(m.every(x => x.on === 'seat' || x.on === 'floor')).toBe(true);
      expect(m.some(x => x.on === 'seat') && m.some(x => x.on === 'floor')).toBe(true);
      for (let i = 1; i < m.length; i++) expect(m[i].on).not.toBe(m[i - 1].on);
      expect(m.filter(x => x.on === 'seat').every(x => typeof x.chairY === 'number')).toBe(true);
    }
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

describe('level 4 · the bakery', () => {
  it('every pastry has a recipe card and a menu entry', () => {
    for (const p of PASTRIES) { const r = recipeById(p.id); expect(r.kind).toBe('pastry'); expect(r.need).toEqual([...p.dough, p.topping]); }
    for (const id of LEVEL4_DAY.recipes) expect(() => recipeById(id)).not.toThrow();
    expect(LEVEL4_DAY.recipes.some(id => recipeById(id).kind === 'pastry')).toBe(true);
  });
  it('only takes the dough from the card, once each', () => {
    const c = pastryById('croissant');
    expect(cannotAddDough([], 'flour', c)).toBeNull();
    expect(cannotAddDough(['flour'], 'flour', c)).toMatch(/already/);
    expect(cannotAddDough([], 'egg', c)).toMatch(/Flour \+ Butter/);
    expect(doughReady(['butter', 'flour'], c)).toBe(true);
    expect(doughReady(['flour'], c)).toBe(false);
  });
  it('bakes from pale to golden to burnt', () => {
    const c = pastryById('croissant');
    expect(bakeResult(0)).toBe('pale');
    const golden = heatAfter(0, c.bake * (GOLDEN.from + GOLDEN.to) / 2, c);
    expect(bakeResult(golden)).toBe('golden');
    expect(bakeResult(heatAfter(golden, c.bake, c))).toBe('burnt');
    expect(heatAfter(0.9, 100, c)).toBe(1);
  });
  it('every pastry has a real home recipe', () => {
    for (const p of PASTRIES) { const h = HOME_RECIPES[p.id]; expect(h.steps.length).toBeGreaterThan(4); expect(h.groups.flatMap(g => g.items).length).toBeGreaterThan(4); }
  });
  it('saves level 4', () => {
    expect(validate({ ...newSave('f', 'Hana', 'espresso'), level: 4 })!.level).toBe(4);
  });
});

describe('level 5 · tea & cakes', () => {
  it('every tea and sweet is on the menu', () => {
    for (const x of [...TEAS, ...SWEETS]) expect(recipeById(x.id).kind).toBe('tea');
    for (const id of LEVEL5_DAY.recipes) expect(() => recipeById(id)).not.toThrow();
  });
  it('green tea at 80°C, Tunisian mint tea and the rest at 100°C', () => {
    expect(tempFor('green', null)).toBe(80); expect(tempFor('green', 'mint')).toBe(100); expect(tempFor('black', 'cardamom')).toBe(100);
    expect(cannotPour('green', null, 100)).toMatch(/80°C/); expect(cannotPour('green', 'mint', 80)).toMatch(/mint/); expect(cannotPour('chamomile', null, 100)).toBeNull();
  });
  it('steeps from weak to just right to bitter', () => {
    expect(steepResult(0)).toBe('weak');
    expect(steepResult(steepAfter(0, 7 * (JUST_RIGHT.from + JUST_RIGHT.to) / 2, 'green'))).toBe('right');
    expect(steepResult(steepAfter(0, 99, 'black'))).toBe('bitter');
  });
  it('recognises each order from the tray', () => {
    expect(identify({ kind: 'tea', base: 'green', herb: 'mint', extras: ['pine'] })).toBe('mintTea');
    expect(identify({ kind: 'tea', base: 'green', herb: 'mint', extras: [] })).toBeNull();
    expect(identify({ kind: 'tea', base: 'black', herb: 'cardamom', extras: ['milk'] })).toBe('karak');
    expect(identify({ kind: 'sweet', id: 'cookies', extras: [] })).toBeNull();
    expect(identify({ kind: 'sweet', id: 'cookies', extras: ['icing'] })).toBe('cookies');
    expect(identify({ kind: 'sweet', id: 'lemonCake', extras: [] })).toBe('lemonCake');
  });
  it('icing only on cookies, tea extras only in tea', () => {
    expect(cannotAddExtra({ kind: 'tea', base: 'black', herb: null, extras: [] }, 'icing')).toMatch(/cookies/);
    expect(cannotAddExtra({ kind: 'sweet', id: 'chocCake', extras: [] }, 'honey')).toMatch(/tea/);
    expect(cannotAddExtra({ kind: 'tea', base: 'chamomile', herb: null, extras: ['honey'] }, 'honey')).toMatch(/already/);
  });
  it('the cake knife swings back and forth', () => {
    expect(knifeAt(0)).toBe(0); expect(knifeAt(1.2)).toBeCloseTo(1); expect(goodSlice(knifeAt(0.6))).toBe(true); expect(goodSlice(0.1)).toBe(false);
  });
});
