// Déroulé du niveau 1 : titre → prologue → 3 journées (matin, service, nuit) → Biscuit rejoint le café
import { createExterior, type Exterior } from './world/exterior.js';
import { world, ui, wipe, sleep, charImage, h, clear, setHeroName, type CharId } from './ui/dom';
import { say, talk, type Line } from './ui/dialogue';
import { titleScreen, heroSelect } from './ui/title';
import { transformScene } from './ui/transform';
import { Room } from './ui/room';
import { Station, newBench, type Stock } from './ui/station';
import { nightScene, closingScene } from './ui/night';
import { JuiceStation, newJuiceBench, type JuiceStock } from './ui/juiceStation';
import { dayCard, levelReport } from './ui/cards';
import { load, save, newSave, newStats, cleanName, cleanPetName, type SaveData } from './logic/save';
import { outfitOf, type Who } from './logic/outfits';
import type { Cust } from './ui/room';
import { PROFILES } from './logic/profiles';
import { openCard } from './ui/card';
import { openPlayer } from './ui/player';
import { openMenu } from './ui/menuBoard';
import { planFor, LEVEL2_DAY, LEVEL3_DAY, type DayPlan } from './logic/level1';
import { crewNight } from './ui/crew';
import { CREW, isMouse, type MouseWho } from './logic/outfits';
import { biscuit, grandma } from './art/cast.js';
import { music } from './audio/music';

let ext: Exterior | null = null;
/** Style dessiné d'origine partout (le mode pixel art est désactivé à la demande de l'utilisatrice). */
const pixel = (_on: boolean) => document.body.classList.remove('pixel');
function setExterior(mode: 'morning' | 'sunset' | 'night' | null, autoRotate = false) {
  ext?.dispose(); ext = null;
  if (mode) { ext = createExterior(world(), mode, { autoRotate }); ext.onPick(n => { if (n === 'menu') openMenu(S ? (S.level === 3 ? LEVEL3_DAY.recipes : S.level === 2 ? LEVEL2_DAY.recipes : planFor(S.day).recipes) : undefined); }); }
  return ext;
}

let S: SaveData;
const heroId = (): CharId => (S.hero === 'f' ? 'heroF' : 'heroM');
const heroVars = () => outfitOf('hero', S.uniform).vars;
const petVars = (w: Exclude<Who, 'hero'>) => outfitOf(w, S.outfits[w]).vars;
const H = (text: string, state = 'city'): Line => ({ who: heroId(), name: S.name, state: state === 'city' ? 'city' : 'espresso', text, vars: state === 'city' ? '' : heroVars() });
const M = (text: string, state = 'idle'): Line => ({ who: 'moka', name: S.names.moka, state, text, right: true, vars: petVars('moka') });
const G = (text: string, state = 'tea'): Line => ({ who: 'grandma', name: S.names.grandma, state, text, right: true, vars: petVars('grandma') });
const NARR = (text: string): Line => ({ who: 'narr', text });
const persist = () => save(S);

// chemin du héros dans la rue : bout de la rue → trottoir → porte du café
const START: [number, number, number] = [7.4, 0.03, 4.7];
const PATH: [number, number, number][] = [[3.6, 0.03, 4.7], [3.6, 0.15, 2.6], [3.55, 0.15, 0.8]];
const CAT_PATH: [number, number, number][] = [[3.1, 0.03, 4.95], [3.05, 0.15, 2.7], [3.0, 0.15, 1.05]];

export async function run() {
  for (;;) {
    clear(); pixel(false);
    setExterior('sunset', true); // écran titre : crépuscule et étoiles filantes
    const saved = load();
    const choice = await titleScreen(!!saved);
    if (choice === 'continue' && saved) S = saved;
    else {
      const p = await heroSelect(); S = newSave(p.hero, p.name, p.uniform);
      // commencer directement au niveau 2 ou 3 : Biscuit fait déjà partie de l'équipe
      if (p.level > 1) { S.level = p.level; S.phase = 'morning'; S.nightsFed = 2; }
      persist();
    }
    if (S.level === 1) await playLevel1();
    if (S.level === 2) await playLevel2();
    if (S.level === 3) await playLevel3();
  }
}

