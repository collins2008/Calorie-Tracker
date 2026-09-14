import { WORKOUT_PRESETS } from './metValues';

export interface ParsedEntry {
  date: string;
  type: 'meal' | 'workout';
  mealCategory?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  duration?: number;
  aiReasoning?: string;
}

const MOCK_FOOD_DATABASE: Record<string, { calories: number, protein: number, carbs: number, fat: number }> = {
  'jollof rice': { calories: 350, protein: 8, carbs: 60, fat: 10 }, // per ~250g
  'eba': { calories: 400, protein: 2, carbs: 90, fat: 1 },
  'egusi': { calories: 500, protein: 25, carbs: 10, fat: 40 },
  'suya': { calories: 300, protein: 35, carbs: 5, fat: 15 },
  'pounded yam': { calories: 450, protein: 4, carbs: 105, fat: 1 },
  'moi moi': { calories: 150, protein: 12, carbs: 18, fat: 4 },
  'akara': { calories: 200, protein: 10, carbs: 15, fat: 10 },
  'plantain': { calories: 250, protein: 2, carbs: 65, fat: 1 },
  'egg': { calories: 70, protein: 6, carbs: 0, fat: 5 },
  'bread': { calories: 80, protein: 3, carbs: 15, fat: 1 },
  'rice': { calories: 200, protein: 4, carbs: 45, fat: 0 },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'pasta': { calories: 220, protein: 8, carbs: 43, fat: 1 },
  'oatmeal': { calories: 150, protein: 5, carbs: 27, fat: 3 },
  'banana': { calories: 105, protein: 1, carbs: 27, fat: 0 },
  'apple': { calories: 95, protein: 0, carbs: 25, fat: 0 },
  'milk': { calories: 120, protein: 8, carbs: 12, fat: 5 },
  'yogurt': { calories: 100, protein: 10, carbs: 15, fat: 0 },
};

function parseMockMode(input: string, clientDate: string, userWeight: number): ParsedEntry {
  const lowerInput = input.toLowerCase();
  const date = clientDate;
  
  for (const preset of WORKOUT_PRESETS) {
    if (lowerInput.includes(preset.name.toLowerCase())) {
      const estimatedCals = (preset.met * 3.5 * userWeight) / 200 * preset.defaultDurationMin;
      return {
        date, type: 'workout', description: preset.name,
        calories: Math.round(estimatedCals), protein: 0, carbs: 0, fat: 0, duration: preset.defaultDurationMin,
        aiReasoning: `Matched via workout preset (calculated for your specific ${userWeight}kg bodyweight).`
      };
    }
  }

  let calculatedCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  let descriptionParts: string[] = [];
  let reasoningParts: string[] = [];

  Object.entries(MOCK_FOOD_DATABASE).forEach(([food, macros]) => {
    if (lowerInput.includes(food)) {
      let multiplier = 1;
      const match = lowerInput.match(new RegExp(`(\\d+)\\s*${food}`));
      if (match) multiplier = parseInt(match[1], 10);

      calculatedCalories += macros.calories * multiplier;
      totalProtein += macros.protein * multiplier;
      totalCarbs += macros.carbs * multiplier;
      totalFat += macros.fat * multiplier;
      descriptionParts.push(`${multiplier !== 1 ? multiplier + 'x ' : ''}${food}`);
      reasoningParts.push(`Assumed ${multiplier}x ${food} (${macros.calories * multiplier} kcal)`);
    }
  });

  let totalCalories = calculatedCalories;
  const explicitCalMatch = lowerInput.match(/(\d+)\s*(cal|kcal|calories)/i);
  if (explicitCalMatch) {
    totalCalories = parseInt(explicitCalMatch[1], 10);
    reasoningParts.push(`Overrode calories to ${totalCalories} based on explicit input.`);
  }

  return {
    date,
    type: 'meal',
    mealCategory: 'snack',
    description: descriptionParts.length > 0 ? descriptionParts.join(', ') : input,
    calories: totalCalories || 200,
    protein: totalProtein || 10,
    carbs: totalCarbs || 20,
    fat: totalFat || 5,
    aiReasoning: reasoningParts.length > 0 ? reasoningParts.join(' | ') : 'Fallback generic estimate.'
  };
}

