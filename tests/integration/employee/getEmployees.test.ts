import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import Employee from '#models/Employee.js';
import createTestClient from '../builders/createTestClient.js';
import createTestEmployee from '../builders/createTestEmployee.js';

describe('GET /api/v1/employee/:clientId', () => {
  it('200 - Gets employees for a client', async () => {
    const client = await createTestClient();
    const employee1 = await createTestEmployee(client.clientId);
    const employee2 = await createTestEmployee(client.clientId);

    const res = await request(app).get(`/api/v1/employee/${client.clientId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining(employee1),
        expect.objectContaining(employee2),
      ]),
    );
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/employee/${missingClientId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
