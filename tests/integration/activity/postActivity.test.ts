import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import Activity from '#models/Activity.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import createTestClient from '../builders/createTestClient.js';
import createTestFundingSource from '../builders/createTestFundingSource.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('POST /api/v1/activity/:clientId', () => {
  it('201 - Creates activity', async () => {
    const client = await createTestClient();
    const fundingSource = await createTestFundingSource(client.clientId);
    const uniqueCode = getUniqueCode('ACT');
    const activityRequest = {
      activityName: `Test Activity ${uniqueCode}`,
      trackSeparately: true,
      payrollCategory: PayrollCategory.Regular,
      groupLabel: 'VT Grows',
      sortOrder: 3,
      fundingSources: [
        {
          fundingSourceName: fundingSource.fundingSourceName,
          percentage: 100,
        },
      ],
    };

    const res = await request(app)
      .post(`/api/v1/activity/${client.clientId}`)
      .send(activityRequest);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Activity created');

    const activitiesRes = await request(app).get(`/api/v1/activity/${client.clientId}`);
    expect(activitiesRes.status).toBe(200);
    expect(activitiesRes.body).toEqual(
      expect.arrayContaining([expect.objectContaining(activityRequest)]),
    );

    const activity = activitiesRes.body.find(
      (candidate: Activity) => candidate.activityName === activityRequest.activityName,
    );
    expect(activity.activityId).toBeDefined();
  });

  // DISABLED — "flat-rate activity" was an Activity.payRate concept, removed in [052]. Flat-rate is now a
  // per-(employee, activity) EmployeeActivityRates concern; revisit once [055] rewires that behavior.
  it.skip('201 - Creates flat-rate activity', async () => {
    const client = await createTestClient();
    const fundingSource = await createTestFundingSource(client.clientId);
    const uniqueCode = getUniqueCode('FLATACT');
    const activityRequest = {
      activityName: `Test Flat Activity ${uniqueCode}`,
      trackSeparately: true,
      payrollCategory: PayrollCategory.Regular,
      fundingSources: [
        {
          fundingSourceName: fundingSource.fundingSourceName,
          percentage: 100,
        },
      ],
    };

    const res = await request(app)
      .post(`/api/v1/activity/${client.clientId}`)
      .send(activityRequest);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Activity created');

    const activitiesRes = await request(app).get(`/api/v1/activity/${client.clientId}`);
    expect(activitiesRes.status).toBe(200);
    expect(activitiesRes.body).toEqual(
      expect.arrayContaining([expect.objectContaining(activityRequest)]),
    );
  });

  it('422 - More than 3 funding sources', async () => {
    const client = await createTestClient();
    const fundingSources = [
      await createTestFundingSource(client.clientId),
      await createTestFundingSource(client.clientId),
      await createTestFundingSource(client.clientId),
      await createTestFundingSource(client.clientId),
    ];
    const uniqueCode = getUniqueCode('ACT');

    const res = await request(app)
      .post(`/api/v1/activity/${client.clientId}`)
      .send({
        activityName: `Test Activity ${uniqueCode}`,
        trackSeparately: true,
        payrollCategory: PayrollCategory.Regular,
        fundingSources: fundingSources.map((fundingSource) => ({
          fundingSourceName: fundingSource.fundingSourceName,
          percentage: 25,
        })),
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('An activity cannot have more than 3 funding sources');
  });

  it('422 - Funding source not found', async () => {
    const client = await createTestClient();
    const uniqueCode = getUniqueCode('ACT');

    const res = await request(app)
      .post(`/api/v1/activity/${client.clientId}`)
      .send({
        activityName: `Test Activity ${uniqueCode}`,
        trackSeparately: true,
        payrollCategory: PayrollCategory.Regular,
        fundingSources: [
          {
            fundingSourceName: 'Unknown Funding Source',
            percentage: 100,
          },
        ],
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('Activity funding source not found: Unknown Funding Source');
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).post(`/api/v1/activity/${missingClientId}`).send({
      activityName: 'Missing Client Activity',
      trackSeparately: true,
      payrollCategory: PayrollCategory.Regular,
      fundingSources: [
        {
          fundingSourceName: 'Missing Client Funding Source',
          percentage: 100,
        },
      ],
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
