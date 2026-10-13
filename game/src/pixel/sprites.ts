// Personnages en pixel art, dessinés pixel par pixel puis entourés automatiquement d'un contour sombre.
const INK = '#2b1f2a';
const cache = new Map<string, HTMLCanvasElement>();
type X = CanvasRenderingContext2D;

function make(w: number, h: number): [HTMLCanvasElement, X] {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return [c, c.getContext('2d')!];
}
/** Remplit des rectangles : P(x, couleur, x, y, l, h, x, y, l, h…) */
function P(x: X, col: string, ...r: number[]) { x.fillStyle = col; for (let i = 0; i < r.length; i += 4) x.fillRect(r[i], r[i + 1], r[i + 2], r[i + 3]); }
/** Contour d'un pixel autour de toutes les zones opaques. */
function outline(c: HTMLCanvasElement, ink = INK) {
  const x = c.getContext('2d')!, d = x.getImageData(0, 0, c.width, c.height), a = d.data, w = c.width, h = c.height;
  const op = (i: number, j: number) => i >= 0 && j >= 0 && i < w && j < h && a[(j * w + i) * 4 + 3] > 100;
  const [r, g, b] = [parseInt(ink.slice(1, 3), 16), parseInt(ink.slice(3, 5), 16), parseInt(ink.slice(5, 7), 16)];
  const out: number[] = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (!op(i, j) && (op(i - 1, j) || op(i + 1, j) || op(i, j - 1) || op(i, j + 1))) out.push(i, j);
  for (let k = 0; k < out.length; k += 2) { const p = (out[k + 1] * w + out[k]) * 4; a[p] = r; a[p + 1] = g; a[p + 2] = b; a[p + 3] = 255; }
  x.putImageData(d, 0, 0);
  return c;
}
/** Sprite mis en cache, dessiné avec une marge d'un pixel pour le contour. */
function sprite(key: string, w: number, h: number, draw: (x: X) => void, ink = INK) {
  let c = cache.get(key);
  if (!c) { const [cv, x] = make(w + 2, h + 2); x.translate(1, 1); draw(x); c = outline(cv, ink); cache.set(key, c); }
  return c;
}
export function flipped(c: HTMLCanvasElement) {
  const key = 'flip:' + (c as any).__k; const k = (c as any).__fk ?? ((c as any).__fk = Math.random().toString(36));
  let f = cache.get(key + k); if (f) return f;
  const [cv, x] = make(c.width, c.height); x.scale(-1, 1); x.drawImage(c, -c.width, 0); cache.set(key + k, cv); return cv;
}

