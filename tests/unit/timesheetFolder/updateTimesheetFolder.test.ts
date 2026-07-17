import { beforeEach, describe, it, expect, vi } from 'vitest';
import TimesheetFolder from '#models/TimesheetFolder.js';

const { existingTimesheetFolder, otherTimesheetFolder } = vi.hoisted(() => ({
  existingTimesheetFolder: {
    timesheetFolderId: 'tf1',
    timesheetFolderName: 'Main Office',
    driveFolderId: 'drive-1',
    status: 'Active',
  } as TimesheetFolder,
  otherTimesheetFolder: {
    timesheetFolderId: 'tf2',
    timesheetFolderName: 'Satellite Office',
    driveFolderId: 'drive-2',
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

import updateTimesheetFolder from '#services/timesheetFolder/updateTimesheetFolder.js';
import getClientById from '#services/client/getClientById.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import writeTimesheetFolders from '#db/timesheetFolder/writeTimesheetFolders.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('updateTimesheetFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientById).mockResolvedValue({ payrollConfigFileId: 'config-1' } as any);
    vi.mocked(readPayrollConfig).mockResolvedValue({ timesheetFolders: [existingTimesheetFolder] } as any);
  });

  it('leaves fields unchanged when omitted (partial update)', async () => {
    payrollConfigCache.set('config-1', { timesheetFolders: [existingTimesheetFolder] } as any);

    await updateTimesheetFolder('client-1', 'tf1', { status: 'Inactive' });

    expect(writeTimesheetFolders).toHaveBeenCalledWith('config-1', {
      ...existingTimesheetFolder,
      status: 'Inactive',
    });
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws UnprocessableError when driveFolderLink is provided', async () => {
    await expect(
      updateTimesheetFolder('client-1', 'tf1', {
        driveFolderLink: 'https://drive.google.com/drive/folders/new-folder',
      } as any),
    ).rejects.toThrow('driveFolderLink cannot be changed after TimesheetFolder creation');

    expect(getClientById).not.toHaveBeenCalled();
    expect(writeTimesheetFolders).not.toHaveBeenCalled();
  });

  it('throws UnprocessableError when the updated name already exists for the client', async () => {
    vi.mocked(readPayrollConfig).mockResolvedValueOnce({
      timesheetFolders: [existingTimesheetFolder, otherTimesheetFolder],
    } as any);

    await expect(
      updateTimesheetFolder('client-1', 'tf1', {
        timesheetFolderName: ' satellite office ',
      }),
    ).rejects.toThrow('TimesheetFolder name already exists for this client: satellite office');

    expect(writeTimesheetFolders).not.toHaveBeenCalled();
  });

  it('allows updating the same record with the same normalized name', async () => {
    vi.mocked(readPayrollConfig).mockResolvedValueOnce({
      timesheetFolders: [existingTimesheetFolder, otherTimesheetFolder],
    } as any);

    await updateTimesheetFolder('client-1', 'tf1', {
      timesheetFolderName: ' MAIN OFFICE ',
      status: 'Inactive',
    });

    expect(writeTimesheetFolders).toHaveBeenCalledWith('config-1', {
      ...existingTimesheetFolder,
      timesheetFolderName: 'MAIN OFFICE',
      status: 'Inactive',
    });
  });

  it('preserves driveFolderId when updating other fields', async () => {
    await updateTimesheetFolder('client-1', 'tf1', {
      timesheetFolderName: 'Updated Office',
    });

    expect(writeTimesheetFolders).toHaveBeenCalledWith('config-1', {
      ...existingTimesheetFolder,
      timesheetFolderName: 'Updated Office',
      driveFolderId: 'drive-1',
    });
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
