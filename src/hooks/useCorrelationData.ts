import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useProfile } from './useProfile';

export interface CorrelationDataPoint {
  date: string;
  weight: number;
  consumed: number;
  target: number;
}

export function useCorrelationData() {
  const { profile } = useProfile();
  
  const data = useLiveQuery(async () => {
    if (!profile) return [];
    
    // Fetch all weights and meals
    const weightEntries = await db.weightEntries.orderBy('date').toArray();
    const mealLogs = await db.dailyLogs.where('type').equals('meal').toArray();
    
    // Group meals by date
    const caloriesByDate: Record<string, number> = {};
    mealLogs.forEach(log => {
      caloriesByDate[log.date] = (caloriesByDate[log.date] || 0) + log.calories;
    });
    
    // Extract all unique dates from both
    const allDates = Array.from(new Set([
      ...weightEntries.map(w => w.date),
      ...Object.keys(caloriesByDate)
    ])).sort(); // Sort chronologically
    
    // Carry forward the last known weight if they didn't weigh in that day
    let lastKnownWeight = profile.weight;
    const weightMap = new Map(weightEntries.map(w => [w.date, w.weight]));
    
    const chartData: CorrelationDataPoint[] = allDates.map(date => {
      if (weightMap.has(date)) {
        lastKnownWeight = weightMap.get(date)!;
      }
      const consumed = caloriesByDate[date] || 0;
      return {
        date,
        weight: lastKnownWeight,
        consumed,
        target: profile.dailyCalorieTarget
      };
    });
    
    return chartData;
  }, [profile]);

  return { data: data || [], isLoading: data === undefined };
}
