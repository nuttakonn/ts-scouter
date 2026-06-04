import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { GOOGLE_GENAI_API_KEY } from './config';

const genAI = new GoogleGenerativeAI(GOOGLE_GENAI_API_KEY);

interface KioskEvaluation {
  brand_name: string;
  category: string;
  kiosk_potential_score: number;
  reason: string;
  is_new_opening: boolean;
}

const schema = {
  type: SchemaType.OBJECT,
  properties: {
    brand_name: { type: SchemaType.STRING, description: 'Name of the brand or shop' },
    category: { type: SchemaType.STRING, description: 'Business category (e.g., Cafe, Fashion, Gadget)' },
    kiosk_potential_score: { type: SchemaType.NUMBER, description: 'Probability that this is a kiosk/small booth (0-100)' },
    reason: { type: SchemaType.STRING, description: 'Brief explanation for the score and findings' },
    is_new_opening: { type: SchemaType.BOOLEAN, description: 'True if this text describes a new or upcoming opening' },
  },
  required: ['brand_name', 'category', 'kiosk_potential_score', 'reason', 'is_new_opening'],
};

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: schema,
  },
});

export async function evaluateKioskPotential(text: string, mall: string): Promise<KioskEvaluation | null> {
  if (!GOOGLE_GENAI_API_KEY) {
    console.warn('AI Filter: Missing GOOGLE_GENAI_API_KEY. Skipping AI evaluation.');
    return null;
  }

  const prompt = `
    Analyze the following text scraped from a search result about ${mall}.
    Extract information about potential new shop openings or kiosks.
    
    Text: "${text}"
    Mall: "${mall}"
    
    Rules:
    - Focus on finding "new" openings, "coming soon", or "kiosks".
    - If the text is irrelevant or not about a specific brand opening, return a low score and set brand_name to "N/A".
    - Be concise in the reason.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText) as KioskEvaluation;
    } catch (parseError) {
      console.error('AI Filter: Error parsing JSON response', parseError);
      return null;
    }
  } catch (error: any) {
    if (error?.status === 429) {
      console.error('AI Filter: Rate limit hit (429).');
    } else {
      console.error('AI Filter: Error during Gemini API call:', error?.message || error);
    }
    return null;
  }
}
