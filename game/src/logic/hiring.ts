// Niveau 6 : on recrute ! L'annonce, les CV, les entretiens (questions qui s'enchaînent selon les réponses) — logique pure
export type Quality = 'kind' | 'coffee' | 'baking' | 'calm' | 'morning' | 'team';
export const QUALITIES: Quality[] = ['kind', 'coffee', 'baking', 'calm', 'morning', 'team'];
export const QUALITY_NAME: Record<Quality, string> = {
  kind: 'Kind with customers', coffee: 'Coffee experience', baking: 'Loves baking', calm: 'Calm under pressure', morning: 'Morning person', team: 'Good team player'
};
export type Pay = 'low' | 'fair' | 'generous';
export const PAY: Record<Pay, { label: string; perHour: number }> = { low: { label: 'Small', perHour: 7 }, fair: { label: 'Fair', perHour: 10 }, generous: { label: 'Generous', perHour: 13 } };
export type Hours = 'part' | 'full';
export const HOURS: Record<Hours, string> = { part: 'Part-time · mornings 7:00–13:00', full: 'Full-time · 7:00–16:00' };
export interface JobPost { qualities: Quality[]; pay: Pay; hours: Hours }

/** Les questions de l'entretien. */
export type QId = 'why' | 'experience' | 'rush' | 'upset' | 'learn' | 'team' | 'mistake' | 'hours' | 'animals';
export const QUESTIONS: Record<QId, string> = {
  why: 'Why do you want to work at Café Komorebi?',
  experience: 'Can you tell me about your experience?',
  rush: 'Ten customers walk in at the same time. What do you do?',
  upset: 'A customer says their latte is cold and gets upset. How do you react?',
  learn: 'Is there something you would like to learn here?',
  team: 'How do you like to work with other people?',
  mistake: 'Tell me about a mistake you made, and what you learned from it.',
  hours: 'Our mornings start at 7:00. Is that okay for you?',
  animals: 'Do you like animals? Our café has a cat, and a dog who visits.'
};
export const FIRST_QUESTIONS: QId[] = ['why', 'experience', 'rush'];
/** Titres courts des questions, pour le tableau des entretiens. */
export const QSHORT: Record<QId, string> = {
  why: 'Why our café?', experience: 'Experience', rush: 'Ten customers at once', upset: 'An upset customer', learn: 'What to learn',
  team: 'Working with others', mistake: 'A mistake', hours: 'Starting at 7:00', animals: 'Animals'
};
/** Le poste de la nouvelle recrue : la station dont elle s'occupe pendant le service. */
export type Role = 'coffee' | 'juice' | 'pastry' | 'tea';
/** Questions qui viennent naturellement après une autre (si la réponse ne propose rien de mieux). */
export const FOLLOW: Record<QId, QId[]> = {
  why: ['learn', 'hours'], experience: ['mistake', 'rush'], rush: ['upset', 'team'], upset: ['mistake', 'team'], learn: ['animals', 'team'],
  team: ['animals', 'mistake'], mistake: ['learn', 'animals'], hours: ['animals', 'rush'], animals: ['team', 'hours']
};
/** Réponse : texte, impression (-2 à +2), petite note pour la réunion du soir, et questions qu'elle appelle. */
export interface Answer { text: string; score: number; note: string; next?: QId[] }

export type CandId = 'yuki' | 'sami' | 'lina' | 'marco' | 'noor' | 'kenji';
export interface Candidate {
  id: CandId; name: string; age: number; g: 'm' | 'f'; v: number; look: 'glasses' | 'beanie' | 'bun' | 'mustache' | 'headband' | 'earring';
  title: string; experience: string[]; traits: Quality[]; quote: string; fun: string;
  /** Salaire en dessous duquel il ou elle négocie au téléphone. */
  wants: Pay;
  /** Ce que pensent les animaux en lisant le CV. */
  react: { who: 'moka' | 'biscuit' | 'captain' | 'dusty' | 'bubbles' | 'nibbles'; text: string };
  /** Avis à la réunion du soir. */
  pets: { moka: string; biscuit: string; crew: string };
  coffee: string;
  answers: Record<QId, Answer>;
  call: string[];
}

