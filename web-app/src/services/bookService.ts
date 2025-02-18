import { Category, Difficulty, Genre } from "@/types/text";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question } from "@/types/text";

const CORS_PROXY = "https://api.allorigins.win/get?url=";
const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;  

/// Gutendex API base URL
const GUTENDEX_API = "https://gutendex.com/books";

// Define the types for the books and texts
export interface Book {
  id: string;
  title: string;
  author: string;
  subject: Genre;
  difficulty: Difficulty;
  content: string;
  text_link: string;
  questions: Question[];  
  isValid: boolean;
}

export interface Excerpt {
  book_id: string;
  excerpt: string;
  questions: Question[];
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
export const fetchBooks = async (genre: Genre): Promise<Book[]> => {
  try {
    console.log("fetchBooks: waiting for list of books fetch");
    const response = await axios.get(GUTENDEX_API, {
      params: { 
      topic: genre as string, 
      languages: ["en"], 
      mime_type: ["text/plain; charset=us-ascii"],
      copyright: "false", 
      page: Math.floor(Math.random() * 5) + 1
      },
    });
    const temp_books = response.data.results;
    console.log(temp_books);
    
    console.log(`fetchBooks: ${temp_books.length} books fetched`, temp_books.map((book: any) => book.title));

    const books = temp_books
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((book: any) => ({
      id: book.id,
      title: book.title,
      author: book.authors[0]?.name || "Unknown Author",
      subject: genre,
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
  const startIdx = Math.floor(Math.random() * Math.max(0, sentences.length - 5));
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

const filterTextUsingAI = async (content: string, wordLimit: number): Promise<{ excerpt: string, questions: any[], isValid: boolean }> => {
  try {
    const gemini = new GoogleGenerativeAI(GEMINI_KEY ?? "");
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Analyze the following text and perform these tasks:
      1. Extract ONE continuous, meaningful excerpt that:
         - Forms a coherent narrative/complete thought
         - Contains around ${wordLimit * 0.8}-${wordLimit} words and ends in a sentence terminator
         - Has proper sentence structure and punctuation
         - Avoids footnotes, headers, and non-content text
         - Has natural beginning/ending (no mid-sentence starts/ends)
      2. Remove ALL underscores and replace with spaces
      3. Remove ANY [?] placeholders or unclear references
      4. Generate 3 multiple-choice questions based ONLY on the excerpt 
      5. return true for the isValid field IF AND ONLY IF the excerpt meets the following criteria:
         - Readable and grammatically correct
         - No missing words or placeholder markers
         - Logical flow of ideas
         - text must be in english
         - the text is NOT a play or a poem

      Return JSON format with strict structure:
      \`\`\`json
      {
        "excerpt": "Cleaned text without underscores or [?]",
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

      Text to analyze: ${content.slice(0, 7500)}`;

    const prompt2 = `
    Task: Analyze the given text and return a structured JSON response following these steps:

    Extract a meaningful excerpt that:
    Forms a coherent narrative or complete thought
    Contains ${wordLimit * 0.8}-${wordLimit} words, ending at a sentence terminator
    Has proper sentence structure and punctuation
    Excludes footnotes, headers, and non-content text
    Begins and ends naturally (no mid-sentence truncation)
    Clean the text by:
    Replacing all underscores (_) with spaces
    Removing [?] placeholders and unclear references
    Generate 3 multiple-choice questions based only on the extracted excerpt
    Validate the excerpt, setting "isValid": true only if the text:
    Is readable, grammatically correct, and logically structured
    Has no missing words or placeholders
    Is in English
    Is NOT a play or poem
    
    Response Format (Strict JSON)
    {
      "excerpt": "Cleaned text without underscores or [?]",
      "isValid": true/false,
      "questions": [
        {
          "question": "...",
          "choices": ["...", "...", "...", "..."],
          "answer": "..."
        }
      ]
    }
    Text to analyze: ${content.slice(0, 7500)}`;

    const result = await model.generateContent(prompt2);
    const rawResponse = result.response.text().trim();
    console.log("AI response:", rawResponse);
    
    // Extract JSON response
    const jsonStart = rawResponse.indexOf("{");
    const jsonEnd = rawResponse.lastIndexOf("}");
    const cleanJson = rawResponse.slice(jsonStart, jsonEnd + 1);
    console.log("Cleaned JSON:", cleanJson);
    const response = JSON.parse(cleanJson);

    // Clean and validate response
    const cleanedExcerpt = response.excerpt
      .replace(/_/g, " ")
      .replace(/\[\?\]/g, "")
      .trim();

    const wordCount = cleanedExcerpt.split(/\s+/).length;
    const structureValid = cleanedExcerpt.match(/[.!?]$/) && 
      cleanedExcerpt.split(/\s+/).length >= wordLimit * 0.8;

    const finalValidity = response.isValid && structureValid && 
      !/[\[\]{}]/.test(cleanedExcerpt) && // Check for remaining special chars
      wordCount <= wordLimit * 1.2 &&
      !/gutendex/i.test(cleanedExcerpt); 

    return {
      excerpt: cleanedExcerpt,
      questions: finalValidity ? response.questions : [],
      isValid: finalValidity
    };

  } catch (error) {
    console.log("AI filtering failed:", error);
    return { 
      excerpt: findNaturalExcerpt(content, wordLimit),
      questions: [],
      isValid: false 
    };
  }
};


// Update fetchBookContent
export const fetchBookContent = async (book: Book, wordLimit: number): Promise<Book> => {
  try {
    if (book.text_link === "NOT_FOUND") {
      return { 
        ...book, 
        content: "CONTENT_UNAVAILABLE", 
        difficulty: Difficulty.EASY,
        questions: [],
        isValid: false
      };
    }

    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(book.text_link)}`);
    const fullText = response.data.contents || "";

    // Get AI-processed content
    const aiResponse = await filterTextUsingAI(fullText, wordLimit);
    console.log("questions:", aiResponse.questions);

    // Final cleaning and validation
    const finalExcerpt = aiResponse.excerpt
      .split(/\s+/)
      .slice(0, wordLimit)
      .join(" ")
      .replace(/(\s[.,!?])/g, "$1") // Ensure proper punctuation spacing
      .trim();

    const difficulty = classifyDifficulty(finalExcerpt);
    
    return { 
      ...book, 
      content: finalExcerpt,
      difficulty,
      questions: aiResponse.questions,
      isValid: aiResponse.isValid
    };
  } catch (error) {
    console.error(`Error processing ${book.title}:`, error);
    return { 
      ...book, 
      content: "CONTENT_UNAVAILABLE", 
      difficulty: Difficulty.EASY,
      questions: [],
      isValid: false
    };
  }
};


/// Filter books based on criteria
const filterBooks = (books: Book[], filters: FilterOptions): Book[] => {
  return books.filter((book) => {
    // Ensure valid, available content meets criteria
    const contentValid = book.isValid && 
      book.content !== "CONTENT_UNAVAILABLE" &&
      book.content.split(" ").length >= (filters.wordCount?.min || 1);

    const meetsDifficulty = !filters.difficulty || 
      book.difficulty === filters.difficulty;

    return contentValid && meetsDifficulty;
  });
};

/// Service to retrieve texts from Gutendex
export const getTexts = async (
  genre: Genre,
  filters: FilterOptions
): Promise<Book[]> => {
  const books = await fetchBooks(genre);
  console.log("bookService.ts - getTexts:", books.map((book) => book.title));

  // Ensure word limit fallback exists
  const wordLimit = filters.wordCount?.max ?? 500;

  // Fetch book contents with AI processing
  const booksWithContent = await Promise.all(
    books.map(book => fetchBookContent(book, wordLimit))
  );

  return filterBooks(booksWithContent, filters);
};