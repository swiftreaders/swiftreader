import axios from "axios";

const CORS_PROXY = "https://api.allorigins.win/get?url=";

// Define the types for the books and texts
export interface Book {
  id: string;
  title: string;
  author: string;
  subjects: string[];
  difficulty: "easy" | "medium" | "hard";
  content: string;
}

interface FilterOptions {
  difficulty?: "easy" | "medium" | "hard";
  subjects?: string[];
  wordCount?: { min: number; max: number };
}

/// Gutendex API base URL
const GUTENDEX_API = "https://gutendex.com/books";

/// Helper function to classify text difficulty
const classifyDifficulty = (text: string): "easy" | "medium" | "hard" => {
  const wordCount = text.split(" ").length;
  const averageWordLength = text
    .split(" ")
    .reduce((acc, word) => acc + word.length, 0) / wordCount;

  if (averageWordLength < 5) return "easy";
  if (averageWordLength < 7) return "medium";
  return "hard";
};

/// Fetch books from the Gutendex API
const fetchBooks = async (subject: string): Promise<Book[]> => {
  try {
    console.log("fetchBooks: waiting for list of books fetch");
    const response = await axios.get(GUTENDEX_API, {
      params: { topic: subject, languages: ["en"], mime_type: "text/plain" },
    });

    const books = response.data.results
    .sort(() => 0.5 - Math.random())  // Shuffle the results
    .slice(0, 20)
    .map((book: any) => ({
      id: book.id,
      title: book.title,
      author: book.authors[0]?.name || "Unknown Author",
      subjects: book.subjects,
      difficulty: "easy", // Placeholder difficulty
      content: "", // fetch the content later
    }));

    return books;
  } catch (error) {
    console.error("Error fetching books from Gutendex:", error);
    return [];
  }
};

// Fetch the content of a specific book and classify its difficulty
const fetchBookContent = async (book: Book): Promise<Book> => {
  try {
    const response = await axios.get(
      `${CORS_PROXY}https://www.gutenberg.org/files/${book.id}/${book.id}-0.txt`
    );
    const fullText = response.data;
    console.log(typeof fullText, fullText);
    if (fullText.status.http_code == 200) {
      const excerpt = fullText
        .contents
        .split(" ")
        .slice(0, 300)
        .join(" ");

      // Process excerpt to remove unwanted characters
      const cleanedExcerpt = excerpt
        .replace(/[\n\r]/g, " ")
        .replace(/[^a-zA-Z0-9 ]/g, "");
      console.log("cleanedExcerpt:", cleanedExcerpt);
      const difficulty = classifyDifficulty(cleanedExcerpt);
  
      return { ...book, content: cleanedExcerpt, difficulty };
    }
    return { ...book, content: "COULD NOT FIND CONTENT", difficulty: "easy" };

    
    
  } catch (error) {
    console.error(`Error fetching content for book ${book.id}:`);
    return { ...book, content: "COULD NOT FIND CONTENT", difficulty: "easy" };
  }
};

/// Filter books based on criteria
const filterBooks = (books: Book[], filters: FilterOptions): Book[] => {
  return books.filter((book) => {
    if (book.content == "COULD NOT FIND CONTENT") return false;
    const meetsDifficulty =
      !filters.difficulty || book.difficulty === filters.difficulty;
    const meetsSubjects =
      !filters.subjects ||
      filters.subjects.some((subject) => book.subjects.includes(subject));
    const meetsWordCount =
      !filters.wordCount ||
      (book.content.split(" ").length >= filters.wordCount.min &&
        book.content.split(" ").length <= filters.wordCount.max);

    return meetsDifficulty && meetsSubjects && meetsWordCount;
  });
};


/// Service to retrieve texts from Gutendex
export const getTexts = async (
  subject: string,
  filters: FilterOptions
): Promise<Book[]> => {
  const books = await fetchBooks(subject);
  console.log("bookService.ts - getTexts:", books.map((book) => book.title));
  const booksWithContent = await Promise.all(books.map(fetchBookContent));
  return filterBooks(booksWithContent, filters);
};