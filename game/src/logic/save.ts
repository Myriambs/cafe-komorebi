// Sauvegarde locale, validée au chargement (pas de pièces négatives ou infinies)
export type Phase = 'prologue' | 'morning' | 'service' | 'night' | 'done';

export interface SaveData {
  v: 1;
  hero: 'm' | 'f';
  name: string;
  uniform: string;                 // tenue du héros (voir outfits.ts)
  names: { moka: string; biscuit: string; grandma: string };
  outfits: { moka: string; grandma: string; biscuit: string; captain: string; dusty: string; bubbles: string; nibbles: string };
  owned: string[];                 // tenues achetées, ex. « hero:matcha »
  day: number;
  phase: Phase;
  coins: number;
  totalServed: number;
  nightsFed: number;
  seenTransform: boolean;
  /** Niveau en cours (1 : café, 2 : bar à jus, 3 : la Crumb Crew). */
  level: number;
  /** Statistiques du niveau en cours, pour le bilan de fin de niveau. */
  stats: LevelStats;
}
export interface LevelStats { drinks: Record<string, number>; delighted: number; books: number; tips: number }
export const newStats = (): LevelStats => ({ drinks: {}, delighted: 0, books: 0, tips: 0 });

export const KEY = 'komorebi-save-v1';

const DEFAULT_NAMES = { moka: 'Moka', biscuit: 'Biscuit', grandma: 'Grandma' };
const DEFAULT_OUTFITS = { moka: 'concierge', grandma: 'shutter', biscuit: 'red', captain: 'red', dusty: 'cloud', bubbles: 'sky', nibbles: 'sunflower' };

export function newSave(hero: 'm' | 'f', name: string, uniform: string): SaveData {
  return { v: 1, hero, name: cleanName(name, hero), uniform: OUTFIT_IDS.hero.includes(uniform) ? uniform : 'espresso', names: { ...DEFAULT_NAMES }, outfits: { ...DEFAULT_OUTFITS }, owned: [], day: 1, phase: 'prologue', coins: 20, totalServed: 0, nightsFed: 0, seenTransform: false, level: 1, stats: newStats() };
}

/** Nom d'un compagnon : lettres, chiffres, espaces, 12 caractères au plus. */
export function cleanPetName(name: unknown, fallback: string): string {
  const n = String(name ?? '').replace(/[^\p{L}\p{N} '-]/gu, '').trim().slice(0, 12);
  return n || fallback;
}

export function cleanName(name: string, hero: 'm' | 'f'): string {
  const n = String(name ?? '').replace(/[^\p{L}\p{N} '-]/gu, '').trim().slice(0, 10);
  return n || (hero === 'f' ? 'Hana' : 'Ren');
}

const PHASES: Phase[] = ['prologue', 'morning', 'service', 'night', 'done'];
import { OUTFITS, type Who } from './outfits';
const OUTFIT_IDS = Object.fromEntries(Object.entries(OUTFITS).map(([w, list]) => [w, list.map(o => o.id)])) as Record<Who, string[]>;
const pickOutfit = (raw: unknown, w: Exclude<Who, 'hero'>) => OUTFIT_IDS[w].includes((raw as any)?.[w]) ? (raw as any)[w] as string : DEFAULT_OUTFITS[w];
const int = (x: unknown, lo: number, hi: number, d: number) => {
  const n = Number(x);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.floor(n))) : d;
};

/** Valide des données inconnues ; renvoie null si inutilisables. */
export function validate(raw: unknown): SaveData | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.v !== 1) return null;
  const hero = r.hero === 'f' ? 'f' : 'm';
  const coins = Number(r.coins);
  return {
    v: 1,
    hero,
    name: cleanName(String(r.name ?? ''), hero),
    uniform: OUTFIT_IDS.hero.includes(String(r.uniform)) ? String(r.uniform) : 'espresso',
    names: {
      moka: cleanPetName((r.names as any)?.moka, DEFAULT_NAMES.moka),
      biscuit: cleanPetName((r.names as any)?.biscuit, DEFAULT_NAMES.biscuit),
      grandma: cleanPetName((r.names as any)?.grandma, DEFAULT_NAMES.grandma)
    },
    outfits: {
      moka: pickOutfit(r.outfits, 'moka'), grandma: pickOutfit(r.outfits, 'grandma'), biscuit: pickOutfit(r.outfits, 'biscuit'),
      captain: pickOutfit(r.outfits, 'captain'), dusty: pickOutfit(r.outfits, 'dusty'), bubbles: pickOutfit(r.outfits, 'bubbles'), nibbles: pickOutfit(r.outfits, 'nibbles')
    },
    owned: Array.isArray(r.owned) ? (r.owned as unknown[]).map(String).filter(x => /^(hero|moka|grandma|biscuit|captain|dusty|bubbles|nibbles):[a-z]+$/.test(x)).slice(0, 40) : [],
    day: int(r.day, 1, 3, 1),
    phase: PHASES.includes(r.phase as Phase) ? (r.phase as Phase) : 'morning',
    coins: Number.isFinite(coins) ? Math.min(1e6, Math.max(0, Math.round(coins * 100) / 100)) : 0,
    totalServed: int(r.totalServed, 0, 1e5, 0),
    nightsFed: int(r.nightsFed, 0, 3, 0),
    seenTransform: r.seenTransform === true,
    level: int(r.level, 1, 3, 1),
    stats: cleanStats(r.stats)
  };
}

function cleanStats(raw: unknown): LevelStats {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const drinks: Record<string, number> = {};
  if (r.drinks && typeof r.drinks === 'object') for (const [k, v] of Object.entries(r.drinks as object).slice(0, 40)) if (/^[a-zA-Z]{1,20}$/.test(k)) drinks[k] = int(v, 0, 1e5, 0);
  return { drinks, delighted: int(r.delighted, 0, 1e5, 0), books: int(r.books, 0, 1e5, 0), tips: int(r.tips, 0, 1e5, 0) };
}

export function load(store: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): SaveData | null {
  try { return validate(JSON.parse(store?.getItem(KEY) ?? 'null')); } catch { return null; }
}
export function save(d: SaveData, store: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): void {
  try { store?.setItem(KEY, JSON.stringify(d)); } catch { /* stockage indisponible : on continue sans */ }
}