/* ---------- clients (buste visible au-dessus du comptoir) ---------- */
export interface Look { skin: string; hair: string; style: number; top: string; topD: string }
export const LOOKS: Look[] = [
  { skin: '#f6d2b8', hair: '#3e3446', style: 1, top: '#dcbc94', topD: '#c3a27a' },
  { skin: '#e8bf98', hair: '#2b2433', style: 0, top: '#7682a2', topD: '#626d8c' },
  { skin: '#fbe0cc', hair: '#c97a44', style: 2, top: '#ee9c8c', topD: '#d6826f' },
  { skin: '#b98866', hair: '#2b2433', style: 4, top: '#a7c0dd', topD: '#8ea8c8' },
  { skin: '#f3d2b8', hair: '#c9a27e', style: 3, top: '#9c8ac0', topD: '#8473ad' },
  { skin: '#c99a78', hair: '#5b4450', style: 0, top: '#8fb39a', topD: '#77a083' },
  { skin: '#fde3d0', hair: '#8a5242', style: 1, top: '#f2c46a', topD: '#d9aa52' },
  { skin: '#e8bf98', hair: '#e6e0e8', style: 3, top: '#c7a6e6', topD: '#b08fd0' }
];
function hair(x: X, col: string, style: number, ox = 0, oy = 0) {
  const p = (...r: number[]) => P(x, col, ...r.map((v, i) => v + (i % 4 === 0 ? ox : i % 4 === 1 ? oy : 0)));
  if (style === 0) { p(5, 3, 12, 5, 4, 6, 2, 5, 16, 6, 2, 5, 6, 8, 4, 1, 12, 8, 3, 1); }
  if (style === 1) { p(5, 2, 12, 6, 3, 6, 3, 11, 16, 6, 3, 11, 6, 8, 10, 1); }
  if (style === 2) { p(5, 3, 12, 5, 4, 6, 2, 4, 16, 6, 2, 4, 6, 8, 5, 1, 18, 5, 3, 3, 19, 8, 2, 6); }
  if (style === 3) { p(8, 0, 6, 3, 5, 3, 12, 5, 4, 6, 2, 5, 16, 6, 2, 5, 6, 8, 3, 1, 13, 8, 3, 1); }
  if (style === 4) { p(4, 3, 14, 5, 3, 6, 2, 7, 17, 6, 2, 7, 5, 2, 3, 1, 9, 2, 3, 1, 14, 2, 3, 1, 6, 8, 2, 1, 10, 8, 2, 1, 14, 8, 2, 1); }
}
function face(x: X, mood: string, ox = 0, oy = 0) {
  const q = (col: string, ...r: number[]) => P(x, col, ...r.map((v, i) => v + (i % 4 === 0 ? ox : i % 4 === 1 ? oy : 0)));
  if (mood === 'happy') { q(INK, 7, 13, 1, 1, 8, 12, 1, 1, 9, 13, 1, 1, 12, 13, 1, 1, 13, 12, 1, 1, 14, 13, 1, 1); q('#a0525a', 9, 16, 4, 1, 10, 17, 2, 1); }
  else if (mood === 'blink') { q(INK, 7, 13, 3, 1, 12, 13, 3, 1); q('#a0525a', 10, 16, 2, 1); }
  else if (mood === 'wait') { q(INK, 8, 12, 2, 2, 12, 12, 2, 2, 7, 10, 3, 1, 12, 10, 3, 1); q('#fff', 9, 12, 1, 1, 13, 12, 1, 1); q('#a0525a', 10, 16, 2, 1); }
  else { q(INK, 8, 12, 2, 2, 12, 12, 2, 2); q('#fff', 9, 12, 1, 1, 13, 12, 1, 1); q('#a0525a', 10, 16, 2, 1); }
  q('#f2a0a8', 6, 15, 2, 1, 14, 15, 2, 1);
}
/** Buste d'un client : 22×30. */
export function custBust(look: Look, mood = 'idle') {
  return sprite(`cust:${JSON.stringify(look)}:${mood}`, 22, 30, x => {
    P(x, look.top, 3, 22, 16, 8); P(x, look.topD, 14, 22, 5, 8); x.clearRect(3, 22, 1, 1); x.clearRect(18, 22, 1, 1);
    P(x, '#f6efe2', 9, 22, 4, 2);
    P(x, look.skin, 9, 19, 4, 3, 5, 6, 12, 13, 4, 11, 1, 3, 17, 11, 1, 3);
    x.clearRect(5, 6, 1, 1); x.clearRect(16, 6, 1, 1); x.clearRect(5, 18, 1, 1); x.clearRect(16, 18, 1, 1);
    hair(x, look.hair, look.style);
    face(x, mood);
  });
}

