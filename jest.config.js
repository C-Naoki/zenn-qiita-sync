module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testMatch: [
    "**/test/**/*.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)"
  ],
  moduleNameMapper: {
    "^scripts/(.*)$": "<rootDir>/scripts/$1",
  },
};