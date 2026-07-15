import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestClient from '../builders/createTestClient.js';
import createTestHoliday from '../builders/createTestHoliday.js';

describe('GET /api/v1/holiday/:clientId', () => {
  it('200 - Gets holidays for a client', async () => {
    const client = await createTestClient();
    const holiday1 = await createTestHoliday(client.clientId);
    const holiday2 = await createTestHoliday(client.clientId);

    const res = await request(app).get(`/api/v1/holiday/${client.clientId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining(holiday1),
        expect.objectContaining(holiday2),
      ]),
    );
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/holiday/${missingClientId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
