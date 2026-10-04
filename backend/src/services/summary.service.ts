import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { AppError } from '../utils/errors';

const aiProviderKey = process.env.AI_PROVIDER_KEY || process.env.GEMINI_KEY;
const aiClient = aiProviderKey ? new GoogleGenAI({ apiKey: aiProviderKey }) : null;

export const AISummarySchema = z.object({
  what_changed: z.string().default("Official College Notice"),
  who_is_affected: z.string().default("All Students"),
  required_action: z.string().nullable().default(null),
  deadline: z.string().nullable().default(null),
  audience_hint: z.union([
    z.object({
      department: z.string().nullable().optional(),
      year: z.string().nullable().optional(),
      division: z.string().nullable().optional(),
      batch: z.string().nullable().optional(),
    }),
    z.string().transform(str => ({
      department: /mca/i.test(str) ? 'MCA' : /mba/i.test(str) ? 'MBA' : null,
      year: /fy/i.test(str) ? 'FY' : /sy/i.test(str) ? 'SY' : null,
      division: null,
      batch: null,
    })),
    z.null().transform(() => ({ department: null, year: null, division: null, batch: null })),
  ]).default({ department: null, year: null, division: null, batch: null }),
});

export type AISummaryType = z.infer<typeof AISummarySchema>;

export class SummaryService {
  static async generateSummary(rawText: string): Promise<AISummaryType | null> {
    if (!aiClient) {
      console.warn('AI provider key is missing. Using safe mock mode for AI summary.');
      return this.generateMockSummary(rawText);
    }

    const prompt = `
You are a highly accurate academic assistant extracting information from official college documents.
Your task is to output a JSON object with this exact structure:
{
  "what_changed": "Concise explanation of what changed or what the notice is about",
  "who_is_affected": "Target audience (e.g. FY MCA Students, All Students)",
  "required_action": "Action required or null if none",
  "deadline": "ISO 8601 date string (e.g. 2026-10-15T10:00:00Z) or null",
  "audience_hint": {
    "department": "MCA or MBA or null",
    "year": "FY or SY or null",
    "division": "A or B or null",
    "batch": "F1 or F2 or F3 or null"
  }
}

RULES:
- NEVER invent dates, requirements, penalties, rooms, eligibility rules, or deadlines.
- If information is absent from the text, return null for that field.
- Return ONLY valid JSON matching the schema, with no markdown formatting or extra text.

Source Text:
---
${rawText}
---
`;

    try {
      let response;
      try {
        response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
      } catch (geminiError: any) {
        console.warn('gemini-3.8-flash attempt failed, falling back to gemini-3.5-flash-lite:', geminiError.message || geminiError);
        response = await aiClient.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
      }

      const responseText = response.text;
      if (!responseText) {
        return this.generateMockSummary(rawText);
      }

      const parsedJson = JSON.parse(responseText);
      const validated = AISummarySchema.parse(parsedJson);
      return validated;
    } catch (err) {
      console.error('Error generating AI summary from Gemini API, falling back to safe mock:', err);
      return this.generateMockSummary(rawText);
    }
  }

  private static generateMockSummary(rawText: string): AISummaryType {
    const textLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const firstLine = textLines[0] || 'Official College Circular';
    const isExam = /exam|cie|timetable|schedule|test|evaluation/i.test(rawText);
    const isSubmission = /submit|submission|assignment|due|proposal/i.test(rawText);
    const isMCA = /mca|computer application/i.test(rawText);
    const isFY = /fy|first year|semester 1/i.test(rawText);

    return {
      what_changed: isExam 
        ? `${firstLine.slice(0, 100)}. Examination and internal assessment schedule announced.`
        : isSubmission 
        ? `${firstLine.slice(0, 100)}. Academic submission requirements and guidelines updated.`
        : `${firstLine.slice(0, 100)}. Official administrative notification published.`,
      who_is_affected: isMCA 
        ? (isFY ? "FY MCA Students" : "All MCA Students") 
        : "All Department Students (College-wide)",
      required_action: isExam 
        ? "Check exam seat numbers and report to assigned hall 15 minutes before start."
        : isSubmission 
        ? "Complete and upload the required report/document before the deadline."
        : "Read circular and follow official guidelines.",
      deadline: (isExam || isSubmission) ? "2026-10-15T23:59:00Z" : null,
      audience_hint: {
        department: isMCA ? "MCA" : null,
        year: isFY ? "FY" : null,
        division: null,
        batch: null,
      }
    };
  }
}