/* ---------- héros (buste pour portraits, corps entier pour la nuit) ---------- */
export interface HeroLook { g: 'm' | 'f'; outfit: 'city' | 'uniform'; apron?: string; cap?: string; shirt?: string; pants?: string }
const HERO = {
  f: { hair: '#8a5242', top: '#a8705a', topD: '#946150', jeans: '#a3bcdc', skin: '#fde3d0' },
  m: { hair: '#3f3548', top: '#aea2cc', topD: '#9a8ebb', jeans: '#7686b2', skin: '#fde3d0' }
};
export function heroBust(h: HeroLook, mood = 'idle') {
  const k = HERO[h.g];
  return sprite(`hero:${JSON.stringify(h)}:${mood}`, 22, 30, x => {
    const uni = h.outfit === 'uniform';
    P(x, uni ? (h.shirt ?? '#f6e7cf') : k.top, 3, 22, 16, 8);
    if (!uni) P(x, k.topD, 14, 22, 5, 8);
    x.clearRect(3, 22, 1, 1); x.clearRect(18, 22, 1, 1);
    if (uni) { const ap = h.apron ?? '#74513f'; P(x, ap, 6, 24, 10, 6, 7, 22, 1, 2, 14, 22, 1, 2); P(x, '#e3c06e', 12, 25, 3, 1); }
    P(x, k.skin, 9, 19, 4, 3, 5, 6, 12, 13, 4, 11, 1, 3, 17, 11, 1, 3);
    x.clearRect(5, 6, 1, 1); x.clearRect(16, 6, 1, 1); x.clearRect(5, 18, 1, 1); x.clearRect(16, 18, 1, 1);
    if (h.g === 'f') { P(x, k.hair, 5, 3, 12, 5, 3, 6, 3, 13, 16, 6, 3, 13, 6, 8, 10, 1); if (uni) P(x, k.hair, 18, 7, 3, 9); }
    else { P(x, k.hair, 5, 3, 12, 5, 4, 6, 2, 4, 16, 6, 2, 4, 6, 8, 3, 2, 10, 8, 2, 2, 13, 8, 3, 1); if (!uni) P(x, k.hair, 11, 1, 3, 2); }
    face(x, mood);
    if (h.g === 'm') { P(x, INK, 7, 11, 4, 1, 7, 14, 4, 1, 7, 11, 1, 4, 10, 11, 1, 4, 11, 11, 4, 1, 11, 14, 4, 1, 14, 11, 1, 4); }
    if (uni) { const cap = h.cap ?? h.apron ?? '#74513f'; P(x, cap, 4, 2, 14, 5); P(x, shade(cap), 4, 7, 15, 1); P(x, '#e3c06e', 10, 3, 2, 2); }
    else if (h.g === 'f') { P(x, '#f4f1ec', 4, 2, 14, 1, 2, 10, 3, 5, 17, 10, 3, 5); }
    else P(x, '#2e2a33', 6, 20, 10, 2, 4, 19, 3, 3, 15, 19, 3, 3);
  });
}
/** Corps entier du héros, 18×36 (frame 0 = debout, 1/2 = pas). */
export function heroBody(g: 'm' | 'f', frame = 0, carry = false) {
  const k = HERO[g];
  return sprite(`herob:${g}:${frame}:${carry}`, 20, 36, x => {
    const a = frame === 1 ? 1 : 0, b = frame === 2 ? 1 : 0;
    P(x, k.jeans, 6, 26 - a, 3, 8 + a, 11, 26 - b, 3, 8 + b);
    P(x, '#fffaf2', 5, 33, 4, 2, 11, 33, 4, 2);
    P(x, k.top, 5, 17, 10, 10, 3, 18, 2, 8, 15, 18, 2, 8); P(x, k.topD, 12, 17, 3, 10);
    P(x, k.skin, 3, 26, 2, 2, 15, 26, 2, 2, 8, 15, 4, 2, 5, 4, 10, 11);
    x.clearRect(5, 4, 1, 1); x.clearRect(14, 4, 1, 1);
    if (g === 'f') { P(x, k.hair, 4, 2, 12, 4, 3, 5, 3, 13, 14, 5, 3, 13, 6, 6, 8, 1); P(x, '#f4f1ec', 4, 1, 12, 1, 2, 8, 2, 4, 16, 8, 2, 4); }
    else { P(x, k.hair, 4, 2, 12, 5, 3, 5, 2, 4, 15, 5, 2, 4, 11, 0, 2, 2); P(x, '#2e2a33', 6, 16, 8, 2); }
    P(x, INK, 7, 9, 2, 2, 11, 9, 2, 2); P(x, '#f2a0a8', 6, 12, 1, 1, 13, 12, 1, 1); P(x, '#a0525a', 9, 13, 2, 1);
    if (g === 'm') P(x, INK, 6, 8, 4, 1, 10, 8, 4, 1);
    if (carry) P(x, '#4a4752', 15, 24, 5, 7, 16, 22, 3, 2);
  });
}

