export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }
}

export function calculateTDEE(bmr: number, activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'): number {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };
  return bmr * multipliers[activityLevel];
}

export function calculateDailyTargets(
  tdee: number, 
  bmr: number,
  currentWeight: number, 
  targetWeight: number, 
  targetDateStr: string
) {
  // Pure Recomposition Math based on user's specific formula:
  
  // 1. Deficit: Mild 400 kcal deficit for recomp
  const dailyDeficit = 400;
  let calorieTarget = tdee - dailyDeficit;
  
  // 2. Protein: 2g per kg of body weight
  const proteinTarget = currentWeight * 2;
  const proteinCalories = proteinTarget * 4;
  
  // 3. Fat: ~0.86g per kg of body weight (to match 65g for a 75kg person)
  const fatTarget = currentWeight * 0.86;
  const fatCalories = fatTarget * 9;
  
  // 4. Carbs: Remainder
  const remainingCalories = calorieTarget - proteinCalories - fatCalories;
  const carbsTarget = Math.max(remainingCalories / 4, 0);
  
  return {
    calorieTarget: Math.round(calorieTarget),
    proteinTarget: Math.round(proteinTarget),
    fatTarget: Math.round(fatTarget),
    carbsTarget: Math.round(carbsTarget),
    dailyDeficit: Math.round(dailyDeficit)
  };
}
