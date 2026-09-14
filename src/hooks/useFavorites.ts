import { useLiveQuery } from 'dexie-react-hooks';
import { db, SavedItem } from '../lib/db';

export function useFavorites() {
  const savedMeals = useLiveQuery(() => db.savedItems.where('type').equals('meal').toArray(), []) || [];
  const savedWorkouts = useLiveQuery(() => db.savedItems.where('type').equals('workout').toArray(), []) || [];

  const addFavorite = async (item: Omit<SavedItem, 'id' | 'createdAt'>) => {
    // Check if one with exactly the same name already exists to prevent pure duplicates
    const existing = await db.savedItems.where('type').equals(item.type).toArray();
    if (existing.some(e => e.name === item.name)) {
      return; // Already saved
    }
    await db.savedItems.add({
      ...item,
      createdAt: Date.now()
    });
  };

  const removeFavorite = async (id: number) => {
    await db.savedItems.delete(id);
  };

  return { savedMeals, savedWorkouts, addFavorite, removeFavorite };
}
