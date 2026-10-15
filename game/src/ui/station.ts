// Station café : préparer les boissons commandées, puis les servir
import { P } from '../art/cast.js';
import { OPTS, TXT, SLOTS, decor, machines, front, cupArt, ticketArt } from './stationArt.js';
import { music } from '../audio/music';
import { h, ui } from './dom';
import { INGREDIENTS, matches, cannotAdd, recipeById, type Ingredient } from '../logic/recipes';
import type { Room, Cust } from './room';

const NS = 'http://www.w3.org/2000/svg';
export interface Stock { cups: number; espresso: number; milk: number; caramel: number; cardamom: number; chocolate: number }
/** Plan de travail conservé entre deux visites de la station (tasses en cours, café moulu). */
export interface Bench { cups: (Ingredient[] | null)[]; sel: number; ground: boolean }
export const newBench = (): Bench => ({ cups: [null, null, null], sel: -1, ground: false });

export class Station {
  el: HTMLElement;
  get cups() { return this.bench.cups; }
  get sel() { return this.bench.sel; }
  set sel(v: number) { this.bench.sel = v; }
  private get ground() { return this.bench.ground; }   // café moulu prêt dans le porte-filtre
  private set ground(v: boolean) { this.bench.ground = v; }
  /** Tasses en train de partir vers le client (animation) : on ne peut plus les choisir. */
  private flying = new Set<number>();
  private timer: number;
  onClose?: () => void;
  onFirstServe?: () => void;

  constructor(private room: Room, public stock: Stock, caramel: boolean, private hint?: string, private bench: Bench = newBench()) {
    OPTS.caramel = caramel;
    const need = room.o.recipes.flatMap(id => recipeById(id).need);
    OPTS.cardamom = need.includes('cardamom'); OPTS.chocolate = need.includes('chocolate');
    this.el = h(`<div class="screen" style="background:#b3723a"><svg class="stage-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style="overflow:visible;background:transparent">
      <g class="art">${decor()}${machines()}${front()}</g><g class="labels">${decor()}${machines()}${front()}</g>
      <g class="hit" data-act="close"><g class="lift"><rect x="18" y="18" width="230" height="50" rx="25" fill="#fdf5e8" stroke="${P.ink}" stroke-width="2.5"/>${TXT(133, 50, '← Back to the room', 17)}</g></g>
      <rect x="1238" y="18" width="344" height="50" rx="25" fill="#fdf5e8" stroke="${P.ink}" stroke-width="2.5"/><text id="coins" x="1410" y="50" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="18" fill="${P.ink}"></text>
      <g id="tickets"></g><g id="fx"></g><g id="toast"></g><g id="hintBox"></g>
    </svg></div>`);
    ui().appendChild(this.el);
    this.el.querySelector('svg')!.addEventListener('click', e => this.click(e));
    this.cups.forEach((_, i) => this.drawCup(i));
    if (this.ground) this.showGround(true);
    this.render();
    if (hint) this.showHint(hint);
    this.timer = window.setInterval(() => this.renderTickets(), 1000);
  }
  $(id: string) { return this.el.querySelector('#' + id) as SVGElement; }
  /** Le même élément existe dans le calque pixel et dans la copie nette des étiquettes. */
  $$(id: string) { return Array.from(this.el.querySelectorAll('#' + id)) as SVGElement[]; }

