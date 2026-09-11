import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

interface CoachCardProps {
  advice: string[];
}

export const CoachCard: React.FC<CoachCardProps> = ({ advice }) => {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-zinc-100">Recomp Coach</h3>
      </div>
      
      {advice.length > 0 ? (
        <div className="flex flex-col gap-3">
          {advice.map((text, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="pl-3 border-l-2 border-emerald-500/50 text-sm text-zinc-300 py-1"
            >
              {text}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-zinc-500 italic">
          Log some meals to get personalized advice.
        </div>
      )}
    </div>
  );
};
