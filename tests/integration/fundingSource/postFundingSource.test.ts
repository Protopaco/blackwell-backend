import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import FundingSource from '#models/FundingSource.js';
import createTestClient from '../builders/createTestClient.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('POST /api/v1/fundingSource/:clientId', () => {
  it('201 - Creates funding source', async () => {
    const client = await createTestClient();
    const uniqueCode = getUniqueCode('FS');
    const fundingSourceRequest = {
      fundingSourceName: `Test Funding Source ${uniqueCode}`,
      fundingSourceCode: uniqueCode,
    };

    const res = await request(app)
      .post(`/api/v1/fundingSource/${client.clientId}`)
      .send(fundingSourceRequest);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Funding source created');

    const fundingSourcesRes = await request(app).get(`/api/v1/fundingSource/${client.clientId}`);
    expect(fundingSourcesRes.status).toBe(200);
    expect(fundingSourcesRes.body).toEqual(
      expect.arrayContaining([expect.objectContaining(fundingSourceRequest)]),
    );

    const fundingSource = fundingSourcesRes.body.find(
      (candidate: FundingSource) =>
        candidate.fundingSourceName === fundingSourceRequest.fundingSourceName,
    );
    expect(fundingSource.fundingSourceId).toBeDefined();
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).post(`/api/v1/fundingSource/${missingClientId}`).send({
      fundingSourceName: 'Missing Client Funding Source',
      fundingSourceCode: 'MISSING',
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