  private orders() { return this.room.ordered().filter(c => !c.recipe?.kind); }
  private renderTickets() {
    this.$('tickets').innerHTML = this.orders().slice(0, 3).map((c, i) => { const rem = c.qty - c.servedCups; return ticketArt({ id: c.id, recipe: { ...c.recipe!, name: (rem > 1 ? `${rem} × ` : '') + c.recipe!.name }, who: [`Table ${c.table + 1}`, String(c.table + 1), ''] as [string, string, string], patience: c.patience }, i); }).join('')
      || TXT(800, 170, 'No orders waiting: take orders in the room', 20, 'middle', '#8a6a5a', 700);
  }
  render() {
    this.$('coins').textContent = `Coins ${Math.round(this.room.coins * 100) / 100} · ${this.room.served} / ${this.room.o.goal} happy`;
    for (const k of ['cups', 'espresso', 'milk', 'caramel', 'cardamom', 'chocolate'] as const) {
      this.$$('cnt-' + k).forEach(c => c.textContent = String(this.stock[k]));
      this.$$('m-' + (k === 'cups' ? 'cup' : k === 'espresso' ? 'grind' : k)).forEach(m => m.classList.toggle('off', this.stock[k] <= 0));
    }
    this.$$('m-foam').forEach(m => m.classList.toggle('off', this.stock.milk <= 0));
    this.cups.forEach((_, i) => this.$$('slot-' + i).forEach(e => e.classList.toggle('sel', i === this.sel)));
    this.renderTickets();
  }
  private showGround(on: boolean) { this.$$('ground').forEach(e => e.style.display = on ? '' : 'none'); this.el.querySelectorAll<SVGElement>('.groundIn').forEach(e => e.style.display = on ? '' : 'none'); }
  private drawCup(i: number) { this.$$('cup-' + i).forEach(e => e.innerHTML = cupArt(i, this.cups[i])); }
  private fx(x: number, y: number, text: string, color = '#6e5040') {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<g class="fx" style="transform-box:fill-box">${TXT(x, y, text, 22, 'middle', color)}</g>`;
    this.$('fx').appendChild(g); setTimeout(() => g.remove(), 1300);
  }
  toast(text: string, good: boolean) {
    this.$('toast').innerHTML = `<g class="popin"><rect x="440" y="206" width="720" height="46" rx="23" fill="${good ? '#eaf4ec' : '#fbe9e4'}" stroke="${P.ink}" stroke-width="2.5"/>${TXT(800, 236, text, 16)}</g>`;
    clearTimeout((this as any).tt); (this as any).tt = setTimeout(() => this.$('toast').innerHTML = '', 2600);
  }
  showHint(text: string | null) {
    this.$('hintBox').innerHTML = text ? `<g class="popin"><rect x="1180" y="640" width="410" height="96" rx="18" fill="#fffaf2" stroke="${P.ink}" stroke-width="2.5"/>
      <foreignObject x="1190" y="646" width="390" height="84"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 16px/1.35 Nunito,sans-serif;color:#3b2838;padding:6px 10px"><b>Grandma:</b> ${text}</div></foreignObject></g>` : '';
  }
  private slotX(i: number) { return SLOTS[i]; }

