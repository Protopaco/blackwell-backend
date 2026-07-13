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
    timesheetsFolderId: null,
    payrollConfigFileId: 'file-1',
    payPeriodRegistryFileId: 'file-2',
  } as Client,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(existingClient) }));
vi.mock('#db/client/writeClients.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import updateClient from '#services/client/updateClient.js';
import getClientById from '#services/client/getClientById.js';
import writeClients from '#db/client/writeClients.js';
import clientsCache from '#utils/caches/clientsCache.js';

describe('updateClient', () => {
  it('merges only status/clientName/clientCode into the existing client', async () => {
    process.env.CLIENT_CONFIG_FILE_ID = 'client-config-1';
    clientsCache.set('client-config-1', [existingClient]);

    await updateClient('c1', { status: 'Inactive', clientName: 'Renamed Co', clientCode: 'RENAMED' });

    expect(writeClients).toHaveBeenCalledWith({
      ...existingClient,
      status: 'Inactive',
      clientName: 'Renamed Co',
      clientCode: 'RENAMED',
    });
    expect(clientsCache.get('client-config-1')).toBeNull();
  });

  it('leaves fields unchanged when omitted from the request (partial update)', async () => {
    process.env.CLIENT_CONFIG_FILE_ID = 'client-config-1';

    await updateClient('c1', { status: 'Inactive' });

    expect(writeClients).toHaveBeenCalledWith({
      ...existingClient,
      status: 'Inactive',
      clientName: existingClient.clientName,
      clientCode: existingClient.clientCode,
    });
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(
      updateClient('unknown-client', { status: 'Active', clientName: 'X', clientCode: 'X' }),
    ).rejects.toThrow('Client not found: unknown-client');
  });
});
