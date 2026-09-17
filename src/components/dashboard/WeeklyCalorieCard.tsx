import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { Target, Flame } from 'lucide-react';

interface WeeklyCalorieCardProps {
  consumed: number;
  target: number;
  burned: number;
}

export const WeeklyCalorieCard: React.FC<WeeklyCalorieCardProps> = ({ consumed, target, burned }) => {
  const netTarget = target + burned;
  const remaining = netTarget - consumed;
  const isOver = remaining < 0;
  const percent = Math.min((consumed / netTarget) * 100, 100);

  let barColor = 'bg-emerald-500';
  if (percent >= 100) barColor = 'bg-red-500';
  else if (percent >= 80) barColor = 'bg-amber-500';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
          <Target size={16} className="text-emerald-500" />
          <h2 className="font-semibold">Weekly Net Budget</h2>
        </div>
        <div className="flex items-baseline gap-1">
          <AnimatedCounter value={consumed} className="text-4xl font-bold text-zinc-100" />
          <span className="text-lg text-zinc-500">/ {netTarget} kcal</span>
        </div>
        
        <div className="w-full h-3 bg-zinc-800 rounded-full mt-6 mb-2 overflow-hidden">
          <motion.div
            className={`h-full ${barColor} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        
        <div className="text-sm font-medium mt-2">
          {isOver ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-red-400 flex items-center justify-center gap-1">
                You are <AnimatedCounter value={Math.abs(remaining)} /> kcal over budget
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/20">
                <Flame size={14} className="animate-pulse" />
                CALORIE DEBT: BURN {Math.abs(remaining)} KCAL
              </div>
            </div>
          ) : (
            <span className="text-emerald-400 flex items-center justify-center gap-1">
              You have <AnimatedCounter value={remaining} /> kcal left for this week
            </span>
          )}
        </div>
        
        {burned > 0 && !isOver && (
          <div className="mt-3 text-xs text-zinc-500 flex items-center justify-center gap-1">
            <Flame size={12} className="text-orange-400" />
            Exercising added {burned} kcal to your weekly budget!
          </div>
        )}
      </div>
    </motion.div>
  );
};
