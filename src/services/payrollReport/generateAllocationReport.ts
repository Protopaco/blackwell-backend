import getClientAndPayPeriod from '#services/payPeriod/getClientAndPayPeriod.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import readCurrentHoursTab from '#db/payrollReport/readCurrentHoursTab.js';
import readEmployeeExpensesTab from '#db/payrollReport/readEmployeeExpensesTab.js';
import readAdditionalExpensesTab from '#db/payrollReport/readAdditionalExpensesTab.js';
import writeAllocationReportTab from '#db/payrollReport/writeAllocationReportTab.js';
import AllocationReportRow from '#models/AllocationReportRow.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { UnprocessableError } from '#utils/errors.js';
import buildAllocationRows from './buildAllocationRows.js';

const generateAllocationReport = async (clientId: Guid, payPeriodId: Guid): Promise<AllocationReportRow[]> => {
  logger.info(`generateAllocationReport clientId=${clientId} payPeriodId=${payPeriodId}`);

  const { client, payPeriod } = await getClientAndPayPeriod(clientId, payPeriodId);

  if (!payPeriod.payrollReportFileId) {
    throw new UnprocessableError('Cannot generate allocation report — payroll report has not been generated yet for this pay period');
  }

  const reportFileId = payPeriod.payrollReportFileId;

  const [payrollConfig, hoursRows, employeeExpenses, additionalExpenses] = await Promise.all([
    readPayrollConfig(client.payrollConfigFileId),
    readCurrentHoursTab(reportFileId),
    readEmployeeExpensesTab(reportFileId),
    readAdditionalExpensesTab(reportFileId),
  ]);

  if (hoursRows.length === 0) {
    throw new UnprocessableError('Cannot generate allocation report — no hours data found in current_hours tab');
  }

  const activityMap = new Map(payrollConfig.activities.map((activity) => [activity.activityName, activity]));
  const employeeMap = new Map(payrollConfig.employees.map((employee) => [employee.employeeId, employee]));

  const rows = buildAllocationRows(hoursRows, employeeExpenses, additionalExpenses, activityMap, employeeMap);

  await writeAllocationReportTab(reportFileId, rows);

  logger.info(`generateAllocationReport: wrote ${rows.length} rows for pay period ${payPeriod.payPeriodName}`);

  return rows;
};

export default generateAllocationReport;
