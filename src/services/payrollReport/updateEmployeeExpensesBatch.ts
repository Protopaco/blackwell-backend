import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import getClientById from '#services/client/getClientById.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import readEmployeeExpensesTab from '#db/payrollReport/readEmployeeExpensesTab.js';
import writeEmployeeExpensesTab from '#db/payrollReport/writeEmployeeExpensesTab.js';
import mergeEmployeeExpenseTotals from '#services/payrollReport/mergeEmployeeExpenseTotals.js';
import EmployeeExpenseUpdate from '#models/EmployeeExpenseUpdate.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

const updateEmployeeExpensesBatch = async (
  clientId: Guid,
  payPeriodId: Guid,
  updates: EmployeeExpenseUpdate[],
): Promise<void> => {
  logger.info(
    `updateEmployeeExpensesBatch clientId=${clientId} payPeriodId=${payPeriodId} count=${updates.length}`,
  );

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);
  if (!payPeriod.payrollReportFileId)
    throw new NotFoundError(`No payroll report file exists for pay period: ${payPeriodId}`);

  const existingExpenses = (await readEmployeeExpensesTab(payPeriod.payrollReportFileId)) ?? [];
  const mergedExpenses = mergeEmployeeExpenseTotals(existingExpenses, updates);

  const existingEmployeeIds = new Set(existingExpenses.map((expense) => expense.employeeId));
  const newEmployeeIds = [...new Set(updates.map((update) => update.employeeId))].filter(
    (employeeId) => !existingEmployeeIds.has(employeeId),
  );

  if (newEmployeeIds.length > 0) {
    const client = await getClientById(clientId);
    if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

    const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
    const employeesById = new Map(payrollConfig.employees.map((employee) => [employee.employeeId, employee]));

    const unknownEmployeeIds = newEmployeeIds.filter((employeeId) => !employeesById.has(employeeId));
    if (unknownEmployeeIds.length > 0) {
      throw new UnprocessableError(
        `Unknown employeeId(s) in employeeExpenses batch: ${unknownEmployeeIds.join(', ')}`,
      );
    }

    const totalExpenseByEmployeeId = new Map(updates.map((update) => [update.employeeId, update.totalExpense]));
    for (const employeeId of newEmployeeIds) {
      const employee = employeesById.get(employeeId)!;
      mergedExpenses.push({
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        totalExpense: totalExpenseByEmployeeId.get(employeeId) ?? null,
      });
    }
  }

  await writeEmployeeExpensesTab(payPeriod.payrollReportFileId, mergedExpenses);
  logger.info(`updateEmployeeExpensesBatch: complete for pay period ${payPeriodId}`);
};

export default updateEmployeeExpensesBatch;
