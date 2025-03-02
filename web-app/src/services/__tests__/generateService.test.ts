import { fetchGeneratedTexts } from "@/services/generateService";
import { Category } from "@/types/text";
import { GoogleGenerativeAI } from "@google/generative-ai";

jest.mock("@google/generative-ai");

describe("generateTextUsingAI", () => {
  let mockGenerateContent: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    mockGenerateContent = jest.fn();
    
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return valid AI-generated text and questions", async () => {
    const mockResponseText = `
    {
      "texts": [
        {
          "title": "Generated Passage Title",
          "content": "Generated passage text...",
          "difficulty": "easy",
          "questions": [
            {
              "question": "What is the main theme?",
              "choices": ["...", "...", "...", "..."],
              "answer": "..."
            }
          ]
        }
      ]
    }
    `;

    mockGenerateContent.mockResolvedValue({
      response: {
        text: jest.fn().mockReturnValue(mockResponseText),
      },
    });

    const result = await fetchGeneratedTexts(Category.SCIENCE, 100, 200);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result[0].isValid).toBe(true);
    expect(result[0].content).toBe("Generated passage text...");
    expect(result[0].questions.length).toBe(1);
    expect(result[0].questions[0].question).toBe("What is the main theme?");
  });

  test("should handle invalid AI response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: jest.fn().mockReturnValue("Invalid Response"),
      },
    });

    const result = await fetchGeneratedTexts(Category.HISTORY, 100, 200);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.length).toBe(0);
  });

  test("should handle multiple AI-generated texts", async () => {
    const mockResponseText = `
    {
      "texts": [
        {
          "title": "Generated Passage Title 1",
          "content": "Generated passage text 1...",
          "difficulty": "easy",
          "questions": [
            {
              "question": "What is the main theme of passage 1?",
              "choices": ["Theme A", "Theme B", "Theme C", "Theme D"],
              "answer": "Theme A"
            }
          ]
        },
        {
          "title": "Generated Passage Title 2",
          "content": "Generated passage text 2...",
          "difficulty": "medium",
          "questions": [
            {
              "question": "What is the main theme of passage 2?",
              "choices": ["Theme X", "Theme Y", "Theme Z", "Theme W"],
              "answer": "Theme X"
            }
          ]
        }
      ]
    }
    `;
  
    mockGenerateContent.mockResolvedValue({
      response: {
        text: jest.fn().mockReturnValue(mockResponseText),
      },
    });
  
    const result = await fetchGeneratedTexts(Category.SCIENCE, 100, 200);
  
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.length).toBe(2);
  
    // Validate the first text
    expect(result[0].isValid).toBe(true);
    expect(result[0].title).toBe("Generated Passage Title 1");
    expect(result[0].content).toBe("Generated passage text 1...");
    expect(result[0].difficulty).toBe("easy");
    expect(result[0].questions.length).toBe(1);
    expect(result[0].questions[0].question).toBe("What is the main theme of passage 1?");
    expect(result[0].questions[0].choices).toEqual(["Theme A", "Theme B", "Theme C", "Theme D"]);
    expect(result[0].questions[0].answer).toBe("Theme A");
  
    // Validate the second text
    expect(result[1].isValid).toBe(true);
    expect(result[1].title).toBe("Generated Passage Title 2");
    expect(result[1].content).toBe("Generated passage text 2...");
    expect(result[1].difficulty).toBe("medium");
    expect(result[1].questions.length).toBe(1);
    expect(result[1].questions[0].question).toBe("What is the main theme of passage 2?");
    expect(result[1].questions[0].choices).toEqual(["Theme X", "Theme Y", "Theme Z", "Theme W"]);
    expect(result[1].questions[0].answer).toBe("Theme X");
  });
  
});
