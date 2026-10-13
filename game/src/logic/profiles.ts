// Fiches de personnage (inspirées de characters/caraterper.jpg)
import type { Who } from './outfits';

export interface Profile {
  defaultName: string; fullName: string; role: string; age: string; special: string;
  likes: string[]; dislikes: string[]; personality: [string, string]; history: string;
}

export const PROFILES: Record<Who, Profile> = {
  hero: {
    defaultName: 'Hana', fullName: '', role: 'Café manager · master\'s student', age: '23 years old', special: 'Has talked to animals since childhood',
    likes: ['Lo-fi music', 'Rainy mornings', "Grandma's onigiri", 'Tidy shelves', 'Cats'],
    dislikes: ['Cold coffee', 'Being late', 'Loud alarms', 'Wasted milk', 'Spiders'],
    personality: ['Kind, a bit clumsy', 'Organised, curious'],
    history: 'Graduated in business and moved to Komorebi-chō to study for a master\'s. Helps Grandma run the family café between classes. The gift runs in the family: animals have always talked to them.'
  },
  grandma: {
    defaultName: 'Grandma', fullName: 'Chiyo', role: 'Retired robotics engineer', age: '78 years old', special: 'Her gift is slowly fading',
    likes: ['Old jazz records', 'Green tea', 'Her attic workshop', 'Reading by the window', 'Humming songs'],
    dislikes: ['Rushing', 'Burnt cookies', 'Squeaky hinges', 'Cold hands', 'Goodbyes'],
    personality: ['Warm, stubborn', 'Funny, wise'],
    history: 'Opened the café fifty years ago with her late husband Ichirō, who made the coffee while she built robots in the attic. Her unfinished prototype still waits upstairs. Now she reads by the window and watches the café come back to life.'
  },
  moka: {
    defaultName: 'Moka', fullName: 'Moka, café concierge', role: 'Concierge · seats every customer', age: '6 years old (cat years: 40)', special: 'Always knows a customer\'s favourite seat',
    likes: ['Warm cushions', 'Long naps', 'Fish crackers', 'Secret cuddles', 'Her cap'],
    dislikes: ['Mondays', 'Wet paws', 'The vacuum', 'Being called cute', 'Loud spoons'],
    personality: ['Grumpy, proud', 'Secretly caring'],
    history: 'The hero\'s best friend since childhood. She pretends to be annoyed by everything, but she greets every customer at the door and walks them to their seat in her concierge uniform.'
  },
  biscuit: {
    defaultName: 'Biscuit', fullName: 'Biscuit the husky', role: 'Night guard · takes out the trash', age: 'About 3 years old', special: 'Can smell trouble (and onigiri) from afar',
    likes: ['Onigiri', 'Night patrols', 'His name tag', 'Belly rubs', 'Moonlight'],
    dislikes: ['Thunder', 'Being alone', 'The vacuum', 'Cats who steal cushions', 'Baths'],
    personality: ['Brave (he says)', 'Loyal, sleepy'],
    history: 'A lost husky the hero found by the bins behind the café. Fed for a few nights, he finally trusted them, got his name and a gold tag, and now guards the door every night.'
  },
  captain: {
    defaultName: 'Captain Crumb', fullName: 'Captain Crumb, leader of the Crumb Crew', role: 'Crew leader · sweeps muddy footprints', age: '4 years old (very wise for a mouse)', special: 'Has kept the café secretly tidy since Grandma\'s time',
    likes: ['A perfect sweep', 'Shortbread crumbs', 'Making plans', 'His aviator goggles', 'Moka (shh!)'],
    dislikes: ['Muddy shoes', 'Being late', 'Sticky floors', 'Brooms that shed', 'Mousetraps'],
    personality: ['Serious, brave', 'Soft-hearted leader'],
    history: 'He once flew a paper plane across the café and has worn aviator goggles ever since. He leads the Crumb Crew from their little home behind the bakery wall, and he made the secret deal with Moka years ago: fish crackers for a crumb-free cushion.'
  },
  dusty: {
    defaultName: 'Dusty', fullName: 'Dusty of the Crumb Crew', role: 'Duster · dust bunnies under the furniture', age: '2 years old', special: 'Sneezes at every speck of dust (and still loves dusting)',
    likes: ['Fluffy things', 'Feather dusters', 'Sunbeams', 'Quiet libraries', 'Warm milk'],
    dislikes: ['Pepper', 'Cold drafts', 'Cobwebs', 'Being rushed', 'Sneezing in public'],
    personality: ['Gentle, dreamy', 'A little sneezy'],
    history: 'Wears a cloud hood that Grandma once knitted for a teapot and forgot on a shelf. Dusty takes care of the dust bunnies under the sofa and around the record player… a-a-ACHOO!'
  },
  bubbles: {
    defaultName: 'Bubbles', fullName: 'Bubbles of the Crumb Crew', role: 'Washer · coffee rings and juice spills', age: '3 years old', special: 'Can hum and scrub at the same time',
    likes: ['Soap bubbles', 'Shiny tables', 'Juice days', 'Humming songs', 'Her straw hat'],
    dislikes: ['Sticky juice', 'Coffee rings', 'Cold water', 'Rainy hats', 'Dry sponges'],
    personality: ['Cheerful, chatty', 'Hard-working'],
    history: 'The sunshine of the crew. Bubbles found a doll\'s straw hat in the attic and never took it off. She scrubs every coffee ring and juice spill until the tables shine like the moon.'
  },
  nibbles: {
    defaultName: 'Nibbles', fullName: 'Nibbles, the little one', role: 'Crumb collector · youngest of the crew', age: '6 months old', special: 'Carries a crumb bag twice her size',
    likes: ['Pastry crumbs', 'Her star balloon', 'Moka\'s tail', 'Bedtime stories', 'Yellow things'],
    dislikes: ['Thunder', 'Big brooms', 'Being called small', 'Empty bags', 'Bath time'],
    personality: ['Curious, brave', 'Always hungry'],
    history: 'The youngest of the Crumb Crew, in her yellow raincoat. She collects the pastry crumbs from the tables, and about half of them end up in her cheeks. She thinks Moka is the coolest cat in the world.'
  }
};
