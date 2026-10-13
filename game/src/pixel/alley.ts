// Nuit en pixel art : sortir la poubelle derrière le café et rencontrer le husky perdu.
import { PixelView, W, H, rect, box, disc, bands, place, type Ctx } from './engine';
import { drawText } from './font';
import { heroBody, dogSit, dogWalk, dogEat, dogSleep, flipped, type Collar } from './sprites';
import { ui, h, sleep } from '../ui/dom';
import { say, talk, type Line } from '../ui/dialogue';

const INK = '#2b1f2a', GROUND = 172;
const BOWL_X = 300, ARCH_X = 376;

type DogPose = 'walk' | 'sad' | 'happy' | 'eat' | 'sleep' | 'hidden';
interface Actor { x: number; tx: number; speed: number; face: 1 | -1; done?: () => void }

export async function nightScene(o: { hero: 'm' | 'f'; night: 1 | 2; name: string; dogName?: string; bandana?: string }) {
  const heroId = o.hero === 'f' ? 'heroF' : 'heroM';
  const dogName = o.dogName ?? 'Biscuit';
  const hero: Actor & { carry: boolean } = { x: 86, tx: 86, speed: 0, face: 1, carry: false };
  const dog: Actor & { pose: DogPose; kind: Collar; peek: boolean } = { x: ARCH_X + 30, tx: ARCH_X + 30, speed: 0, face: -1, pose: 'hidden', kind: 'rope', peek: false };
  const st = { bag: true, bowl: false, lid: 0, shake: 0 };
  const fxs: { x: number; y: number; s: string; col: string; t: number }[] = [];
  const fx = (x: number, y: number, s: string, col = '#fdf5e8') => fxs.push({ x, y, s, col, t: 0 });
  const stars = Array.from({ length: 34 }, (_, i) => [(i * 71) % W, 2 + (i * 37) % 34] as const);
  const stones = Array.from({ length: 60 }, (_, i) => [(i * 67) % W, 176 + (i * 23) % 46, 6 + (i % 3) * 3] as const);

  const step = (a: Actor, dt: number) => {
    if (a.x === a.tx) return;
    const d = a.tx - a.x, s = a.speed * dt;
    if (Math.abs(d) <= s) { a.x = a.tx; const f = a.done; a.done = undefined; f?.(); } else a.x += Math.sign(d) * s;
  };
  const walk = (a: Actor, x: number, speed: number) => new Promise<void>(r => { a.tx = x; a.speed = speed; a.face = x < a.x ? -1 : 1; a.done = r; });

  const view = new PixelView(ui(), (c, t, dt) => {
    step(hero, dt); step(dog, dt);
    st.lid = Math.max(0, st.lid - dt); st.shake = Math.max(0, st.shake - dt);
    for (let i = fxs.length - 1; i >= 0; i--) if ((fxs[i].t += dt) > 1.3) fxs.splice(i, 1);
    draw(c, t);
  }, '#141a38');

  function draw(c: Ctx, t: number) {
    // ciel, lune, étoiles
    bands(c, 0, 0, W, 42, ['#0c1440', '#141d52', '#1c2862', '#243374']);
    for (const [x, y] of stars) if (Math.floor(t * 1.5 + x) % 9) rect(c, x, y, 1, 1, '#fff6d8');
    disc(c, 344, 18, 9, '#fff8e0'); disc(c, 340, 16, 2, '#efe6c8'); disc(c, 348, 21, 1, '#efe6c8');
    // mur de briques
    rect(c, 0, 40, W, 122, '#8f6a64');
    for (let y = 44; y < 162; y += 6) { rect(c, 0, y, W, 1, '#7a5652'); for (let x = (y / 6) % 2 ? 0 : 8; x < W; x += 16) rect(c, x, y - 5, 1, 5, '#7a5652'); }
    for (let i = 0; i < 40; i++) rect(c, (i * 89) % W, 46 + (i * 31) % 110, 7, 4, '#9c7670');
    rect(c, 0, 36, W, 5, '#62769f'); rect(c, 0, 36, W, 1, '#7a8eb8'); rect(c, 0, 41, W, 1, INK);
    // fenêtre éclairée
    box(c, 140, 66, 38, 30, '#ffd28a'); rect(c, 158, 67, 2, 28, '#fdf5e8'); rect(c, 141, 80, 36, 2, '#fdf5e8');
    c.globalAlpha = 0.12; disc(c, 159, 81, 26, '#ffd28a'); c.globalAlpha = 1;
    // porte de service du café, ouverte
    c.globalAlpha = 0.22; for (let r = 3; r > 0; r--) { disc(c, 82, 172, 18 + r * 10, '#ffd59a'); } c.globalAlpha = 1;
    box(c, 58, 82, 46, 80, '#fdf5e8'); rect(c, 62, 86, 38, 76, '#ffd59a'); rect(c, 62, 86, 14, 76, '#8a5a48'); rect(c, 76, 86, 1, 76, INK);
    disc(c, 82, 74, 4, '#ffe2a6'); rect(c, 80, 70, 5, 1, INK);
    c.globalAlpha = 0.25; disc(c, 82, 74, 12, '#ffd28a'); c.globalAlpha = 1;
    // passage vers l'arrière de la ruelle
    rect(c, 360, 100, 34, 62, '#1c1a28'); for (let k = 0; k < 8; k++) rect(c, 360 + k, 100 - Math.round(Math.sqrt(64 - (k - 8) ** 2) * 1.2) + 10, 34 - k * 2, 2, '#1c1a28');
    rect(c, 368, 112, 18, 50, '#2e2a40');
    drawText(c, 'BACK', 377, 78, '#d9cfc6', 'center'); drawText(c, 'ALLEY', 377, 87, '#d9cfc6', 'center');
    // sol pavé
    rect(c, 0, 162, W, H - 162, '#5d5a72'); rect(c, 0, 162, W, 1, INK);
    for (const [x, y, w] of stones) { rect(c, x, y, w, 2, '#6b6882'); rect(c, x, y + 2, w, 1, '#4f4c64'); }
    c.globalAlpha = 0.25; disc(c, 82, 176, 30, '#ffd59a'); c.globalAlpha = 1;
    // cartons
    box(c, 318, 132, 32, 30, '#c99b6e'); rect(c, 319, 133, 30, 2, '#d7aa7c'); rect(c, 333, 133, 2, 28, '#a8784e');
    box(c, 324, 112, 24, 21, '#d7aa7c'); rect(c, 335, 113, 2, 19, '#b88a5e');
    // poubelles
    const sx = st.shake > 0 ? Math.round(Math.sin(t * 50)) : 0;
    box(c, 222 + sx, 128, 38, 34, '#7d9a8a'); for (const x of [232, 241, 250]) rect(c, x + sx, 134, 1, 24, '#6b8778');
    const lid = st.lid > 0 ? -3 : 0;
    box(c, 219 + sx, 123 + lid, 44, 7, '#6b8778'); rect(c, 236 + sx, 120 + lid, 10, 3, '#5a7466');
    box(c, 266 + sx, 132, 32, 30, '#88a596'); box(c, 263 + sx, 127, 38, 6, '#759282');
    // gamelle
    if (st.bowl) { box(c, BOWL_X - 14, GROUND - 8, 28, 9, '#e86a5f'); rect(c, BOWL_X - 12, GROUND - 9, 24, 3, '#f3e1b5'); rect(c, BOWL_X - 7, GROUND - 11, 4, 2, '#fffaf2'); rect(c, BOWL_X + 2, GROUND - 11, 4, 2, '#fffaf2'); }
    // sac poubelle à ramasser
    if (st.bag) {
      const b = Math.round(Math.abs(Math.sin(t * 4)) * 2);
      box(c, 108, GROUND - 14 - b, 14, 14, '#4a4752'); rect(c, 113, GROUND - 17 - b, 4, 3, '#4a4752'); rect(c, 112, GROUND - 18 - b, 1, 2, INK); rect(c, 117, GROUND - 18 - b, 1, 2, INK);
      view.hit('bag', 102, GROUND - 24, 26, 26);
    }
    // héros
    const moving = hero.x !== hero.tx;
    const hs = heroBody(o.hero, moving ? 1 + (Math.floor(t * 6) % 2) : 0, hero.carry);
    const big = (img: HTMLCanvasElement, x: number, y: number) => c.drawImage(img, Math.round(x), Math.round(y), img.width * 2, img.height * 2);
    big(hero.face < 0 ? flipped(hs) : hs, hero.x - hs.width, GROUND - hs.height * 2 + 2 - (moving ? Math.floor(t * 12) % 2 : 0));
    // Biscuit
    if (dog.pose !== 'hidden') {
      const dm = dog.x !== dog.tx;
      let s: HTMLCanvasElement;
      if (dm || dog.pose === 'walk') s = dogWalk(Math.floor(t * 8), dog.kind, o.bandana);
      else if (dog.pose === 'eat') s = dogEat(Math.floor(t * 4), dog.kind, o.bandana);
      else if (dog.pose === 'sleep') s = dogSleep(dog.kind, o.bandana);
      else s = dogSit(dog.kind, dog.pose === 'sad' ? 'sad' : 'happy', o.bandana);
      const flip = dog.face < 0 && (dm || dog.pose === 'walk' || dog.pose === 'eat');
      big(flip ? flipped(s) : s, dog.x - s.width, GROUND - s.height * 2 + 2);
      if (dog.pose === 'sleep') drawText(c, 'Z', dog.x + 24, GROUND - 30 - Math.floor(t * 3) % 3, '#fdf5e8');
    }
    // bord du passage, devant le chien qui épie
    if (dog.peek) { rect(c, 350, 96, 20, 80, "#8f6a64"); for (let y = 100; y < 176; y += 6) rect(c, 350, y, 20, 1, "#7a5652"); rect(c, 370, 96, 1, 80, INK); }
    for (const f of fxs) {
      const y = f.y - f.t * 14;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) drawText(c, f.s, f.x + dx, y + dy, INK, 'center');
      drawText(c, f.s, f.x, y, f.col, 'center');
    }
    // teinte de nuit (nette, sans flou)
    c.globalAlpha = 0.16; rect(c, 0, 0, W, H, '#3a4a8a'); c.globalAlpha = 1;
  }

  const banner = h(`<div class="pxbanner">NIGHT ${o.night} · CLOSING TIME</div>`); place(banner, W / 2, 46); view.overlay.appendChild(banner);
  const hint = h(`<div class="pxtip">Last chore of the day: click the <b>trash bag</b> to take it out.</div>`); place(hint, 130, 120, 150); view.overlay.appendChild(hint);
  await new Promise<void>(r => { view.onClick = id => { if (id === 'bag') r(); }; });
  hint.remove(); banner.remove();
  st.bag = false; hero.carry = true;
  await walk(hero, 196, 50);
  hero.carry = false; st.lid = 0.35; fx(240, 112, 'THUD');
  await sleep(800);
  st.shake = 0.8; fx(330, 104, '*RUSTLE*');
  await sleep(900);

  dog.pose = 'walk'; dog.face = -1;
  await walk(dog, 340, 40);
  dog.pose = 'sad';
  await sleep(300);

  const Hl = (text: string): Line => ({ who: heroId, name: o.name, state: 'city', text });
  const B = (text: string, state = 'stray'): Line => ({ who: 'biscuit', name: '???', state, text, right: true });
  const feed = async () => {
    await say(Hl('(He looks so hungry…)'), ['Share my sandwich', "Share Grandma's onigiri"]);
    st.bowl = true;
    await sleep(400);
    // il s'approche, plonge la tête dans la gamelle en remuant la queue, puis s'assoit tout content
    dog.pose = 'walk';
    await walk(dog, BOWL_X + 30, 30);
    dog.face = -1; dog.pose = 'eat';
    fx(BOWL_X, GROUND - 26, 'NOM NOM');
    await sleep(1300);
    fx(BOWL_X + 10, GROUND - 34, 'WOUF WOUF');
    await sleep(1300);
    dog.pose = 'happy';
    fx(BOWL_X + 16, GROUND - 30, '♥', '#f6b0b5');
    await sleep(900);
  };

  if (o.night === 1) {
    await talk([Hl('Oh! Hello there… are you lost?'), B("…Grrr. Don't come any closer."), Hl("(I can hear him. He's shivering… and he smells like rain.)")]);
    await feed();
    await talk([B("…It's good.", 'eat'), B("Don't tell anyone I ate from a human's hand.", 'eat')]);
    // il retourne vers le passage en trottinant, puis reste à épier le héros
    dog.pose = 'walk';
    await walk(dog, 382, 60);
    dog.peek = true; dog.pose = 'sad'; dog.face = -1;
    await sleep(500);
    await talk([Hl('Goodnight, little one. See you tomorrow?'), { who: 'narr', text: 'From the dark of the back alley, two blue eyes keep watching you.' }]);
  } else {
    await talk([Hl('You came back! I saved you something.'), B("I wasn't waiting for you. I was… guarding the bins.")]);
    await feed();
    await talk([B("You really can understand me, can't you?", 'eat'), Hl('Since I was little. Do you have a name?'), B('Nobody ever gave me one.', 'eat')]);
    await say(Hl('Then how about…'), [dogName]);
    dog.kind = 'tag';
    fx(BOWL_X + 16, 120, `${dogName.toUpperCase()}!`, '#f3d98f');
    for (let i = 0; i < 3; i++) { fx(BOWL_X + 6 + i * 10, 140 - i * 6, '♥', '#f6b0b5'); await sleep(250); }
    await talk([Hl('And this is for you. I made a little tag with your name on it.')]);
    await talk([{ ...B(`${dogName}… I like it.`, 'named'), name: dogName }, { who: 'narr', text: 'He follows you to the back door and curls up there, one ear still listening.' }]);
    dog.pose = 'walk';
    await walk(dog, 130, 50);
    dog.pose = 'sleep';
    await sleep(1400);
  }
  view.destroy();
}
