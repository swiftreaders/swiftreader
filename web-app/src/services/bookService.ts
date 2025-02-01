import { Category, Difficulty } from "@/types/text";
import axios from "axios";

const CORS_PROXY = "https://api.allorigins.win/get?url=";


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
const fetchBooks = async (subject: Category): Promise<Book[]> => {
  try {
    console.log("fetchBooks: waiting for list of books fetch");
    const response = await axios.get(GUTENDEX_API, {
      params: { topic: subject as string, languages: ["en"], mime_type: ["text/plain; charset=us-ascii"] },
    });
    const temp_books = response.data.results;

    console.log(`fetchBooks: ${temp_books.length} books fetched`);

    const books = temp_books
    .sort(() => 0.5 - Math.random())  // Shuffle the results
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

// Fetch the content of a specific book and classify its difficulty
const fetchBookContent = async (book: Book): Promise<Book> => {
  try {
    if (book.text_link === "NOT_FOUND") { 
      console.log("skipping book - text link not found", book.id);
      return { ...book, content: "COULD NOT FIND CONTENT", difficulty: Difficulty.EASY }; 
    }
    const response = await axios.get(
      CORS_PROXY + book.text_link
    );
    const fullText = response.data;
    console.log(typeof fullText, fullText);
    if (fullText.status.http_code == 200) {
      const excerpt = fullText
        .contents
        .split(" ")
        .slice(0, 300)
        .join(" ");

    // const excerpt = await getBookById(book.id);
    console.log("excerpt:", excerpt);
    // Process excerpt to remove unwanted characters
    const cleanedExcerpt = excerpt
      .replace(/[\n\r]/g, " ")
      .replace(/[^a-zA-Z0-9 ]/g, "");
    console.log("cleanedExcerpt:", cleanedExcerpt);
    const difficulty = classifyDifficulty(cleanedExcerpt); 
    return { ...book, content: cleanedExcerpt, difficulty };
    } else {
      console.log("skipping book: ", book.id);
      return { ...book, content: "COULD NOT FIND CONTENT", difficulty: Difficulty.EASY };
  
    } 
  } catch (error) {
    // console.error(`Error fetching content for book ${book.id}:`);
    console.log("skipping book: ", book.id);
    return { ...book, content: "COULD NOT FIND CONTENT", difficulty: Difficulty.EASY };
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
  const booksWithContent = await Promise.all(books.map(fetchBookContent));
  return filterBooks(booksWithContent, filters);
};