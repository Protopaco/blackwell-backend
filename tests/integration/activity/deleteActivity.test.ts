import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestActivity from '../builders/createTestActivity.js';
import createTestClient from '../builders/createTestClient.js';

describe('DELETE /api/v1/activity/:clientId/:activityId', () => {
  it('200 - Deletes activity', async () => {
    const client = await createTestClient();
    const activity = await createTestActivity(client.clientId);

    const res = await request(app).delete(
      `/api/v1/activity/${client.clientId}/${activity.activityId}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Activity deleted');

    const activitiesRes = await request(app).get(`/api/v1/activity/${client.clientId}`);
    expect(activitiesRes.status).toBe(200);
    expect(activitiesRes.body).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ activityId: activity.activityId })]),
    );
  });

  it('404 - Client not found', async () => {
    const client = await createTestClient();
    const activity = await createTestActivity(client.clientId);
    const missingClientId = crypto.randomUUID();

    const res = await request(app).delete(
      `/api/v1/activity/${missingClientId}/${activity.activityId}`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Activity not found', async () => {
    const client = await createTestClient();
    const missingActivityId = crypto.randomUUID();

    const res = await request(app).delete(
      `/api/v1/activity/${client.clientId}/${missingActivityId}`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Activity not found: ${missingActivityId}`);
  });
});
