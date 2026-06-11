import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Client from '#models/Client.js';
import { createCache } from '#utils/cache.js';

const cache = createCache<Client[]>(5 * 60 * 1000);

const mapToClient = (row: Record<string, unknown>): Client => ({
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
  allocationReportFolderId: row['AllocationReportFolderId'] as string,
  timesheetsFolderId: row['TimesheetFolderId'] as string,
  payrollConfigFileId: row['PayrollConfigFileId'] as string,
  payPeriodRegistryFileId: row['PayPeriodRegistryFileId'] as string,
});

const readClients = async (): Promise<Client[]> => {
  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (!clientConfigFileId) throw new Error('CLIENT_CONFIG_FILE_ID is not set');

  const cached = cache.get(clientConfigFileId);
  if (cached) return cached;

  const rows = await sheetsAdapter.readTab(clientConfigFileId, 'Clients');
  const clients = rows.map(mapToClient);
  cache.set(clientConfigFileId, clients);
  return clients;
};

const clearClientsCache = (): void => cache.clear();

export { clearClientsCache };
export default readClients;
