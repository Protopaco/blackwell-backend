import { describe, it, expect, vi, beforeEach } from 'vitest';
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

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(existingClient) }));
vi.mock('#db/client/writeClients.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/client/readClients.js', () => ({ default: vi.fn().mockResolvedValue([existingClient]) }));

import updateClient from '#services/client/updateClient.js';
import getClientById from '#services/client/getClientById.js';
import writeClients from '#db/client/writeClients.js';
import readClients from '#db/client/readClients.js';
import clientsCache from '#utils/caches/clientsCache.js';

describe('updateClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientById).mockResolvedValue(existingClient);
    vi.mocked(readClients).mockResolvedValue([existingClient]);
  });

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

  it('allows updating a client to keep its own unchanged clientName/clientCode', async () => {
    await expect(updateClient('c1', { status: 'Inactive' })).resolves.not.toThrow();

    expect(writeClients).toHaveBeenCalled();
  });

  it('throws UnprocessableError when the new clientCode collides with a different client', async () => {
    vi.mocked(readClients).mockResolvedValueOnce([
      existingClient,
      { clientId: 'c2', clientName: 'Blackwell Co', clientCode: 'BLACKWELL' } as Client,
    ]);

    await expect(updateClient('c1', { clientCode: 'BLACKWELL' })).rejects.toThrow('Client code already exists: BLACKWELL');

    expect(writeClients).not.toHaveBeenCalled();
  });

  it('throws UnprocessableError when the new clientName collides with a different client', async () => {
    vi.mocked(readClients).mockResolvedValueOnce([
      existingClient,
      { clientId: 'c2', clientName: 'Blackwell Co', clientCode: 'BLACKWELL' } as Client,
    ]);

    await expect(updateClient('c1', { clientName: 'Blackwell Co' })).rejects.toThrow('Client name already exists: Blackwell Co');

    expect(writeClients).not.toHaveBeenCalled();
  });
});
