// Cartes de fin de journée et de fin de niveau
import { h, ui, charSvg, type CharId } from './dom';
import { RECIPES } from '../logic/recipes';
import type { LevelStats } from '../logic/save';

export function dayCard(day: number, happy: number, earned: number, coins: number, next: string): Promise<void> {
  return new Promise(resolve => {
    const el = h(`<div class="card-wrap"><div class="panel">
      <h2>Day ${day} complete</h2><p>The last customer waves goodbye. Grandma hums while she wipes the counter.</p>
      <div class="stats"><div><b>${happy}</b>happy customers</div><div><b>+${Math.round(earned * 100) / 100}</b>coins earned</div><div><b>${Math.round(coins * 100) / 100}</b>coins total</div></div>
      <div class="row"><button class="btn">${next}</button></div></div></div>`);
    ui().appendChild(el);
    el.querySelector('button')!.addEventListener('click', () => { el.remove(); resolve(); });
  });
}

export function levelComplete(name: string, served: number, coins: number): Promise<void> {
  return new Promise(resolve => {
    const el = h(`<div class="card-wrap"><div class="panel">
      <h2>Level 1 complete!</h2>
      <div class="heroes"><div style="width:170px">${charSvg('biscuit', 'idle')}</div><div style="width:170px">${charSvg('moka', 'cuddle')}</div></div>
      <p><b>Biscuit joined the café.</b> He will guard the door at night and take out the trash.</p>
      <p>Grandma handed you the keys, ${name}. The animals are coming back.</p>
      <div class="stats"><div><b>${served}</b>happy customers</div><div><b>${Math.round(coins * 100) / 100}</b>coins</div></div>
      <p style="font-size:14px">Next: Level 2 · Pip the sparrow (coming soon)</p>
      <div class="row"><button class="btn">Back to the title</button></div></div></div>`);
    ui().appendChild(el);
    el.querySelector('button')!.addEventListener('click', () => { el.remove(); resolve(); });
  });
}

/** Bilan de fin de niveau : ce que tu as fait, ce que tu as le mieux réussi, qui a rejoint l'équipe. */
export function levelReport(o: { level: number; name: string; served: number; coins: number; stats: LevelStats; gained: { id: CharId; state: string; vars?: string; name: string }[]; next: string; button: string }): Promise<void> {
  return new Promise(resolve => {
    const drinks = Object.entries(o.stats.drinks).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...drinks.map(d => d[1]));
    const nameOf = (id: string) => RECIPES.find(r => r.id === id)?.name ?? id;
    const best = drinks[0];
    const praise = [
      best ? `Your <b>${nameOf(best[0])}</b> was the café favourite (${best[1]} made)` : '',
      o.stats.delighted ? `<b>${o.stats.delighted}</b> customers left delighted` : '',
      o.stats.books ? `You lent <b>${o.stats.books}</b> books and magazines` : '',
      o.stats.tips ? `You received <b>${o.stats.tips}</b> coins in tips ♡` : ''
    ].filter(Boolean);
    const el = h(`<div class="card-wrap"><div class="panel report">
      <h2>Level ${o.level} complete!</h2>
      <p>Well done, ${o.name}. Here is how your café did:</p>
      <div class="stats"><div><b>${o.served}</b>happy customers</div><div><b>${Math.round(o.coins * 100) / 100}</b>coins</div><div><b>${o.stats.delighted}</b>delighted</div></div>
      <div class="rp-grid">
        <div class="rp-chart"><h3>Drinks you made</h3>${drinks.map(([id, n]) => `<div class="rp-row"><span>${nameOf(id)}</span><i style="width:${Math.round(n / max * 100)}%"></i><b>${n}</b></div>`).join('') || '<p>No drinks yet</p>'}</div>
        <div class="rp-side"><h3>You were great at</h3><ul>${praise.map(p => `<li>${p}</li>`).join('')}</ul>
          ${o.gained.length ? `<h3>You gained</h3><div class="rp-pets">${o.gained.map(g => `<div><div class="rp-pet">${charSvg(g.id, g.state, g.vars ? `style="${g.vars}"` : '')}</div><b>${g.name}</b></div>`).join('')}</div>` : ''}
        </div>
      </div>
      <p class="rp-next">${o.next}</p>
      <div class="row"><button class="btn gold">${o.button}</button></div></div></div>`);
    ui().appendChild(el);
    el.querySelector('button')!.addEventListener('click', () => { el.remove(); resolve(); });
  });
}
