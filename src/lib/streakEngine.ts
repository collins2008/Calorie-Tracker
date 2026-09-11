import { db, StreakData } from './db';
import { getYesterday, getToday } from './dateUtils';

const DEFAULT_STREAK: StreakData = {
  id: 'default',
  currentStreak: 0,
  longestStreak: 0,
  lastLogDate: '',
  freezesAvailable: 0,
  freezesUsed: 0,
};

export async function getStreakData(): Promise<StreakData> {
  const data = await db.streak.get('default');
  return data || { ...DEFAULT_STREAK };
}

export async function checkAndAwardFreeze(streakData: StreakData): Promise<StreakData> {
  const earnedFreezes = Math.floor(streakData.currentStreak / 7);
  streakData.freezesAvailable = earnedFreezes - streakData.freezesUsed;
  return streakData;
}

export async function updateStreak(date: string): Promise<void> {
  const data = await getStreakData();
  const today = getToday();
  const yesterday = getYesterday();

  if (data.lastLogDate === date || data.lastLogDate === today) {
      if (data.lastLogDate === date) return; 
  }

  if (data.lastLogDate === yesterday) {
    data.currentStreak += 1;
    data.lastLogDate = date;
  } else if (data.lastLogDate !== '') {
    const missedYesterday = date === today;
    if (data.freezesAvailable > 0) {
      data.freezesAvailable -= 1;
      data.freezesUsed += 1;
      data.currentStreak += 1;
      data.lastLogDate = date;
    } else {
      data.currentStreak = 1;
      data.freezesUsed = 0;
      data.lastLogDate = date;
    }
  } else {
    data.currentStreak = 1;
    data.lastLogDate = date;
  }

  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }

  const updatedData = await checkAndAwardFreeze(data);
  await db.streak.put(updatedData);
}
