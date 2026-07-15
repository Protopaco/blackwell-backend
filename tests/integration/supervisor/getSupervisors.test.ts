import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestClient from '../builders/createTestClient.js';
import createTestSupervisor from '../builders/createTestSupervisor.js';

describe('GET /api/v1/supervisor/:clientId', () => {
  it('200 - Gets supervisors for a client', async () => {
    const client = await createTestClient();
    const supervisor1 = await createTestSupervisor(client.clientId);
    const supervisor2 = await createTestSupervisor(client.clientId);

    const res = await request(app).get(`/api/v1/supervisor/${client.clientId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining(supervisor1),
        expect.objectContaining(supervisor2),
      ]),
    );
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/supervisor/${missingClientId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
