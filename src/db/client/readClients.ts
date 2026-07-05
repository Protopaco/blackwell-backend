import readTab from '#db/adapter/readTab.js';
import { CLIENTS_TAB } from '#config/constants.js';
import Client from '#models/Client.js';
import clientsCache from '#utils/caches/clientsCache.js';

// Converts a raw Clients sheet row into a Client model, including all Drive folder and file IDs.
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
  timesheetsFolderId: row['TimesheetFolderId'] as string,
  payrollConfigFileId: row['PayrollConfigFileId'] as string,
  payPeriodRegistryFileId: row['PayPeriodRegistryFileId'] as string,
});

// Reads all clients from the central client config sheet (CLIENT_CONFIG_FILE_ID env var), cached for 5 minutes.
const readClients = async (): Promise<Client[]> => {
  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (!clientConfigFileId) throw new Error('CLIENT_CONFIG_FILE_ID is not set');

  const cached = clientsCache.get(clientConfigFileId);
  if (cached) return cached;

  const rows = await readTab(clientConfigFileId, CLIENTS_TAB);
  const clients = rows.map(mapToClient);
  clientsCache.set(clientConfigFileId, clients);
  return clients;
};

export default readClients;
