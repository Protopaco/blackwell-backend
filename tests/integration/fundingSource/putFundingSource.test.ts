import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import FundingSource from '#models/FundingSource.js';
import createTestClient from '../builders/createTestClient.js';
import createTestFundingSource from '../builders/createTestFundingSource.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('PUT /api/v1/fundingSource/:clientId/:fundingSourceId', () => {
  it('200 - Updates funding source', async () => {
    const client = await createTestClient();
    const fundingSource = await createTestFundingSource(client.clientId);
    const uniqueCode = getUniqueCode('UPDFS');
    const updatedFundingSource = {
      ...fundingSource,
      fundingSourceId: crypto.randomUUID(),
      fundingSourceName: `Updated Funding Source ${uniqueCode}`,
      fundingSourceCode: uniqueCode,
    };

    const res = await request(app)
      .put(`/api/v1/fundingSource/${client.clientId}/${fundingSource.fundingSourceId}`)
      .send(updatedFundingSource);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Funding source updated');

    const fundingSourcesRes = await request(app).get(`/api/v1/fundingSource/${client.clientId}`);
    expect(fundingSourcesRes.status).toBe(200);

    const persistedFundingSource = fundingSourcesRes.body.find(
      (candidate: FundingSource) => candidate.fundingSourceId === fundingSource.fundingSourceId,
    );
    expect(persistedFundingSource).toMatchObject({
      fundingSourceId: fundingSource.fundingSourceId,
      fundingSourceName: updatedFundingSource.fundingSourceName,
      fundingSourceCode: updatedFundingSource.fundingSourceCode,
    });
  });

  it('404 - Client not found', async () => {
    const client = await createTestClient();
    const fundingSource = await createTestFundingSource(client.clientId);
    const missingClientId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/fundingSource/${missingClientId}/${fundingSource.fundingSourceId}`)
      .send(fundingSource);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Funding source not found', async () => {
    const client = await createTestClient();
    const fundingSource = await createTestFundingSource(client.clientId);
    const missingFundingSourceId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/fundingSource/${client.clientId}/${missingFundingSourceId}`)
      .send(fundingSource);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Funding source not found: ${missingFundingSourceId}`);
  });
});
