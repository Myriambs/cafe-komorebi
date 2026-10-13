export function L(w?: number): string;
export const OPTS: { caramel: boolean; cardamom: boolean; chocolate: boolean };
export const SLOTS: number[];
export function TXT(x: number, y: number, t: string, s?: number, a?: string, c?: string, w?: number): string;
export function decor(): string;
export function machines(): string;
export function front(): string;
export function cupArt(i: number, c: string[] | null): string;
export function ticketArt(o: { id: number; recipe: { name: string; price: number; need: string[] }; who: [string, string, string]; patience: number }, i: number): string;
