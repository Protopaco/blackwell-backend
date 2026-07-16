import clearTabContent from '#db/adapter/clearTabContent.js';
import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import writeHeaderRow from '#db/adapter/writeHeaderRow.js';
import { CLIENTS_TAB, CLIENT_HEADERS } from '#config/constants.js';
import Client from '#models/Client.js';

const buildClientRow = (client: Client): Record<string, unknown> => ({
  ClientId: client.clientId,
  ClientName: client.clientName,
  ClientCode: client.clientCode,
  Status: client.status,
  EmployeePayrollFolderId: client.employeePayrollFolderId,
  PayrollConfigFolderId: client.payrollConfigFolderId,
  PayrollReportFolderId: client.payrollReportFolderId,
  PayrollConfigFileId: client.payrollConfigFileId,
  PayPeriodRegistryFileId: client.payPeriodRegistryFileId,
});

const replaceClients = async (clients: Client[]): Promise<void> => {
  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (!clientConfigFileId) throw new Error('CLIENT_CONFIG_FILE_ID is not set');

  await clearTabContent(clientConfigFileId, CLIENTS_TAB);

  if (clients.length === 0) {
    await writeHeaderRow(clientConfigFileId, CLIENTS_TAB, CLIENT_HEADERS);
    return;
  }

  await overwriteTabRows(
    clientConfigFileId,
    CLIENTS_TAB,
    CLIENT_HEADERS,
    clients.map(buildClientRow),
  );
};

export default replaceClients;
