module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 120000,
  verbose: true,
  setupFiles: ["./tests/setup.js"],
  maxWorkers: 1,
};