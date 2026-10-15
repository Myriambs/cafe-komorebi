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
import { planFor, LEVEL2_DAY, LEVEL3_DAY, LEVEL4_DAY, LEVEL5_DAY, LEVEL6_DAY, type DayPlan } from './logic/level1';
import { TeaStation, newTeaBench, leilaLetter } from './ui/teaStation';
import { teaNight } from './ui/teaNight';
import { writeJobPost, swipeCVs, pickShortlist, gather, interview, interviewBoard, phoneCall, firstDay, welcomeCard, ROLE_SPOT, type HireCtx } from './ui/hiring';
import { bedroom, member, candidatePortrait } from './ui/hireArt';
import { candById, type Interview, type Role, type Candidate } from './logic/hiring';
import type { Member } from './ui/room';
import { BakeryStation, newBakeBench, crewNote } from './ui/bakeryStation';
import { bakeNight, basketArt, BASKET } from './ui/bakeNight';
import { crewNight } from './ui/crew';
import { CREW, isMouse, type MouseWho } from './logic/outfits';
import { biscuit, grandma, customer } from './art/cast.js';
const customerSvg = (m: Member) => `${customer(m.g, m.v)}${m.extra ?? ''}`;
import { music } from './audio/music';

let ext: Exterior | null = null;
/** Style dessiné d'origine partout (le mode pixel art est désactivé à la demande de l'utilisatrice). */
const pixel = (_on: boolean) => document.body.classList.remove('pixel');
function setExterior(mode: 'morning' | 'sunset' | 'night' | null, autoRotate = false) {
  ext?.dispose(); ext = null;
  if (mode) { ext = createExterior(world(), mode, { autoRotate }); ext.onPick(n => { if (n === 'menu') openMenu(S ? (S.level === 5 ? LEVEL5_DAY.recipes : S.level === 4 ? LEVEL4_DAY.recipes : S.level === 3 ? LEVEL3_DAY.recipes : S.level === 2 ? LEVEL2_DAY.recipes : planFor(S.day).recipes) : undefined); }); }
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
const C = (k: Candidate, text: string, state = 'idle'): Line => ({ name: k.name, text, right: true, svg: candidatePortrait(k, state) });
const persist = () => save(S);

// chemin du héros dans la rue : bout de la rue → trottoir → porte du café
const START: [number, number, number] = [7.4, 0.03, 4.7];
const PATH: [number, number, number][] = [[3.6, 0.03, 4.7], [3.6, 0.15, 2.6], [3.55, 0.15, 0.8]];
const CAT_PATH: [number, number, number][] = [[3.1, 0.03, 4.95], [3.05, 0.15, 2.7], [3.0, 0.15, 1.05]];

let jumped = false;
export async function run() {
  for (;;) {
    clear(); pixel(false);
    setExterior('sunset', true); // écran titre : crépuscule et étoiles filantes
    const saved = load();
    // raccourci de test : ?level=5 lance directement ce niveau (héroïne par défaut), sans écran titre
    const jump = Number(new URLSearchParams(location.search).get('level'));
    if (jump >= 1 && jump <= 6 && !jumped) {
      jumped = true;
      S = newSave('f', 'Hana', 'espresso');
      if (jump > 1) { S.level = jump; S.phase = 'morning'; S.nightsFed = 2; }
      persist();
    } else {
    const choice = await titleScreen(!!saved);
    if (choice === 'continue' && saved) S = saved;
    else {
      const p = await heroSelect(); S = newSave(p.hero, p.name, p.uniform);
      // commencer directement au niveau 2 ou 3 : Biscuit fait déjà partie de l'équipe
      if (p.level > 1) { S.level = p.level; S.phase = 'morning'; S.nightsFed = 2; }
      persist();
    }
    }
    if (S.level === 1) await playLevel1();
    if (S.level === 2) await playLevel2();
    if (S.level === 3) await playLevel3();
    if (S.level === 4) await playLevel4();
    if (S.level === 5) await playLevel5();
    if (S.level === 6) await playLevel6();
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
    next: 'Next: Level 4 · The Bakery opens 🥐', button: 'Start Level 4 ▶'
  });
  S.level = 4; S.day = 1; S.phase = 'morning'; S.stats = newStats(); S.totalServed = 0; persist();
}

