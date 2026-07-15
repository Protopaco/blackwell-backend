import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import Supervisor from '#models/Supervisor.js';
import createTestClient from '../builders/createTestClient.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('POST /api/v1/supervisor/:clientId', () => {
  it('201 - Creates supervisor', async () => {
    const client = await createTestClient();
    const uniqueCode = getUniqueCode('SUP');
    const supervisorRequest = {
      firstName: `Test${uniqueCode}`,
      lastName: 'Supervisor',
      email: `test.supervisor.${uniqueCode.toLowerCase()}@example.com`,
    };

    const res = await request(app)
      .post(`/api/v1/supervisor/${client.clientId}`)
      .send(supervisorRequest);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Supervisor created');

    const supervisorsRes = await request(app).get(`/api/v1/supervisor/${client.clientId}`);
    expect(supervisorsRes.status).toBe(200);
    expect(supervisorsRes.body).toEqual(
      expect.arrayContaining([expect.objectContaining(supervisorRequest)]),
    );

    const supervisor = supervisorsRes.body.find(
      (candidate: Supervisor) => candidate.email === supervisorRequest.email,
    );
    expect(supervisor.supervisorId).toBeDefined();
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).post(`/api/v1/supervisor/${missingClientId}`).send({
      firstName: 'Missing',
      lastName: 'Client',
      email: 'missing.client.supervisor@example.com',
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
