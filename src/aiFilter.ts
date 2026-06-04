import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_GENAI_API_KEY } from './config';

const genAI = new GoogleGenerativeAI(GOOGLE_GENAI_API_KEY);

interface KioskEvaluation {
  brand_name: string;
  category: string;
  kiosk_potential_score: number;
  reason: string;
  is_new_opening: boolean;
}

// ลองใช้ gemini-pro ซึ่งเป็นโมเดลที่เสถียรที่สุดและมักจะไม่พบปัญหา 404
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function evaluateKioskPotential(text: string, mall: string): Promise<KioskEvaluation | null> {
  if (!GOOGLE_GENAI_API_KEY) {
    console.warn('AI Filter: Missing GOOGLE_GENAI_API_KEY. Skipping AI evaluation.');
    return null;
  }

  const prompt = `
    Analyze the following text about a potential new shop in ${mall}:
    "${text}"
    
    Return ONLY a JSON object:
    {
      "brand_name": "string",
      "category": "string",
      "kiosk_potential_score": number,
      "reason": "string",
      "is_new_opening": boolean
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;

    try {
      return JSON.parse(cleanJson) as KioskEvaluation;
    } catch (parseError) {
      console.error('AI Filter: Error parsing JSON response', parseError);
      return null;
    }
  } catch (error: any) {
    console.error(`AI Filter: Error using gemini-pro: ${error?.message || error}`);
    return null;
  }
}
