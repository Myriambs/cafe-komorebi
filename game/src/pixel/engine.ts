// Moteur pixel : une toile basse résolution (400×225) agrandie sans flou, zones cliquables, boucle d'animation
export const W = 400, H = 225;

export interface Hit { id: string; x: number; y: number; w: number; h: number }

export class PixelView {
  el: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Calque HTML posé exactement sur la toile (bulles de texte lisibles). Coordonnées en % de 400×225. */
  overlay: HTMLElement;
  ctx: CanvasRenderingContext2D;
  hits: Hit[] = [];
  hover: string | null = null;
  mouse = { x: -1, y: -1 };
  onClick?: (id: string, x: number, y: number) => void;
  private raf = 0;
  private last = 0;
  private t = 0;
  private ro: () => void;

  constructor(root: HTMLElement, private draw: (ctx: CanvasRenderingContext2D, t: number, dt: number) => void, bg = '#1c1420') {
    this.el = document.createElement('div');
    this.el.className = 'screen pixscreen';
    this.el.style.background = bg;
    this.canvas = document.createElement('canvas');
    this.canvas.width = W; this.canvas.height = H;
    this.canvas.className = 'pixcanvas';
    const stage = document.createElement('div'); stage.className = 'pixstage';
    this.overlay = document.createElement('div'); this.overlay.className = 'pixover';
    stage.append(this.canvas, this.overlay);
    this.el.appendChild(stage);
    root.appendChild(this.el);
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.ro = () => this.fit();
    addEventListener('resize', this.ro);
    this.fit();
    this.canvas.addEventListener('pointermove', e => { const p = this.toLocal(e); this.mouse = p; this.hover = this.hitAt(p.x, p.y)?.id ?? null; this.canvas.style.cursor = this.hover ? 'pointer' : 'default'; });
    this.canvas.addEventListener('pointerdown', e => { const p = this.toLocal(e); const h = this.hitAt(p.x, p.y); if (h) this.onClick?.(h.id, p.x, p.y); });
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }
  /** Agrandit la toile pour remplir l'écran en gardant le format (pixels nets). */
  fit() {
    const s = Math.min(this.el.clientWidth / W, this.el.clientHeight / H) || 1;
    const k = s >= 2 && s - Math.floor(s) < 0.15 ? Math.floor(s) : s; // échelle entière si on y perd peu
    this.canvas.style.width = `${W * k}px`; this.canvas.style.height = `${H * k}px`;
    this.el.style.setProperty('--px', `${k}px`);
  }
  private toLocal(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  private hitAt(x: number, y: number) {
    for (let i = this.hits.length - 1; i >= 0; i--) { const h = this.hits[i]; if (x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h) return h; }
    return null;
  }
  /** Déclare une zone cliquable pendant le dessin de l'image courante. */
  hit(id: string, x: number, y: number, w: number, h: number) { this.hits.push({ id, x, y, w, h }); }
  isHover(id: string) { return this.hover === id; }
  private loop(now: number) {
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000); this.last = now; this.t += dt;
    this.hits = [];
    this.ctx.imageSmoothingEnabled = false;
    this.draw(this.ctx, this.t, dt);
    this.raf = requestAnimationFrame(this.loop);
  }
  destroy() { cancelAnimationFrame(this.raf); removeEventListener('resize', this.ro); this.el.remove(); }
}

/** Place un élément du calque HTML en coordonnées de la toile. */
export function place(el: HTMLElement, x: number, y: number, w?: number) {
  el.style.left = `${x / W * 100}%`; el.style.top = `${y / H * 100}%`; if (w !== undefined) el.style.width = `${w / W * 100}%`;
}

/* ---------- petits outils de dessin au pixel ---------- */
export type Ctx = CanvasRenderingContext2D;
export const rect = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** Rectangle plein avec contour d'un pixel (coins éventuellement arrondis d'un pixel). */
export function box(c: Ctx, x: number, y: number, w: number, h: number, fill: string, ink = '#2b1f2a', round = true) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  rect(c, x + 1, y + 1, w - 2, h - 2, fill);
  rect(c, x + (round ? 1 : 0), y, w - (round ? 2 : 0), 1, ink); rect(c, x + (round ? 1 : 0), y + h - 1, w - (round ? 2 : 0), 1, ink);
  rect(c, x, y + (round ? 1 : 0), 1, h - (round ? 2 : 0), ink); rect(c, x + w - 1, y + (round ? 1 : 0), 1, h - (round ? 2 : 0), ink);
}
/** Disque plein au pixel. */
export function disc(c: Ctx, cx: number, cy: number, r: number, col: string) {
  c.fillStyle = col;
  for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(r * r - y * y + r * 0.6)); c.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1); }
}
/** Dégradé « en bandes » (style pixel, sans flou). */
export function bands(c: Ctx, x: number, y: number, w: number, h: number, cols: string[]) {
  const bh = h / cols.length;
  cols.forEach((col, i) => rect(c, x, y + Math.floor(i * bh), w, Math.ceil(bh) + 1, col));
}
