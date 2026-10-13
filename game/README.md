# Café Komorebi — the game

- **Level 1**: prologue → meeting Grandma → three days at the café → Biscuit joins.
- **Level 2**: the juice bar opens (3 happy customers), then closing time with Biscuit and Moka.
- **Level 3**: coffee and juice (3 happy customers), a squeak in the wall… At night the **Crumb Crew** comes out: Moka's secret mouse friends (Captain Crumb, Dusty, Bubbles, Nibbles). Pick a mouse, then a mess that matches their tool (🧹 mud · 🪶 dust · 🧽 spills · 🥐 crumbs); you put the 📚 books back yourself. Each mouse has a card (ⓘ) with their story and costume colours.

Days are short on purpose for now (3 customers) so the story can be followed; customer counts will grow later.

## Play

- **Easiest:** open `dist/index.html` in Chrome, Edge or Firefox (double-click). Everything is inside that one file.
- **While developing:** `npm install` once, then `npm run dev` and open the address it prints.

Progress is saved in the browser automatically; the title screen offers **Continue**.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with live reload |
| `npm run build` | Builds the single playable file `dist/index.html` |
| `npm test` | Unit tests for the game logic (recipes, patience, save, level rules) |
| `npm run typecheck` | TypeScript check |

## Code layout

- `src/logic/` — game rules, no display code (recipes, patience and payment, level plans, night cleanup in `crumbs.ts`, save validation) + tests
- `src/world/exterior.js` — the 3D café diorama (Three.js), with 2D characters as sprites walking on the street
- `src/ui/` — 2D screens: title, dialogue, transformation, room service, coffee & juice stations, night alley, Crumb Crew night (`crew.ts`), character cards, summary cards
- `src/art/cast.js` — the character drawings (SVG), shared with `../characters/character-sheet.html`
- `src/game.ts` — the story flow for levels 1–3
