import { generateTextUsingAI } from "@/services/generateService";
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
        "excerpt": "This is a generated passage.",
        "isValid": true,
        "questions": [
          {
            "question": "What is the main theme?",
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

    const result = await generateTextUsingAI("Science", 100, 200);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.isValid).toBe(true);
    expect(result.excerpt).toBe("This is a generated passage.");
    expect(result.questions.length).toBe(1);
    expect(result.questions[0].question).toBe("What is the main theme?");
  });

  test("should handle invalid AI response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: jest.fn().mockReturnValue("Invalid Response"),
      },
    });

    const result = await generateTextUsingAI("History", 100, 200);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.isValid).toBe(false);
    expect(result.excerpt).toBe("");
    expect(result.questions.length).toBe(0);
  });

  test("should return a default response if an error occurs", async () => {
    mockGenerateContent.mockRejectedValue(new Error("API Error"));

    const result = await generateTextUsingAI("Technology", 100, 200);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.isValid).toBe(false);
    expect(result.excerpt).toBe("");
    expect(result.questions.length).toBe(0);
  });
});
