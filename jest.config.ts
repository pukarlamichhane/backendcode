// jest.config.ts
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest", // Tell Jest to transform TypeScript files using ts-jest
  },
  moduleFileExtensions: ["ts", "js"], // Recognize these file extensions
  testMatch: ["**/tests/**/*.test.ts"], // Match test files
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json", // Path to your TypeScript config
    },
  },
};

export default config;
