import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestActivity from '../builders/createTestActivity.js';
import createTestClient from '../builders/createTestClient.js';

describe('GET /api/v1/activity/:clientId', () => {
  it('200 - Gets activities for a client', async () => {
    const client = await createTestClient();
    const activity1 = await createTestActivity(client.clientId);
    const activity2 = await createTestActivity(client.clientId);

    const res = await request(app).get(`/api/v1/activity/${client.clientId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining(activity1),
        expect.objectContaining(activity2),
      ]),
    );
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/activity/${missingClientId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
