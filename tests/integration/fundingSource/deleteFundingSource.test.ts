import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import FundingSource from '#models/FundingSource.js';
import createTestActivity from '../builders/createTestActivity.js';
import createTestClient from '../builders/createTestClient.js';
import createTestFundingSource from '../builders/createTestFundingSource.js';

describe('DELETE /api/v1/fundingSource/:clientId/:fundingSourceId', () => {
  it('200 - Deletes funding source', async () => {
    const client = await createTestClient();
    const fundingSource = await createTestFundingSource(client.clientId);

    const res = await request(app).delete(
      `/api/v1/fundingSource/${client.clientId}/${fundingSource.fundingSourceId}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Funding source deleted');

    const fundingSourcesRes = await request(app).get(`/api/v1/fundingSource/${client.clientId}`);
    expect(fundingSourcesRes.status).toBe(200);
    expect(fundingSourcesRes.body).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ fundingSourceId: fundingSource.fundingSourceId })]),
    );
  });

  it('404 - Client not found', async () => {
    const client = await createTestClient();
    const fundingSource = await createTestFundingSource(client.clientId);
    const missingClientId = crypto.randomUUID();

    const res = await request(app).delete(
      `/api/v1/fundingSource/${missingClientId}/${fundingSource.fundingSourceId}`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Funding source not found', async () => {
    const client = await createTestClient();
    const missingFundingSourceId = crypto.randomUUID();

    const res = await request(app).delete(
      `/api/v1/fundingSource/${client.clientId}/${missingFundingSourceId}`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Funding source not found: ${missingFundingSourceId}`);
  });

  it('422 - Funding source still referenced by activity', async () => {
    const client = await createTestClient();
    const fundingSource = await createTestFundingSource(client.clientId);
    await createTestActivity(client.clientId, [fundingSource.fundingSourceName]);

    const res = await request(app).delete(
      `/api/v1/fundingSource/${client.clientId}/${fundingSource.fundingSourceId}`,
    );

    expect(res.status).toBe(422);
    expect(res.body.message).toContain(
      `Funding source "${fundingSource.fundingSourceName}" is still referenced`,
    );

    const fundingSourcesRes = await request(app).get(`/api/v1/fundingSource/${client.clientId}`);
    expect(fundingSourcesRes.status).toBe(200);
    expect(fundingSourcesRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fundingSourceId: fundingSource.fundingSourceId,
        } satisfies Partial<FundingSource>),
      ]),
    );
  });
});
