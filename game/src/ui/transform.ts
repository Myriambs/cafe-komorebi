// Transformation : scène 3D (spirale d'étoiles, tour complet, uniforme, clin d'œil) sur fond de rayons pastel
import { h, ui } from './dom';
import { play3D } from '../world/transform3d.js';
import { music } from '../audio/music';

export async function transformScene(o: { hero: 'm' | 'f'; name: string; vars: string; full: boolean }) {
  const el = h(`<div class="tf screen"><div class="rays"></div>
    ${Array.from({ length: 14 }, (_, i) => `<div class="leafp" style="left:${(i * 37) % 100}%;animation-duration:${5 + (i % 5)}s;animation-delay:${-i * .7}s;background:${['#93b89f', '#f2a46b', '#f7c37f'][i % 3]}"></div>`).join('')}
    <div class="flash"></div>
    <div class="open">Café Komorebi is open!</div>
    <div class="plate">${o.name.toUpperCase()}</div>
    <button class="btn light skip">Skip ▶▶</button></div>`);
  ui().appendChild(el);
  const flash = el.querySelector('.flash') as HTMLElement;
  const show = (s: string) => el.querySelector(s)!.classList.add('show');
  music.sfx('transform');
  const run = play3D(el, { hero: o.hero, vars: o.vars, full: o.full }, {
    flash: () => { music.sfx('twinkle'); flash.classList.add('on'); setTimeout(() => flash.classList.remove('on'), 380); },
    plate: () => show('.plate'),
    open: () => show('.open')
  });
  const skip = new Promise<void>(r => el.querySelector('.skip')!.addEventListener('click', () => r()));
  await Promise.race([run.done, skip]);
  run.dispose();
  el.remove();
}
