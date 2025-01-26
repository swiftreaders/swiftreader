module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Map @/ to ./src/
  },
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest", // Use Babel to transform TypeScript and JSX
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"], // Updated path
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json", // Point to your tsconfig file
    },
  },
};