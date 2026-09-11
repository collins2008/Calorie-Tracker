import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../ui/AnimatedCounter';

interface CalorieCardProps {
  consumed: number;
  target: number;
  bmr: number;
  burned: number;
}

export const CalorieCard: React.FC<CalorieCardProps> = ({ consumed, target, bmr, burned }) => {
  const remaining = target - consumed;
  const isOver = remaining < 0;
  const percent = Math.min((consumed / target) * 100, 100);

  let barColor = 'bg-emerald-500';
  if (percent >= 100) barColor = 'bg-red-500';
  else if (percent >= 80) barColor = 'bg-amber-500';

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-sm font-semibold text-zinc-400 mb-2">Calories Consumed</h2>
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
            <span className="text-red-400">
              <AnimatedCounter value={Math.abs(remaining)} /> kcal over
            </span>
          ) : (
            <span className="text-emerald-400">
              <AnimatedCounter value={remaining} /> kcal remaining
            </span>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-6 pt-6 border-t border-zinc-800">
        <div className="flex flex-col items-center">
          <span className="text-xs text-zinc-500">BMR</span>
          <span className="text-sm font-medium text-zinc-300">{Math.round(bmr)} kcal</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-zinc-500">Activity Burn</span>
          <span className="text-sm font-medium text-zinc-300">{Math.round(burned)} kcal</span>
        </div>
      </div>
    </div>
  );
};
