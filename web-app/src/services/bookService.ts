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
// const classifyDifficulty = (text: string): Difficulty => {
//   const wordCount = text.split(" ").length;
//   const averageWordLength = text
//     .split(" ")
//     .reduce((acc, word) => acc + word.length, 0) / wordCount;

//   if (averageWordLength < 5) return Difficulty.EASY;
//   if (averageWordLength < 7) return Difficulty.MEDIUM;
//   return Difficulty.HARD;
// };

const findTxtUrl = (data: { [format: string]: string }, id: string, title: string): string => {
  for (const [format, url] of Object.entries(data)) {
    console.log("book:", title, "format:", format, "url:", url);
    if (url.endsWith(".txt")) {
      console.log("found txt url:", url);
      return url;
    } else if (url.endsWith(".txt.utf-8")) {
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
      page: Math.floor(Math.random() * 10) + 1
      },
    });

    // Manually filter for english books as some were still non-english
    const temp_books = response.data.results.filter(
      (book: any) => Array.isArray(book.languages) && book.languages.includes("en")
    );

    console.log(temp_books);
    
    console.log(`fetchBooks: ${temp_books.length} books fetched`, temp_books.map((book: any) => book.title));

    const books = temp_books
    .sort(() => Math.random())
    .slice(0, 5)
    .map((book: any) => ({
      id: book.id,
      title: book.title,
      author: book.authors[0]?.name || "Unknown Author",
      subject: genre,
      difficulty: Difficulty.EASY, // Placeholder difficulty
      text_link: findTxtUrl(book.formats || {}, book.id, book.title) || "NOT_FOUND",
      content: "", // fetch the content later
    }));

    console.log("books: ",books);
    
    return books;
  } catch (error) {
    console.error("Error fetching books from Gutendex:", error);
    return [];
  }
};

// const findNaturalExcerpt = (text: string, targetWordCount: number): string => {
//   const cleaned = text
//     .replace(/(\r\n|\n|\r)/gm, " ") // Remove newlines
//     .replace(/\s+/g, " ") // Collapse whitespace
//     .replace(/\[\d+\]/g, "") // Remove footnotes
//     .trim();

//   // Find sentence boundaries
//   const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
//   if (sentences.length === 0) return cleaned.split(/\s+/).slice(0, targetWordCount).join(" ");

//   // Find random starting point
//   const startIdx = Math.floor(Math.random() * Math.max(0, sentences.length - 5));
//   let wordCount = 0;
//   const selectedSentences = [];

//   // Collect sentences until we reach target length
//   for (let i = startIdx; i < sentences.length; i++) {
//     const words = sentences[i].split(/\s+/).length;
//     if (wordCount + words > targetWordCount) break;
//     selectedSentences.push(sentences[i]);
//     wordCount += words;
//   }

//   // Fallback if no sentences were selected
//   if (selectedSentences.length === 0) {
//     return cleaned.split(/\s+/).slice(0, targetWordCount).join(" ");
//   }

//   return selectedSentences.join(" ");
// };

