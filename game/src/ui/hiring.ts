// Niveau 6 : « On recrute ! » — l'annonce écrite le soir dans sa chambre ; le lendemain matin, tout le monde se
// réunit autour de l'ordinateur pour trier les CV (avec une douceur chacun) ; les entretiens au café (le héros sert
// café et biscuits, puis les questions s'enchaînent selon les réponses) ; le tableau des entretiens pour choisir ;
// l'appel ; et le premier jour : visite du café, choix du poste, et on ouvre ensemble.
import { P, sparkle, biscuit } from '../art/cast.js';
import { h, ui, sleep, charSvg, DRAW, type CharId } from './dom';
import { say, talk, type Line } from './dialogue';
import { Room, SPOTS } from './room';
import type { Actor } from './actors';
import { teaItemArt } from './teaStation';
import { candidatePortrait, member } from './hireArt';
import { music } from '../audio/music';
import { CREW, type MouseWho } from '../logic/outfits';
import { PROFILES } from '../logic/profiles';
import {
  CANDIDATES, QUALITIES, QUALITY_NAME, PAY, HOURS, QUESTIONS, QSHORT, FIRST_QUESTIONS, candById, matchCount, nextQuestions, interviewOf, needsRaise,
  type Candidate, type CandId, type JobPost, type Quality, type Pay, type Hours, type QId, type Interview, type Role
} from '../logic/hiring';

const NS = 'http://www.w3.org/2000/svg';
export interface HireCtx {
  hero: 'm' | 'f'; name: string; heroVars: string;
  mokaName: string; mokaVars: string; dogName: string; dogVars: string; grandmaName: string; grandmaVars: string;
  varsOf: (w: MouseWho) => string;
}
const esc = (t: string) => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
/** Ce que pensent les animaux (🐱 Moka, 🐶 Biscuit, 🐭 la Crumb Crew), affiché sur le tableau. */
const VOTES: Record<CandId, [boolean, boolean, boolean]> = {
  yuki: [true, true, true], sami: [false, true, true], lina: [true, true, true], marco: [false, false, false], noor: [true, true, true], kenji: [false, true, false]
};

function lines(c: HireCtx) {
  const heroId: CharId = c.hero === 'f' ? 'heroF' : 'heroM';
  return {
    H: (text: string, state = 'espresso'): Line => ({ who: heroId, name: c.name, state, text, vars: state === 'city' ? '' : c.heroVars }),
    M: (text: string, state = 'idle'): Line => ({ who: 'moka', name: c.mokaName, state, text, right: true, vars: c.mokaVars }),
    B: (text: string, state = 'wag'): Line => ({ who: 'biscuit', name: c.dogName, state, text, right: true, vars: c.dogVars }),
    R: (w: MouseWho, text: string, state = 'idle'): Line => ({ who: w, name: PROFILES[w].defaultName, state, text, right: true, vars: c.varsOf(w) }),
    C: (k: Candidate, text: string, state = 'idle'): Line => ({ name: k.name, text, right: true, svg: candidatePortrait(k, state) }),
    NARR: (text: string): Line => ({ who: 'narr', text })
  };
}
/** Petit dessin dans la profondeur de la salle (tasses, assiettes, gamelles…). */
function addDepth(room: Room, y: number, html: string) { const g = document.createElementNS(NS, 'g'); g.dataset.y = String(y); g.innerHTML = `<g class="popin">${html}</g>`; room.$('depth').appendChild(g); return g; }

