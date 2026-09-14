import Dexie, { type EntityTable } from 'dexie';

export interface UserProfile {
  id: string; // always 'default'
  name: string;
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  targetWeight: number; // kg
  targetDate: string; // ISO date 'YYYY-MM-DD'
  neck?: number; // cm
  waist?: number; // cm
  bodyFatPercentage?: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number; // grams
  dailyCarbsTarget: number;
  dailyFatTarget: number;
  createdAt: number;
  updatedAt?: number;
}

export interface DailyLogEntry {
  id?: number; // auto-increment
  date: string; // ISO date 'YYYY-MM-DD'
  type: 'meal' | 'workout';
  mealCategory?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  duration?: number; // minutes, for workouts
  aiReasoning?: string; // AI's math explanation
  createdAt: number;
}

export interface WeightEntry {
  id?: number;
  date: string; // ISO date
  weight: number; // kg
  createdAt: number;
}

export interface StreakData {
  id: string; // always 'default'
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string; // ISO date
  freezesAvailable: number;
  freezesUsed: number;
}

export interface ProgressPhoto {
  id?: number;
  date: string; // ISO date
  imageBase64: string; // Compressed WebP/JPEG
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  createdAt: number;
}

export interface SyncQueueItem {
  id?: number;
  date: string; // The date this meal belongs to
  input: string; // The text description
  imageBase64?: string; // The photo, if taken
  createdAt: number;
}

export interface SavedItem {
  id?: number;
  type: 'meal' | 'workout';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  duration?: number;
  createdAt: number;
}

const db = new Dexie('RecompTrackerDB') as Dexie & {
  profile: EntityTable<UserProfile, 'id'>;
  dailyLogs: EntityTable<DailyLogEntry, 'id'>;
  weightEntries: EntityTable<WeightEntry, 'id'>;
  streaks: EntityTable<StreakData, 'id'>;
  progressPhotos: EntityTable<ProgressPhoto, 'id'>;
  syncQueue: EntityTable<SyncQueueItem, 'id'>;
  savedItems: EntityTable<SavedItem, 'id'>;
  streak: EntityTable<StreakData, 'id'>; // alias
};

db.version(4).stores({
  profile: 'id',
  dailyLogs: '++id, date, type',
  weightEntries: '++id, date',
  streaks: 'id',
  progressPhotos: '++id, date',
  syncQueue: '++id, createdAt',
  savedItems: '++id, type',
});

// Alias: streak points to the same table as streaks
// for compatibility across modules
(db as any).streak = (db as any).streaks;

export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log(`Persisted storage granted: ${isPersisted}`);
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
    }
  }
}

export { db };
