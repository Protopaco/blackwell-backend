import readClientById from '#db/client/readClientById.js';
import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import readPayrollReportSummary from '#db/payrollReport/readPayrollReportSummary.js';
import Guid from '#models/Guid.js';
import PayrollReportResponse from '#models/PayrollReportResponse.js';
import PayrollReportSummaryEntry from '#models/PayrollReportSummaryEntry.js';
import { logger } from '#utils/logger.js';

// Returns the current ADP Summary data for a pay period, or null if no report has been generated yet.
const getPayrollReport = async (clientId: Guid, payPeriodId: Guid): Promise<PayrollReportResponse | null> => {
  logger.info(`getPayrollReport clientId=${clientId} payPeriodId=${payPeriodId}`);

  const client = await readClientById(clientId);
  if (!client) return null;

  const payPeriod = await readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) return null;

  if (!payPeriod.payrollReportFileId) return null;

  const rawRows = await readPayrollReportSummary(payPeriod.payrollReportFileId);
  if (rawRows.length === 0) return null;

  const rows: PayrollReportSummaryEntry[] = rawRows.map((row) => ({
    employeeId: row['EmployeeId'] as string,
    employeeName: row['EmployeeName'] as string,
    payrollCategory: row['PayrollCategory'] as string,
    totalHours: Number(row['TotalHours']),
    holidayHours: Number(row['HolidayHours']),
  }));

  const generatedAt = rawRows[0]['GeneratedAt'] as string;

  return { generatedAt, rows };
};

export default getPayrollReport;
