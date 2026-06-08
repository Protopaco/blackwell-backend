import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { TEST_CLIENT_ID } from '../helpers/testClient.js';
import getTestPayPeriod from '../helpers/getTestPayPeriod.js';

describe('GET /api/v1/timesheet/status', () => {
  it('returns 200 with timesheet statuses', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(
      `/api/v1/timesheet/status?clientId=${TEST_CLIENT_ID}&payPeriodId=${payPeriodId}`,
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    console.log('Timesheet statuses:', JSON.stringify(res.body, null, 2));
  });

  it('returns timesheet status entries with expected fields', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(
      `/api/v1/timesheet/status?clientId=${TEST_CLIENT_ID}&payPeriodId=${payPeriodId}`,
    );
    if (res.body.length > 0) {
      const entry = res.body[0];
      expect(entry).toHaveProperty('employeeId');
      expect(entry).toHaveProperty('employeeName');
      expect(entry).toHaveProperty('timesheetFileId');
      expect(entry).toHaveProperty('status');
    }
  });

  it('returns 404 for unknown pay period', async () => {
    const res = await request(app).get(
      `/api/v1/timesheet/status?clientId=${TEST_CLIENT_ID}&payPeriodId=unknown-id`,
    );
    expect(res.status).toBe(404);
  });
});
