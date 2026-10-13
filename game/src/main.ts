// Point d'entrée du jeu
import './art/cast.css';
import './style.css';
import { run } from './game';
import { music } from './audio/music';
import { openPlayer } from './ui/player';

// la musique démarre au premier clic (règle des navigateurs) ; le bouton ♪ la coupe ou la relance
const btn = document.getElementById('musicBtn')!;
const paint = () => btn.classList.toggle('off', !music.on);
paint();
btn.addEventListener('click', e => { e.stopPropagation(); music.start(); openPlayer(); paint(); });
addEventListener('pointerdown', () => music.start(), { once: true });

// clavier : Entrée ou Espace avance le dialogue / valide le bouton principal ; ←/→ choisit une réponse
const KEY_TARGETS = ['.dlg', '.card-wrap .btn', '.hint button', '.tf .skip', '.title .btn', '.panel .btn'];
addEventListener('keydown', e => {
  const t = e.target as HTMLElement;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
  const choices = Array.from(document.querySelectorAll<HTMLButtonElement>('.dlg .choices button'));
  if (choices.length && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    const i = choices.indexOf(document.activeElement as HTMLButtonElement), d = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
    choices[(i + d + choices.length) % choices.length].focus(); e.preventDefault(); return;
  }
  if (e.key !== 'Enter' && e.key !== ' ') return;
  music.start();
  if (choices.length) { (choices.includes(document.activeElement as HTMLButtonElement) ? document.activeElement as HTMLButtonElement : choices[0]).click(); e.preventDefault(); return; }
  if (document.activeElement instanceof HTMLButtonElement && document.activeElement.isConnected && document.activeElement.offsetParent) return; // le navigateur clique déjà le bouton focalisé
  for (const sel of KEY_TARGETS) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el && el.offsetParent !== null) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); e.preventDefault(); return; }
  }
});

run();
