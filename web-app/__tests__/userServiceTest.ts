import { userService } from "@/services/userservice";
import { getFirestore, collection, doc, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";

// Mock Firebase Firestore functions
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test("getUsers should call onUpdate with the correct data", () => {
    const mockOnUpdate = jest.fn();
    const mockSnapshot = {
      docs: [
        { id: "1", data: () => ({ name: "User 1" }) },
        { id: "2", data: () => ({ name: "User 2" }) },
      ],
    };

    // Mock Firestore onSnapshot
    (onSnapshot as jest.Mock).mockImplementation((_, callback) => {
      callback(mockSnapshot);
      return jest.fn(); // Return an unsubscribe function
    });

    const unsubscribe = userService.getUsers(mockOnUpdate);

    expect(onSnapshot).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith([
      { id: "1", name: "User 1" },
      { id: "2", name: "User 2" },
    ]);

    unsubscribe(); // Call unsubscribe to ensure it works
  });

  test("removeUser should delete the user and return true", async () => {
    // Mock Firestore deleteDoc
    (deleteDoc as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await userService.removeUser("1");

    expect(deleteDoc).toHaveBeenCalledWith(doc(getFirestore(), "Users", "1"));
    expect(result).toBe(true);
  });

  test("removeUser should handle errors and return false", async () => {
    // Mock Firestore deleteDoc to throw an error
    (deleteDoc as jest.Mock).mockRejectedValueOnce(new Error("Delete failed"));

    const result = await userService.removeUser("1");

    expect(deleteDoc).toHaveBeenCalledWith(doc(getFirestore(), "Users", "1"));
    expect(result).toBe(false);
  });

  test("updateUserName should update the user's name and return true", async () => {
    // Mock Firestore updateDoc
    (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await userService.updateUserName("New Name", "1");

    expect(updateDoc).toHaveBeenCalledWith(
      doc(getFirestore(), "Users", "1"),
      { name: "New Name" }
    );
    expect(result).toBe(true);
  });

  test("updateUserName should handle errors and return false", async () => {
    // Mock Firestore updateDoc to throw an error
    (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Update failed"));

    const result = await userService.updateUserName("New Name", "1");

    expect(updateDoc).toHaveBeenCalledWith(
      doc(getFirestore(), "Users", "1"),
      { name: "New Name" }
    );
    expect(result).toBe(false);
  });
});
