// Patience et résultat d'un service — doux : personne ne part fâché
export const PATIENCE_MAX = 100;
export const PATIENCE_PER_SECOND = 1.5;

export type Outcome = 'delighted' | 'happy' | 'content';

export function tickPatience(p: number, seconds: number): number {
  return Math.max(0, p - PATIENCE_PER_SECOND * seconds);
}

export const hearts = (p: number): number => Math.ceil(Math.max(0, Math.min(PATIENCE_MAX, p)) / 20);

export function outcome(patience: number): Outcome {
  if (patience > 60) return 'delighted';
  if (patience > 20) return 'happy';
  return 'content';
}

/** Paiement : prix + pourboire selon l'humeur (arrondi au centime). */
export function payment(price: number, o: Outcome): number {
  const tip = o === 'delighted' ? 0.5 : o === 'happy' ? 0.2 : 0;
  return Math.round(price * (1 + tip) * 100) / 100;
}