async function playLevel1() {
  setHeroName(S.name);
  if (S.phase === 'prologue') { await prologue(); S.phase = 'morning'; persist(); }
  while (S.phase !== 'done') {
    if (S.phase === 'morning' || S.phase === 'service') {
      await morning(S.day);
      const result = await service(S.day);
      S.coins = result.coins; S.totalServed += result.served;
      if (S.day === 3) { await biscuitJoins(result.room); S.phase = 'done'; persist(); break; }
      result.room.destroy();
      await dayCard(S.day, result.served, result.earned, S.coins, 'Close the café for the night');
      S.phase = 'night'; persist();
    }
    if (S.phase === 'night') {
      await wipe(() => { clear(); setExterior(null); pixel(true); });
      music.setMood('night');
      await nightScene({ hero: S.hero, night: S.day as 1 | 2, name: S.name, dogName: S.names.biscuit });
      music.setMood('day');
      S.nightsFed = Math.min(2, S.nightsFed + 1);
      S.day++; S.phase = 'morning'; persist();
    }
  }
  // bilan du niveau 1, puis on passe au niveau 2 (bar à jus)
  await levelReport({
    level: 1, name: S.name, served: S.totalServed, coins: S.coins, stats: S.stats,
    gained: [{ id: 'moka', state: 'cuddle', vars: petVars('moka'), name: S.names.moka }, { id: 'biscuit', state: 'idle', vars: petVars('biscuit'), name: S.names.biscuit }],
    next: 'Next: Level 2 · The juice bar opens! 🍊', button: 'Start Level 2 ▶'
  });
  S.level = 2; S.day = 1; S.phase = 'morning'; S.stats = newStats(); S.totalServed = 0; persist();
}

/* ---------- Niveau 2 : le bar à jus ---------- */
async function playLevel2() {
  setHeroName(S.name);
  while (S.phase !== 'done') {
    if (S.phase === 'morning' || S.phase === 'service' || S.phase === 'prologue') {
      await morning(1, LEVEL2_DAY, 'Level 2 · Morning', [
        H('The juice bar opens today! Grandma left me her old fruit recipes.'),
        H(`${S.names.biscuit} and ${S.names.moka} are already waiting inside. Let's go!`)
      ]);
      const result = await juiceService(LEVEL2_DAY, 'The <b>juice bar</b> is open! Take orders, then tap <b>🍊 Juice bar</b>: put a fruit in the press, press it into a glass, and add what the ticket says.');
      S.coins = result.coins; S.totalServed += result.served;
      // le dernier client parti, la salle est calme… et la porte secrète s'entrouvre une seconde
      result.room.tip(null);
      await sleep(500);
      await result.room.doorPeek();
      await talk([NARR('In the quiet café, something near the floor creaks… then all is still again.')]);
      result.room.destroy();
      await dayCard(1, result.served, result.earned, S.coins, 'Close up for the night');
      S.phase = 'night'; persist();
    }
    if (S.phase === 'night') {
      await wipe(() => { clear(); setExterior(null); });
      music.setMood('night');
      await closingScene({ hero: S.hero, name: S.name, dogName: S.names.biscuit, mokaName: S.names.moka, dogVars: petVars('biscuit'), mokaVars: petVars('moka') });
      music.setMood('day');
      S.phase = 'done'; persist();
    }
  }
  await levelReport({
    level: 2, name: S.name, served: S.totalServed, coins: S.coins, stats: S.stats, gained: [],
    next: 'Next: Level 3 · Who is cleaning the café at night? 🐭', button: 'Start Level 3 ▶'
  });
  S.level = 3; S.day = 1; S.phase = 'morning'; S.stats = newStats(); S.totalServed = 0; persist();
}

