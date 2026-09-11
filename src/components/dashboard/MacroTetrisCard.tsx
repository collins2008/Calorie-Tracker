import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, X, Loader2 } from 'lucide-react';
import { getMacroTetrisSuggestions, TetrisSuggestion } from '../../lib/tetrisEngine';
import { DailySummary } from '../../lib/calorieEngine';

interface MacroTetrisCardProps {
  summary: DailySummary;
  onLogSuggestion: (suggestion: TetrisSuggestion) => Promise<void>;
}

export const MacroTetrisCard: React.FC<MacroTetrisCardProps> = ({ summary, onLogSuggestion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<TetrisSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const remainingPro = Math.max(summary.proteinTarget - summary.proteinConsumed, 0);
  const remainingCarbs = Math.max(summary.carbsTarget - summary.carbsConsumed, 0);
  const remainingFat = Math.max(summary.fatTarget - summary.fatConsumed, 0);

  const handleOpen = async () => {
    setIsOpen(true);
    setIsLoading(true);
    try {
      const results = await getMacroTetrisSuggestions(summary.remaining, remainingPro, remainingCarbs, remainingFat);
      setSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLog = async (suggestion: TetrisSuggestion) => {
    await onLogSuggestion(suggestion);
    setIsOpen(false);
  };

  // If there are less than 50 calories left, there's no space for Macro Tetris.
  if (summary.remaining < 50) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950/40 to-zinc-900/60 rounded-2xl p-[1px]">
      <div className="bg-zinc-900 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        {!isOpen ? (
          <button 
            onClick={handleOpen}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Brain size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100">Macro Tetris Engine</h3>
                <p className="text-xs text-emerald-500/80">Tap to see perfect meals for your remaining macros</p>
              </div>
            </div>
            <Plus size={20} className="text-zinc-500" />
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Brain size={18} />
                <h3 className="font-semibold text-sm">Suggested Fits</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={18} />
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-emerald-500/50" /></div>
            ) : suggestions.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">Not enough calories left for a meaningful meal suggestion.</p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {suggestions.map((sug, i) => (
                    <motion.div 
                      key={sug.description}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800/50 flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-zinc-200 text-sm">{sug.description}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-medium">
                            {sug.matchScore}% Match
                          </span>
                        </div>
                        <div className="flex gap-2 text-[11px] text-zinc-500">
                          <span>{sug.calories} kcal</span>
                          <span>• {sug.protein}g P</span>
                          <span>• {sug.carbs}g C</span>
                          <span>• {sug.fat}g F</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleLog(sug)}
                        className="w-8 h-8 rounded-full bg-emerald-500/10 hover:bg-emerald-500 hover:text-zinc-950 text-emerald-500 flex items-center justify-center transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
