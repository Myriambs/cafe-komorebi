// Portraits pixel des dialogues : le sprite agrandi sans flou, sur fond crème.
import { heroBust, mokaSit, grandmaRead, dogSit } from './sprites';

interface Ctx { hero: 'm' | 'f'; colors: { apron: string; moka: string; grandma: string; bandana: string } }
let get: (() => Ctx) | null = null;
const urls = new Map<string, string>();
export function setPixelPortraits(f: () => Ctx) { get = f; }

function square(c: HTMLCanvasElement, bg: string) {
  const n = Math.max(c.width, c.height) + 4, k = 6;
  const cv = document.createElement('canvas'); cv.width = cv.height = n * k;
  const x = cv.getContext('2d')!; x.imageSmoothingEnabled = false;
  x.fillStyle = bg; x.fillRect(0, 0, cv.width, cv.height);
  x.drawImage(c, Math.floor((n - c.width) / 2) * k, (n - c.height) * k, c.width * k, c.height * k);
  return cv.toDataURL();
}

/** URL du portrait pixel, ou null si le personnage n'a pas encore de sprite. */
export function pixelPortrait(who: string, state = 'idle'): string | null {
  if (!get || !document.body.classList.contains('pixel')) return null;
  const { hero, colors } = get();
  const key = `${who}:${state}:${hero}:${JSON.stringify(colors)}`;
  if (urls.has(key)) return urls.get(key)!;
  let c: HTMLCanvasElement | null = null;
  if (who === 'heroF' || who === 'heroM') c = heroBust(state === 'city' ? { g: who === 'heroF' ? 'f' : 'm', outfit: 'city' } : { g: who === 'heroF' ? 'f' : 'm', outfit: 'uniform', apron: colors.apron });
  else if (who === 'moka') c = mokaSit(colors.moka, state === 'sleep' ? 'sleep' : state === 'cuddle' || state === 'happy' ? 'happy' : 'idle');
  else if (who === 'grandma') c = grandmaRead(colors.grandma);
  else if (who === 'biscuit') c = state === 'stray' ? dogSit('rope', 'sad') : state === 'eat' ? dogSit('rope', 'happy') : state === 'named' ? dogSit('tag', 'happy') : dogSit('bandana', 'happy', colors.bandana);
  if (!c) return null;
  const url = square(c, '#f6e7cf');
  urls.set(key, url);
  return url;
}
