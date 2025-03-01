import sessionService from "@/services/sessionService";
import { collection, doc, addDoc, getDocs, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { Session } from "@/types/sessions";
import { Text } from "@/types/text";

describe("sessionService", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch recent sessions", () => {
    const mockOnUpdate = jest.fn();
    const mockUnsubscribe = jest.fn();

    onSnapshot.mockImplementation((_, callback) => {
      callback({
        docs: [
          {
            id: "session1",
            data: () => ({
              textId: "text1",
              userId: "user1",
              title: "Session 1",
              startTime: new Date(),
              endTime: new Date(),
              wpm: 200,
              sessionType: "quiz",
              difficulty: "medium",
              results: [],
            }),
          },
        ],
      });
      return mockUnsubscribe;
    });

    const unsubscribe = sessionService.getRecentSessions(mockOnUpdate, "user1");

    expect(onSnapshot).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith([
      expect.objectContaining({ textId: "text1", userId: "user1", title: "Session 1" }),
    ]);

    unsubscribe(); // Simulate unsubscribing
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test("should fetch all reading sessions", () => {
    const mockOnUpdate = jest.fn();
    const mockUnsubscribe = jest.fn();

    onSnapshot.mockImplementation((_, callback) => {
      callback({
        docs: [
          {
            id: "session1",
            data: () => ({
              textId: "text1",
              userId: "user1",
              title: "Session 1",
              startTime: new Date(),
              endTime: new Date(),
              wpm: 200,
              sessionType: "quiz",
              difficulty: "medium",
              results: [],
            }),
          },
        ],
      });
      return mockUnsubscribe;
    });

    const unsubscribe = sessionService.getAllReadingSessions(mockOnUpdate);

    expect(onSnapshot).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith([
      expect.objectContaining({ textId: "text1", userId: "user1", title: "Session 1" }),
    ]);

    unsubscribe(); // Simulate unsubscribing
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test("should add a new session", async () => {
    addDoc.mockResolvedValue({ id: "session123" });

    const result = await sessionService.addSession(
      "text1",
      "user1",
      "Reading Session",
      new Date(),
      new Date(),
      "practice"
    );

    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(result).toBe("session123");
  });

  test("should handle errors when adding a session", async () => {
    addDoc.mockRejectedValue(new Error("Firestore error"));

    await expect(
      sessionService.addSession("text1", "user1", "Reading Session", new Date(), new Date(), "practice")
    ).rejects.toThrow("Failed to add session");

    expect(addDoc).toHaveBeenCalledTimes(1);
  });

  test("should get a random text based on constraints", async () => {
    getDocs.mockResolvedValue({
      docs: [
        {
          id: "text1",
          data: () => ({
            title: "Random Text",
            content: "Lorem ipsum...",
            difficulty: "Easy",
            isFiction: true,
            genre: "Fantasy",
            createdAt: new Date(),
            updatedAt: new Date(),
            wordLength: 500,
          }),
        },
      ],
    });

    const text = await sessionService.getText({ difficulty: "Easy" });

    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(text).toBeInstanceOf(Text);
    expect(text?.title).toBe("Random Text");
  });

  test("should return null if no matching text is found", async () => {
    getDocs.mockResolvedValue({ docs: [] });

    const text = await sessionService.getText({ difficulty: "Hard" });

    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(text).toBeNull();
  });

  test("should store quiz results", async () => {
    addDoc.mockResolvedValue({ id: "session123" });

    const session = new Session(
      "text1",
      "user1",
      "Quiz Session",
      new Date(),
      new Date(),
      200,
      "quiz",
      "medium",
      "session123",
      []
    );

    const result = await sessionService.storeQuizResults(session);

    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  test("should handle errors when storing quiz results", async () => {
    addDoc.mockRejectedValue(new Error("Firestore error"));

    const session = new Session(
      "text1",
      "user1",
      "Quiz Session",
      new Date(),
      new Date(),
      200,
      "quiz",
      "medium",
      "session123",
      []
    );

    const result = await sessionService.storeQuizResults(session);

    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });
});
