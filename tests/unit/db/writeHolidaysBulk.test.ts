import { describe, it, expect, vi } from 'vitest';
import Holiday from '#models/Holiday.js';

vi.mock('#db/adapter/writeValues.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import writeHolidaysBulk from '#db/holiday/writeHolidaysBulk.js';
import writeValues from '#db/adapter/writeValues.js';

const holiday: Holiday = {
  holidayId: 'h1',
  holidayName: 'Labor Day',
  holidayDate: '2026-09-07',
};

describe('writeHolidaysBulk', () => {
  it('writes a header row plus one row per holiday', async () => {
    await writeHolidaysBulk('report-1', [holiday]);

    expect(writeValues).toHaveBeenCalledWith('report-1', 'Holidays', [
      ['HolidayId', 'HolidayName', 'HolidayDate'],
      ['h1', 'Labor Day', '2026-09-07'],
    ]);
  });

  it('still writes just the header row when there are no holidays', async () => {
    await writeHolidaysBulk('report-1', []);

    expect(writeValues).toHaveBeenCalledWith('report-1', 'Holidays', [
      ['HolidayId', 'HolidayName', 'HolidayDate'],
    ]);
  });
});
