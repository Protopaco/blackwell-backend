import { describe, it, expect, vi, beforeEach } from 'vitest';

const { clients } = vi.hoisted(() => ({
  clients: [
    { clientId: 'client-1', clientCode: 'UI_TEST_FRESH' },
    { clientId: 'client-2', clientCode: 'REAL_CLIENT' },
    { clientId: 'client-3', clientCode: 'UI_TEST_PAYROLL' },
  ] as any[],
}));

vi.mock('#db/adapter/findDriveFolderByName.js', () => ({ default: vi.fn().mockResolvedValue('root-folder-1') }));
vi.mock('#db/adapter/trashDriveFile.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/client/readClients.js', () => ({ default: vi.fn().mockResolvedValue(clients) }));
vi.mock('#db/client/replaceClients.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import deleteDevTestData from '#services/devTestData/deleteDevTestData.js';
import findDriveFolderByName from '#db/adapter/findDriveFolderByName.js';
import trashDriveFile from '#db/adapter/trashDriveFile.js';
import readClients from '#db/client/readClients.js';
import replaceClients from '#db/client/replaceClients.js';
import clientsCache from '#utils/caches/clientsCache.js';

describe('deleteDevTestData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TEST_DATA_ROOT_FOLDER_ID = 'test-data-parent-1';
    process.env.CLIENT_CONFIG_FILE_ID = 'client-config-1';
  });

  it('trashes the UI_TEST_DATA root folder and removes only UI_TEST_ clients', async () => {
    clientsCache.set('client-config-1', clients as any);

    await deleteDevTestData();

    expect(findDriveFolderByName).toHaveBeenCalledWith('test-data-parent-1', 'UI_TEST_DATA');
    expect(trashDriveFile).toHaveBeenCalledWith('root-folder-1');
    expect(replaceClients).toHaveBeenCalledWith([
      { clientId: 'client-2', clientCode: 'REAL_CLIENT' },
    ]);
    expect(clientsCache.get('client-config-1')).toBeNull();
  });

  it('does not trash a folder when the UI_TEST_DATA root is absent', async () => {
    vi.mocked(findDriveFolderByName).mockResolvedValueOnce(undefined);

    await deleteDevTestData();

    expect(trashDriveFile).not.toHaveBeenCalled();
  });

  it('does not rewrite clients when no UI_TEST_ clients exist', async () => {
    vi.mocked(readClients).mockResolvedValueOnce([
      { clientId: 'client-2', clientCode: 'REAL_CLIENT' },
    ] as any);

    await deleteDevTestData();

    expect(replaceClients).not.toHaveBeenCalled();
  });
});
