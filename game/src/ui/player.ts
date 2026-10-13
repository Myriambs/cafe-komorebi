// Lecteur de musique : choisir une ambiance, lecture / pause, volume
import { h, ui } from './dom';
import { music, STYLES } from '../audio/music';

let open: HTMLElement | null = null;
export function openPlayer() {
  if (open) { open.remove(); open = null; return; }
  const el = h(`<div class="player"><div class="pl-head"><span class="pl-disc"></span><b>Café radio</b><button class="pl-x" aria-label="Close">✕</button></div>
    <div class="pl-styles">${STYLES.map(s => `<button data-s="${s.id}" class="${s.id === music.style ? 'on' : ''}"><span>${s.icon}</span><b>${s.name}</b><small>${s.desc}</small></button>`).join('')}</div>
    <div class="pl-row"><button class="btn pl-play">${music.on ? '❚❚ Pause' : '▶ Play'}</button>
    <label>Volume <input type="range" min="0" max="1" step="0.05" value="${music.volume}"></label></div></div>`);
  ui().appendChild(el); open = el;
  const play = el.querySelector('.pl-play') as HTMLElement;
  const paint = () => { play.textContent = music.on ? '❚❚ Pause' : '▶ Play'; el.classList.toggle('playing', music.on); document.getElementById('musicBtn')?.classList.toggle('off', !music.on); };
  paint();
  el.querySelector('.pl-styles')!.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest('button'); if (!b) return;
    music.setStyle(b.dataset.s as typeof music.style);
    el.querySelectorAll('.pl-styles button').forEach(x => x.classList.toggle('on', x === b)); paint();
  });
  play.addEventListener('click', () => { music.toggle(); paint(); });
  el.querySelector('input')!.addEventListener('input', e => music.setVolume(+(e.target as HTMLInputElement).value));
  el.querySelector('.pl-x')!.addEventListener('click', () => { el.remove(); open = null; });
}
