import { UserProfile, StreakData } from './db';
import { DailySummary } from './calorieEngine';

export function generateAdvice(summary: DailySummary, profile: UserProfile, streakData: StreakData): string[] {
  const advice: string[] = [];

  if (summary.proteinConsumed < profile.dailyProteinTarget * 0.8) {
    advice.push('Struggling to hit protein on a student budget? Add crayfish powder to your stews, eat boiled eggs, beans (ewa), groundnuts, or soya (awara). They are cheap and protein-dense!');
  }

  // Check if they planned a massive deficit
  const plannedDeficit = summary.tdee - profile.dailyCalorieTarget;
  if (plannedDeficit > 700) {
    advice.push('Your daily calorie target puts you in a large deficit (>700 kcal/day). Be careful, as extreme deficits can increase the risk of muscle loss.');
  } else if (summary.deficit > 1000 && summary.consumed > 1000) {
    // If they ate a bit but still have a massive deficit (e.g. huge workout or end of day)
    advice.push('You are in a massive caloric deficit today. Consider eating a bit more to fuel recovery and prevent muscle breakdown.');
  }

  const surplus = summary.consumed - summary.tdee - summary.burned;
  if (surplus > 200) {
    advice.push('You are currently in a surplus. A quick 30-minute walk could help balance your energy for the day.');
  }

  if (streakData.currentStreak >= 7 && streakData.currentStreak % 7 === 0) {
    advice.push("Congratulations on your streak! You've earned a freeze. Keep up the consistency!");
  }
  
  if (streakData.currentStreak === 0) {
    advice.push("Every day is a fresh start. Let's crush your goals today!");
  }

  if (summary.deficit > 0 && summary.deficit <= 500 && summary.proteinConsumed >= profile.dailyProteinTarget * 0.9) {
    advice.push('You are doing great! Hitting your protein goals while maintaining a healthy deficit is perfect for body recomposition.');
  }

  if (profile.targetWeight < profile.weight && profile.targetDate) {
    const today = new Date();
    const targetDate = new Date(profile.targetDate);
    const daysRemaining = Math.max(1, (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksRemaining = Math.max(1, Math.round(daysRemaining / 7));
    
    if (daysRemaining < 300) {
      advice.push(`Stay consistent! You have about ${weeksRemaining} weeks to hit your target of ${profile.targetWeight}kg by ${targetDate.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}.`);
    }
  }

  const fatCals = summary.fatConsumed * 9;
  const totalCals = summary.consumed || 1;
  if (fatCals / totalCals < 0.15 && totalCals > 500) {
    advice.push('Your fat intake is very low (<15%). Remember that dietary fat is essential for hormone regulation.');
  }

  return advice.slice(0, 3);
}
