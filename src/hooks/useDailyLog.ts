import { useLiveQuery } from 'dexie-react-hooks';
import { db, DailyLogEntry } from '../lib/db';

export function useDailyLog(date: string) {
  const allEntries = useLiveQuery(
    () => db.dailyLogs.where('date').equals(date).toArray(),
    [date]
  );

  const isLoading = allEntries === undefined;
  const entries = allEntries || [];

  const mealsList = entries.filter((entry) => entry.type === 'meal');
  const workouts = entries.filter((entry) => entry.type === 'workout');

  const meals = mealsList.reduce((acc, meal) => {
    const category = meal.mealCategory || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(meal);
    return acc;
  }, {} as Record<string, DailyLogEntry[]>);

  const addEntry = async (entry: Omit<DailyLogEntry, 'id' | 'createdAt'>) => {
    await db.dailyLogs.add({
      ...entry,
      createdAt: Date.now(),
    } as DailyLogEntry);
  };

  const deleteEntry = async (id: number) => {
    if (id === undefined) return;
    await db.dailyLogs.delete(id);
  };

  const updateEntry = async (id: number, changes: Partial<DailyLogEntry>) => {
    if (id === undefined) return;
    await db.dailyLogs.update(id, changes);
  };

  return {
    meals,
    workouts,
    allEntries: entries,
    addEntry,
    updateEntry,
    deleteEntry,
    isLoading
  };
}
