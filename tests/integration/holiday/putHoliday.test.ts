import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import Holiday from '#models/Holiday.js';
import createTestClient from '../builders/createTestClient.js';
import createTestHoliday from '../builders/createTestHoliday.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('PUT /api/v1/holiday/:clientId/:holidayId', () => {
  it('200 - Updates holiday', async () => {
    const client = await createTestClient();
    const holiday = await createTestHoliday(client.clientId);
    const uniqueCode = getUniqueCode('UPDHOL');
    const updatedHoliday = {
      ...holiday,
      holidayId: crypto.randomUUID(),
      holidayName: `Updated Holiday ${uniqueCode}`,
      holidayDate: '2026-11-26',
    };

    const res = await request(app)
      .put(`/api/v1/holiday/${client.clientId}/${holiday.holidayId}`)
      .send(updatedHoliday);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Holiday updated');

    const holidaysRes = await request(app).get(`/api/v1/holiday/${client.clientId}`);
    expect(holidaysRes.status).toBe(200);

    const persistedHoliday = holidaysRes.body.find(
      (candidate: Holiday) => candidate.holidayId === holiday.holidayId,
    );
    expect(persistedHoliday).toMatchObject({
      holidayId: holiday.holidayId,
      holidayName: updatedHoliday.holidayName,
      holidayDate: updatedHoliday.holidayDate,
    });
  });

  it('404 - Client not found', async () => {
    const client = await createTestClient();
    const holiday = await createTestHoliday(client.clientId);
    const missingClientId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/holiday/${missingClientId}/${holiday.holidayId}`)
      .send(holiday);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('422 - Invalid holiday date', async () => {
    const client = await createTestClient();
    const holiday = await createTestHoliday(client.clientId);

    const res = await request(app)
      .put(`/api/v1/holiday/${client.clientId}/${holiday.holidayId}`)
      .send({
        ...holiday,
        holidayName: 'Should Not Persist',
        holidayDate: '2026-02-30',
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('holidayDate must be a valid YYYY-MM-DD date');

    const holidaysRes = await request(app).get(`/api/v1/holiday/${client.clientId}`);
    expect(holidaysRes.status).toBe(200);
    const persistedHoliday = holidaysRes.body.find(
      (candidate: Holiday) => candidate.holidayId === holiday.holidayId,
    );
    expect(persistedHoliday).toMatchObject(holiday);
  });

  it('404 - Holiday not found', async () => {
    const client = await createTestClient();
    const holiday = await createTestHoliday(client.clientId);
    const missingHolidayId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/holiday/${client.clientId}/${missingHolidayId}`)
      .send(holiday);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Holiday not found: ${missingHolidayId}`);
  });
});