/* ---------- Moka (concierge) ---------- */
const GREY = '#a6abb7', WHITE = '#f7f5f2', GOLD = '#e3c06e';
export function mokaSit(coat = '#5d5a8f', mood: 'idle' | 'sleep' | 'happy' = 'idle') {
  return sprite(`moka:${coat}:${mood}`, 20, 20, x => {
    P(x, GREY, 15, 9, 2, 9, 16, 7, 2, 3); P(x, WHITE, 16, 6, 2, 2);
    P(x, GREY, 4, 10, 11, 9); P(x, coat, 4, 12, 11, 7); P(x, WHITE, 8, 12, 3, 2);
    P(x, GOLD, 7, 15, 1, 1, 11, 15, 1, 1, 7, 17, 1, 1, 11, 17, 1, 1);
    P(x, WHITE, 5, 18, 3, 2, 11, 18, 3, 2);
    P(x, GREY, 3, 3, 14, 9, 3, 1, 3, 2, 14, 1, 3, 2); P(x, '#f2b0b8', 4, 2, 1, 1, 15, 2, 1, 1);
    P(x, WHITE, 7, 8, 6, 4, 9, 4, 2, 4);
    if (mood === 'sleep') P(x, INK, 5, 7, 3, 1, 12, 7, 3, 1);
    else if (mood === 'happy') P(x, INK, 5, 7, 1, 1, 6, 6, 1, 1, 7, 7, 1, 1, 12, 7, 1, 1, 13, 6, 1, 1, 14, 7, 1, 1);
    else { P(x, '#e8c65e', 5, 6, 3, 2, 12, 6, 3, 2); P(x, GREY, 5, 6, 3, 1, 12, 6, 3, 1); P(x, INK, 6, 7, 1, 1, 13, 7, 1, 1); }
    P(x, '#f39aa6', 9, 9, 2, 1);
    P(x, coat, 5, 0, 10, 3); P(x, '#2e2a40', 5, 3, 10, 1); P(x, GOLD, 9, 1, 2, 1);
    if (mood === 'happy') P(x, '#f2a0a8', 4, 9, 2, 1, 14, 9, 2, 1);
  });
}
/** Moka qui marche, vue de profil (tournée vers la droite), 24×16. */
export function mokaWalk(coat = '#5d5a8f', frame = 0) {
  return sprite(`mokaw:${coat}:${frame}`, 24, 16, x => {
    const f = frame % 2;
    P(x, GREY, 2, 2, 2, 7, 3, 7, 3, 2); P(x, WHITE, 1, 1, 3, 2);
    P(x, GREY, 6 + f, 12, 2, 4, 10 - f, 12, 2, 4, 14 + f, 12, 2, 4, 18 - f, 12, 2, 4);
    P(x, GREY, 5, 6, 14, 7); P(x, coat, 10, 6, 8, 7); P(x, GOLD, 13, 8, 1, 1, 16, 8, 1, 1, 13, 10, 1, 1, 16, 10, 1, 1);
    P(x, WHITE, 6 + f, 15, 2, 1, 14 + f, 15, 2, 1);
    P(x, GREY, 15, 1, 8, 7, 16, 0, 2, 1, 20, 0, 2, 1); P(x, WHITE, 19, 5, 4, 3);
    P(x, '#e8c65e', 19, 3, 2, 1); P(x, INK, 20, 3, 1, 1); P(x, '#f39aa6', 22, 5, 1, 1);
    P(x, coat, 16, 0, 6, 2); P(x, '#2e2a40', 15, 2, 8, 1);
  });
}

