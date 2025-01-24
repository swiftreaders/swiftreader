export default {
    preset: "ts-jest",
    testEnvironment: "jsdom", // Use "jsdom" for frontend tests
    roots: ["<rootDir>/src", "<rootDir>/__tests__"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
    testMatch: ["**/__tests__/**/*.test.(ts|tsx)"], // Look for .test.ts/.test.tsx files in __tests__
    collectCoverage: true, // Optional: Enable coverage reports
  };
  