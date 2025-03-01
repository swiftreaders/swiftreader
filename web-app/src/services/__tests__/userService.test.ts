import { userService } from "@/services/userService";
import { collection, doc, getDoc, getDocs, onSnapshot, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import { User } from "@/types/user";
import { Session } from "@/types/sessions";

describe("userService", () => {
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

  test("should fetch users in real-time", () => {
    const mockOnUpdate = jest.fn();
    const mockUnsubscribe = jest.fn();

    onSnapshot.mockImplementation((_, callback) => {
      callback({
        docs: [
          { id: "user1", data: () => ({ name: "John Doe", email: "john@example.com", isAdmin: false }) },
        ],
      });
      return mockUnsubscribe;
    });

    const unsubscribe = userService.getUsers(mockOnUpdate);

    expect(onSnapshot).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith([
      expect.objectContaining({ id: "user1", name: "John Doe", email: "john@example.com" }),
    ]);

    unsubscribe(); // Simulate unsubscribing
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test("should fetch a single user by ID", async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      id: "user1",
      data: () => ({
        name: "John Doe",
        email: "john@example.com",
        isAdmin: false,
        wpm: 200,
        joinDate: new Date(),
        readingGoal: 1000,
      }),
    });

    const user = await userService.getUser("user1");

    expect(getDoc).toHaveBeenCalledTimes(1);
    expect(user).toBeInstanceOf(User);
    expect(user?.name).toBe("John Doe");
  });

  test("should return null if user does not exist", async () => {
    getDoc.mockResolvedValue({ exists: () => false });

    const user = await userService.getUser("invalidId");

    expect(getDoc).toHaveBeenCalledTimes(1);
    expect(user).toBeNull();
  });

  test("should update a user's field", async () => {
    updateDoc.mockResolvedValue(undefined);

    const result = await userService.updateUser("user1", "name", "Jane Doe");

    expect(updateDoc).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  test("should remove a user", async () => {
    deleteDoc.mockResolvedValue(undefined);

    const result = await userService.removeUser("user1");

    expect(deleteDoc).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  test("should update a user's name", async () => {
    updateDoc.mockResolvedValue(undefined);

    const result = await userService.updateUserName("Jane Doe", "user1");

    expect(updateDoc).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  test("should set a user's reading goal", async () => {
    updateDoc.mockResolvedValue(undefined);

    const result = await userService.setReadingGoal(1500, "user1");

    expect(updateDoc).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  test("should return a user's reading goal", async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ readingGoal: 2000 }),
    });

    const goal = await userService.getReadingGoal("user1");

    expect(getDoc).toHaveBeenCalledTimes(1);
    expect(goal).toBe(2000);
  });

  test("should return default reading goal if not set", async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({}),
    });

    const goal = await userService.getReadingGoal("user1");

    expect(getDoc).toHaveBeenCalledTimes(1);
    expect(goal).toBe(1000); // Default goal
  });

  test("should return default reading goal if user document is not found", async () => {
    getDoc.mockResolvedValue({ exists: () => false });

    const goal = await userService.getReadingGoal("invalidUser");

    expect(getDoc).toHaveBeenCalledTimes(1);
    expect(goal).toBe(1000); // Default goal
  });

  test("should toggle a user's admin status", async () => {
    updateDoc.mockResolvedValue(undefined);

    const result = await userService.toggleAdmin("user1", true);

    expect(updateDoc).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  test("should fetch a user's reading sessions", async () => {
    getDocs.mockResolvedValue({
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
            sessionType: "practice",
            difficulty: "medium",
            results: [],
          }),
        },
      ],
    });

    const sessions = await userService.getUserReadingSessions("user1");

    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(sessions.length).toBe(1);
    expect(sessions[0]).toBeInstanceOf(Session);
    expect(sessions[0].title).toBe("Session 1");
  });

  test("should return an empty array if no reading sessions found", async () => {
    getDocs.mockResolvedValue({ docs: [] });

    const sessions = await userService.getUserReadingSessions("user1");

    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(sessions).toEqual([]);
  });
});
