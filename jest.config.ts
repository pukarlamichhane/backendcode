// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testMatch: ["**/tests/**/*.test.ts"], // Test file pattern
  testPathIgnorePatterns: ["/node_modules/"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json", // Ensure this points to your tsconfig
    },
  },
  // setupFilesAfterEnv: ['./jest.setup.ts'], // Comment this out if not needed
};

export default config;
