import { render, screen } from "@testing-library/react";
import Home from "../src/app/page"; // Adjust the path based on your structure
import '@testing-library/jest-dom';

describe("Home Page", () => {
  test("renders the page title", () => {
    render(<Home />);
    const titleElement = screen.getByText(/src\/app\/page\.tsx/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("renders the buttons", () => {
    render(<Home />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
