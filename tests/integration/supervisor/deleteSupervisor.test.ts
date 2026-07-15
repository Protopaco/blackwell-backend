import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestClient from '../builders/createTestClient.js';
import createTestSupervisor from '../builders/createTestSupervisor.js';

describe('DELETE /api/v1/supervisor/:clientId/:supervisorId', () => {
  it('200 - Deletes supervisor', async () => {
    const client = await createTestClient();
    const supervisor = await createTestSupervisor(client.clientId);

    const res = await request(app).delete(
      `/api/v1/supervisor/${client.clientId}/${supervisor.supervisorId}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Supervisor deleted');

    const supervisorsRes = await request(app).get(`/api/v1/supervisor/${client.clientId}`);
    expect(supervisorsRes.status).toBe(200);
    expect(supervisorsRes.body).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ supervisorId: supervisor.supervisorId })]),
    );
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const supervisorId = crypto.randomUUID();

    const res = await request(app).delete(
      `/api/v1/supervisor/${missingClientId}/${supervisorId}`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Supervisor not found', async () => {
    const client = await createTestClient();
    const missingSupervisorId = crypto.randomUUID();

    const res = await request(app).delete(
      `/api/v1/supervisor/${client.clientId}/${missingSupervisorId}`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Supervisor not found: ${missingSupervisorId}`);
  });
});
