import { describe, it, expect, vi } from 'vitest';
import Client from '#models/Client.js';

const { existingClient } = vi.hoisted(() => ({
  existingClient: {
    clientId: 'c1',
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

vi.mock('#db/adapter/overwriteTabRows.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/client/readClients.js', () => ({ default: vi.fn().mockResolvedValue([existingClient]) }));

import writeClients from '#db/client/writeClients.js';
import overwriteTabRows from '#db/adapter/overwriteTabRows.js';

describe('writeClients', () => {
  it('writes the updated client in place of the matching existing record', async () => {
    process.env.CLIENT_CONFIG_FILE_ID = 'client-config-1';

    await writeClients({ ...existingClient, clientName: 'Renamed Co', status: 'Inactive' });

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
          ClientId: 'c1',
          ClientName: 'Renamed Co',
          ClientCode: 'ACME',
          Status: 'Inactive',
          EmployeePayrollFolderId: 'folder-1',
          PayrollConfigFolderId: 'folder-2',
          PayrollReportFolderId: 'folder-3',
          PayrollConfigFileId: 'file-1',
          PayPeriodRegistryFileId: 'file-2',
        },
      ],
    );
  });

  it('throws NotFoundError when the clientId does not match any existing client', async () => {
    process.env.CLIENT_CONFIG_FILE_ID = 'client-config-1';

    await expect(
      writeClients({ ...existingClient, clientId: 'unknown' }),
    ).rejects.toThrow('Client not found: unknown');
  });
});
