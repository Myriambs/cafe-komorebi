// Les livres et magazines de la bibliothèque du café : couverture (titre, couleur, petit dessin)
// et ce que les clients en disent pendant leur lecture.
export type BookIcon = 'moon' | 'glass' | 'paw' | 'heart' | 'leaf' | 'star' | 'drop' | 'bun' | 'cup' | 'plant' | 'flower' | 'scarf' | 'atom';
export interface Book {
  id: string; kind: 'book' | 'magazine';
  /** Titre sur la couverture (deux lignes max, séparées par « | »). */
  title: string; genre: string; color: string; ink: string; icon: BookIcon;
  quotes: string[];
}

export const BOOKS: Book[] = [
  { id: 'fantasy', kind: 'book', title: "Dragon's|Tea", genre: 'Fantasy', color: '#6f5aa8', ink: '#fdf1dd', icon: 'moon',
    quotes: ["I didn't know fantasy books were this good!", 'A dragon who runs a tea shop… I love him.'] },
  { id: 'crime', kind: 'book', title: 'The Last|Crumb', genre: 'Crime', color: '#3f4a6a', ink: '#f2c46a', icon: 'glass',
    quotes: ['The baker did it… I knew it!', "Crime novels are so exciting! Who's next?"] },
  { id: 'cats', kind: 'book', title: 'Why|Cats?', genre: 'Animals', color: '#f2c46a', ink: '#6e4a3e', icon: 'paw',
    quotes: ["I didn't know cats were as lovely as dogs. It changed my mind!", 'Cats purr to heal themselves? Wow.'] },
  { id: 'romance', kind: 'book', title: 'Autumn|Letters', genre: 'Romance', color: '#e9a2a8', ink: '#6e4a3e', icon: 'heart',
    quotes: ['Aww, they finally met again ♡', "I'm not crying, it's the coffee steam."] },
  { id: 'travel', kind: 'book', title: 'Kyoto|on Foot', genre: 'Travel', color: '#7fae8c', ink: '#fdf1dd', icon: 'leaf',
    quotes: ['I want to visit Kyoto now!', 'Little trains through the mountains… dreamy.'] },
  { id: 'scifi', kind: 'book', title: 'Robot|Hearts', genre: 'Sci-fi', color: '#5f88b8', ink: '#fdf1dd', icon: 'star',
    quotes: ['Robots with feelings? I never thought I would like sci-fi!', 'A café on the moon… I want to go.'] },
  { id: 'poetry', kind: 'book', title: 'Small|Rain', genre: 'Poetry', color: '#c7a6e6', ink: '#4c3a66', icon: 'drop',
    quotes: ['Such gentle words…', 'This poem sounds like rain on a window.'] },
  { id: 'baking', kind: 'book', title: "Grandma's|Bakes", genre: 'Cooking', color: '#e8a24a', ink: '#fffaf2', icon: 'bun',
    quotes: ["I'm baking this tonight!", 'Cardamom buns… adding that to my list.'] },
  { id: 'cafemag', kind: 'magazine', title: 'CAFÉ', genre: 'Magazine', color: '#e86a5f', ink: '#fffaf2', icon: 'cup',
    quotes: ['A latte art contest? I want to try!', 'Ten cozy cafés… this one should be number one.'] },
  { id: 'home', kind: 'magazine', title: 'COZY', genre: 'Home', color: '#8fb39a', ink: '#fffaf2', icon: 'plant',
    quotes: ['Plants everywhere… I love it!', 'Reading nook ideas, yes please.'] },
  { id: 'garden', kind: 'magazine', title: 'GARDEN', genre: 'Garden', color: '#9cc96f', ink: '#3f5a2a', icon: 'flower',
    quotes: ['Tomatoes on a balcony? Yes!', "I'll plant sunflowers this spring."] },
  { id: 'style', kind: 'magazine', title: 'STYLE', genre: 'Fashion', color: '#f2a2b4', ink: '#6e4a3e', icon: 'scarf',
    quotes: ['Autumn scarves are back ♪', 'Wide jeans forever!'] },
  { id: 'science', kind: 'magazine', title: 'SCIENCE', genre: 'Science', color: '#5d5a8f', ink: '#f2c46a', icon: 'atom',
    quotes: ['Octopuses have three hearts?!', 'Did you know honey never spoils?'] }
];

/** Un livre (ou magazine) différent pour chaque personne du groupe. */
export function pickBooks(kind: 'book' | 'magazine', n: number, rnd: () => number = Math.random): Book[] {
  const pool = BOOKS.filter(b => b.kind === kind).slice();
  const out: Book[] = [];
  for (let i = 0; i < n; i++) {
    if (!pool.length) pool.push(...BOOKS.filter(b => b.kind === kind));
    out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  }
  return out;
}

/** Ce que dit le groupe pendant la lecture : on alterne les remarques de chacun, toutes les 5 secondes. */
export function readingQuote(books: Book[], elapsed: number): { book: Book; text: string } {
  const lines = books.flatMap((b, k) => b.quotes.map((q, j) => ({ book: b, text: q, order: j * books.length + k })))
    .sort((a, b) => a.order - b.order);
  const l = lines[Math.floor(Math.max(0, elapsed) / 5) % lines.length];
  return { book: l.book, text: l.text };
}