/* ---------- Niveau 3 : la Crumb Crew ---------- */
// tables utilisées et tables où l'on a lu pendant la journée (pour le désordre de la nuit)
let dayMess: { used: number[]; read: number[] } = { used: [], read: [] };
async function playLevel3() {
  setHeroName(S.name);
  while (S.phase !== 'done') {
    if (S.phase === 'morning' || S.phase === 'service' || S.phase === 'prologue') {
      await morning(1, LEVEL3_DAY, 'Level 3 · Morning', [
        H('Last night, after closing, I was sure something creaked down near the wall…'),
        H('Probably just the old building. Anyway, the whole town wants coffee AND juice today!'),
        H(`${S.names.moka} keeps glancing at the right wall. Hmm…`)
      ]);
      dayMess = { used: [], read: [] };
      const result = await juiceService(LEVEL3_DAY, 'Rush day! Groups of friends want coffee <b>and</b> juice. Serve everyone, then we close. (So many cups and crumbs…)', room => {
        const order = room.onOrder, book = room.onBook;
        room.onOrder = (c: Cust) => { dayMess.used.push(c.table); order?.(c); };
        room.onBook = (c: Cust) => { dayMess.read.push(c.table); book?.(c); };
      });
      // le dernier client est parti : la Crumb Crew croit que c'est fini… surprise !
      await doorSurprise(result.room);
      S.coins = result.coins; S.totalServed += result.served;
      result.room.destroy();
      await dayCard(1, result.served, result.earned, S.coins, 'Close up for the night');
      S.phase = 'night'; persist();
    }
    if (S.phase === 'night') {
      let room!: Room;
      await wipe(() => {
        clear(); setExterior(null);
        room = new Room({
          hero: S.hero, uniform: 'espresso', uniformVars: heroVars(), mode: 'night', dog: 'patrol', day: 1, goal: 0, coins: S.coins,
          recipes: [], maxSeated: 0, customers: false, grandma: false, juiceOpen: true,
          outfitVars: { moka: petVars('moka'), grandma: petVars('grandma'), biscuit: petVars('biscuit') }
        });
        room.onCard = who => openCharCard(who, room);
        room.onMusic = () => openPlayer();
      });
      music.setMood('night');
      await crewNight({
        room, hero: S.hero, name: S.name, heroVars: heroVars(), mokaName: S.names.moka, mokaVars: petVars('moka'),
        varsOf: w => petVars(w), used: dayMess.used, read: dayMess.read, juice: true,
        dogName: S.names.biscuit, dogVars: petVars('biscuit'),
        openCard: w => openCharCard(w, room)
      });
      S.coins = room.coins;
      room.destroy();
      music.setMood('day');
      S.phase = 'done'; persist();
    }
  }
  await levelReport({
    level: 3, name: S.name, served: S.totalServed, coins: S.coins, stats: S.stats,
    gained: CREW.map(w => ({ id: w, state: 'cheer', vars: petVars(w), name: PROFILES[w].defaultName })),
    next: 'Next: Level 4 · The Bakery opens 🥐 (coming soon)', button: 'Back to the title'
  });
  await wipe(() => { clear(); pixel(false); });
}

/** Niveau 3, juste après le départ du dernier client : une souris pousse la porte secrète, croyant le café vide,
 * voit le héros, prend peur et rentre en courant. Moka détourne la tête et se plante devant le mur. */
async function doorSurprise(room: Room) {
  room.tip(null);
  await sleep(700);
  await room.withMoka(async () => {
    await room.mouseDash();
    await talk([H('…Huh?! A mouse just peeked out of a tiny door in the wall… and ran back in!', S.uniform)]);
    const g = room.doorGuard;
    await room.walkMoka(g.x, g.y, [{ x: g.x - 60, y: g.y + 50 }]);
    room.setMoka('snub');
    await sleep(1600);
    await talk([H(`(${S.names.moka} turned her head away and sat right in front of it.) …I'll find out tonight.`, S.uniform)]);
  });
}

