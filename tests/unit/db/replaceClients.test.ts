import { describe, it, expect, vi, beforeEach } from 'vitest';
import Client from '#models/Client.js';

const { client } = vi.hoisted(() => ({
  client: {
    clientId: 'client-1',
    clientName: 'Acme Co',
    clientCode: 'ACME',
    status: 'Active',
    employeePayrollFolderId: 'folder-1',
    payrollConfigFolderId: 'folder-2',
    payrollReportFolderId: 'folder-3',
    payrollConfigFileId: 'file-1',
    payPeriodRegistryFileId: 'file-2',
  } as Client,
}));

vi.mock('#db/adapter/clearTabContent.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/overwriteTabRows.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/writeHeaderRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import replaceClients from '#db/client/replaceClients.js';
import clearTabContent from '#db/adapter/clearTabContent.js';
import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import writeHeaderRow from '#db/adapter/writeHeaderRow.js';

describe('replaceClients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLIENT_CONFIG_FILE_ID = 'client-config-1';
  });

  it('clears the Clients tab and writes the replacement clients', async () => {
    await replaceClients([client]);

    expect(clearTabContent).toHaveBeenCalledWith('client-config-1', 'Clients');
    expect(overwriteTabRows).toHaveBeenCalledWith(
      'client-config-1',
      'Clients',
      [
        'ClientId',
        'ClientName',
        'ClientCode',
        'Status',
        'EmployeePayrollFolderId',
        'PayrollConfigFolderId',
        'PayrollReportFolderId',
        'PayrollConfigFileId',
        'PayPeriodRegistryFileId',
      ],
      [
        {
          ClientId: 'client-1',
          ClientName: 'Acme Co',
          ClientCode: 'ACME',
          Status: 'Active',
          EmployeePayrollFolderId: 'folder-1',
          PayrollConfigFolderId: 'folder-2',
          PayrollReportFolderId: 'folder-3',
          PayrollConfigFileId: 'file-1',
          PayPeriodRegistryFileId: 'file-2',
        },
      ],
    );
    expect(writeHeaderRow).not.toHaveBeenCalled();
  });

  it('rewrites only the header row when no clients remain', async () => {
    await replaceClients([]);

    expect(clearTabContent).toHaveBeenCalledWith('client-config-1', 'Clients');
    expect(overwriteTabRows).not.toHaveBeenCalled();
    expect(writeHeaderRow).toHaveBeenCalledWith(
      'client-config-1',
      'Clients',
      [
        'ClientId',
        'ClientName',
        'ClientCode',
        'Status',
        'EmployeePayrollFolderId',
        'PayrollConfigFolderId',
        'PayrollReportFolderId',
        'PayrollConfigFileId',
        'PayPeriodRegistryFileId',
      ],
    );
  });
});
