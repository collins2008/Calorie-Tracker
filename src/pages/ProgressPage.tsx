import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Plus, Target, Scale, Camera, Image as ImageIcon, Loader2, Wand2, Trash2 } from 'lucide-react';
import { useWeightHistory } from '../hooks/useWeightHistory';
import { useProfile } from '../hooks/useProfile';
import { useProgressPhotos } from '../hooks/useProgressPhotos';
import { useCorrelationData } from '../hooks/useCorrelationData';
import { CorrelationMatrixCard } from '../components/dashboard';
import { getToday } from '../lib/dateUtils';
import { useToast } from '../components/ui/Toast';
import { compressImage } from '../lib/imageUtils';
import { analyzeBodyComposition } from '../lib/aiVision';

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<'charts' | 'gallery'>('charts');
  const { profile, saveProfile } = useProfile();
  const { entries, latestWeight, weightChange, addWeightEntry } = useWeightHistory();
  const { photos, addPhoto, deletePhoto } = useProgressPhotos();
  const { data: correlationData } = useCorrelationData();
  const { toast } = useToast();
  
  const [newWeight, setNewWeight] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight < 20 || weight > 500) {
      toast('Please enter a valid weight between 20kg and 500kg.', 'error');
      return;
    }
    await addWeightEntry(getToday(), weight);
    toast(`Weight logged: ${weight} kg`, 'success');
    setNewWeight('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    let base64Image = '';
    
    try {
      base64Image = await compressImage(file, 800, 0.7);
    } catch (err: any) {
      toast('Failed to process image.', 'error');
      setIsScanning(false);
      return;
    }

    let estimatedBodyFat: number | undefined = undefined;
    const apiKey = localStorage.getItem('gemini_api_key');

    if (!apiKey) {
      toast('Saved photo! Add API key in settings for AI body fat scans.', 'info');
    } else {
      try {
        toast('Scanning physique...', 'info');
        const scanPromise = analyzeBodyComposition(base64Image, apiKey);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Analysis timed out. Please try again.")), 30000));
        const analysis = await Promise.race([scanPromise, timeoutPromise]) as any;
        estimatedBodyFat = analysis.estimatedBodyFat;
        toast(`Scan complete! Estimated Body Fat: ${estimatedBodyFat}%`, 'success');
      } catch (err: any) {
        console.error("AI Scan failed:", err);
        toast(`Photo saved, but AI failed: ${err.message}`, 'error');
      }
    }

    try {
      // Always save to Gallery regardless of AI success
      await addPhoto({
        date: getToday(),
        imageBase64: base64Image,
        weight: latestWeight || undefined,
        bodyFatPercentage: estimatedBodyFat
      });

      if (profile && estimatedBodyFat) {
        // await saveProfile({ ...profile, bodyFatPercentage: estimatedBodyFat });
      }
    } catch (err: any) {
      toast('Failed to save photo to gallery', 'error');
    } finally {
      setIsScanning(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this progress photo?")) {
      await deletePhoto(id);
      toast('Photo deleted.', 'info');
    }
  };

  const startingWeight = Number(profile?.startingWeight) || (entries.length > 0 ? entries[0].weight : profile?.weight || 0);
  const currentWeight = latestWeight || profile?.weight || 0;
  const targetWeight = profile?.targetWeight || 0;

  const totalChange = currentWeight - startingWeight;
  const goalDiff = startingWeight - targetWeight;
  const progressPercent = goalDiff !== 0
    ? Math.max(0, Math.min(100, ((startingWeight - currentWeight) / goalDiff) * 100))
    : 0;
  const remaining = Math.abs(currentWeight - targetWeight);

  let weeksToGoal: number | null = null;
  if (entries.length >= 2) {
    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];
    const daysDiff = (new Date(lastEntry.date).getTime() - new Date(firstEntry.date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 0) {
      const weeklyChange = ((firstEntry.weight - lastEntry.weight) / daysDiff) * 7;
      if (weeklyChange > 0.05 && remaining > 0) {
        weeksToGoal = Math.round(remaining / weeklyChange);
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto py-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-sm text-zinc-400">Track your body recomposition journey</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-zinc-900 rounded-xl p-1 mb-6" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'charts'}
          onClick={() => setActiveTab('charts')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'charts' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Data & Charts
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'gallery'}
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'gallery' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Photo Gallery
        </button>
      </div>

      {activeTab === 'charts' ? (
        <div className="space-y-4 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                  <Scale size={14} /> Current Weight
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums">{currentWeight.toFixed(1)}</span>
                  <span className="text-zinc-500">kg</span>
                </div>
              </div>
              {weightChange !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full ${
                  weightChange > 0 ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10'
                }`}>
                  {weightChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                </div>
              )}
            </div>

            <form onSubmit={handleLogWeight} className="flex gap-2">
              <input type="number" step="0.1" min="20" max="500" value={newWeight} onChange={e => setNewWeight(e.target.value)}
                placeholder="Enter today's weight..."
                aria-label="Today's weight"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              <button type="submit" disabled={!newWeight} className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 text-white px-5 rounded-xl font-medium flex items-center gap-2">
                <Plus size={18} /> Log
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <CorrelationMatrixCard data={correlationData} targetWeight={targetWeight} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-emerald-500" />
              <h3 className="font-semibold">Goal Progress</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>{startingWeight.toFixed(1)} kg</span>
                <span>{targetWeight.toFixed(1)} kg</span>
              </div>
              <div className="h-3 bg-zinc-950 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-5 mt-5 border-t border-zinc-800">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Change</p>
                <p className={`font-semibold ${totalChange <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} kg
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Remaining</p>
                <p className="font-semibold text-zinc-100">{remaining.toFixed(1)} kg</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">ETA</p>
                <p className="font-semibold text-zinc-100">{weeksToGoal ? `~${weeksToGoal} wks` : '—'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          <input
            type="file"
            accept="image/*"
            capture="user"
            ref={cameraInputRef}
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={handlePhotoUpload}
            className="hidden"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={isScanning}
              className="w-full bg-zinc-900 border border-dashed border-zinc-700 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors group"
            >
              <div className="w-12 h-12 bg-zinc-950 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera size={20} className="text-emerald-500" />
              </div>
              <span className="font-medium text-sm text-zinc-200">Take Photo</span>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Wand2 size={10}/> AI Scan</span>
            </button>

            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={isScanning}
              className="w-full bg-zinc-900 border border-dashed border-zinc-700 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors group"
            >
              <div className="w-12 h-12 bg-zinc-950 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon size={20} className="text-emerald-500" />
              </div>
              <span className="font-medium text-sm text-zinc-200">Upload Photo</span>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Wand2 size={10}/> AI Scan</span>
            </button>
          </div>

          {isScanning && (
            <div className="mt-4 bg-zinc-900 border border-emerald-900/50 rounded-xl p-4 flex items-center justify-center gap-3">
               <Loader2 size={24} className="text-emerald-500 animate-spin" />
               <div className="flex flex-col">
                 <span className="font-medium text-emerald-400 text-sm">AI Scanning Physique...</span>
                 <span className="text-xs text-zinc-500">Estimating Body Fat %</span>
               </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            {photos.map(photo => (
              <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
                <img src={photo.imageBase64} alt={`Progress photo from ${photo.date}`} loading="lazy" className="w-full aspect-[3/4] object-cover rounded-2xl bg-zinc-900" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl opacity-90" />
                
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-medium text-zinc-300">{photo.date}</p>
                  <div className="flex justify-between items-end mt-1">
                    <span className="font-bold text-sm">{photo.weight ? `${photo.weight}kg` : '--'}</span>
                    {photo.bodyFatPercentage && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {photo.bodyFatPercentage}% BF
                        </span>
                        {photo.weight && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {(photo.weight * (1 - (photo.bodyFatPercentage / 100))).toFixed(1)}kg LBM
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  aria-label="Delete photo"
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              </motion.div>
            ))}
          </div>

          {photos.length === 0 && !isScanning && (
            <div className="py-12 text-center text-zinc-500">
              <ImageIcon size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No progress photos yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
