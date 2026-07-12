import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import { TEST_CLIENT_ID } from '../helpers/testClient.js';
import getTestPayPeriod from '../helpers/getTestPayPeriod.js';

describe('GET /api/v1/timesheet/status/:clientId/:payPeriodId', () => {
  it('returns 200 with an array of employee timesheet statuses', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(
      `/api/v1/timesheet/status/${TEST_CLIENT_ID}/${payPeriodId}`,
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    console.log('Timesheet statuses:', JSON.stringify(res.body, null, 2));
  });

  it('returns entries with the expected fields', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(
      `/api/v1/timesheet/status/${TEST_CLIENT_ID}/${payPeriodId}`,
    );
    expect(res.status).toBe(200);
    if (res.body.length > 0) {
      const entry = res.body[0];
      expect(entry).toHaveProperty('employeeId');
      expect(entry).toHaveProperty('employeeName');
      expect(entry).toHaveProperty('timesheetFileId');
      expect(entry).toHaveProperty('timesheetFileLink');
      expect(entry).toHaveProperty('totalHours');
      expect(entry).toHaveProperty('flatRateQuantity');
      expect(entry).toHaveProperty('employeeSigned');
      expect(entry).toHaveProperty('supervisorSigned');
      expect(typeof entry.employeeSigned).toBe('boolean');
      expect(typeof entry.supervisorSigned).toBe('boolean');
    }
  });

  it('returns 404 for an unknown pay period', async () => {
    const res = await request(app).get(
      `/api/v1/timesheet/status/${TEST_CLIENT_ID}/unknown-id`,
    );
    expect(res.status).toBe(404);
  });
});