/* ---------- Niveau 4 : la boulangerie ---------- */
// Grand-mère confie sa boîte à recettes ; la Crumb Crew a réparé le four pendant la nuit.
async function playLevel4() {
  setHeroName(S.name);
  while (S.phase !== 'done') {
    if (S.phase === 'morning' || S.phase === 'service' || S.phase === 'prologue') {
      await morning(1, LEVEL4_DAY, 'Level 4 · Morning', [
        H('Grandma called last night: "Come early tomorrow, I have something for you!"'),
        H('She sounded so excited… I wonder what it is.')
      ]);
      await bakeryOpening();
      const result = await juiceService(LEVEL4_DAY, 'The <b>bakery</b> is open! Take orders, then tap <b>🥐 Bakery</b> for pastries. Coffee and juice still come from their stations.', undefined, true);
      S.coins = result.coins; S.totalServed += result.served;
      await basketForTheCrew(result.room);
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
          recipes: [], maxSeated: 0, customers: false, grandma: false, juiceOpen: true, bakeryOpen: true, mouseHole: 'door',
          outfitVars: { moka: petVars('moka'), grandma: petVars('grandma'), biscuit: petVars('biscuit') }
        });
        room.onCard = who => openCharCard(who, room);
        room.onMusic = () => openPlayer();
      });
      music.setMood('night');
      await bakeNight({ room, mokaName: S.names.moka, mokaVars: petVars('moka'), varsOf: w => petVars(w), heroName: S.name });
      room.destroy();
      music.setMood('day');
      S.phase = 'done'; persist();
    }
  }
  await levelReport({
    level: 4, name: S.name, served: S.totalServed, coins: S.coins, stats: S.stats,
    gained: [{ id: 'nibbles', state: 'cheer', vars: petVars('nibbles'), name: 'Nibbles, the tiny baker' }],
    next: 'Next: Level 5 · Tea & cakes 🍵', button: 'Start Level 5 ▶'
  });
  S.level = 5; S.day = 1; S.phase = 'morning'; S.stats = newStats(); S.totalServed = 0; persist();
}

/* ---------- Niveau 5 : le salon de thé ---------- */
// Leila, la vieille amie de Grand-mère à Tunis, envoie son coffret de thés et ses notes.
async function playLevel5() {
  setHeroName(S.name);
  while (S.phase !== 'done') {
    if (S.phase === 'morning' || S.phase === 'service' || S.phase === 'prologue') {
      await morning(1, LEVEL5_DAY, 'Level 5 · Morning', [
        H('A big parcel was waiting at the door this morning… covered in stamps from Tunis!'),
        H('It smells like mint and jasmine. Grandma is going to be so happy.')
      ]);
      await teaOpening();
      const result = await juiceService(LEVEL5_DAY, 'The <b>tea room</b> is open! Take orders, then tap <b>🍵 Tea room</b>. Leila\'s notes on the left show how to make each tea.', undefined, true, true);
      S.coins = result.coins; S.totalServed += result.served;
      result.room.tip(null);
      await sleep(600);
      await talk([
        H('Every cup served! Tea really is patience in a cup…', S.uniform),
        H("Tonight I'll leave a tiny tea set on table 2. I wonder who will come ♡", S.uniform)
      ]);
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
          recipes: [], maxSeated: 0, customers: false, grandma: false, juiceOpen: true, bakeryOpen: true, teaOpen: true, mouseHole: 'door',
          outfitVars: { moka: petVars('moka'), grandma: petVars('grandma'), biscuit: petVars('biscuit') }
        });
        room.onCard = who => openCharCard(who, room);
        room.onMusic = () => openPlayer();
      });
      music.setMood('night');
      await teaNight({ room, heroName: S.name, hero: S.hero, heroVars: heroVars(), mokaName: S.names.moka, mokaVars: petVars('moka'), varsOf: w => petVars(w) });
      room.destroy();
      music.setMood('day');
      S.phase = 'done'; persist();
    }
  }
  await levelReport({
    level: 5, name: S.name, served: S.totalServed, coins: S.coins, stats: S.stats, gained: [],
    next: 'Next: Level 6 · Help wanted! Interview and hire a new team member 👋', button: 'Start Level 6 ▶'
  });
  S.level = 6; S.day = 1; S.phase = 'morning'; S.stats = newStats(); S.totalServed = 0; persist();
}

