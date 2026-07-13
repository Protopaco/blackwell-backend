import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import readClients from '#db/client/readClients.js';
import { CLIENTS_TAB, CLIENT_HEADERS } from '#config/constants.js';
import Client from '#models/Client.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites all client rows, updating the one matching the given client.
const writeClients = async (updatedClient: Client): Promise<void> => {
  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (!clientConfigFileId) throw new Error('CLIENT_CONFIG_FILE_ID is not set');

  const clients = await readClients();

  const index = clients.findIndex((client) => client.clientId === updatedClient.clientId);
  if (index === -1) throw new NotFoundError(`Client not found: ${updatedClient.clientId}`);

  clients[index] = updatedClient;

  const rows = clients.map((client) => ({
    ClientId: client.clientId,
    ClientName: client.clientName,
    ClientCode: client.clientCode,
    Status: client.status,
    EmployeePayrollFolderId: client.employeePayrollFolderId,
    PayrollConfigFolderId: client.payrollConfigFolderId,
    PayrollReportFolderId: client.payrollReportFolderId,
    TimesheetsFolderId: client.timesheetsFolderId ?? '',
    PayrollConfigFileId: client.payrollConfigFileId,
    PayPeriodRegistryFileId: client.payPeriodRegistryFileId,
  }));

  await overwriteTabRows(clientConfigFileId, CLIENTS_TAB, CLIENT_HEADERS, rows);
};

export default writeClients;
