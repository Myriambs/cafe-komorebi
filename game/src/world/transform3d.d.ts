export function play3D(host: HTMLElement, o: { hero: 'm' | 'f'; vars: string; full: boolean }, hooks: { flash(): void; plate(): void; open(): void }): { done: Promise<void>; dispose(): void };
