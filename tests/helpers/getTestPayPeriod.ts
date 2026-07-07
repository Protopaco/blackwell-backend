import request from 'supertest';
import app from '../../src/app.js';
import { TEST_CLIENT_ID } from './testClient.js';

const getTestPayPeriod = async (): Promise<{ payPeriodId: string; payPeriodName: string }> => {
  const res = await request(app).get(`/api/v1/payPeriod/${TEST_CLIENT_ID}`);
  if (res.body.length === 0) throw new Error('No pay periods found for test client');
  return res.body[0];
};

export default getTestPayPeriod;
