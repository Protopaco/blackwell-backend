import request from 'supertest';
import app from '#app.js';
import createPayrollReportReadyPayPeriod from './createPayrollReportReadyPayPeriod.js';
import getInternalPayPeriodById from '../helpers/getInternalPayPeriodById.js';
import GeneratedPayrollReportPayPeriod from '../models/GeneratedPayrollReportPayPeriod.js';

const createGeneratedPayrollReportPayPeriod = async (): Promise<GeneratedPayrollReportPayPeriod> => {
  const readyState = await createPayrollReportReadyPayPeriod();

  const response = await request(app).post(
    `/api/v1/payrollReport/${readyState.client.clientId}/${readyState.payPeriod.payPeriodId}/generate`,
  );
  if (response.status !== 200) {
    throw new Error(
      `createGeneratedPayrollReportPayPeriod failed: ${response.status} ${JSON.stringify(response.body)}`,
    );
  }

  const payPeriod = await getInternalPayPeriodById(
    readyState.client,
    readyState.payPeriod.payPeriodId,
  );
  if (!payPeriod) {
    throw new Error(`createGeneratedPayrollReportPayPeriod pay period not found: ${readyState.payPeriod.payPeriodId}`);
  }
  if (!payPeriod.payrollReportFileId) {
    throw new Error(`createGeneratedPayrollReportPayPeriod missing payrollReportFileId: ${readyState.payPeriod.payPeriodId}`);
  }

  return {
    ...readyState,
    payPeriod,
    payrollReportFileId: payPeriod.payrollReportFileId,
  };
};

export default createGeneratedPayrollReportPayPeriod;
