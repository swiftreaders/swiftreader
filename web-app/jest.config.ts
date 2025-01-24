export default {
    preset: "ts-jest", // Use ts-jest for TypeScript support
    testEnvironment: "jest-environment-jsdom", // Use jsdom for React testing
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest", // Use ts-jest to handle TypeScript files
      "^.+\\.(js|jsx)$": "babel-jest", // Use babel-jest to handle JavaScript/JSX files
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy", // Mock CSS imports
    },
    setupFilesAfterEnv: ["@testing-library/jest-dom"], // Add jest-dom matchers
  };
  