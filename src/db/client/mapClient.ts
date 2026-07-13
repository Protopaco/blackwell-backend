import Client from '#models/Client.js';
import { ClientStatusType } from '#models/ClientStatus.js';

// Converts a raw Clients sheet row into a Client model, including all Drive folder and file IDs.
const mapClient = (row: Record<string, unknown>): Client => ({
  clientId: row['ClientId'] as string,
  clientName: row['ClientName'] as string,
  clientCode: row['ClientCode'] as string,
  status: row['Status'] as ClientStatusType,
  employeePayrollFolderId: row['EmployeePayrollFolderId'] as string,
  payrollConfigFolderId: row['PayrollConfigFolderId'] as string,
  payrollReportFolderId: row['PayrollReportFolderId'] as string,
  timesheetsFolderId: (row['TimesheetsFolderId'] as string) || null,
  payrollConfigFileId: row['PayrollConfigFileId'] as string,
  payPeriodRegistryFileId: row['PayPeriodRegistryFileId'] as string,
});

export default mapClient;
