// Carte de personnage (inspirée de characters/caraterper.jpg) : portrait, nom modifiable, infos,
// goûts, personnalité, histoire, et tenues à acheter ou à porter.
import { h, ui, charSvg, type CharId } from './dom';
import { PROFILES } from '../logic/profiles';
import { OUTFITS, type Who } from '../logic/outfits';

export interface CardCtx {
  who: Who;
  name: string; locked?: boolean; charId: CharId; state: string; vars: string;
  equipped: string; owned: string[]; coins: () => number;
  onRename: (n: string) => string;              // renvoie le nom nettoyé
  onWear: (id: string) => string;               // renvoie les nouvelles variables CSS
  onBuy: (id: string, price: number) => boolean;
  /** Une tenue « pub » vient d'être débloquée (à sauvegarder). */
  onUnlock?: (id: string) => void;
  onCuddle?: () => void;
  /** Pas de changement de nom (la Crumb Crew garde ses noms). */
  fixedName?: boolean;
}

export function openCard(c: CardCtx): Promise<void> {
  return new Promise(resolve => {
    const p = PROFILES[c.who];
    const lock = c.locked;
    const el = h(`<div class="card-wrap cc-wrap"><div class="cc">
      <button class="cc-x" aria-label="Close">✕</button>
      <h2 class="cc-title">${lock ? '???' : c.name}</h2>
      <div class="cc-grid">
        <div class="cc-left">
          <div class="cc-avatar">${charSvg(c.charId, c.state, `style="${c.vars}"`)}</div>
          <div class="cc-h">Personality</div>
          ${p.personality.map(t => `<div class="cc-tag">${lock ? '…' : t}</div>`).join('')}
        </div>
        <div class="cc-right">
          <div class="cc-box cc-info">
            <div><b>Name</b> ${lock ? '???' : c.fixedName ? c.name : `<input class="cc-name" maxlength="12" value="${c.name}"> <button class="cc-save">Save</button>`}</div>
            ${p.fullName && !lock ? `<div><b>Full name</b> ${p.fullName}</div>` : ''}
            <div><b>Role</b> ${lock ? 'A lost dog near the bins' : p.role}</div>
            <div><b>Age</b> ${lock ? '?' : p.age}</div>
            <div><b>Special</b> ${lock ? 'Shy, hungry, watching you' : p.special}</div>
          </div>
          <div class="cc-two">
            <div><div class="cc-h">Likes</div><div class="cc-box">${(lock ? ['Food?'] : p.likes).map(x => `<div>- ${x}</div>`).join('')}</div></div>
            <div><div class="cc-h">Dislikes</div><div class="cc-box">${(lock ? ['Strangers'] : p.dislikes).map(x => `<div>- ${x}</div>`).join('')}</div></div>
          </div>
        </div>
      </div>
      <div class="cc-h">Story</div>
      <p class="cc-story">${lock ? 'Feed him at night to learn more about him.' : p.history}</p>
      ${lock ? '' : `<div class="cc-h">${c.fixedName ? 'Colours' : 'Outfits'} <span class="cc-coins"></span></div><div class="cc-outfits"></div>`}
      ${c.onCuddle ? '<button class="btn gold cc-cuddle">Give Moka a cuddle ♥</button>' : ''}
      <p class="cc-msg"></p>
    </div></div>`);
    ui().appendChild(el);
    const $ = (s: string) => el.querySelector(s) as HTMLElement;
    const msg = (t: string) => { $('.cc-msg').textContent = t; };
    const avatar = () => $('.cc-avatar svg');
    const drawOutfits = () => {
      if (lock) return;
      $('.cc-coins').textContent = `· ${Math.round(c.coins() * 100) / 100} coins`;
      $('.cc-outfits').innerHTML = OUTFITS[c.who].map(o => {
        const own = (o.price === 0 && !o.ad) || c.owned.includes(`${c.who}:${o.id}`), on = o.id === c.equipped;
        return `<button class="cc-out ${on ? 'on' : ''}" data-id="${o.id}" data-price="${o.price}" data-own="${own ? 1 : 0}" data-ad="${o.ad ? 1 : 0}">
          <i style="background:${o.swatch}"></i><span>${o.name}</span><em>${on ? '✓ Wearing' : own ? 'Wear' : o.ad ? '▶ Watch ad' : `Buy · ${o.price}c`}</em></button>`;
      }).join('');
    };
    drawOutfits();
    const close = () => { el.remove(); resolve(); };
    $('.cc-x').addEventListener('click', close);
    el.addEventListener('click', e => { if (e.target === el) close(); });
    el.querySelector('.cc-save')?.addEventListener('click', () => {
      const n = c.onRename(($('.cc-name') as HTMLInputElement).value);
      ($('.cc-name') as HTMLInputElement).value = n; $('.cc-title').textContent = n; msg(`Name saved: ${n}`);
    });
    el.querySelector('.cc-cuddle')?.addEventListener('click', () => { c.onCuddle?.(); avatar()?.setAttribute('data-state', 'cuddle'); setTimeout(() => avatar()?.setAttribute('data-state', c.state), 2200); });
    el.querySelector('.cc-outfits')?.addEventListener('click', async e => {
      const b = (e.target as HTMLElement).closest('.cc-out') as HTMLElement | null; if (!b) return;
      const id = b.dataset.id!, price = +b.dataset.price!;
      if (b.dataset.own !== '1' && b.dataset.ad === '1') {
        if (!await watchAd(el)) { msg('Ad closed early: the colour stays locked.'); return; }
        c.owned.push(`${c.who}:${id}`); c.onUnlock?.(id); msg('Thanks for watching! New colour unlocked ♡');
      } else if (b.dataset.own !== '1') {
        if (!c.onBuy(id, price)) { msg(`Not enough coins (needs ${price}).`); return; }
        c.owned.push(`${c.who}:${id}`); msg('New outfit bought!');
      }
      const vars = c.onWear(id); c.equipped = id;
      avatar()?.setAttribute('style', vars);
      drawOutfits();
    });
  });
}

/**
 * Pub récompensée — EMPLACEMENT PROVISOIRE : un faux écran de 5 s en attendant le vrai SDK de pub
 * (AdSense H5 / AdMob). Renvoie true si on l'a regardée jusqu'au bout.
 */
function watchAd(host: HTMLElement): Promise<boolean> {
  return new Promise(resolve => {
    let left = 5;
    const ad = h(`<div class="ad-wrap"><div class="ad-box">
      <div class="ad-tag">AD · placeholder</div>
      <div class="ad-art">☕🐾</div>
      <p>A real rewarded ad will play here later.<br>Thanks for supporting Café Komorebi!</p>
      <div class="ad-bar"><i></i></div>
      <button class="btn light ad-skip">Close</button><span class="ad-count">5</span></div></div>`);
    host.appendChild(ad);
    const bar = ad.querySelector('.ad-bar i') as HTMLElement, count = ad.querySelector('.ad-count') as HTMLElement;
    requestAnimationFrame(() => { bar.style.width = '100%'; });
    const t = setInterval(() => {
      left--; count.textContent = String(Math.max(0, left));
      if (left <= 0) { clearInterval(t); ad.remove(); resolve(true); }
    }, 1000);
    ad.querySelector('.ad-skip')!.addEventListener('click', () => { clearInterval(t); ad.remove(); resolve(false); });
  });
}
