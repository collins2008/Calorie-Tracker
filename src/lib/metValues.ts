export interface WorkoutPreset {
  id: string;
  name: string;
  met: number;
  defaultDurationMin: number;
  icon: string;
}

export const WORKOUT_PRESETS: WorkoutPreset[] = [
  { id: 'phantom-skip', name: 'Phantom Skipping', met: 11.0, defaultDurationMin: 15, icon: 'Zap' },
  { id: 'dumbbells', name: '6kg Dumbbells', met: 5.0, defaultDurationMin: 30, icon: 'Dumbbell' },
  { id: 'bodyweight', name: 'Bodyweight Split', met: 6.0, defaultDurationMin: 25, icon: 'User' },
  { id: 'walk-brisk', name: 'Brisk Walk', met: 4.3, defaultDurationMin: 30, icon: 'Footprints' },
  { id: 'walk-casual', name: 'Casual Walk', met: 2.5, defaultDurationMin: 30, icon: 'Footprints' },
  { id: 'running', name: 'Running', met: 9.8, defaultDurationMin: 20, icon: 'Zap' },
  { id: 'cycling', name: 'Cycling', met: 7.5, defaultDurationMin: 30, icon: 'Bike' },
  { id: 'swimming', name: 'Swimming', met: 8.0, defaultDurationMin: 30, icon: 'Zap' },
  { id: 'yoga', name: 'Yoga', met: 3.0, defaultDurationMin: 30, icon: 'User' },
  { id: 'hiit', name: 'HIIT', met: 10.0, defaultDurationMin: 20, icon: 'Flame' },
];

export function calculateCaloriesBurned(met: number, weightKg: number, durationMin: number): number {
  return (met * 3.5 * weightKg) / 200 * durationMin;
}