/* ---------- 1. L'annonce, sur l'ordinateur portable ---------- */
export function writeJobPost(cafe = 'Café Komorebi'): Promise<JobPost> {
  return new Promise(resolve => {
    const post: JobPost = { qualities: [], pay: 'fair', hours: 'part' };
    const el = h(`<div class="card-wrap"><div class="laptop" role="dialog" aria-label="Job post">
      <div class="lp-bar"><i></i><i></i><i></i><span>komorebi-jobs.town</span></div>
      <div class="lp-body">
        <div class="lp-form">
          <h2>Write the job post</h2>
          <label>We are looking for someone who is… <small>(choose 3)</small></label>
          <div class="chips">${QUALITIES.map(q => `<button class="chip" data-q="${q}">${QUALITY_NAME[q]}</button>`).join('')}</div>
          <label>Hours</label>
          <div class="seg" data-k="hours">${(Object.keys(HOURS) as Hours[]).map(k => `<button data-v="${k}">${k === 'part' ? 'Part-time' : 'Full-time'}</button>`).join('')}</div>
          <label>Salary</label>
          <div class="seg" data-k="pay">${(Object.keys(PAY) as Pay[]).map(k => `<button data-v="${k}">${PAY[k].label} · ${PAY[k].perHour} c/h</button>`).join('')}</div>
          <p class="lp-note"></p>
        </div>
        <div class="lp-preview"></div>
      </div>
      <div class="row"><button class="btn gold" id="postIt" disabled>Post it ♡</button></div>
    </div></div>`);
    ui().appendChild(el);
    const draw = () => {
      el.querySelectorAll<HTMLButtonElement>('.chip').forEach(b => { const on = post.qualities.includes(b.dataset.q as Quality); b.classList.toggle('on', on); b.disabled = !on && post.qualities.length >= 3; });
      el.querySelectorAll<HTMLButtonElement>('.seg[data-k=hours] button').forEach(b => b.classList.toggle('on', b.dataset.v === post.hours));
      el.querySelectorAll<HTMLButtonElement>('.seg[data-k=pay] button').forEach(b => b.classList.toggle('on', b.dataset.v === post.pay));
      el.querySelector('.lp-note')!.textContent = post.pay === 'low' ? 'A small salary… experienced people may ask for more.' : post.pay === 'fair' ? 'A fair salary: most people will be happy with it ♡' : 'Generous! Everyone will want to work here (can the café afford it?)';
      el.querySelector('.lp-preview')!.innerHTML = `<div class="post"><p class="post-tag">NEW · Help wanted</p><h3>☕ ${esc(cafe)} is hiring!</h3>
        <p><b>Barista & bakery helper</b> in a cozy café with a tea room.</p>
        <p>We are looking for someone who is:</p><ul>${post.qualities.map(q => `<li>${QUALITY_NAME[q]}</li>`).join('') || '<li class="muted">…choose 3 qualities</li>'}</ul>
        <p>⏰ ${HOURS[post.hours]}</p><p>💰 ${PAY[post.pay].perHour} coins / hour</p>
        <p class="muted">Kind team, warm croissants, and one very opinionated cat.</p></div>`;
      (el.querySelector('#postIt') as HTMLButtonElement).disabled = post.qualities.length !== 3;
    };
    el.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest('button'); if (!b) return;
      if (b.dataset.q) { const q = b.dataset.q as Quality; post.qualities = post.qualities.includes(q) ? post.qualities.filter(x => x !== q) : [...post.qualities, q].slice(0, 3); }
      else if (b.dataset.v) { const k = (b.parentElement as HTMLElement).dataset.k; if (k === 'hours') post.hours = b.dataset.v as Hours; else post.pay = b.dataset.v as Pay; }
      else if (b.id === 'postIt' && post.qualities.length === 3) { music.sfx('twinkle'); el.remove(); return resolve(post); }
      draw();
    });
    draw();
  });
}

