import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          setupFiles: ['tests/integration/setup.ts'],
          // Run test files sequentially — without this the Google Sheets API quota
          // (60 req/min) gets exhausted across concurrent workers.
          fileParallelism: false,
          // Calls now queue (via the rate limiters in utils/rateLimiters/) instead of erroring past
          // quota — a call can wait up to a full refresh window (60s) for a slot, and a single test
          // doing several calls could stack multiple waits. Vitest's 5s default would kill those
          // tests as "timed out" even though nothing actually failed. Revisit this number once we
          // see real queuing behavior from the new integration suite.
          testTimeout: 250_000,
        },
      },
    ],
  },
});
