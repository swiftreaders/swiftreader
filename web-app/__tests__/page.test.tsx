import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TestDashboard } from "../src/app/example/page";
import { TestDashboardProvider } from "@/contexts/exampleContext";
import React from "react";

// Mock the useTestDashboard hook
jest.mock("@/contexts/exampleContext", () => ({
  ...jest.requireActual("@/contexts/exampleContext"),
  useTestDashboard: () => ({
    texts: [
      { id: 1, title: "Test Title 1", content: "Test Content 1" },
      { id: 2, title: "Test Title 2", content: "Test Content 2" },
    ],
  }),
}));

describe("Home Page", () => {
  test("renders the page title", () => {
    render(
      <TestDashboardProvider>
        <TestDashboard />
      </TestDashboardProvider>
    );
    
    const titleElement = screen.getByText("Test Dashboard");
    expect(titleElement).toBeInTheDocument();
  });
});