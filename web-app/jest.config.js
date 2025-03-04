const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest", // Use Babel for all JS/TS files
  },
  transformIgnorePatterns: [
    "/node_modules/(?!lucide-react)", // Force Jest to transpile lucide-react
  ],
};

module.exports = createJestConfig(customJestConfig);
