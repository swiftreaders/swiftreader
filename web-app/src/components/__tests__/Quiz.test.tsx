import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Quiz from "@/components/Quiz";
import textService from "@/services/textService";
import sessionService from "@/services/sessionService";
import { Session } from "@/types/sessions";
import { Question, Result } from "@/types/text";
import React from "react";

// Mock data
const mockQuestions: Question[] = [
  {
    question: "What is the capital of France?",
    choices: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    choices: ["Earth", "Mars", "Jupiter", "Venus"],
    answer: "Mars",
  },
];

const mockSession: Session = {
  id: "session1",
  userId: "user123",
  results: [] as Result[],
};

// Mock services
jest.mock("@/services/textService", () => ({
  getQuizForText: jest.fn(),
}));

jest.mock("@/services/sessionService", () => ({
  storeQuizResults: jest.fn(),
}));

describe("Quiz Component", () => {
  const mockOnContinue = jest.fn();
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

    beforeAll(() => {
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

  beforeEach(() => {
    jest.clearAllMocks();
  
    // Mock quiz fetch
    (textService.getQuizForText as jest.Mock).mockResolvedValue({
      questions: mockQuestions.map((q) => ({
        question: q.question,
        options: q.choices,
        correctAnswer: q.answer,
      })),
    });
  
    // Fix: Mock storeQuizResults to return true (success)
    (sessionService.storeQuizResults as jest.Mock).mockResolvedValue(true);
  });
  

  test("renders loading state initially", async () => {
    render(<Quiz textId="text1" session={mockSession} onContinue={mockOnContinue} />);
    expect(screen.getByText("Loading quiz...")).toBeInTheDocument();
    await waitFor(() => expect(textService.getQuizForText).toHaveBeenCalledTimes(1));
  });

  test("fetches and displays quiz questions", async () => {
    render(<Quiz textId="text1" session={mockSession} onContinue={mockOnContinue} />);
    
    await waitFor(() => {
      expect(screen.getByText("Quiz Time!")).toBeInTheDocument();
      expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
      expect(screen.getByText("Which planet is known as the Red Planet?")).toBeInTheDocument();
    });
  });

  test("allows user to select answers", async () => {
    render(<Quiz textId="text1" session={mockSession} onContinue={mockOnContinue} />);
    await waitFor(() => screen.getByText("Quiz Time!"));

    const parisOption = screen.getByLabelText("Paris");
    fireEvent.click(parisOption);

    expect(parisOption).toBeChecked();
  });

  test("submits quiz and locks answers", async () => {
    render(<Quiz textId="text1" session={mockSession} onContinue={mockOnContinue} />);
    await waitFor(() => screen.getByText("Quiz Time!"));

    fireEvent.click(screen.getByLabelText("Paris"));
    fireEvent.click(screen.getByLabelText("Mars"));

    fireEvent.click(screen.getByText("Submit Quiz"));

    await waitFor(() => {
        const correctIcons = screen.getAllByText("✅");
        expect(correctIcons.length).toBeGreaterThan(0); // Ensure at least one correct answer is shown
    });

    expect(sessionService.storeQuizResults).toHaveBeenCalledTimes(1);
    expect(sessionService.storeQuizResults).toHaveBeenCalledWith(mockSession);
  });

  test("calls onContinue when Continue to Stats button is clicked", async () => {
    render(<Quiz textId="text1" session={mockSession} onContinue={mockOnContinue} />);
    await waitFor(() => screen.getByText("Quiz Time!"));

    fireEvent.click(screen.getByLabelText("Paris"));
    fireEvent.click(screen.getByLabelText("Mars"));
    fireEvent.click(screen.getByText("Submit Quiz"));

    await waitFor(() => screen.getByText("Continue to Stats"));
    fireEvent.click(screen.getByText("Continue to Stats"));

    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });
});
