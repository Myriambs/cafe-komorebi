// Niveau 1 : du prologue jusqu'à l'arrivée de Biscuit
export interface DayPlan {
  day: number;
  goal: number;            // clients satisfaits pour finir la journée
  recipes: string[];       // boissons que les clients peuvent commander
  maxSeated: number;       // groupes assis en même temps
  parties: number[];       // tailles de groupe possibles (1 = seul, 2 = couple, 3 = amis)
  dogMorning: 'none' | 'door' | 'sleeping';
}

export const LEVEL1: DayPlan[] = [
  { day: 1, goal: 3, recipes: ['espresso', 'americano', 'latte', 'arabic'], maxSeated: 1, parties: [1], dogMorning: 'none' },
  { day: 2, goal: 5, recipes: ['espresso', 'americano', 'latte', 'cappuccino', 'arabic', 'mocha', 'hotchoc'], maxSeated: 2, parties: [1, 2, 2], dogMorning: 'door' },
  { day: 3, goal: 7, recipes: ['americano', 'latte', 'cappuccino', 'caramel', 'arabic', 'mocha', 'cardamomLatte'], maxSeated: 3, parties: [1, 2, 3], dogMorning: 'sleeping' }
];

export const planFor = (day: number): DayPlan => LEVEL1[Math.min(LEVEL1.length, Math.max(1, day)) - 1];

/** Biscuit rejoint l'équipe le jour 3, au 5e client satisfait, s'il a été nourri deux nuits. */
export function dogJoins(day: number, servedToday: number, nightsFed: number): boolean {
  return day === 3 && servedToday >= 5 && nightsFed >= 2;
}

/** Niveau 2, première journée : le bar à jus ouvre, 3 clients à satisfaire (court, pour suivre l'histoire). */
export const LEVEL2_DAY: DayPlan = { day: 1, goal: 3, recipes: ['orangeJuice', 'appleMint', 'lemonade', 'berryFizz'], maxSeated: 2, parties: [1, 2], dogMorning: 'none' };

/** Niveau 3 : jour de rush, café ET jus pour des groupes de deux (beaucoup de désordre), puis la nuit où la Crumb Crew se montre. */
export const LEVEL3_DAY: DayPlan = { day: 1, goal: 4, recipes: ['latte', 'cappuccino', 'mocha', 'orangeJuice', 'lemonade', 'berryFizz'], maxSeated: 2, parties: [2], dogMorning: 'none' };
