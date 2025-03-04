import { render, screen, fireEvent } from "@testing-library/react";
import UserTable from "@/components/UserTable";
import { User } from "@/types/user";
import React from "react";

// Mock user data
const mockUsers: User[] = [
  {
    name: "Alice Johnson",
    wpm: 75,
    joinDate: {
      toDate: () => new Date("2023-01-01"),
    },
  },
  {
    name: "Bob Smith",
    wpm: 85,
    joinDate: {
      toDate: () => new Date("2023-02-15"),
    },
  },
];

describe("UserTable Component", () => {
  let handleManageClick: jest.Mock;
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
    handleManageClick = jest.fn();
    render(<UserTable users={mockUsers} handleManageClick={handleManageClick} />);
  });

  test("renders correctly with users", () => {
    expect(screen.getByText("User Details")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
  });

  test("filters users based on search input", () => {
    const searchInput = screen.getByPlaceholderText("Search users by name, WPM, or join date...");

    // Search for "Alice"
    fireEvent.change(searchInput, { target: { value: "Alice" } });
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();

    // Search for "85" (Bob's WPM)
    fireEvent.change(searchInput, { target: { value: "85" } });
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
  });

  test("shows 'No users found' when search has no match", () => {
    const searchInput = screen.getByPlaceholderText("Search users by name, WPM, or join date...");
    fireEvent.change(searchInput, { target: { value: "Nonexistent User" } });

    expect(screen.getByText("No users found matching your search criteria")).toBeInTheDocument();
  });

  test("calls handleManageClick when clicking 'Manage' button", () => {
    const manageButton = screen.getAllByText("Manage")[0]; // Select first user's button
    fireEvent.click(manageButton);

    expect(handleManageClick).toHaveBeenCalledTimes(1);
    expect(handleManageClick).toHaveBeenCalledWith(mockUsers[0]);
  });
});