/* ---------- 2. Les CV, à glisser : ♥ ou ✖ ---------- */
function cvCard(c: Candidate, post: JobPost) {
  const m = matchCount(c, post);
  return `<div class="cv-card" data-id="${c.id}">
    <div class="cv-top"><div class="cv-photo">${candidatePortrait(c)}</div>
      <div><h3>${c.name}, ${c.age}</h3><p class="cv-title">${c.title}</p>
      <p class="cv-match">Matches your post: ${'●'.repeat(m)}${'○'.repeat(3 - m)} <b>${m}/3</b></p></div></div>
    <ul class="cv-exp">${c.experience.map(x => `<li>${x}</li>`).join('')}</ul>
    <div class="cv-traits">${c.traits.map(t => `<span class="${post.qualities.includes(t) ? 'hit' : ''}">${QUALITY_NAME[t]}</span>`).join('')}</div>
    <p class="cv-quote">${c.quote}</p>
    <p class="cv-fun">✨ ${c.fun}</p>
    <div class="stamp love">LOVE ♥</div><div class="stamp nope">NOPE ✖</div>
  </div>`;
}
const PORTRAIT: Partial<Record<CharId, string>> = { moka: '30 70 140 140', biscuit: '30 66 140 140', captain: '30 30 140 140', dusty: '30 22 140 140', bubbles: '30 30 140 140', nibbles: '30 40 140 140' };
export function swipeCVs(post: JobPost, ctx: HireCtx): Promise<Set<CandId>> {
  return new Promise(resolve => {
    const loved = new Set<CandId>();
    let i = 0, busy = false;
    const el = h(`<div class="cv-wrap"><div class="cv-panel" role="dialog" aria-label="Applications">
      <div class="lp-bar"><i></i><i></i><i></i><span>komorebi-jobs.town · inbox</span></div>
      <h2>Applications <span class="cv-count"></span></h2>
      <div class="cv-stack"></div>
      <div class="cv-react"></div>
      <div class="cv-btns"><button class="cv-no" aria-label="Pass">✖</button><button class="cv-yes" aria-label="Love this CV">♥</button></div>
      <p class="cv-help">Swipe right to love a CV, left to pass (or use ← →)</p>
    </div></div>`);
    ui().appendChild(el);
    const stack = el.querySelector('.cv-stack') as HTMLElement;
    const names: Record<string, [string, string]> = { moka: [ctx.mokaName, ctx.mokaVars], biscuit: [ctx.dogName, ctx.dogVars] };
    const show = () => {
      if (i >= CANDIDATES.length) { removeEventListener('keydown', onKey); el.remove(); return resolve(loved); }
      el.querySelector('.cv-count')!.textContent = `(${i + 1} / ${CANDIDATES.length})`;
      stack.innerHTML = (CANDIDATES[i + 1] ? cvCard(CANDIDATES[i + 1], post).replace('cv-card', 'cv-card under') : '') + cvCard(CANDIDATES[i], post);
      const r = CANDIDATES[i].react, [nm, vars] = names[r.who] ?? [PROFILES[r.who as MouseWho]?.defaultName ?? r.who, ctx.varsOf(r.who as MouseWho)];
      el.querySelector('.cv-react')!.innerHTML = `<div class="cv-pet">${charSvg(r.who as CharId, r.who === 'biscuit' ? 'wag' : 'idle', vars ? `style="${vars}"` : '', PORTRAIT[r.who as CharId])}</div><p><b>${nm}:</b> ${r.text}</p>`;
      const card = stack.querySelector('.cv-card:not(.under)') as HTMLElement;
      drag(card);
    };
    const decide = (love: boolean) => {
      if (busy) return; busy = true;
      const card = stack.querySelector('.cv-card:not(.under)') as HTMLElement;
      if (love) { loved.add(CANDIDATES[i].id); music.sfx('twinkle'); } else music.sfx('sweep');
      card.classList.add(love ? 'go-love' : 'go-nope');
      setTimeout(() => { busy = false; i++; show(); }, 380);
    };
    const drag = (card: HTMLElement) => {
      let x0 = 0, dx = 0, on = false;
      card.addEventListener('pointerdown', e => { on = true; x0 = e.clientX; card.setPointerCapture(e.pointerId); card.style.transition = 'none'; });
      card.addEventListener('pointermove', e => {
        if (!on) return; dx = e.clientX - x0;
        card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
        card.style.setProperty('--love', String(Math.max(0, Math.min(1, dx / 110))));
        card.style.setProperty('--nope', String(Math.max(0, Math.min(1, -dx / 110))));
      });
      const up = () => {
        if (!on) return; on = false; card.style.transition = '';
        if (Math.abs(dx) > 100) { card.style.transform = ''; decide(dx > 0); }
        else { card.style.transform = ''; card.style.setProperty('--love', '0'); card.style.setProperty('--nope', '0'); }
        dx = 0;
      };
      card.addEventListener('pointerup', up); card.addEventListener('pointercancel', up);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') decide(true); else if (e.key === 'ArrowLeft') decide(false); };
    addEventListener('keydown', onKey);
    el.querySelector('.cv-yes')!.addEventListener('click', () => decide(true));
    el.querySelector('.cv-no')!.addEventListener('click', () => decide(false));
    show();
  });
}

/* ---------- 3. On en garde 3 pour un entretien ---------- */
export function pickShortlist(loved: Set<CandId>, post: JobPost): Promise<CandId[]> {
  return new Promise(resolve => {
    let pick = CANDIDATES.filter(c => loved.has(c.id)).slice(0, 3).map(c => c.id);
    const el = h(`<div class="card-wrap"><div class="panel sl-panel" role="dialog" aria-label="Shortlist">
      <h2>Who do we invite?</h2><p>Choose <b>3</b> people to call for an interview this afternoon.</p>
      <div class="sl-grid">${CANDIDATES.map(c => `<button class="sl-card" data-id="${c.id}">${loved.has(c.id) ? '<span class="sl-love">♥</span>' : ''}
        <div class="sl-photo">${candidatePortrait(c)}</div><b>${c.name}</b><small>${c.title.split(' · ')[0]}</small><small class="sl-m">${matchCount(c, post)}/3 match</small></button>`).join('')}</div>
      <div class="row"><button class="btn gold" id="invite">Invite these 3 ♡</button></div></div></div>`);
    ui().appendChild(el);
    const draw = () => {
      el.querySelectorAll<HTMLButtonElement>('.sl-card').forEach(b => b.classList.toggle('on', pick.includes(b.dataset.id as CandId)));
      const btn = el.querySelector('#invite') as HTMLButtonElement; btn.disabled = pick.length !== 3;
      btn.textContent = pick.length === 3 ? 'Invite these 3 ♡' : `Choose ${3 - pick.length} more`;
    };
    el.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest('button'); if (!b) return;
      if (b.dataset.id) { const id = b.dataset.id as CandId; pick = pick.includes(id) ? pick.filter(x => x !== id) : pick.length < 3 ? [...pick, id] : pick; draw(); }
      else if (b.id === 'invite' && pick.length === 3) { el.remove(); resolve(CANDIDATES.filter(c => pick.includes(c.id)).map(c => c.id)); }
    });
    draw();
  });
}

