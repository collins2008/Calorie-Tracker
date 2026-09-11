import { db, DailyLogEntry } from './db';

export interface TetrisSuggestion {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  matchScore: number; // 0-100%
}

const FALLBACK_SUGGESTIONS = [
  { description: 'Greek Yogurt & Honey', calories: 150, protein: 15, carbs: 20, fat: 0 },
  { description: '2 Boiled Eggs', calories: 140, protein: 12, carbs: 0, fat: 10 },
  { description: '1 Scoop Whey Protein', calories: 120, protein: 25, carbs: 3, fat: 1 },
  { description: 'Handful of Almonds', calories: 160, protein: 6, carbs: 6, fat: 14 },
  { description: 'Chicken Breast (150g)', calories: 250, protein: 45, carbs: 0, fat: 5 },
  { description: 'Protein Bar', calories: 200, protein: 20, carbs: 20, fat: 6 },
  { description: 'Moi Moi (1 wrap)', calories: 150, protein: 12, carbs: 18, fat: 4 },
  { description: 'Suya (Small portion)', calories: 300, protein: 35, carbs: 5, fat: 15 }
];

export async function getMacroTetrisSuggestions(
  remCals: number, 
  remPro: number, 
  remCarbs: number, 
  remFat: number
): Promise<TetrisSuggestion[]> {
  if (remCals < 50) return []; // Too little left to suggest anything meaningful

  // 1. Get all historical meals
  const allMeals = await db.dailyLogs.filter(log => log.type === 'meal').toArray();

  // 2. Deduplicate by description
  const uniqueMeals = new Map<string, DailyLogEntry>();
  for (const meal of allMeals) {
    const key = meal.description.toLowerCase().trim();
    if (!uniqueMeals.has(key)) {
      uniqueMeals.set(key, meal);
    }
  }

  let candidates = Array.from(uniqueMeals.values()).map(m => ({
    description: m.description,
    calories: m.calories,
    protein: m.protein || 0,
    carbs: m.carbs || 0,
    fat: m.fat || 0,
  }));

  // 3. Fallback if not enough history
  if (candidates.length < 5) {
    // Merge fallbacks, ensuring no duplicate descriptions
    const existingNames = new Set(candidates.map(c => c.description.toLowerCase()));
    const newFallbacks = FALLBACK_SUGGESTIONS.filter(f => !existingNames.has(f.description.toLowerCase()));
    candidates = [...candidates, ...newFallbacks];
  }

  // 4. Scoring Algorithm
  const scored: TetrisSuggestion[] = candidates.map(meal => {
    // We want meals that fit INSIDE the remaining macros, or slightly exceed them (max 15% overflow)
    if (meal.calories > remCals * 1.15) return null; // Hard reject if it blows the calorie budget

    // Calculate how much of the remaining gap this meal fills (0 to 1)
    const calFill = Math.min(meal.calories / remCals, 1);
    
    // We really care about protein for recomp.
    const proFill = remPro > 0 ? Math.min(meal.protein / remPro, 1) : 1;
    
    // Math magic: A perfect meal fills 100% of remaining protein and 100% of remaining calories.
    // We weight protein heavily for body recomposition.
    const score = (calFill * 0.4) + (proFill * 0.6);

    return {
      ...meal,
      matchScore: Math.round(score * 100)
    };
  }).filter(Boolean) as TetrisSuggestion[];

  // 5. Sort by best match and return top 3
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}
