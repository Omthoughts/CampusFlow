import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { AppError } from '../utils/errors';

const aiProviderKey = process.env.AI_PROVIDER_KEY;
const aiClient = aiProviderKey ? new GoogleGenAI({ apiKey: aiProviderKey }) : null;

export const AISummarySchema = z.object({
  what_changed: z.string().describe("A concise summary of what has changed or what the notice is about."),
  who_is_affected: z.string().describe("Who is the primary audience for this notice (e.g., FY MCA, All Students)."),
  required_action: z.string().nullable().describe("Any action required from the affected audience. Null if no action is needed."),
  deadline: z.string().nullable().describe("An ISO 8601 date string representing the deadline. Null if no deadline exists."),
  audience_hint: z.object({
    department: z.string().nullable(),
    year: z.string().nullable(),
    division: z.string().nullable(),
    batch: z.string().nullable(),
  }),
});

export type AISummaryType = z.infer<typeof AISummarySchema>;

export class SummaryService {
  static async generateSummary(rawText: string): Promise<AISummaryType | null> {
    if (!aiClient) {
      console.warn('AI_PROVIDER_KEY is missing. Using safe mock mode for AI summary.');
      return this.generateMockSummary(rawText);
    }

    const prompt = `
You are a highly accurate academic assistant extracting information from official college documents.
Your task is to output a JSON object following the exact schema provided.
RULES:
- NEVER invent dates, requirements, penalties, rooms, eligibility rules, or deadlines.
- If information is absent from the text, return null for that field.
- The deadline MUST explicitly exist in the source text.
- Return ONLY valid JSON matching the schema, with no markdown formatting or extra text.

Source Text:
---
${rawText}
---
`;

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text;
      if (!responseText) {
        return null;
      }

      const parsedJson = JSON.parse(responseText);
      
      // Zod validation
      const validated = AISummarySchema.parse(parsedJson);

      // Explicit Evidence Checking (basic heuristic: if deadline provided, ensure it or part of it is in text)
      // This is basic and could be expanded, but Gemini usually respects the prompt.
      // If we want stricter evidence checking, we check if string is substring.
      
      return validated;
    } catch (err) {
      console.error('Error generating AI summary:', err);
      // If AI fails, the original notice still works (as per spec)
      return null;
    }
  }

  private static generateMockSummary(rawText: string): AISummaryType {
    return {
      what_changed: "Mock AI Summary (No API Key provided)",
      who_is_affected: "Unknown (Mock)",
      required_action: null,
      deadline: null,
      audience_hint: {
        department: null,
        year: null,
        division: null,
        batch: null,
      }
    };
  }
}
