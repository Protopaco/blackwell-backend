import Guid from '#models/Guid.js';

interface Client {
  clientId: Guid;
  clientName: string;
  clientCode: string;
  trackFundingSource: boolean;
  clientFolderLink: string;
  clientFolderId: string;
  employeePayrollFolderId: string;
  payrollConfigFolderId: string;
  reportsFolderId: string;
  payrollReportFolderId: string;
  timesheetsFolderId: string;
  payrollConfigFileId: string;
  payPeriodRegistryFileId: string;
}

export default Client;