/* ---------- Niveau 6 : on recrute ! ---------- */
// L'annonce le soir dans sa chambre → tri des CV avec les animaux → 3 entretiens → réunion du soir → appel → premier jour.
async function playLevel6() {
  setHeroName(S.name);
  const ctx: HireCtx = {
    hero: S.hero, name: S.name, heroVars: heroVars(), mokaName: S.names.moka, mokaVars: petVars('moka'), dogName: S.names.biscuit, dogVars: petVars('biscuit'),
    grandmaName: S.names.grandma, grandmaVars: petVars('grandma'), varsOf: w => petVars(w)
  };
  const R = (w: typeof CREW[number], text: string, state = 'idle'): Line => ({ who: w, name: PROFILES[w].defaultName, state, text, right: true, vars: petVars(w) });
  const B = (text: string, state = 'wag'): Line => ({ who: 'biscuit', name: S.names.biscuit, state, text, right: true, vars: petVars('biscuit') });
  const cafeRoom = (mode: 'day' | 'night', grandma: false | 'stand' = false) => {
    const r = new Room({
      hero: S.hero, uniform: 'espresso', uniformVars: heroVars(), mode, dog: 'patrol', day: 1, goal: 0, coins: S.coins,
      recipes: [], maxSeated: 0, customers: false, grandma, juiceOpen: true, bakeryOpen: true, teaOpen: true, mouseHole: 'door',
      outfitVars: { moka: petVars('moka'), grandma: petVars('grandma'), biscuit: petVars('biscuit') }
    });
    r.onCard = who => openCharCard(who, r); r.onMusic = () => openPlayer();
    return r;
  };

  // 1. le soir, dans sa chambre : écrire l'annonce
  let bed!: HTMLElement;
  await wipe(() => { clear(); pixel(false); setExterior(null); bed = h(`<div class="screen bedroom">${bedroom(S.hero, '')}</div>`); ui().appendChild(bed); });
  await talk([
    H('Home at last… That "Help wanted" sign was in the café window all day.'),
    H('Time to write a real job post. Where is my laptop… there!')
  ]);
  bed.insertAdjacentHTML('beforeend', '<div class="hint"><span>Tap the <b>laptop</b> on the desk</span></div>');
  await new Promise<void>(r => bed.querySelector('#laptop')!.addEventListener('click', () => r(), { once: true }));
  bed.querySelector('.hint')?.remove();
  const post = await writeJobPost();
  await talk([
    H('Posted! Now we wait and see who answers…'),
    M('(from the bed, eyes closed) Hmph. Did you write "must respect the cat"?', 'sleep'),
    H("…I'll add it next time.")
  ]);

  // 2. le lendemain matin, café fermé : tout le monde autour de l'ordinateur, une douceur chacun
  let room!: Room;
  await wipe(() => { bed.remove(); room = cafeRoom('day'); });
  await talk([NARR('The next morning, before opening. The café is still closed…'), H('Six people applied! Everyone, come and help me choose ♡', S.uniform)]);
  room.setHole('open'); music.sfx('squeak');
  let ungather = await gather(room, ctx);
  room.setHole('door');
  music.sfx('twinkle');
  await talk([
    H(`A sweet for everyone: a fish cookie for ${S.names.moka}, a bone biscuit for ${S.names.biscuit}, lemon cake for the Crew.`, S.uniform),
    R('captain', 'The Crumb Crew, reporting for CV duty! *munch*', 'cheer'),
    B('I will sniff… I mean, READ every one! Wouf!'),
    M('And I will judge. With my mouth full. As always.', 'munch')
  ]);
  const loved = await swipeCVs(post, ctx);
  await talk([H(loved.size ? `${loved.size} CV${loved.size > 1 ? 's' : ''} we loved! Now… only three interviews this afternoon.` : 'Hmm, we did not love any… let\'s choose three anyway!', S.uniform)]);
  const short = await pickShortlist(loved, post);
  const names = short.map(id => candById(id).name);
  await talk([
    H(`I'll call ${names[0]}, ${names[1]} and ${names[2]}!`, S.uniform),
    R('captain', 'Crew! Back in the wall before the guests arrive. Not one squeak!', 'cheer')
  ]);
  room.setHole('open'); await ungather(); await sleep(300); room.setHole('door');

  // 3. l'après-midi : les entretiens (le héros sert café et biscuits)
  await talk([NARR('That afternoon, the café closes early for the interviews.')]);
  const views: Interview[] = [];
  for (let i = 0; i < short.length; i++) {
    views.push(await interview(room, candById(short[i]), ctx, i));
    if (i < short.length - 1) await talk([NARR('A few minutes later, the door bell rings again…')]);
  }
  await room.heroHome();

  // 4. le soir : le tableau des entretiens, avec toute l'équipe autour de la table
  await wipe(() => { room.destroy(); room = cafeRoom('night'); });
  music.setMood('night');
  room.el.querySelector('rect.mn.tint')?.setAttribute('opacity', '.45');
  ungather = await gather(room, ctx);
  await talk([
    NARR('That evening, everyone gathers around the table again, with tea and the last cookies.'),
    H('I pinned everything on a board: each CV, every question, every answer. Let\'s look together.', 'city')
  ]);
  const id = await interviewBoard(views, post);
  const hire = candById(id);
  // 5. le coup de fil, et la journée se termine
  const pay = await phoneCall(hire, post, ctx);
  S.staff = id; persist();
  await talk([R('nibbles', `${hire.name} is coming tomorrow! …They can\'t hear us, right?`, 'cheer'), M('Nobody can hear you. Except one person. Unfortunately.', 'munch')]);
  await ungather();
  await talk([NARR('The lights go out one by one. Tomorrow, the café has a new team member ♡')]);
  music.setMood('day');

  // 6. le lendemain : visite du café avant les clients, choix du poste, et on ouvre ensemble
  await wipe(() => { room.destroy(); room = cafeRoom('day'); });
  const role = await firstDay(room, hire, ctx);
  room.destroy();
  const result = await juiceService(LEVEL6_DAY, `First day with <b>${hire.name}</b>! Every <b>${ROLE_SPOT[role].label}</b> order is theirs. You take care of everything else.`, undefined, true, true, { role, name: hire.name, m: member(hire) });
  S.coins = result.coins; S.totalServed += result.served;
  result.room.tip(null);
  await talk([H(`We did it! ${hire.name}, you were amazing today.`, S.uniform), C(hire, 'Thank you! Same time tomorrow? I can\'t wait ♡', 'coffee')]);
  result.room.destroy();
  S.phase = 'done'; persist();
  await welcomeCard(hire, pay, post, S.name, role, result.served, result.helped);
  await wipe(() => { clear(); pixel(false); });
}

