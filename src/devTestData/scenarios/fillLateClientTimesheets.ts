import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import Client from '#models/Client.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import PayPeriod from '#models/PayPeriod.js';
import fillGeneratedTimesheet from '../fillGeneratedTimesheet.js';

const fillLateClientTimesheets = async (
  client: Client,
  payPeriod: PayPeriod,
): Promise<void> => {
  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  const activeEmployees = payrollConfig.employees.filter(
    (employee) => employee.status === EmployeeStatus.Active,
  );
  const directServices = payrollConfig.activities.find(
    (activity) => activity.activityName === 'Direct Services',
  );
  const administration = payrollConfig.activities.find(
    (activity) => activity.activityName === 'Administration',
  );
  if (!directServices || !administration) {
    throw new Error('Late Client activities were not created');
  }

  const workDate = payPeriod.startDate;
  for (const employee of activeEmployees) {
    const employeeActivityIds = new Set(
      employee.activityRates.map((activityRate) => activityRate.activityId),
    );
    const entries = [
      { activityId: directServices.activityId, date: workDate, value: 6 },
      { activityId: administration.activityId, date: workDate, value: 2 },
    ].filter((entry) => employeeActivityIds.has(entry.activityId));

    await fillGeneratedTimesheet({
      timesheetFileId: employee.timesheetFileId,
      payPeriodId: payPeriod.payPeriodId,
      tabName: payPeriod.payPeriodName,
      entries,
      employeeSigned: true,
      supervisorSigned: true,
    });
  }
};

export default fillLateClientTimesheets;
