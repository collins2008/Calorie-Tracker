import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { Target } from 'lucide-react';

interface WeeklyCalorieCardProps {
  consumed: number;
  target: number;
}

export const WeeklyCalorieCard: React.FC<WeeklyCalorieCardProps> = ({ consumed, target }) => {
  const remaining = target - consumed;
  const isOver = remaining < 0;
  const percent = Math.min((consumed / target) * 100, 100);

  let barColor = 'bg-emerald-500';
  if (percent >= 100) barColor = 'bg-red-500';
  else if (percent >= 80) barColor = 'bg-amber-500';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
          <Target size={16} className="text-emerald-500" />
          <h2 className="font-semibold">Weekly Calorie Budget</h2>
        </div>
        <div className="flex items-baseline gap-1">
          <AnimatedCounter value={consumed} className="text-4xl font-bold text-zinc-100" />
          <span className="text-lg text-zinc-500">/ {target} kcal</span>
        </div>
        
        <div className="w-full h-3 bg-zinc-800 rounded-full mt-6 mb-2 overflow-hidden">
          <motion.div
            className={`h-full ${barColor} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        
        <div className="text-sm font-medium">
          {isOver ? (
            <span className="text-red-400 flex items-center justify-center gap-1">
              You are <AnimatedCounter value={Math.abs(remaining)} /> kcal over your weekly limit
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center justify-center gap-1">
              You have <AnimatedCounter value={remaining} /> kcal left for this week
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