/** Avant d'ouvrir : le coffret de Leila, puis le nouveau coin salon de thé. */
async function teaOpening() {
  let room!: Room;
  await wipe(() => {
    clear();
    room = new Room({
      hero: S.hero, uniform: 'espresso', uniformVars: heroVars(), mode: 'day', dog: 'patrol', day: 1, goal: 0, coins: S.coins,
      recipes: [], maxSeated: 0, customers: false, grandma: 'stand', juiceOpen: true, bakeryOpen: true, mouseHole: 'door',
      outfitVars: { moka: petVars('moka'), grandma: petVars('grandma'), biscuit: petVars('biscuit') }
    });
  });
  await talk([
    G(`Good morning, ${S.name}! Is that… a parcel from Tunis? Oh, I know that handwriting!`),
    G('It is from Leila, my oldest friend. We worked in a little tea house together when we were young.')
  ]);
  await teaChest();
  await talk([
    H('Tins of tea, fresh mint, cardamom… and a whole notebook of tea notes!'),
    G('Then today we open a tea corner. Come, I set it up early this morning.')
  ]);
  let tea!: TeaStation;
  await wipe(() => { room.destroy(); tea = new TeaStation(null, newTeaBench(), undefined, true); tea.extra(leilaLetter()); });
  music.sfx('twinkle');
  await talk([
    H('A real tea room! Tins, a kettle with two temperatures, and cakes!'),
    G('Leila always said: tea is patience in a cup. Too short, it is only hot water. Too long, it turns bitter.'),
    G('And green tea must never meet boiling water… except for her Tunisian mint tea!'),
    H('Mint tea with pine nuts on top? I have to try that.'),
    M('Hmph. As long as nobody puts mint in MY water bowl.'),
    G('I baked a lemon cake and a chocolate cake, and the cookies are waiting for their icing.'),
    G('And if a customer asks for the recipe, tap 📖 in the notes. Everything is written there, for real kitchens too ♡')
  ]);
  await wipe(() => tea.close());
}

