import { fetchBooks, fetchBookContent } from "@/services/bookService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { Category, Difficulty, Genre, NewTextType } from "@/types/text";

jest.mock("axios");
jest.mock("@google/generative-ai");

describe("Book Service", () => {
  let mockGenerateContent: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  beforeAll(() => {
    mockGenerateContent = jest.fn();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch books from Gutendex API", async () => {
    axios.get.mockResolvedValue({
      data: {
        results: [
          {
            id: "123",
            title: "Sample Book",
            authors: [{ name: "Author Name" }],
            languages: ["en"],
            formats: { "text/plain": "https://example.com/sample.txt" },
          },
        ],
      },
    });

    const books: NewTextType[] = await fetchBooks(Genre.FANTASY, []);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(books.length).toBeGreaterThan(0);
    expect(books[0].title).toBe("Sample Book");
    expect(books[0].genre).toBe(Genre.FANTASY);
    expect(books[0].text_link).toBe("https://example.com/sample.txt");
  });

  test("should return an empty array if Gutendex API request fails", async () => {
    axios.get.mockRejectedValue(new Error("API Error"));

    const books = await fetchBooks(Genre.FANTASY, []);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(books).toEqual([]);
  });

  test("should fetch and filter book content using AI", async () => {
    axios.get.mockResolvedValue({ data: { contents: "This is a sample book text." } });

    const mockResponseText = `
      {
        "excerpt": "This is an AI-generated excerpt.",
        "isValid": true,
        "difficulty": "medium",
        "questions": [
          {
            "question": "What is the main idea?",
            "choices": ["A", "B", "C", "D"],
            "answer": "A"
          }
        ]
      }
    `;

    mockGenerateContent.mockResolvedValue({
      response: {
        text: jest.fn().mockReturnValue(mockResponseText),
      },
    });

    const book: NewTextType = {
      id: "123",
      title: "Sample Book",
      author: "Author Name",
      genre: Genre.FANTASY,
      difficulty: Difficulty.EASY,
      text_link: "https://example.com/sample.txt",
      content: "",
      questions: [],
      isValid: false,
      isAI: false,
      isFiction: true,
      category: Category.NATURE, // Add this if required by NewTextType
      wordLength: 0, // Add this if required by NewTextType
    };

    const result = await fetchBookContent(book, 100, 200);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.isValid).toBe(true);
    expect(result.content).toBe("This is an AI-generated excerpt.");
    expect(result.questions.length).toBe(1);
    expect(result.difficulty).toBe("medium");
  });

  test("should handle AI filtering failure gracefully", async () => {
    axios.get.mockResolvedValue({ data: { contents: "This is a sample book text." } });

    mockGenerateContent.mockRejectedValue(new Error("AI Error"));

    const book: NewTextType = {
      id: "123",
      title: "Sample Book",
      author: "Author Name",
      genre: Genre.FICTION,
      difficulty: Difficulty.EASY,
      text_link: "https://example.com/sample.txt",
      content: "",
      questions: [],
      isValid: false,
      isAI: false,
      isFiction: true,
      category: Category.NATURE, // Add this if required by NewTextType
      wordLength: 0, // Add this if required by NewTextType
    };

    const result = await fetchBookContent(book, 100, 200);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.isValid).toBe(false);
    expect(result.content).toBe("CONTENT_UNAVAILABLE");
  });

  test("should return CONTENT_UNAVAILABLE for books without text links", async () => {
    const book: NewTextType = {
      id: "123",
      title: "Sample Book",
      author: "Author Name",
      genre: Genre.FANTASY,
      difficulty: Difficulty.EASY,
      text_link: "NOT_FOUND",
      content: "",
      questions: [],
      isValid: false,
      isAI: false,
      isFiction: true,
      category: Category.NATURE, // Add this if required by NewTextType
      wordLength: 0, // Add this if required by NewTextType
    };

    const result = await fetchBookContent(book, 100, 200);

    expect(result.content).toBe("CONTENT_UNAVAILABLE");
    expect(result.isValid).toBe(false);
  });
});