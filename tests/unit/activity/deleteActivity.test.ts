import { describe, it, expect, vi } from 'vitest';

const { testClient, existingRates } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
  existingRates: [
    { id: 'r1', employeeId: 'e1', employeeName: 'Jane Smith', activityId: 'a1', activityName: 'Direct Services', payRateType: 'Hourly', payRate: 20, holidayPayRate: 25 },
    { id: 'r2', employeeId: 'e1', employeeName: 'Jane Smith', activityId: 'a2', activityName: 'Administration', payRateType: 'FlatRate', payRate: 50, holidayPayRate: 0 },
    { id: 'r3', employeeId: 'e2', employeeName: 'John Doe', activityId: 'a1', activityName: 'Direct Services', payRateType: 'Hourly', payRate: 22, holidayPayRate: 28 },
  ] as any[],
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/activity/deleteActivityRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/employeeActivityRate/readEmployeeActivityRates.js', () => ({ default: vi.fn().mockResolvedValue(existingRates) }));
vi.mock('#db/adapter/clearTabContent.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/employeeActivityRate/writeEmployeeActivityRatesBulk.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import deleteActivity from '#services/activity/deleteActivity.js';
import getClientById from '#services/client/getClientById.js';
import deleteActivityRow from '#db/activity/deleteActivityRow.js';
import clearTabContent from '#db/adapter/clearTabContent.js';
import writeEmployeeActivityRatesBulk from '#db/employeeActivityRate/writeEmployeeActivityRatesBulk.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('deleteActivity', () => {
  it('deletes the activity and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { activities: [] } as any);

    await deleteActivity('client-1', 'a1');

    expect(deleteActivityRow).toHaveBeenCalledWith('config-1', 'a1');
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('cascades the deletion to EmployeeActivityRates rows referencing the deleted activity', async () => {
    await deleteActivity('client-1', 'a1');

    expect(clearTabContent).toHaveBeenCalledWith('config-1', 'EmployeeActivityRates');
    expect(writeEmployeeActivityRatesBulk).toHaveBeenCalledWith('config-1', [
      existingRates[1],
    ]);
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(deleteActivity('unknown-client', 'a1')).rejects.toThrow('Client not found: unknown-client');
  });
});
