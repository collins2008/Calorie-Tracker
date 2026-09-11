import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../../hooks/useProfile';
import { calculateBMR, calculateTDEE } from '../../lib/bmrCalculator';

export default function OnboardingModal() {
  const { saveProfile } = useProfile();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    weight: '',
    height: '',
    age: '',
    activityLevel: 'sedentary',
    targetWeight: '',
    targetDate: '',
    bodyFatPercentage: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleComplete = async () => {
    const weight = Number(formData.weight);
    const height = Number(formData.height);
    const age = Number(formData.age);
    const targetWeight = Number(formData.targetWeight);
    
    const bmr = calculateBMR(weight, height, age, formData.gender as 'male' | 'female');
    const tdee = calculateTDEE(bmr, formData.activityLevel as any);
    
    // We now use calculateDailyTargets properly
    import('../../lib/bmrCalculator').then(async ({ calculateDailyTargets }) => {
      const targets = calculateDailyTargets(tdee, bmr, weight, targetWeight, formData.targetDate);

      await saveProfile({
        name: formData.name,
        gender: formData.gender as 'male' | 'female',
        weight,
        height,
        age,
        activityLevel: formData.activityLevel as any,
        targetWeight,
        targetDate: formData.targetDate,
        bodyFatPercentage: formData.bodyFatPercentage ? Number(formData.bodyFatPercentage) : undefined,
        dailyCalorieTarget: targets.calorieTarget,
        dailyProteinTarget: targets.proteinTarget,
        dailyCarbsTarget: targets.carbsTarget,
        dailyFatTarget: targets.fatTarget,
      });
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to RecompTracker</h2>
              <p className="text-zinc-400">Let's set up your profile</p>
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">What should we call you?</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Biological Gender</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                  className={`py-3 rounded-xl border ${formData.gender === 'male' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}
                >
                  Male
                </button>
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                  className={`py-3 rounded-xl border ${formData.gender === 'female' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}
                >
                  Female
                </button>
              </div>
            </div>

            <button 
              onClick={handleNext}
              disabled={!formData.name}
              className="w-full bg-emerald-500 text-white rounded-xl py-4 font-semibold disabled:opacity-50 mt-8"
            >
              Continue
            </button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Your Stats</h2>
              <p className="text-zinc-400">Used to calculate your metabolic rate</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={handlePrev} className="px-6 py-4 rounded-xl bg-zinc-900 text-white font-semibold">Back</button>
              <button 
                onClick={handleNext}
                disabled={!formData.weight || !formData.height || !formData.age}
                className="flex-1 bg-emerald-500 text-white rounded-xl py-4 font-semibold disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Goals & Activity</h2>
              <p className="text-zinc-400">Tailoring your recomposition targets</p>
            </div>
            
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Activity Level</label>
              <select 
                name="activityLevel" 
                value={formData.activityLevel} 
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
              >
                <option value="sedentary">Sedentary (Office job, little exercise)</option>
                <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                <option value="very_active">Very Active (6-7 days/week)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Target Wt (kg)</label>
                <input type="number" name="targetWeight" value={formData.targetWeight} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Target Date</label>
                <input type="date" name="targetDate" value={formData.targetDate} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Body Fat % (Optional)</label>
              <input type="number" name="bodyFatPercentage" value={formData.bodyFatPercentage} onChange={handleChange} placeholder="e.g. 20" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={handlePrev} className="px-6 py-4 rounded-xl bg-zinc-900 text-white font-semibold">Back</button>
              <button 
                onClick={handleComplete}
                disabled={!formData.targetWeight || !formData.targetDate}
                className="flex-1 bg-emerald-500 text-white rounded-xl py-4 font-semibold disabled:opacity-50"
              >
                Complete Setup
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}