/** Statistiques du niveau (boissons servies, livres prêtés, pourboires). */
function trackStats(room: Room) {
  room.onDrink = (r, o) => { S.stats.drinks[r.id] = (S.stats.drinks[r.id] ?? 0) + 1; if (o === 'delighted') S.stats.delighted++; };
  room.onBook = () => { S.stats.books++; };
  room.onTip = n => { S.stats.tips += n; };
}

/** Une journée café + bar à jus (niveaux 2 et 3). `setup` ajoute les règles propres au niveau. */
async function juiceService(plan: DayPlan, intro: string, setup?: (room: Room) => void): Promise<{ room: Room; served: number; earned: number; coins: number }> {
  const start = S.coins;
  const room = new Room({
    hero: S.hero, uniform: 'espresso', uniformVars: heroVars(), mode: 'day', dog: 'patrol', day: 1, goal: plan.goal, coins: S.coins,
    recipes: plan.recipes, maxSeated: plan.maxSeated, parties: plan.parties, customers: true, grandma: false, juiceOpen: true,
    outfitVars: { moka: petVars('moka'), grandma: petVars('grandma'), biscuit: petVars('biscuit') }
  });
  room.onCard = who => openCharCard(who, room);
  room.onMusic = () => openPlayer();
  trackStats(room);
  const stock: Stock = { cups: 20, espresso: 20, milk: 16, caramel: 8, cardamom: 10, chocolate: 10 };
  const jstock: JuiceStock = { glasses: 20, orange: 12, apple: 10, lemon: 10, berry: 10, mint: 10, ice: 30, honey: 10, soda: 10 };
  const bench = newBench(), jbench = newJuiceBench();
  let station: Station | JuiceStation | null = null, first = true;
  setup?.(room);
  room.tip(intro);
  setTimeout(() => room.tip(null), 9000);
  room.onStation = () => {
    if (station) return;
    station = new Station(room, stock, true, undefined, bench);
    station.onClose = () => { station = null; room.drawHud(); };
  };
  room.onJuice = () => {
    if (station) return;
    const js = new JuiceStation(room, jstock, jbench, first ? 'Tap a fruit crate, then the press. Add ice, mint, honey or sparkling water, then ring the bell.' : undefined);
    js.onFirstServe = () => { if (first) { first = false; js.showHint(null); } };
    js.onClose = () => { station = null; room.drawHud(); };
    station = js;
  };
  await new Promise<void>(resolve => { room.onEmpty = () => { station?.close(); resolve(); }; });
  await sleep(600);
  return { room, served: room.served, earned: room.coins - start, coins: room.coins };
}

/* ---------- Prologue ---------- */
async function prologue() {
  await wipe(() => { clear(); setExterior('sunset'); });
  const e = ext!;
  const hero = e.addChar(S.hero === 'f' ? 'heroF' : 'heroM', { x: START[0], z: START[2], ry: -Math.PI / 2 });
  const cat = e.addChar('moka', { x: START[0] + 0.6, z: START[2] + 0.3, ry: -Math.PI / 2 });
  await talk([NARR('Komorebi-chō. The last stop of a sleepy little train line, where the leaves turn gold every autumn.')]);
  e.focus([4.2, 1.0, 2.6], 15, 3.2);
  await Promise.all([e.walkChar(hero, PATH, 1.25), sleep(350).then(() => e.walkChar(cat, CAT_PATH, 1.3))]);
  e.faceTo(hero, 0); e.faceTo(cat, -0.4);
  await talk([
    H("Grandma's café… it hasn't changed at all."),
    M('Hmph. Can we go in now? My paws are cold.'),
    H("(I've understood animals since I was little. Moka never lets me forget it.)"),
    M('I heard that.')
  ]);
  let room!: Room;
  await wipe(() => {
    clear(); setExterior(null); pixel(true);
    room = new Room({ hero: S.hero, uniform: 'espresso', mode: 'sunset', dog: 'none', day: 0, goal: 0, coins: S.coins, recipes: [], maxSeated: 0, customers: false, grandma: 'stand', outfitVars: { moka: petVars('moka'), grandma: petVars('grandma') } });
    (room.$('heroSvg') as SVGElement).setAttribute('data-state', 'city');
  });
  await talk([
    G(`${S.name}! You came all this way! Look at you, a real graduate.`),
    H("I'm starting my master's here this autumn. And… I want to help you with the café."),
    G("My hands aren't what they used to be. And the animals… I can barely hear them anymore. They stopped coming."),
    M('She means me too. I am right here, you know.'),
    G('Ah, I heard that one, Moka.'),
    G("Tomorrow morning, open the café with me. I'll show you everything.")
  ]);
  room.destroy();
}

