import { describe, it, expect, vi } from 'vitest';

vi.mock('#db/adapter/readTabValues.js', () => ({
  default: vi.fn().mockResolvedValue([
    ['EmployeeId', 'TimesheetFileId'],
    ['e1', 'old-file-id'],
  ]),
}));
vi.mock('#db/adapter/updateCells.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import updateEmployeeTimesheetFile from '#db/employee/updateEmployeeTimesheetFile.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('updateEmployeeTimesheetFile', () => {
  it('invalidates the cache entry for the written config file', async () => {
    payrollConfigCache.set('config-1', { employees: [] } as any);

    await updateEmployeeTimesheetFile('config-1', 'e1', 'new-file-id');

    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('does not affect the cache entry for a different config file', async () => {
    payrollConfigCache.set('config-2', { employees: [] } as any);

    await updateEmployeeTimesheetFile('config-1', 'e1', 'new-file-id');

    expect(payrollConfigCache.get('config-2')).toEqual({ employees: [] });
  });
});
