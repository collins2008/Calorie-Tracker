import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { db } from '../lib/db';
import { useToast } from '../components/ui/Toast';
import { Save, Download, Trash2, Info, Key, User, Database } from 'lucide-react';
import { calculateBMR, calculateTDEE, calculateDailyTargets } from '../lib/bmrCalculator';

export default function SettingsPage() {
  const { profile, saveProfile } = useProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState<any>(profile || {});
  const [apiKey, setApiKey] = useState('');
  const [showRecalc, setShowRecalc] = useState(false);

  useEffect(() => {
    if (profile) setFormData(profile);
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === 'name' || name === 'gender' || name === 'activityLevel' ? value : Number(value),
    }));
    setShowRecalc(true);
  };

  const handleRecalculate = () => {
    if (!formData.targetDate) {
      toast('Please set a target date first', 'error');
      return;
    }
    const bmr = calculateBMR(formData.weight, formData.height, formData.age, formData.gender);
    const tdee = calculateTDEE(bmr, formData.activityLevel);
    const targets = calculateDailyTargets(tdee, bmr, formData.weight, formData.targetWeight, formData.targetDate);
    setFormData((prev: any) => ({
      ...prev,
      dailyCalorieTarget: targets.calorieTarget,
      dailyProteinTarget: targets.proteinTarget,
      dailyCarbsTarget: targets.carbsTarget,
      dailyFatTarget: targets.fatTarget,
    }));
    setShowRecalc(false);
    toast(`Targets recalculated (${targets.dailyDeficit} kcal deficit/day)`, 'info');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile(formData);
      toast('Profile saved', 'success');
    } catch {
      toast('Failed to save profile', 'error');
    }
  };

  // ... (keep rest of handlers)

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    toast('API Key saved', 'success');
  };

  const handleExportData = async () => {
    try {
      const allData = {
        profile: await db.profile.toArray(),
        dailyLogs: await db.dailyLogs.toArray(),
        weightEntries: await db.weightEntries.toArray(),
        streaks: await db.streaks.toArray(),
      };
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recomptracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Data exported', 'success');
    } catch {
      toast('Export failed', 'error');
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) {
      try {
        await Promise.all([
          db.profile.clear(),
          db.dailyLogs.clear(),
          db.weightEntries.clear(),
          db.streaks.clear(),
        ]);
        toast('All data cleared', 'info');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast('Failed to clear data', 'error');
      }
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-lg mx-auto py-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <div className="space-y-4 pb-20">
        {/* Profile Section */}
        <section className="bg-zinc-900 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-emerald-500" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Weight (kg)</label>
                <input type="number" step="0.1" name="weight" value={formData.weight || ''} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Height (cm)</label>
                <input type="number" name="height" value={formData.height || ''} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Age</label>
                <input type="number" name="age" value={formData.age || ''} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Gender</label>
                <select name="gender" value={formData.gender || 'male'} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Activity Level</label>
                <select name="activityLevel" value={formData.activityLevel || 'sedentary'} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly_active">Lightly Active</option>
                  <option value="moderately_active">Moderately Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Body Fat %</label>
                <input type="number" step="0.1" name="bodyFatPercentage" value={formData.bodyFatPercentage || ''} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Target Wt (kg)</label>
                <input type="number" step="0.1" name="targetWeight" value={formData.targetWeight || ''} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Target Date</label>
                <input type="date" name="targetDate" value={formData.targetDate || ''} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Daily Calories</label>
                  <input type="number" name="dailyCalorieTarget" value={formData.dailyCalorieTarget || ''} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Daily Protein (g)</label>
                  <input type="number" name="dailyProteinTarget" value={formData.dailyProteinTarget || ''} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                </div>
              </div>

              {showRecalc && (
                <button type="button" onClick={handleRecalculate}
                  className="w-full text-sm text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 py-2 rounded-xl transition-colors">
                  Recalculate targets based on new stats
                </button>
              )}
            </div>

            <button type="submit" className="w-full bg-emerald-500 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
              <Save size={18} /> Save Profile
            </button>
          </form>
        </section>

        {/* AI API Key */}
        <section className="bg-zinc-900 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key size={16} className="text-emerald-500" />
            <h2 className="font-semibold">AI Assistant</h2>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl flex gap-3 text-sm text-zinc-400 mb-4">
            <Info className="shrink-0 text-emerald-500 mt-0.5" size={16} />
            <p>Add your Google Gemini API key to enable AI-powered meal parsing. Without a key, the built-in food database is used.</p>
          </div>

          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button onClick={handleSaveApiKey}
              className="bg-zinc-800 hover:bg-zinc-700 px-5 rounded-xl font-medium transition-colors text-sm">
              Save
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-zinc-900 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} className="text-emerald-500" />
            <h2 className="font-semibold">Data</h2>
          </div>
          <div className="space-y-3">
            <button onClick={handleExportData}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl py-3 font-medium transition-colors text-sm">
              <Download size={16} /> Export Data (JSON)
            </button>
            <button onClick={handleClearData}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl py-3 font-medium transition-colors text-sm">
              <Trash2 size={16} /> Clear All Data
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center text-zinc-600 text-xs py-4">
          <p>RecompTracker v1.0.0</p>
          <p className="mt-1">Built for body recomposition 💪</p>
        </div>
      </div>
    </div>
  );
}
