import { UserProfile, StreakData } from './db';
import { DailySummary } from './calorieEngine';

export function generateAdvice(summary: DailySummary, profile: UserProfile, streakData: StreakData): string[] {
  const advice: string[] = [];

  if (summary.proteinConsumed < profile.dailyProteinTarget * 0.8) {
    advice.push('Struggling to hit protein on a student budget? Add crayfish powder to your stews, eat boiled eggs, beans (ewa), groundnuts, or soya (awara). They are cheap and protein-dense!');
  }

  if (summary.deficit > 700) {
    advice.push('You are in a large caloric deficit (>700 kcal). Be careful, as extreme deficits can increase the risk of muscle loss. Consider eating a little more.');
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

  if (summary.deficit > 0 && profile.targetWeight < profile.weight) {
    const weightToLose = profile.weight - profile.targetWeight;
    const dailyDeficit = summary.deficit;
    const daysToGoal = (weightToLose * 7700) / dailyDeficit;
    const weeksToGoal = Math.round(daysToGoal / 7);
    if (weeksToGoal > 0 && weeksToGoal < 100) {
      advice.push(`At this pace, you could reach your target weight in about ${weeksToGoal} weeks!`);
    }
  }

  const fatCals = summary.fatConsumed * 9;
  const totalCals = summary.consumed || 1;
  if (fatCals / totalCals < 0.15 && totalCals > 500) {
    advice.push('Your fat intake is very low (<15%). Remember that dietary fat is essential for hormone regulation.');
  }

  return advice.slice(0, 3);
}
