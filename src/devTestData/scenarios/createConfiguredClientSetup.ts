import createFolder from '#db/adapter/createFolder.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import Client from '#models/Client.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import { PayRate } from '#models/PayRate.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import createActivity from '#services/activity/createActivity.js';
import createEmployee from '#services/employee/createEmployee.js';
import createFundingSource from '#services/fundingSource/createFundingSource.js';
import createHoliday from '#services/holiday/createHoliday.js';
import createSupervisor from '#services/supervisor/createSupervisor.js';
import createTimesheetFolder from '#services/timesheetFolder/createTimesheetFolder.js';
import buildDriveFolderLink from '#utils/buildDriveFolderLink.js';

const createConfiguredClientSetup = async (client: Client): Promise<void> => {
  const timesheetFolderId = await createFolder(
    'Employee Timesheets',
    client.employeePayrollFolderId,
  );
  await createTimesheetFolder(client.clientId, {
    timesheetFolderName: 'Employee Timesheets',
    driveFolderLink: buildDriveFolderLink(timesheetFolderId),
  });

  await createSupervisor(client.clientId, {
    firstName: 'Ada',
    lastName: 'Nguyen',
    email: 'ada.nguyen@example.test',
  });
  await createSupervisor(client.clientId, {
    firstName: 'Marcus',
    lastName: 'Reed',
    email: 'marcus.reed@example.test',
  });

  await createFundingSource(client.clientId, {
    fundingSourceName: 'Program Grant',
    fundingSourceCode: 'PG',
  });
  await createFundingSource(client.clientId, {
    fundingSourceName: 'General Operating',
    fundingSourceCode: 'GO',
  });

  await createActivity(client.clientId, {
    activityName: 'Direct Services',
    trackSeparately: true,
    payrollCategory: PayrollCategory.Regular,
    fundingSources: [{ fundingSourceName: 'Program Grant', percentage: 100 }],
    payRate: PayRate.HourlyPayRate1,
    flatRateAmount: 0,
  });
  await createActivity(client.clientId, {
    activityName: 'Administration',
    trackSeparately: true,
    payrollCategory: PayrollCategory.Regular,
    fundingSources: [{ fundingSourceName: 'General Operating', percentage: 100 }],
    payRate: PayRate.HourlyPayRate2,
    flatRateAmount: 0,
  });
  await createActivity(client.clientId, {
    activityName: 'PTO',
    trackSeparately: false,
    payrollCategory: PayrollCategory.PTO,
    fundingSources: [{ fundingSourceName: 'General Operating', percentage: 100 }],
    payRate: PayRate.HourlyPayRate1,
    flatRateAmount: 0,
  });

  await createHoliday(client.clientId, {
    holidayName: 'New Year Day',
    holidayDate: '2026-01-01',
  });
  await createHoliday(client.clientId, {
    holidayName: 'Independence Day',
    holidayDate: '2026-07-04',
  });

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  const timesheetFolder = payrollConfig.timesheetFolders.find(
    (folder) => folder.timesheetFolderName === 'Employee Timesheets',
  );
  if (!timesheetFolder) throw new Error('Configured Client timesheet folder was not created');

  await createEmployee(client.clientId, {
    firstName: 'Jamie',
    lastName: 'Carter',
    position: 'Program Specialist',
    hourlyPayRate1: 28,
    hourlyPayRate2: 35,
    holidayPayRate: 42,
    email: 'jamie.carter@example.test',
    status: EmployeeStatus.Active,
    timesheetFolderId: timesheetFolder.timesheetFolderId,
  });
  await createEmployee(client.clientId, {
    firstName: 'Riley',
    lastName: 'Stone',
    position: 'Case Manager',
    hourlyPayRate1: 31,
    hourlyPayRate2: 38,
    holidayPayRate: 46.5,
    email: 'riley.stone@example.test',
    status: EmployeeStatus.Active,
    timesheetFolderId: timesheetFolder.timesheetFolderId,
  });
  await createEmployee(client.clientId, {
    firstName: 'Taylor',
    lastName: 'Brooks',
    position: 'Operations Assistant',
    hourlyPayRate1: 24,
    hourlyPayRate2: 30,
    holidayPayRate: 36,
    email: 'taylor.brooks@example.test',
    status: EmployeeStatus.Inactive,
    timesheetFolderId: timesheetFolder.timesheetFolderId,
  });
};

export default createConfiguredClientSetup;
