import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import Client from '#models/Client.js';
import { ClientStatus } from '#models/ClientStatus.js';
import createTestClient from '../builders/createTestClient.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

const getClientFromList = async (clientId: string): Promise<Client | undefined> => {
  const res = await request(app).get('/api/v1/client');

  expect(res.status).toBe(200);
  return res.body.find((client: Client) => client.clientId === clientId);
};

describe('PUT /api/v1/client/:clientId', () => {
  it('200 - Updates client status, name, and code', async () => {
    const client = await createTestClient();
    const updatedClientName = 'Updated Client Name';
    const updatedClientCode = getUniqueCode('UPDATED');

    const res = await request(app)
      .put(`/api/v1/client/${client.clientId}`)
      .send({
        status: ClientStatus.Inactive,
        clientName: updatedClientName,
        clientCode: updatedClientCode,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Client updated');

    const updatedClient = await getClientFromList(client.clientId);
    expect(updatedClient).toMatchObject({
      clientId: client.clientId,
      status: ClientStatus.Inactive,
      clientName: updatedClientName,
      clientCode: updatedClientCode,
    });
  });

  it('200 - Partially updates client status', async () => {
    const client = await createTestClient();

    const res = await request(app)
      .put(`/api/v1/client/${client.clientId}`)
      .send({
        status: ClientStatus.Inactive,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Client updated');

    const updatedClient = await getClientFromList(client.clientId);
    expect(updatedClient).toMatchObject({
      clientId: client.clientId,
      status: ClientStatus.Inactive,
      clientName: client.clientName,
      clientCode: client.clientCode,
    });
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/client/${missingClientId}`)
      .send({
        status: ClientStatus.Inactive,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
