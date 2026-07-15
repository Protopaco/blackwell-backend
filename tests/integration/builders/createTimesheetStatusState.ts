import request from 'supertest';
import app from '#app.js';
import { TimesheetStatus, TimesheetStatusType } from '#models/TimesheetStatus.js';
import createTestActivityMix from './createTestActivityMix.js';
import createTestClient from './createTestClient.js';
import createTestEmployee from './createTestEmployee.js';
import createTestPayPeriod from './createTestPayPeriod.js';
import createTestTimesheetFolder from './createTestTimesheetFolder.js';
import fillGeneratedTimesheet from '../helpers/fillGeneratedTimesheet.js';
import TimesheetStatusState from '../models/TimesheetStatusState.js';

const createTimesheetStatusState = async (
  status: TimesheetStatusType,
): Promise<TimesheetStatusState> => {
  const client = await createTestClient();
  const timesheetFolder = await createTestTimesheetFolder(client);
  const employee = await createTestEmployee(client.clientId, {
    timesheetFolderId: timesheetFolder.timesheetFolderId,
  });
  const activityMix = await createTestActivityMix(client.clientId);
  const payPeriod = await createTestPayPeriod(client.clientId);

  if (status === TimesheetStatus.NotGenerated) {
    return { client, employee, payPeriod, activities: activityMix.activities };
  }

  const generateTimesheetsResponse = await request(app).post(
    `/api/v1/timesheet/${client.clientId}/${payPeriod.payPeriodId}/generate`,
  );
  if (generateTimesheetsResponse.status !== 200) {
    throw new Error(
      `createTimesheetStatusState generate timesheets failed: ${generateTimesheetsResponse.status} ${JSON.stringify(generateTimesheetsResponse.body)}`,
    );
  }

  if (status === TimesheetStatus.Generated) {
    return { client, employee, payPeriod, activities: activityMix.activities };
  }

  await fillGeneratedTimesheet({
    timesheetFileId: employee.timesheetFileId,
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
    supervisorSigned: status === TimesheetStatus.Approved || status === TimesheetStatus.Complete,
  });

  if (status === TimesheetStatus.Submitted || status === TimesheetStatus.Approved) {
    return { client, employee, payPeriod, activities: activityMix.activities };
  }

  const generatePayrollReportResponse = await request(app).post(
    `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/generate`,
  );
  if (generatePayrollReportResponse.status !== 200) {
    throw new Error(
      `createTimesheetStatusState generate payroll report failed: ${generatePayrollReportResponse.status} ${JSON.stringify(generatePayrollReportResponse.body)}`,
    );
  }

  return { client, employee, payPeriod, activities: activityMix.activities };
};

export default createTimesheetStatusState;