/* ---------- Grand-mère qui lit ---------- */
export function grandmaRead(card = '#a7c0dd', frame = 0) {
  return sprite(`gma:${card}:${frame}`, 24, 28, x => {
    const skin = '#fbe0cc', hair = '#e6e0e8';
    P(x, '#6f957d', 4, 23, 16, 5);
    P(x, card, 4, 14, 16, 9); P(x, '#f6e7cf', 10, 14, 4, 3);
    P(x, skin, 6, 3, 12, 11, 9, 12, 6, 2);
    x.clearRect(6, 3, 1, 1); x.clearRect(17, 3, 1, 1);
    P(x, hair, 9, 0, 6, 3, 5, 2, 14, 4, 5, 5, 2, 5, 17, 5, 2, 5);
    P(x, '#e4f2f8', 7, 7, 4, 2, 13, 7, 4, 2);
    P(x, '#9c6a4a', 7, 6, 4, 1, 7, 9, 4, 1, 6, 7, 1, 2, 11, 7, 1, 2, 13, 6, 4, 1, 13, 9, 4, 1, 12, 7, 1, 2, 17, 7, 1, 2);
    P(x, INK, 8, 8, 2, 1, 14, 8, 2, 1);
    P(x, '#f2a0a8', 6, 11, 1, 1, 17, 11, 1, 1); P(x, '#a0525a', frame ? 11 : 10, 12, frame ? 2 : 4, 1);
    P(x, '#e86a5f', 5, 18 + frame, 14, 6); P(x, '#fffaf2', 6, 18 + frame, 6, 5, 12, 18 + frame, 6, 5); P(x, '#c9b8a8', 7, 20 + frame, 4, 1, 13, 20 + frame, 4, 1);
    P(x, skin, 5, 21 + frame, 2, 2, 17, 21 + frame, 2, 2);
  });
}

