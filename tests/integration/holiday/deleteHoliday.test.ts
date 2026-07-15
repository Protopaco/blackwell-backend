import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestClient from '../builders/createTestClient.js';
import createTestHoliday from '../builders/createTestHoliday.js';

describe('DELETE /api/v1/holiday/:clientId/:holidayId', () => {
  it('200 - Deletes holiday', async () => {
    const client = await createTestClient();
    const holiday = await createTestHoliday(client.clientId);

    const res = await request(app).delete(
      `/api/v1/holiday/${client.clientId}/${holiday.holidayId}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Holiday deleted');

    const holidaysRes = await request(app).get(`/api/v1/holiday/${client.clientId}`);
    expect(holidaysRes.status).toBe(200);
    expect(holidaysRes.body).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ holidayId: holiday.holidayId })]),
    );
  });

  it('404 - Client not found', async () => {
    const client = await createTestClient();
    const holiday = await createTestHoliday(client.clientId);
    const missingClientId = crypto.randomUUID();

    const res = await request(app).delete(
      `/api/v1/holiday/${missingClientId}/${holiday.holidayId}`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Holiday not found', async () => {
    const client = await createTestClient();
    const missingHolidayId = crypto.randomUUID();

    const res = await request(app).delete(
      `/api/v1/holiday/${client.clientId}/${missingHolidayId}`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Holiday not found: ${missingHolidayId}`);
  });
});
