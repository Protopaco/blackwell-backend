import { describe, it, expect, vi } from 'vitest';
import TimesheetFolder from '#models/TimesheetFolder.js';

const { existingTimesheetFolder } = vi.hoisted(() => ({
  existingTimesheetFolder: {
    timesheetFolderId: 'tf1',
    timesheetFolderName: 'Main Office',
    driveFolderId: 'drive-1',
    status: 'Active',
  } as TimesheetFolder,
}));

vi.mock('#services/client/getClientById.js', () => ({
  default: vi.fn().mockResolvedValue({ payrollConfigFileId: 'config-1' }),
}));
vi.mock('#db/payrollConfig/readPayrollConfig.js', () => ({
  default: vi.fn().mockResolvedValue({ timesheetFolders: [existingTimesheetFolder] }),
}));
vi.mock('#db/timesheetFolder/writeTimesheetFolders.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/folderExists.js', () => ({ default: vi.fn().mockResolvedValue(true) }));

import updateTimesheetFolder from '#services/timesheetFolder/updateTimesheetFolder.js';
import getClientById from '#services/client/getClientById.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import writeTimesheetFolders from '#db/timesheetFolder/writeTimesheetFolders.js';
import folderExists from '#db/adapter/folderExists.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('updateTimesheetFolder', () => {
  it('leaves fields unchanged when omitted (partial update)', async () => {
    payrollConfigCache.set('config-1', { timesheetFolders: [existingTimesheetFolder] } as any);

    await updateTimesheetFolder('client-1', 'tf1', { status: 'Inactive' });

    expect(writeTimesheetFolders).toHaveBeenCalledWith('config-1', {
      ...existingTimesheetFolder,
      status: 'Inactive',
    });
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('re-parses and re-verifies driveFolderLink when provided', async () => {
    await updateTimesheetFolder('client-1', 'tf1', {
      driveFolderLink: 'https://drive.google.com/drive/folders/new-folder',
    });

    expect(folderExists).toHaveBeenCalledWith('new-folder');
    expect(writeTimesheetFolders).toHaveBeenCalledWith('config-1', {
      ...existingTimesheetFolder,
      driveFolderId: 'new-folder',
    });
  });

  it('throws NotFoundError when the new driveFolderLink does not resolve', async () => {
    vi.mocked(folderExists).mockResolvedValueOnce(false);

    await expect(
      updateTimesheetFolder('client-1', 'tf1', {
        driveFolderLink: 'https://drive.google.com/drive/folders/missing',
      }),
    ).rejects.toThrow('Folder not found or inaccessible');
  });

  it('throws NotFoundError when the timesheetFolderId does not match any existing record', async () => {
    await expect(
      updateTimesheetFolder('client-1', 'unknown-tf', { status: 'Inactive' }),
    ).rejects.toThrow('TimesheetFolder not found: unknown-tf');
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(
      updateTimesheetFolder('unknown-client', 'tf1', { status: 'Inactive' }),
    ).rejects.toThrow('Client not found: unknown-client');
  });
});
