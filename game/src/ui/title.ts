// Écran titre et choix du héros
import { h, ui, charSvg, NOIR_VARS, setHeroName } from './dom';
import { cleanName } from '../logic/save';

export function titleScreen(canContinue: boolean): Promise<'new' | 'continue'> {
  return new Promise(resolve => {
    const el = h(`<div class="title"><div class="panel">
      <h1 class="logo">Café Komorebi<small>A cozy café, a fading gift, and a few animal friends</small></h1>
      <div class="row">
        ${canContinue ? '<button class="btn gold" data-a="continue">Continue</button>' : ''}
        <button class="btn ${canContinue ? 'light' : ''}" data-a="new">New game</button>
      </div>
      <p style="margin-top:16px;font-size:14px">Levels 1–3 · Moka, Biscuit and the Crumb Crew</p></div></div>`);
    ui().appendChild(el);
    el.addEventListener('click', e => { const b = (e.target as HTMLElement).closest('button'); if (b) { el.remove(); resolve(b.dataset.a as 'new' | 'continue'); } });
  });
}

export function heroSelect(): Promise<{ hero: 'm' | 'f'; name: string; uniform: 'espresso' | 'noir'; level: number }> {
  return new Promise(resolve => {
    let hero: 'm' | 'f' = 'f', uniform: 'espresso' | 'noir' = 'espresso', level = 1;
    const el = h(`<div class="title"><div class="panel">
      <h2>Who are you?</h2><p>You have understood animals since you were little. Your cat Moka never lets you forget it.</p>
      <div class="heroes">
        <div class="pick on" data-h="f">${charSvg('heroF', 'city')}Hana</div>
        <div class="pick" data-h="m">${charSvg('heroM', 'city')}Ren</div>
      </div>
      <div class="field">Your name <input id="nm" maxlength="10" value="HANA"></div>
      <div class="field">Café uniform <span class="seg" id="uni"><button class="on" data-u="espresso">Brown</button><button data-u="noir">Black</button></span></div>
      <div class="heroes" id="uniPrev" style="margin:6px 0 0"></div>
      <div class="field">Start at <span class="seg" id="lvl"><button class="on" data-l="1">Level 1</button><button data-l="2">Level 2 · Juice bar</button><button data-l="3">Level 3 · Crumb Crew</button></span></div>
      <div class="row"><button class="btn" id="go">Start the story</button></div></div></div>`);
    ui().appendChild(el);
    const nm = el.querySelector('#nm') as HTMLInputElement;
    const prev = () => { setHeroName(cleanName(nm.value, hero)); el.querySelector('#uniPrev')!.innerHTML = `<div style="width:120px">${charSvg(hero === 'f' ? 'heroF' : 'heroM', uniform)}</div>`; };
    prev();
    nm.addEventListener('input', prev);
    el.querySelectorAll('.pick').forEach(p => p.addEventListener('click', () => {
      const was = hero; hero = (p as HTMLElement).dataset.h as 'm' | 'f';
      el.querySelectorAll('.pick').forEach(q => q.classList.toggle('on', q === p));
      if (nm.value.toUpperCase() === (was === 'f' ? 'HANA' : 'REN')) nm.value = hero === 'f' ? 'HANA' : 'REN';
      prev();
    }));
    el.querySelector('#uni')!.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest('button'); if (!b) return;
      uniform = b.dataset.u as 'espresso' | 'noir';
      el.querySelectorAll('#uni button').forEach(x => x.classList.toggle('on', x === b)); prev();
    });
    el.querySelector('#lvl')!.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest('button'); if (!b) return;
      level = +b.dataset.l!;
      el.querySelectorAll('#lvl button').forEach(x => x.classList.toggle('on', x === b));
    });
    el.querySelector('#go')!.addEventListener('click', () => {
      const n = cleanName(nm.value, hero);
      el.remove();
      resolve({ hero, name: n.charAt(0).toUpperCase() + n.slice(1).toLowerCase(), uniform, level });
    });
    void NOIR_VARS;
  });
}
