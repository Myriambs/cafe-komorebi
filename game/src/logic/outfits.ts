// Tenues achetables : chaque tenue change quelques couleurs (variables CSS) du personnage
export type MouseWho = 'captain' | 'dusty' | 'bubbles' | 'nibbles';
export const CREW: MouseWho[] = ['captain', 'dusty', 'bubbles', 'nibbles'];
export type Who = 'hero' | 'moka' | 'grandma' | 'biscuit' | MouseWho;
export const isMouse = (w: string): w is MouseWho => (CREW as string[]).includes(w);
export interface Outfit { id: string; name: string; price: number; vars: string; swatch: string }

export const NOIR_VARS = '--shirt:#4a4452;--collar:#3d3845;--apron:#36313d;--apronD:#2d2933;--cap:#36313d;--brim:#2d2933;--pants:#36313d;';

export const OUTFITS: Record<Who, Outfit[]> = {
  hero: [
    { id: 'espresso', name: 'Espresso brown', price: 0, vars: '', swatch: '#74513f' },
    { id: 'noir', name: 'Night black', price: 0, vars: NOIR_VARS, swatch: '#36313d' },
    { id: 'matcha', name: 'Matcha green', price: 40, vars: '--apron:#7fa48c;--apronD:#6f957d;--cap:#7fa48c;--brim:#6f957d;--pants:#55635a;', swatch: '#7fa48c' },
    { id: 'sakura', name: 'Sakura pink', price: 60, vars: '--apron:#e9a2a8;--apronD:#d98a92;--cap:#e9a2a8;--brim:#d98a92;--pants:#6a5560;', swatch: '#e9a2a8' }
  ],
  moka: [
    { id: 'concierge', name: 'Concierge purple', price: 0, vars: '', swatch: '#5d5a8f' },
    { id: 'royal', name: 'Royal blue', price: 35, vars: '--mcoat:#56669a;--mcoatD:#46557f;', swatch: '#56669a' },
    { id: 'blossom', name: 'Blossom pink', price: 45, vars: '--mcoat:#d98a92;--mcoatD:#c47680;', swatch: '#d98a92' }
  ],
  grandma: [
    { id: 'shutter', name: 'Shutter blue', price: 0, vars: '', swatch: '#a7c0dd' },
    { id: 'lavender', name: 'Lavender', price: 25, vars: '--gcard:#c7a6e6;--gcardD:#b08fd0;', swatch: '#c7a6e6' },
    { id: 'sage', name: 'Garden sage', price: 25, vars: '--gcard:#a9c4ae;--gcardD:#93b89f;', swatch: '#a9c4ae' }
  ],
  biscuit: [
    { id: 'red', name: 'Red bandana', price: 0, vars: '', swatch: '#e86a5f' },
    { id: 'sky', name: 'Sky bandana', price: 20, vars: '--bandana:#7fa8d8;', swatch: '#7fa8d8' },
    { id: 'sunflower', name: 'Sunflower bandana', price: 20, vars: '--bandana:#f3c24a;', swatch: '#f3c24a' }
  ],
  // la Crumb Crew : la couleur du costume (--mk) et son ombre (--mkD)
  captain: [
    { id: 'red', name: 'Red scarf', price: 0, vars: '', swatch: '#e86a5f' },
    { id: 'sky', name: 'Sky scarf', price: 12, vars: '--mk:#7fa8d8;--mkD:#5f88b8;', swatch: '#7fa8d8' },
    { id: 'mint', name: 'Mint scarf', price: 12, vars: '--mk:#8fb39a;--mkD:#6f957d;', swatch: '#8fb39a' }
  ],
  dusty: [
    { id: 'cloud', name: 'Cloud hood', price: 0, vars: '', swatch: '#f4eefa' },
    { id: 'lavender', name: 'Lavender hood', price: 12, vars: '--mk:#dccbf2;--mkD:#bba3dc;', swatch: '#dccbf2' },
    { id: 'peach', name: 'Peach hood', price: 12, vars: '--mk:#fbd6c4;--mkD:#e9b29a;', swatch: '#fbd6c4' }
  ],
  bubbles: [
    { id: 'sky', name: 'Sky apron', price: 0, vars: '', swatch: '#7fa8d8' },
    { id: 'coral', name: 'Coral apron', price: 12, vars: '--mk:#ee9c8c;--mkD:#d9886e;', swatch: '#ee9c8c' },
    { id: 'sage', name: 'Sage apron', price: 12, vars: '--mk:#93b89f;--mkD:#7fa48c;', swatch: '#93b89f' }
  ],
  nibbles: [
    { id: 'sunflower', name: 'Sunflower raincoat', price: 0, vars: '', swatch: '#f3c24a' },
    { id: 'pink', name: 'Strawberry raincoat', price: 12, vars: '--mk:#f6b0b5;--mkD:#e08e96;', swatch: '#f6b0b5' },
    { id: 'mint', name: 'Mint raincoat', price: 12, vars: '--mk:#a9d8c4;--mkD:#86bfa8;', swatch: '#a9d8c4' }
  ]
};

export const outfitOf = (who: Who, id: string): Outfit => OUTFITS[who].find(o => o.id === id) ?? OUTFITS[who][0];
export const isFree = (who: Who, id: string) => outfitOf(who, id).price === 0;
