// Les vraies recettes de la boîte de Grand-mère, à refaire à la maison (pas les étapes simplifiées du jeu)
export interface HomeRecipe {
  id: string;
  makes: string;
  time: string;
  oven: string;
  level: 'Easy' | 'Medium' | 'Patient baker';
  groups: { title: string; items: string[] }[];
  steps: string[];
  tip: string;
}

export const HOME_RECIPES: Record<string, HomeRecipe> = {
  croissant: {
    id: 'croissant', makes: '12 croissants', time: '2 days (mostly resting)', oven: '200°C · 15–18 min', level: 'Patient baker',
    groups: [
      { title: 'Dough', items: ['500 g bread flour', '55 g sugar', '10 g salt', '10 g instant yeast', '140 ml cold water', '140 ml cold milk', '40 g soft butter'] },
      { title: 'Butter layer', items: ['280 g cold butter (good quality)'] },
      { title: 'Honey glaze', items: ['1 egg + 1 tbsp milk (egg wash)', '2 tbsp honey + 1 tbsp hot water'] }
    ],
    steps: [
      'Mix all the dough ingredients and knead for 5 minutes until smooth. Flatten into a rectangle, wrap and chill overnight.',
      'Put the cold butter between two sheets of baking paper and beat it with a rolling pin into a 17 cm square. Chill.',
      'Roll the dough into a 17 × 34 cm rectangle, place the butter in the middle and fold the dough over it like a letter.',
      'Roll it out long, fold it in three, and chill for 30 minutes. Do this 3 times in total. These folds make the flaky layers.',
      'Roll the dough to about 4 mm thick, cut long triangles, stretch each one gently and roll it up from the wide end.',
      'Let them rise at room temperature for about 2 hours, until puffy and wobbly.',
      'Brush with egg wash and bake at 200°C for 15–18 minutes, until deep golden.',
      'Brush the honey glaze on while they are still warm.'
    ],
    tip: 'Keep everything cold. If the butter gets soft and greasy, put the dough back in the fridge for 15 minutes. Patience is the secret ingredient, dear.'
  },
  melonpan: {
    id: 'melonpan', makes: '8 buns', time: '2 hours 30 min', oven: '180°C · 12–15 min', level: 'Medium',
    groups: [
      { title: 'Bread dough', items: ['250 g bread flour', '30 g sugar', '4 g salt', '4 g instant yeast', '1 egg + milk to make 170 ml', '25 g soft butter'] },
      { title: 'Cookie crust', items: ['60 g soft butter', '60 g sugar', '30 g beaten egg (about half an egg)', '150 g plain flour', 'Sugar for dipping'] }
    ],
    steps: [
      'Mix the flour, sugar, salt and yeast. Add the egg and milk, then knead 10 minutes. Add the butter and knead until smooth and stretchy.',
      'Cover and let it rise in a warm place for about 1 hour, until doubled.',
      'For the crust, beat the butter and sugar until creamy, add the egg, then mix in the flour. Wrap and chill for 30 minutes.',
      'Divide the bread dough into 8 balls. Divide the cookie dough into 8 and flatten each piece into a thin disc between plastic wrap.',
      'Lay a cookie disc over each ball so it covers the top and sides. Dip the top in sugar.',
      'Score a criss-cross pattern on top with the back of a knife (the "melon" look).',
      'Let them rise for 40 minutes, then bake at 180°C for 12–15 minutes, until lightly golden. Watch them so the crust does not brown too much.'
    ],
    tip: 'There is no melon inside! The name comes from the crackly top that looks like a melon skin. Eat it the same day, when the crust is still crunchy.'
  },
  cinnamon: {
    id: 'cinnamon', makes: '9 rolls', time: '2 hours 30 min', oven: '180°C · 22–25 min', level: 'Easy',
    groups: [
      { title: 'Dough', items: ['375 g plain flour', '50 g sugar', '7 g instant yeast', '½ tsp salt', '180 ml warm milk', '1 egg', '55 g melted butter'] },
      { title: 'Filling', items: ['60 g very soft butter', '100 g brown sugar', '1 tbsp ground cinnamon'] },
      { title: 'White icing', items: ['120 g icing sugar', '2 tbsp milk', '½ tsp vanilla'] }
    ],
    steps: [
      'Mix the flour, sugar, yeast and salt. Add the warm milk, egg and melted butter, then knead for 8 minutes until soft and smooth.',
      'Cover and let it rise for about 1 hour, until doubled.',
      'Roll the dough into a 30 × 40 cm rectangle. Spread the soft butter all over and sprinkle with the brown sugar and cinnamon.',
      'Roll it up tightly from the long side and cut into 9 equal slices.',
      'Place them in a buttered square pan, cover and let them rise for 30–45 minutes.',
      'Bake at 180°C for 22–25 minutes, until golden on top.',
      'Stir the icing sugar, milk and vanilla until smooth. Drizzle it over the rolls while they are still warm.'
    ],
    tip: 'Cut the rolls with a piece of thread instead of a knife. Slide it under the roll, cross the ends and pull: they stay perfectly round!'
  },
  shortcake: {
    id: 'shortcake', makes: '1 cake (15 cm), 6 slices', time: '2 hours + cooling', oven: '170°C · 25–30 min', level: 'Medium',
    groups: [
      { title: 'Sponge', items: ['3 eggs (room temperature)', '90 g sugar', '90 g cake flour (or plain flour), sifted', '20 g butter + 1 tbsp milk, melted together'] },
      { title: 'Cream', items: ['300 ml whipping cream (35% fat), very cold', '25 g sugar'] },
      { title: 'Fruit & syrup', items: ['300 g strawberries', '2 tbsp sugar + 2 tbsp hot water (syrup)'] }
    ],
    steps: [
      'Line a 15 cm round pan with baking paper. Heat the oven to 170°C.',
      'Whisk the eggs and sugar in a bowl over warm water until just warm (about 40°C). Take it off the heat and beat for 8–10 minutes, until pale and thick. A ribbon should stay on top for a few seconds.',
      'Gently fold in the sifted flour in 2–3 batches. Then fold in the warm butter and milk.',
      'Pour into the pan, drop it once on the table to pop big bubbles, and bake for 25–30 minutes.',
      'Turn the cake upside down on a rack and let it cool completely. Slice it into two layers.',
      'Whip the cold cream with the sugar until soft peaks form. Slice half of the strawberries.',
      'Brush each layer with syrup. Spread cream on the first layer, add sliced strawberries, more cream, then the second layer.',
      'Cover the whole cake in cream and decorate the top with whole strawberries. Chill for 1 hour before slicing.'
    ],
    tip: 'Be gentle when folding in the flour: the air you whisked into the eggs is what makes the sponge fluffy. No baking powder needed!'
  }
};

