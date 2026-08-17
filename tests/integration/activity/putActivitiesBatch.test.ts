import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestClient from '../builders/createTestClient.js';
import createTestActivity from '../builders/createTestActivity.js';

describe('PUT /api/v1/activity/:clientId/batch', () => {
  it('200 - Overlays groupLabel/sortOrder onto multiple activities', async () => {
    const client = await createTestClient();
    const activityA = await createTestActivity(client.clientId);
    const activityB = await createTestActivity(client.clientId);

    const res = await request(app)
      .put(`/api/v1/activity/${client.clientId}/batch`)
      .send([
        { activityId: activityA.activityId, groupLabel: 'VT Grows', sortOrder: 1 },
        { activityId: activityB.activityId, groupLabel: 'VT Grows', sortOrder: 2 },
      ]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Activities updated');

    const activitiesRes = await request(app).get(`/api/v1/activity/${client.clientId}`);
    expect(activitiesRes.status).toBe(200);
    expect(activitiesRes.body).toContainEqual({
      ...activityA,
      groupLabel: 'VT Grows',
      sortOrder: 1,
    });
    expect(activitiesRes.body).toContainEqual({
      ...activityB,
      groupLabel: 'VT Grows',
      sortOrder: 2,
    });
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/activity/${missingClientId}/batch`)
      .send([{ activityId: crypto.randomUUID(), groupLabel: null, sortOrder: 0 }]);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('422 - Rejects unknown activity ids without writing partial updates', async () => {
    const client = await createTestClient();
    const activity = await createTestActivity(client.clientId);

    const beforeRes = await request(app).get(`/api/v1/activity/${client.clientId}`);
    expect(beforeRes.status).toBe(200);

    const missingActivityId = crypto.randomUUID();
    const res = await request(app)
      .put(`/api/v1/activity/${client.clientId}/batch`)
      .send([
        { activityId: activity.activityId, groupLabel: 'Should Not Persist', sortOrder: 9 },
        { activityId: missingActivityId, groupLabel: null, sortOrder: 0 },
      ]);

    expect(res.status).toBe(422);
    expect(res.body.message).toContain(`Unknown activityId(s) in activity batch: ${missingActivityId}`);

    const afterRes = await request(app).get(`/api/v1/activity/${client.clientId}`);
    expect(afterRes.status).toBe(200);
    expect(afterRes.body).toEqual(beforeRes.body);
  });
});
