import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Zap, User, Footprints, Bike, Flame, X, Check } from 'lucide-react';
import { WORKOUT_PRESETS, calculateCaloriesBurned } from '../../lib/metValues';

interface QuickAddWorkoutsProps {
  onAddWorkout: (workout: { name: string; duration: number; calories: number; met: number }) => void;
  userWeight: number;
}

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  User: <User className="w-5 h-5" />,
  Footprints: <Footprints className="w-5 h-5" />,
  Bike: <Bike className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
};

export const QuickAddWorkouts: React.FC<QuickAddWorkoutsProps> = ({ onAddWorkout, userWeight }) => {
  const [selectedPreset, setSelectedPreset] = useState<typeof WORKOUT_PRESETS[0] | null>(null);
  const [duration, setDuration] = useState<number>(30);

  const handleAdd = () => {
    if (selectedPreset) {
      const calories = calculateCaloriesBurned(selectedPreset.met, userWeight, duration);
      onAddWorkout({
        name: selectedPreset.name,
        duration,
        calories,
        met: selectedPreset.met,
      });
      setSelectedPreset(null);
      setDuration(30);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 shadow-sm relative">
      <h3 className="text-sm font-semibold text-zinc-400 mb-3 px-2">Quick Add Workout</h3>
      
      {/* CSS mask creates a fading gradient effect on the right edge to indicate scrollable content */}
      <div 
        className="flex overflow-x-auto pb-2 gap-3 px-2 snap-x hide-scrollbar"
        style={{ maskImage: 'linear-gradient(to right, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
      >
        {WORKOUT_PRESETS.map((preset) => {
          const estCals = calculateCaloriesBurned(preset.met, userWeight, 30);
          return (
            <motion.button
              key={preset.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPreset(preset)}
              className="flex-shrink-0 snap-start bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-xl p-3 flex flex-col items-center justify-center min-w-[90px] border border-zinc-700/50"
            >
              <div className="text-emerald-500 mb-2">
                {iconMap[preset.icon] || <Zap className="w-5 h-5" />}
              </div>
              <span className="text-xs font-medium text-zinc-200 mb-1">{preset.name}</span>
              <span className="text-[10px] text-zinc-500">{Math.round(estCals)} kcal / 30m</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedPreset && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 bg-zinc-900/95 backdrop-blur-sm rounded-2xl p-4 flex flex-col justify-center items-center z-10"
          >
            <div className="flex justify-between items-center w-full mb-4">
              <span className="text-sm font-semibold text-zinc-100">
                {selectedPreset.name}
              </span>
              <button 
                onClick={() => setSelectedPreset(null)}
                className="p-1 text-zinc-400 hover:text-zinc-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-zinc-400 text-sm">Duration:</span>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg w-20 px-3 py-1 text-center"
              />
              <span className="text-zinc-400 text-sm">min</span>
            </div>

            <div className="text-sm text-emerald-400 mb-6 font-medium">
              ~ {Math.round(calculateCaloriesBurned(selectedPreset.met, userWeight, duration))} kcal burned
            </div>

            <button
              onClick={handleAdd}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              Add Workout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
