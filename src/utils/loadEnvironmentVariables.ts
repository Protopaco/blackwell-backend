import dotenv from 'dotenv';

// Loads .env into process.env as a side effect of importing this module. Must be the first import in
// app.ts: ESM evaluates imports in declaration order, and logger.ts and swaggerSpec.ts both read
// process.env at module level, so they would otherwise see an unpopulated environment locally.
// On Railway the platform injects real env vars, so this is a no-op there.
dotenv.config();
