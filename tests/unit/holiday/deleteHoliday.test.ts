import { describe, it, expect, vi } from 'vitest';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/holiday/deleteHolidayRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import deleteHoliday from '#services/holiday/deleteHoliday.js';
import getClientById from '#services/client/getClientById.js';
import deleteHolidayRow from '#db/holiday/deleteHolidayRow.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('deleteHoliday', () => {
  it('deletes the holiday and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { holidays: [] } as any);

    await deleteHoliday('client-1', 'h1');

    expect(deleteHolidayRow).toHaveBeenCalledWith('config-1', 'h1');
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(deleteHoliday('unknown-client', 'h1')).rejects.toThrow('Client not found: unknown-client');
  });
});
