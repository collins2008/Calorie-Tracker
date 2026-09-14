import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, Dumbbell, Utensils, X } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useDailyLog } from '../../hooks/useDailyLog';
import { useStreak } from '../../hooks/useStreak';
import { getToday } from '../../lib/dateUtils';
import { useToast } from '../ui/Toast';

interface QuickAddFavoritesProps {
  currentDate: string;
}

export const QuickAddFavorites: React.FC<QuickAddFavoritesProps> = ({ currentDate }) => {
  const { savedMeals, savedWorkouts, removeFavorite } = useFavorites();
  const { addEntry } = useDailyLog(currentDate);
  const { checkIn } = useStreak();
  const { toast } = useToast();

  const allFavorites = [...savedMeals, ...savedWorkouts].sort((a, b) => b.createdAt - a.createdAt);

  if (allFavorites.length === 0) return null;

  const handleAdd = async (item: any) => {
    await addEntry({
      date: currentDate,
      type: item.type,
      mealCategory: item.type === 'meal' ? 'snack' : undefined, // default to snack for quick add, user can edit later if needed or we could store category
      description: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      duration: item.duration,
    });
    await checkIn();
    toast(`Logged ${item.name}`, 'success');
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 px-2">
        <Star size={16} className="text-amber-400 fill-amber-400" />
        <h3 className="text-sm font-semibold text-zinc-400">Saved Favorites</h3>
      </div>
      
      <div 
        className="flex overflow-x-auto pb-4 gap-3 px-2 snap-x hide-scrollbar"
        style={{ maskImage: 'linear-gradient(to right, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
      >
        <AnimatePresence>
          {allFavorites.map((fav) => (
            <motion.div
              key={fav.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-shrink-0 snap-start bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between min-w-[140px] max-w-[160px] relative group"
            >
              <button 
                onClick={() => removeFavorite(fav.id!)}
                className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                aria-label="Remove favorite"
              >
                <X size={14} />
              </button>

              <div className="mb-3 pr-6">
                <div className="flex items-center gap-1.5 mb-1 text-zinc-400">
                  {fav.type === 'workout' ? <Dumbbell size={12} className="text-emerald-500" /> : <Utensils size={12} className="text-blue-500" />}
                  <span className="text-[10px] uppercase tracking-wider font-semibold">{fav.type}</span>
                </div>
                <h4 className="text-sm font-medium text-zinc-200 line-clamp-2 leading-snug">{fav.name}</h4>
              </div>

              <div>
                <div className="text-xs text-zinc-500 mb-3">
                  {fav.type === 'workout' ? (
                    <span className="text-emerald-400 font-medium">{fav.calories} kcal burned</span>
                  ) : (
                    <span><strong className="text-zinc-300 font-medium">{fav.calories}</strong> kcal</span>
                  )}
                </div>
                
                <button
                  onClick={() => handleAdd(fav)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <Check size={14} /> Log
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
