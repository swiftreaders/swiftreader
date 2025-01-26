module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Map @/ to ./src/ - for jest to understand
  },
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],  // Use SWC to compile the files for the jest tests
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"], // needed for react testing which we are using
};