const filterTextUsingAI = async (content: string, minWords: number, maxWords: number): Promise<{ excerpt: string, questions: any[], isValid: boolean, difficulty: Difficulty }> => {
  try {
    const gemini = new GoogleGenerativeAI(GEMINI_KEY ?? "");
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Task: Analyze the given text and return a structured JSON response following these steps:

    Extract a meaningful excerpt such that it:
      Forms a coherent narrative or complete thought,
      Has over ${minWords} words and STRICTLY under ${maxWords} words
      Has proper sentence structure and punctuation,
      Excludes footnotes, headers, and non-content text,
      Has a natural beginning and ending - if you have to cut a sentence off at the end, 
      in order to maintain the word count, do so at a natural stopping point. Also, 
      if you absolutely must, you can edit a few words at the end to make it a natural stopping point, 
      but ensure to do so without drastically changing the meaning of the text.

    Clean the text by:
      Replacing all underscores (_) with spaces,
      Removing [?] placeholders and unclear references.

    Generate 4 multiple-choice questions such that: 
      Each question is based ONLY on the excerpt, 
      Each question has a very obvious answer which is not subjective,
      Each question has 4 choices,
      Only one choice is correct.

    Validate the excerpt, setting "isValid": true only if the text:
      Is part of the main text of a book and is NOT a preface or disclaimer,
      Is in English,
      Is NOT a play or poem.
    
    Determine the difficulty level of the text using the following guidelines:
      Easy: Simple language, short sentences, and common words,
      Medium: Moderate language complexity, longer sentences, and some uncommon words,
      Hard: Complex language, long sentences, and many uncommon words.
    
    Return JSON format with strict structure:
      \`\`\`json
      {
        "excerpt": "Cleaned text without underscores or [?]",
        "isValid": true/false,
        "difficulty": "easy/medium/hard",
        "questions": [
          {
            "question": "...",
            "choices": ["...", "...", "...", "..."],
            "answer": "..."
          }
        ]
      }
      \`\`\`
    Text to analyze: ${content.slice(0, 10000)}`;

    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text().trim();
    //console.log("AI response:", rawResponse);
    
    // Extract JSON response
    const jsonStart = rawResponse.indexOf("{");
    const jsonEnd = rawResponse.lastIndexOf("}");
    const cleanJson = rawResponse.slice(jsonStart, jsonEnd + 1);
    console.log("Cleaned JSON:", cleanJson);

    const response = JSON.parse(cleanJson);
    console.log("response:", response);
    
    // Clean and validate response
    const cleanedExcerpt = response.excerpt
      .replace(/_/g, " ")
      .replace(/\[\?\]/g, "")
      .trim();
    
    console.log("cleanedExcerpt:", cleanedExcerpt);

    const wordCount = cleanedExcerpt.split(/\s+/).length;
    const structureValid =  cleanedExcerpt.split(/\s+/).length >= maxWords * 0;

    // console.log("structureValid:", structureValid);

    const finalValidity = response.isValid && structureValid && 
      !/[\[\]{}]/.test(cleanedExcerpt) && // Check for remaining special chars
      wordCount <= maxWords * 1.9 &&
      !/gutendex/i.test(cleanedExcerpt); 
    // console.log("questions after cleaning:", response.questions);
    
    return {
      excerpt: cleanedExcerpt,
      questions: finalValidity ? response.questions : [],
      isValid: finalValidity, 
      difficulty: response.difficulty
    };

  } catch (error) {
    console.log("AI filtering failed:", error);
    return { 
      // excerpt: findNaturalExcerpt(content, maxWords),
      excerpt: "",
      questions: [],
      isValid: false, 
      difficulty: Difficulty.EASY
    };
  }
};


// Update fetchBookContent
export const fetchBookContent = async (book: Book, minWords: number, maxWords: number): Promise<Book> => {
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
    // console.log("fullText:", fullText.slice(1000, 2000));
    const aiResponse = await filterTextUsingAI(fullText, minWords, maxWords);
    console.log("questions:", aiResponse.questions);

    // Final cleaning and validation
    const finalExcerpt = aiResponse.excerpt
      .split(/\s+/)
      .slice(0, maxWords)
      .join(" ")
      .replace(/(\s[.,!?])/g, "$1") // Ensure proper punctuation spacing
      .trim();

    const difficulty = aiResponse.difficulty;
    
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

//todo
// @Sri it looks like this code is for handling errors when fetching books from Gutendex
// but I think it's redundant now...


// /// Filter books based on criteria
// const filterBooks = (books: Book[], filters: FilterOptions): Book[] => {
//   return books.filter((book) => {
//     // Ensure valid, available content meets criteria
//     const contentValid = book.isValid && 
//       book.content !== "CONTENT_UNAVAILABLE" &&
//       book.content.split(" ").length >= (filters.wordCount?.min || 1);

//     const meetsDifficulty = !filters.difficulty || 
//       book.difficulty === filters.difficulty;

//     return contentValid && meetsDifficulty;
//   });
// };

/// Service to retrieve texts from Gutendex
// export const getTexts = async (
//   genre: Genre,
//   filters: FilterOptions
// ): Promise<Book[]> => {
//   const books = await fetchBooks(genre);
//   console.log("bookService.ts - getTexts:", books.map((book) => book.title));

//   // Ensure word limit fallback exists
//   const wordLimit = filters.wordCount?.max ?? 500;

//   // Fetch book contents with AI processing
//   const booksWithContent = await Promise.all(
//     books.map(book => fetchBookContent(book, wordLimit))
//   );

//   return filterBooks(booksWithContent, filters);
// };