/* ---------- Biscuit (husky) ---------- */
const DOG = '#57545f', DOGW = '#f2f0ec', BLUE = '#8cc4ea';
export type Collar = 'rope' | 'tag' | 'bandana';
function collar(x: X, kind: Collar, bandana: string, ox: number, oy: number, w = 9) {
  if (kind === 'bandana') { P(x, bandana, ox, oy, w, 2, ox + 2, oy + 2, w - 4, 1, ox + Math.floor(w / 2), oy + 3, 1, 1); P(x, GOLD, ox + Math.floor(w / 2), oy + 1, 1, 2); }
  else { P(x, '#b59a74', ox, oy, w, 1); if (kind === 'tag') P(x, GOLD, ox + Math.floor(w / 2), oy + 1, 1, 2); }
}
export function dogSit(kind: Collar = 'rope', mood: 'sad' | 'happy' | 'idle' = 'idle', bandana = '#e86a5f') {
  return sprite(`dogs:${kind}:${mood}:${bandana}`, 22, 22, x => {
    if (mood !== 'sad') { P(x, DOG, 16, 8, 4, 3, 18, 5, 3, 4); P(x, DOGW, 19, 4, 2, 2); } else { P(x, DOG, 15, 18, 6, 2); P(x, DOGW, 19, 18, 2, 2); }
    P(x, DOG, 4, 10, 13, 11); P(x, DOGW, 7, 11, 7, 9);
    P(x, DOGW, 6, 17, 3, 4, 12, 17, 3, 4);
    if (mood === 'sad') P(x, DOG, 1, 3, 3, 3, 17, 3, 3, 3); else { P(x, DOG, 4, 0, 3, 2, 14, 0, 3, 2); P(x, '#f2d6d8', 5, 1, 1, 1, 15, 1, 1, 1); }
    P(x, DOG, 3, 1, 15, 10); P(x, DOGW, 6, 5, 9, 6, 10, 3, 1, 2, 6, 3, 1, 1, 14, 3, 1, 1);
    if (mood === 'happy') P(x, INK, 7, 7, 1, 1, 8, 6, 1, 1, 9, 7, 1, 1, 12, 7, 1, 1, 13, 6, 1, 1, 14, 7, 1, 1);
    else { P(x, BLUE, 7, 6, 2, 2, 12, 6, 2, 2); P(x, INK, 8, 7, 1, 1, 13, 7, 1, 1); if (mood === 'sad') P(x, INK, 7, 5, 2, 1, 12, 5, 2, 1); }
    P(x, INK, 10, 9, 1, 1); if (mood === 'happy') P(x, '#f39aa6', 10, 10, 1, 2);
    collar(x, kind, bandana, 6, 11);
  });
}
/** Biscuit qui marche de profil (vers la droite), 28×18. */
export function dogWalk(frame = 0, kind: Collar = 'rope', bandana = '#e86a5f') {
  return sprite(`dogw:${frame}:${kind}:${bandana}`, 28, 18, x => {
    const f = frame % 2;
    P(x, DOG, 1, 3, 3, 3, 3, 5, 2, 3); P(x, DOGW, 1, 2, 2, 2);
    P(x, DOGW, 6 + f, 13, 2, 5, 10 - f, 13, 2, 5, 16 + f, 13, 2, 5, 20 - f, 13, 2, 5);
    P(x, DOG, 4, 6, 16, 7); P(x, DOGW, 7, 11, 11, 2);
    P(x, DOG, 18, 1, 9, 8, 19, 0, 2, 1, 23, 0, 2, 1); P(x, DOGW, 21, 4, 6, 4, 22, 2, 1, 2);
    P(x, BLUE, 22, 3, 1, 1); P(x, INK, 26, 5, 1, 1);
    collar(x, kind, bandana, 18, 8, 3);
  });
}
/** Biscuit qui mange, tête dans la gamelle (profil), 28×18 ; frame alterne la tête et la queue. */
export function dogEat(frame = 0, kind: Collar = 'rope', bandana = '#e86a5f') {
  return sprite(`doge:${frame}:${kind}:${bandana}`, 28, 18, x => {
    const f = frame % 2;
    P(x, DOG, f ? 0 : 1, f ? 1 : 3, 3, 3, 2, 4, 2, 3); P(x, DOGW, f ? 0 : 1, f ? 0 : 2, 2, 2);
    P(x, DOGW, 6, 13, 2, 5, 10, 13, 2, 5, 16, 13, 2, 5, 20, 13, 2, 5);
    P(x, DOG, 4, 5, 16, 8); P(x, DOGW, 7, 11, 11, 2);
    P(x, DOG, 19, 7 + f, 8, 8, 20, 6 + f, 2, 1); P(x, DOGW, 22, 10 + f, 5, 4);
    P(x, INK, 23, 9 + f, 2, 1);
    collar(x, kind, bandana, 18, 7, 3);
  });
}
export function dogSleep(kind: Collar = 'tag', bandana = '#e86a5f') {
  return sprite(`dogz:${kind}:${bandana}`, 26, 12, x => {
    P(x, DOG, 3, 4, 20, 7, 2, 8, 8, 2); P(x, DOGW, 2, 9, 3, 1, 6, 8, 10, 2);
    P(x, DOG, 16, 2, 8, 7, 17, 1, 2, 1, 21, 1, 2, 1); P(x, DOGW, 18, 5, 5, 3);
    P(x, INK, 19, 5, 2, 1);
    collar(x, kind, bandana, 15, 8, 3);
  });
}

/* ---------- portraits agrandis pour les dialogues et les cartes ---------- */
const shade = (hex: string) => { const n = parseInt(hex.slice(1), 16), f = (v: number) => Math.max(0, Math.round(v * 0.82)); return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('')}`; };
export function portraitURL(c: HTMLCanvasElement, scale = 6, bg = '#f6e7cf') {
  const [cv, x] = make(c.width * scale, c.height * scale);
  x.imageSmoothingEnabled = false; x.fillStyle = bg; x.fillRect(0, 0, cv.width, cv.height);
  x.drawImage(c, 0, 0, cv.width, cv.height);
  return cv.toDataURL();
}
