// La vraie recette d'une fiche de Grand-mère, en grand : à refaire à la maison
import { h, ui } from './dom';
import { recipeById } from '../logic/recipes';
import { HOME_RECIPES } from '../logic/homeRecipes';
import { TEAS } from '../logic/tea';
const TEA_IDS = TEAS.map(t => t.id);
import { pastryArt } from './bakeryStation';
import { teaItemArt } from './teaStation';

export function openHomeRecipe(id: string) {
  const r = HOME_RECIPES[id], rec = recipeById(id), name = rec.name;
  if (!r) return;
  const el = h(`<div class="card-wrap"><div class="home-recipe" role="dialog" aria-label="${name} recipe">
    <button class="cc-x" aria-label="Close">✕</button>
    <div class="hr-head">
      <svg viewBox="-40 -40 80 70" width="96" height="84">${rec.kind === 'tea' ? teaItemArt(id, 0, 0, 1) : pastryArt(id, 0, 0, 1)}</svg>
      <div><p class="hr-from">${rec.kind === 'tea' && TEA_IDS.includes(id) ? "From Leila's tea notes ♡" : "From Grandma's recipe tin ♡"}</p><h2>${name}</h2>
        <div class="hr-chips"><span>🍽 ${r.makes}</span><span>⏱ ${r.time}</span><span>🔥 ${r.oven}</span><span>⭐ ${r.level}</span></div></div>
    </div>
    <div class="hr-body">
      <div class="hr-ing"><h3>You will need</h3>${r.groups.map(g => `<h4>${g.title}</h4><ul>${g.items.map(i => `<li>${i}</li>`).join('')}</ul>`).join('')}</div>
      <div class="hr-steps"><h3>How to make it</h3><ol>${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        <p class="hr-tip"><b>Grandma's tip:</b> ${r.tip}</p></div>
    </div>
    <p class="hr-foot">A real recipe to try at home. Ask a grown-up to help with the oven ♡</p>
  </div></div>`);
  ui().appendChild(el);
  const close = () => { el.remove(); removeEventListener('keydown', onKey); };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  addEventListener('keydown', onKey);
  el.querySelector('.cc-x')!.addEventListener('click', close);
  el.addEventListener('click', e => { if (e.target === el) close(); });
}
