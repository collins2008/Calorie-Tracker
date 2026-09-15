import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function useWeightHistory() {
  const entries = useLiveQuery(
    () => db.weightEntries.orderBy('date').toArray()
  );

  const isLoading = entries === undefined;
  const weightEntries = entries || [];

  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null;
  const previousWeight = weightEntries.length > 1 ? weightEntries[weightEntries.length - 2].weight : null;
  const weightChange = latestWeight !== null && previousWeight !== null ? latestWeight - previousWeight : 0;

  const addWeightEntry = async (date: string, weight: number) => {
    // Upsert logic: prevent multiple entries for the same date
    const existing = await db.weightEntries.where('date').equals(date).first();
    
    if (existing && existing.id !== undefined) {
      await db.weightEntries.update(existing.id, { weight, createdAt: Date.now() });
    } else {
      await db.weightEntries.add({
        date,
        weight,
        createdAt: Date.now(),
      });
    }
    
    // Attempt to sync the profile's weight if a profile exists
    const profile = await db.profile.get('default');
    if (profile) {
      await db.profile.update('default', {
        weight,
        updatedAt: Date.now(),
      });
    }
  };

  return {
    entries: weightEntries,
    latestWeight,
    weightChange,
    addWeightEntry,
    isLoading
  };
}