/* ---------- Tout le monde autour de la table, une douceur chacun ---------- */
const TABLE = 0;
const T0 = SPOTS[TABLE], TOP = T0.cy + 18;
/** Places autour de la table 1 : 0 = chaise de gauche, 1 = chaise de droite, 2 = chaise du fond. */
const LEFT = 0, RIGHT = 1, BACK = 2;
const DOG_SPOT = { x: T0.cx - 250, y: T0.cy + 60 }, MOKA_BOWL = { x: T0.cx - 150, y: T0.cy + 120 };
const laptopArt = (x: number, y: number) => `<g transform="translate(${x} ${y})"><path d="M-22 0 L-18 -26 L18 -26 L22 0Z" fill="#dfe3e8" stroke="${P.ink}" stroke-width="1.6"/><path d="M-16 -3 L-13 -23 L13 -23 L16 -3Z" fill="#cfe9f6"/><rect x="-10" y="-19" width="14" height="3" rx="1.5" fill="#fffaf2"/><rect x="-10" y="-13" width="18" height="2.4" rx="1.2" fill="#fffaf2" opacity=".8"/><path d="M-26 0 L26 0 L28 3 L-28 3Z" fill="#b8bec8" stroke="${P.ink}" stroke-width="1.4"/></g>`;
const fishCookie = (x: number, y: number) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="5" rx="14" ry="4" fill="#fffaf2" stroke="${P.ink}" stroke-width="1.2"/><path d="M-9 0 Q-2 -7 7 -2 L12 -6 L12 4 L7 1 Q-2 6 -9 0Z" fill="#e8a24a" stroke="${P.ink}" stroke-width="1.1"/><circle cx="-5" cy="-1" r="1" fill="${P.ink}"/></g>`;
const bowlArt = (x: number, y: number, col: string, treat: string) => `<ellipse cx="${x}" cy="${y}" rx="30" ry="9" fill="${col}" stroke="${P.ink}" stroke-width="2"/><ellipse cx="${x}" cy="${y - 4}" rx="22" ry="5.5" fill="#f3e1b5"/>${treat}`;
const boneTreat = (x: number, y: number) => `<path d="M${x - 12} ${y - 6} L${x + 12} ${y - 6}" stroke="#c9915e" stroke-width="5" stroke-linecap="round"/>${[[-14, -9], [-14, -3], [14, -9], [14, -3]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="3.4" fill="#c9915e"/>`).join('')}`;
const waterTreat = (x: number, y: number) => `<ellipse cx="${x}" cy="${y - 4}" rx="22" ry="5.5" fill="#cfe9f6"/><path d="M${x - 10} ${y - 5} q5 -2 10 0" stroke="#fff" stroke-width="2" fill="none"/>`;
/** Les souris sur la table, qui mangent avec leurs petites mains. */
function miceOnTable(room: Room, ctx: HireCtx) {
  return CREW.map((w, i) => {
    const dx = [-64, -40, 36, 62][i], dy = i % 2 ? 14 : 0;
    return addDepth(room, T0.cy + 10.5 + i / 100, `<g transform="translate(${T0.cx + dx} ${TOP + dy}) scale(.72)"><svg x="-40" y="-101" width="80" height="104" viewBox="0 0 200 260" data-state="${i % 2 ? 'sip' : 'nibble'}" style="${ctx.varsOf(w)}" overflow="visible">${DRAW[w]()}</svg></g>`);
  });
}
/** Biscuit vient manger à côté de la table. */
async function dogEats(room: Room, ctx: HireCtx, x: number, y: number, treat: string) {
  const stage = room.stageRef;
  const bowl = addDepth(room, y + 14, bowlArt(x + 6, y + 18, '#e86a5f', treat));
  const dog: Actor = stage.add(`<svg x="-70" y="-171" width="140" height="182" viewBox="0 0 200 260" data-state="walk" style="${ctx.dogVars}" overflow="visible">${biscuit()}</svg>`, 1335, 380, { flipable: true, base: 0.8 });
  room.setDog('none');
  await stage.walk(dog, [{ x: 1300, y: 520 }, { x: x + 60, y: 520 }, { x: x + 46, y }], 230);
  dog.flip = -1; (dog.inner.firstElementChild as SVGElement).setAttribute('data-state', 'eatdown');
  return () => { bowl.remove(); stage.remove(dog); room.setDog('patrol'); };
}
/** Le matin (et le soir) : le héros et Moka assis à la table avec l'ordinateur, Biscuit qui mange, les souris sur la table. */
export async function gather(room: Room, ctx: HireCtx) {
  const mice = miceOnTable(room, ctx);
  const table = addDepth(room, T0.cy + 10.3, `${laptopArt(T0.cx - 4, TOP + 8)}${fishCookie(T0.cx - 84, TOP + 20)}${[-48, 50].map(dx => `<g transform="translate(${T0.cx + dx} ${TOP + 22}) scale(.26)">${teaItemArt('lemonCake', 0, 0)}</g>`).join('')}${sparkle(T0.cx + 30, TOP - 34, 6)}`);
  const [, , undog] = await Promise.all([
    room.heroSit(TABLE, BACK),
    room.mokaSit(TABLE, LEFT, 'munch'),
    dogEats(room, ctx, DOG_SPOT.x, DOG_SPOT.y, boneTreat(DOG_SPOT.x + 6, DOG_SPOT.y + 18))
  ]);
  return async () => {
    mice.forEach(g => g.remove()); table.remove(); undog();
    await Promise.all([room.mokaHome(), room.heroHome()]);
  };
}

/* ---------- Entretien au café : le héros apporte le café et les biscuits ---------- */
const trayArt = `<g transform="translate(150 158)"><ellipse cx="0" cy="0" rx="30" ry="7" fill="#c99a6e" stroke="${P.ink}" stroke-width="2"/><path d="M-20 -14 L-6 -14 L-7 -2 L-19 -2Z" fill="#fffaf2" stroke="${P.ink}" stroke-width="1.6"/><ellipse cx="-13" cy="-14" rx="7" ry="2" fill="#c99a6e"/>${[4, 13, 21].map(x => `<ellipse cx="${x}" cy="-4" rx="6" ry="3" fill="#e8b46a" stroke="${P.ink}" stroke-width="1"/>`).join('')}</g>`;
export async function interview(room: Room, c: Candidate, ctx: HireCtx, n: number): Promise<Interview> {
  const { H, C } = lines(ctx);
  const m = member(c);
  await room.guestIn(m, TABLE, 0);
  await talk([C(c, n === 0 ? `Hello! I'm ${c.name}. I'm here for the interview… I'm a little early.` : `Good afternoon! I'm ${c.name}, nice to meet you.`), H(`Welcome, ${c.name}! Please sit down, I'll bring you something ♡`)]);
  // le héros va prendre le plateau au comptoir, l'apporte, puis s'assoit en face
  room.heroUp();
  const f = Room.COUNTER_FRONT;
  await room.heroWalk(f.x, f.y, [{ x: room.seatAt(TABLE, RIGHT).x, y: 520 }]);
  await sleep(400); music.sfx('pour');
  await room.heroSit(TABLE, RIGHT, trayArt);
  const snack = addDepth(room, T0.cy + 10.2, `<g transform="translate(${T0.cx + 30} ${TOP + 10}) scale(.32)">${teaItemArt('cookies', 0, 0)}</g>
    <g transform="translate(${T0.cx - 30} ${TOP + 8})"><ellipse cx="0" cy="6" rx="12" ry="3.4" fill="#fffaf2" stroke="${P.ink}" stroke-width="1.4"/><path d="M-7 -6 L7 -6 L6 5 L-6 5Z" fill="#fffaf2" stroke="${P.ink}" stroke-width="1.4"/><ellipse cx="0" cy="-6" rx="7" ry="2" fill="#c99a6e"/>
    <g style="animation:steam 2s infinite"><path d="M-2 -10 q-4 -6 0 -12" fill="none" stroke="#fffaf2" stroke-width="2" stroke-linecap="round"/></g></g>`);
  await talk([H('Here you go: a warm latte, and some butter cookies.')]);
  room.guestState(TABLE, 0, 'sitcoffee');
  await talk([C(c, c.coffee, 'coffee')]);
  room.guestState(TABLE, 0, 'sit');
  const asked: QId[] = [];
  let options = FIRST_QUESTIONS;
  for (let round = 0; round < 3; round++) {
    const k = await say(H(round === 0 ? '(What should I ask first?)' : round === 1 ? '(Interesting… what do I ask next?)' : '(One last question…)'), options.map(q => QUESTIONS[q]));
    const q = options[k], a = c.answers[q];
    asked.push(q);
    await talk([H(QUESTIONS[q])]);
    room.guestState(TABLE, 0, a.score >= 2 ? 'sitcoffee' : 'sit');
    const p = room.seatAt(TABLE, 0);
    room.fx(p.x, p.y - 170, a.score >= 2 ? '♥ ♥' : a.score === 1 ? '♥' : a.score === 0 ? '…' : '😬', a.score >= 1 ? '#e8586a' : '#8a6a5a');
    await talk([C(c, a.text, a.score >= 1 ? 'coffee' : 'idle')]);
    if (q === 'animals' && c.id === 'marco') room.fx(p.x, p.y - 210, 'ACHOO!', '#8a6a5a');
    options = nextQuestions(asked, q, a);
  }
  await talk([H(`Thank you so much, ${c.name}. We'll call you very soon!`), C(c, 'Thank you for the coffee! And the cookies. Bye bye ♡', 'coffee')]);
  snack.remove();
  await room.guestOut(m, TABLE, 0);
  return interviewOf(c.id, asked);
}

/* ---------- Le tableau des entretiens : CV, questions et réponses, puis on choisit ---------- */
const scoreHearts = (s: number) => Math.max(1, Math.min(5, Math.round((s + 2) / 8 * 5)));
export function interviewBoard(views: Interview[], post: JobPost): Promise<CandId> {
  return new Promise(resolve => {
    const el = h(`<div class="card-wrap"><div class="board" role="dialog" aria-label="Interview board">
      <h2>Interview board</h2><p class="board-sub">Everything from today, pinned in one place. Who do we call? ♡</p>
      <div class="board-grid">${views.map((v, i) => {
        const c = candById(v.id), [cat, dog, crew] = VOTES[v.id], m = matchCount(c, post);
        return `<div class="note" style="--tilt:${[-1.5, 1, -0.6][i % 3]}deg"><span class="pin"></span>
          <div class="note-head"><div class="pick-photo">${candidatePortrait(c, 'coffee')}</div><div><h3>${c.name}, ${c.age}</h3><p class="cv-title">${c.title}</p>
            <div class="pick-hearts">${[0, 1, 2, 3, 4].map(k => `<span class="${k < scoreHearts(v.score) ? 'on' : ''}">♥</span>`).join('')}</div></div></div>
          <p class="note-cv"><b>CV:</b> ${c.experience.join(' · ')}<br><b>Matches the post:</b> ${m}/3 · ${c.traits.map(t => QUALITY_NAME[t]).join(', ')}</p>
          <ol class="qa">${v.asked.map(q => { const a = c.answers[q]; return `<li><b>${QSHORT[q]}</b><span class="${a.score >= 2 ? 'good' : a.score < 0 ? 'bad' : ''}">“${a.text}”</span></li>`; }).join('')}</ol>
          <p class="pick-votes">🐱 ${cat ? '♥' : '✖'} · 🐶 ${dog ? '♥' : '✖'} · 🐭 ${crew ? '♥' : '✖'}</p>
          <button class="btn gold" data-id="${v.id}">Call ${c.name} 📞</button></div>`;
      }).join('')}</div></div></div>`);
    ui().appendChild(el);
    el.addEventListener('click', e => { const b = (e.target as HTMLElement).closest('button'); if (b?.dataset.id) { music.sfx('twinkle'); el.remove(); resolve(b.dataset.id as CandId); } });
  });
}

/* ---------- 6. Le coup de fil ---------- */
export async function phoneCall(c: Candidate, post: JobPost, ctx: HireCtx): Promise<Pay> {
  const { H, C } = lines(ctx);
  const el = h(`<div class="phone-wrap"><div class="phone"><div class="ph-notch"></div><div class="ph-photo">${candidatePortrait(c, 'coffee')}</div><h3>${c.name}</h3><p class="ph-status">Calling…</p>
    <div class="ph-btns"><span class="ph-mute">🔇</span><span class="ph-end">📞</span><span class="ph-spk">🔊</span></div></div></div>`);
  ui().appendChild(el);
  for (let k = 0; k < 2; k++) { music.sfx('bell'); await sleep(900); }
  const status = el.querySelector('.ph-status')!; status.textContent = '00:01';
  let sec = 1; const timer = setInterval(() => { sec++; status.textContent = `00:${String(sec).padStart(2, '0')}`; }, 1000);
  el.classList.add('live');
  let pay = post.pay;
  await talk([C(c, c.call[0]), H(`Hi ${c.name}, it's ${ctx.name} from Café Komorebi! We loved meeting you today…`), H('We would love you to join our team ♡'), C(c, c.call[1], 'coffee')]);
  if (needsRaise(c, post.pay)) {
    await talk([C(c, `Just one thing… the post said ${PAY[post.pay].perHour} coins an hour. Could it be ${PAY[c.wants].perHour}? I have a lot of experience.`)]);
    const k = await say(H('(What do I answer?)'), [`Of course, ${PAY[c.wants].perHour} coins it is!`, `Sorry, ${PAY[post.pay].perHour} is what we can do for now.`]);
    if (k === 0) { pay = c.wants; await talk([C(c, 'Thank you! That means a lot.', 'coffee')]); }
    else await talk([C(c, 'I understand. It\'s a small café… I still want to come. Maybe later, then!')]);
  }
  await talk([H(`Can you start tomorrow morning at 7:00? ${HOURS[post.hours].split(' · ')[0]}.`), C(c, c.call[2], 'coffee'), H('See you tomorrow! Good night ♡')]);
  clearInterval(timer);
  el.classList.add('bye'); status.textContent = 'Call ended ♡';
  await sleep(900); el.remove();
  return pay;
}

/* ---------- Le premier jour : visite du café, choix du poste ---------- */
/** Où se tient la nouvelle recrue pendant le service, selon son poste. */
export const ROLE_SPOT: Record<Role, { x: number; y: number; label: string }> = {
  coffee: { x: 470, y: 590, label: 'Café station' }, juice: { x: 640, y: 590, label: 'Juice bar' },
  pastry: { x: 210, y: 620, label: 'Bakery' }, tea: { x: 1060, y: 520, label: 'Tea room' }
};
const ROLE_NAME: Record<Role, string> = { coffee: 'the café station ☕', juice: 'the juice bar 🍊', pastry: 'the bakery 🥐', tea: 'the tea room 🍵' };
const TOUR: { role: Role; at: { x: number; y: number }; hero: string; reply: (c: Candidate) => string }[] = [
  { role: 'coffee', at: { x: 300, y: 250 }, hero: 'Here is the café station: grinder, espresso machine, milk. Lattes, cappuccinos, mochas…', reply: c => c.traits.includes('coffee') ? 'Oh, a beautiful machine. I already love her.' : 'So many buttons! I will learn them all.' },
  { role: 'juice', at: { x: 600, y: 250 }, hero: 'The juice bar: fresh fruit, the cold press, ice, mint and honey.', reply: () => 'It smells like summer over here!' },
  { role: 'pastry', at: { x: 100, y: 380 }, hero: "Behind this door, the bakery. Grandma's recipe tin lives there.", reply: c => c.traits.includes('baking') ? 'A real oven… may I bake tomorrow? Please?' : 'Croissants from scratch? Wow.' },
  { role: 'tea', at: { x: 160, y: 300 }, hero: 'And next to it, the little tea room: teas from Leila in Tunis, cakes and cookies.', reply: () => 'A tea room too? This café is a treasure box.' }
];
/** Derrière le comptoir : à gauche du héros pour le café, à droite sinon. */
export const HELPER_X: Record<Role, number> = { coffee: 236, juice: 548, pastry: 548, tea: 548 };
export const preferredRole = (c: Candidate): Role => c.traits.includes('baking') ? 'pastry' : c.traits.includes('coffee') ? 'coffee' : c.traits.includes('kind') ? 'tea' : 'juice';
export async function firstDay(room: Room, c: Candidate, ctx: HireCtx): Promise<Role> {
  const { H, C, M, NARR } = lines(ctx);
  const m = member(c);
  await talk([NARR('The next morning, 6:58. No customers yet. Someone knocks on the glass…')]);
  music.sfx('bell');
  const a = await room.guestStand(m, 900, 540);
  a.flip = -1;
  await talk([
    C(c, `Good morning! I'm here! I didn't sleep at all, I was too excited.`, 'coffee'),
    H(`Welcome to Café Komorebi, ${c.name}! Here is your apron… and your name tag ♡`)
  ]);
  // la recrue enfile son tablier
  (a.inner.firstElementChild as SVGElement).innerHTML = member(c, true).svg;
  music.sfx('twinkle'); room.fx(a.x, a.y - 210, '✨ ♡ ✨', '#c47a2c');
  await talk([
    C(c, `"${c.name.toUpperCase()}"… it's real! How do I look?`, 'coffee'),
    H(`Come, I'll show you around before the first customers arrive.`)
  ]);
  for (const t of TOUR) {
    room.fx(t.at.x, t.at.y, '✨', '#c47a2c');
    await talk([H(t.hero), C(c, t.reply(c), 'coffee')]);
  }
  await talk([H(`This is ${ctx.mokaName}, our café cat. She shows customers to their table. And ${ctx.dogName} visits every day.`)]);
  // une souris passe la tête… Moka monte la garde
  await room.mouseDash('door');
  await talk([C(c, 'Wait… was that a MOUSE? Near that tiny painted door?!')]);
  const g = room.doorGuard;
  const walk = room.walkMoka(g.x, g.y, [{ x: g.x - 60, y: g.y + 50 }]);
  await talk([H('A mouse? Ha ha… no, no. That was… a very small… dust bunny! And the little door is… for the electricity.')]);
  await walk; room.setMoka('snub');
  await talk([M('Hmph. Smooth. Very smooth.', 'snub'), C(c, 'A dust bunny with a tiny scarf. Okay! This café is so cute already.', 'coffee')]);
  room.releaseMoka();
  // le poste : la recrue dit ce qu'elle aimerait, on décide ensemble
  const pref = preferredRole(c);
  await talk([H('So… where would you like to work today?'), C(c, `If it's okay, I would love to start at ${ROLE_NAME[pref]}!`, 'coffee')]);
  const roles: Role[] = [pref, ...(['coffee', 'juice', 'pastry', 'tea'] as Role[]).filter(r => r !== pref)];
  const k = await say(H('(Where should they start?)'), roles.map((r, i) => `${ROLE_NAME[r]}${i === 0 ? ' (their wish)' : ''}`));
  const role = roles[k];
  await talk([
    k === 0 ? H(`${ROLE_NAME[role][0].toUpperCase() + ROLE_NAME[role].slice(1)} it is! It's all yours.`) : H(`Let's try ${ROLE_NAME[role]} today. You'll see, it's fun!`),
    C(c, k === 0 ? 'Yay! I won\'t let you down!' : 'Okay! A new challenge. I like it!', 'coffee'),
    H(`Every ${role === 'coffee' ? 'coffee' : role === 'juice' ? 'juice' : role === 'pastry' ? 'pastry' : 'tea'} order will be yours. I'll take care of the rest. Let's open the café together ♡`)
  ]);
  // derrière le comptoir, à côté du héros
  const e = Room.COUNTER_END;
  await room.stageRef.walk(a, [{ x: a.x, y: 520 }, e], 175);
  room.stageRef.remove(a);
  room.setHelper(member(c, true).svg, HELPER_X[role]);
  return role;
}

/* ---------- Le soir du premier jour : réunion avec Grand-mère, thé et biscuits ---------- */
export async function teamMeeting(room: Room, c: Candidate, helped: number, ctx: HireCtx) {
  const { H, M, B, R, NARR } = lines(ctx);
  const G = (text: string, state = 'tea'): Line => ({ who: 'grandma', name: ctx.grandmaName, state, text, right: true, vars: ctx.grandmaVars });
  room.el.querySelector('rect.mn.tint')?.setAttribute('opacity', '.45');
  const mice = miceOnTable(room, ctx);
  const table = addDepth(room, T0.cy + 10.3, `<g transform="translate(${T0.cx} ${TOP + 6}) scale(.42)">${teaItemArt('chamomile', -50, 0)}${teaItemArt('blackTea', 50, 0)}${teaItemArt('cookies', 0, 26)}</g>${sparkle(T0.cx - 70, TOP - 20, 7)}`);
  room.seatPerson(TABLE, RIGHT, DRAW.grandma(), 'tea', ctx.grandmaVars, '#7a5a6a');
  const mbowl = addDepth(room, MOKA_BOWL.y + 2, bowlArt(MOKA_BOWL.x, MOKA_BOWL.y, '#7fa8d8', waterTreat(MOKA_BOWL.x, MOKA_BOWL.y)));
  const [, , undog] = await Promise.all([
    room.heroSit(TABLE, BACK),
    room.walkMoka(MOKA_BOWL.x + 34, MOKA_BOWL.y - 10, [{ x: 1334, y: 520 }, { x: MOKA_BOWL.x + 34, y: 520 }]).then(() => { room.setMoka('munch'); room.moka.flip = -1; }),
    dogEats(room, ctx, DOG_SPOT.x, DOG_SPOT.y, boneTreat(DOG_SPOT.x + 6, DOG_SPOT.y + 18))
  ]);
  music.sfx('twinkle');
  await talk([
    NARR(`That evening, after ${c.name} goes home, everyone gathers around table 1: tea, biscuits, water bowls… and tiny hands full of crumbs.`),
    G(`So, dear… how was ${c.name}'s first day?`),
    H(`${helped ? `${c.name} served ${helped} order${helped > 1 ? 's' : ''} all alone!` : `${c.name} learned so much today.`} And everyone smiled the whole day.`, 'city'),
    G('I watched from the window. Kind hands, a warm heart. Just like the sign said.'),
    M(c.pets.moka, 'munch'),
    B(c.pets.biscuit, 'eatdown'),
    R('captain', c.pets.crew, 'nibble'),
    H('Wait… Grandma, you can SEE them?!', 'city'),
    G('My ears are old, dear, but my eyes are fine. Who do you think has left them a little cheese for forty years?'),
    G('And yes… I pretended not to know who "C.C." was. You looked so happy finding out ♡'),
    R('nibbles', `Can ${c.name} have tea with us one day? …When they are ready to know?`, 'cheer'),
    G('One day, little one. Every good secret waits for the right person.'),
    NARR(`And so Café Komorebi grew a little bigger: one more apron, one more name tag, and one more friend.`)
  ]);
  mice.forEach(g => g.remove()); table.remove(); mbowl.remove(); undog();
  room.clearSeat(TABLE, RIGHT);
  await Promise.all([room.heroHome(), room.mokaHome()]);
}

/* ---------- Fin du niveau ---------- */
export function welcomeCard(c: Candidate, pay: Pay, post: JobPost, name: string, role: Role, served: number, helped: number): Promise<void> {
  return new Promise(resolve => {
    const el = h(`<div class="card-wrap"><div class="panel welcome-panel">
      <h2>Level 6 complete!</h2><p>Well done, ${esc(name)}. Café Komorebi has a new team member:</p>
      <div class="wl-card"><div class="wl-photo">${candidatePortrait(c, 'coffee')}</div>
        <div><h3>${c.name} ♡</h3><p class="cv-title">${c.title}</p>
        <p>📍 ${ROLE_SPOT[role].label}<br>⏰ ${HOURS[post.hours]}<br>💰 ${PAY[pay].perHour} coins / hour</p>
        <div class="cv-traits">${c.traits.map(t => `<span class="hit">${QUALITY_NAME[t]}</span>`).join('')}</div></div></div>
      <div class="stats"><div><b>${served}</b>happy customers</div><div><b>${helped}</b>served by ${c.name}</div></div>
      <p class="rp-next">Next: Level 7 · A busy week with ${c.name} (coming soon)</p>
      <div class="row"><button class="btn gold">Back to the title</button></div></div></div>`);
    ui().appendChild(el);
    el.querySelector('button')!.addEventListener('click', () => { el.remove(); resolve(); });
  });
}