/** Le coffret de thé de Leila, en grand. */
function teaChest(): Promise<void> {
  return new Promise(resolve => {
    const tin = (x: number, c: string, d: string) => `<rect x="${x - 26}" y="70" width="52" height="64" rx="5" fill="${c}" stroke="#3b2838" stroke-width="2.5"/><rect x="${x - 29}" y="62" width="58" height="13" rx="4" fill="${d}" stroke="#3b2838" stroke-width="2.5"/><rect x="${x - 17}" y="88" width="34" height="26" rx="4" fill="#fffaf2"/>`;
    const el = h(`<div class="card-wrap"><div class="panel" style="text-align:center;max-width:460px">
      <svg viewBox="0 0 300 200" width="300" height="200" style="display:block;margin:0 auto">
        ${tin(95, '#8fbf8a', '#6f957d')}${tin(150, '#5a4a52', '#3e3238')}${tin(205, '#f2d27a', '#d9a94a')}
        <path d="M30 120 L270 120 L258 186 L42 186Z" fill="#c99a6e" stroke="#3b2838" stroke-width="3" stroke-linejoin="round"/>
        <path d="M30 120 L270 120" stroke="#3b2838" stroke-width="3"/>
        ${[[70, 152], [150, 160], [230, 152]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cy="-9" rx="4" ry="9" fill="#e86a5f" transform="rotate(${a})"/>`).join('')}<circle r="5" fill="#f2c46a"/></g>`).join('')}
        <g transform="translate(250 60) rotate(14)">${[[-8, 0, -40], [4, -8, 0], [12, 4, 40]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="6" fill="#7fc08a" stroke="#3b2838" stroke-width="1.5" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g>
      </svg>
      <h2>Leila's tea chest</h2><p>Three tea tins, fresh mint, cardamom… and a notebook: "Leila's tea notes".</p>
      <div class="row"><button class="btn gold">Open it ♡</button></div></div></div>`);
    ui().appendChild(el);
    music.sfx('twinkle');
    el.querySelector('button')!.addEventListener('click', () => { el.remove(); resolve(); });
  });
}

