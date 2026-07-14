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

vi.mock('#db/adapter/overwriteTabRows.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/timesheetFolder/readTimesheetFolders.js', () => ({
  default: vi.fn().mockResolvedValue([existingTimesheetFolder]),
}));

import writeTimesheetFolders from '#db/timesheetFolder/writeTimesheetFolders.js';
import overwriteTabRows from '#db/adapter/overwriteTabRows.js';

describe('writeTimesheetFolders', () => {
  it('writes the updated timesheet folder in place of the matching existing record', async () => {
    await writeTimesheetFolders('config-1', { ...existingTimesheetFolder, status: 'Inactive' });

    expect(overwriteTabRows).toHaveBeenCalledWith(
      'config-1',
      'TimesheetFolders',
      ['TimesheetFolderId', 'TimesheetFolderName', 'DriveFolderId', 'Status'],
      [{ TimesheetFolderId: 'tf1', TimesheetFolderName: 'Main Office', DriveFolderId: 'drive-1', Status: 'Inactive' }],
    );
  });

  it('throws NotFoundError when the timesheetFolderId does not match any existing record', async () => {
    await expect(
      writeTimesheetFolders('config-1', { ...existingTimesheetFolder, timesheetFolderId: 'unknown' }),
    ).rejects.toThrow('TimesheetFolder not found: unknown');
  });
});