/* ---------- Matin : la marche vers le café ---------- */
async function morning(day: number, plan: DayPlan = planFor(day), label = `Day ${day} · Morning`, intro?: Line[]) {
  await wipe(() => { clear(); pixel(false); setExterior('morning'); });
  const e = ext!;
  const hero = e.addChar(S.hero === 'f' ? 'heroF' : 'heroM', { x: START[0], z: START[2], ry: -Math.PI / 2 });
  const dog = plan.dogMorning === 'none' ? null : e.addChar('biscuit', { x: 4.25, z: 1.0, ry: 0.3, named: plan.dogMorning === 'sleeping', sleeping: plan.dogMorning === 'sleeping' });
  const banner = h(`<div class="banner">${label}</div>`);
  const hint = h(`<div class="hint"><span>Use the <b>arrow keys</b> to walk to the café, scroll to zoom, or</span> <button class="btn">Walk to the café</button></div>`);
  ui().append(banner, hint);
  // les flèches pilotent le héros jusqu'au trottoir du café
  const keys = { up: false, down: false, left: false, right: false };
  const KEYMAP: Record<string, keyof typeof keys> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  const drive: { stop?: () => void } = {};
  const onKey = (down: boolean) => (ev: KeyboardEvent) => {
    const k = KEYMAP[ev.key]; if (!k) return;
    ev.preventDefault(); keys[k] = down;
    if (down && !drive.stop) drive.stop = e.driveChar(hero, keys);
  };
  const kd = onKey(true), ku = onKey(false);
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  await new Promise<void>(resolve => {
    const off = e.onZoomIn(e.fitDist() * 0.72, () => resolve());
    hint.querySelector('button')!.addEventListener('click', () => { off(); resolve(); });
    const near = setInterval(() => {
      const p = hero.root.position, dx = p.x - PATH[1][0], dz = p.z - PATH[1][2];
      if (Math.hypot(dx, dz) < 0.9) { clearInterval(near); off(); resolve(); }
    }, 100);
  });
  removeEventListener('keydown', kd); removeEventListener('keyup', ku); drive.stop?.();
  hint.remove();
  e.focus([4.2, 1.0, 2.6], 15, 2.6);
  await e.walkChar(hero, drive.stop ? [PATH[1]] : PATH.slice(0, 2), 1.3);
  e.faceTo(hero, Math.PI * 0.9);
  if (intro) await talk(intro);
  else if (day === 1) await talk([H('First day at the café. Breathe… Grandma is waiting.')]);
  if (!intro && day === 2 && dog) {
    await talk([H('Wait… the husky from last night! He was sitting by the door.')]);
    e.walkChar(dog, [[5.7, 0.15, 1.2], [5.75, 0.15, -2.4], [5.6, 0.15, -5.6]], 2.6).then(() => dog.dispose());
    await sleep(700);
    await talk([H("…And he's gone again. He's still shy.")]);
  }
  if (!intro && day === 3 && dog) await talk([H("He's asleep by the door. He trusts us a little more every day.")]);
  await e.walkChar(hero, PATH.slice(2), 1.2);
  await sleep(200);
  banner.remove();
  await wipe(() => { clear(); setExterior(null); });
  await transformScene({ hero: S.hero, name: S.name, vars: heroVars(), full: !S.seenTransform });
  S.seenTransform = true; S.phase = 'service'; persist();
  pixel(true);
}

