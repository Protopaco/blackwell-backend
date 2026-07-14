import { describe, it, expect, vi } from 'vitest';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/timesheetFolder/appendTimesheetFolder.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/folderExists.js', () => ({ default: vi.fn().mockResolvedValue(true) }));

import createTimesheetFolder from '#services/timesheetFolder/createTimesheetFolder.js';
import getClientById from '#services/client/getClientById.js';
import appendTimesheetFolder from '#db/timesheetFolder/appendTimesheetFolder.js';
import folderExists from '#db/adapter/folderExists.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('createTimesheetFolder', () => {
  it('parses the link, verifies it, and appends an Active timesheet folder', async () => {
    payrollConfigCache.set('config-1', { timesheetFolders: [] } as any);

    await createTimesheetFolder('client-1', {
      timesheetFolderName: 'Main Office',
      driveFolderLink: 'https://drive.google.com/drive/folders/abc123',
    });

    expect(folderExists).toHaveBeenCalledWith('abc123');
    expect(appendTimesheetFolder).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({
        timesheetFolderId: expect.any(String),
        timesheetFolderName: 'Main Office',
        driveFolderId: 'abc123',
        status: 'Active',
      }),
    );
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the folder does not resolve', async () => {
    vi.mocked(folderExists).mockResolvedValueOnce(false);

    await expect(
      createTimesheetFolder('client-1', {
        timesheetFolderName: 'Main Office',
        driveFolderLink: 'https://drive.google.com/drive/folders/missing',
      }),
    ).rejects.toThrow('Folder not found or inaccessible');
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(
      createTimesheetFolder('unknown-client', {
        timesheetFolderName: 'Main Office',
        driveFolderLink: 'https://drive.google.com/drive/folders/abc123',
      }),
    ).rejects.toThrow('Client not found: unknown-client');
  });
});
