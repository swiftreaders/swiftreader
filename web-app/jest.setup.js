import "@testing-library/jest-dom";

jest.mock("lucide-react", () => ({
    __esModule: true,
    Search: () => <svg />, // Mocking Search icon
  }));