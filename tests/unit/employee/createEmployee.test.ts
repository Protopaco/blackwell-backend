import { describe, it, expect, vi } from 'vitest';

const { testClient, baseEmployee, activeFolder, inactiveFolder } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
  baseEmployee: {
    firstName: 'Jane',
    lastName: 'Smith',
    position: 'Coordinator',
    hourlyPayRate1: 20,
    hourlyPayRate2: 25,
    holidayPayRate: 30,
    email: 'jane@example.com',
    status: 'Active',
  },
  activeFolder: {
    timesheetFolderId: 'folder-record-1',
    timesheetFolderName: 'Main Office',
    driveFolderId: 'drive-folder-1',
    status: 'Active',
  },
  inactiveFolder: {
    timesheetFolderId: 'folder-record-2',
    timesheetFolderName: 'Closed Location',
    driveFolderId: 'drive-folder-2',
    status: 'Inactive',
  },
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/employee/appendEmployee.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/createOAuthWorkbook.js', () => ({ default: vi.fn().mockResolvedValue('new-file-id') }));
vi.mock('#db/adapter/workbookExists.js', () => ({ default: vi.fn().mockResolvedValue(true) }));
vi.mock('#db/payrollConfig/readPayrollConfig.js', () => ({
  default: vi.fn().mockResolvedValue({ timesheetFolders: [activeFolder, inactiveFolder] }),
}));

import createEmployee from '#services/employee/createEmployee.js';
import getClientById from '#services/client/getClientById.js';
import appendEmployee from '#db/employee/appendEmployee.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import workbookExists from '#db/adapter/workbookExists.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('createEmployee', () => {
  it('parses and stores the caller-supplied timesheetFileLink when provided', async () => {
    payrollConfigCache.set('config-1', { employees: [] } as any);

    await createEmployee('client-1', {
      ...baseEmployee,
      timesheetFileLink: 'https://docs.google.com/spreadsheets/d/existing-file-id/edit',
    } as any);

    expect(workbookExists).toHaveBeenCalledWith('existing-file-id');
    expect(createOAuthWorkbook).not.toHaveBeenCalled();
    expect(appendEmployee).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({ timesheetFileId: 'existing-file-id', employeeId: expect.any(String) }),
    );
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('creates a new timesheet workbook in the selected Active timesheetFolder', async () => {
    vi.mocked(appendEmployee).mockClear();
    vi.mocked(createOAuthWorkbook).mockClear();

    await createEmployee('client-1', { ...baseEmployee, timesheetFolderId: 'folder-record-1' } as any);

    expect(createOAuthWorkbook).toHaveBeenCalledWith('Jane Smith Timesheets', 'drive-folder-1');
    expect(appendEmployee).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({ timesheetFileId: 'new-file-id', employeeId: expect.any(String) }),
    );
  });

  it('throws UnprocessableError when neither timesheetFileLink nor timesheetFolderId is provided', async () => {
    await expect(createEmployee('client-1', { ...baseEmployee } as any)).rejects.toThrow(
      'Either timesheetFileLink or timesheetFolderId is required',
    );
  });

  it('throws UnprocessableError when both timesheetFileLink and timesheetFolderId are provided', async () => {
    await expect(createEmployee('client-1', {
      ...baseEmployee,
      timesheetFileLink: 'https://docs.google.com/spreadsheets/d/existing-file-id/edit',
      timesheetFolderId: 'folder-record-1',
    } as any)).rejects.toThrow(
      'Provide either timesheetFileLink or timesheetFolderId, not both',
    );
  });

  it('throws UnprocessableError when timesheetFileLink is malformed', async () => {
    await expect(
      createEmployee('client-1', { ...baseEmployee, timesheetFileLink: 'not-a-drive-file-link' } as any),
    ).rejects.toThrow('Unrecognized Drive link: not-a-drive-file-link');
  });

  it('throws NotFoundError when timesheetFileLink is inaccessible or not a workbook', async () => {
    vi.mocked(workbookExists).mockResolvedValueOnce(false);

    await expect(
      createEmployee('client-1', {
        ...baseEmployee,
        timesheetFileLink: 'https://docs.google.com/spreadsheets/d/missing-file/edit',
      } as any),
    ).rejects.toThrow(
      'Workbook not found or inaccessible: https://docs.google.com/spreadsheets/d/missing-file/edit',
    );
  });

  it('throws NotFoundError when timesheetFolderId does not match any configured folder', async () => {
    await expect(
      createEmployee('client-1', { ...baseEmployee, timesheetFolderId: 'unknown-folder' } as any),
    ).rejects.toThrow('Active timesheet folder not found: unknown-folder');
  });

  it('throws NotFoundError when timesheetFolderId matches an Inactive folder', async () => {
    await expect(
      createEmployee('client-1', { ...baseEmployee, timesheetFolderId: 'folder-record-2' } as any),
    ).rejects.toThrow('Active timesheet folder not found: folder-record-2');
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(
      createEmployee('unknown-client', {
        ...baseEmployee,
        timesheetFileLink: 'https://docs.google.com/spreadsheets/d/x/edit',
      } as any),
    ).rejects.toThrow('Client not found: unknown-client');
  });
});
