import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { TEST_CLIENT_ID } from '../helpers/testClient.js';

describe('GET /api/v1/client/:clientId/summary', () => {
  it('returns 200 with the expected top-level shape', async () => {
    const res = await request(app).get(`/api/v1/client/${TEST_CLIENT_ID}/summary`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.employees)).toBe(true);
    expect(Array.isArray(res.body.supervisors)).toBe(true);
    expect(Array.isArray(res.body.activities)).toBe(true);
    expect(Array.isArray(res.body.fundingSources)).toBe(true);
    expect(Array.isArray(res.body.holidays)).toBe(true);
    expect(res.body.settings).toBeTypeOf('object');
  });

  it('returns only active employees, with expected fields', async () => {
    const res = await request(app).get(`/api/v1/client/${TEST_CLIENT_ID}/summary`);
    console.log('Raw client summary response:', JSON.stringify(res.body, null, 2));

    expect(res.body.employees.length).toBeGreaterThan(0);
    for (const employee of res.body.employees) {
      expect(employee.status).toBe('Active');
    }

    const employee = res.body.employees[0];
    expect(employee).toHaveProperty('employeeId');
    expect(employee).toHaveProperty('firstName');
    expect(employee).toHaveProperty('lastName');
    expect(employee).toHaveProperty('position');
    expect(employee).toHaveProperty('hourlyPayRate1');
    expect(employee).toHaveProperty('hourlyPayRate2');
    expect(employee).toHaveProperty('holidayPayRate');
    expect(employee).toHaveProperty('email');
    expect(employee).toHaveProperty('timesheetFileId');
    expect(employee).toHaveProperty('timesheetFileLink');
  });

  it('returns settings with expected fields', async () => {
    const res = await request(app).get(`/api/v1/client/${TEST_CLIENT_ID}/summary`);
    expect(res.body.settings).toHaveProperty('timeInputMethod');
    expect(res.body.settings).toHaveProperty('payPeriodInterval');
    expect(res.body.settings).toHaveProperty('payPeriodStartDate');
  });

  it('returns 404 for unknown client', async () => {
    const res = await request(app).get('/api/v1/client/00000000-0000-0000-0000-000000000000/summary');
    expect(res.status).toBe(404);
  });
});
