import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import { TEST_CLIENT_ID } from '../helpers/testClient.js';

describe('GET /api/v1/client/:clientId/employees', () => {
  it('returns 200 with a list of employees', async () => {
    const res = await request(app).get(`/api/v1/client/${TEST_CLIENT_ID}/employees`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns employees with expected fields', async () => {
    const res = await request(app).get(`/api/v1/client/${TEST_CLIENT_ID}/employees`);
    const employee = res.body[0];

    expect(employee).toHaveProperty('employeeId');
    expect(employee).toHaveProperty('firstName');
    expect(employee).toHaveProperty('lastName');
    expect(employee).toHaveProperty('position');
    expect(employee).toHaveProperty('hourlyPayRate1');
    expect(employee).toHaveProperty('hourlyPayRate2');
    expect(employee).toHaveProperty('holidayPayRate');
    expect(employee).toHaveProperty('email');
    expect(employee).toHaveProperty('status');
    expect(employee).toHaveProperty('timesheetFileId');
    expect(employee).toHaveProperty('timesheetFileLink');
  });

  it('returns 200 with empty array for unknown clientId', async () => {
    const res = await request(app).get('/api/v1/client/00000000-0000-0000-0000-000000000000/employees');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
