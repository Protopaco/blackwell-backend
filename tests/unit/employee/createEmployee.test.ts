import { describe, it, expect, vi } from 'vitest';

const { testClient, baseEmployee } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1', timesheetsFolderId: 'folder-1' } as any,
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
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/employee/appendEmployee.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/createOAuthWorkbook.js', () => ({ default: vi.fn().mockResolvedValue('new-file-id') }));

import createEmployee from '#services/employee/createEmployee.js';
import getClientById from '#services/client/getClientById.js';
import appendEmployee from '#db/employee/appendEmployee.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('createEmployee', () => {
  it('uses the caller-supplied timesheetFileId when provided', async () => {
    payrollConfigCache.set('config-1', { employees: [] } as any);

    await createEmployee('client-1', { ...baseEmployee, timesheetFileId: 'existing-file-id' } as any);

    expect(createOAuthWorkbook).not.toHaveBeenCalled();
    expect(appendEmployee).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({ timesheetFileId: 'existing-file-id', employeeId: expect.any(String) }),
    );
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('auto-provisions a timesheet workbook when timesheetFileId is omitted', async () => {
    vi.mocked(appendEmployee).mockClear();
    vi.mocked(createOAuthWorkbook).mockClear();

    await createEmployee('client-1', { ...baseEmployee, timesheetFileId: '' } as any);

    expect(createOAuthWorkbook).toHaveBeenCalledWith('Jane Smith Timesheets', 'folder-1');
    expect(appendEmployee).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({ timesheetFileId: 'new-file-id', employeeId: expect.any(String) }),
    );
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(
      createEmployee('unknown-client', { ...baseEmployee, timesheetFileId: 'x' } as any),
    ).rejects.toThrow('Client not found: unknown-client');
  });
});
