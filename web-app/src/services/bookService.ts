import { Category, Difficulty } from "@/types/text";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CORS_PROXY = "https://api.allorigins.win/get?url=";
const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;  

/// Gutendex API base URL
const GUTENDEX_API = "https://gutendex.com/books";

// Define the types for the books and texts
export interface Book {
  id: string;
  title: string;
  author: string;
  subject: Category;
  difficulty: Difficulty;
  content: string;
  text_link: string;
  questions: Question[];  
}

export interface Excerpt {
  book_id: string;
  excerpt: string;
  questions: Question[];
}

export interface Question {
  question: string;
  choices: string[];
  answer: string;
}

interface FilterOptions {
  difficulty?: "easy" | "medium" | "hard";
  subjects?: string[];
  wordCount?: { min: number; max: number };
}

/// Helper function to classify text difficulty
const classifyDifficulty = (text: string): Difficulty => {
  const wordCount = text.split(" ").length;
  const averageWordLength = text
    .split(" ")
    .reduce((acc, word) => acc + word.length, 0) / wordCount;

  if (averageWordLength < 5) return Difficulty.EASY;
  if (averageWordLength < 7) return Difficulty.MEDIUM;
  return Difficulty.HARD;
};

const findTxtUrl = (data: { [key: string]: string }, id: string): string => {
  for (const [key, value] of Object.entries(data)) {
    console.log("key:", key, "value:", value);
    if (value.endsWith(".txt")) {
      console.log("found txt url:", value);
      return value;
    } else if (value.endsWith(".txt.utf-8")) {
      return `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;
    }
  }
  return "NOT_FOUND";
};

/// Fetch books from the Gutendex API
export const fetchBooks = async (subject: Category): Promise<Book[]> => {
  try {
    console.log("fetchBooks: waiting for list of books fetch");
    const response = await axios.get(GUTENDEX_API, {
      params: { topic: subject as string, languages: ["en"], mime_type: ["text/plain; charset=us-ascii"],
        copyright: "false"
       },
    });
    const temp_books = response.data.results;

    console.log(`fetchBooks: ${temp_books.length} books fetched`, temp_books.map((book: any) => book.title));

    const books = temp_books
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((book: any) => ({
      id: book.id,
      title: book.title,
      author: book.authors[0]?.name || "Unknown Author",
      subjects: subject,
      difficulty: Difficulty.EASY, // Placeholder difficulty
      text_link: findTxtUrl(book.formats || {}, book.id) || "NOT_FOUND",
      content: "", // fetch the content later
    }));

    console.log("books: ",books);
    
    return books;
  } catch (error) {
    console.error("Error fetching books from Gutendex:", error);
    return [];
  }
};

const findNaturalExcerpt = (text: string, targetWordCount: number): string => {
  const cleaned = text
    .replace(/(\r\n|\n|\r)/gm, " ") // Remove newlines
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/\[\d+\]/g, "") // Remove footnotes
    .trim();

  // Find sentence boundaries
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length === 0) return cleaned.split(/\s+/).slice(0, targetWordCount).join(" ");

  // Find random starting point
  let startIdx = Math.floor(Math.random() * Math.max(0, sentences.length - 5));
  let wordCount = 0;
  const selectedSentences = [];

  // Collect sentences until we reach target length
  for (let i = startIdx; i < sentences.length; i++) {
    const words = sentences[i].split(/\s+/).length;
    if (wordCount + words > targetWordCount) break;
    selectedSentences.push(sentences[i]);
    wordCount += words;
  }

  // Fallback if no sentences were selected
  if (selectedSentences.length === 0) {
    return cleaned.split(/\s+/).slice(0, targetWordCount).join(" ");
  }

  return selectedSentences.join(" ");
};

const filterTextUsingAI = async (content: string, wordLimit: number): Promise<{ excerpt: string, questions: any[] }> => {
  try {
    const gemini = new GoogleGenerativeAI(GEMINI_KEY ?? "");
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Identify and extract ONE continuous, meaningful excerpt from the following text that:
      1. Forms a coherent narrative or complete thought.
      2. Is between ${wordLimit * 0.8} and ${wordLimit} words.
      3. Maintains proper sentence structure.
      4. Avoids abrupt beginnings/endings.
      5. Where possible, do not choose text from the preface or author's notes.
s
      Additionally, generate at least 3 multiple-choice questions based on the excerpt:
      1. Each question should be derived solely from the content of the text.
      2. Each question should have 4 answer choices.
      3. The correct answer should be clear and unambiguous.

      Return the result in a format with the following structure without any additional text:
      \`\`\`json
      {
        "excerpt": "Your extracted text here",
        "questions": [
          {
            "question": "First question here",
            "choices": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Correct answer here"
          },
          {
            "question": "Second question here",
            "choices": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Correct answer here"
          },
          {
            "question": "Third question here",
            "choices": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Correct answer here"
          }
        ]
      }
      \`\`\`  

      Original text: ${content.slice(0, 7500)}`;

      // console.log("prompt: ", prompt);
      const result = await model.generateContent(prompt);
      const rawResponse = result.response.text().trim();
  
      // console.log("Raw AI Response: ", rawResponse);
  
      // Ensure we strip any unwanted formatting
      const jsonStart = rawResponse.indexOf("{");
      const jsonEnd = rawResponse.lastIndexOf("}");
      const cleanJson = rawResponse.slice(jsonStart, jsonEnd + 1);
  
      const response = JSON.parse(cleanJson);
  
      console.log("Parsed Content: ", response);
  
      // Verify AI response quality
      const isValid = response.excerpt && 
                      typeof response.excerpt === "string" && 
                      response.excerpt.split(/\s+/).length >= wordLimit * 0.8;
  
      return isValid ? response : { excerpt: findNaturalExcerpt(content, wordLimit), questions: [] };
    } catch (error) {
      console.error("AI filtering failed, using fallback:", error);
      return { excerpt: findNaturalExcerpt(content, wordLimit), questions: [] };
    }
};

// Updated fetchBookContent
export const fetchBookContent = async (book: Book, wordLimit: number): Promise<Book> => {
  try {
    if (book.text_link === "NOT_FOUND") {
      return { 
        ...book, 
        content: "CONTENT_UNAVAILABLE", 
        difficulty: Difficulty.EASY, 
        questions: [] 
      };
    }

    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(book.text_link)}`);
    const fullText = response.data.contents || "";

    // Get AI-generated excerpt & questions
    const aiResponse = await filterTextUsingAI(fullText, wordLimit);

    // Ensure AI response is valid
    const finalExcerpt = aiResponse.excerpt && aiResponse.excerpt.length > 0 
      ? aiResponse.excerpt 
      : findNaturalExcerpt(fullText, wordLimit);

    // Ensure word limit
    const trimmedExcerpt = finalExcerpt.split(/\s+/)
      .slice(0, wordLimit)
      .join(" ");

    const difficulty = classifyDifficulty(trimmedExcerpt);
    
    return { 
      ...book, 
      content: trimmedExcerpt,
      difficulty,
      questions: aiResponse.questions || [] 
    };
  } catch (error) {
    console.error(`Error processing ${book.title}:`, error);
    return { 
      ...book, 
      content: "CONTENT_UNAVAILABLE", 
      difficulty: Difficulty.EASY, 
      questions: []  
    };
  }
};


/// Filter books based on criteria
const filterBooks = (books: Book[], filters: FilterOptions): Book[] => {
  return books.filter((book) => {
    if (book.content === "CONTENT_UNAVAILABLE") return false;

    const meetsDifficulty =
      !filters.difficulty || book.difficulty === filters.difficulty;
    const meetsWordCount =
      !filters.wordCount ||
      (book.content.split(" ").length >= filters.wordCount.min &&
        book.content.split(" ").length <= filters.wordCount.max);

    console.log("filterBooks: ", meetsDifficulty, meetsWordCount);
    return meetsDifficulty && meetsWordCount;
  });
};

/// Service to retrieve texts from Gutendex
export const getTexts = async (
  subject: Category,
  filters: FilterOptions
): Promise<Book[]> => {
  const books = await fetchBooks(subject);
  console.log("bookService.ts - getTexts:", books.map((book) => book.title));

  // Ensure word limit fallback exists
  const wordLimit = filters.wordCount?.max ?? 500;

  // Fetch book contents with AI processing
  const booksWithContent = await Promise.all(
    books.map(book => fetchBookContent(book, wordLimit))
  );

  return filterBooks(booksWithContent, filters);
};