import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import { useStreak } from '../hooks/useStreak';
import { useWeightHistory } from '../hooks/useWeightHistory';
import { useDailyLog } from '../hooks/useDailyLog';
import { getDailySummary, calculateDailySummary, DailySummary } from '../lib/calorieEngine';
import { generateAdvice } from '../lib/coachEngine';
import { getToday } from '../lib/dateUtils';
import {
  CalorieCard,
  MacroRings,
  StreakCard,
  CoachCard,
  WeightTrendCard,
  QuickAddWorkouts,
  MacroTetrisCard,
} from '../components/dashboard';
import OnboardingModal from '../components/metrics/OnboardingModal';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  const { profile, isOnboarded, isLoading: profileLoading } = useProfile();
  const { streak } = useStreak();
  const { entries: weightEntries } = useWeightHistory();
  const today = getToday();
  const { allEntries, addEntry } = useDailyLog(today);

  const summary = useMemo(() => {
    if (!profile || !allEntries) return null;
    return calculateDailySummary(allEntries, profile);
  }, [profile, allEntries]);

  const advice = useMemo(() => {
    if (!summary || !profile || !streak) return [];
    return generateAdvice(summary, profile, streak);
  }, [summary, profile, streak]);

  const handleAddWorkout = async (workout: { name: string; duration: number; calories: number; met: number }) => {
    await addEntry({
      type: 'workout',
      date: today,
      description: workout.name,
      duration: workout.duration,
      calories: workout.calories,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  };

  if (profileLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-zinc-500">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!isOnboarded) {
    return <OnboardingModal />;
  }

  if (!summary || !profile) return null;

  return (
    <div className="max-w-lg mx-auto py-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-sm text-zinc-400">Welcome back, {profile.name}</p>
      </header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        <motion.div variants={item}>
          <CalorieCard
            consumed={summary.consumed}
            target={profile.dailyCalorieTarget}
            bmr={summary.bmr}
            burned={summary.burned}
          />
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={item}>
            <MacroRings
              proteinConsumed={summary.proteinConsumed}
              proteinTarget={summary.proteinTarget}
              carbsConsumed={summary.carbsConsumed}
              carbsTarget={summary.carbsTarget}
              fatConsumed={summary.fatConsumed}
              fatTarget={summary.fatTarget}
            />
          </motion.div>

          <motion.div variants={item}>
            {streak && <StreakCard streak={streak} />}
          </motion.div>
        </div>

        <motion.div variants={item}>
          <CoachCard advice={advice} />
        </motion.div>

        <motion.div variants={item}>
          <MacroTetrisCard 
            summary={summary} 
            onLogSuggestion={async (sug) => {
              await addEntry({
                type: 'meal',
                date: today,
                mealCategory: 'snack', // Defaulting to snack for tetris suggestions
                description: sug.description,
                calories: sug.calories,
                protein: sug.protein,
                carbs: sug.carbs,
                fat: sug.fat
              });
            }}
          />
        </motion.div>

        <motion.div variants={item}>
          <WeightTrendCard entries={weightEntries} targetWeight={profile.targetWeight} profileWeight={profile.weight} startingWeight={profile.startingWeight} />
        </motion.div>

        <motion.div variants={item}>
          <QuickAddWorkouts userWeight={profile.weight} onAddWorkout={handleAddWorkout} />
        </motion.div>
      </motion.div>
    </div>
  );
}