/** Avant d'ouvrir : Grand-mère offre sa boîte à recettes, puis on découvre la cuisine… déjà réparée par la Crumb Crew. */
async function bakeryOpening() {
  let room!: Room;
  await wipe(() => {
    clear();
    room = new Room({
      hero: S.hero, uniform: 'espresso', uniformVars: heroVars(), mode: 'day', dog: 'patrol', day: 1, goal: 0, coins: S.coins,
      recipes: [], maxSeated: 0, customers: false, grandma: 'stand', juiceOpen: true, mouseHole: 'door',
      outfitVars: { moka: petVars('moka'), grandma: petVars('grandma'), biscuit: petVars('biscuit') }
    });
  });
  await talk([
    G(`Good morning, ${S.name}! Before we open… look what I found in the attic.`),
    G('My old recipe tin. Croissants, melon pan, cinnamon rolls, strawberry shortcake… forty years of mornings.')
  ]);
  await recipeTin();
  await talk([
    H('Grandma… your handwriting! There are little hearts on every card.'),
    G("It's yours now, dear. But the bakery oven has been broken for years. I'm afraid it won't even light."),
    H("Let's go and look anyway!")
  ]);
  let kitchen!: BakeryStation;
  await wipe(() => { room.destroy(); kitchen = new BakeryStation(null, newBakeBench(), undefined, true); kitchen.extra(crewNote()); });
  music.sfx('twinkle');
  await talk([
    H('The kitchen is… spotless? And the oven is already warm!'),
    H('Tiny footprints in the flour… and a little note pinned to the oven.'),
    NARR('"The oven works now! Thank you for the feast. — C.C. 🥐"'),
    H('C.C.… the Crumb Crew! They fixed it during the night ♡'),
    G('C.C.? Who is that, dear?'),
    H('…Just some very small friends.'),
    M('Hmph. They worked until sunrise. Nibbles fell asleep in the flour sack.'),
    G("Well then! The Komorebi Bakery is open again. Let's bake!")
  ]);
  await wipe(() => kitchen.close());
}

