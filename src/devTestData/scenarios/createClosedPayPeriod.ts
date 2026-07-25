import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import Client from '#models/Client.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import closePayPeriod from '#services/payPeriod/closePayPeriod.js';
import generateAllocationReport from '#services/payrollReport/generateAllocationReport.js';
import updateEmployeeExpensesBatch from '#services/payrollReport/updateEmployeeExpensesBatch.js';
import createProcessedPayPeriod from './createProcessedPayPeriod.js';

const createClosedPayPeriod = async (client: Client): Promise<void> => {
  const processedPayPeriod = await createProcessedPayPeriod(client);
  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  const activeEmployees = payrollConfig.employees.filter(
    (employee) => employee.status === EmployeeStatus.Active,
  );

  await updateEmployeeExpensesBatch(
    client.clientId,
    processedPayPeriod.payPeriodId,
    activeEmployees.map((employee, index) => ({
      employeeId: employee.employeeId,
      totalExpense: 1000 + index * 250,
    })),
  );
  await generateAllocationReport(client.clientId, processedPayPeriod.payPeriodId);
  await closePayPeriod(client.clientId, processedPayPeriod.payPeriodId);
};

export default createClosedPayPeriod;
