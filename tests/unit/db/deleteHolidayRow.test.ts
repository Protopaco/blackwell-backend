import { describe, it, expect, vi } from 'vitest';

vi.mock('#db/adapter/readTab.js', () => ({
  default: vi.fn().mockResolvedValue([
    { HolidayId: 'h1', HolidayName: 'Labor Day', HolidayDate: '2026-09-07' },
    { HolidayId: 'h2', HolidayName: 'Memorial Day', HolidayDate: '2026-05-25' },
  ]),
}));
vi.mock('#db/adapter/deleteRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import deleteHolidayRow from '#db/holiday/deleteHolidayRow.js';
import deleteRow from '#db/adapter/deleteRow.js';

describe('deleteHolidayRow', () => {
  it('deletes the sheet row matching the given holidayId, accounting for the header row', async () => {
    await deleteHolidayRow('config-1', 'h2');

    // h2 is the second data row (index 1) -> sheet row 3 (1 header row + 1-based index)
    expect(deleteRow).toHaveBeenCalledWith('config-1', 'Holidays', 3);
  });

  it('throws NotFoundError when the holidayId does not match any row', async () => {
    await expect(deleteHolidayRow('config-1', 'unknown')).rejects.toThrow('Holiday not found: unknown');
  });
});
