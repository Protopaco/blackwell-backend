import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestClient from '../builders/createTestClient.js';
import createTestFundingSource from '../builders/createTestFundingSource.js';

describe('GET /api/v1/fundingSource/:clientId', () => {
  it('200 - Gets funding sources for a client', async () => {
    const client = await createTestClient();
    const fundingSource1 = await createTestFundingSource(client.clientId);
    const fundingSource2 = await createTestFundingSource(client.clientId);

    const res = await request(app).get(`/api/v1/fundingSource/${client.clientId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining(fundingSource1),
        expect.objectContaining(fundingSource2),
      ]),
    );
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/fundingSource/${missingClientId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
