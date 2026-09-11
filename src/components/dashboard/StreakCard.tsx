import React from 'react';
import { motion } from 'framer-motion';
import { StreakData } from '../../lib/db';

interface StreakCardProps {
  streak: StreakData;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  const { currentStreak, longestStreak, freezesAvailable } = streak;

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center h-full justify-center">
      {currentStreak > 0 ? (
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-4xl mb-1"
        >
          🔥
        </motion.div>
      ) : (
        <div className="text-4xl mb-1 opacity-40 grayscale">🔥</div>
      )}

      {currentStreak > 0 ? (
        <>
          <div className="text-2xl font-bold text-zinc-100">{currentStreak}</div>
          <div className="text-xs font-medium text-zinc-400 mb-3">day streak</div>
        </>
      ) : (
        <div className="text-sm font-medium text-zinc-400 mb-3 mt-1">Start your streak!</div>
      )}

      <div className="flex items-center gap-2 mt-auto">
        <div className="bg-zinc-800/50 rounded-lg px-2 py-1">
          <span className="text-[10px] text-blue-400">❄️ {freezesAvailable}</span>
        </div>
        <div className="bg-zinc-800/50 rounded-lg px-2 py-1">
          <span className="text-[10px] text-zinc-400">Best: {longestStreak}</span>
        </div>
      </div>
    </div>
  );
};
