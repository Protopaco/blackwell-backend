import request from 'supertest';
import app from '#app.js';
import createTestActivityMix from './createTestActivityMix.js';
import createTestClient from './createTestClient.js';
import createTestEmployee from './createTestEmployee.js';
import createTestPayPeriod from './createTestPayPeriod.js';
import createTestTimesheetFolder from './createTestTimesheetFolder.js';
import fillGeneratedTimesheet from '../helpers/fillGeneratedTimesheet.js';
import PayrollReportReadyPayPeriod from '../models/PayrollReportReadyPayPeriod.js';

const createPayrollReportReadyPayPeriod = async (): Promise<PayrollReportReadyPayPeriod> => {
  const client = await createTestClient();
  const timesheetFolder = await createTestTimesheetFolder(client);
  const completeEmployee = await createTestEmployee(client.clientId, {
    timesheetFolderId: timesheetFolder.timesheetFolderId,
  });
  const incompleteEmployee = await createTestEmployee(client.clientId, {
    timesheetFolderId: timesheetFolder.timesheetFolderId,
  });
  const activityMix = await createTestActivityMix(client.clientId);
  const payPeriod = await createTestPayPeriod(client.clientId);

  const generateTimesheetsResponse = await request(app).post(
    `/api/v1/timesheet/${client.clientId}/${payPeriod.payPeriodId}/generate`,
  );
  if (generateTimesheetsResponse.status !== 200) {
    throw new Error(
      `createPayrollReportReadyPayPeriod generate timesheets failed: ${generateTimesheetsResponse.status} ${JSON.stringify(generateTimesheetsResponse.body)}`,
    );
  }

  await fillGeneratedTimesheet({
    timesheetFileId: completeEmployee.timesheetFileId,
    payPeriodId: payPeriod.payPeriodId,
    tabName: payPeriod.payPeriodName,
    entries: [
      {
        activityId: activityMix.hourlyPayRate1Activity.activityId,
        date: payPeriod.startDate,
        value: 4,
      },
      {
        activityId: activityMix.flatPayRate1Activity.activityId,
        date: payPeriod.startDate,
        value: 2,
      },
    ],
    employeeSigned: true,
    supervisorSigned: true,
  });

  return {
    client,
    completeEmployee,
    incompleteEmployee,
    payPeriod,
    activityMix,
  };
};

export default createPayrollReportReadyPayPeriod;
