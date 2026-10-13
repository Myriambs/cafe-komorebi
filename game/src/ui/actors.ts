// Petits acteurs 2D qui marchent dans la salle : accélération douce, demi-tour, tri en profondeur
const NS = 'http://www.w3.org/2000/svg';

export interface Actor {
  el: SVGGElement; inner: SVGGElement;
  x: number; y: number; flip: number; flipable: boolean; base: number;
  path: { x: number; y: number }[]; speed: number; v: number; done?: () => void;
  poses?: { side: string; front: string; back: string }; pose?: string;
}

export class Stage {
  actors = new Set<Actor>();
  private raf = 0;
  private last = 0;
  constructor(private depth: SVGGElement, private scaleAt: (y: number) => number) {
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  /** svg : un <svg> de personnage dont les pieds sont à (0, 0). */
  add(svg: string, x: number, y: number, o: { flipable?: boolean; base?: number; cls?: string; act?: string; poses?: Actor['poses'] } = {}): Actor {
    const el = document.createElementNS(NS, 'g') as SVGGElement;
    if (o.cls) el.setAttribute('class', o.cls);
    if (o.act) el.dataset.act = o.act;
    const inner = document.createElementNS(NS, 'g') as SVGGElement;
    inner.innerHTML = svg;
    el.appendChild(inner);
    const a: Actor = { el, inner, x, y, flip: 1, flipable: !!o.flipable, base: o.base ?? 1, path: [], speed: 200, v: 0, poses: o.poses };
    this.depth.appendChild(el);
    this.actors.add(a);
    this.place(a);
    return a;
  }
  remove(a: Actor) { a.el.remove(); this.actors.delete(a); }

  walk(a: Actor, pts: { x: number; y: number }[], speed = 200): Promise<void> {
    return new Promise(resolve => { a.path = pts.slice(); a.speed = speed; a.done = resolve; });
  }

  private place(a: Actor) {
    const s = this.scaleAt(a.y) * a.base;
    a.el.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) scale(${(s * a.flip).toFixed(3)} ${s.toFixed(3)})`);
    a.el.dataset.y = String(a.y);
  }

  private loop(t: number) {
    const dt = Math.min(0.05, (t - (this.last || t)) / 1000); this.last = t;
    for (const a of this.actors) {
      if (!a.path.length) continue;
      const p = a.path[0], dx = p.x - a.x, dy = p.y - a.y, len = Math.hypot(dx, dy);
      const lastPt = a.path.length === 1;
      a.v = Math.min(a.speed, a.v + a.speed * dt * 3);                  // accélère
      if (lastPt && len < 60) a.v = Math.max(40, a.speed * len / 60);   // ralentit à l'arrivée
      const mv = a.v * dt;
      if (a.poses && len > 1) {
        // de profil quand on va surtout de côté, de face quand on descend vers nous, de dos quand on s'éloigne
        const vertical = Math.abs(dy) > Math.abs(dx) * 1.1;
        const pose = vertical ? (dy > 0 ? a.poses.front : a.poses.back) : a.poses.side;
        if (pose !== a.pose) { a.pose = pose; (a.inner.firstElementChild as SVGElement)?.setAttribute('data-state', pose); }
        if (vertical) a.flip = 1; else if (Math.abs(dx) > 2) a.flip = dx < 0 ? -1 : 1;
      } else if (a.flipable && Math.abs(dx) > 2) a.flip = dx < 0 ? -1 : 1;
      if (len <= mv) { a.x = p.x; a.y = p.y; a.path.shift(); if (!a.path.length) { a.v = 0; a.pose = undefined; const d = a.done; a.done = undefined; d?.(); } }
      else { a.x += dx / len * mv; a.y += dy / len * mv; }
      this.place(a);
    }
    this.sortDepth();
    this.raf = requestAnimationFrame(this.loop);
  }

  // dessine d'abord ce qui est au fond (y petit), puis ce qui est devant
  private sortDepth() {
    const kids = Array.from(this.depth.children) as SVGGElement[];
    let sorted = true;
    for (let i = 1; i < kids.length; i++) if (+kids[i - 1].dataset.y! > +kids[i].dataset.y!) { sorted = false; break; }
    if (sorted) return;
    kids.sort((p, q) => +p.dataset.y! - +q.dataset.y!).forEach(k => this.depth.appendChild(k));
  }

  destroy() { cancelAnimationFrame(this.raf); }
}
