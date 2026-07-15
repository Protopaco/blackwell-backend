import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestClient from '../builders/createTestClient.js';
import Client from '#models/Client.js';

describe('GET /api/v1/client', () => {
  it('200 - Returns expected client fields', async () => {
    const createdClient = await createTestClient();

    const res = await request(app).get('/api/v1/client');

    expect(res.status).toBe(200);
    const client = res.body.find((item: Client) => item.clientId === createdClient.clientId);
    expect(client.clientId).toBe(createdClient.clientId);

    expect(client).toBeDefined();
    expect(client).toMatchObject({
      clientId: createdClient.clientId,
      clientName: createdClient.clientName,
      clientCode: createdClient.clientCode,
      status: createdClient.status,
      employeePayrollFolderId: createdClient.employeePayrollFolderId,
      payrollConfigFolderId: createdClient.payrollConfigFolderId,
      payrollReportFolderId: createdClient.payrollReportFolderId,
      payrollConfigFileId: createdClient.payrollConfigFileId,
      payPeriodRegistryFileId: createdClient.payPeriodRegistryFileId,
    });
  });
});
