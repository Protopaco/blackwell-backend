import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import Holiday from '#models/Holiday.js';
import createTestClient from '../builders/createTestClient.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('POST /api/v1/holiday/:clientId', () => {
  it('201 - Creates holiday', async () => {
    const client = await createTestClient();
    const uniqueCode = getUniqueCode('HOL');
    const holidayRequest = {
      holidayName: `Test Holiday ${uniqueCode}`,
      holidayDate: '2026-12-25',
    };

    const res = await request(app).post(`/api/v1/holiday/${client.clientId}`).send(holidayRequest);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Holiday created');

    const holidaysRes = await request(app).get(`/api/v1/holiday/${client.clientId}`);
    expect(holidaysRes.status).toBe(200);
    expect(holidaysRes.body).toEqual(
      expect.arrayContaining([expect.objectContaining(holidayRequest)]),
    );

    const holiday = holidaysRes.body.find(
      (candidate: Holiday) => candidate.holidayName === holidayRequest.holidayName,
    );
    expect(holiday.holidayId).toBeDefined();
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).post(`/api/v1/holiday/${missingClientId}`).send({
      holidayName: 'Missing Client Holiday',
      holidayDate: '2026-12-25',
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('422 - Invalid holiday date', async () => {
    const client = await createTestClient();
    const uniqueCode = getUniqueCode('HOL');

    const res = await request(app).post(`/api/v1/holiday/${client.clientId}`).send({
      holidayName: `Test Holiday ${uniqueCode}`,
      holidayDate: '2026-02-30',
    });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('holidayDate must be a valid YYYY-MM-DD date');
  });
});
