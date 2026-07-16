import { describe, it, expect, vi } from 'vitest';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/holiday/appendHoliday.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import createHoliday from '#services/holiday/createHoliday.js';
import getClientById from '#services/client/getClientById.js';
import appendHoliday from '#db/holiday/appendHoliday.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('createHoliday', () => {
  it('appends the holiday with a generated holidayId and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { holidays: [] } as any);

    await createHoliday('client-1', { holidayName: 'Labor Day', holidayDate: '2026-09-07' });

    expect(appendHoliday).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({
        holidayName: 'Labor Day',
        holidayDate: '2026-09-07',
        holidayId: expect.any(String),
      }),
    );
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(
      createHoliday('unknown-client', { holidayName: 'Labor Day', holidayDate: '2026-09-07' }),
    ).rejects.toThrow('Client not found: unknown-client');
  });

  it('throws UnprocessableError when holidayDate is invalid', async () => {
    vi.mocked(appendHoliday).mockClear();

    await expect(
      createHoliday('client-1', { holidayName: 'Labor Day', holidayDate: '2026-02-30' }),
    ).rejects.toThrow('holidayDate must be a valid YYYY-MM-DD date');
    expect(appendHoliday).not.toHaveBeenCalled();
  });
});
