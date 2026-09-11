import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { updateStreak } from '../lib/streakEngine';
import { getToday } from '../lib/dateUtils';

export function useStreak() {
  const streakData = useLiveQuery(async () => {
    const data = await db.streaks.get('default');
    return data || null;
  });
  const isLoading = streakData === undefined;
  const streak = streakData === null ? undefined : streakData;

  const checkIn = async () => {
    const today = getToday();
    await updateStreak(today);
  };

  return { streak, checkIn, isLoading };
}
