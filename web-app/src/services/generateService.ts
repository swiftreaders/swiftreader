import { GoogleGenerativeAI } from "@google/generative-ai";
import { Category, Difficulty, NewTextType, Question } from "@/types/text";

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

/// Generate multiple non-fiction texts using Gemini
export const fetchGeneratedTexts = async (
  category: Category,
  minWordLimit: number,
  maxWordLimit: number
): Promise<NewTextType[]> => {
  try {
    const gemini = new GoogleGenerativeAI(GEMINI_KEY ?? "");
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPrompt = `
    Generate 5 **non-fiction** passages based on the following category:
    "${category}"
    
    - These texts are for **reading comprehension practice**.
    - Each passage should be **factual, structured, and informative**.
    - Each passage must be between ${minWordLimit} and ${maxWordLimit} words.
    - Ensure proper grammar, coherence, and a natural beginning and end.

    Generate 4 multiple-choice questions per passage:
      - Each question is based **ONLY** on the passage.
      - Each question has exactly **4 answer choices**.
      - Only **one** choice is correct.
      - Format each choice as a **separate string in an array**.

    Classify difficulty using:
      - Easy: Simple language, short sentences, common words.
      - Medium: Moderate complexity, some uncommon words.
      - Hard: Complex language, long sentences, and many uncommon words.

    Return JSON format:
    \`\`\`json
    {
      "texts": [
        {
          "title": "Generated Passage Title",
          "content": "Generated passage text...",
          "difficulty": "easy/medium/hard",
          "questions": [
            {
              "question": "...",
              "choices": ["...", "...", "...", "..."],
              "answer": "..."
            }
          ]
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
    console.log("Generated JSON:", cleanJson);

    const response = JSON.parse(cleanJson);

    // Map AI response to match `GenText` structure
    const generatedTexts: NewTextType[] = response.texts.map((text: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      title: text.title,
      author: "AI Generated",
      difficulty: text.difficulty as Difficulty,
      content: text.content,
      text_link: "",
      isValid: true,
      isAI: true,
      category, // Only non-fiction
      questions: text.questions.map((q: any) => ({
        question: q.question,
        choices: q.choices.slice(0, 4), // Ensure exactly 4 choices
        answer: q.answer
      })) as Question[], // Ensure type matches
    }));

    return generatedTexts;
  } catch (error) {
    console.error("Error generating AI texts:", error);
    return [];
  }
};