export const CANDIDATES: Candidate[] = [
  {
    id: 'yuki', name: 'Yuki', age: 24, g: 'f', v: 1, look: 'glasses', title: 'Barista · 3 years in a Kyoto coffee shop',
    experience: ['Barista, Kyoto (3 years)', 'Latte art class teacher', 'Speaks Japanese & English'], traits: ['coffee', 'calm', 'morning'],
    quote: '"A good cup of coffee can fix a bad morning."', fun: 'Has a cat named Mochi', wants: 'fair',
    react: { who: 'moka', text: 'She has a cat. …Acceptable.' },
    pets: { moka: 'She smelled of cat. A good sign. I approve, a little.', biscuit: 'She was calm and quiet. Nice hands!', crew: 'Not one crumb on the table. Very neat.' },
    coffee: 'Oh, your latte art is a little heart! Thank you.',
    answers: {
      why: { text: 'I moved here to be near my family. When I saw your café, the light through the window felt like home.', score: 1, note: 'loves the café’s cozy feel' },
      experience: { text: 'Three years behind a busy espresso bar in Kyoto. I can steam milk for twenty lattes in a row.', score: 2, note: 'very experienced with coffee', next: ['rush', 'learn'] },
      rush: { text: 'Breathe, smile, and take orders in groups. Drinks with the same milk go together. Nobody waits alone.', score: 2, note: 'calm and organised in a rush', next: ['upset', 'team'] },
      upset: { text: 'I say sorry first, then I make a new one right away. A cold latte is my problem, not theirs.', score: 2, note: 'takes care of upset customers' },
      learn: { text: 'Baking! I can make coffee, but my bread always comes out flat. Could you teach me?', score: 1, note: 'wants to learn baking', next: ['animals', 'team'] },
      team: { text: 'I am quiet, but I always notice when someone needs help, and I help without being asked.', score: 1, note: 'quiet helper in a team' },
      mistake: { text: 'Once I put salt in a whole jar instead of sugar. Now I label everything. Twice.', score: 1, note: 'learns from mistakes (labels everything!)' },
      hours: { text: '7:00 is perfect. I wake up at 5:30 every day, even on holidays.', score: 2, note: 'real morning person' },
      animals: { text: 'I love cats. My cat Mochi sleeps on my keyboard every night.', score: 2, note: 'cat lover' }
    },
    call: ['Hello? …Yes, this is Yuki.', 'Really? You chose me? Oh… thank you so much!', 'I will bring my own milk jug. Is that strange? I am very happy.']
  },
  {
    id: 'sami', name: 'Sami', age: 21, g: 'm', v: 2, look: 'beanie', title: 'Pastry student · loves sweet things',
    experience: ['Pastry school (2nd year)', 'Weekend job at a market crêpe stand', 'Makes cakes for every friend’s birthday'], traits: ['baking', 'team', 'kind'],
    quote: '"Life is short. Eat the cake first!"', fun: 'Laughs very, very loudly', wants: 'low',
    react: { who: 'nibbles', text: 'He makes CAKES! Cakes make crumbs! Love!!' },
    pets: { moka: 'Too loud. My ears are still ringing. …But his cookies were good.', biscuit: 'He laughed so much! I liked him! Wouf!', crew: 'Crumbs everywhere! Wonderful crumbs. We vote YES.' },
    coffee: 'Cookies?! You are the best. Can I have the recipe? Hahaha!',
    answers: {
      why: { text: 'I walk past every morning and the croissants smell amazing. I want to be the one who makes them!', score: 1, note: 'passionate about the bakery', next: ['learn', 'hours'] },
      experience: { text: 'Pastry school, and a crêpe stand at the market. One Saturday I made 300 crêpes. My arms still remember.', score: 1, note: 'pastry school + crêpe stand' },
      rush: { text: 'Honestly? I might panic a little. But I would ask a teammate to take orders while I make drinks.', score: 0, note: 'might panic in a rush, but asks for help', next: ['team', 'mistake'] },
      upset: { text: 'I would make them laugh, then make a new latte. And maybe give them a cookie. Cookies fix everything!', score: 1, note: 'cheers up upset customers' },
      learn: { text: 'Coffee! I only know how to make instant coffee. Please don’t tell anyone.', score: 0, note: 'knows almost nothing about coffee', next: ['team', 'animals'] },
      team: { text: 'I love teams! At school we baked a wedding cake together, five of us. I was the one bringing snacks.', score: 2, note: 'great team spirit' },
      mistake: { text: 'I once forgot a cake in the oven during an exam. Now I set two timers. Three, actually.', score: 1, note: 'learned to use timers' },
      hours: { text: '7:00… in the morning? Okay. Yes. I can do it. I will buy a very loud alarm.', score: -1, note: 'not a morning person' },
      animals: { text: 'Yes! But cats always stare at me like I did something wrong.', score: 1, note: 'likes animals (cats judge him)' }
    },
    call: ['Hellooo? Sami speaking!', 'WAIT. Really?! Hahaha, yes, YES!', 'I will bake a cake for my first day. Is that allowed? It is allowed now.']
  },
  {
    id: 'lina', name: 'Lina', age: 19, g: 'f', v: 2, look: 'bun', title: 'Student · first job, very motivated',
    experience: ['University student (literature)', 'Volunteer at the animal shelter', 'Helped at her aunt’s flower shop'], traits: ['kind', 'morning', 'team'],
    quote: '"I learn fast, and I always say thank you."', fun: 'Volunteers at a dog shelter', wants: 'low',
    react: { who: 'biscuit', text: 'Wouf!! A dog shelter! She is a GOOD person!' },
    pets: { moka: 'She asked about me twice. Polite. Very polite.', biscuit: 'She smelled like twenty dogs. My favourite!', crew: 'She said thank you to the chair. We like her.' },
    coffee: 'For me? Oh, thank you! I was so nervous, this helps a lot.',
    answers: {
      why: { text: 'I read my books here every Sunday. Everyone here is so gentle. I want to be part of that.', score: 1, note: 'a regular who loves the café', next: ['learn', 'animals'] },
      experience: { text: 'This would be my first real job. But I help at the shelter every weekend, and at my aunt’s flower shop.', score: 0, note: 'no café experience yet', next: ['learn', 'mistake'] },
      rush: { text: 'I would greet everyone first, so nobody feels forgotten, then go one by one. And I would ask for help.', score: 1, note: 'makes sure nobody feels forgotten' },
      upset: { text: 'I would listen until they finish, say sorry, and bring a new one. People just want to feel heard.', score: 2, note: 'listens to upset customers' },
      learn: { text: 'Everything! Coffee, baking, latte hearts… I took notes on your menu already. Look!', score: 2, note: 'very eager to learn (took notes!)', next: ['team', 'hours'] },
      team: { text: 'At the shelter we have a big team. I like to do the jobs nobody wants, like cleaning the bowls.', score: 2, note: 'does the jobs nobody wants' },
      mistake: { text: 'I let a puppy out of its pen once. We found him in the kitchen, eating sausages. Now I check every gate twice.', score: 1, note: 'careful since the puppy story' },
      hours: { text: 'Yes! My classes start at 14:00, so mornings are perfect.', score: 2, note: 'mornings fit her classes' },
      animals: { text: 'I love them so much! Is the dog here? Can I say hello later?', score: 2, note: 'loves animals' }
    },
    call: ['H-hello? This is Lina.', 'Me? Really? I… I am going to cry. Happy crying!', 'Thank you for believing in me. I will learn everything, I promise!']
  },
  {
    id: 'marco', name: 'Marco', age: 35, g: 'm', v: 0, look: 'mustache', title: 'Shift manager · 10 years in a big coffee chain',
    experience: ['Shift manager, big coffee chain (10 years)', 'Trained 40 new baristas', 'Fastest espresso in the region'], traits: ['coffee', 'calm'],
    quote: '"Speed is the secret of a good café."', fun: 'Allergic to cats', wants: 'generous',
    react: { who: 'moka', text: 'Allergic to cats?! HISS. Next.' },
    pets: { moka: 'He sneezed every time I walked by. I did it on purpose. No.', biscuit: 'He didn’t look at me. Not even once.', crew: 'Very fast. Too fast. He would find us in a day.' },
    coffee: 'Thanks. I usually drink espresso, standing up. But this is fine.',
    answers: {
      why: { text: 'I want a smaller place. But honestly, I could make this café twice as fast with the right system.', score: 0, note: 'wants to change how the café works', next: ['team', 'upset'] },
      experience: { text: 'Ten years, two hundred cups an hour on a good day. I trained forty baristas.', score: 2, note: 'huge experience, trained 40 baristas', next: ['rush', 'team'] },
      rush: { text: 'Easy. Line them up, no chatting, drinks out in under two minutes. Efficiency.', score: 1, note: 'very fast in a rush (but no chatting)', next: ['upset', 'team'] },
      upset: { text: 'I give them a coupon and move on. You can’t make everyone happy.', score: -1, note: 'a bit cold with upset customers' },
      learn: { text: 'Learn? I think I could teach you a few things, actually.', score: -1, note: 'not very open to learning' },
      team: { text: 'I like clear rules. Everyone knows their job, and nobody does anything else.', score: 0, note: 'likes strict rules' },
      mistake: { text: 'Once I ordered the wrong milk for a whole month. I learned to always double-check orders.', score: 1, note: 'double-checks orders' },
      hours: { text: 'No problem. I usually start at 5:00.', score: 2, note: 'early riser' },
      animals: { text: 'A cat? Ah… I’m allergic. Could the cat stay upstairs?', score: -2, note: 'allergic to cats (Moka noticed)' }
    },
    call: ['Marco speaking.', 'Ah, good choice. You won’t regret it.', 'I’ll bring a few ideas to make things faster. See you tomorrow.']
  },
  {
    id: 'noor', name: 'Noor', age: 27, g: 'f', v: 3, look: 'headband', title: 'Baker · 5 years in a family bakery in Sfax',
    experience: ['Family bakery in Sfax, Tunisia (5 years)', 'Bread, makroudh and croissants', 'Gets up at 4:00 without an alarm'], traits: ['baking', 'morning', 'calm'],
    quote: '"Bread is a way of saying good morning."', fun: 'Bakes bread for her neighbours every Friday', wants: 'fair',
    react: { who: 'captain', text: 'Fresh bread every Friday? This one has a good heart, Crew.' },
    pets: { moka: 'Warm hands. She gave me a tiny piece of chicken from her sandwich. …I am not bribed.', biscuit: 'She scratched behind my ears! The perfect spot!', crew: 'She swept her own crumbs before she left. A professional.' },
    coffee: 'Mint tea is my favourite, but this coffee is lovely. And these cookies are almost as good as my mother’s!',
    answers: {
      why: { text: 'My family had a bakery in Sfax. When I smell your croissants, I miss it. I want to bake for people again.', score: 2, note: 'misses baking for people', next: ['experience', 'learn'] },
      experience: { text: 'Five years in my family’s bakery. Bread at dawn, pastries all morning. I can shape a croissant with my eyes closed.', score: 2, note: 'five years in a bakery', next: ['rush', 'mistake'] },
      rush: { text: 'In Ramadan, the whole town came to our bakery at once. You keep smiling and your hands keep moving.', score: 2, note: 'used to big rushes', next: ['upset', 'team'] },
      upset: { text: 'I would say sorry, make a new one, and bring a little sweet with it. Everyone softens with something sweet.', score: 1, note: 'brings a sweet to upset customers' },
      learn: { text: 'Latte art! I can bake anything, but my milk hearts look like potatoes.', score: 1, note: 'wants to learn latte art', next: ['team', 'animals'] },
      team: { text: 'In a family bakery, everyone helps everyone. My little brother rolled dough, my mother sang. I like that kind of team.', score: 2, note: 'warm, family-style team spirit' },
      mistake: { text: 'I burned forty baguettes once because I was talking too much. Now I talk AND watch the oven.', score: 1, note: 'learned to watch the oven' },
      hours: { text: '7:00? That is late for a baker! I will come at 6:00 and start the dough.', score: 2, note: 'will come early to start the dough' },
      animals: { text: 'Of course. The bakery cat in Sfax slept on the flour sacks every day.', score: 2, note: 'grew up with a bakery cat' }
    },
    call: ['Allo? Noor speaking.', 'Really? Hamdoullah… thank you, thank you!', 'Tomorrow I will bring my mother’s bread. You will taste a little bit of Sfax ♡']
  },
  {
    id: 'kenji', name: 'Kenji', age: 23, g: 'm', v: 1, look: 'earring', title: 'Regional barista champion · very precise',
    experience: ['Regional barista championship (2nd place)', 'Specialty coffee bar (2 years)', 'Owns 7 coffee scales'], traits: ['coffee', 'team'],
    quote: '"Every gram matters."', fun: 'Cannot stand a messy counter', wants: 'generous',
    react: { who: 'bubbles', text: 'Can’t stand mess? Finally, someone who understands me!' },
    pets: { moka: 'He measured my water bowl. In grams. Strange human.', biscuit: 'He was nice, but he moved my ball to "where it belongs".', crew: 'Too tidy! He would clean before WE can. What would we do at night?' },
    coffee: 'Hmm… a little over-extracted. But the cookie is excellent. Thank you.',
    answers: {
      why: { text: 'Your beans are good, but your grinder could be better. I want to help this café make perfect coffee.', score: 0, note: 'wants perfect coffee (criticised the grinder)', next: ['team', 'learn'] },
      experience: { text: 'Second place at the regional championship. I weigh every shot. 18 grams in, 36 out.', score: 2, note: 'coffee champion', next: ['mistake', 'rush'] },
      rush: { text: 'I would keep my station clean and make each drink right. A fast bad coffee is still a bad coffee.', score: 1, note: 'quality first, even in a rush', next: ['upset', 'team'] },
      upset: { text: 'I would ask how they like it, then make it exactly that way. And check the milk temperature: 65°C.', score: 1, note: 'precise with upset customers' },
      learn: { text: 'Baking, maybe. Baking is just chemistry with butter, right?', score: 1, note: 'curious about baking', next: ['animals', 'hours'] },
      team: { text: 'I work well with others, as long as everyone cleans their station.', score: 0, note: 'good teammate if things are tidy' },
      mistake: { text: 'I lost the national final because I was too nervous. I learned that people matter more than points.', score: 2, note: 'learned people matter more than points' },
      hours: { text: '7:00 is fine. I need fifteen minutes to calibrate the grinder first.', score: 1, note: 'fine with mornings' },
      animals: { text: 'I like them. As long as they stay away from the espresso machine.', score: 0, note: 'okay with animals, not near the machine' }
    },
    call: ['Kenji speaking.', 'Oh! Thank you. I was hoping you’d call.', 'I’ll bring my scale. Just one. Okay, two.']
  }
];
export const candById = (id: string) => CANDIDATES.find(c => c.id === id)!;

