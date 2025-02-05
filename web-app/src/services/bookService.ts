import { Category, Difficulty } from "@/types/text";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CORS_PROXY = "https://api.allorigins.win/get?url=";
const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;  //  add this in for the ai fucniton to work 

// Define the types for the books and texts
export interface Book {
  id: string;
  title: string;
  author: string;
  subject: Category;
  difficulty: Difficulty;
  content: string;
  text_link: string;
}

interface FilterOptions {
  difficulty?: "easy" | "medium" | "hard";
  subjects?: string[];
  wordCount?: { min: number; max: number };
}

/// Gutendex API base URL
const GUTENDEX_API = "https://gutendex.com/books";

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

const filterTextUsingAI = async (content: string, wordLimit: number): Promise<string> => {
  try {
    const gemini = new GoogleGenerativeAI(GEMINI_KEY ?? "");
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Identify and extract ONE continuous, meaningful excerpt from the following text that:
      1. Forms a coherent narrative or complete thought
      2. Is between ${wordLimit * 0.8} and ${wordLimit} words
      3. Maintains proper sentence structure
      4. Avoids abrupt beginnings/endings

      Return ONLY the excerpt text with no additional commentary or formatting.
      Original text: ${content.slice(0, 7500)}`; // Cut to stay in the token limit 

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    // Verify AI response quality
    const isValid = response && !response.includes("I cannot") 
      && response.split(/\s+/).length >= wordLimit * 0.8;

    return isValid ? response : findNaturalExcerpt(content, wordLimit);
  } catch (error) {
    console.error("AI filtering failed, using fallback:", error);
    return findNaturalExcerpt(content, wordLimit);
  }
};

// Updated fetchBookContent
export const fetchBookContent = async (book: Book, wordlimit: number): Promise<Book> => {
  try {
    if (book.text_link === "NOT_FOUND") {
      return { ...book, content: "CONTENT_UNAVAILABLE", difficulty: Difficulty.EASY };
    }

    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(book.text_link)}`);
    const fullText = response.data.contents || "";
    
    // Get AI-curated excerpt
    const aiExcerpt = await filterTextUsingAI(fullText, wordlimit);
    
    // Fallback to natural excerpt if AI failed
    const finalExcerpt = aiExcerpt.startsWith("CONTENT_UNAVAILABLE") 
      ? findNaturalExcerpt(fullText, wordlimit)
      : aiExcerpt;

    // Ensure word limit
    const trimmedExcerpt = finalExcerpt.split(/\s+/)
      .slice(0, wordlimit)
      .join(" ");

    const difficulty = classifyDifficulty(trimmedExcerpt);
    
    return { 
      ...book, 
      content: trimmedExcerpt,
      difficulty 
    };
  } catch (error) {
    console.error(`Error processing ${book.title}:`, error);
    return { ...book, content: "CONTENT_UNAVAILABLE", difficulty: Difficulty.EASY };
  }
};

/// Filter books based on criteria
const filterBooks = (books: Book[], filters: FilterOptions): Book[] => {
  return books.filter((book) => {
    if (book.content == "COULD NOT FIND CONTENT") return false;

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
  const booksWithContent = await Promise.all(books.map(fetchBookContent, filters.wordCount?.max ?? 500));
  filterBooks(booksWithContent, filters);
  return booksWithContent;
  // return filterBooks(booksWithContent, filters);
};