export async function parseNaturalLanguage(
  input: string, 
  clientDate: string, 
  apiKey?: string, 
  imageBase64?: string,
  userWeight: number = 75
): Promise<ParsedEntry> {
  if (!apiKey) {
    return parseMockMode(input, clientDate, userWeight);
  }

  const systemPrompt = `You are a highly intelligent expert nutritionist and data parser specializing in global cuisine, Nigerian cuisine, and body recomposition.
Current Date: ${clientDate}

INSTRUCTIONS:
Your primary goal is to dynamically and intelligently estimate the calories and macros of the user's meals. Do not be rigid; rely on your vast underlying knowledge of food science, cooking methods, and ingredient densities to give the most accurate real-world estimation possible.

1. If an image is provided, visually analyze the plate deeply. Take into account portion size, visible oils, sauces, and cooking methods.
2. If text is provided, use it to refine your visual estimation (e.g., if the user says "fried", account for extra oil).
3. Calculate the most likely, highly accurate macro breakdown for the entire meal.

NIGERIAN FOOD REFERENCE BANK:
Use this as a strong guiding baseline for local foods, but you MUST intelligently adjust based on the specific image context, portion size, or description:
- Jollof Rice: ~140 kcal, 3g Pro, 25g Carb, 4g Fat (per 100g)
- White Rice (boiled): ~130 kcal, 2.7g Pro, 28g Carb, 0.3g Fat
- Fried Plantain (Dodo): ~250 kcal, 2g Pro, 60g Carb, 10g Fat
- Eba (Garri): ~350 kcal, 2g Pro, 85g Carb, 1g Fat
- Pounded Yam: ~300 kcal, 4g Pro, 70g Carb, 1g Fat
- Egusi Soup: ~350 kcal, 15g Pro, 10g Carb, 25g Fat
- Nigerian Red Stew: ~200 kcal, 5g Pro, 12g Carb, 15g Fat
- Moi Moi: ~150 kcal, 10g Pro, 15g Carb, 5g Fat
- Akara: ~250 kcal, 12g Pro, 18g Carb, 15g Fat
- Suya (Beef): ~250 kcal, 30g Pro, 5g Carb, 12g Fat

VISUAL ESTIMATION HEURISTICS (For Reference):
- 1 fist size of rice/swallow = ~200g
- 1 thick slice of yam = ~100g
- 1 cooking spoon of stew = ~75g
- 1 standard piece of chicken/meat = ~80g

4. IF LOGGING A WORKOUT: The user's exact body weight is ${userWeight}kg. Calculate calories burned using standard MET formulas for a ${userWeight}kg person (e.g., Calories = MET * 3.5 * ${userWeight} / 200 * minutes). Set macros to 0.
5. Write a brief explanation of your thought process in the "aiReasoning" field so the user understands your intelligent estimation.

Parse into this STRICT JSON format only (NO markdown):
{
  "date": "YYYY-MM-DD",
  "type": "meal" | "workout",
  "mealCategory": "breakfast" | "lunch" | "dinner" | "snack",
  "description": "Cleaned up description (e.g. 'Boiled Rice & Stew')",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "duration": number, // omit for meals
  "aiReasoning": "Brief explanation of your intelligent estimation"
}`;

  // Update models to modern 2026 generation aliases
  const modelsToTry = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      let parts: any[] = [{ text: systemPrompt }];
      
      if (input.trim()) {
         parts.push({ text: input });
      } else if (!imageBase64) {
         throw new Error("Must provide either text or an image.");
      }

      if (imageBase64) {
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Data
          }
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      let response;
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }]
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await response.json();
      
      // If the API explicitly says model not found, try the next one in the loop
      if (data.error) {
        if (data.error.message.includes('not found') || data.error.message.includes('not supported')) {
          lastError = new Error(`Gemini API Error (${model}): ${data.error.message}`);
          continue; 
        }
        throw new Error(`Gemini API Error: ${data.error.message}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        // More robust JSON extraction to ignore markdown code blocks
        let jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e) {
            throw new Error('AI returned invalid JSON syntax');
          }
        } else {
          throw new Error('Failed to find JSON in AI response');
        }
      }
      
      throw new Error('No valid response from API');
    } catch (error: any) {
      lastError = error;
      // Only continue if it's our "not found" error caught above, otherwise throw
      if (!error.message?.includes('not found') && !error.message?.includes('not supported')) {
        console.error(`AI Parsing Error with ${model}:`, error);
        throw error;
      }
    }
  }

  // If all models failed, let's diagnostically fetch what models this API key ACTUALLY supports
  try {
    const diagRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const diagData = await diagRes.json();
    if (diagData.models) {
      const generateModels = diagData.models
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => m.name.replace('models/', ''));
      
      throw new Error(`Model not found. Your specific API key supports these models: ${generateModels.join(', ')}`);
    }
  } catch (diagError: any) {
    // If the diagnostic fails or we deliberately threw the diagnostic error above, pass it through
    if (diagError.message.includes('Your specific API key supports')) {
      throw diagError;
    }
  }

  // If diagnostic failed entirely, throw the original error
  console.error('All Gemini models failed. Last error:', lastError);
  throw lastError;
}
