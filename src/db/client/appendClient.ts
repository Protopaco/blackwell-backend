import appendRow from '#db/adapter/appendRow.js';
import { CLIENTS_TAB, CLIENT_HEADERS } from '#config/constants.js';
import Client from '#models/Client.js';

// Appends a new client row to the central Clients tab (CLIENT_CONFIG_FILE_ID env var).
const appendClient = async (clientConfigFileId: string, client: Client): Promise<void> => {
  const row: Record<string, unknown> = {
    ClientId: client.clientId,
    ClientName: client.clientName,
    ClientCode: client.clientCode,
    Status: client.status,
    EmployeePayrollFolderId: client.employeePayrollFolderId,
    PayrollConfigFolderId: client.payrollConfigFolderId,
    PayrollReportFolderId: client.payrollReportFolderId,
    PayrollConfigFileId: client.payrollConfigFileId,
    PayPeriodRegistryFileId: client.payPeriodRegistryFileId,
  };

  await appendRow(clientConfigFileId, CLIENTS_TAB, CLIENT_HEADERS, row);
};

export default appendClient;
