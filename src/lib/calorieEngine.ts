import { db, UserProfile } from './db';
import { calculateBMR, calculateTDEE } from './bmrCalculator';

export interface DailySummary {
  consumed: number;
  burned: number;
  bmr: number;
  tdee: number;
  remaining: number;
  deficit: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

export function calculateDailySummary(logs: Array<any>, profile: UserProfile): DailySummary {
  let consumed = 0;
  let burned = 0;
  let proteinConsumed = 0;
  let carbsConsumed = 0;
  let fatConsumed = 0;
  
  logs.forEach(log => {
    if (log.type === 'meal') {
      consumed += log.calories;
      proteinConsumed += log.protein;
      carbsConsumed += log.carbs;
      fatConsumed += log.fat;
    } else if (log.type === 'workout') {
      burned += log.calories;
    }
  });

  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  
  const totalOut = tdee + burned;
  const deficit = totalOut - consumed;
  const remaining = Math.max(profile.dailyCalorieTarget - consumed + burned, 0);
  
  return {
    consumed: Math.round(consumed),
    burned: Math.round(burned),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    remaining: Math.round(remaining),
    deficit: Math.round(deficit),
    proteinConsumed: Math.round(proteinConsumed),
    carbsConsumed: Math.round(carbsConsumed),
    fatConsumed: Math.round(fatConsumed),
    proteinTarget: Math.round(profile.dailyProteinTarget),
    carbsTarget: Math.round(profile.dailyCarbsTarget),
    fatTarget: Math.round(profile.dailyFatTarget),
  };
}

export async function getDailySummary(date: string, profile: UserProfile): Promise<DailySummary> {
  const logs = await db.dailyLogs.where('date').equals(date).toArray();
  return calculateDailySummary(logs, profile);
}
