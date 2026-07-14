import Guid from '#models/Guid.js';
import { ClientStatusType } from '#models/ClientStatus.js';

interface Client {
  clientId: Guid;
  clientName: string;
  clientCode: string;
  status: ClientStatusType;
  employeePayrollFolderId: string;
  payrollConfigFolderId: string;
  payrollReportFolderId: string;
  payrollConfigFileId: string;
  payPeriodRegistryFileId: string;
}

export default Client;