  private click(e: Event) {
    const el = (e.target as Element).closest('[data-act]') as SVGElement | null;
    if (!el) return;
    const a = el.dataset.act!;
    if (el.classList.contains('off')) return this.toast('Out of stock: click Restock', false);
    if (a === 'close') return this.close();
    if (a === 'cup') {
      const i = this.cups.indexOf(null);
      if (i < 0) return this.toast('All three spots are full', false);
      this.stock.cups--; this.cups[i] = []; this.sel = i; this.drawCup(i);
    } else if (a === 'slot') {
      const i = +el.dataset.i!; if (this.cups[i]) this.sel = i;
    } else if (a === 'grind') {
      if (this.ground) return this.toast('Ground coffee is ready: press the espresso machine', true);
      if (this.stock.espresso <= 0) return this.toast('Out of beans: click Supplies to restock', false);
      this.stock.espresso--; music.sfx('grind');
      const body = this.$('grinderBody'); body.classList.add('shake');
      setTimeout(() => { body.classList.remove('shake'); this.ground = true; this.showGround(true); this.fx(165, 130, 'Ground!', '#5a3424'); }, 1150);
    } else if (a in INGREDIENTS) {
      const ing = a as Ingredient, c = this.cups[this.sel];
      if (!c) return this.toast('Take a cup first (front left)', false);
      const why = cannotAdd(c, ing); if (why) return this.toast(why, false);
      if (ing === 'espresso') {
        if (!this.ground) return this.toast('Grind the beans first (tap the orange grinder)', false);
        this.ground = false; this.showGround(false);
      }
      c.push(ing);
      if (ing === 'milk' || ing === 'foam') this.stock.milk--;
      if (ing === 'caramel') this.stock.caramel--;
      if (ing === 'cardamom') this.stock.cardamom--;
      if (ing === 'chocolate') this.stock.chocolate--;
      this.drawCup(this.sel); this.fx(this.slotX(this.sel), 690, '+ ' + INGREDIENTS[ing].name); music.sfx('pour');
    } else if (a === 'trash') {
      if (this.sel < 0 || !this.cups[this.sel]) return;
      this.cups[this.sel] = null; this.drawCup(this.sel); this.sel = this.cups.findIndex(c => c);
    } else if (a === 'restock') {
      if (this.room.coins < 15) return this.toast('Not enough coins', false);
      music.sfx('cash');
      this.room.coins -= 15; this.room.drawHud();
      for (const k in this.stock) (this.stock as any)[k] += 5;
      this.toast('Stock refilled: +5 of everything', true);
    } else if (a === 'bell') {
      music.sfx('bell');
      // la cloche sert la tasse choisie ; sinon n'importe quelle tasse prête qui correspond à une commande
      const ready = (k: number) => { const c = this.cups[k]; return !!c && c.length > 0 && !this.flying.has(k); };
      const fits = (k: number) => ready(k) && this.orders().some(x => matches(this.cups[k]!, x.recipe!));
      if (!fits(this.sel)) { const k = this.cups.findIndex((_, k) => fits(k)); if (k >= 0) this.sel = k; }
      const c = this.cups[this.sel];
      if (!ready(this.sel) || !c) return this.toast('Select a filled cup, then ring the bell', false);
      const o = this.orders().find(x => matches(c, x.recipe!));
      if (!o) return this.toast('No customer ordered this drink: check the tickets', false);
      return this.serveTo(o, el);
    } else if (a === 'serve') {
      const o = this.room.custs.find(x => x.id === +el.dataset.id!) as Cust, c = this.cups[this.sel];
      if (!c || !c.length) return this.toast('Select a filled cup, then click the ticket', false);
      if (!matches(c, o.recipe!)) {
        el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 700);
        return this.toast(`Not quite: this order is a ${o.recipe!.name} (${o.recipe!.need.map(k => INGREDIENTS[k].name).join(' + ')})`, false);
      }
      return this.serveTo(o, el);
    }
    this.render();
  }

  private serveTo(o: Cust, _el: SVGElement) {
    {
      const { outcome, pay, done } = this.room.serve(o.id);
      this.fx(800, 300, `+${pay} coins`, '#8a6a3c');
      this.toast(!done ? `One ${o.recipe!.name} served, ${o.qty - o.servedCups} more for table ${o.table + 1}` : outcome === 'delighted' ? `Delighted! They loved the ${o.recipe!.name}` : `Served! Your customers are happy`, true);
      const cupG = this.$('cup-' + this.sel) as SVGGElement;
      cupG.style.animation = 'cupFly .8s ease-in forwards';
      const i = this.sel;
      this.flying.add(i);
      setTimeout(() => { cupG.style.animation = ''; this.cups[i] = null; this.flying.delete(i); this.drawCup(i); }, 820);
      this.sel = this.cups.findIndex((x, k) => x && x.length && !this.flying.has(k));
      this.onFirstServe?.();
      if (!this.orders().length) setTimeout(() => this.close(), 1100);
    }
    this.render();
  }

  close() { clearInterval(this.timer); this.el.remove(); this.onClose?.(); }
}
