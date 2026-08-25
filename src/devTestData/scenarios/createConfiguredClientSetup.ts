import createFolder from '#db/adapter/createFolder.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import Client from '#models/Client.js';
import { EmployeeActivityPayRateType } from '#models/EmployeeActivityPayRateType.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
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
    fringeRate: null,
  });
  await createFundingSource(client.clientId, {
    fundingSourceName: 'General Operating',
    fundingSourceCode: 'GO',
    fringeRate: null,
  });

  await createActivity(client.clientId, {
    activityName: 'Direct Services',
    payrollCategory: PayrollCategory.Regular,
    groupLabel: null,
    sortOrder: 0,
    fundingSources: [{ fundingSourceName: 'Program Grant', percentage: 100 }],
  });
  await createActivity(client.clientId, {
    activityName: 'Administration',
    payrollCategory: PayrollCategory.Regular,
    groupLabel: null,
    sortOrder: 1,
    fundingSources: [{ fundingSourceName: 'General Operating', percentage: 100 }],
  });
  await createActivity(client.clientId, {
    activityName: 'PTO',
    payrollCategory: PayrollCategory.PTO,
    groupLabel: null,
    sortOrder: 2,
    fundingSources: [{ fundingSourceName: 'General Operating', percentage: 100 }],
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

  const findActivityId = (activityName: string): string => {
    const activity = payrollConfig.activities.find((candidate) => candidate.activityName === activityName);
    if (!activity) throw new Error(`Configured Client activity was not created: ${activityName}`);
    return activity.activityId;
  };
  const directServicesActivityId = findActivityId('Direct Services');
  const administrationActivityId = findActivityId('Administration');

  // Seeds at least one of each EmployeeActivityRates payRateType so downstream tickets have data to
  // exercise: Jamie covers hourly + flat-rate, Riley covers salary.
  await createEmployee(client.clientId, {
    firstName: 'Jamie',
    lastName: 'Carter',
    position: 'Program Specialist',
    salaryAmount: 0,
    activityRates: [
      {
        activityId: directServicesActivityId,
        payRateType: EmployeeActivityPayRateType.Hourly,
        payRate: 22,
        holidayPayRate: 28,
      },
      {
        activityId: administrationActivityId,
        payRateType: EmployeeActivityPayRateType.FlatRate,
        payRate: 50,
        holidayPayRate: 0,
      },
    ],
    email: 'jamie.carter@example.test',
    status: EmployeeStatus.Active,
    timesheetFolderId: timesheetFolder.timesheetFolderId,
  });
  await createEmployee(client.clientId, {
    firstName: 'Riley',
    lastName: 'Stone',
    position: 'Case Manager',
    salaryAmount: 2000,
    activityRates: [
      {
        activityId: directServicesActivityId,
        payRateType: EmployeeActivityPayRateType.Salary,
        payRate: 0,
        holidayPayRate: 0,
      },
    ],
    email: 'riley.stone@example.test',
    status: EmployeeStatus.Active,
    timesheetFolderId: timesheetFolder.timesheetFolderId,
  });
  await createEmployee(client.clientId, {
    firstName: 'Taylor',
    lastName: 'Brooks',
    position: 'Operations Assistant',
    salaryAmount: 0,
    activityRates: [
      {
        activityId: directServicesActivityId,
        payRateType: EmployeeActivityPayRateType.Hourly,
        payRate: 18,
        holidayPayRate: 22,
      },
    ],
    email: 'taylor.brooks@example.test',
    status: EmployeeStatus.Inactive,
    timesheetFolderId: timesheetFolder.timesheetFolderId,
  });
};

export default createConfiguredClientSetup;