/* ---------- Service ---------- */
async function service(day: number): Promise<{ room: Room; served: number; earned: number; coins: number }> {
  const plan = planFor(day);
  const start = S.coins;
  const room = new Room({
    hero: S.hero, uniform: 'espresso', uniformVars: heroVars(), mode: 'day', dog: day === 1 ? 'none' : day === 2 ? 'stray' : 'straysleep',
    day, goal: plan.goal, coins: S.coins, recipes: plan.recipes, maxSeated: plan.maxSeated, parties: plan.parties, customers: true,
    outfitVars: { moka: petVars('moka'), grandma: petVars('grandma'), biscuit: petVars('biscuit') }, grandma: false
  });
  room.onCard = who => openCharCard(who, room);
  room.onMusic = () => openPlayer();
  trackStats(room);
  const stock: Stock = { cups: 20, espresso: 20, milk: 16, caramel: 8, cardamom: 10, chocolate: 10 };
  const bench = newBench();
  const tut = day === 1;
  let station: Station | null = null, firstArrive = tut, firstOrder = tut, firstServe = tut;
  const tips: Record<number, string> = {
    1: `Good morning, ${S.name}! When a customer comes in, ${S.names.moka} shows them to a seat. Tap anyone to see their card. We also serve my <b>Arabic coffee</b>: espresso, hot water and cardamom!`,
    2: 'New today: <b>cappuccino</b>, <b>mocha</b> and <b>hot chocolate</b> (the chocolate jar is on the shelf), and friends who come in pairs. One drink per person!',
    3: 'I found my old <b>caramel syrup</b>! Caramel latte: espresso, milk and caramel. And try my <b>cardamom latte</b>! Busy day: groups of three!'
  };
  room.tip(tips[day]);
  setTimeout(() => { if (!tut) room.tip(null); }, 6000);
  room.onArrive = () => { if (firstArrive) { firstArrive = false; room.tip('Click the <b>?</b> bubble above the customer to take their order.'); } };
  room.onOrder = () => { if (firstOrder) { firstOrder = false; room.tip('Now open the <b>coffee station</b> (bottom right) and make their drink.'); } };
  room.onStation = () => {
    if (station) return;
    station = new Station(room, stock, plan.recipes.includes('caramel'), firstServe ? 'Tap the grinder, then the espresso machine. Add what the ticket says, then ring the bell to serve.' : undefined, bench);
    station.onFirstServe = () => { if (firstServe) { firstServe = false; station?.showHint(null); room.tip('Wonderful! Every happy customer counts. Take the next order when you are ready.'); setTimeout(() => room.tip(null), 5000); } };
    station.onClose = () => { station = null; room.drawHud(); };
  };
  await new Promise<void>(resolve => { room.onEmpty = () => { station?.close(); resolve(); }; });
  await sleep(600);
  return { room, served: room.served, earned: room.coins - start, coins: room.coins };
}