/** Combien de qualités de l'annonce le CV coche. */
export const matchCount = (c: Candidate, post: JobPost) => c.traits.filter(t => post.qualities.includes(t)).length;

/** Questions proposées après une réponse : celles que la réponse appelle, sinon les suites habituelles, jamais une déjà posée. */
export function nextQuestions(asked: QId[], last: QId, ans: Answer): QId[] {
  const pool = [...(ans.next ?? []), ...FOLLOW[last], ...(Object.keys(QUESTIONS) as QId[])];
  return [...new Set(pool)].filter(q => !asked.includes(q)).slice(0, 2);
}

/** Petit bilan de l'entretien : impression totale et notes, pour la réunion du soir. */
export interface Interview { id: CandId; asked: QId[]; score: number; notes: string[] }
export function interviewOf(id: CandId, asked: QId[]): Interview {
  const c = candById(id);
  return { id, asked, score: asked.reduce((n, q) => n + c.answers[q].score, 0), notes: asked.map(q => c.answers[q].note) };
}
/** Négociation au téléphone si le salaire proposé est plus bas que ce qu'il ou elle espère. */
const PAY_ORDER: Pay[] = ['low', 'fair', 'generous'];
export const needsRaise = (c: Candidate, pay: Pay) => PAY_ORDER.indexOf(pay) < PAY_ORDER.indexOf(c.wants);
