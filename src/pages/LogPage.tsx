import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Send, Trash2, Dumbbell, UtensilsCrossed, Loader2 } from 'lucide-react';
import { useDailyLog } from '../hooks/useDailyLog';
import { useStreak } from '../hooks/useStreak';
import { parseNaturalLanguage } from '../lib/aiLogger';
import { getToday, formatDisplayDate, isToday as checkIsToday } from '../lib/dateUtils';
import { useToast } from '../components/ui/Toast';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '☀️ Lunch',
  dinner: '🌙 Dinner',
  snack: '🍿 Snacks',
};

export default function LogPage() {
  const [date, setDate] = useState(getToday());
  const { meals, workouts, allEntries, addEntry, updateEntry, deleteEntry, isLoading } = useDailyLog(date);
  const { checkIn } = useStreak();
  const { toast } = useToast();

  const [input, setInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handlePrevDay = () => setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'));
  const handleNextDay = () => setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsParsing(true);
    try {
      const apiKey = localStorage.getItem('gemini_api_key') || undefined;
      // FIX: Pass the UI's selected date, snapping the temporal boundary
      const parsed = await parseNaturalLanguage(input, date, apiKey);
      if (parsed) {
        await addEntry({ ...parsed, date }); // force exact date
        await checkIn();
        toast(`✅ Logged: ${parsed.description} (${parsed.calories} kcal)`, 'success');
        setInput('');
      } else {
        toast('Could not understand your input', 'error');
      }
    } catch (err: any) {
      console.error('Submit Error:', err);
      toast(`Error: ${err.message}`, 'error');
    } finally {
      setIsParsing(false);
    }
  };

  // Calculate totals from allEntries
  const totalConsumed = allEntries
    .filter(e => e.type === 'meal')
    .reduce((sum, e) => sum + (e.calories || 0), 0);

  const totalBurned = allEntries
    .filter(e => e.type === 'workout')
    .reduce((sum, e) => sum + (e.calories || 0), 0);

  const totalProtein = allEntries
    .filter(e => e.type === 'meal')
    .reduce((sum, e) => sum + (e.protein || 0), 0);

  return (
    <div className="max-w-lg mx-auto py-4">
        {/* Date Selector */}
      <div className="flex items-center justify-between mb-4 bg-zinc-900 rounded-2xl p-2">
        <button onClick={handlePrevDay} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
          <ChevronLeft size={20} className="text-zinc-400" />
        </button>
        <div className="text-center">
          <span className="font-medium">{formatDisplayDate(date)}</span>
          {checkIsToday(date) && <span className="ml-2 text-xs text-emerald-500 font-medium">Today</span>}
        </div>
        <button onClick={handleNextDay} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
          <ChevronRight size={20} className="text-zinc-400" />
        </button>
      </div>

      {/* AI Key Warning */}
      {!localStorage.getItem('gemini_api_key') && (
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-sm text-amber-400/90">
          <span className="text-lg">⚠️</span>
          <p>
            You are using the basic offline mock estimator. It cannot accurately parse portion sizes or complex meals. 
            <strong> Add your Gemini API Key in Settings</strong> for the dynamic AI estimator!
          </p>
        </div>
      )}

      {/* AI Input */}
      <form onSubmit={handleSubmit} className="mb-8 relative">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type '2 eggs and toast' or '15 min skipping'..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-4 pr-14 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          disabled={isParsing}
        />
        <button
          type="submit"
          disabled={!input.trim() || isParsing}
          className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-colors"
        >
          {isParsing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>

      {/* Entries */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-zinc-500" /></div>
      ) : allEntries.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 mt-4 backdrop-blur-sm"
        >
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-5 shadow-inner">
            <UtensilsCrossed size={32} className="text-zinc-600" />
          </div>
          <h3 className="font-semibold text-zinc-300 text-lg mb-1">Your Plate is Empty</h3>
          <p className="text-sm text-zinc-500 max-w-[250px] text-center leading-relaxed">
            Log your first meal or workout above to kickstart your daily progress.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6 mb-24">
          {/* Meals grouped by category */}
          {MEAL_ORDER.map(category => {
            const items = meals[category] || [];
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">{MEAL_LABELS[category]}</h3>
                <div className="space-y-2">
                  {items.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col bg-zinc-900 p-4 rounded-2xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-zinc-100">{entry.description}</p>
                          <div className="flex gap-3 text-xs text-zinc-500 mt-1 mb-2">
                            <span className="font-semibold text-zinc-300">{entry.calories} kcal</span>
                            {entry.protein > 0 && <span className="text-emerald-500/70">{entry.protein}g P</span>}
                            {entry.carbs > 0 && <span className="text-blue-500/70">{entry.carbs}g C</span>}
                            {entry.fat > 0 && <span className="text-amber-500/70">{entry.fat}g F</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const newCals = window.prompt(`Correct the calories for ${entry.description}:`, String(entry.calories));
                              if (newCals && !isNaN(Number(newCals))) {
                                entry.id !== undefined && updateEntry(entry.id, { calories: Number(newCals) });
                                toast('Calories updated', 'success');
                              }
                            }}
                            className="p-2 text-zinc-500 hover:text-emerald-400 transition-colors text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => entry.id !== undefined && deleteEntry(entry.id)}
                            className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Transparency: AI Reasoning */}
                      {entry.aiReasoning && (
                        <div className="mt-1 pt-2 border-t border-zinc-800/50 text-[10px] text-zinc-500 leading-relaxed font-mono">
                          <span className="text-emerald-500/50">AI Math:</span> {entry.aiReasoning}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Workouts */}
          {workouts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                <Dumbbell size={16} className="text-emerald-500" /> Workouts
              </h3>
              <div className="space-y-2">
                {workouts.map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-emerald-900/30"
                  >
                    <div>
                      <p className="font-medium text-emerald-400">{entry.description}</p>
                      <div className="flex gap-3 text-xs text-zinc-500 mt-1">
                        <span>Burned {entry.calories} kcal</span>
                        {entry.duration && <span>{entry.duration} min</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => entry.id !== undefined && deleteEntry(entry.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily Totals Bar */}
      {allEntries.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-3 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/50">
          <div className="max-w-lg mx-auto flex justify-between items-center text-sm">
            <div>
              <span className="text-zinc-500 text-xs">Consumed</span>
              <p className="font-bold text-lg tabular-nums">{totalConsumed} <span className="text-xs font-normal text-zinc-500">kcal</span></p>
            </div>
            <div className="text-center">
              <span className="text-zinc-500 text-xs">Burned</span>
              <p className="font-bold text-lg text-emerald-400 tabular-nums">{totalBurned} <span className="text-xs font-normal text-emerald-500/50">kcal</span></p>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 text-xs">Protein</span>
              <p className="font-bold text-lg text-emerald-400 tabular-nums">{totalProtein}<span className="text-xs font-normal text-emerald-500/50">g</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
