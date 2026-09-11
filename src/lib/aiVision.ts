export interface BodyCompositionResult {
  estimatedBodyFat: number;
  estimatedMuscleMass?: number;
  reasoning: string;
}

export async function analyzeBodyComposition(base64Image: string, apiKey?: string): Promise<BodyCompositionResult> {
  if (!apiKey) {
    throw new Error('An API Key is required for image analysis.');
  }

  // The base64 string includes the data URI prefix (e.g., 'data:image/webp;base64,UklGR...').
  // We need to strip the prefix for the Gemini API.
  const mimeMatch = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!mimeMatch) {
    throw new Error('Invalid image format.');
  }

  const mimeType = mimeMatch[1];
  const base64Data = mimeMatch[2];

  const systemPrompt = `You are a highly advanced fitness AI specializing in visual body composition estimation.
The user has uploaded a photo of themselves. 
Your goal is to estimate their Body Fat Percentage.
Base your estimation on visual markers:
- Vascularity (veins on arms, shoulders, abs)
- Muscle separation and striations
- Abdominal definition (presence/absence of 4-pack, 6-pack)
- Overall softness vs hardness

CRITICAL: 
- Understand this is a highly subjective 2D visual estimate.
- Return a single conservative integer for the body fat percentage.
- Return a brief explanation of what visual markers led to this conclusion.

Return strict JSON (NO MARKDOWN):
{
  "estimatedBodyFat": number,
  "reasoning": "Brief explanation of visual markers"
}`;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        if (data.error.message.includes('not found') || data.error.message.includes('not supported')) {
          lastError = new Error(`Gemini API Error (${model}): ${data.error.message}`);
          continue; 
        }
        throw new Error(`Gemini API Error: ${data.error.message}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error(`Failed to find JSON in response: ${text}`);
        }
      }
      
      throw new Error('No valid response from API');
    } catch (error: any) {
      lastError = error;
      if (!error.message?.includes('not found') && !error.message?.includes('not supported')) {
        throw error;
      }
    }
  }

  throw lastError;
}
