import { render, screen } from "@testing-library/react";
import Home from "../src/app/page"; // Adjust the path based on your structure
import "@testing-library/jest-dom";

describe("Home Page", () => {
  test("renders the page title", () => {
    render(<Home />);
    const titleElement = screen.getByText("Test Dashboard");
    expect(titleElement).toBeInTheDocument();
  });

  test("renders the list of texts", () => {
    render(<Home />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBeGreaterThan(0);
  });
});
