import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';

describe('GET /api/v1/client', () => {
  it('returns 200 with a list of clients', async () => {
    const res = await request(app).get('/api/v1/client');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns clients with expected fields', async () => {
    const res = await request(app).get('/api/v1/client');
    const client = res.body[0];

    console.log('Raw client response:', JSON.stringify(client, null, 2));

    expect(client).toHaveProperty('clientId');
    expect(client).toHaveProperty('clientName');
    expect(client).toHaveProperty('payrollConfigFileId');
    expect(client).toHaveProperty('payPeriodRegistryFileId');
  });
});
