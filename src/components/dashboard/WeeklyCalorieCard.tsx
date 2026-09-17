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
  const netConsumed = Math.max(0, consumed - burned);
  const remaining = target - netConsumed;
  const isOver = remaining < 0;
  const percent = Math.min((netConsumed / target) * 100, 100);

  let barColor = 'bg-emerald-500';
  if (percent >= 100) barColor = 'bg-red-500';
  else if (percent >= 80) barColor = 'bg-amber-500';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
          <Target size={16} className="text-emerald-500" />
          <h2 className="font-semibold">Weekly Target (So Far)</h2>
        </div>
        
        {/* Net Consumed Display */}
        <div className="flex items-baseline gap-1">
          <AnimatedCounter value={netConsumed} className="text-4xl font-bold text-zinc-100" />
          <span className="text-lg text-zinc-500">/ {target} kcal</span>
        </div>
        
        {burned > 0 && (
          <div className="mt-2 text-xs text-emerald-400 flex items-center justify-center gap-1 font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
            <Flame size={12} className="text-emerald-400" />
            Exercise reduced your consumed calories by {burned} kcal!
          </div>
        )}
        
        <div className="w-full h-3 bg-zinc-800 rounded-full mt-5 mb-3 overflow-hidden">
          <motion.div
            className={`h-full ${barColor} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        
        <div className="text-sm font-medium">
          {isOver ? (
            <div className="flex flex-col items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/20">
                <Flame size={14} className="animate-pulse" />
                CALORIE DEBT: YOU NEED TO BURN {Math.abs(remaining)} EXTRA KCAL
              </div>
            </div>
          ) : (
            <span className="text-emerald-400 flex items-center justify-center gap-1">
              You are on track! <AnimatedCounter value={remaining} /> kcal breathing room
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
