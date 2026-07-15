import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import Supervisor from '#models/Supervisor.js';
import createTestClient from '../builders/createTestClient.js';
import createTestSupervisor from '../builders/createTestSupervisor.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('PUT /api/v1/supervisor/:clientId/:supervisorId', () => {
  it('200 - Updates supervisor', async () => {
    const client = await createTestClient();
    const supervisor = await createTestSupervisor(client.clientId);
    const uniqueCode = getUniqueCode('UPDSUP');
    const updatedSupervisor = {
      ...supervisor,
      supervisorId: crypto.randomUUID(),
      firstName: `Updated${uniqueCode}`,
      lastName: 'Supervisor',
      email: `updated.supervisor.${uniqueCode.toLowerCase()}@example.com`,
    };

    const res = await request(app)
      .put(`/api/v1/supervisor/${client.clientId}/${supervisor.supervisorId}`)
      .send(updatedSupervisor);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Supervisor updated');

    const supervisorsRes = await request(app).get(`/api/v1/supervisor/${client.clientId}`);
    expect(supervisorsRes.status).toBe(200);

    const persistedSupervisor = supervisorsRes.body.find(
      (candidate: Supervisor) => candidate.supervisorId === supervisor.supervisorId,
    );
    expect(persistedSupervisor).toMatchObject({
      supervisorId: supervisor.supervisorId,
      firstName: updatedSupervisor.firstName,
      lastName: updatedSupervisor.lastName,
      email: updatedSupervisor.email,
    });
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const supervisorId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/supervisor/${missingClientId}/${supervisorId}`)
      .send({
        firstName: 'Missing',
        lastName: 'Client',
        email: 'missing.client.supervisor@example.com',
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Supervisor not found', async () => {
    const client = await createTestClient();
    const supervisor = await createTestSupervisor(client.clientId);
    const missingSupervisorId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/supervisor/${client.clientId}/${missingSupervisorId}`)
      .send(supervisor);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Supervisor not found: ${missingSupervisorId}`);
  });
});