/** La boîte à recettes de Grand-mère, en grand. */
function recipeTin(): Promise<void> {
  return new Promise(resolve => {
    const card = (x: number, r: number, t: string) => `<g transform="translate(${x} 70) rotate(${r})"><rect x="-34" y="-46" width="68" height="60" rx="4" fill="#fffaf2" stroke="#7a5a4a" stroke-width="2"/><path d="M-26 -26 H26 M-26 -14 H26 M-26 -2 H18" stroke="#f0c9cf" stroke-width="1.5"/><text x="0" y="-32" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-weight="700" font-size="11" fill="#6e4a3e">${t}</text><text x="20" y="8" font-size="10" fill="#c0666a">♡</text></g>`;
    const el = h(`<div class="card-wrap"><div class="panel" style="text-align:center;max-width:460px">
      <svg viewBox="0 0 300 200" width="300" height="200" style="display:block;margin:0 auto">
        <path d="M40 60 L260 60 L250 180 Q150 196 50 180Z" fill="#7fa8d8" stroke="#3b2838" stroke-width="3" stroke-linejoin="round"/>
        ${card(90, -10, 'Croissant')}${card(150, 0, 'Melon pan')}${card(210, 10, 'Cinnamon')}
        <path d="M40 92 L260 92 L250 180 Q150 196 50 180Z" fill="#7fa8d8" stroke="#3b2838" stroke-width="3" stroke-linejoin="round"/>
        ${[[80, 130], [150, 146], [220, 130], [115, 166], [185, 166]].map(([x, y]) => `<g>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${x}" cy="${y - 8}" rx="5" ry="8" fill="#fffaf2" transform="rotate(${a} ${x} ${y})"/>`).join('')}<circle cx="${x}" cy="${y}" r="4" fill="#f2c46a"/></g>`).join('')}
        <path d="M30 40 L270 40 L262 60 L38 60Z" fill="#9cc0e8" stroke="#3b2838" stroke-width="3" stroke-linejoin="round" transform="rotate(-8 30 60)"/>
      </svg>
      <h2>Grandma's recipe tin</h2><p>Four handwritten cards, a little flour… and a heart on every one.</p>
      <div class="row"><button class="btn gold">Open it ♡</button></div></div></div>`);
    ui().appendChild(el);
    music.sfx('twinkle');
    el.querySelector('button')!.addEventListener('click', () => { el.remove(); resolve(); });
  });
}

/** Dernier client parti : un panier de mini-croissants pour la petite porte de la Crumb Crew. */
async function basketForTheCrew(room: Room) {
  room.tip(null);
  await sleep(600);
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.dataset.y = String(BASKET.y); g.innerHTML = basketArt(BASKET.x, BASKET.y);
  room.$('depth').appendChild(g);
  music.sfx('twinkle');
  await talk([
    H('Phew, every pastry sold! I saved the smallest croissants for someone special…', S.uniform),
    H('A basket by the little door, with a note: "Thank you for fixing the oven ♡"', S.uniform),
    M("Hmph. They'll pretend it was nothing. Then they'll eat every last crumb.")
  ]);
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
async function juiceService(plan: DayPlan, intro: string, setup?: (room: Room) => void, bakery = false, tea = false, helper?: { role: Role; name: string; m: Member }): Promise<{ room: Room; served: number; earned: number; coins: number; helped: number }> {
  const start = S.coins;
  const room = new Room({
    hero: S.hero, uniform: 'espresso', uniformVars: heroVars(), mode: 'day', dog: 'patrol', day: 1, goal: plan.goal, coins: S.coins,
    recipes: plan.recipes, maxSeated: plan.maxSeated, parties: plan.parties, customers: true, grandma: false, juiceOpen: true,
    bakeryOpen: bakery, teaOpen: tea, mouseHole: bakery ? 'door' : undefined,
    outfitVars: { moka: petVars('moka'), grandma: petVars('grandma'), biscuit: petVars('biscuit') }
  });
  room.onCard = who => openCharCard(who, room);
  room.onMusic = () => openPlayer();
  trackStats(room);
  const stock: Stock = { cups: 20, espresso: 20, milk: 16, caramel: 8, cardamom: 10, chocolate: 10 };
  const jstock: JuiceStock = { glasses: 20, orange: 12, apple: 10, lemon: 10, berry: 10, mint: 10, ice: 30, honey: 10, soda: 10 };
  const bench = newBench(), jbench = newJuiceBench(), bbench = newBakeBench();
  const tbench = newTeaBench();
  let station: Station | JuiceStation | BakeryStation | TeaStation | null = null, first = true, firstBake = true, firstTea = true;
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
  room.onBakery = () => {
    if (station) return;
    const bs = new BakeryStation(room, bbench, firstBake ? 'Tap the card of the pastry ordered. Put its ingredients in the bowl, stir, shape it on the board, then take it out of the oven when the needle is <b>golden</b>!' : undefined);
    bs.onFirstServe = () => { if (firstBake) { firstBake = false; bs.showHint(null); } };
    bs.onClose = () => { station = null; room.drawHud(); };
    station = bs;
  };
  room.onTea = () => {
    if (station) return;
    const ts = new TeaStation(room, tbench, firstTea ? 'Read Leila\'s notes (left). Tap a tin, set the kettle, pour, and serve the tea when the needle is <b>just right</b>. Cakes: tap twice to cut a slice.' : undefined);
    ts.onFirstServe = () => { if (firstTea) { firstTea = false; ts.showHint(null); } };
    ts.onClose = () => { station = null; room.drawHud(); };
    station = ts;
  };
  // niveau 6 : la nouvelle recrue s'occupe de toutes les commandes de son poste
  let helped = 0, helpTimer = 0;
  if (helper) {
    const spot = ROLE_SPOT[helper.role];
    const who = room.stageRef.add(`<svg class="nobubble" x="-75" y="-188" width="150" height="195" viewBox="0 0 200 260" data-state="idle" overflow="visible">${customerSvg(helper.m)}</svg>`, spot.x, spot.y, { flipable: true });
    const mine = (c: Cust) => helper.role === 'coffee' ? !c.recipe?.kind : c.recipe?.kind === (helper.role === 'pastry' ? 'pastry' : helper.role);
    helpTimer = window.setInterval(() => {
      const c = room.ordered().find(mine); if (!c) return;
      const r = c.recipe!; room.serve(c.id); helped++;
      music.sfx('bell'); room.fx(who.x, who.y - 210, `${helper.name}: ${r.name} ♡`, '#4f8a6a');
      room.drawHud();
    }, 6500);
  }
  await new Promise<void>(resolve => { room.onEmpty = () => { station?.close(); resolve(); }; });
  clearInterval(helpTimer);
  await sleep(600);
  return { room, served: room.served, earned: room.coins - start, coins: room.coins, helped };
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