/** Niveau 5 : les notes de thé de Leila et les douceurs de Grand-mère. */
Object.assign(HOME_RECIPES, {
  greenTea: {
    id: 'greenTea', makes: '1 cup (200 ml)', time: '5 min', oven: 'Water at 75–80°C · steep 1–2 min', level: 'Easy',
    groups: [{ title: 'Tea', items: ['1 tsp (2–3 g) green tea leaves, like sencha', '200 ml water'] }],
    steps: [
      'Boil the water, then let it cool for about 3 minutes (to 75–80°C). Or mix 3 parts boiling water with 1 part cold water.',
      'Warm the teapot and cup with a little hot water, then pour it away.',
      'Put the leaves in the pot and pour the water over them.',
      'Steep for 1–2 minutes, no longer.',
      'Pour every last drop into the cup. The leaves can be steeped 2 more times, a little longer each time.'
    ],
    tip: 'Boiling water burns green tea and makes it bitter. Gentle water, gentle taste.'
  },
  blackTea: {
    id: 'blackTea', makes: '1 mug (250 ml)', time: '5 min', oven: 'Boiling water · steep 3–5 min', level: 'Easy',
    groups: [{ title: 'Tea', items: ['1 tsp black tea leaves (or 1 tea bag)', '250 ml freshly boiled water', 'Milk or a slice of lemon (optional)'] }],
    steps: [
      'Bring fresh water to a full boil.',
      'Warm the teapot or mug with a splash of hot water and pour it away.',
      'Add the tea and pour the boiling water over it.',
      'Steep for 3 minutes for a light cup, up to 5 minutes for a strong one.',
      'Remove the leaves or bag, then add milk or lemon if you like (never both: lemon makes milk curdle!).'
    ],
    tip: 'Use fresh cold water each time you boil the kettle. Water boiled twice makes flat tea.'
  },
  chamomile: {
    id: 'chamomile', makes: '1 mug (250 ml)', time: '7 min', oven: 'Boiling water · steep 5 min', level: 'Easy',
    groups: [{ title: 'Tea', items: ['1 tbsp dried chamomile flowers (or 1 tea bag)', '250 ml boiling water', '1 tsp honey'] }],
    steps: [
      'Put the flowers in a teapot or tea strainer.',
      'Pour the boiling water over them and cover with a lid or saucer, so the nice smell stays in the cup.',
      'Steep for 5 minutes.',
      'Strain, stir in the honey and enjoy it warm.'
    ],
    tip: 'Chamomile has no caffeine, so it is perfect in the evening. Add a thin slice of apple to the pot for a sweet surprise.'
  },
  mintTea: {
    id: 'mintTea', makes: '4 small glasses', time: '20 min', oven: 'Boiling water · simmer 5–10 min', level: 'Easy',
    groups: [
      { title: 'Tea', items: ['1 tbsp green tea (gunpowder tea)', '500 ml water', '3–4 tbsp sugar (to taste)', '1 big handful fresh mint'] },
      { title: 'To serve', items: ['2 tbsp pine nuts, lightly toasted'] }
    ],
    steps: [
      'Put the tea in a small metal teapot, pour in a little boiling water, swirl and pour it away. This rinses the leaves.',
      'Add the 500 ml water and let it simmer gently on the stove for 5–10 minutes. Tunisian tea is strong and dark.',
      'Stir in the sugar until it melts, then push the mint into the pot. Leave it for 2–3 minutes off the heat.',
      'Pour a glass and pour it back into the pot 2–3 times to mix.',
      'Serve in small glasses, pouring from high up to make a little foam.',
      'Sprinkle the toasted pine nuts on top. They float, and you eat them at the end!'
    ],
    tip: "Leila says: pour from as high as you dare. The foam on top is the tea's crown. (Toast the pine nuts in a dry pan, and watch them: they burn fast.)"
  },
  karak: {
    id: 'karak', makes: '2 cups', time: '15 min', oven: 'Stove · boil about 8 min', level: 'Easy',
    groups: [{ title: 'Tea', items: ['250 ml water', '2 tsp strong black tea (like Assam)', '4 cardamom pods, lightly crushed', '250 ml evaporated milk (or whole milk)', '2–3 tsp sugar', 'A pinch of saffron (optional)'] }],
    steps: [
      'Bring the water to a boil in a small pan with the cardamom (and saffron).',
      'Add the tea leaves and let it boil for 3–4 minutes, until very dark.',
      'Pour in the milk and sugar. Let it come back to the boil. When it rises up, lower the heat.',
      'Let it rise and fall 2–3 times (about 3 minutes) so it gets creamy.',
      'Strain into cups and serve hot.'
    ],
    tip: 'Stay next to the pan: milky tea loves to boil over the moment you look away!'
  },
  cookies: {
    id: 'cookies', makes: 'About 24 cookies', time: '1 hour 15 min', oven: '180°C · 10–12 min', level: 'Easy',
    groups: [
      { title: 'Cookies', items: ['200 g soft butter', '100 g icing sugar', '1 egg yolk', '1 tsp vanilla', '300 g plain flour', 'A pinch of salt'] },
      { title: 'Pink icing', items: ['150 g icing sugar', '1–2 tbsp lemon juice or water', 'A drop of pink food colouring', 'Sprinkles'] }
    ],
    steps: [
      'Beat the butter and icing sugar until creamy. Add the yolk and vanilla.',
      'Mix in the flour and salt until it just comes together. Wrap and chill for 30 minutes.',
      'Roll the dough to 5 mm between two sheets of baking paper and cut out shapes (hearts, stars, cats…).',
      'Chill the cut cookies on the tray for 10 minutes, so they keep their shape.',
      'Bake at 180°C for 10–12 minutes, until the edges are just pale gold. Let them cool completely.',
      'Stir the icing sugar with the lemon juice and colouring until thick and smooth. Spread it on, add sprinkles, and let it set.'
    ],
    tip: 'Add the liquid to the icing drop by drop. Too runny and it slides off; it should flow slowly from the spoon.'
  },
  lemonCake: {
    id: 'lemonCake', makes: '1 loaf, 10 slices', time: '1 hour 15 min', oven: '180°C · 40–45 min', level: 'Easy',
    groups: [
      { title: 'Cake', items: ['175 g soft butter', '175 g sugar', '3 eggs', '175 g self-raising flour (or plain flour + 2 tsp baking powder)', 'Zest of 2 lemons', '3 tbsp milk'] },
      { title: 'Lemon drizzle', items: ['Juice of 1½ lemons', '100 g sugar'] }
    ],
    steps: [
      'Heat the oven to 180°C and line a 900 g (2 lb) loaf tin with baking paper.',
      'Beat the butter and sugar until pale and fluffy. Beat in the eggs one at a time.',
      'Fold in the flour, lemon zest and milk.',
      'Pour into the tin and bake for 40–45 minutes, until a skewer comes out clean.',
      'Mix the lemon juice and sugar. While the cake is still hot, poke it all over with a skewer and pour the drizzle on top.',
      'Let it cool in the tin: the drizzle turns into a crunchy sugar crust.'
    ],
    tip: 'Zest the lemons before you squeeze them. It is much easier, and the zest is where the lemon perfume hides.'
  },
  chocCake: {
    id: 'chocCake', makes: '1 cake (20 cm), 8 slices', time: '1 hour 30 min', oven: '180°C · 30–35 min', level: 'Easy',
    groups: [
      { title: 'Cake', items: ['175 g plain flour', '200 g sugar', '50 g cocoa powder', '1½ tsp baking powder', '1 tsp baking soda', '½ tsp salt', '2 eggs', '240 ml milk', '100 ml vegetable oil', '1 tsp vanilla', '120 ml boiling water'] },
      { title: 'Chocolate glaze', items: ['100 g dark chocolate', '100 ml cream'] }
    ],
    steps: [
      'Heat the oven to 180°C. Grease and line a 20 cm round tin.',
      'Mix the flour, sugar, cocoa, baking powder, baking soda and salt in a big bowl.',
      'Add the eggs, milk, oil and vanilla and whisk until smooth.',
      'Carefully stir in the boiling water. The batter will be very runny: that is normal!',
      'Pour into the tin and bake for 30–35 minutes, until a skewer comes out clean. Cool completely.',
      'Heat the cream until steaming, pour it over the chopped chocolate, wait 2 minutes, then stir until glossy. Pour over the cake.'
    ],
    tip: 'The hot water wakes up the cocoa and makes the cake extra soft. Use a big jug to pour it in slowly.'
  }
} satisfies Record<string, HomeRecipe>);
