import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import Activity from '#models/Activity.js';
import { PayRate } from '#models/PayRate.js';
import createTestActivity from '../builders/createTestActivity.js';
import createTestClient from '../builders/createTestClient.js';
import createTestFundingSource from '../builders/createTestFundingSource.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('PUT /api/v1/activity/:clientId/:activityId', () => {
  it('200 - Updates activity', async () => {
    const client = await createTestClient();
    const activity = await createTestActivity(client.clientId);
    const uniqueCode = getUniqueCode('UPDACT');
    const updatedActivity = {
      ...activity,
      activityId: crypto.randomUUID(),
      activityName: `Updated Activity ${uniqueCode}`,
      payRate: PayRate.FlatPayRate2,
      flatRateAmount: 75,
    };

    const res = await request(app)
      .put(`/api/v1/activity/${client.clientId}/${activity.activityId}`)
      .send(updatedActivity);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Activity updated');

    const activitiesRes = await request(app).get(`/api/v1/activity/${client.clientId}`);
    expect(activitiesRes.status).toBe(200);

    const persistedActivity = activitiesRes.body.find(
      (candidate: Activity) => candidate.activityId === activity.activityId,
    );
    expect(persistedActivity).toMatchObject({
      activityId: activity.activityId,
      activityName: updatedActivity.activityName,
      payRate: updatedActivity.payRate,
      flatRateAmount: updatedActivity.flatRateAmount,
    });
  });

  it('422 - More than 3 funding sources', async () => {
    const client = await createTestClient();
    const activity = await createTestActivity(client.clientId);
    const fundingSources = [
      await createTestFundingSource(client.clientId),
      await createTestFundingSource(client.clientId),
      await createTestFundingSource(client.clientId),
      await createTestFundingSource(client.clientId),
    ];

    const res = await request(app)
      .put(`/api/v1/activity/${client.clientId}/${activity.activityId}`)
      .send({
        ...activity,
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
    const activity = await createTestActivity(client.clientId);

    const res = await request(app)
      .put(`/api/v1/activity/${client.clientId}/${activity.activityId}`)
      .send({
        ...activity,
        activityName: 'Should Not Persist',
        fundingSources: [
          {
            fundingSourceName: 'Unknown Funding Source',
            percentage: 100,
          },
        ],
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('Activity funding source not found: Unknown Funding Source');

    const activitiesRes = await request(app).get(`/api/v1/activity/${client.clientId}`);
    expect(activitiesRes.status).toBe(200);
    const persistedActivity = activitiesRes.body.find(
      (candidate: Activity) => candidate.activityId === activity.activityId,
    );
    expect(persistedActivity).toMatchObject(activity);
  });

  it('404 - Client not found', async () => {
    const client = await createTestClient();
    const activity = await createTestActivity(client.clientId);
    const missingClientId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/activity/${missingClientId}/${activity.activityId}`)
      .send(activity);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Activity not found', async () => {
    const client = await createTestClient();
    const activity = await createTestActivity(client.clientId);
    const missingActivityId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/activity/${client.clientId}/${missingActivityId}`)
      .send(activity);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Activity not found: ${missingActivityId}`);
  });
});
