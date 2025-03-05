import { render, screen, fireEvent } from "@testing-library/react";
import UserInfoModal from "../UserInfoAdminModal";
import { userService } from "@/services/userService";
import { Session } from "@/types/sessions";
import { User } from "@/types/user";

jest.mock("@/services/userService", () => ({
  userService: {
    toggleAdmin: jest.fn(),
    removeUser: jest.fn(),
  },
}));

// Mocking the Canvas API
HTMLCanvasElement.prototype.getContext = jest.fn();

// Mock User Data (NON-ADMIN)
const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "johndoe@example.com",
  isAdmin: false,
  joinDate: {
    toDate: () => new Date("2023-01-01"),
  },
  wpm: 75,
};

// 🔹 Mock Sessions Data
const mockSessions: Session[] = [
  {
    id: "session1",
    difficulty: "Medium",
    startTime: {
      toDate: () => new Date("2024-01-01T12:00:00Z"),
    },
    wpm: [60, 70, 80],
    getAverageWpm: function () {
      return this.wpm.reduce((a, b) => a + b, 0) / this.wpm.length;
    },
    getComprehensionScore: function () {
      return 85;
    },
  },
];

describe("UserInfoModal Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders user details correctly", () => {
    render(<UserInfoModal user={mockUser} sessions={mockSessions} isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText("User Details")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("johndoe@example.com")).toBeInTheDocument();
    expect(screen.getByText("Joined: 1/1/2023")).toBeInTheDocument();
    expect(screen.getByText("Current WPM: 75")).toBeInTheDocument();
  });

  test("calls onToggleAdmin when Make Admin button is clicked", () => {
    render(<UserInfoModal user={mockUser} sessions={mockSessions} isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText("Make Admin"));
    expect(userService.toggleAdmin).toHaveBeenCalledWith("1", true);
  });

  test("calls onRemoveUser when Remove User button is clicked and confirmed", () => {
    window.confirm = jest.fn().mockImplementation(() => true);

    render(<UserInfoModal user={mockUser} sessions={mockSessions} isOpen={true} onClose={mockOnClose} />);
    
    // 🔹 Ensure the "Remove User" button is present
    const removeUserButton = screen.queryByRole("button", { name: /remove user/i });
    expect(removeUserButton).not.toBeNull(); // Ensure it exists

    fireEvent.click(removeUserButton!);
    expect(userService.removeUser).toHaveBeenCalledWith("1");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("session selection updates chart display", () => {
    render(<UserInfoModal user={mockUser} sessions={mockSessions} isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText("Session 1"));
    expect(screen.queryByText("Click on a session to view its chart.")).not.toBeInTheDocument();
  });

  test("calls onClose when Close button is clicked", () => {
    render(<UserInfoModal user={mockUser} sessions={mockSessions} isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText("Close"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
