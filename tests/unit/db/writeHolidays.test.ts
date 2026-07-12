import { describe, it, expect, vi } from 'vitest';
import Holiday from '#models/Holiday.js';

const { existingHoliday } = vi.hoisted(() => ({
  existingHoliday: {
    holidayId: 'h1',
    holidayName: 'Labor Day',
    holidayDate: '2026-09-07',
  } as Holiday,
}));

vi.mock('#db/adapter/writeTab.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/holiday/readHolidays.js', () => ({ default: vi.fn().mockResolvedValue([existingHoliday]) }));

import writeHolidays from '#db/holiday/writeHolidays.js';
import writeTab from '#db/adapter/writeTab.js';

describe('writeHolidays', () => {
  it('writes the updated holiday in place of the matching existing record', async () => {
    await writeHolidays('config-1', { ...existingHoliday, holidayName: 'Renamed Holiday' });

    expect(writeTab).toHaveBeenCalledWith('config-1', 'Holidays', [
      { HolidayId: 'h1', HolidayName: 'Renamed Holiday', HolidayDate: '2026-09-07' },
    ]);
  });

  it('throws NotFoundError when the holidayId does not match any existing holiday', async () => {
    await expect(
      writeHolidays('config-1', { holidayId: 'unknown', holidayName: 'X', holidayDate: '2026-01-01' }),
    ).rejects.toThrow('Holiday not found: unknown');
  });
});
