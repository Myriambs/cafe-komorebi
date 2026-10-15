// Le menu du chevalet, en grand : message d'accueil + boissons du jour
import { h, ui } from './dom';
import { RECIPES } from '../logic/recipes';

export function openMenu(available: string[] = RECIPES.map(r => r.id)) {
  const el = h(`<div class="card-wrap"><div class="chalk">
    <button class="cc-x" aria-label="Close">✕</button>
    <h2>We're open! ☕</h2>
    <p class="chalk-msg">Come by, forget your worries outside,<br>and let us give you a cup of happiness.</p>
    <div class="chalk-list">${RECIPES.map(r => `<div class="${available.includes(r.id) ? '' : 'soon'}"><span>${r.name}</span><i></i><b>${available.includes(r.id) ? r.price + ' c' : 'soon'}</b></div>`).join('')}</div>
    <p class="chalk-foot">♡ Moka will show you to your seat ♡</p>
  </div></div>`);
  ui().appendChild(el);
  const close = () => el.remove();
  el.querySelector('.cc-x')!.addEventListener('click', close);
  el.addEventListener('click', e => { if (e.target === el) close(); });
}
