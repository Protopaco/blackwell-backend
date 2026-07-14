import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import scenarios from './scenarios.js';

describe('POST /api/v1/client', () => {
  it.each(scenarios)('$label', async ({ input, expectedStatus, assert }) => {
    const res = await request(app).post('/api/v1/client').send(input);
    expect(res.status).toBe(expectedStatus);
    assert?.(res);
  });
});
