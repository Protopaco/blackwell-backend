import { describe, it, expect, vi } from 'vitest';
import Holiday from '#models/Holiday.js';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/holiday/writeHolidays.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import updateHoliday from '#services/holiday/updateHoliday.js';
import getClientById from '#services/client/getClientById.js';
import writeHolidays from '#db/holiday/writeHolidays.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

const holiday: Holiday = { holidayId: 'h1', holidayName: 'Labor Day', holidayDate: '2026-09-07' };

describe('updateHoliday', () => {
  it('writes the updated holiday and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { holidays: [] } as any);

    await updateHoliday('client-1', holiday);

    expect(writeHolidays).toHaveBeenCalledWith('config-1', holiday);
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(updateHoliday('unknown-client', holiday)).rejects.toThrow('Client not found: unknown-client');
  });
});
