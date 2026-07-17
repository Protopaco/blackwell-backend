import { beforeEach, describe, it, expect, vi } from 'vitest';

const { testClient, existingTimesheetFolder } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
  existingTimesheetFolder: {
    timesheetFolderId: 'tf1',
    timesheetFolderName: 'Main Office',
    driveFolderId: 'drive-1',
    status: 'Active',
  },
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/payrollConfig/readPayrollConfig.js', () => ({
  default: vi.fn().mockResolvedValue({ timesheetFolders: [] }),
}));
vi.mock('#db/timesheetFolder/appendTimesheetFolder.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/folderExists.js', () => ({ default: vi.fn().mockResolvedValue(true) }));

import createTimesheetFolder from '#services/timesheetFolder/createTimesheetFolder.js';
import getClientById from '#services/client/getClientById.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import appendTimesheetFolder from '#db/timesheetFolder/appendTimesheetFolder.js';
import folderExists from '#db/adapter/folderExists.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('createTimesheetFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientById).mockResolvedValue(testClient);
    vi.mocked(readPayrollConfig).mockResolvedValue({ timesheetFolders: [] } as any);
    vi.mocked(folderExists).mockResolvedValue(true);
  });

  it('parses the link, verifies it, and appends an Active timesheet folder', async () => {
    payrollConfigCache.set('config-1', { timesheetFolders: [] } as any);

    await createTimesheetFolder('client-1', {
      timesheetFolderName: ' Main Office ',
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

  it('throws UnprocessableError when the timesheet folder name already exists for the client', async () => {
    vi.mocked(readPayrollConfig).mockResolvedValueOnce({
      timesheetFolders: [existingTimesheetFolder],
    } as any);

    await expect(
      createTimesheetFolder('client-1', {
        timesheetFolderName: ' main office ',
        driveFolderLink: 'https://drive.google.com/drive/folders/abc123',
      }),
    ).rejects.toThrow('TimesheetFolder name already exists for this client: main office');

    expect(folderExists).not.toHaveBeenCalled();
    expect(appendTimesheetFolder).not.toHaveBeenCalled();
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
