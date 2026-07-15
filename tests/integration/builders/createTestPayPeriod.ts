import request from 'supertest';
import app from '#app.js';
import PayPeriodResponse from '#models/PayPeriodResponse.js';

type TestPayPeriodRequest = PayPeriodResponse & {
  payrollReportFileId: string;
};

const createTestPayPeriod = async (
  clientId: string,
  overrides: Partial<TestPayPeriodRequest> = {},
): Promise<PayPeriodResponse> => {
  const nextPayPeriodResponse = await request(app).get(`/api/v1/payPeriod/${clientId}/next`);
  if (nextPayPeriodResponse.status !== 200) {
    throw new Error(
      `createTestPayPeriod next lookup failed: ${nextPayPeriodResponse.status} ${JSON.stringify(nextPayPeriodResponse.body)}`,
    );
  }

  const requestBody = {
    ...nextPayPeriodResponse.body,
    payrollReportFileId: '',
    ...overrides,
  };

  const response = await request(app)
    .post(`/api/v1/payPeriod/${clientId}`)
    .send({ payPeriod: requestBody });
  if (response.status !== 201) {
    throw new Error(`createTestPayPeriod failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  const payPeriodsResponse = await request(app).get(`/api/v1/payPeriod/${clientId}`);
  if (payPeriodsResponse.status !== 200) {
    throw new Error(
      `createTestPayPeriod lookup failed: ${payPeriodsResponse.status} ${JSON.stringify(payPeriodsResponse.body)}`,
    );
  }

  const payPeriod = payPeriodsResponse.body.find(
    (candidate: PayPeriodResponse) => candidate.payPeriodName === requestBody.payPeriodName,
  );
  if (!payPeriod) {
    throw new Error(`createTestPayPeriod not found: ${requestBody.payPeriodName}`);
  }

  return payPeriod;
};

export default createTestPayPeriod;
