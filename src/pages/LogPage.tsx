import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Send, Trash2, Dumbbell, UtensilsCrossed, Loader2, Camera, WifiOff, RefreshCw, Image as ImageIcon, Star } from 'lucide-react';
import { useDailyLog } from '../hooks/useDailyLog';
import { useStreak } from '../hooks/useStreak';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { useFavorites } from '../hooks/useFavorites';
import { parseNaturalLanguage } from '../lib/aiLogger';
import { getToday, formatDisplayDate, isToday as checkIsToday } from '../lib/dateUtils';
import { useToast } from '../components/ui/Toast';
import { db } from '../lib/db';
import { compressImage } from '../lib/imageUtils';
import { QuickAddFavorites } from '../components/log/QuickAddFavorites';

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
  const { queue, processQueue, isSyncing } = useSyncQueue();
  const { addFavorite } = useFavorites();
  const { toast } = useToast();

  const [input, setInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handlePrevDay = () => setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'));
  const handleNextDay = () => setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd'));

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64Image = await compressImage(file, 800, 0.7);
      setImagePreview(base64Image);
    } catch (err) {
      toast('Failed to load image', 'error');
    }
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleQueueSave = async (reason: 'offline' | 'busy') => {
    await db.syncQueue.add({
      date,
      input,
      imageBase64: imagePreview || undefined,
      createdAt: Date.now()
    });
    
    if (reason === 'offline') {
      toast("You're offline. Meal saved to queue and will be analyzed later!", "info");
    } else {
      toast("API is busy. Meal saved to queue. Tap 'Retry' in the banner above when ready!", "info");
    }
    
    setInput('');
    setImagePreview(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !imagePreview) return;

    if (!navigator.onLine) {
      await handleQueueSave('offline');
      return;
    }

    setIsParsing(true);
    try {
      const apiKey = localStorage.getItem('gemini_api_key') || undefined;
      const userProfile = await db.profile.get('default');
      const userWeight = userProfile?.weight || 75;
      
      const parsed = await parseNaturalLanguage(input, date, apiKey, imagePreview || undefined, userWeight);
      if (parsed) {
        await addEntry({ ...parsed, date }); // force exact date
        await checkIn();
        toast(`✨ Logged: ${parsed.description} (${parsed.calories} kcal)`, 'success');
        setInput('');
        setImagePreview(null);
      } else {
        toast('Could not understand your input', 'error');
      }
    } catch (err: any) {
      console.error('Submit Error:', err);
      const msg = err.message?.toLowerCase() || '';
      const isNetworkError = msg.includes('fetch') || msg.includes('network');
      const isBusyError = err.message === 'QUOTA_EXCEEDED' || err.name === 'AbortError' || msg.includes('aborted');

      if (isNetworkError) {
        await handleQueueSave('offline');
      } else if (isBusyError) {
        await handleQueueSave('busy');
      } else {
        toast(`Error: ${err.message}`, 'error');
      }
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
        <button 
          onClick={handlePrevDay} 
          aria-label="Previous Day"
          className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ChevronLeft size={20} className="text-zinc-400" />
        </button>
        <div className="text-center">
          <span className="font-medium">{formatDisplayDate(date)}</span>
          {checkIsToday(date) && <span className="ml-2 text-xs text-emerald-500 font-medium">Today</span>}
        </div>
        <button 
          onClick={handleNextDay} 
          disabled={date >= getToday()}
          aria-label="Next Day"
          className="p-2 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-colors"
        >
          <ChevronRight size={20} className="text-zinc-400" />
        </button>
      </div>

      {/* Sync Queue Warning */}
      {queue.length > 0 && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-blue-400">
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            <span>{queue.length} meal(s) pending AI sync</span>
          </div>
          <button 
            onClick={processQueue} 
            disabled={isSyncing}
            className="flex items-center gap-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 transition-colors px-3 py-1.5 rounded-lg text-blue-300 font-medium disabled:opacity-50"
          >
            {isSyncing ? 'Retrying...' : 'Retry Now'}
          </button>
        </div>
      )}

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
      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-2">
        {imagePreview && (
          <div className="relative self-start">
            <img src={imagePreview} alt="Food preview" className="w-24 h-24 object-cover rounded-xl border border-zinc-700" />
            <button 
              type="button" 
              onClick={() => setImagePreview(null)}
              className="absolute -top-2 -right-2 bg-zinc-800 p-1 rounded-full border border-zinc-700 hover:bg-zinc-700"
            >
              <Trash2 size={14} className="text-zinc-300" />
            </button>
          </div>
        )}
          <div className="relative flex items-center">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleImageCapture}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              onChange={handleImageCapture}
              className="hidden"
            />
            <div className="absolute left-2 flex gap-1 z-10">
              <button
                type="button"
                aria-label="Take Photo"
                onClick={() => cameraInputRef.current?.click()}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
              >
                <Camera size={20} />
              </button>
              <button
                type="button"
                aria-label="Upload Photo"
                onClick={() => galleryInputRef.current?.click()}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
              >
                <ImageIcon size={20} />
              </button>
            </div>
            
            <textarea
              value={input}
              maxLength={2000}
              rows={Math.max(1, Math.min(4, input.split('\n').length))}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe food, or add text to your photo..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-24 pr-14 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none min-h-[56px] leading-relaxed"
              disabled={isParsing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if ((input.trim() || imagePreview) && !isParsing) {
                    // Trigger submit programmatically
                    const form = e.currentTarget.closest('form');
                    if (form) form.requestSubmit();
                  }
                }
              }}
            />
          <button
            type="submit"
            disabled={(!input.trim() && !imagePreview) || isParsing}
            className="absolute right-2 aspect-square flex items-center justify-center p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-colors"
          >
            {isParsing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </form>

      <QuickAddFavorites currentDate={date} />

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
                              addFavorite({
                                type: 'meal',
                                name: entry.description,
                                calories: entry.calories,
                                protein: entry.protein,
                                carbs: entry.carbs,
                                fat: entry.fat
                              });
                              toast('Saved to Favorites', 'success');
                            }}
                            className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                            aria-label="Save to favorites"
                          >
                            <Star size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const newCals = window.prompt(`Correct the calories for ${entry.description}:`, String(entry.calories));
                              const parsedCals = Number(newCals);
                              if (newCals && !isNaN(parsedCals) && parsedCals >= 0 && parsedCals < 10000) {
                                entry.id !== undefined && updateEntry(entry.id, { calories: Math.round(parsedCals) });
                                toast('Calories updated', 'success');
                              } else if (newCals) {
                                toast('Please enter a valid calorie amount', 'error');
                              }
                            }}
                            className="p-2 text-zinc-500 hover:text-emerald-400 transition-colors text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this meal?')) {
                                entry.id !== undefined && deleteEntry(entry.id);
                                toast('Meal deleted', 'info');
                              }
                            }}
                            aria-label="Delete meal"
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
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          addFavorite({
                            type: 'workout',
                            name: entry.description,
                            calories: entry.calories,
                            protein: entry.protein,
                            carbs: entry.carbs,
                            fat: entry.fat,
                            duration: entry.duration
                          });
                          toast('Saved to Favorites', 'success');
                        }}
                        className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                        aria-label="Save to favorites"
                      >
                        <Star size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this workout?')) {
                            entry.id !== undefined && deleteEntry(entry.id);
                            toast('Workout deleted', 'info');
                          }
                        }}
                        aria-label="Delete workout"
                        className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