/* ---------- Jour 3 : Biscuit rejoint l'équipe ---------- */
async function biscuitJoins(room: Room) {
  room.tip(null);
  room.setDog('none');
  // Grand-mère vient se placer à côté du héros, derrière le comptoir
  room.$('behind').innerHTML = `<g class="popin hit" data-act="card" data-who="grandma"><svg x="236" y="232" width="150" height="195" viewBox="0 0 200 260" data-state="tea" style="${petVars('grandma')}" overflow="visible">${grandma()}</svg></g>`;
  await sleep(700);
  await talk([NARR('The door bell rings. No customer this time…')]);
  // Biscuit entre et s'assoit près du coussin de Moka (pas sur une chaise)
  room.$('extra').innerHTML = `<g class="popin"><svg id="dogIn" x="1146" y="318" width="140" height="182" viewBox="0 0 200 260" data-state="named" style="${petVars('biscuit')}" overflow="visible">${biscuit()}</svg></g>`;
  music.sfx('bell');
  const dogSvg = () => room.$('dogIn') as SVGElement;
  const B = (text: string, state = 'named'): Line => ({ who: 'biscuit', name: S.names.biscuit, state, text, right: true, vars: petVars('biscuit') });
  await sleep(500);
  await talk([
    B(`${S.name}. I've watched you all week. You feed everyone… even a stray like me.`),
    B("Let me guard this place at night. And I can take out the trash. I'm very good with bins."),
    H('Welcome to the team, Biscuit!', S.uniform),
    G("Oh my… I haven't seen an animal walk in here in years."),
    G('This was our old café dog\'s bandana. There, with your name tag. It suits you.')
  ]);
  dogSvg().setAttribute('data-state', 'idle');
  await sleep(500);
  await talk([
    B('A real bandana… I belong somewhere now.', 'idle'),
    M("Hmph. He can stay. As long as he doesn't take my cushion."),
    G(`The animals are coming back… This café was waiting for someone who can hear it. From now on, it's yours, ${S.name}.`)
  ]);
  room.destroy();
}

/* ---------- Carte de personnage (clic sur un personnage dans la salle) ---------- */
function openCharCard(who: Who, room?: Room): Promise<void> {
  const buy = (price: number) => {
    const have = room ? room.coins : S.coins;
    if (have < price) return false;
    if (room) { room.coins -= price; room.drawHud(); } else S.coins -= price;
    music.sfx('cash'); persist(); return true;
  };
  if (isMouse(who)) return openMouseCard(who, room, buy);
  // au niveau 1, Biscuit est encore un chien perdu (jusqu'au jour 3) ; ensuite il fait partie du café
  const dogLocked = who === 'biscuit' && S.level === 1 && S.day < 3 && S.phase !== 'done';
  const dogState = S.level > 1 || S.phase === 'done' ? 'idle' : 'named';
  const state = { hero: 'espresso', moka: 'idle', grandma: 'read', biscuit: dogLocked ? 'stray' : dogState }[who];
  const vars = who === 'hero' ? heroVars() : petVars(who);
  return openCard({
    who, charId: who === 'hero' ? heroId() : who, state, vars, locked: dogLocked,
    name: who === 'hero' ? S.name : S.names[who],
    equipped: who === 'hero' ? S.uniform : S.outfits[who], owned: S.owned,
    coins: () => room ? room.coins : S.coins,
    onRename: n => {
      if (who === 'hero') {
        const c = cleanName(n, S.hero); S.name = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(); setHeroName(S.name);
        room?.$('heroSvg').querySelectorAll('.brooch-name').forEach(t => t.textContent = S.name.toUpperCase());
        persist(); return S.name;
      }
      S.names[who] = cleanPetName(n, PROFILES[who].defaultName); persist(); return S.names[who];
    },
    onBuy: (_id, price) => buy(price),
    onUnlock: () => persist(),
    onWear: id => {
      if (who === 'hero') S.uniform = id; else S.outfits[who] = id;
      persist(); music.sfx('transform');
      const v = outfitOf(who, id).vars; room?.restyle(who, v); return v;
    },
    onCuddle: who === 'moka' && room ? () => room.cuddleMoka() : undefined
  });
}

/** Carte d'une souris de la Crumb Crew : pas de changement de nom, seulement la couleur du costume. */
function openMouseCard(who: MouseWho, room: Room | undefined, buy: (price: number) => boolean) {
  return openCard({
    who, charId: who, state: 'idle', vars: petVars(who), name: PROFILES[who].defaultName, fixedName: true,
    equipped: S.outfits[who], owned: S.owned, coins: () => room ? room.coins : S.coins,
    onRename: () => PROFILES[who].defaultName,
    onBuy: (_id, price) => buy(price),
    onWear: id => { S.outfits[who] = id; persist(); music.sfx('twinkle'); return outfitOf(who, id).vars; }
  });
}

void say; void charImage;
