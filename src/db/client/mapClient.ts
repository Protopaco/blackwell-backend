import Client from '#models/Client.js';

// Converts a raw Clients sheet row into a Client model, including all Drive folder and file IDs.
const mapClient = (row: Record<string, unknown>): Client => ({
  clientId: row['ClientId'] as string,
  clientName: row['ClientName'] as string,
  clientCode: row['ClientCode'] as string,
  trackFundingSource: row['TrackFundingSource'] === true || row['TrackFundingSource'] === 'TRUE',
  clientFolderLink: row['ClientFolderLink'] as string,
  clientFolderId: row['ClientFolderId'] as string,
  employeePayrollFolderId: row['EmployeePayrollFolderId'] as string,
  payrollConfigFolderId: row['PayrollConfigFolderId'] as string,
  reportsFolderId: row['ReportFolderId'] as string,
  payrollReportFolderId: row['PayrollReportFolderId'] as string,
  timesheetsFolderId: row['TimesheetFolderId'] as string,
  payrollConfigFileId: row['PayrollConfigFileId'] as string,
  payPeriodRegistryFileId: row['PayPeriodRegistryFileId'] as string,
});

export default mapClient;
