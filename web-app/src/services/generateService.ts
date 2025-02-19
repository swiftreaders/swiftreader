import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question } from "@/types/text";

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export interface AIResponse {
  excerpt: string;
  questions: Question[];
  isValid: boolean;
}

/// Generate text using Gemini
export const generateTextUsingAI = async (
  prompt: string,
  wordLimit: number
): Promise<AIResponse> => {
  try {
    const gemini = new GoogleGenerativeAI(GEMINI_KEY ?? "");
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPrompt = `
      Generate a coherent passage of text based on the following theme:
      "${prompt}"
      - The passage must be ${wordLimit * 0.8}-${wordLimit} words long.
      - The passage should form a complete, meaningful narrative or idea.
      - It must have a natural start and end (no mid-sentence truncations).
      - The text must be in English and easy to read.

      Generate 4 multiple-choice questions based on this passage.
      Ensure only one answer is correct and the other options are plausible but incorrect.

      Return JSON format:
      \`\`\`json
      {
        "excerpt": "Generated passage",
        "isValid": true/false,
        "questions": [
          {
            "question": "...",
            "choices": ["...", "...", "...", "..."],
            "answer": "..."
          }
        ]
      }
      \`\`\`
    `;

    const result = await model.generateContent(fullPrompt);
    const rawResponse = result.response.text().trim();

    const jsonStart = rawResponse.indexOf("{");
    const jsonEnd = rawResponse.lastIndexOf("}");
    const cleanJson = rawResponse.slice(jsonStart, jsonEnd + 1);
    console.log("Gemini Generated JSON:", cleanJson);

    const response = JSON.parse(cleanJson);
    return response;
  } catch (error) {
    console.error("Error generating AI text:", error);
    return { excerpt: "", questions: [], isValid: false };
  }
};
