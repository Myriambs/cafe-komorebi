// Boîte de dialogue façon visual novel : portrait, nom, texte qui s'écrit, choix
import { ui, h, charSvg, type CharId } from './dom';
import { pixelPortrait } from '../pixel/portraits';

export interface Line { who?: CharId | 'narr'; name?: string; state?: string; text: string; right?: boolean; vars?: string }

const PORTRAIT_BOX: Partial<Record<CharId, string>> = {
  moka: '30 70 140 140', biscuit: '30 66 140 140', pip: '35 95 130 130', kettle: '35 100 130 130',
  captain: '30 30 140 140', dusty: '30 22 140 140', bubbles: '30 30 140 140', nibbles: '30 40 140 140'
};

export function say(line: Line, choices?: string[]): Promise<number> {
  return new Promise(resolve => {
    const narr = !line.who || line.who === 'narr';
    const box = h(`<div class="dlg ${narr ? 'narr' : ''} ${line.right ? 'right' : ''}">
      ${narr ? '' : `<div class="portrait">${pixelPortrait(line.who!, line.state) ? `<img class="pxp" alt="" src="${pixelPortrait(line.who!, line.state)}">` : charSvg(line.who as CharId, line.state ?? 'idle', line.vars ? `style="${line.vars}"` : '', PORTRAIT_BOX[line.who as CharId] ?? '35 20 130 130')}</div>`}
      <div>${narr ? '' : `<span class="name">${line.name ?? ''}</span>`}<div class="text"></div><div class="choices"></div></div>
      <span class="more">${choices ? '' : 'click ▶'}</span></div>`);
    ui().appendChild(box);
    const textEl = box.querySelector('.text')!, ch = box.querySelector('.choices')!;
    let i = 0, done = false;
    const full = line.text;
    const finish = () => {
      done = true; textEl.textContent = full;
      if (choices) ch.innerHTML = choices.map((c, k) => `<button class="btn ${k ? 'light' : ''}" data-k="${k}">${c}</button>`).join('');
    };
    const timer = setInterval(() => { if (done) return clearInterval(timer); i += 2; textEl.textContent = full.slice(0, i); if (i >= full.length) { clearInterval(timer); finish(); } }, 22);
    box.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest('button');
      if (!done) { finish(); return; }
      if (choices) { if (b) { box.remove(); resolve(+b.dataset.k!); } return; }
      box.remove(); resolve(0);
    });
  });
}

/** Enchaîne plusieurs répliques. */
export async function talk(lines: Line[]) { for (const l of lines) await say(l); }
